#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# install-docker-offline.sh
# نصب Docker روی Ubuntu 24.04 بدون اینترنت
# اجرا: bash scripts/install-docker-offline.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
info() { echo -e "${CYAN}[...]${NC}  $1"; }
err()  { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }
warn() { echo -e "${YELLOW}[!]${NC}    $1"; }

echo ""
echo "  نصب Docker آفلاین — Ubuntu 24.04"
echo "  ──────────────────────────────────"
echo ""

# بررسی root
[ "$EUID" -eq 0 ] || err "این اسکریپت باید با sudo یا root اجرا شود."

# بررسی اینکه Docker نصب نشده
if command -v docker &>/dev/null; then
    ok "Docker قبلاً نصب شده است: $(docker --version)"
    exit 0
fi

# پیدا کردن پوشه پکیج‌ها
PKG_DIR="$(dirname "$0")/../docker-packages"
[ -d "$PKG_DIR" ] || PKG_DIR="./docker-packages"
[ -d "$PKG_DIR" ] || err "پوشه docker-packages یافت نشد. مطمئن شو بسته را استخراج کردی."

DEB_COUNT=$(ls "$PKG_DIR"/*.deb 2>/dev/null | wc -l)
[ "$DEB_COUNT" -gt 0 ] || err "هیچ فایل .deb در $PKG_DIR یافت نشد."

info "نصب $DEB_COUNT پکیج Docker..."
dpkg -i "$PKG_DIR"/*.deb 2>&1 | tail -5

# رفع وابستگی‌های احتمالی
if command -v apt-get &>/dev/null; then
    apt-get install -f -y 2>/dev/null || true
fi

# فعال‌سازی سرویس
systemctl enable docker
systemctl start docker

# بررسی نصب
docker --version && ok "Docker با موفقیت نصب شد."
docker compose version && ok "Docker Compose در دسترس است."

# اضافه کردن کاربر جاری به گروه docker (اگر root نبود)
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker "$SUDO_USER"
    ok "کاربر $SUDO_USER به گروه docker اضافه شد. (لاگ‌اوت و لاگ‌این مجدد لازم است)"
fi

echo ""
ok "Docker آماده است!"
echo ""
