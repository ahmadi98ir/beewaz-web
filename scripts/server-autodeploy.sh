#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy — سرور tarball از GitHub Release دانلود می‌کنه و Docker image می‌سازه
# بدون نیاز به git clone یا ghcr.io (که در ایران بلاک‌ه)
# cron: * * * * * /opt/beewaz-autodeploy.sh >> /var/log/beewaz-deploy.log 2>&1

GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-sha"
DEPLOY_LOCK="/tmp/beewaz-deploy-running.lock"
POLL_LOCK="/tmp/beewaz-poll.lock"
BUILD_DIR="/tmp/bz-build"
TARBALL="/tmp/beewaz-build.tar.gz"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$(dirname $STATE_FILE)"

# دانلود با retry (CDN گاهی قطع می‌شه)
download_with_retry() {
  local URL="$1" DEST="$2"
  for attempt in 1 2 3 4 5; do
    if curl -fsSL --max-time 120 --retry 2 \
        --doh-url https://1.1.1.1/dns-query \
        -o "$DEST" "$URL" 2>/dev/null; then
      return 0
    fi
    log "Download attempt $attempt failed, retrying in ${attempt}0s..."
    sleep $((attempt * 10))
  done
  return 1
}

# ── deploy از روی tarball ─────────────────────────────────────────────────────
do_deploy() {
  local SHA="$1"
  if [ -f "$DEPLOY_LOCK" ]; then log "deploy already in progress"; return; fi
  touch "$DEPLOY_LOCK"
  trap "rm -f $DEPLOY_LOCK" RETURN

  log "New commit detected ($SHA) — downloading build tarball..."

  # دانلود release asset URL از API
  ASSET_URL=$(curl -sf --max-time 15 \
    --doh-url https://1.1.1.1/dns-query \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_REPO/releases/tags/deploy-cache" 2>/dev/null \
    | python3 -c "
import sys,json
data=json.load(sys.stdin)
for a in data.get('assets',[]):
    if a['name']=='beewaz-build.tar.gz':
        print(a['browser_download_url'])
        break
" 2>/dev/null)

  if [ -z "$ASSET_URL" ]; then
    log "ERROR: could not get asset URL from GitHub API"
    return
  fi
  log "Downloading from: $ASSET_URL"

  rm -f "$TARBALL"
  if ! download_with_retry "$ASSET_URL" "$TARBALL"; then
    log "ERROR: download failed after 5 attempts"
    return
  fi
  log "Download complete ($(du -sh $TARBALL | cut -f1))"

  # extract
  rm -rf "$BUILD_DIR" && mkdir -p "$BUILD_DIR"
  if ! tar -xzf "$TARBALL" -C "$BUILD_DIR" 2>&1; then
    log "ERROR: tar extraction failed"
    return
  fi

  if [ ! -f "$BUILD_DIR/Dockerfile" ]; then
    log "ERROR: Dockerfile not found in tarball"
    return
  fi

  # تشخیص image فعلی کانتینر
  CONTAINER=$(docker ps --format "{{.Names}}" | grep "jw4kpfn8utdybrmwkr80fm8f" | head -1)
  if [ -z "$CONTAINER" ]; then log "ERROR: container not found"; return; fi
  IMAGE=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null)
  log "Container: $CONTAINER | Image: $IMAGE"

  # docker build از tarball (بدون npm install چون standalone آماده‌ست)
  log "Building Docker image from pre-built tarball..."
  if docker build -t "$IMAGE" "$BUILD_DIR" 2>&1 | tail -5; then
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
