#!/bin/bash
# اجرا روی سرور: bash setup-image-receiver.sh
# image receiver با قابلیت docker load + Coolify restart

TOKEN="fb16cb5761ce143879dce87e69d551a0cca50e33"
COOLIFY_TOKEN="5|beewaz-deploy-fix-2026"
APP_UUID="jw4kpfn8utdybrmwkr80fm8f"

cat > /root/image-receiver.py << PYEOF
#!/usr/bin/env python3
import http.server, json, base64, os, subprocess, threading, math

TOKEN = "${TOKEN}"
COOLIFY_TOKEN = "${COOLIFY_TOKEN}"
APP_UUID = "${APP_UUID}"

CHUNKS = {}
LOCK = threading.Lock()

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body)

            if data.get('token') != TOKEN:
                self.send_response(403); self.end_headers()
                self.wfile.write(b'forbidden'); return

            path = self.path.split('?')[0]

            # ── آپلود chunk ──────────────────────────────────
            if path == '/upload':
                idx   = int(data['chunk'])
                total = int(data['total'])
                part  = base64.b64decode(data['data'])

                with LOCK:
                    CHUNKS[idx] = part
                    received = len(CHUNKS)

                print(f"chunk {idx+1}/{total} ({len(part)//1024}KB)")

                if received < total:
                    self.send_response(200); self.end_headers()
                    self.wfile.write(f"ok {received}/{total}".encode())
                    return

                # همه chunk‌ها رسیده — ذخیره
                print("All chunks received, assembling image...")
                tmp = '/tmp/beewaz-image.tar.gz'
                with open(tmp, 'wb') as f:
                    for i in range(total):
                        f.write(CHUNKS[i])
                CHUNKS.clear()

                size_mb = os.path.getsize(tmp) // 1024 // 1024
                print(f"Image saved: {size_mb}MB")
                self.send_response(200); self.end_headers()
                self.wfile.write(b'upload_complete')

            # ── deploy: docker load + restart ────────────────
            elif path == '/deploy':
                sha = data.get('sha', 'unknown')[:8]
                print(f"Deploying commit {sha}...")

                result = subprocess.run(['bash', '-c', '''
                    set -e
                    echo "Loading Docker image..."
                    docker load < /tmp/beewaz-image.tar.gz
                    echo "Image loaded."

                    # restart از طریق Coolify API
                    HTTP=$(curl -sf -o /dev/null -w "%{http_code}" \\
                        -X POST http://localhost:8000/api/v1/applications/''' + APP_UUID + '''/restart \\
                        -H "Authorization: Bearer ''' + COOLIFY_TOKEN + '''" \\
                        -H "Content-Type: application/json" || echo "000")

                    if [ "$HTTP" = "200" ] || [ "$HTTP" = "202" ]; then
                        echo "Coolify restart triggered (HTTP $HTTP)"
                    else
                        echo "Coolify API returned $HTTP — falling back to docker restart"
                        CONTAINER=$(docker ps --format "{{.Names}}" | grep -i beewaz | head -1)
                        [ -n "$CONTAINER" ] && docker restart "$CONTAINER"
                    fi

                    rm -f /tmp/beewaz-image.tar.gz
                    echo "Deploy complete"
                '''], capture_output=True, text=True, timeout=180)

                print("STDOUT:", result.stdout[-500:])
                if result.returncode != 0:
                    print("STDERR:", result.stderr[-300:])
                    self.send_response(500); self.end_headers()
                    self.wfile.write(result.stderr[-200:].encode())
                    return

                self.send_response(200); self.end_headers()
                self.wfile.write(f"deployed {sha}".encode())

            else:
                self.send_response(404); self.end_headers()

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500); self.end_headers()
            self.wfile.write(str(e).encode())

print("Image receiver listening on :5001")
server = http.server.HTTPServer(('0.0.0.0', 5001), Handler)
server.serve_forever()
PYEOF

# systemd service
cat > /etc/systemd/system/image-receiver.service << 'EOF'
[Unit]
Description=Beewaz Image Receiver
After=network.target

[Service]
ExecStart=/usr/bin/python3 /root/image-receiver.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable image-receiver
systemctl restart image-receiver
sleep 2
systemctl status image-receiver --no-pager
echo "✅ Image receiver updated on port 5001"
