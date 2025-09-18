#!/bin/bash

# Railway Development/Staging Deployment Script
# This script deploys to the 'uoncourseorganizer' project using Django dev server
# Uses Dockerfile (not Dockerfile.prod) for development environment

set -e
# Non-interactive mode for Railway CLI
export RAILWAY_CI=1

echo "🚀 Railway Development/Staging Deployment Script"
echo "=================================================="
echo "Target: uoncourseorganizer project (Django dev server)"

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
    print_error "Not logged in to Railway. Please run 'railway login' once in your shell and re-run this script."
    exit 1
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


# Create development railway.json (remove production config)
if [ -f "railway.json" ]; then
    print_status "Creating development railway.json cs onfiguration..."
    mv railway.json railway.json.prod.bak
    print_warning "Backed up production railway.json as railway.json.prod.bak"
fi

# Create minimal railway.json for development
cat > railway.json << EOF
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "./startup.sh",
    "healthcheckPath": "/api/",
    "healthcheckTimeout": 300
  }
}
EOF
print_status "Created development railway.json configuration"

print_success "Docker deployment preparation complete"

# Set target project and service (override with SERVICE_NAME env)
TARGET_PROJECT="uoncourseorganizer"
SERVICE_NAME="${SERVICE_NAME:-course-organizer-backend}"
print_status "Target project: $TARGET_PROJECT"
print_status "Target service: $SERVICE_NAME"

# Check if we can link to the target project
print_status "Checking Railway project status..."
if railway link --project "$TARGET_PROJECT" >/dev/null 2>&1; then
    print_status "Successfully linked to existing project: $TARGET_PROJECT"
    # Always set the intended service context to avoid deploying to DB service
    if railway service "$SERVICE_NAME" >/dev/null 2>&1; then
        print_success "Linked to service: $SERVICE_NAME"
    else
        print_error "Service not found: $SERVICE_NAME"
        print_status "Available services:"
        railway service list
        exit 1
    fi
else
    print_status "Creating new development project: $TARGET_PROJECT"
    railway init $TARGET_PROJECT
    print_status "Adding PostgreSQL database..."
    railway add --database postgres
    print_status "Adding main application service..."
    railway add --service "$SERVICE_NAME"
    print_status "Linking to main service..."
    railway service "$SERVICE_NAME"
    print_success "Development project setup complete"
fi

# Verify we're linked to the correct project and service (fast, non-interactive)
print_status "Verifying project and service connection..."
if railway service "$SERVICE_NAME" >/dev/null 2>&1; then
    print_success "Verified service context: $SERVICE_NAME"
else
    print_error "Failed to verify service: $SERVICE_NAME"
    print_status "Available services:"
    railway service list || true
    exit 1
fi

# Show current project info (targeted; non-blocking)
print_status "Current project info (targeted):"
railway status --service "$SERVICE_NAME" || true

# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set environment variables
print_status "Setting up environment variables..."
railway variables --service "$SERVICE_NAME" --set "SECRET_KEY=$SECRET_KEY"
railway variables --service "$SERVICE_NAME" --set "DEBUG=false"
railway variables --service "$SERVICE_NAME" --set "ALLOWED_HOSTS=*.railway.app,healthcheck.railway.app,localhost,127.0.0.1,co.riverlearn.co.ke,jitsi.riverlearn.co.ke"
railway variables --service "$SERVICE_NAME" --set "CORS_ALLOWED_ORIGINS=https://*.railway.app,https://co.riverlearn.co.ke,https://jitsi.riverlearn.co.ke"
railway variables --service "$SERVICE_NAME" --set "CSRF_TRUSTED_ORIGINS=https://*.railway.app,https://co.riverlearn.co.ke,https://jitsi.riverlearn.co.ke"

# Ask for admin password
print_status "Setting up admin account..."
echo ""
print_warning "You can set the admin password now or later:"
echo "  1. Set it now (recommended for automated deployment)"
echo "  2. Set it later using ./railway-setup.sh"
echo ""
read -p "Do you want to set the admin password now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    while true; do
        read -s -p "Enter admin password (min 8 characters): " ADMIN_PASSWORD
        echo ""
        if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
            print_error "Password must be at least 8 characters long!"
            continue
        fi
        
        read -s -p "Confirm admin password: " CONFIRM_PASSWORD
        echo ""
        if [ "$ADMIN_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
            print_error "Passwords do not match!"
            continue
        fi
        
        # Set admin password as environment variable
        railway variables --set "ADMIN_PASSWORD=$ADMIN_PASSWORD"
        print_success "Admin password set successfully!"
        break
    done
else
    print_warning "Admin password not set. You'll need to run ./railway-setup.sh after deployment."
fi

print_success "Environment variables configured"

# Deploy using Dockerfile (ensure correct service context)
print_status "Deploying with Dockerfile..."
print_status "Starting Railway Docker deployment..."
if ! railway service | grep -q "$SERVICE_NAME"; then
    print_error "Not currently linked to $SERVICE_NAME. Aborting."
    exit 1
fi
railway up --service "$SERVICE_NAME"

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
if [ ! -z "$ADMIN_PASSWORD" ]; then
    echo "  Admin: admin@uon.ac.ke / [password you set during deployment]"
else
    echo "  Admin: admin@uon.ac.ke / [password to be set]"
fi
echo "  Demo Student (Class of 2029): demo.student@uon.ac.ke / demo123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
if [ -z "$ADMIN_PASSWORD" ]; then
    print_warning "IMPORTANT: Admin password not set during deployment!"
    echo "  Option 1 (Recommended): Run the setup script:"
    echo "    ./railway-setup.sh"
    echo ""
    echo "  Option 2 (Manual):"
    echo "    1. Connect to your Railway service: railway shell"
    echo "    2. Run: python manage.py setup_admin"
    echo "    3. Enter a secure password for admin@uon.ac.ke"
    echo ""
else
    print_success "Admin password was set during deployment and will be configured automatically!"
fi
echo ""
print_warning "Note: Docker builds take longer but are more reliable than Nixpacks."