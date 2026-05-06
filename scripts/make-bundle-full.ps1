# ─────────────────────────────────────────────────────────────────────────────
# make-bundle-full.ps1
# ساخت بسته کامل آفلاین برای Ubuntu 24.04 بدون اینترنت
# شامل: Docker packages + Coolify + Beewaz
#
# اجرا:
#   powershell -ExecutionPolicy Bypass -File scripts\make-bundle-full.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$BundleDir = "beewaz-full-bundle"
$ZipFile   = "beewaz-full-bundle.zip"

function Write-Step($n, $msg) { Write-Host "[$n] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)       { Write-Host "    ✓ $msg" -ForegroundColor Green }
function Write-Warn($msg)     { Write-Host "    ! $msg" -ForegroundColor Yellow }
function Write-Err($msg)      { Write-Host "    ✗ $msg" -ForegroundColor Red; exit 1 }

Clear-Host
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   بیواز — ساخت بسته کامل آفلاین         ║" -ForegroundColor Cyan
Write-Host "  ║   Ubuntu 24.04 + Docker + Coolify        ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── بررسی Docker ──────────────────────────────────────────────────────────────
Write-Step "1/8" "بررسی Docker Desktop..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker Desktop نصب نیست. از https://docker.com نصب کن."
}
Write-Ok "Docker موجود است."

# ── پاکسازی و ساخت پوشه‌ها ───────────────────────────────────────────────────
Write-Step "2/8" "آماده‌سازی پوشه‌ها..."
if (Test-Path $BundleDir) { Remove-Item -Recurse -Force $BundleDir }
New-Item -ItemType Directory -Force -Path "$BundleDir\docker-packages" | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\images\beewaz"   | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\images\coolify"  | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\nginx\certs"     | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\scripts"         | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\coolify"         | Out-Null
Write-Ok "پوشه‌ها ساخته شدند."

# ── دانلود پکیج‌های Docker برای Ubuntu 24.04 ──────────────────────────────────
Write-Step "3/8" "دانلود پکیج‌های Docker برای Ubuntu 24.04 (Noble)..."

$DockerBaseUrl = "https://download.docker.com/linux/ubuntu/dists/noble/pool/stable/amd64"

# آخرین نسخه‌های پایدار برای Ubuntu 24.04
$DockerPackages = @(
    "containerd.io_1.7.24-1_amd64.deb",
    "docker-ce-cli_27.4.0-1~ubuntu.24.04~noble_amd64.deb",
    "docker-ce_27.4.0-1~ubuntu.24.04~noble_amd64.deb",
    "docker-buildx-plugin_0.19.3-1~ubuntu.24.04~noble_amd64.deb",
    "docker-compose-plugin_2.32.1-1~ubuntu.24.04~noble_amd64.deb"
)

foreach ($pkg in $DockerPackages) {
    $url  = "$DockerBaseUrl/$pkg"
    $dest = "$BundleDir\docker-packages\$pkg"
    Write-Host "    دانلود $pkg ..." -ForegroundColor Gray
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        Write-Ok "$pkg"
    } catch {
        Write-Warn "نسخه $pkg یافت نشد — جستجوی خودکار..."
        # اگر نسخه تغییر کرده بود، لیست رو بگیر و آخرین رو دانلود کن
        try {
            $listPage = Invoke-WebRequest -Uri $DockerBaseUrl -UseBasicParsing
            $pkgBase  = ($pkg -split "_")[0]
            $latestPkg = ($listPage.Links.href | Where-Object { $_ -like "*$pkgBase*noble*amd64.deb*" } | Sort-Object | Select-Object -Last 1) -replace ".*/",""
            if ($latestPkg) {
                Invoke-WebRequest -Uri "$DockerBaseUrl/$latestPkg" -OutFile "$BundleDir\docker-packages\$latestPkg" -UseBasicParsing
                Write-Ok "$latestPkg (جایگزین)"
            } else {
                Write-Warn "$pkgBase پیدا نشد — بعداً دستی اضافه کن"
            }
        } catch {
            Write-Warn "خطا در دانلود $pkg"
        }
    }
}

Write-Ok "پکیج‌های Docker دانلود شدند."

# ── Build ایمیج Beewaz ────────────────────────────────────────────────────────
Write-Step "4/8" "Build ایمیج Beewaz (چند دقیقه)..."
docker build -t beewaz-app:latest .
Write-Ok "Build کامل شد."

# ── Pull ایمیج‌های Beewaz ─────────────────────────────────────────────────────
Write-Step "5/8" "دانلود ایمیج‌های مورد نیاز Beewaz..."
docker pull postgres:16-alpine
docker pull nginx:1.27-alpine
Write-Ok "ایمیج‌های Beewaz آماده شدند."

# ── Pull ایمیج‌های Coolify ────────────────────────────────────────────────────
Write-Step "6/8" "دانلود ایمیج‌های Coolify..."

$CoolifyImages = @(
    "ghcr.io/coollabsio/coolify:latest",
    "ghcr.io/coollabsio/coolify-helper:latest",
    "postgres:15-alpine",
    "redis:7-alpine",
    "traefik:v3.1",
    "quay.io/soketi/soketi:1.6-16-alpine"
)

foreach ($img in $CoolifyImages) {
    Write-Host "    pull $img ..." -ForegroundColor Gray
    docker pull $img
    Write-Ok $img
}
Write-Ok "ایمیج‌های Coolify دانلود شدند."

# ── ذخیره ایمیج‌ها به tar ─────────────────────────────────────────────────────
Write-Step "7/8" "ذخیره ایمیج‌ها در فایل tar..."

Write-Host "    ذخیره beewaz images..." -ForegroundColor Gray
docker save beewaz-app:latest  -o "$BundleDir\images\beewaz\app.tar"
docker save postgres:16-alpine -o "$BundleDir\images\beewaz\postgres16.tar"
docker save nginx:1.27-alpine  -o "$BundleDir\images\beewaz\nginx.tar"

Write-Host "    ذخیره coolify images..." -ForegroundColor Gray
docker save ghcr.io/coollabsio/coolify:latest        -o "$BundleDir\images\coolify\coolify.tar"
docker save ghcr.io/coollabsio/coolify-helper:latest -o "$BundleDir\images\coolify\coolify-helper.tar"
docker save postgres:15-alpine                        -o "$BundleDir\images\coolify\postgres15.tar"
docker save redis:7-alpine                            -o "$BundleDir\images\coolify\redis.tar"
docker save traefik:v3.1                              -o "$BundleDir\images\coolify\traefik.tar"
docker save quay.io/soketi/soketi:1.6-16-alpine       -o "$BundleDir\images\coolify\soketi.tar"

Write-Ok "همه ایمیج‌ها ذخیره شدند."

# ── کپی فایل‌های پروژه ────────────────────────────────────────────────────────
Write-Step "8/8" "بسته‌بندی فایل‌های پروژه..."

Copy-Item "docker-compose.yml" "$BundleDir\"
Copy-Item ".env.example"       "$BundleDir\"
Copy-Item "nginx\default.conf" "$BundleDir\nginx\"
Copy-Item "scripts\install-docker-offline.sh"   "$BundleDir\scripts\"
Copy-Item "scripts\install-coolify-offline.sh"  "$BundleDir\scripts\"
Copy-Item "scripts\install-offline.sh"          "$BundleDir\scripts\"

# docker-compose Coolify
$coolifyCompose = @'
# docker-compose.yml برای Coolify
# این فایل توسط install-coolify-offline.sh استفاده می‌شود
services:
  coolify:
    image: ghcr.io/coollabsio/coolify:latest
    container_name: coolify
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      APP_ID: "beewaz-coolify"
      APP_KEY: "base64:CHANGE_THIS_KEY_32_CHARS_LONG_XXX="
      APP_NAME: "Coolify"
      APP_ENV: "production"
      APP_DEBUG: "false"
      DB_CONNECTION: "pgsql"
      DB_HOST: "postgres"
      DB_PORT: "5432"
      DB_DATABASE: "coolify"
      DB_USERNAME: "coolify"
      DB_PASSWORD: "${COOLIFY_DB_PASSWORD:-coolify_secret_change_me}"
      REDIS_HOST: "redis"
      REDIS_PASSWORD: "${COOLIFY_REDIS_PASSWORD:-redis_secret_change_me}"
      HORIZON_BALANCE: "auto"
      PUSHER_HOST: "soketi"
      PUSHER_BACKEND_HOST: "soketi"
      PUSHER_PORT: "6001"
      PUSHER_BACKEND_PORT: "6001"
      PUSHER_SCHEME: "http"
      PUSHER_APP_ID: "coolify"
      PUSHER_APP_KEY: "coolify"
      PUSHER_APP_SECRET: "coolify"
    ports:
      - "8000:80"
    volumes:
      - coolify-data:/var/www/html/storage
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - coolify

  postgres:
    image: postgres:15-alpine
    container_name: coolify-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: coolify
      POSTGRES_PASSWORD: "${COOLIFY_DB_PASSWORD:-coolify_secret_change_me}"
      POSTGRES_DB: coolify
    volumes:
      - coolify-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U coolify"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - coolify

  redis:
    image: redis:7-alpine
    container_name: coolify-redis
    restart: unless-stopped
    command: redis-server --requirepass "${COOLIFY_REDIS_PASSWORD:-redis_secret_change_me}"
    volumes:
      - coolify-redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - coolify

  soketi:
    image: quay.io/soketi/soketi:1.6-16-alpine
    container_name: coolify-soketi
    restart: unless-stopped
    environment:
      SOKETI_DEBUG: "false"
      SOKETI_DEFAULT_APP_ID: "coolify"
      SOKETI_DEFAULT_APP_KEY: "coolify"
      SOKETI_DEFAULT_APP_SECRET: "coolify"
    networks:
      - coolify

  traefik:
    image: traefik:v3.1
    container_name: coolify-proxy
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.http.address=:80"
      - "--entrypoints.https.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - coolify-proxy:/etc/traefik
    networks:
      - coolify

volumes:
  coolify-data:
  coolify-db:
  coolify-redis:
  coolify-proxy:

networks:
  coolify:
    driver: bridge
'@
$coolifyCompose | Out-File -Encoding UTF8 "$BundleDir\coolify\docker-compose.yml"

# ── فشرده‌سازی ─────────────────────────────────────────────────────────────────
if (Test-Path $ZipFile) { Remove-Item $ZipFile }
Compress-Archive -Path "$BundleDir\*" -DestinationPath $ZipFile

# ── اطلاعات نهایی ─────────────────────────────────────────────────────────────
$size  = [math]::Round((Get-Item $ZipFile).Length / 1GB, 2)
$files = (Get-ChildItem -Recurse $BundleDir).Count

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║          ✅ بسته آماده انتقال!           ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  فایل:    $ZipFile" -ForegroundColor White
Write-Host "  حجم:     $size GB" -ForegroundColor White
Write-Host "  فایل‌ها: $files عدد" -ForegroundColor White
Write-Host ""
Write-Host "  مرحله بعد:" -ForegroundColor Cyan
Write-Host "  1. این فایل را با USB یا شبکه داخلی به سرور منتقل کن" -ForegroundColor White
Write-Host "  2. روی سرور: bash scripts/install-docker-offline.sh" -ForegroundColor White
Write-Host "  3. روی سرور: bash scripts/install-coolify-offline.sh" -ForegroundColor White
Write-Host ""
