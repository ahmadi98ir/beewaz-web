# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM docker.arvancloud.ir/library/node:22-alpine AS deps
WORKDIR /app

# نصب ابزارهای لازم برای build native packages
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM docker.arvancloud.ir/library/node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# متغیرهای محیطی مورد نیاز در build time
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM docker.arvancloud.ir/library/node:22-alpine AS runner
WORKDIR /app

RUN apk upgrade --no-cache

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# کاربر غیر root برای امنیت بیشتر
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# کپی فایل‌های استاتیک
COPY --from=builder /app/public ./public

# کپی standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی migration files (توسط instrumentation.ts در startup اجرا می‌شن)
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./migrations

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
