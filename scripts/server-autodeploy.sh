#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy script — runs every 5 minutes via cron
# Checks deploy-cache release for new standalone build, deploys via docker cp

COOLIFY_TOKEN="5|beewaz-deploy-fix-2026"
APP_UUID="jw4kpfn8utdybrmwkr80fm8f"
GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-sha"
LOCK_FILE="/tmp/beewaz-deploy.lock"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [ -f "$LOCK_FILE" ]; then
  log "already running, skipping"
  exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

mkdir -p "$(dirname $STATE_FILE)"

# دریافت SHA آخرین build از build-version.txt
REMOTE_SHA=$(curl -sfL --max-time 15 \
  --doh-url https://1.1.1.1/dns-query \
  "https://github.com/$GITHUB_REPO/releases/download/deploy-cache/build-version.txt" 2>/dev/null | tr -d '[:space:]')

if [ -z "$REMOTE_SHA" ]; then
  log "INFO: could not reach GitHub — will retry next cycle"
  exit 0
fi

CURRENT_SHA=$(cat "$STATE_FILE" 2>/dev/null)
if [ "$REMOTE_SHA" = "$CURRENT_SHA" ]; then
  exit 0
fi

log "New build detected: ${REMOTE_SHA:0:8} (was ${CURRENT_SHA:0:8})"

# دانلود standalone tarball
log "Downloading build tarball..."
curl -sfL --max-time 300 \
  --doh-url https://1.1.1.1/dns-query \
  "https://github.com/$GITHUB_REPO/releases/download/deploy-cache/beewaz-build.tar.gz" \
  -o /tmp/bz-build.tar.gz
if [ $? -ne 0 ] || [ ! -s /tmp/bz-build.tar.gz ]; then
  log "ERROR: download failed — will retry next cycle"
  rm -f /tmp/bz-build.tar.gz
  exit 0
fi
log "Downloaded: $(du -sh /tmp/bz-build.tar.gz | cut -f1)"

# یافتن container
CONTAINER=$(docker ps --format "{{.Names}}" | grep -i beewaz | head -1)
if [ -z "$CONTAINER" ]; then
  log "ERROR: no beewaz container found"
  rm -f /tmp/bz-build.tar.gz
  exit 1
fi
log "Container: $CONTAINER"

# استخراج و کپی فایل‌ها
rm -rf /tmp/bz-bundle && mkdir /tmp/bz-bundle
tar -xzf /tmp/bz-build.tar.gz -C /tmp/bz-bundle
docker cp /tmp/bz-bundle/. $CONTAINER:/app/
rm -rf /tmp/bz-build.tar.gz /tmp/bz-bundle
log "Files deployed to container"

# restart
log "Restarting via Coolify..."
HTTP=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "http://localhost:8000/api/v1/applications/$APP_UUID/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" || echo "000")

if [ "$HTTP" = "200" ] || [ "$HTTP" = "202" ]; then
  echo "$REMOTE_SHA" > "$STATE_FILE"
  log "✅ Deploy successful: ${REMOTE_SHA:0:8}"
else
  log "WARNING: Coolify returned HTTP $HTTP — trying docker restart"
  docker restart "$CONTAINER"
  echo "$REMOTE_SHA" > "$STATE_FILE"
  log "✅ Container restarted via docker: ${REMOTE_SHA:0:8}"
fi
