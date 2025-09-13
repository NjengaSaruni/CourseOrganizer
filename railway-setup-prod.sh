#!/bin/bash

# Railway Production Setup Script
# This script sets up the production environment after deployment

set -e

echo "🔧 Railway Production Setup Script"
echo "=================================="

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
if [ ! -f "railway.json" ]; then
    print_error "railway.json not found. Please run this script from the course-organizer root directory"
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

# Link to production project
PROD_PROJECT_NAME="course-organizer-prod"
print_status "Linking to production project: $PROD_PROJECT_NAME..."

if railway link --project $PROD_PROJECT_NAME >/dev/null 2>&1; then
    print_success "Linked to production project"
else
    print_error "Could not link to production project. Make sure it exists and you have access."
    exit 1
fi

# Switch to production service
print_status "Switching to production backend service..."
railway service course-organizer-prod-backend

print_success "Connected to production service"

# Run migrations
print_status "Running database migrations..."
railway run python manage.py migrate

print_success "Database migrations completed"

# Set up admin account
print_status "Setting up production admin account..."
echo ""
print_warning "You will be prompted to set a password for the admin account (admin@uon.ac.ke)"
echo ""

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
    
    # Set up admin with the password
    railway run python manage.py setup_admin --force --password "$ADMIN_PASSWORD"
    print_success "Production admin account setup complete!"
    break
done

# Set up school structure
print_status "Setting up school structure..."
railway run python manage.py setup_school_structure

print_success "School structure setup complete"

# Assign students to default class
print_status "Assigning students to default class..."
railway run python manage.py assign_students_to_default_class

print_success "Students assigned to default class"

# Create demo data (optional)
echo ""
print_warning "Do you want to create demo data for testing? (y/n)"
read -p "This will create sample courses, materials, and other test data: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating demo data..."
    railway run python manage.py create_demo_data
    print_success "Demo data creation complete"
else
    print_warning "Demo data creation skipped"
fi

# Collect static files
print_status "Collecting static files..."
railway run python manage.py collectstatic --noinput

print_success "Static files collected"

# Restart the service to apply changes
print_status "Restarting production service..."
railway service restart

print_success "Production service restarted"

echo ""
echo "🎉 Production Setup Complete!"
echo "============================="
echo ""
print_success "Your production environment is now fully configured!"
echo ""
print_status "Production URLs:"
echo "  Frontend: https://course-organizer-prod-backend-production.up.railway.app/"
echo "  API: https://course-organizer-prod-backend-production.up.railway.app/api/"
echo "  Admin: https://course-organizer-prod-backend-production.up.railway.app/admin/"
echo "  Custom Domain: https://co.riverlearn.co.ke (if configured)"
echo ""
print_status "Production accounts:"
echo "  Admin: admin@uon.ac.ke / [password you just set]"
echo "  Demo Student: demo.student@uon.ac.ke / demo123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
print_status "Production features enabled:"
echo "  ✅ Nginx reverse proxy with optimized caching"
echo "  ✅ Gunicorn WSGI server with multiple workers"
echo "  ✅ Security headers and rate limiting"
echo "  ✅ Static file serving and compression"
echo "  ✅ Health checks and monitoring"
echo "  ✅ School structure and class assignments"
echo "  ✅ Admin account configured"
echo ""
print_status "Next steps:"
echo "  1. Test the production application"
echo "  2. Configure your custom domain CNAME to point to the production service"
echo "  3. Update CORS settings if needed for your custom domain"
echo "  4. Monitor the application using Railway dashboard"
echo ""
print_warning "Remember to keep your admin password secure and consider setting up monitoring!"
