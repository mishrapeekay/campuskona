#!/bin/bash

# Start Development Environment for School Management System

echo "🚀 Starting School Management System..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "✅ Services Status:"
docker-compose ps

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Access Points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Admin Panel: http://localhost:8000/admin"
echo "   - API Docs: http://localhost:8000/api/docs"
echo ""
echo "📊 Database Connections:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Run migrations: docker-compose exec backend python manage.py migrate"
echo "   - Create superuser: docker-compose exec backend python manage.py createsuperuser"
echo ""
