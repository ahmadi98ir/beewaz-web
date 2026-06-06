#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy — سرور مستقیم از GitHub clone می‌کنه و Docker image می‌سازه
# بدون نیاز به CDN (که در ایران بلاک‌ه)
# cron: * * * * * /opt/beewaz-autodeploy.sh >> /var/log/beewaz-deploy.log 2>&1

APP_UUID="jw4kpfn8utdybrmwkr80fm8f"
GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-sha"
DEPLOY_LOCK="/tmp/beewaz-deploy-running.lock"
POLL_LOCK="/tmp/beewaz-poll.lock"
BUILD_DIR="/tmp/bz-build-src"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$(dirname $STATE_FILE)"

# ── deploy از روی سورس ────────────────────────────────────────────────────────
do_deploy() {
  local SHA="$1"
  if [ -f "$DEPLOY_LOCK" ]; then log "deploy already in progress"; return; fi
  touch "$DEPLOY_LOCK"
  trap "rm -f $DEPLOY_LOCK" RETURN

  log "New commit detected ($SHA) — building..."

  # clone/pull سورس
  if [ -d "$BUILD_DIR/.git" ]; then
    log "Pulling latest..."
    git -C "$BUILD_DIR" fetch origin main --depth=1 2>&1 | tail -1
    git -C "$BUILD_DIR" reset --hard origin/main 2>&1 | tail -1
  else
    rm -rf "$BUILD_DIR"
    log "Cloning repo..."
    git clone --depth=1 "https://github.com/$GITHUB_REPO.git" "$BUILD_DIR" 2>&1 | tail -1
  fi

  if [ ! -f "$BUILD_DIR/Dockerfile" ]; then
    log "ERROR: clone failed — Dockerfile not found"
    return
  fi

  # تشخیص image فعلی کانتینر
  CONTAINER=$(docker ps --format "{{.Names}}" | grep "$APP_UUID" | head -1)
  if [ -z "$CONTAINER" ]; then log "ERROR: container not found"; return; fi
  IMAGE=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null)
  log "Container: $CONTAINER | Image: $IMAGE"

  # docker build
  log "Building Docker image (این ممکنه چند دقیقه طول بکشه)..."
  if docker build \
    --build-arg NEXT_PUBLIC_APP_URL=https://beewaz.ir \
    -t "$IMAGE" \
    "$BUILD_DIR" 2>&1 | tail -5; then
    log "Build successful"
  else
    log "ERROR: docker build failed"
    return
  fi

  # restart کانتینر
  log "Restarting container..."
  if docker restart "$CONTAINER" >/dev/null 2>&1; then
    echo "$SHA" > "$STATE_FILE"
    log "✅ Deploy successful (sha=$SHA)"
  else
    log "ERROR: docker restart failed"
  fi
}

# ── چک یک‌بار ────────────────────────────────────────────────────────────────
check_once() {
  # آخرین commit روی main از API (نه CDN)
  SHA=$(curl -sf --max-time 10 \
    --doh-url https://1.1.1.1/dns-query \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_REPO/commits/main" 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])" 2>/dev/null)

  [ -z "$SHA" ] && return

  CURRENT=$(cat "$STATE_FILE" 2>/dev/null)
  [ "$SHA" = "$CURRENT" ] && return

  do_deploy "$SHA"
}

# ── حلقه اصلی: هر دقیقه ۳ بار (هر ۲۰ ثانیه) ────────────────────────────────
if [ -f "$POLL_LOCK" ]; then exit 0; fi
touch "$POLL_LOCK"
trap "rm -f $POLL_LOCK" EXIT

for i in 1 2 3; do
  check_once
  [ -f "$DEPLOY_LOCK" ] && break
  [ "$i" -lt 3 ] && sleep 20
done
