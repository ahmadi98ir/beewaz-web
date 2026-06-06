#!/bin/bash
# /opt/beewaz-autodeploy.sh
# Auto-deploy — every 5 min via cron
# Uses GitHub API (no CDN redirect) to check version, then downloads standalone build

COOLIFY_TOKEN="5|beewaz-deploy-fix-2026"
APP_UUID="jw4kpfn8utdybrmwkr80fm8f"
GITHUB_REPO="ahmadi98ir/beewaz-web"
STATE_FILE="/var/lib/beewaz-deploy/last-release-id"
LOCK_FILE="/tmp/beewaz-deploy.lock"

log() { logger -t beewaz-deploy "$*"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [ -f "$LOCK_FILE" ]; then log "already running, skipping"; exit 0; fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

mkdir -p "$(dirname $STATE_FILE)"

# بررسی release از طریق API (نه CDN — مستقیم جواب می‌ده)
RELEASE_JSON=$(curl -sf --max-time 20 \
  --doh-url https://1.1.1.1/dns-query \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_REPO/releases/tags/deploy-cache" 2>/dev/null)

if [ -z "$RELEASE_JSON" ]; then
  log "INFO: could not reach GitHub API — will retry next cycle"
  exit 0
fi

RELEASE_ID=$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -z "$RELEASE_ID" ]; then log "ERROR: could not parse release JSON"; exit 1; fi

CURRENT_ID=$(cat "$STATE_FILE" 2>/dev/null)
if [ "$RELEASE_ID" = "$CURRENT_ID" ]; then exit 0; fi

log "New build detected (release id=$RELEASE_ID)"

# دانلود standalone tarball (از CDN با timeout بلند)
log "Downloading build tarball..."
curl -sfL --max-time 600 \
  --doh-url https://1.1.1.1/dns-query \
  "https://github.com/$GITHUB_REPO/releases/download/deploy-cache/beewaz-build.tar.gz" \
  -o /tmp/bz-build.tar.gz
if [ $? -ne 0 ] || [ ! -s /tmp/bz-build.tar.gz ]; then
  log "ERROR: download failed — will retry next cycle"
  rm -f /tmp/bz-build.tar.gz; exit 0
fi
log "Downloaded: $(du -sh /tmp/bz-build.tar.gz | cut -f1)"

# یافتن container
CONTAINER=$(docker ps --format "{{.Names}}" | grep "$APP_UUID" | head -1)
if [ -z "$CONTAINER" ]; then
  log "ERROR: no container found for $APP_UUID"
  rm -f /tmp/bz-build.tar.gz; exit 1
fi
log "Container: $CONTAINER"

# کپی فایل‌ها
rm -rf /tmp/bz-bundle && mkdir /tmp/bz-bundle
tar -xzf /tmp/bz-build.tar.gz -C /tmp/bz-bundle
docker cp /tmp/bz-bundle/. $CONTAINER:/app/
rm -rf /tmp/bz-build.tar.gz /tmp/bz-bundle
log "Files deployed to container"

# restart
log "Restarting..."
HTTP=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "http://localhost:8000/api/v1/applications/$APP_UUID/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" || echo "000")

if [ "$HTTP" = "200" ] || [ "$HTTP" = "202" ]; then
  echo "$RELEASE_ID" > "$STATE_FILE"
  log "✅ Deploy successful (id=$RELEASE_ID)"
else
  log "WARNING: Coolify returned HTTP $HTTP — docker restart fallback"
  docker restart "$CONTAINER"
  echo "$RELEASE_ID" > "$STATE_FILE"
  log "✅ Container restarted via docker"
fi
