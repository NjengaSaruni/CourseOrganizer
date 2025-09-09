#!/bin/bash

# Quick Railway Deployment Script for Course Organizer
# This is a simplified version for quick deployment

set -e

echo "🚀 Quick Railway Deployment for Course Organizer"
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway >/dev/null 2>&1; then
    echo "❌ Railway CLI not found. Install it with:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami >/dev/null 2>&1; then
    echo "🔐 Please log in to Railway:"
    railway login
fi

# Create project if needed
echo "📦 Setting up Railway project..."
if ! railway status >/dev/null 2>&1; then
    echo "Creating new Railway project..."
    railway init course-organizer
    echo "Project created successfully!"
else
    echo "Project already linked to current directory"
fi

# Set environment variables
echo "⚙️ Setting up environment variables..."

# Generate a secure secret key without Django dependency
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set environment variables using correct Railway CLI syntax
echo "Setting SECRET_KEY..."
railway variables --set "SECRET_KEY=$SECRET_KEY"

echo "Setting DEBUG..."
railway variables --set "DEBUG=false"

echo "Setting ALLOWED_HOSTS..."
railway variables --set "ALLOWED_HOSTS=*.railway.app"

echo "Setting CORS_ALLOWED_ORIGINS..."
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app"

echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo "📱 Your app will be available at: https://course-organizer-production.up.railway.app"
echo "📊 Monitor with: railway logs"
echo "🌐 Open dashboard: railway open"