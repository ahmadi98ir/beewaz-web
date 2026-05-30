# auto-deploy.ps1
# Usage: .\scripts\auto-deploy.ps1
# After every "git push", this script waits for GitHub Actions to finish
# and automatically runs deploy.ps1

$REPO_API = "https://api.github.com/repos/ahmadi98ir/beewaz-web/releases/tags/deploy-cache"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Beewaz Auto Deploy Watcher ===" -ForegroundColor Cyan
Write-Host "Watching for new builds on GitHub..." -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray

# Get current deployed SHA
$lastDeployedSha = ""

function Get-LatestReleaseSha {
    try {
        $release = Invoke-RestMethod -Uri $REPO_API -UseBasicParsing -TimeoutSec 10
        return $release.name -replace "Deploy Cache \(([a-f0-9]+)\)", '$1'
    } catch {
        return $null
    }
}

function Get-LocalHead {
    return (git rev-parse --short HEAD 2>$null)
}

# Initialize with current release SHA
$lastDeployedSha = Get-LatestReleaseSha
Write-Host "Current release: $lastDeployedSha" -ForegroundColor DarkGray

while ($true) {
    Start-Sleep -Seconds 20

    $localHead = Get-LocalHead
    $releaseSha = Get-LatestReleaseSha

    if ($null -eq $releaseSha) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Cannot reach GitHub..." -ForegroundColor DarkGray
        continue
    }

    # Check if local commits ahead of last deploy
    $aheadCount = (git rev-list "$($lastDeployedSha)..HEAD" 2>$null | Measure-Object -Line).Lines

    if ($releaseSha -ne $lastDeployedSha) {
        Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] New build detected: $releaseSha" -ForegroundColor Green
        Write-Host "Deploying automatically..." -ForegroundColor Yellow

        & "$SCRIPT_DIR\deploy.ps1"

        $lastDeployedSha = $releaseSha
        Write-Host "`nWatching for next build..." -ForegroundColor Gray
    } else {
        # Show waiting indicator if there are unpushed/undeployed commits
        if ($aheadCount -gt 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Waiting for build ($aheadCount commit(s) ahead)..." -ForegroundColor DarkYellow
        }
    }
}
