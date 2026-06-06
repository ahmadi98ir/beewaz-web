#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy — tarball را از Cloudflare R2 دانلود می‌کند
# cron: * * * * * /opt/beewaz-autodeploy.sh >> /var/log/beewaz-deploy.log 2>&1

R2_BASE="https://pub-304fa4e803c8406fa2617521a41f0971.r2.dev"
STATE_FILE="/var/lib/beewaz-deploy/last-sha"
DEPLOY_LOCK="/tmp/beewaz-deploy-running.lock"
POLL_LOCK="/tmp/beewaz-poll.lock"
BUILD_DIR="/tmp/bz-build"
TARBALL="/tmp/beewaz-build.tar.gz"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$(dirname $STATE_FILE)"

download_with_retry() {
  local URL="$1" DEST="$2"
  for attempt in 1 2 3 4 5; do
    if curl -fsSL --max-time 120 --retry 2 -o "$DEST" "$URL" 2>/dev/null; then
      return 0
    fi
    log "Download attempt $attempt failed, retrying in ${attempt}0s..."
    sleep $((attempt * 10))
  done
  return 1
}

do_deploy() {
  local SHA="$1"
  if [ -f "$DEPLOY_LOCK" ]; then log "deploy already in progress"; return; fi
  touch "$DEPLOY_LOCK"
  trap "rm -f $DEPLOY_LOCK" RETURN

  log "New commit detected ($SHA) — downloading build tarball from R2..."

  rm -f "$TARBALL"
  if ! download_with_retry "$R2_BASE/beewaz-build.tar.gz" "$TARBALL"; then
    log "ERROR: download failed after 5 attempts"
    return
  fi
  log "Download complete ($(du -sh $TARBALL | cut -f1))"

  rm -rf "$BUILD_DIR" && mkdir -p "$BUILD_DIR"
  if ! tar -xzf "$TARBALL" -C "$BUILD_DIR" 2>&1; then
    log "ERROR: tar extraction failed"
    return
  fi

  if [ ! -f "$BUILD_DIR/Dockerfile" ]; then
    log "ERROR: Dockerfile not found in tarball"
    return
  fi

  CONTAINER=$(docker ps --format "{{.Names}}" | grep "jw4kpfn8utdybrmwkr80fm8f" | head -1)
  if [ -z "$CONTAINER" ]; then log "ERROR: container not found"; return; fi
  IMAGE=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null)
  log "Container: $CONTAINER | Image: $IMAGE"

  log "Building Docker image..."
  if docker build -t "$IMAGE" "$BUILD_DIR" 2>&1 | tail -5; then
    log "Build successful"
  else
    log "ERROR: docker build failed"
    return
  fi

  log "Restarting container..."
  if docker restart "$CONTAINER" >/dev/null 2>&1; then
    echo "$SHA" > "$STATE_FILE"
    log "✅ Deploy successful (sha=$SHA)"
  else
    log "ERROR: docker restart failed"
  fi
}

check_once() {
  SHA=$(curl -sf --max-time 10 "$R2_BASE/sha.txt" 2>/dev/null | tr -d '[:space:]')
  [ -z "$SHA" ] && return

  CURRENT=$(cat "$STATE_FILE" 2>/dev/null)
  [ "$SHA" = "$CURRENT" ] && return

  do_deploy "$SHA"
}

if [ -f "$POLL_LOCK" ]; then exit 0; fi
touch "$POLL_LOCK"
trap "rm -f $POLL_LOCK" EXIT

for i in 1 2 3; do
  check_once
  [ -f "$DEPLOY_LOCK" ] && break
  [ "$i" -lt 3 ] && sleep 20
done
