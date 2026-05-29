#!/bin/bash
# /root/poll-deploy.sh — run by systemd timer every 2 minutes
set -e

RELEASE_URL="https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-build.tar.gz"
VERSION_URL="https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/build-version.txt"
LAST_SHA_FILE="/root/.last-deployed-sha"
LOG="/var/log/beewaz-deploy.log"
ARCHIVE="/tmp/beewaz-build.tar.gz"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# Check latest released SHA
LATEST_SHA=$(curl -sfL --max-time 15 "$VERSION_URL" | grep -oP 'SHA: \K\S+' || true)
if [ -z "$LATEST_SHA" ]; then
  log "Could not fetch version info — skipping"
  exit 0
fi

CURRENT_SHA=$(cat "$LAST_SHA_FILE" 2>/dev/null || echo "none")
if [ "$LATEST_SHA" = "$CURRENT_SHA" ]; then
  exit 0  # Nothing new
fi

log "New build detected: $LATEST_SHA (was $CURRENT_SHA) — deploying..."

# Download build archive
curl -sfL --max-time 300 -o "$ARCHIVE" "$RELEASE_URL"
log "Downloaded $(du -sh $ARCHIVE | cut -f1)"

# Find container
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i beewaz | head -1)
if [ -z "$CONTAINER" ]; then
  log "ERROR: No beewaz container running"
  exit 1
fi
log "Deploying to container: $CONTAINER"

# Extract and copy into container
rm -rf /tmp/beewaz-extract
mkdir -p /tmp/beewaz-extract
tar -xzf "$ARCHIVE" -C /tmp/beewaz-extract
docker cp /tmp/beewaz-extract/. "$CONTAINER:/app/"
rm -rf /tmp/beewaz-extract "$ARCHIVE"

# Restart container
docker restart "$CONTAINER"
log "Container restarted. Waiting for health check..."
sleep 8

# Quick health check
HTTP=$(curl -sf --max-time 10 -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "301" ] || [ "$HTTP" = "302" ]; then
  log "Deploy SUCCESS — site responding HTTP $HTTP"
  echo "$LATEST_SHA" > "$LAST_SHA_FILE"
else
  log "WARN: Site returned HTTP $HTTP after restart — check manually"
  echo "$LATEST_SHA" > "$LAST_SHA_FILE"
fi
