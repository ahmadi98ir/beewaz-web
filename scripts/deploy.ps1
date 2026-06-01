# deploy.ps1 - Deploy latest build to bz360.ir
$ErrorActionPreference = "Stop"

$RELEASE_URL = "https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-build.tar.gz"
$SERVER      = "78.157.51.14"
$SSH_PORT    = "8443"
$SSH_USER    = "root"
$SSH_PASS    = "1"
$LOCAL_FILE  = "$env:TEMP\beewaz-build.tar.gz"

$winscpPaths = @(
    "C:\Program Files (x86)\WinSCP\WinSCP.com",
    "C:\Program Files\WinSCP\WinSCP.com",
    "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"
)
$WINSCP = $winscpPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $WINSCP) { throw "WinSCP.com not found!" }

$WS_SCRIPT = "$env:TEMP\bz-winscp.txt"
$WS_OPEN   = "open scp://${SSH_USER}:${SSH_PASS}@${SERVER}:${SSH_PORT}/ -hostkey=*"

function Run-SSH {
    param([string]$Cmd)
    "$WS_OPEN`ncall set -e; $Cmd`nexit" | Out-File $WS_SCRIPT -Encoding ascii -Force
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

Write-Host "`n[1/4] Downloading..." -ForegroundColor Yellow
curl.exe -L --progress-bar -o $LOCAL_FILE $RELEASE_URL
if ($LASTEXITCODE -ne 0) { throw "Download failed" }
Write-Host "      OK" -ForegroundColor Green

Write-Host "`n[2/4] Uploading..." -ForegroundColor Yellow
$r = Run-SCP $LOCAL_FILE "/tmp/beewaz-build.tar.gz"
if ($r -ne 0) { throw "Upload failed" }
Write-Host "      OK" -ForegroundColor Green

Write-Host "`n[3/4] Deploying..." -ForegroundColor Yellow

$detectScript = @"
CONTAINER=`$(docker ps --filter "ancestor=ghcr.io/ahmadi98ir/beewaz-web:latest" --format "{{.Names}}" | head -1)
if [ -z "`$CONTAINER" ]; then
  CONTAINER=`$(docker ps --format "{{.Names}}\t{{.Image}}" | grep -i "beewaz" | awk '{print `$1}' | head -1)
fi
if [ -z "`$CONTAINER" ]; then echo "ERROR: no container"; docker ps; exit 1; fi
echo "Container: `$CONTAINER"
echo "`$CONTAINER" > /tmp/cname.txt
"@
$r = Run-SSH $detectScript
if ($r -ne 0) { throw "Container not found" }

$r = Run-SSH 'rm -rf /tmp/bz && mkdir -p /tmp/bz && tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/bz'
if ($r -ne 0) { throw "Extract failed" }

$copyScript = @"
C=`$(cat /tmp/cname.txt | tr -d '[:space:]')
docker cp /tmp/bz/. `${C}:/app/
echo "Copy OK"
"@
$r = Run-SSH $copyScript
if ($r -ne 0) { throw "Copy failed" }

Run-SSH 'rm -rf /tmp/bz /tmp/beewaz-build.tar.gz' | Out-Null

$restartScript = @"
C=`$(cat /tmp/cname.txt | tr -d '[:space:]')
docker restart `$C
"@
$r = Run-SSH $restartScript
if ($r -ne 0) { throw "Restart failed" }
Run-SSH 'rm -f /tmp/cname.txt' | Out-Null
Write-Host "      OK" -ForegroundColor Green

Write-Host "`nWaiting 20s..." -ForegroundColor Gray
Start-Sleep -Seconds 20
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue
Write-Host "`nDone! https://bz360.ir" -ForegroundColor Green