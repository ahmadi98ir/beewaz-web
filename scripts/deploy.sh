#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — اسکریپت نصب و راه‌اندازی بیواز روی سرور
# استفاده: bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }

echo ""
echo "  ██████╗ ███████╗███████╗██╗    ██╗ █████╗ ███████╗"
echo "  ██╔══██╗██╔════╝██╔════╝██║    ██║██╔══██╗╚════██║"
echo "  ██████╔╝█████╗  █████╗  ██║ █╗ ██║███████║    ██╔╝"
echo "  ██╔══██╗██╔══╝  ██╔══╝  ██║███╗██║██╔══██║   ██╔╝ "
echo "  ██████╔╝███████╗███████╗╚███╔███╔╝██║  ██║   ██║  "
echo "  ╚═════╝ ╚══════╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝  "
echo ""

# ── بررسی پیش‌نیازها ─────────────────────────────────────────────────────────
info "بررسی پیش‌نیازها..."
command -v docker        >/dev/null 2>&1 || error "Docker نصب نیست. https://docs.docker.com/engine/install/"
command -v docker compose>/dev/null 2>&1 || error "Docker Compose نصب نیست."
success "Docker و Compose موجودند"

# ── بررسی فایل .env ──────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  warn "فایل .env یافت نشد. از .env.example کپی می‌کنم..."
  cp .env.example .env
  echo ""
  echo "  ⚠️  فایل .env ساخته شد. قبل از ادامه مقادیر زیر را ویرایش کن:"
  echo "     - POSTGRES_PASSWORD"
  echo "     - AUTH_SECRET    (openssl rand -base64 32)"
  echo "     - ADMIN_PHONE"
  echo "     - ADMIN_PASSWORD"
  echo "     - NEXTAUTH_URL   (آدرس دامنه)"
  echo ""
  read -p "  آیا .env را ویرایش کردی؟ (y/n): " confirm
  [ "$confirm" = "y" ] || error "ابتدا .env را تنظیم کن و دوباره اجرا کن."
fi
success "فایل .env موجود است"

# ── بررسی SSL certificate ────────────────────────────────────────────────────
if [ ! -f "nginx/certs/fullchain.pem" ] || [ ! -f "nginx/certs/privkey.pem" ]; then
  warn "SSL certificate یافت نشد."
  echo ""
  echo "  گزینه ۱ — Let's Encrypt (رایگان، پیشنهادی):"
  echo "    sudo apt install certbot"
  echo "    sudo certbot certonly --standalone -d beewaz.ir -d www.beewaz.ir"
  echo "    sudo cp /etc/letsencrypt/live/beewaz.ir/fullchain.pem nginx/certs/"
  echo "    sudo cp /etc/letsencrypt/live/beewaz.ir/privkey.pem  nginx/certs/"
  echo ""
  echo "  گزینه ۲ — Self-signed (فقط برای تست):"
  echo "    mkdir -p nginx/certs"
  echo "    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
  echo "      -keyout nginx/certs/privkey.pem \\"
  echo "      -out nginx/certs/fullchain.pem \\"
  echo "      -subj '/CN=beewaz.ir'"
  echo ""
  read -p "  Self-signed certificate بسازم؟ (y/n): " ssl_confirm
  if [ "$ssl_confirm" = "y" ]; then
    mkdir -p nginx/certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/certs/privkey.pem \
      -out nginx/certs/fullchain.pem \
      -subj '/CN=beewaz.ir' 2>/dev/null
    success "Self-signed certificate ساخته شد"
  else
    error "ابتدا SSL certificate قرار بده"
  fi
fi
success "SSL certificate موجود است"

# ── Build و راه‌اندازی ────────────────────────────────────────────────────────
info "Build Docker image..."
docker compose build --no-cache

info "راه‌اندازی سرویس‌ها..."
docker compose up -d

# ── انتظار برای سلامت دیتابیس ────────────────────────────────────────────────
info "انتظار برای آماده شدن PostgreSQL..."
until docker compose exec postgres pg_isready -U beewaz -d beewaz >/dev/null 2>&1; do
  sleep 2
done
success "PostgreSQL آماده است"

# ── اجرای migration ───────────────────────────────────────────────────────────
info "اجرای database migration..."
docker compose exec app npx drizzle-kit migrate 2>/dev/null || warn "Migration انجام نشد (ممکن است قبلاً اجرا شده باشد)"

# ── بررسی نهایی ───────────────────────────────────────────────────────────────
sleep 3
if docker compose ps | grep -q "beewaz-app.*running\|beewaz-app.*Up"; then
  echo ""
  echo "  ✅ بیواز با موفقیت راه‌اندازی شد!"
  echo ""
  echo "  🌐 آدرس سایت:    https://beewaz.ir"
  echo "  🔐 پنل ادمین:    https://beewaz.ir/admin"
  echo ""
  echo "  مدیریت سرویس‌ها:"
  echo "    docker compose logs -f app     # لاگ‌های live"
  echo "    docker compose restart app     # ری‌استارت"
  echo "    docker compose down            # خاموش کردن"
  echo ""
else
  error "سرویس‌ها بالا نیامدند. docker compose logs app را بررسی کن."
fi
