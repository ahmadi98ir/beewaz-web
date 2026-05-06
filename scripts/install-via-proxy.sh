#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# install-via-proxy.sh
# نصب کامل Docker + Coolify + Beewaz روی سرور از طریق پروکسی گوشی
# اجرا: bash scripts/install-via-proxy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

PROXY="http://localhost:8888"
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
info() { echo -e "${CYAN}[...]${NC}  $1"; }
err()  { echo -e "${RED}[ERR]${NC}  $1"; exit 1; }

echo ""
echo "  نصب از طریق پروکسی گوشی"
echo "  ──────────────────────────"
echo ""

# ── بررسی پروکسی ──────────────────────────────────────────────────────────────
info "بررسی اتصال به پروکسی گوشی..."
if ! curl -sf -x "$PROXY" --max-time 8 https://google.com -o /dev/null; then
    err "پروکسی در دسترس نیست!
    مطمئن شو روی گوشی در Termux دستور زیر را اجرا کردی:
      tinyproxy -c ~/tinyproxy.conf &
      ssh -R 8888:localhost:8888 root@$(hostname -I | awk '{print $1}')"
fi
ok "پروکسی متصل است — اینترنت از طریق گوشی در دسترس است."

# ── تنظیم پروکسی سیستم ────────────────────────────────────────────────────────
export http_proxy="$PROXY"
export https_proxy="$PROXY"
export HTTP_PROXY="$PROXY"
export HTTPS_PROXY="$PROXY"
export no_proxy="localhost,127.0.0.1,::1"

# ── نصب Docker ────────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
    ok "Docker قبلاً نصب شده: $(docker --version)"
else
    info "نصب Docker..."
    curl -fsSL https://get.docker.com -x "$PROXY" | sh
    systemctl enable docker
    systemctl start docker
    ok "Docker نصب شد."
fi

# ── تنظیم Docker برای استفاده از پروکسی ──────────────────────────────────────
info "تنظیم Docker Proxy..."
mkdir -p /etc/systemd/system/docker.service.d/
cat > /etc/systemd/system/docker.service.d/http-proxy.conf << EOF
[Service]
Environment="HTTP_PROXY=$PROXY"
Environment="HTTPS_PROXY=$PROXY"
Environment="NO_PROXY=localhost,127.0.0.1,::1"
EOF
systemctl daemon-reload
systemctl restart docker
ok "Docker Proxy تنظیم شد."

# ── نصب Coolify ───────────────────────────────────────────────────────────────
if docker ps 2>/dev/null | grep -q coolify; then
    ok "Coolify قبلاً نصب شده."
else
    info "نصب Coolify (اسکریپت رسمی)..."
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh -x "$PROXY" | bash
    ok "Coolify نصب شد."
fi

# ── انتظار برای آماده شدن Coolify ─────────────────────────────────────────────
info "انتظار برای راه‌اندازی Coolify..."
for i in $(seq 1 30); do
    curl -sf http://localhost:8000 -o /dev/null 2>/dev/null && break
    sleep 3
done

SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║            ✅ همه چیز آماده است!                ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""
echo "  🌐 پنل Coolify:  http://$SERVER_IP:8000"
echo ""
echo "  مرحله بعد:"
echo "  1. مرورگر را باز کن → http://$SERVER_IP:8000"
echo "  2. حساب ادمین بساز"
echo "  3. Beewaz را از طریق Docker Compose اضافه کن"
echo ""
echo "  ⚠️  بعد از نصب، تونل پروکسی گوشی را می‌توانی ببندی."
echo ""
