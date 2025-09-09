#!/bin/bash

# Simple Railway Deployment Script
# Alternative approach using Railway's web interface for environment variables

set -e

echo "🚀 Simple Railway Deployment for Course Organizer"
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
    echo "Adding PostgreSQL database..."
    railway add postgresql
    echo "Project created successfully!"
else
    echo "Project already linked to current directory"
fi

# Generate secret key
echo "🔑 Generating secret key..."
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

echo "⚙️ Environment variables to set manually:"
echo "=========================================="
echo "SECRET_KEY=$SECRET_KEY"
echo "DEBUG=false"
echo "ALLOWED_HOSTS=*.railway.app"
echo "CORS_ALLOWED_ORIGINS=https://*.railway.app"
echo ""
echo "📝 Please set these environment variables in your Railway dashboard:"
echo "   1. Go to: railway open"
echo "   2. Click on your project"
echo "   3. Go to Variables tab"
echo "   4. Add each variable above"
echo ""
echo "Press Enter when you've set the environment variables..."
read -r

echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo "📱 Your app will be available at: https://course-organizer-production.up.railway.app"
echo "📊 Monitor with: railway logs"
echo "🌐 Open dashboard: railway open"