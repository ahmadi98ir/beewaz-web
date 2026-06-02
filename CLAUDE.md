# Beewaz Web — Project Memory

این فایل حافظه بلند‌مدت پروژه است. Claude Code آن را در شروع هر session می‌خواند.

---

## مشخصات پروژه

- **نام:** Beewaz Web (`beewaz-web`)
- **مسیر:** `C:\Users\user\Music\beewaz-web`
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + NextAuth v5 + Prisma + PostgreSQL
- **جهت:** RTL (فارسی) — همه اعداد باید با `toFaDigits()` نمایش داده شوند
- **GitHub:** `https://github.com/ahmadi98ir/beewaz-web`

---

## سرور و دیپلوی

| مورد | مقدار |
|------|-------|
| IP سرور | `78.157.51.14` |
| پنل Coolify | `http://78.157.51.14:8000` |
| Coolify Token | `5\|beewaz-deploy-fix-2026` |
| App UUID | `jw4kpfn8utdybrmwkr80fm8f` |
| FQDN سایت | `https://beewaz.ir` |
| Image | `ghcr.io/ahmadi98ir/beewaz-web:latest` |

### فرآیند دیپلوی (اجباری — ghcr.io روی سرور ایران بلاک است)

1. **Push به GitHub** → GitHub Actions بیلد Docker image و آپلود به Release `deploy-cache`
2. **بررسی وضعیت بیلد:** از HTML صفحه `https://github.com/ahmadi98ir/beewaz-web/actions` بخوان (نه API — rate limit دارد)
3. **دانلود image:**
   ```
   https://github.com/ahmadi98ir/beewaz-web/releases/download/deploy-cache/beewaz-image.tar.gz
   ```
4. **آپلود به سرور** با اسکریپت:
   ```
   C:\Users\user\AppData\Local\Temp\upload-chunks.ps1
   ```
   (chunk 5MB — دور زدن DPI)
5. اسکریپت خودکار: docker load → Coolify rolling restart

#### Image Receiver روی سرور
- آدرس: `http://78.157.51.14:5001`
- Token: `fb16cb5761ce143879dce87e69d551a0cca50e33`

#### نکات مهم دیپلوی
- وضعیت `running:unknown` در Coolify API **نرمال است** — سایت آنلاین است
- برای چک سایت از `http://beewaz.ir` استفاده کن (نه IP مستقیم روی 80)
- GitHub Actions بیلد ~5-7 دقیقه طول می‌کشد

---

## معماری

### احراز هویت (NextAuth v5)
- OTP-based با SMS از `api.sms.ir`
- **DNS hardcode در `/etc/hosts` سرور:** `185.211.56.44 api.sms.ir`
- جدول `phone_otps` در PostgreSQL — با post-deployment script ساخته می‌شود
- Session: JWT | Provider: `credentials` (phone + otp)
- Server-side: `auth()` | Client-side: `useSession()`
- بعد از ورود: **`window.location.href`** (نه `router.push`) تا cookie درست set شود

### قیمت‌ها
- DB: **ریال** | نمایش: **تومان**
- فرمول: `Math.floor(rial / 10).toLocaleString('fa-IR') + ' تومان'`
- تابع: `formatPrice(rial)` در `src/lib/utils.ts`
- آستانه ارسال رایگان: **۲٬۰۰۰٬۰۰۰ ریال** | هزینه ارسال: **۱۵۰٬۰۰۰ ریال**

### سبد خرید شناور
- Zustand store (`src/stores/cart`) — persist فقط `items` به localStorage
- FloatingCart: پنل از **سمت چپ** (`left-0`، `-translate-x-full`)
- باز کردن: `openCart()` از store

---

## فایل‌های کلیدی

| فایل | توضیح |
|------|-------|
| `src/lib/utils.ts` | `formatPrice`, `toFaDigits`, `toEnDigits`, `formatToman` |
| `src/stores/cart.ts` | Zustand cart store |
| `src/app/login/login-form.tsx` | فرم OTP دو مرحله‌ای |
| `src/app/profile/page.tsx` | پروفایل + باشگاه مشتریان (loyalty tiers) |
| `src/app/profile/complete/page.tsx` | تکمیل ثبت‌نام (first-time users) |
| `src/app/checkout/checkout-client.tsx` | تکمیل خرید با آدرس ساختاریافته |
| `src/app/api/orders/route.ts` | API ثبت سفارش + Zod validation |
| `src/components/layout/floating-cart.tsx` | سبد خرید شناور (left-side) |
| `src/components/layout/header/user-button.tsx` | دکمه پروفایل/ورود در هدر |
| `src/components/layout/header/cart-button.tsx` | دکمه سبد → openCart |
| `src/app/layout.tsx` | Root layout با AppSessionProvider + FloatingCart |

---

## ساختار آدرس checkout

```
استان | شهر | خیابان اصلی | خیابان فرعی (اختیاری) | پلاک | واحد (اختیاری) | کد پستی (۱۰ رقم)
```
- شماره موبایل از **session** می‌آید (نه ورودی کاربر)
- کد پستی: `toEnDigits()` قبل از validation (قبول هر دو فارسی و لاتین)

---

## مشکلات رفع‌شده

1. **OTP redirect loop:** `window.location.href` به جای `router.push`
2. **جدول phone_otps:** با post-deployment Node.js script ساخته می‌شود
3. **DNS بلاک api.sms.ir:** hardcode در `/etc/hosts` سرور
4. **قیمت‌ها:** همه به تومان کامل (بدون اختصار)
5. **سبد شناور:** از راست به **چپ** منتقل شد
6. **آدرس checkout:** از یک textarea به ۶ فیلد ساختاریافته
7. **شماره تلفن تکراری در checkout:** حذف — از session می‌آید
8. **اعداد فارسی:** همه اعداد نمایشی با `toFaDigits()` یا `toLocaleString('fa-IR')`

---

## قوانین توسعه

- همه اعداد نمایشی سایت **فارسی** باشند (`toFaDigits`)
- قیمت‌ها همیشه با `formatPrice(rial)` نمایش داده شوند
- هیچ‌وقت `router.push` بعد از login نه — از `window.location.href` استفاده کن
- آستانه ارسال رایگان در floating-cart و checkout باید **یکسان** باشند (۲٬۰۰۰٬۰۰۰ ریال)
