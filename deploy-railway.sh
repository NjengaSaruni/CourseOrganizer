#!/bin/bash

# Course Organizer Railway Deployment Script
# This script sets up and deploys the Course Organizer application to Railway

set -e  # Exit on any error

echo "🚀 Course Organizer Railway Deployment Script"
echo "=============================================="

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

# Create Railway project if it doesn't exist
print_status "Setting up Railway project..."
if [ -z "$RAILWAY_PROJECT_ID" ]; then
    print_status "Creating new Railway project..."
    railway project new course-organizer
    print_success "Railway project created"
else
    print_status "Using existing Railway project: $RAILWAY_PROJECT_ID"
fi

# Set up environment variables
print_status "Configuring environment variables..."

# Backend environment variables
railway variables set SECRET_KEY="$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
railway variables set DEBUG=false
railway variables set ALLOWED_HOSTS="*.railway.app"
railway variables set CORS_ALLOWED_ORIGINS="https://*.railway.app"

# Frontend environment variables
railway variables set API_URL="https://course-organizer-backend-production.up.railway.app/api"

print_success "Environment variables configured"

# Create Railway configuration files
print_status "Creating Railway configuration files..."

# Create railway.json for project configuration
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && gunicorn course_organizer.wsgi:application --bind 0.0.0.0:\$PORT",
    "healthcheckPath": "/api/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create nixpacks.toml for build configuration
cat > nixpacks.toml << EOF
[phases.setup]
nixPkgs = ["python3", "pip", "nodejs", "npm"]

[phases.install]
cmds = [
    "cd backend && pip install -r requirements.txt",
    "cd frontend && npm install"
]

[phases.build]
cmds = [
    "cd backend && python manage.py migrate",
    "cd backend && python manage.py create_demo_data",
    "cd frontend && npm run build:prod"
]

[start]
cmd = "cd backend && gunicorn course_organizer.wsgi:application --bind 0.0.0.0:\$PORT"
EOF

# Create .railwayignore
cat > .railwayignore << EOF
# Development files
node_modules/
backend/venv/
backend/__pycache__/
frontend/dist/
*.log
*.tmp

# Docker files (not needed for Railway)
docker/
Dockerfile*
docker-compose*

# Development scripts
start-dev.sh
deploy-railway.sh
check-status.sh

# Git
.git/
.gitignore

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

print_success "Railway configuration files created"

# Prepare the application for deployment
print_status "Preparing application for deployment..."

# Ensure backend has all required dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Ensure frontend has all required dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_success "Dependencies installed"

# Create a production-ready start script
print_status "Creating production start script..."
cat > start-production.sh << 'EOF'
#!/bin/bash

# Production startup script for Railway
set -e

echo "🚀 Starting Course Organizer in production mode..."

# Start backend
cd backend
echo "🔧 Starting Django backend..."
python manage.py migrate
python manage.py create_demo_data
gunicorn course_organizer.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
EOF

chmod +x start-production.sh

print_success "Production start script created"

# Create a comprehensive README for Railway deployment
print_status "Creating Railway deployment documentation..."
cat > RAILWAY_DEPLOYMENT.md << 'EOF'
# Railway Deployment Guide

## Overview
This guide covers deploying the Course Organizer application to Railway.

## Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account
- Python 3.x
- Node.js 18+

## Quick Deploy
```bash
./deploy-railway.sh
```

## Manual Deployment Steps

### 1. Login to Railway
```bash
railway login
```

### 2. Create Project
```bash
railway project new course-organizer
```

### 3. Set Environment Variables
```bash
# Backend
railway variables set SECRET_KEY="your-secret-key"
railway variables set DEBUG=false
railway variables set ALLOWED_HOSTS="*.railway.app"
railway variables set CORS_ALLOWED_ORIGINS="https://*.railway.app"

# Database (Railway will provide this)
railway variables set DATABASE_URL="postgresql://..."
```

### 4. Deploy
```bash
railway up
```

## Environment Variables

### Required
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string (provided by Railway)

### Optional
- `DEBUG`: Set to `false` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of CORS origins

## Services

### Backend Service
- **Runtime**: Python 3.11
- **Framework**: Django 5.2.6
- **Server**: Gunicorn
- **Database**: PostgreSQL (provided by Railway)

### Frontend Service
- **Runtime**: Node.js 18+
- **Framework**: Angular 20
- **Build**: Production build with optimization

## Demo Accounts
After deployment, use these accounts:
- **Admin**: admin@uon.ac.ke / admin123
- **Student**: john.doe@student.uon.ac.ke / student123

## Monitoring
- View logs: `railway logs`
- Check status: `railway status`
- Open dashboard: `railway open`

## Troubleshooting

### Common Issues
1. **Build Failures**: Check `railway logs` for detailed error messages
2. **Database Connection**: Ensure `DATABASE_URL` is set correctly
3. **CORS Issues**: Verify `CORS_ALLOWED_ORIGINS` includes your domain
4. **Static Files**: Ensure frontend build completed successfully

### Useful Commands
```bash
# View logs
railway logs

# Check service status
railway status

# Open Railway dashboard
railway open

# Connect to database
railway connect

# View environment variables
railway variables
```
EOF

print_success "Railway deployment documentation created"

# Final checks
print_status "Performing final checks..."

# Check if all required files exist
required_files=(
    "backend/requirements.txt"
    "backend/manage.py"
    "frontend/package.json"
    "frontend/angular.json"
    "railway.json"
    "nixpacks.toml"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files present"

# Test build locally (optional)
print_status "Testing local build..."
cd frontend
npm run build:prod >/dev/null 2>&1
cd ..
print_success "Local build test passed"

# Deploy to Railway
print_status "Deploying to Railway..."
print_warning "This will deploy your application to Railway. Press Enter to continue or Ctrl+C to cancel."
read -r

print_status "Starting Railway deployment..."
railway up

print_success "Deployment initiated!"
print_status "You can monitor the deployment with: railway logs"
print_status "Open your Railway dashboard with: railway open"

echo ""
echo "🎉 Course Organizer Railway Deployment Complete!"
echo "=============================================="
echo ""
echo "📱 Your application will be available at:"
echo "   https://course-organizer-production.up.railway.app"
echo ""
echo "🔧 Backend API:"
echo "   https://course-organizer-production.up.railway.app/api/"
echo ""
echo "⚙️ Django Admin:"
echo "   https://course-organizer-production.up.railway.app/admin/"
echo ""
echo "📊 Monitor your deployment:"
echo "   railway logs"
echo "   railway status"
echo "   railway open"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / admin123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""