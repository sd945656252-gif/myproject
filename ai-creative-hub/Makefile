.PHONY: help install dev build up down logs clean

help:
	@echo "AI Creative Hub - Makefile Commands"
	@echo ""
	@echo "  install      Install dependencies (frontend + backend)"
	@echo "  dev          Start development servers"
	@echo "  build        Build Docker images"
	@echo "  up           Start all services with Docker Compose"
	@echo "  down         Stop all services"
	@echo "  logs         View logs from all services"
	@echo "  clean        Clean up Docker volumes and containers"
	@echo ""

install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

build:
	cd docker && docker-compose build

up:
	cd docker && docker-compose up -d

down:
	cd docker && docker-compose down

logs:
	cd docker && docker-compose logs -f

clean:
	cd docker && docker-compose down -v --rmi all

db-migrate:
	cd backend && alembic revision --autogenerate -m "auto migration"
	cd backend && alembic upgrade head

test-backend:
	cd backend && pytest

test-frontend:
	cd frontend && npm run test
