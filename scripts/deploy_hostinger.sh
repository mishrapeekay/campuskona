#!/bin/bash

# Deployment Script for Hostinger VPS
# Usage: ./deploy_hostinger.sh

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.production.template"
    exit 1
fi

# 3. Build and Restart Containers
echo "🏗️ Building and Restarting Containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 4. Run Database Migrations (Shared Schema)
echo "🗄️ Running Public Schema Migrations..."
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate_schemas --shared

# 5. Check Health
echo "Pinging Health Check..."
sleep 5
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost/health/)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Deployment Successful! API is healthy."
else
    echo "⚠️ Warning: Health check returned $HTTP_STATUS. Please check logs."
    echo "Logs: docker compose -f docker-compose.prod.yml logs -f --tail=50 backend"
fi
