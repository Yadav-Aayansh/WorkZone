FROM golang:1.25 as builder

WORKDIR /src

# Install xcaddy
RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest

# Build Caddy with Cloudflare DNS module
RUN /go/bin/xcaddy build --with github.com/caddy-dns/cloudflare

# --- Stage 2: Create lightweight runtime image ---
FROM caddy:2.8

WORKDIR /etc/caddy

# Copy built Caddy binary
COPY --from=builder /src/caddy /usr/bin/caddy

# Copy Caddyfile
COPY Caddyfile ./Caddyfile

# Create directories for persistent cert + config storage
VOLUME ["/data", "/config"]

EXPOSE 80 443 2019

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
