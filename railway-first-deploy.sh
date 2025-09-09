#!/bin/bash

# First-Time Railway Deployment Script for Course Organizer
# This script handles the complete first-time setup and deployment

set -e

echo "🚀 First-Time Railway Deployment for Course Organizer"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists railway; then
    print_error "Railway CLI is required but not installed"
    print_status "Install it with: npm install -g @railway/cli"
    print_status "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

if ! command_exists python3; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Check if user is logged in to Railway
print_status "Checking Railway authentication..."
if ! railway whoami >/dev/null 2>&1; then
    print_warning "Not logged in to Railway. Please log in:"
    railway login
fi

print_success "Railway authentication verified"

# Step 1: Initialize Railway project
print_status "Step 1: Initializing Railway project..."
if ! railway status >/dev/null 2>&1; then
    print_status "Creating new Railway project..."
    railway init course-organizer
    print_success "Railway project created and linked"
else
    print_status "Project already linked to current directory"
    railway status
fi

# Step 2: Add PostgreSQL database service
print_status "Step 2: Adding PostgreSQL database service..."
print_status "Adding PostgreSQL database to your project..."
railway add --database postgres
print_success "PostgreSQL database service added"

# Step 3: Add main application service
print_status "Step 3: Adding main application service..."
print_status "Creating main application service..."
railway add --service course-organizer-backend
print_success "Main application service added"

# Step 4: Link to the main service
print_status "Step 4: Linking to main service..."
railway service course-organizer-backend
print_success "Linked to main service"

# Step 5: Set up environment variables
print_status "Step 5: Setting up environment variables..."

# Generate a secure secret key without Django dependency
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

print_status "Setting SECRET_KEY..."
railway variables --set "SECRET_KEY=$SECRET_KEY"

print_status "Setting DEBUG..."
railway variables --set "DEBUG=false"

print_status "Setting ALLOWED_HOSTS..."
railway variables --set "ALLOWED_HOSTS=*.railway.app"

print_status "Setting CORS_ALLOWED_ORIGINS..."
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app"

print_success "Environment variables configured"

# Step 6: Verify project setup
print_status "Step 6: Verifying project setup..."
railway status

# Step 7: Deploy the application
print_status "Step 7: Deploying application to Railway..."
print_warning "This will deploy your application to Railway. Press Enter to continue or Ctrl+C to cancel."
read -r

print_status "Starting Railway deployment..."
railway up

print_success "Deployment initiated!"

# Step 8: Post-deployment information
echo ""
echo "🎉 First-Time Railway Deployment Complete!"
echo "=========================================="
echo ""
print_status "Your application is being deployed. This may take a few minutes."
echo ""
print_status "Monitor your deployment:"
echo "  railway logs"
echo "  railway status"
echo "  railway open"
echo ""
print_status "Your application will be available at:"
echo "  https://course-organizer-production.up.railway.app"
echo ""
print_status "Backend API:"
echo "  https://course-organizer-production.up.railway.app/api/"
echo ""
print_status "Django Admin:"
echo "  https://course-organizer-production.up.railway.app/admin/"
echo ""
print_status "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / admin123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
print_warning "Note: The first deployment may take 5-10 minutes to complete."
print_status "Use 'railway logs' to monitor the deployment progress."