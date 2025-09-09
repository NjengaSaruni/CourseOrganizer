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
railway project new course-organizer 2>/dev/null || echo "Project already exists or using existing project"

# Set environment variables
echo "⚙️ Setting up environment variables..."
railway variables set SECRET_KEY="$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" 2>/dev/null || true
railway variables set DEBUG=false
railway variables set ALLOWED_HOSTS="*.railway.app"
railway variables set CORS_ALLOWED_ORIGINS="https://*.railway.app"

echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo "📱 Your app will be available at: https://course-organizer-production.up.railway.app"
echo "📊 Monitor with: railway logs"
echo "🌐 Open dashboard: railway open"