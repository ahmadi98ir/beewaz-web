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
  node /app/migrate.mjs
  MIGRATE_EXIT=$?
  if [ $MIGRATE_EXIT -ne 0 ]; then
    echo "[entrypoint] ⚠️  Migration exited with code $MIGRATE_EXIT — app will start anyway"
    echo "[entrypoint]    Check logs above for the exact DB error"
  fi
else
  echo "[entrypoint] ❌ migrate.mjs not found at /app/migrate.mjs — skipping"
  echo "[entrypoint]    Fix: add COPY migrate.mjs to Dockerfile runner stage"
fi
echo "[entrypoint] ────────────────────────────────────────"

echo "[entrypoint] Starting Next.js..."
exec node server.js
