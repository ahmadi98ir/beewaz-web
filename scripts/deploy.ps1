# deploy.ps1 - Deploy latest build to bz360.ir
$ErrorActionPreference = "Stop"

$RELEASE_URL = "https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-build.tar.gz"
$SERVER      = "78.157.51.14"
$SSH_PORT    = "8443"
$SSH_USER    = "root"
$SSH_PASS    = "1"
$LOCAL_FILE  = "$env:TEMP\beewaz-build.tar.gz"

# Check sshpass equivalent (plink) or use built-in SSH with key
# Use sshpass if available, otherwise fall back to SSH_ASKPASS trick
function Invoke-SSH {
    param([string]$Command)
    $env:SSHPASS = $SSH_PASS
    if (Get-Command "sshpass" -ErrorAction SilentlyContinue) {
        sshpass -e ssh -o StrictHostKeyChecking=no -p $SSH_PORT "${SSH_USER}@${SERVER}" $Command
    } else {
        # Use plink (PuTTY) if available
        if (Get-Command "plink" -ErrorAction SilentlyContinue) {
            plink -ssh -P $SSH_PORT -l $SSH_USER -pw $SSH_PASS -batch "${SERVER}" $Command
        } else {
            ssh -o StrictHostKeyChecking=no -p $SSH_PORT "${SSH_USER}@${SERVER}" $Command
        }
    }
}

function Invoke-SCP {
    param([string]$LocalPath, [string]$RemotePath)
    if (Get-Command "sshpass" -ErrorAction SilentlyContinue) {
        $env:SSHPASS = $SSH_PASS
        sshpass -e scp -o StrictHostKeyChecking=no -P $SSH_PORT $LocalPath "${SSH_USER}@${SERVER}:${RemotePath}"
    } elseif (Get-Command "pscp" -ErrorAction SilentlyContinue) {
        pscp -P $SSH_PORT -pw $SSH_PASS $LocalPath "${SSH_USER}@${SERVER}:${RemotePath}"
    } else {
        scp -o StrictHostKeyChecking=no -P $SSH_PORT $LocalPath "${SSH_USER}@${SERVER}:${RemotePath}"
    }
}

Write-Host "=== Beewaz Deploy ===" -ForegroundColor Cyan

# Download build from GitHub Release
Write-Host "`n[1/3] Downloading build from GitHub..." -ForegroundColor Yellow
curl.exe -L -o $LOCAL_FILE $RELEASE_URL
if ($LASTEXITCODE -ne 0) { throw "Download failed" }
$size = [math]::Round((Get-Item $LOCAL_FILE).Length / 1MB, 1)
Write-Host "      Downloaded: ${size} MB" -ForegroundColor Green

# Upload to server
Write-Host "`n[2/3] Uploading to server..." -ForegroundColor Yellow
Invoke-SCP $LOCAL_FILE "/tmp/beewaz-build.tar.gz"
Write-Host "      Upload complete" -ForegroundColor Green

# Deploy on server
Write-Host "`n[3/3] Deploying on server..." -ForegroundColor Yellow

Invoke-SSH 'docker ps --filter "ancestor=ghcr.io/ahmadi98ir/beewaz-web:latest" --format "{{.Names}}" | head -1 > /tmp/cname.txt; echo "Container: $(cat /tmp/cname.txt)"'
Invoke-SSH "mkdir -p /tmp/beewaz-extract && tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/beewaz-extract"
Invoke-SSH 'CONTAINER=$(cat /tmp/cname.txt); echo "Copying to $CONTAINER"; docker cp /tmp/beewaz-extract/. $CONTAINER:/app/'
Invoke-SSH "rm -rf /tmp/beewaz-extract /tmp/beewaz-build.tar.gz"
Invoke-SSH 'CONTAINER=$(cat /tmp/cname.txt); docker restart $CONTAINER && echo "Restarted $CONTAINER"'
Invoke-SSH "rm -f /tmp/cname.txt"
Start-Sleep -Seconds 8
Invoke-SSH "curl -sf --max-time 10 -o /dev/null -w 'HTTP: %{http_code}' http://localhost:3000/ || echo 'HTTP: 000'"

# Cleanup
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue

Write-Host "`n✅ Deploy done! https://bz360.ir" -ForegroundColor Green
