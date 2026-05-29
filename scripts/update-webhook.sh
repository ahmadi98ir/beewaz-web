#!/bin/bash
# Run this on the server: bash update-webhook.sh
# Updates deploy-webhook.py to handle base64 JSON chunks

cat > /root/deploy-webhook.py << 'PYEOF'
#!/usr/bin/env python3
import http.server, json, base64, os, subprocess, tempfile, threading

SECRET = "7041f36b42e26a096910dbc0a55cd81a0defaabba4a3c9bcd4e1a07d7bbd0a30"
CHUNKS = {}
LOCK = threading.Lock()

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body)

            if data.get('token') != SECRET:
                self.send_response(403); self.end_headers()
                self.wfile.write(b'forbidden'); return

            chunk_idx = int(data['chunk'])
            total = int(data['total'])
            chunk_data = base64.b64decode(data['data'])

            with LOCK:
                CHUNKS[chunk_idx] = chunk_data
                received = len(CHUNKS)

            print(f"Chunk {chunk_idx+1}/{total} received ({len(chunk_data)} bytes)")

            if received < total:
                self.send_response(200); self.end_headers()
                self.wfile.write(f"ok {received}/{total}".encode()); return

            # All chunks received — assemble and deploy
            print("All chunks received, assembling...")
            tmp = tempfile.mktemp(suffix='.tar.gz')
            with open(tmp, 'wb') as f:
                for i in range(total):
                    f.write(CHUNKS[i])
            CHUNKS.clear()

            print(f"Assembled {os.path.getsize(tmp)} bytes, deploying...")
            result = subprocess.run(
                ['bash', '-c', f'''
                    set -e
                    CONTAINER=$(docker ps --format '{{{{.Names}}}}' | grep -i beewaz | head -1)
                    if [ -z "$CONTAINER" ]; then echo "No container found"; exit 1; fi
                    echo "Deploying to $CONTAINER"
                    docker exec "$CONTAINER" rm -rf /app/.next/server /app/.next/static /app/public || true
                    tar -xzf {tmp} -C /tmp/deploy-extract --strip-components=0 2>/dev/null || \
                        (mkdir -p /tmp/deploy-extract && tar -xzf {tmp} -C /tmp/deploy-extract)
                    docker cp /tmp/deploy-extract/. "$CONTAINER:/app/"
                    rm -rf /tmp/deploy-extract
                    docker restart "$CONTAINER"
                    rm -f {tmp}
                    echo "Deploy done"
                '''],
                capture_output=True, text=True, timeout=120
            )
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)

            if result.returncode != 0:
                self.send_response(500); self.end_headers()
                self.wfile.write(result.stderr.encode()); return

            self.send_response(200); self.end_headers()
            self.wfile.write(b'deployed')

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500); self.end_headers()
            self.wfile.write(str(e).encode())

print("Deploy webhook listening on :9001")
server = http.server.HTTPServer(('0.0.0.0', 9001), Handler)
server.serve_forever()
PYEOF

systemctl restart deploy-webhook
sleep 2
systemctl status deploy-webhook --no-pager
echo "Webhook updated successfully"
