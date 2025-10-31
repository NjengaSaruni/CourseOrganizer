#!/bin/bash

# Course Organizer Docker Development Startup Script

echo "🚀 Starting Course Organizer Development Environment with Docker..."

# Check if we're in the right directory
if [ ! -f "docker/docker-compose.dev.yml" ]; then
    echo "❌ Please run this script from the course-organizer root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

if ! command_exists docker compose; then
    echo "❌ Docker Compose is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

MEDIA_DIR="backend/media"
LEGACY_MEDIA_VOLUME="course-organizer_backend_media"

# Ensure media directory exists locally
mkdir -p "$MEDIA_DIR"

# Migrate media files from legacy Docker volume to host bind mount if needed
if docker volume inspect "$LEGACY_MEDIA_VOLUME" >/dev/null 2>&1; then
    if [ -z "$(ls -A "$MEDIA_DIR" 2>/dev/null)" ]; then
        echo "📦 Migrating media files from legacy Docker volume to host directory..."
        docker run --rm \
            -v "$LEGACY_MEDIA_VOLUME":/source \
            -v "$(pwd)/$MEDIA_DIR":/target \
            busybox sh -c "cp -a /source/. /target/" && \
            echo "✅ Media files copied to $MEDIA_DIR"
    else
        echo "ℹ️  Media directory already populated; skipping volume migration."
    fi
    echo "🧹 Removing legacy media volume $LEGACY_MEDIA_VOLUME"
    docker volume rm "$LEGACY_MEDIA_VOLUME" >/dev/null 2>&1 || true
fi

# Set admin password if provided
if [ -n "${ADMIN_PASSWORD:-}" ]; then
    echo "🔐 Using provided ADMIN_PASSWORD"
    export ADMIN_PASSWORD
else
    echo "⚠️  No ADMIN_PASSWORD set. Admin will be created with random password."
fi

# Build and start services
echo "🐳 Building and starting Docker services..."
docker compose -f docker/docker-compose.dev.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Set admin password if not using environment variable
if [ -z "${ADMIN_PASSWORD:-}" ]; then
    echo "🔐 Setting up admin account..."
    docker compose -f docker/docker-compose.dev.yml exec backend python manage.py manage_admin create --email admin@uon.ac.ke --force || \
    docker compose -f docker/docker-compose.dev.yml exec backend python manage.py manage_admin reset-password --email admin@uon.ac.ke --force
else
    echo "🔐 Setting admin password..."
    docker compose -f docker/docker-compose.dev.yml exec backend python manage.py manage_admin reset-password --email admin@uon.ac.ke --password "$ADMIN_PASSWORD" --force
fi

echo ""
echo "🎉 Docker development environment started!"
echo ""
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:8000/api/"
echo "⚙️ Django Admin: http://localhost:8000/admin/"
echo "🗄️ Database: postgresql://postgres:postgres@localhost:5432/course_organizer"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / ${ADMIN_PASSWORD:-[check container logs for generated password]}"
echo ""
echo "🐳 Docker commands:"
echo "  View logs: docker compose -f docker/docker-compose.dev.yml logs -f"
echo "  Stop services: docker compose -f docker/docker-compose.dev.yml down"
echo "  Restart backend: docker compose -f docker/docker-compose.dev.yml restart backend"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Docker services..."
    docker compose -f docker/docker-compose.dev.yml down
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Show logs
docker compose -f docker/docker-compose.dev.yml logs -f
