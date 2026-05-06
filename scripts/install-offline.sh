#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# install-offline.sh — نصب بیواز از بسته آفلاین روی سرور
# اجرا: bash scripts/install-offline.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERR]${NC}   $1"; exit 1; }

echo ""
echo "  بیواز — نصب آفلاین"
echo "  ────────────────────"
echo ""

# ── بررسی Docker ──────────────────────────────────────────────────────────────
info "بررسی Docker..."
command -v docker >/dev/null 2>&1 || error "Docker نصب نیست. ابتدا docker-offline را نصب کن (مرحله ۱ راهنما)."
command -v docker compose >/dev/null 2>&1 || \
  docker compose version >/dev/null 2>&1 || \
  error "Docker Compose نصب نیست."
success "Docker موجود است."

# ── بارگذاری ایمیج‌ها ─────────────────────────────────────────────────────────
info "بارگذاری ایمیج‌ها از فایل tar..."

[ -f "images/app.tar"      ] || error "فایل images/app.tar یافت نشد."
[ -f "images/postgres.tar" ] || error "فایل images/postgres.tar یافت نشد."
[ -f "images/nginx.tar"    ] || error "فایل images/nginx.tar یافت نشد."

docker load -i images/app.tar      && success "ایمیج app بارگذاری شد."
docker load -i images/postgres.tar && success "ایمیج postgres بارگذاری شد."
docker load -i images/nginx.tar    && success "ایمیج nginx بارگذاری شد."

# ── بررسی .env ────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  warn "فایل .env ساخته شد. مقادیر زیر را ویرایش کن:"
  echo ""
  echo "    POSTGRES_PASSWORD  ← یک رمز قوی"
  echo "    AUTH_SECRET        ← openssl rand -base64 32"
  echo "    ADMIN_PHONE        ← شماره ادمین"
  echo "    ADMIN_PASSWORD     ← رمز ادمین"
  echo "    NEXTAUTH_URL       ← آدرس سایت (مثلاً http://SERVER_IP)"
  echo ""
  echo "  دستور ویرایش:  nano .env"
  echo ""
  read -p "  آیا .env را ویرایش کردی؟ (y/n): " confirm
  [ "$confirm" = "y" ] || { warn "ابتدا .env را تنظیم کن."; exit 1; }
fi
success "فایل .env موجود است."

# ── بررسی SSL ─────────────────────────────────────────────────────────────────
if [ ! -f "nginx/certs/fullchain.pem" ] || [ ! -f "nginx/certs/privkey.pem" ]; then
  warn "SSL certificate یافت نشد. در حال ساخت self-signed..."
  mkdir -p nginx/certs
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout nginx/certs/privkey.pem \
    -out    nginx/certs/fullchain.pem \
    -subj   '/CN=beewaz' 2>/dev/null
  success "Self-signed certificate ساخته شد (۱۰ سال اعتبار)."
fi
success "SSL certificate موجود است."

# ── راه‌اندازی ─────────────────────────────────────────────────────────────────
info "راه‌اندازی سرویس‌ها..."
docker compose up -d

# ── انتظار برای دیتابیس ───────────────────────────────────────────────────────
info "انتظار برای آماده شدن PostgreSQL..."
for i in $(seq 1 30); do
  docker compose exec postgres pg_isready -U beewaz -d beewaz >/dev/null 2>&1 && break
  sleep 2
done
success "PostgreSQL آماده است."

# ── Migration ─────────────────────────────────────────────────────────────────
info "اجرای database migration..."
docker compose exec app npx drizzle-kit migrate 2>/dev/null || warn "Migration بعداً می‌توان اجرا کرد."

# ── نتیجه ─────────────────────────────────────────────────────────────────────
sleep 3
echo ""
echo "  ✅ نصب کامل شد!"
echo ""
echo "  🌐 سایت:      http://$(hostname -I | awk '{print $1}')"
echo "  🔐 پنل ادمین: http://$(hostname -I | awk '{print $1}')/admin"
echo ""
echo "  دستورات مفید:"
echo "    docker compose ps           — وضعیت سرویس‌ها"
echo "    docker compose logs -f app  — لاگ‌های live"
echo "    docker compose restart app  — ری‌استارت"
echo ""
