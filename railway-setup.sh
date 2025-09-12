#!/bin/bash

# Railway Post-Deployment Setup Script
# This script sets up the admin account after Railway deployment

set -e

echo "🔐 Railway Post-Deployment Setup"
echo "================================"

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

# Check if we're connected to Railway
print_status "Checking Railway connection..."
if ! railway whoami >/dev/null 2>&1; then
    print_error "Not connected to Railway. Please run: railway login"
    exit 1
fi

print_success "Connected to Railway"

# Check if we're in the right service
print_status "Checking Railway service..."
if ! railway status >/dev/null 2>&1; then
    print_error "No Railway service found. Please run this from your Railway project directory."
    exit 1
fi

print_success "Railway service found"

# Set up admin account
print_status "Setting up admin account..."
print_warning "You will be prompted to enter a password for admin@uon.ac.ke"
echo ""

# Check if ADMIN_PASSWORD is already set
if railway variables --service course-organizer-backend | grep -q "ADMIN_PASSWORD"; then
    print_status "ADMIN_PASSWORD environment variable is already set."
    print_status "The admin account should be automatically configured on deployment."
    print_status "If you need to change the password, you can:"
    echo "  1. Update the ADMIN_PASSWORD variable: railway variables --set ADMIN_PASSWORD=newpassword"
    echo "  2. Redeploy the application: railway up"
    echo ""
    read -p "Do you want to set a new admin password now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        while true; do
            read -s -p "Enter new admin password (min 8 characters): " NEW_ADMIN_PASSWORD
            echo ""
            if [ ${#NEW_ADMIN_PASSWORD} -lt 8 ]; then
                print_error "Password must be at least 8 characters long!"
                continue
            fi
            
            read -s -p "Confirm new admin password: " CONFIRM_PASSWORD
            echo ""
            if [ "$NEW_ADMIN_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
                print_error "Passwords do not match!"
                continue
            fi
            
            # Update admin password
            railway variables --set "ADMIN_PASSWORD=$NEW_ADMIN_PASSWORD"
            print_success "Admin password updated! Redeploying application..."
            railway up
            break
        done
    fi
else
    # No ADMIN_PASSWORD set, run interactive setup
    railway run --service course-organizer-backend bash -lc "cd /app && python3 manage.py setup_admin --force"
    print_success "Admin account setup complete!"
fi

echo ""
echo "🎉 Railway Setup Complete!"
echo "=========================="
echo ""
print_success "Your Course Organizer is now ready for production use!"
echo ""
print_status "Access your application:"
echo "  Frontend: https://course-organizer-backend-production.up.railway.app"
echo "  Admin Panel: https://course-organizer-backend-production.up.railway.app/admin"
echo ""
print_status "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / [password you just set]"
echo "  Demo Student (Class of 2029): demo.student@uon.ac.ke / demo123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
print_status "Next steps:"
echo "  1. Test the admin login at /admin"
echo "  2. Test student registration and approval workflow"
echo "  3. Configure your domain (if needed)"
echo "  4. Set up monitoring and backups"
