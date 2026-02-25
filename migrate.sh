#!/bin/bash

# AI Creative Hub - Database Migration Script

echo "🗄️  Running database migrations..."

# Check if running in Docker
if [ -f .dockerenv ]; then
    echo "Running in Docker environment"
    cd /app/backend
else
    cd backend
fi

# Run Alembic migrations
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully!"
else
    echo "❌ Database migrations failed!"
    exit 1
fi
