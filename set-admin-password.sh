#!/bin/bash

# Quick script to set admin password via Railway environment variable
# Usage: ./set-admin-password.sh

set -e

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

echo "🔐 Set Admin Password for Railway Deployment"
echo "============================================="

# Check if we're connected to Railway
print_status "Checking Railway connection..."
if ! railway whoami >/dev/null 2>&1; then
    print_error "Not connected to Railway. Please run: railway login"
    exit 1
fi

print_success "Connected to Railway"

# Get password from user
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
    
    break
done

# Set the environment variable
print_status "Setting ADMIN_PASSWORD environment variable..."
railway variables --set "ADMIN_PASSWORD=$ADMIN_PASSWORD"

print_success "Admin password set successfully!"

echo ""
print_status "Next steps:"
echo "  1. The admin account will be automatically created on next deployment"
echo "  2. To deploy now: railway up"
echo "  3. To check status: railway status"
echo ""
print_status "Admin login details:"
echo "  Email: admin@uon.ac.ke"
echo "  Password: [the password you just set]"
echo "  URL: https://your-app.railway.app/admin"
