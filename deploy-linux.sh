#!/bin/bash

# Bible Study App - Linux Deployment Script
# This script deploys the containerized Bible application on Linux

echo "🚀 Deploying Bible Study App on Linux..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install docker.io"
    echo "   CentOS/RHEL: sudo yum install docker"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   Ubuntu/Debian: sudo apt install docker-compose"
    exit 1
fi

# Check if running as root (not recommended for Docker)
if [[ $EUID -eq 0 ]]; then
    echo "⚠️  Warning: Running as root. Consider adding your user to the docker group:"
    echo "   sudo usermod -aG docker $USER"
    echo "   Then logout and login again."
fi

echo "📦 Pulling latest container image..."
docker pull ghcr.io/nmemmert/bible:latest

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to pull container image. Please check your internet connection."
    exit 1
fi

echo "🐳 Starting application..."
docker-compose -f docker-compose.nodejs.yml up -d

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to start application. Check the logs:"
    docker-compose -f docker-compose.nodejs.yml logs
    exit 1
fi

echo "⏳ Waiting for application to be healthy..."
sleep 10

echo "📊 Checking application status..."
docker-compose -f docker-compose.nodejs.yml ps

echo ""
echo "✅ Bible Study App deployed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:    http://localhost:8080"
echo "   Backend API: http://localhost:3000"
echo "   Health:      http://localhost:3000/health"
echo "   PDF API:     http://localhost:3000/api/resources"
echo ""
echo "📋 Management commands:"
echo "   View logs:     docker-compose -f docker-compose.nodejs.yml logs -f"
echo "   Stop app:     docker-compose -f docker-compose.nodejs.yml down"
echo "   Restart app:  docker-compose -f docker-compose.nodejs.yml restart"
echo ""
echo "🎉 Enjoy your Bible study application!"