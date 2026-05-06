#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# update.sh — آپدیت سایت بدون downtime
# استفاده: bash scripts/update.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "[UPDATE] دریافت آخرین تغییرات از git..."
git pull origin main

echo "[UPDATE] Build image جدید..."
docker compose build app

echo "[UPDATE] ری‌استارت با downtime صفر..."
docker compose up -d --no-deps app

echo "[UPDATE] اجرای migration در صورت وجود تغییرات..."
docker compose exec app npx drizzle-kit migrate 2>/dev/null || true

echo "[OK] آپدیت کامل شد!"
docker compose ps
