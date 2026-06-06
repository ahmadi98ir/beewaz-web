#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy — cron هر دقیقه اجرا می‌کنه، ولی داخل script سه بار با ۲۰ ثانیه فاصله چک می‌کنه
# → عملاً هر ۲۰ ثانیه یک‌بار release جدید رو تشخیص می‌ده

COOLIFY_TOKEN="5|beewaz-deploy-fix-2026"
APP_UUID="jw4kpfn8utdybrmwkr80fm8f"
GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-release-id"
DEPLOY_LOCK="/tmp/beewaz-deploy-running.lock"
POLL_LOCK="/tmp/beewaz-poll.lock"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$(dirname $STATE_FILE)"

# ── تابع deploy ──────────────────────────────────────────────────────────────
do_deploy() {
  local RELEASE_ID="$1"
  # lock از تداخل deploy جلوگیری می‌کنه
  if [ -f "$DEPLOY_LOCK" ]; then log "deploy already in progress, skipping"; return; fi
  touch "$DEPLOY_LOCK"
  trap "rm -f $DEPLOY_LOCK" RETURN

  log "New build detected (release id=$RELEASE_ID) — deploying..."

  log "Downloading build tarball..."
  curl -sfL --max-time 600 \
    --doh-url https://1.1.1.1/dns-query \
    "https://github.com/$GITHUB_REPO/releases/download/deploy-cache/beewaz-build.tar.gz" \
    -o /tmp/bz-build.tar.gz
  if [ $? -ne 0 ] || [ ! -s /tmp/bz-build.tar.gz ]; then
    log "ERROR: download failed — will retry next cycle"
    rm -f /tmp/bz-build.tar.gz; return
  fi
  log "Downloaded: $(du -sh /tmp/bz-build.tar.gz | cut -f1)"

  CONTAINER=$(docker ps --format "{{.Names}}" | grep "$APP_UUID" | head -1)
  if [ -z "$CONTAINER" ]; then
    log "ERROR: no container found for $APP_UUID"
    rm -f /tmp/bz-build.tar.gz; return
  fi
  log "Container: $CONTAINER"

  rm -rf /tmp/bz-bundle && mkdir /tmp/bz-bundle
  tar -xzf /tmp/bz-build.tar.gz -C /tmp/bz-bundle
  docker cp /tmp/bz-bundle/. $CONTAINER:/app/
  rm -rf /tmp/bz-build.tar.gz /tmp/bz-bundle
  log "Files deployed to container"

  log "Restarting..."
  # مستقیم docker restart می‌زنیم — Coolify API کانتینر رو از image اصلی بازسازی
  # می‌کنه و فایل‌هایی که با docker cp کپی کردیم پاک می‌شن. docker restart همون
  # کانتینر رو stop/start می‌کنه و تغییرات فایل‌سیستم حفظ می‌شه.
  if docker restart "$CONTAINER" >/dev/null 2>&1; then
    echo "$RELEASE_ID" > "$STATE_FILE"
    log "✅ Deploy successful (id=$RELEASE_ID) — container restarted"
  else
    log "ERROR: docker restart failed for $CONTAINER"
  fi
}

# ── تابع یک چک ───────────────────────────────────────────────────────────────
check_once() {
  RELEASE_JSON=$(curl -sf --max-time 10 \
    --doh-url https://1.1.1.1/dns-query \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_REPO/releases/tags/deploy-cache" 2>/dev/null)
  [ -z "$RELEASE_JSON" ] && return

  RELEASE_ID=$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
  [ -z "$RELEASE_ID" ] && return

  CURRENT_ID=$(cat "$STATE_FILE" 2>/dev/null)
  [ "$RELEASE_ID" = "$CURRENT_ID" ] && return

  do_deploy "$RELEASE_ID"
}

# ── حلقه اصلی: اگر poll lock نباشه ۳ بار چک می‌کنه (هر ۲۰ ثانیه) ──────────
if [ -f "$POLL_LOCK" ]; then exit 0; fi
touch "$POLL_LOCK"
trap "rm -f $POLL_LOCK" EXIT

for i in 1 2 3; do
  check_once
  # اگر deploy شد زودتر خارج می‌شیم
  [ -f "$DEPLOY_LOCK" ] && break
  [ "$i" -lt 3 ] && sleep 20
done
