#!/bin/bash
# نصب cron entry برای auto-deploy هر ۲۰ ثانیه (هر دقیقه ۳ بار)
# اجرا: bash scripts/setup-cron.sh

SCRIPT=/opt/beewaz-autodeploy.sh
CRON_ENTRY="* * * * * $SCRIPT >> /var/log/beewaz-deploy.log 2>&1"

# کپی script به /opt
cp "$(dirname "$0")/server-autodeploy.sh" "$SCRIPT"
chmod +x "$SCRIPT"

# اضافه کردن cron (اگر قبلاً نبود)
( crontab -l 2>/dev/null | grep -v "beewaz-autodeploy"; echo "$CRON_ENTRY" ) | crontab -

echo "✅ Cron set: every minute (3 checks × 20s = effective 20s interval)"
crontab -l | grep beewaz
