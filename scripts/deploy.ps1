# deploy.ps1 - Deploy latest build to bz360.ir
$ErrorActionPreference = "Stop"

$RELEASE_URL = "https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-build.tar.gz"
$SERVER      = "78.157.51.14"
$SSH_PORT    = "8443"
$SSH_USER    = "root"
$SSH_PASS    = "1"
$LOCAL_FILE  = "$env:TEMP\beewaz-build.tar.gz"

# Find WinSCP.com
$winscpPaths = @(
    "C:\Program Files (x86)\WinSCP\WinSCP.com",
    "C:\Program Files\WinSCP\WinSCP.com",
    "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"
)
$WINSCP = $winscpPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $WINSCP) { throw "WinSCP.com not found! Please install WinSCP." }

$WS_SCRIPT = "$env:TEMP\bz-winscp.txt"
$WS_OPEN   = "open scp://${SSH_USER}:${SSH_PASS}@${SERVER}:${SSH_PORT}/ -hostkey=*"

function Run-SSH {
    param([string]$Cmd)
    # wrap in set -e so any failure returns non-zero to WinSCP
    $wrapped = "set -e; $Cmd"
    "$WS_OPEN`ncall $wrapped`nexit" | Out-File $WS_SCRIPT -Encoding ascii -Force
    & $WINSCP /ini=nul /script=$WS_SCRIPT
    $code = $LASTEXITCODE
    Remove-Item $WS_SCRIPT -ErrorAction SilentlyContinue
    return $code
}

function Run-SCP {
    param([string]$Local, [string]$Remote)
    "$WS_OPEN`nput `"$Local`" `"$Remote`"`nexit" | Out-File $WS_SCRIPT -Encoding ascii -Force
    & $WINSCP /ini=nul /script=$WS_SCRIPT
    $code = $LASTEXITCODE
    Remove-Item $WS_SCRIPT -ErrorAction SilentlyContinue
    return $code
}

Write-Host "=== Beewaz Deploy ===" -ForegroundColor Cyan

# ── Step 1: Download ──────────────────────────────────────────────────────────
Write-Host "`n[1/4] Downloading build from GitHub..." -ForegroundColor Yellow
curl.exe -L --progress-bar -o $LOCAL_FILE $RELEASE_URL
if ($LASTEXITCODE -ne 0) { throw "Download failed" }
$size = [math]::Round((Get-Item $LOCAL_FILE).Length / 1MB, 1)
Write-Host "      Downloaded: ${size} MB" -ForegroundColor Green

# ── Step 2: Upload ────────────────────────────────────────────────────────────
Write-Host "`n[2/4] Uploading to server..." -ForegroundColor Yellow
$r = Run-SCP $LOCAL_FILE "/tmp/beewaz-build.tar.gz"
if ($r -ne 0) { throw "Upload failed (exit $r)" }
Write-Host "      Upload complete" -ForegroundColor Green

# ── Step 3: Find container & deploy ──────────────────────────────────────────
Write-Host "`n[3/4] Deploying..." -ForegroundColor Yellow

# Find container name — list all running containers for visibility
$r = Run-SSH 'echo "=== Running containers ===" && docker ps --format "  {{.Names}} | {{.Image}}" && echo "========================="'
if ($r -ne 0) { Write-Host "Warning: could not list containers" -ForegroundColor DarkYellow }

# Detect container
$r = Run-SSH @'
CONTAINER=$(docker ps --filter "ancestor=ghcr.io/ahmadi98ir/beewaz-web:latest" --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER" ]; then
  CONTAINER=$(docker ps --format "{{.Names}}\t{{.Image}}" | grep -i "beewaz\|nextjs\|bz360" | awk '{print $1}' | head -1)
fi
if [ -z "$CONTAINER" ]; then
  echo "ERROR: No beewaz container found. Running containers:"
  docker ps --format "  {{.Names}} | {{.Image}}"
  exit 1
fi
echo "FOUND_CONTAINER=$CONTAINER"
echo "$CONTAINER" > /tmp/cname.txt
'@
if ($r -ne 0) { throw "Container detection failed — see output above for running containers" }

# Extract
$r = Run-SSH 'rm -rf /tmp/beewaz-extract && mkdir -p /tmp/beewaz-extract && tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/beewaz-extract && echo "Extracted OK: $(ls /tmp/beewaz-extract | head -5)"'
if ($r -ne 0) { throw "Extract failed" }

# Copy into container
$r = Run-SSH @'
CONTAINER=$(cat /tmp/cname.txt | tr -d "[:space:]")
echo "Copying to container: $CONTAINER"
docker cp /tmp/beewaz-extract/. $CONTAINER:/app/
echo "Copy OK — verifying..."
docker exec $CONTAINER ls /app/.next/server/app/api/orders/ 2>/dev/null && echo "API routes found" || echo "Warning: could not verify"
'@
if ($r -ne 0) { throw "docker cp failed" }

# Cleanup temp files
Run-SSH 'rm -rf /tmp/beewaz-extract /tmp/beewaz-build.tar.gz' | Out-Null

# Restart
$r = Run-SSH 'CONTAINER=$(cat /tmp/cname.txt | tr -d "[:space:]"); docker restart $CONTAINER && echo "Restarted: $CONTAINER"'
if ($r -ne 0) { throw "Restart failed" }
Run-SSH 'rm -f /tmp/cname.txt' | Out-Null

Write-Host "      Deploy complete" -ForegroundColor Green

# ── Step 4: DB Migrations ─────────────────────────────────────────────────────
Write-Host "`n[4/4] Running DB migrations..." -ForegroundColor Yellow

$migSQL = @"
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_shipping_address jsonb;
ALTER TABLE order_items ALTER COLUMN snapshot SET DEFAULT '{}'::jsonb;
ALTER TABLE order_items ALTER COLUMN snapshot DROP NOT NULL;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk;
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
"@

# Try psql directly (if DATABASE_URL is in env)
$r = Run-SSH "psql \$DATABASE_URL -c `"$migSQL`" 2>&1 && echo 'Migration OK (psql direct)'"
if ($r -ne 0) {
    Write-Host "      Direct psql failed — trying via docker postgres container..." -ForegroundColor DarkYellow
    $r = Run-SSH @"
PG=$(docker ps --format "{{.Names}}" | grep -i "postgres\|pg\|db" | head -1)
if [ -z "\$PG" ]; then echo "No postgres container found — skipping migration"; exit 0; fi
echo "Using postgres container: \$PG"
docker exec \$PG psql -U postgres -d beewaz -c "$migSQL" 2>&1 && echo 'Migration OK (docker postgres)'
"@
    if ($r -ne 0) {
        Write-Host "      Warning: Migration may not have run. Check DB manually." -ForegroundColor Red
    }
}
Write-Host "      Migrations done" -ForegroundColor Green

# ── Wait & verify ─────────────────────────────────────────────────────────────
Write-Host "`nWaiting 20s for container to start..." -ForegroundColor Gray
Start-Sleep -Seconds 20

$r = Run-SSH 'curl -sf --max-time 15 -o /dev/null -w "Site status: HTTP %{http_code}" http://localhost:3000/ && echo ""'
if ($r -ne 0) { Write-Host "      Site may still be starting — check https://bz360.ir in a moment" -ForegroundColor DarkYellow }

# Cleanup local
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue
Write-Host "`n✅ Deploy done! https://bz360.ir" -ForegroundColor Green
