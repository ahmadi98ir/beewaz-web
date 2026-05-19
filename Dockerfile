# Stage 1: Dependencies
FROM docker.arvancloud.ir/library/node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/  && (npm ci --include=dev     || (echo "retry 1..." && sleep 30 && npm ci --include=dev)     || (echo "retry 2 via mirror..." && sleep 60         && npm config set registry https://registry.npmmirror.com/         && npm ci --include=dev))

# Stage 2: Builder
FROM docker.arvancloud.ir/library/node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM docker.arvancloud.ir/library/node:22-alpine AS runner
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache su-exec
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs  && adduser  --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./migrations
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["./entrypoint.sh"]
