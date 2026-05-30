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
if (-not $WINSCP) {
    throw "WinSCP.com not found! Please install WinSCP."
}

$WS_OPEN  = "open scp://${SSH_USER}:${SSH_PASS}@${SERVER}:${SSH_PORT}/ -hostkey=*"
$WS_SCRIPT = "$env:TEMP\bz-winscp.txt"

function Invoke-WinSCP {
    param([string]$ScriptBody)
    $ScriptBody | Out-File -FilePath $WS_SCRIPT -Encoding ascii -Force
    & $WINSCP /ini=nul /script=$WS_SCRIPT
    $code = $LASTEXITCODE
    Remove-Item $WS_SCRIPT -ErrorAction SilentlyContinue
    if ($code -ne 0) { throw "WinSCP failed (exit $code)" }
}

function Invoke-SSH {
    param([string]$Command)
    Invoke-WinSCP "$WS_OPEN`ncall $Command`nexit"
}

function Invoke-SCP {
    param([string]$LocalPath, [string]$RemotePath)
    Invoke-WinSCP "$WS_OPEN`nput `"$LocalPath`" `"$RemotePath`"`nexit"
}

Write-Host "=== Beewaz Deploy ===" -ForegroundColor Cyan

# Step 1: Download build
Write-Host "`n[1/3] Downloading build from GitHub..." -ForegroundColor Yellow
curl.exe -L -o $LOCAL_FILE $RELEASE_URL
if ($LASTEXITCODE -ne 0) { throw "Download failed" }
$size = [math]::Round((Get-Item $LOCAL_FILE).Length / 1MB, 1)
Write-Host "      Downloaded: ${size} MB" -ForegroundColor Green

# Step 2: Upload to server
Write-Host "`n[2/3] Uploading to server..." -ForegroundColor Yellow
Invoke-SCP $LOCAL_FILE "/tmp/beewaz-build.tar.gz"
Write-Host "      Upload complete" -ForegroundColor Green

# Step 3: Deploy on server
Write-Host "`n[3/3] Deploying on server..." -ForegroundColor Yellow

Invoke-SSH 'docker ps --filter "ancestor=ghcr.io/ahmadi98ir/beewaz-web:latest" --format "{{.Names}}" | head -1 > /tmp/cname.txt'
Invoke-SSH "mkdir -p /tmp/beewaz-extract"
Invoke-SSH "tar -xzf /tmp/beewaz-build.tar.gz -C /tmp/beewaz-extract"
Invoke-SSH 'CONTAINER=$(cat /tmp/cname.txt); docker cp /tmp/beewaz-extract/. $CONTAINER:/app/'
Invoke-SSH "rm -rf /tmp/beewaz-extract /tmp/beewaz-build.tar.gz"
Invoke-SSH 'CONTAINER=$(cat /tmp/cname.txt); docker restart $CONTAINER'
Invoke-SSH "rm -f /tmp/cname.txt"

Start-Sleep -Seconds 25

Write-Host "`n[OK] Checking site..." -ForegroundColor Yellow
try {
    "$WS_OPEN`ncall curl -sf --max-time 15 -o /dev/null -w 'HTTP %{http_code}' http://localhost:3000/`nexit" | Out-File -FilePath $WS_SCRIPT -Encoding ascii -Force
    & $WINSCP /ini=nul /script=$WS_SCRIPT
    Remove-Item $WS_SCRIPT -ErrorAction SilentlyContinue
} catch {
    Write-Host "      (site still starting up, check https://bz360.ir in a moment)" -ForegroundColor DarkYellow
}

# Cleanup
Remove-Item $LOCAL_FILE -ErrorAction SilentlyContinue

Write-Host "`nDeploy done! https://bz360.ir" -ForegroundColor Green
