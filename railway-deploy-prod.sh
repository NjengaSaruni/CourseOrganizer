#!/bin/bash

# Railway Production Deployment Script
# This script deploys to the 'course-organizer-prod' project using Nginx + Gunicorn
# Uses Dockerfile.prod for production environment with optimized build

set -e

echo "🚀 Railway Production Deployment Script"
echo "========================================"
echo "Target: course-organizer-prod project (Nginx + Gunicorn)"

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
if [ ! -f "Dockerfile.prod" ]; then
    print_error "Dockerfile.prod not found. Please run this script from the course-organizer root directory"
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

# Ensure railway.json exists for production deployment
if [ ! -f "railway.json" ]; then
    if [ -f "railway.json.prod.bak" ]; then
        print_status "Restoring railway.json from backup for production deployment..."
        mv railway.json.prod.bak railway.json
    else
        print_error "railway.json not found and no backup available!"
        print_error "Please ensure railway.json exists for production deployment."
        exit 1
    fi
fi

# Verify railway.json is configured for production
if [ -f "railway.json" ]; then
    if grep -q '"dockerfilePath": "Dockerfile.prod"' railway.json; then
        print_success "railway.json correctly configured for production (Dockerfile.prod)"
    else
        print_warning "railway.json may not be configured for production deployment"
        print_warning "Expected: dockerfilePath: Dockerfile.prod"
    fi
fi

# Check if production project exists
print_status "Checking Railway production project status..."
PROD_PROJECT_NAME="course-organizer-prod"

# Try to switch to production project
if railway link --project $PROD_PROJECT_NAME >/dev/null 2>&1; then
    print_status "Found existing production project: $PROD_PROJECT_NAME"
    
    # Check if we're linked to a service
    if ! railway service >/dev/null 2>&1; then
        print_status "No service linked. Listing available services..."
        railway service list
        
        print_status "Linking to production backend service..."
        if railway service course-organizer-prod-backend >/dev/null 2>&1; then
            print_success "Linked to course-organizer-prod-backend service"
        else
            print_warning "Service course-organizer-prod-backend not found. Available services:"
            railway service list
            echo ""
            print_warning "Please enter the correct service name from the list above:"
            read -p "Service name: " SERVICE_NAME
            if railway service "$SERVICE_NAME" >/dev/null 2>&1; then
                print_success "Linked to $SERVICE_NAME service"
            else
                print_error "Failed to link to service: $SERVICE_NAME"
                exit 1
            fi
        fi
    fi
else
    print_status "Creating new production project..."
    railway init
    print_status "Adding PostgreSQL database to production..."
    railway add --database postgres
    print_status "Adding production application service..."
    railway add --service course-organizer-prod-backend
    print_status "Linking to production service..."
    railway service course-organizer-prod-backend
    print_success "Production project setup complete"
fi

# Verify we're linked to a service
print_status "Verifying service connection..."
if ! railway service >/dev/null 2>&1; then
    print_error "No service linked. Cannot continue with deployment."
    print_warning "Please run 'railway service <service-name>' to link to a service first."
    exit 1
fi

CURRENT_SERVICE=$(railway service 2>/dev/null || echo "unknown")
print_success "Linked to service: $CURRENT_SERVICE"

# Show current project info
print_status "Current project info:"
railway status

# Generate production secret key
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set production environment variables
print_status "Setting up production environment variables..."
railway variables --set "SECRET_KEY=$SECRET_KEY"
railway variables --set "DEBUG=false"
railway variables --set "ALLOWED_HOSTS=*.railway.app,co.riverlearn.co.ke,healthcheck.railway.app"
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app,https://co.riverlearn.co.ke"
railway variables --set "CSRF_TRUSTED_ORIGINS=https://*.railway.app,https://co.riverlearn.co.ke"

# Set production-specific variables
railway variables --set "DJANGO_SETTINGS_MODULE=course_organizer.settings"
railway variables --set "PYTHONPATH=/app"

print_success "Production environment variables configured"

# Ask for admin password
print_status "Setting up production admin account..."
echo ""
print_warning "You can set the admin password now or later:"
echo "  1. Set it now (recommended for automated deployment)"
echo "  2. Set it later using ./railway-setup-prod.sh"
echo ""
read -p "Do you want to set the admin password now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    while true; do
        read -s -p "Enter production admin password (min 8 characters): " ADMIN_PASSWORD
        echo ""
        if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
            print_error "Password must be at least 8 characters long!"
            continue
        fi
        
        read -s -p "Confirm production admin password: " CONFIRM_PASSWORD
        echo ""
        if [ "$ADMIN_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
            print_error "Passwords do not match!"
            continue
        fi
        
        # Set admin password as environment variable
        railway variables --set "ADMIN_PASSWORD=$ADMIN_PASSWORD"
        print_success "Production admin password set successfully!"
        break
    done
else
    print_warning "Production admin password not set. You'll need to run ./railway-setup-prod.sh after deployment."
fi

# Create production railway.json
print_status "Creating production railway.json configuration..."
cat > railway.json << EOF
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.prod"
  },
  "deploy": {
    "startCommand": "/app/startup-prod.sh",
    "healthcheckPath": "/health/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

print_success "Production railway.json created"

# Deploy using production Dockerfile
print_status "Deploying with production Dockerfile (nginx + gunicorn)..."
print_warning "This will deploy your application to Railway PRODUCTION using Docker with nginx and gunicorn."
print_warning "Press Enter to continue or Ctrl+C to cancel."
read -r

print_status "Starting Railway production deployment..."
railway up

print_success "Production deployment initiated!"

echo ""
echo "🎉 Railway Production Deployment Complete!"
echo "=========================================="
echo ""
print_status "Your production application is being deployed using Docker with nginx and gunicorn."
print_status "This may take 10-15 minutes due to the multi-stage build process."
echo ""
print_status "Monitor your production deployment:"
echo "  railway logs --service course-organizer-prod-backend"
echo "  railway status"
echo "  railway open"
echo ""
print_status "Your production application will be available at:"
echo "  https://course-organizer-prod-backend-production.up.railway.app"
echo ""
print_status "Production Backend API:"
echo "  https://course-organizer-prod-backend-production.up.railway.app/api/"
echo ""
print_status "Production Django Admin:"
echo "  https://course-organizer-prod-backend-production.up.railway.app/admin/"
echo ""
print_status "Production Frontend:"
echo "  https://course-organizer-prod-backend-production.up.railway.app/"
echo ""
print_status "Custom Domain (if configured):"
echo "  https://co.riverlearn.co.ke"
echo ""
print_status "Production accounts:"
if [ ! -z "$ADMIN_PASSWORD" ]; then
    echo "  Admin: admin@uon.ac.ke / [password you set during deployment]"
else
    echo "  Admin: admin@uon.ac.ke / [password to be set]"
fi
echo "  Demo Student (Class of 2029): demo.student@uon.ac.ke / demo123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
if [ -z "$ADMIN_PASSWORD" ]; then
    print_warning "IMPORTANT: Production admin password not set during deployment!"
    echo "  Option 1 (Recommended): Run the production setup script:"
    echo "    ./railway-setup-prod.sh"
    echo ""
    echo "  Option 2 (Manual):"
    echo "    1. Connect to your production Railway service: railway shell --service course-organizer-prod-backend"
    echo "    2. Run: python manage.py setup_admin"
    echo "    3. Enter a secure password for admin@uon.ac.ke"
    echo ""
else
    print_success "Production admin password was set during deployment and will be configured automatically!"
fi
echo ""
print_status "Production features:"
echo "  ✅ Nginx reverse proxy with SSL termination"
echo "  ✅ Gunicorn WSGI server with multiple workers"
echo "  ✅ Static file serving and caching"
echo "  ✅ Security headers and rate limiting"
echo "  ✅ Health checks and graceful restarts"
echo "  ✅ Optimized build with frontend assets"
echo ""
print_warning "Note: Production builds take longer but provide better performance and reliability."
