#!/bin/bash
# /root/poll-deploy.sh — run by systemd timer every 3 minutes
# Strategy: git ls-remote to detect new commit → git clone → docker build → swap container

REPO_URL="https://github.com/ahmadi98ir/beewaz-web.git"
REPO_DIR="/root/beewaz-src"
LAST_SHA_FILE="/root/.last-deployed-sha"
LOG="/var/log/beewaz-deploy.log"
IMAGE_TAG="beewaz-local:latest"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# 1. Check latest SHA via git ls-remote (uses github.com directly, not CDN)
LATEST_SHA=$(git ls-remote "$REPO_URL" refs/heads/main 2>/dev/null | cut -f1)
if [ -z "$LATEST_SHA" ]; then
  log "Could not reach github.com — skipping"
  exit 0
fi

CURRENT_SHA=$(cat "$LAST_SHA_FILE" 2>/dev/null || echo "none")
if [ "$LATEST_SHA" = "$CURRENT_SHA" ]; then
  exit 0  # Nothing new
fi

log "New commit detected: ${LATEST_SHA:0:8} (was ${CURRENT_SHA:0:8}) — deploying..."

# 2. Clone or update source repo
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" fetch origin main --depth=1 2>&1 | tail -3 | while read l; do log "git: $l"; done
  git -C "$REPO_DIR" reset --hard origin/main
else
  git clone --depth=1 "$REPO_URL" "$REPO_DIR" 2>&1 | tail -5 | while read l; do log "git: $l"; done
fi

log "Source updated. Building Docker image (this takes ~5 min)..."

# 3. Build Docker image locally on server
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://bz360.ir \
  -t "$IMAGE_TAG" \
  "$REPO_DIR" 2>&1 | tail -20 | while read l; do log "build: $l"; done

if [ $? -ne 0 ]; then
  log "ERROR: docker build failed"
  exit 1
fi

log "Build complete. Swapping container..."

# 4. Find running container and its config
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i beewaz | head -1)
if [ -z "$CONTAINER" ]; then
  log "ERROR: No beewaz container running"
  exit 1
fi

# Get env vars and port mappings from running container
ENV_ARGS=$(docker inspect "$CONTAINER" --format '{{range .Config.Env}}-e {{.}} {{end}}' | \
  grep -v 'PATH=' | grep -v 'HOME=' | grep -v 'NODE_VERSION=')
PORT_ARGS=$(docker inspect "$CONTAINER" --format '{{range $p,$b := .HostConfig.PortBindings}}-p {{(index $b 0).HostPort}}:{{$p}} {{end}}')
NETWORK=$(docker inspect "$CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' | head -1)
RESTART=$(docker inspect "$CONTAINER" --format '{{.HostConfig.RestartPolicy.Name}}')

log "Stopping old container: $CONTAINER"
docker stop "$CONTAINER"
docker rename "$CONTAINER" "${CONTAINER}-old" 2>/dev/null || docker rm "$CONTAINER"

log "Starting new container..."
docker run -d \
  --name "$CONTAINER" \
  --network "$NETWORK" \
  --restart "$RESTART" \
  $PORT_ARGS \
  $ENV_ARGS \
  "$IMAGE_TAG"

sleep 5
docker rm -f "${CONTAINER}-old" 2>/dev/null || true

# 5. Health check
HTTP=$(curl -sf --max-time 15 -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "301" ] || [ "$HTTP" = "302" ]; then
  log "Deploy SUCCESS — HTTP $HTTP — commit ${LATEST_SHA:0:8}"
  echo "$LATEST_SHA" > "$LAST_SHA_FILE"
  docker image prune -f 2>/dev/null || true
else
  log "WARN: Site returned HTTP $HTTP — check manually"
  echo "$LATEST_SHA" > "$LAST_SHA_FILE"
fi
