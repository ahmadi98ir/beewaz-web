#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy script — runs every 5 minutes via cron
# Checks GitHub Releases for new image, downloads and deploys via Coolify

COOLIFY_TOKEN="8|nwRYs2cOstQbrTRHFr3ZIFSGzA3gZ7KVRZSFDoCi560b5e36"
APP_UUID="jw4kpfn8utdybrmwkr80fm8f"
GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-release-id"
LOCK_FILE="/tmp/beewaz-deploy.lock"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# جلوگیری از اجرای همزمان
if [ -f "$LOCK_FILE" ]; then
  log "already running, skipping"
  exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

mkdir -p "$(dirname $STATE_FILE)"

# دریافت آخرین release
RELEASE_JSON=$(curl -sf --max-time 15 \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_REPO/releases/tags/deploy-latest")
if [ -z "$RELEASE_JSON" ]; then
  log "INFO: could not reach GitHub — will retry next cycle"
  exit 0
fi

RELEASE_ID=$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
RELEASE_TITLE=$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])" 2>/dev/null)

if [ -z "$RELEASE_ID" ]; then
  log "ERROR: could not parse release JSON"
  exit 1
fi

# بررسی اینکه آیا deploy جدیده
CURRENT_ID=$(cat "$STATE_FILE" 2>/dev/null)
if [ "$RELEASE_ID" = "$CURRENT_ID" ]; then
  exit 0
fi

log "New release detected: $RELEASE_TITLE (id=$RELEASE_ID)"

# دانلود image
DOWNLOAD_URL="https://github.com/$GITHUB_REPO/releases/download/deploy-latest/beewaz-image.tar.gz"
log "Downloading image from GitHub Releases..."
curl -sfL --max-time 600 "$DOWNLOAD_URL" -o /tmp/beewaz-image.tar.gz
if [ $? -ne 0 ] || [ ! -s /tmp/beewaz-image.tar.gz ]; then
  log "ERROR: download failed or file is empty — will retry next cycle"
  rm -f /tmp/beewaz-image.tar.gz
  exit 0
fi

log "Loading Docker image..."
docker load < /tmp/beewaz-image.tar.gz
if [ $? -ne 0 ]; then
  log "ERROR: docker load failed"
  rm -f /tmp/beewaz-image.tar.gz
  exit 1
fi
rm -f /tmp/beewaz-image.tar.gz

# restart از طریق Coolify
log "Restarting via Coolify..."
HTTP=$(curl -sf -o /dev/null -w "%{http_code}" \
  -X POST "http://localhost:8000/api/v1/applications/$APP_UUID/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  --max-time 30 || echo "000")

if [ "$HTTP" = "200" ] || [ "$HTTP" = "202" ]; then
  echo "$RELEASE_ID" > "$STATE_FILE"
  log "✅ Deploy successful: $RELEASE_TITLE"
else
  log "WARNING: Coolify restart returned HTTP $HTTP — trying docker restart fallback"
  CONTAINER=$(docker ps --format "{{.Names}}" | grep -i beewaz | head -1)
  if [ -n "$CONTAINER" ]; then
    docker restart "$CONTAINER"
    echo "$RELEASE_ID" > "$STATE_FILE"
    log "✅ Container $CONTAINER restarted via docker"
  else
    log "ERROR: no beewaz container found"
    exit 1
  fi
fi
