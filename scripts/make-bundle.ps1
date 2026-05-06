# ─────────────────────────────────────────────────────────────────────────────
# make-bundle.ps1 — ساخت بسته آفلاین برای انتقال به سرور
# اجرا: powershell -ExecutionPolicy Bypass -File scripts\make-bundle.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$BundleDir = "beewaz-bundle"
$ZipFile   = "beewaz-bundle.zip"

Write-Host ""
Write-Host "  بیواز — ساخت بسته آفلاین" -ForegroundColor Cyan
Write-Host "  ─────────────────────────" -ForegroundColor Cyan
Write-Host ""

# ── بررسی Docker ──────────────────────────────────────────────────────────────
Write-Host "[1/6] بررسی Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker نصب نیست. ابتدا Docker Desktop را نصب کن."
}
Write-Host "      Docker موجود است." -ForegroundColor Green

# ── Build ایمیج اپ ────────────────────────────────────────────────────────────
Write-Host "[2/6] Build ایمیج Next.js (چند دقیقه طول می‌کشد)..." -ForegroundColor Yellow
docker build -t beewaz-app:latest .
Write-Host "      Build کامل شد." -ForegroundColor Green

# ── Pull ایمیج‌های پایه ───────────────────────────────────────────────────────
Write-Host "[3/6] دریافت ایمیج‌های پایه..." -ForegroundColor Yellow
docker pull postgres:16-alpine
docker pull nginx:1.27-alpine
Write-Host "      ایمیج‌ها دریافت شدند." -ForegroundColor Green

# ── ذخیره ایمیج‌ها به فایل tar ────────────────────────────────────────────────
Write-Host "[4/6] ذخیره ایمیج‌ها در فایل..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$BundleDir\images" | Out-Null

docker save beewaz-app:latest   -o "$BundleDir\images\app.tar"
docker save postgres:16-alpine  -o "$BundleDir\images\postgres.tar"
docker save nginx:1.27-alpine   -o "$BundleDir\images\nginx.tar"

Write-Host "      ایمیج‌ها ذخیره شدند." -ForegroundColor Green

# ── کپی فایل‌های مورد نیاز ────────────────────────────────────────────────────
Write-Host "[5/6] کپی فایل‌های پروژه..." -ForegroundColor Yellow

Copy-Item "docker-compose.yml"  "$BundleDir\"
Copy-Item ".env.example"        "$BundleDir\"
New-Item -ItemType Directory -Force -Path "$BundleDir\nginx" | Out-Null
Copy-Item "nginx\default.conf"  "$BundleDir\nginx\"
New-Item -ItemType Directory -Force -Path "$BundleDir\nginx\certs" | Out-Null
New-Item -ItemType Directory -Force -Path "$BundleDir\scripts" | Out-Null
Copy-Item "scripts\install-offline.sh" "$BundleDir\scripts\"

# ساخت فایل راهنما داخل بسته
@'
راهنمای نصب آفلاین بیواز
=========================

قدم ۱: انتقال
--------------
این پوشه را به سرور منتقل کن (USB یا SCP از شبکه داخلی).

قدم ۲: نصب Docker روی سرور (اگر نصب نیست)
-------------------------------------------
فایل‌های docker-offline/ را از USB کپی کن و اجرا کن:
  cd docker-offline
  dpkg -i *.deb

قدم ۳: ساختن .env
------------------
  cp .env.example .env
  nano .env
  (مقادیر POSTGRES_PASSWORD، AUTH_SECRET، ADMIN_PHONE، ADMIN_PASSWORD را تنظیم کن)

قدم ۴: SSL Certificate
-----------------------
فایل‌های fullchain.pem و privkey.pem را در nginx/certs/ کپی کن.
اگر ندارید، self-signed بساز:
  mkdir -p nginx/certs
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/certs/privkey.pem \
    -out nginx/certs/fullchain.pem \
    -subj '/CN=beewaz.ir'

قدم ۵: نصب
-----------
  bash scripts/install-offline.sh

قدم ۶: ورود
-----------
  https://YOUR_SERVER_IP یا https://beewaz.ir
  ادمین: /admin
'@ | Out-File -Encoding UTF8 "$BundleDir\README.txt"

Write-Host "      فایل‌ها کپی شدند." -ForegroundColor Green

# ── ساخت فایل zip ─────────────────────────────────────────────────────────────
Write-Host "[6/6] فشرده‌سازی بسته..." -ForegroundColor Yellow
if (Test-Path $ZipFile) { Remove-Item $ZipFile }
Compress-Archive -Path "$BundleDir\*" -DestinationPath $ZipFile
Write-Host "      بسته ساخته شد." -ForegroundColor Green

# ── اطلاعات نهایی ─────────────────────────────────────────────────────────────
$size = [math]::Round((Get-Item $ZipFile).Length / 1MB, 1)
Write-Host ""
Write-Host "  ✅ بسته آماده انتقال!" -ForegroundColor Green
Write-Host ""
Write-Host "  فایل:  $ZipFile" -ForegroundColor White
Write-Host "  حجم:   $size MB" -ForegroundColor White
Write-Host ""
Write-Host "  مرحله بعد: این فایل zip را به سرور منتقل کن" -ForegroundColor Cyan
Write-Host "  (USB، SCP از شبکه داخلی، یا هر روش دیگری)" -ForegroundColor Cyan
Write-Host ""
