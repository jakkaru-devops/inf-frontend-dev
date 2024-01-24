include .env

# Executables (local)
DOCKER = docker
DOCKER_COMP = docker-compose

clear: ## Delete all dangling (untagged, irrelevant) images
	@$(DOCKER) image prune -f

dev: ## Run default next dev command with PORT from .env
	@yarn install && $(DOCKER_COMP) -f docker-compose.dev.yml up --detach

build: ## Build Docker images for production
	@$(DOCKER_COMP) build

start: ## Start Docker images in production mode
	@$(DOCKER_COMP) up --detach

up: build start clear ## Build and start Docker containers in production mode

down: ## Stop Docker containers
	@$(DOCKER_COMP) down

logs: ## Show app's live logs
	@$(DOCKER_COMP) logs --follow inf-frontend-app
