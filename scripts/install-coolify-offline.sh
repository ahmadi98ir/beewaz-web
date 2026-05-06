#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# install-coolify-offline.sh
# نصب Coolify از بسته آفلاین + بارگذاری Beewaz در Coolify
# اجرا: bash scripts/install-coolify-offline.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
info() { echo -e "${CYAN}[...]${NC}  $1"; }
err()  { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }
warn() { echo -e "${YELLOW}[!]${NC}    $1"; }

COOLIFY_DIR="/data/coolify"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "  نصب Coolify آفلاین"
echo "  ────────────────────"
echo ""

# ── بررسی Docker ──────────────────────────────────────────────────────────────
command -v docker &>/dev/null || err "Docker نصب نیست. ابتدا install-docker-offline.sh را اجرا کن."
ok "Docker موجود است."

# ── پیدا کردن پوشه ایمیج‌های Coolify ─────────────────────────────────────────
IMG_DIR="$(dirname "$0")/../images/coolify"
[ -d "$IMG_DIR" ] || IMG_DIR="./images/coolify"
[ -d "$IMG_DIR" ] || err "پوشه images/coolify یافت نشد."

# ── بارگذاری ایمیج‌های Coolify ────────────────────────────────────────────────
info "بارگذاری ایمیج‌های Coolify از tar..."

load_if_exists() {
    local file="$1"
    local name="$2"
    if [ -f "$file" ]; then
        docker load -i "$file" && ok "$name"
    else
        warn "$name یافت نشد: $file"
    fi
}

load_if_exists "$IMG_DIR/coolify.tar"        "Coolify"
load_if_exists "$IMG_DIR/coolify-helper.tar" "Coolify Helper"
load_if_exists "$IMG_DIR/postgres15.tar"     "PostgreSQL 15"
load_if_exists "$IMG_DIR/redis.tar"          "Redis"
load_if_exists "$IMG_DIR/traefik.tar"        "Traefik"
load_if_exists "$IMG_DIR/soketi.tar"         "Soketi"

# ── ساخت پوشه‌های Coolify ─────────────────────────────────────────────────────
info "ساخت ساختار پوشه Coolify..."
mkdir -p "$COOLIFY_DIR"/{source,applications,databases,proxy,ssh,webhooks-during-maintenance}
mkdir -p "$COOLIFY_DIR/source"

# ── کپی docker-compose ────────────────────────────────────────────────────────
COMPOSE_SRC="$(dirname "$0")/../coolify/docker-compose.yml"
[ -f "$COMPOSE_SRC" ] || COMPOSE_SRC="./coolify/docker-compose.yml"
[ -f "$COMPOSE_SRC" ] || err "فایل coolify/docker-compose.yml یافت نشد."

cp "$COMPOSE_SRC" "$COOLIFY_DIR/source/docker-compose.yml"
ok "docker-compose.yml کپی شد."

# ── ساخت فایل .env برای Coolify ───────────────────────────────────────────────
info "ساخت تنظیمات Coolify..."

DB_PASS=$(openssl rand -hex 16)
REDIS_PASS=$(openssl rand -hex 16)
APP_KEY="base64:$(openssl rand -base64 32)"

cat > "$COOLIFY_DIR/source/.env" <<EOF
COOLIFY_DB_PASSWORD=$DB_PASS
COOLIFY_REDIS_PASSWORD=$REDIS_PASS
APP_KEY=$APP_KEY
EOF

ok "فایل .env Coolify ساخته شد."

# ── راه‌اندازی Coolify ────────────────────────────────────────────────────────
info "راه‌اندازی Coolify..."
cd "$COOLIFY_DIR/source"
docker compose --env-file .env up -d

# ── انتظار برای آماده شدن ────────────────────────────────────────────────────
info "انتظار برای آماده شدن Coolify (تا ۶۰ ثانیه)..."
for i in $(seq 1 30); do
    if docker compose ps | grep -q "coolify.*Up\|coolify.*running"; then
        sleep 5
        break
    fi
    sleep 2
done

# ── بارگذاری ایمیج‌های Beewaz ────────────────────────────────────────────────
BEEWAZ_IMG_DIR="$(dirname "$0")/../images/beewaz"
[ -d "$BEEWAZ_IMG_DIR" ] || BEEWAZ_IMG_DIR="./images/beewaz"

if [ -d "$BEEWAZ_IMG_DIR" ]; then
    info "بارگذاری ایمیج‌های Beewaz..."
    load_if_exists "$BEEWAZ_IMG_DIR/app.tar"        "Beewaz App"
    load_if_exists "$BEEWAZ_IMG_DIR/postgres16.tar" "PostgreSQL 16"
    load_if_exists "$BEEWAZ_IMG_DIR/nginx.tar"      "Nginx"
fi

# ── اطلاعات نهایی ─────────────────────────────────────────────────────────────
echo ""
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║                 ✅ Coolify نصب شد!                      ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  🌐 آدرس پنل Coolify:"
echo "     http://$SERVER_IP:8000"
echo ""
echo "  مرحله بعد:"
echo "  1. مرورگر را باز کن و به http://$SERVER_IP:8000 برو"
echo "  2. حساب ادمین بساز"
echo "  3. برای اضافه کردن Beewaz، راهنمای Coolify را دنبال کن"
echo ""
echo "  دستورات مفید:"
echo "    cd $COOLIFY_DIR/source"
echo "    docker compose ps"
echo "    docker compose logs -f coolify"
echo ""
