#!/usr/bin/env python3
"""
Beewaz image receiver — v2 (chunked upload)
Endpoints:
  POST /api/upload/chunk?session=X&part=N   → save one 15 MB chunk (responds 202 immediately)
  POST /api/upload/assemble?session=X&total=N → cat chunks + docker load in background (202)
  GET  /api/upload/status                    → idle/assembling/loading/done/error
  GET  /                                     → health check
"""
import os
import subprocess
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

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


def assemble_and_load(chunks: list, session: str) -> None:
    total = len(chunks)
    set_status('assembling', f'{total} chunks → merging…')
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
    def log_message(self, fmt, *args):  # suppress access log
        pass

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

    def _ok(self, code: int, body: bytes) -> None:
        self.send_response(code)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ── GET ──────────────────────────────────────────────────────────────────
    def do_GET(self) -> None:
        if self.path == '/api/upload/status':
            with _lock:
                body = f'{_status["state"]}: {_status["message"]}'.encode()
            self._ok(200, body)
        else:
            self._ok(200, b'beewaz image receiver v2 ok\n')

    # ── POST ─────────────────────────────────────────────────────────────────
    def do_POST(self) -> None:
        if not self._auth():
            self._ok(403, b'forbidden')
            return

        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        # ── /api/upload/chunk ───────────────────────────────────────────────
        if parsed.path == '/api/upload/chunk':
            session = qs.get('session', ['default'])[0]
            part = qs.get('part', ['1'])[0]
            chunk_path = f'/tmp/bz-{session}-{int(part):04d}.bin'
            self._read_body_to_file(chunk_path)
            self._ok(202, b'chunk ok')

        # ── /api/upload/assemble ────────────────────────────────────────────
        elif parsed.path == '/api/upload/assemble':
            session = qs.get('session', ['default'])[0]
            total = int(qs.get('total', ['1'])[0])
            chunks = sorted(
                f'/tmp/bz-{session}-{i:04d}.bin' for i in range(1, total + 1)
            )
            missing = [c for c in chunks if not os.path.exists(c)]
            if missing:
                self._ok(400, f'missing chunks: {missing}'.encode())
                return
            self._ok(202, b'assembly started')
            threading.Thread(
                target=assemble_and_load, args=(chunks, session), daemon=True
            ).start()

        # ── /api/upload (legacy single-file, kept for manual use) ──────────
        elif parsed.path == '/api/upload':
            fd, tmp_path = tempfile.mkstemp(suffix='.tar.gz')
            os.close(fd)
            self._read_body_to_file(tmp_path)
            self._ok(202, b'upload received, loading in background')
            threading.Thread(target=load_image_bg, args=(tmp_path,), daemon=True).start()

        else:
            self._ok(404, b'not found')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f'image-receiver listening on 0.0.0.0:{port}', flush=True)
    HTTPServer(('0.0.0.0', port), Handler).serve_forever()
