# ---------- Stage 1: build caddy with cloudflare plugin ----------
FROM caddy:2.10-builder-alpine AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare

# ---------- Stage 2: runtime ----------
FROM caddy:2.10-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
