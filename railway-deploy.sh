#!/bin/bash

# Railway Deployment Script
# This script handles both first-time and subsequent Railway deployments

set -e

echo "🚀 Railway Deployment Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the course-organizer root directory"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."
if ! command -v railway >/dev/null 2>&1; then
    print_error "Railway CLI is required but not installed"
    exit 1
fi

if ! railway whoami >/dev/null 2>&1; then
    print_warning "Not logged in to Railway. Please log in:"
    railway login
fi

print_success "Prerequisites check passed"

# Ensure Dockerfile is present and Nixpacks files are not interfering
print_status "Preparing for Docker deployment..."

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found!"
    exit 1
fi

# Remove any active nixpacks.toml files (keep backups)
if [ -f "nixpacks.toml" ]; then
    print_status "Removing nixpacks.toml to force Dockerfile usage..."
    rm nixpacks.toml
fi

# Ensure railway.json is configured for Dockerfile
if [ -f "railway.json" ]; then
    if grep -q '"builder": "NIXPACKS"' railway.json; then
        print_status "Updating railway.json to use Dockerfile..."
        sed -i.bak 's/"builder": "NIXPACKS"/"builder": "DOCKERFILE"/g' railway.json
    fi
fi

print_success "Docker deployment preparation complete"

# Check if this is a first-time deployment
print_status "Checking Railway project status..."
if ! railway status >/dev/null 2>&1; then
    print_status "First-time deployment detected. Setting up project..."
    railway init course-organizer
    print_status "Adding PostgreSQL database..."
    railway add --database postgres
    print_status "Adding main application service..."
    railway add --service course-organizer-backend
    print_status "Linking to main service..."
    railway service course-organizer-backend
    print_success "Project setup complete"
else
    print_status "Existing project detected."
    railway status
fi

# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set environment variables
print_status "Setting up environment variables..."
railway variables --set "SECRET_KEY=$SECRET_KEY"
railway variables --set "DEBUG=false"
railway variables --set "ALLOWED_HOSTS=*.railway.app"
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app"

print_success "Environment variables configured"

# Deploy using Dockerfile
print_status "Deploying with Dockerfile..."
print_warning "This will deploy your application to Railway using Docker. Press Enter to continue or Ctrl+C to cancel."
read -r

print_status "Starting Railway Docker deployment..."
railway up

print_success "Docker deployment initiated!"

echo ""
echo "🎉 Railway Deployment Complete!"
echo "==============================="
echo ""
print_status "Your application is being deployed using Docker. This may take 5-10 minutes."
echo ""
print_status "Monitor your deployment:"
echo "  railway logs"
echo "  railway status"
echo "  railway open"
echo ""
print_status "Your application will be available at:"
echo "  https://course-organizer-backend-production.up.railway.app"
echo ""
print_status "Backend API:"
echo "  https://course-organizer-backend-production.up.railway.app/api/"
echo ""
print_status "Django Admin:"
echo "  https://course-organizer-backend-production.up.railway.app/admin/"
echo ""
print_status "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / admin123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
print_warning "Note: Docker builds take longer but are more reliable than Nixpacks."