#!/bin/bash

# Railway Deployment Script with Build Fixes
# This script provides multiple deployment options to handle build issues

set -e

echo "🚀 Railway Deployment with Build Fixes"
echo "======================================"

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
if [ ! -f "docker/docker-compose.yml" ]; then
    print_error "Please run this script from the course-organizer root directory"
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

# Check current status
print_status "Current Railway status:"
railway status

# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set environment variables
print_status "Setting up environment variables..."
railway variables --set "SECRET_KEY=$SECRET_KEY"
railway variables --set "DEBUG=false"
railway variables --set "ALLOWED_HOSTS=*.railway.app"
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app"

print_success "Environment variables configured"

# Choose deployment method
echo ""
print_status "Choose deployment method:"
echo "1. Use Dockerfile (Recommended - more reliable)"
echo "2. Use fixed Nixpacks (Backend only)"
echo "3. Use original Nixpacks (Full stack)"
echo "4. Manual deployment"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Using Dockerfile deployment..."
        # Remove nixpacks.toml to force Dockerfile usage
        if [ -f "nixpacks.toml" ]; then
            mv nixpacks.toml nixpacks.toml.backup
            print_status "Backed up nixpacks.toml"
        fi
        railway up
        ;;
    2)
        print_status "Using backend-only Nixpacks..."
        # Use simplified nixpacks configuration
        if [ -f "nixpacks.toml" ]; then
            mv nixpacks.toml nixpacks.toml.backup
        fi
        cp nixpacks-backend.toml nixpacks.toml
        railway up
        ;;
    3)
        print_status "Using full Nixpacks deployment..."
        # Restore original nixpacks.toml if it was backed up
        if [ -f "nixpacks.toml.backup" ]; then
            mv nixpacks.toml.backup nixpacks.toml
        fi
        railway up
        ;;
    4)
        print_status "Manual deployment instructions:"
        echo ""
        echo "1. Choose your build method:"
        echo "   - For Dockerfile: Remove nixpacks.toml"
        echo "   - For Nixpacks: Keep nixpacks.toml"
        echo ""
        echo "2. Deploy manually:"
        echo "   railway up"
        echo ""
        echo "3. Monitor deployment:"
        echo "   railway logs"
        echo "   railway status"
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_success "Deployment initiated!"

echo ""
echo "🎉 Railway Deployment Complete!"
echo "==============================="
echo ""
print_status "Monitor your deployment:"
echo "  railway logs"
echo "  railway status"
echo "  railway open"
echo ""
print_status "Your application will be available at:"
echo "  https://course-organizer-production.up.railway.app"
echo ""
print_warning "Note: The first deployment may take 5-10 minutes to complete."