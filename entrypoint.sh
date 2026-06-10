#!/bin/sh
set -e

# اطمینان از وجود پوشه uploads
mkdir -p /app/public/uploads/products
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || true

# DNS fix: api.sms.ir برای ارسال پیامک از داخل container
grep -q "api.sms.ir" /etc/hosts 2>/dev/null || echo "185.211.56.44 api.sms.ir" >> /etc/hosts

# اجرای migration قبل از start
echo "[entrypoint] ── Migration ─────────────────────────"
if [ -f /app/migrate.mjs ]; then
  node /app/migrate.mjs || echo "[entrypoint] ⚠️  migrate.mjs exited with error — app will start anyway (check logs above)"
else
  echo "[entrypoint] ❌ migrate.mjs not found — skipping migrations"
fi
echo "[entrypoint] ────────────────────────────────────────"

echo "[entrypoint] Starting Next.js..."
exec node server.js
