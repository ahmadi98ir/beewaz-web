# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories \
 && apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --include=dev

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# متغیرهای محیطی مورد نیاز در build time
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories \
 && apk upgrade --no-cache \
 && apk add --no-cache su-exec

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# کاربر غیر root برای امنیت بیشتر
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# کپی فایل‌های استاتیک
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# کپی standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی migration files (توسط instrumentation.ts در startup اجرا می‌شن)
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./migrations

# entrypoint — permission را روی volume mount تنظیم می‌کند
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]
