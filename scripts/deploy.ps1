# deploy.ps1 - Deploy latest build to bz360.ir
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

# Deploy on server - pass each command separately to avoid line ending issues
Write-Host "`n[3/3] Deploying on server..." -ForegroundColor Yellow
$target = "${SSH_USER}@${SERVER}"
$sshOpts = "-p", $SSH_PORT

ssh @sshOpts $target 'docker ps --format "{{.Names}}\t{{.Image}}" | grep "beewaz-web" | cut -f1 | head -1 > /tmp/cname.txt; echo "Container: $(cat /tmp/cname.txt)"'
ssh @sshOpts $target "mkdir -p /tmp/beewaz-extract && tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/beewaz-extract"
ssh @sshOpts $target 'CONTAINER=$(cat /tmp/cname.txt); echo "Copying to $CONTAINER"; docker cp /tmp/beewaz-extract/. $CONTAINER:/app/'
ssh @sshOpts $target "rm -rf /tmp/beewaz-extract /tmp/beewaz-build.tar.gz"
ssh @sshOpts $target 'CONTAINER=$(cat /tmp/cname.txt); docker restart $CONTAINER && echo "Restarted $CONTAINER"'
ssh @sshOpts $target "rm -f /tmp/cname.txt"
Start-Sleep -Seconds 8
ssh @sshOpts $target "curl -sf --max-time 10 -o /dev/null -w 'HTTP: %{http_code}' http://localhost:3000/ || echo 'HTTP: 000'"

# Cleanup
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue

Write-Host "`n✅ Deploy done! https://bz360.ir" -ForegroundColor Green
