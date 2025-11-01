#!/bin/bash

# Course Organizer Mobile App - Setup Script
# Run this script to fix npm cache and install dependencies

set -e

echo "🔧 Course Organizer Mobile App Setup"
echo "====================================="
echo ""

# Step 1: Fix npm cache permissions
echo "Step 1: Fixing npm cache permissions..."
sudo chown -R $(whoami) "/Users/ptah/.npm" || {
    echo "⚠️  Warning: Could not fix npm cache permissions"
    echo "   You may need to run this manually:"
    echo "   sudo chown -R $(whoami) /Users/ptah/.npm"
}
echo "✅ npm cache permissions fixed"
echo ""

# Step 2: Clean npm cache
echo "Step 2: Cleaning npm cache..."
npm cache clean --force || echo "⚠️  Cache clean had issues but continuing..."
echo "✅ npm cache cleaned"
echo ""

# Step 3: Install dependencies
echo "Step 3: Installing dependencies..."
cd "$(dirname "$0")"
npm install
echo "✅ Dependencies installed"
echo ""

# Step 4: Build the app
echo "Step 4: Building the app..."
npm run build
echo "✅ App built successfully"
echo ""

# Step 5: Initialize Capacitor
echo "Step 5: Setting up Capacitor..."

# Add iOS platform if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   Adding iOS platform..."
    npx cap add ios || echo "⚠️  iOS setup skipped (may already exist)"
fi

# Add Android platform
echo "   Adding Android platform..."
npx cap add android || echo "⚠️  Android setup skipped (may already exist)"

# Sync with native projects
echo "   Syncing with native projects..."
npx cap sync
echo "✅ Capacitor initialized"
echo ""

echo "====================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  • iOS:     npx cap open ios"
echo "  • Android: npx cap open android"
echo "  • Dev:     npm start"
echo ""

