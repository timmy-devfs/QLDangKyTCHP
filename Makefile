## BICAP SYSTEM — Makefile
## Requirement: Docker Desktop is running

.PHONY: up down build logs clean ps help

## Start all infrastructure (Kafka, Redis, SQL Server, NiFi)
up:
	docker-compose up -d

## Stop all containers
down:
	docker-compose down

## Rebuild all images
build:
	docker-compose build --no-cache

## View realtime logs (Ctrl+C to exit)
logs:
	docker-compose logs -f

## Remove all containers, volumes, networks
clean:
	docker-compose down -v --remove-orphans

## Show container status
ps:
	docker-compose ps

## Show available commands
help:
	@echo.
	@echo   BICAP System - Available Commands:
	@echo   make up      - Start all infrastructure
	@echo   make down    - Stop all containers
	@echo   make build   - Rebuild images
	@echo   make logs    - View realtime logs
	@echo   make clean   - Remove all containers + volumes
	@echo   make ps      - Show container status
	@echo.