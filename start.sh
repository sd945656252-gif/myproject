#!/bin/bash

# Quick Start Script - AI Creative Hub
# This script initializes and starts the AI Creative Hub system

echo "🚀 AI Creative Hub - Quick Start"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - HUGGINGFACE_API_KEY"
    echo "   - Other API keys (optional)"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads outputs logs
echo "✅ Directories created"
echo ""

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Error: Docker build failed"
    exit 1
fi

echo "✅ Docker images built"
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start services"
    exit 1
fi

echo "✅ Services started"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
./migrate.sh

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Migration failed, but services are running"
    echo "   You can run migrations later with: ./migrate.sh"
fi

echo ""
echo "================================"
echo "✅ AI Creative Hub is now running!"
echo "================================"
echo ""
echo "📌 Access URLs:"
echo "   - Frontend:    http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs:    http://localhost:8000/docs"
echo "   - Dashboard:   http://localhost:8000/health"
echo ""
echo "🛠️  Useful Commands:"
echo "   - View logs:   docker-compose logs -f"
echo "   - Stop:        docker-compose down"
echo "   - Restart:     docker-compose restart"
echo "   - Status:      docker-compose ps"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start:   QUICKSTART.md"
echo "   - Full Docs:     COMPLETE_DOCS.md"
echo "   - Deployment:    DEPLOYMENT.md"
echo ""
echo "🎉 Ready to create! Open http://localhost:3000 in your browser"
echo ""
