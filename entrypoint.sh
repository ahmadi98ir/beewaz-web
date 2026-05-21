#!/bin/sh
set -e

# اطمینان از وجود پوشه uploads
mkdir -p /app/public/uploads/products
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || true

# اجرای migration قبل از start
echo "[entrypoint] Running migrations..."
node /app/migrate.mjs || echo "[entrypoint] Migration warning (continuing anyway)"

echo "[entrypoint] Starting Next.js..."
exec su-exec nextjs node server.js
