# deploy.ps1 - Deploy latest build to bz360.ir
# Usage: .\deploy.ps1
# Run from your Windows machine after GitHub Actions build completes

$ErrorActionPreference = "Stop"

$RELEASE_URL = "https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-build.tar.gz"
$SERVER      = "78.157.51.14"
$SSH_PORT    = "8443"
$SSH_USER    = "root"
$LOCAL_FILE  = "$env:TEMP\beewaz-build.tar.gz"

Write-Host "=== Beewaz Deploy ===" -ForegroundColor Cyan

# Download build from GitHub Release
Write-Host "`n[1/3] Downloading build from GitHub..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $RELEASE_URL -OutFile $LOCAL_FILE -UseBasicParsing
$size = [math]::Round((Get-Item $LOCAL_FILE).Length / 1MB, 1)
Write-Host "      Downloaded: ${size} MB" -ForegroundColor Green

# Upload to server
Write-Host "`n[2/3] Uploading to server..." -ForegroundColor Yellow
scp -P $SSH_PORT "$LOCAL_FILE" "${SSH_USER}@${SERVER}:/tmp/beewaz-build.tar.gz"
Write-Host "      Upload complete" -ForegroundColor Green

# Deploy on server
Write-Host "`n[3/3] Deploying on server..." -ForegroundColor Yellow
$deployScript = @'
set -e
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i beewaz | head -1)
echo "Container: $CONTAINER"
mkdir -p /tmp/beewaz-extract
tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/beewaz-extract
docker cp /tmp/beewaz-extract/. "$CONTAINER:/app/"
rm -rf /tmp/beewaz-extract /tmp/beewaz-build.tar.gz
docker restart "$CONTAINER"
sleep 5
HTTP=$(curl -sf --max-time 10 -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
echo "Site HTTP: $HTTP"
echo "Deploy complete!"
'@

ssh -p $SSH_PORT "${SSH_USER}@${SERVER}" $deployScript

# Cleanup
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue

Write-Host "`n✅ Deploy done! https://bz360.ir" -ForegroundColor Green
