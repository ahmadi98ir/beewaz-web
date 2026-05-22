#!/usr/bin/env python3
"""
Beewaz image receiver — v3 (server-pull via transfer.sh)

Endpoints:
  POST /api/upload/pull?url=<encoded-url>  → server downloads image from URL (202 immediate)
  POST /api/upload/chunk?session=X&part=N  → save one chunk (202 immediate)
  POST /api/upload/assemble?session=X&total=N → merge chunks + docker load (202 immediate)
  POST /api/upload                         → single-file upload (202 immediate)
  GET  /api/upload/status                  → idle/pulling/assembling/loading/done/error
"""
import os
import subprocess
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, unquote, urlparse

SECRET = os.environ.get('UPLOAD_TOKEN', '')

_status: dict = {'state': 'idle', 'message': ''}
_lock = threading.Lock()


def set_status(state: str, msg: str = '') -> None:
    with _lock:
        _status['state'] = state
        _status['message'] = msg


def load_image_bg(tmp_path: str) -> None:
    set_status('loading', 'docker load running…')
    try:
        with open(tmp_path, 'rb') as f:
            proc = subprocess.run(
                ['docker', 'load'],
                stdin=f,
                capture_output=True,
                timeout=600,
            )
        if proc.returncode == 0:
            set_status('done', proc.stdout.decode().strip())
        else:
            set_status('error', proc.stderr.decode().strip())
    except Exception as exc:
        set_status('error', str(exc))
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def pull_and_load(url: str, gh_token: str = '') -> None:
    set_status('pulling', 'downloading image…')
    try:
        fd, tmp_path = tempfile.mkstemp(suffix='.tar.gz')
        os.close(fd)
        cmd = ['curl', '-sL', '--max-time', '600', '-o', tmp_path]
        if gh_token:
            cmd += [
                '-H', f'Authorization: token {gh_token}',
                '-H', 'Accept: application/octet-stream',
            ]
        cmd.append(url)
        result = subprocess.run(cmd, capture_output=True, timeout=620)
        if result.returncode != 0:
            set_status('error', f'download failed (curl {result.returncode}): {result.stderr.decode()[:200]}')
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            return
        load_image_bg(tmp_path)
    except Exception as exc:
        set_status('error', str(exc))


def assemble_and_load(chunks: list) -> None:
    set_status('assembling', f'{len(chunks)} chunks → merging…')
    try:
        fd, tmp_path = tempfile.mkstemp(suffix='.tar.gz')
        os.close(fd)
        with open(tmp_path, 'wb') as out:
            for cp in chunks:
                with open(cp, 'rb') as f:
                    while True:
                        data = f.read(65536)
                        if not data:
                            break
                        out.write(data)
                os.unlink(cp)
        load_image_bg(tmp_path)
    except Exception as exc:
        set_status('error', str(exc))


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress access log

    def _auth(self) -> bool:
        return bool(SECRET) and self.headers.get('X-Upload-Token', '') == SECRET

    def _read_body_to_file(self, path: str) -> None:
        length = int(self.headers.get('Content-Length', 0))
        with open(path, 'wb') as f:
            remaining = length
            while remaining > 0:
                data = self.rfile.read(min(65536, remaining))
                if not data:
                    break
                f.write(data)
                remaining -= len(data)

    def _resp(self, code: int, body: bytes) -> None:
        self.send_response(code)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ── GET ──────────────────────────────────────────────────────────────────
    def do_GET(self) -> None:
        if self.path.startswith('/api/upload/status'):
            with _lock:
                body = f'{_status["state"]}: {_status["message"]}'.encode()
            self._resp(200, body)
        else:
            self._resp(200, b'beewaz image-receiver v3\n')

    # ── POST ─────────────────────────────────────────────────────────────────
    def do_POST(self) -> None:
        if not self._auth():
            self._resp(403, b'forbidden')
            return

        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        # ── /api/upload/pull  (server pulls image from external URL) ─────────
        if parsed.path == '/api/upload/pull':
            url = unquote(qs.get('url', [''])[0])
            gh_token = unquote(qs.get('gh_token', [''])[0])
            if not url:
                self._resp(400, b'url param required')
                return
            self._resp(202, b'pull started')
            threading.Thread(target=pull_and_load, args=(url, gh_token), daemon=True).start()

        # ── /api/upload/chunk ─────────────────────────────────────────────────
        elif parsed.path == '/api/upload/chunk':
            session = qs.get('session', ['default'])[0]
            part = qs.get('part', ['1'])[0]
            chunk_path = f'/tmp/bz-{session}-{int(part):04d}.bin'
            self._read_body_to_file(chunk_path)
            self._resp(202, b'chunk ok')

        # ── /api/upload/assemble ──────────────────────────────────────────────
        elif parsed.path == '/api/upload/assemble':
            session = qs.get('session', ['default'])[0]
            total = int(qs.get('total', ['1'])[0])
            chunks = sorted(
                f'/tmp/bz-{session}-{i:04d}.bin' for i in range(1, total + 1)
            )
            missing = [c for c in chunks if not os.path.exists(c)]
            if missing:
                self._resp(400, f'missing: {missing}'.encode())
                return
            self._resp(202, b'assembling')
            threading.Thread(target=assemble_and_load, args=(chunks,), daemon=True).start()

        # ── /api/upload  (legacy single-file) ────────────────────────────────
        elif parsed.path == '/api/upload':
            fd, tmp_path = tempfile.mkstemp(suffix='.tar.gz')
            os.close(fd)
            self._read_body_to_file(tmp_path)
            self._resp(202, b'upload received, loading')
            threading.Thread(target=load_image_bg, args=(tmp_path,), daemon=True).start()

        else:
            self._resp(404, b'not found')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f'image-receiver v3 on 0.0.0.0:{port}', flush=True)
    HTTPServer(('0.0.0.0', port), Handler).serve_forever()
