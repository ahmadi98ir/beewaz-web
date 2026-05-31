#!/usr/bin/env bash
#
# پشتیبان‌گیری خودکار از دیتابیس PostgreSQL
#
# استفاده:
#   DATABASE_URL=postgres://user:pass@host:5432/db ./scripts/db-backup.sh [backup_dir]
#
# پیشنهاد: با cron روی سرور هر شب اجرا شود، مثلاً:
#   0 3 * * * cd /app && ./scripts/db-backup.sh /backups >> /var/log/db-backup.log 2>&1
#
# نسخه‌های قدیمی‌تر از RETENTION_DAYS روز به‌صورت خودکار حذف می‌شوند.

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "خطا: متغیر محیطی DATABASE_URL تنظیم نشده است" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTFILE="$BACKUP_DIR/beewaz_${TIMESTAMP}.sql.gz"

echo "[$(date)] شروع پشتیبان‌گیری → $OUTFILE"

# pg_dump با فشرده‌سازی gzip
pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$OUTFILE"

SIZE="$(du -h "$OUTFILE" | cut -f1)"
echo "[$(date)] پشتیبان‌گیری کامل شد ($SIZE)"

# حذف نسخه‌های قدیمی
DELETED="$(find "$BACKUP_DIR" -name 'beewaz_*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)"
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] $DELETED نسخه قدیمی حذف شد (قدیمی‌تر از ${RETENTION_DAYS} روز)"
fi
