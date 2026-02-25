#!/bin/bash

# AI Creative Hub - Development Setup Script

echo "🚀 Setting up AI Creative Hub Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your API keys."
else
    echo "✅ .env file already exists."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads outputs logs

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Services are now running:"
echo "   - Backend API: http://localhost:8000"
echo "   - Frontend:    http://localhost:3000"
echo "   - API Docs:    http://localhost:8000/docs"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env with your API keys (OPENAI_API_KEY, etc.)"
echo "   2. Access the application at http://localhost:3000"
echo "   3. Check API documentation at http://localhost:8000/docs"
echo ""
echo "🛠️ Useful commands:"
echo "   docker-compose up -d      # Start services"
echo "   docker-compose down       # Stop services"
echo "   docker-compose logs -f    # View logs"
echo "   docker-compose ps         # Check status"
echo ""
