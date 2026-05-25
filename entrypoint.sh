#!/bin/sh
set -e

# اطمینان از وجود پوشه uploads
mkdir -p /app/public/uploads/products
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || true

# DNS fix: api.sms.ir برای ارسال پیامک از داخل container
grep -q "api.sms.ir" /etc/hosts 2>/dev/null || echo "185.211.56.44 api.sms.ir" >> /etc/hosts

# اجرای migration قبل از start
echo "[entrypoint] Running migrations..."
node /app/migrate.mjs || echo "[entrypoint] Migration warning (continuing anyway)"

echo "[entrypoint] Starting Next.js..."
exec node server.js
