# ---------- Stage 1: deps ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# All NEXT_PUBLIC_* vars get baked at build time.
# Pass these via build.args in docker-compose from infra/client.env
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_PLATFORM_URL
ARG NEXT_PUBLIC_DOMAIN_NAME
ARG NEXT_PUBLIC_GCS_BUCKET_NAME
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DNS_A_RECORD_IP
ARG NEXT_PUBLIC_DNS_CNAME_TARGET

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_PLATFORM_URL=$NEXT_PUBLIC_PLATFORM_URL \
    NEXT_PUBLIC_DOMAIN_NAME=$NEXT_PUBLIC_DOMAIN_NAME \
    NEXT_PUBLIC_GCS_BUCKET_NAME=$NEXT_PUBLIC_GCS_BUCKET_NAME \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_DNS_A_RECORD_IP=$NEXT_PUBLIC_DNS_A_RECORD_IP \
    NEXT_PUBLIC_DNS_CNAME_TARGET=$NEXT_PUBLIC_DNS_CNAME_TARGET \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
