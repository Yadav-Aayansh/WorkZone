# One-click deploy helpers. `--env-file infra/client.env` makes the client's
# NEXT_PUBLIC_* build args available to compose interpolation, so all env
# config lives under infra/ (no root .env).
ENV_FILE := infra/client.env
COMPOSE  := docker compose --env-file $(ENV_FILE)

.PHONY: up down build rebuild logs ps restart migrate

up:            ## Build (if needed) and start the full stack
	$(COMPOSE) up -d --build

down:          ## Stop and remove containers
	$(COMPOSE) down

build:         ## Build all images
	$(COMPOSE) build

rebuild:       ## Rebuild images without cache
	$(COMPOSE) build --no-cache

logs:          ## Tail logs from all services
	$(COMPOSE) logs -f

ps:            ## Show service status
	$(COMPOSE) ps

restart:       ## Restart all services
	$(COMPOSE) restart

migrate:       ## Run DB migrations only (platform + all tenants)
	$(COMPOSE) run --rm migrate
