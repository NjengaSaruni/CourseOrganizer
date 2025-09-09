#!/bin/bash

# Railway Service Linking Script
# Use this if you have an existing Railway project but no service is linked

set -e

echo "🔗 Railway Service Linking Script"
echo "================================="

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

# Check current status
echo "📊 Current Railway status:"
railway status

# Check if we need to add a service
if ! railway status | grep -q "Service:"; then
    echo "❌ No service found in project"
    exit 1
fi

SERVICE_NAME=$(railway status | grep "Service:" | awk '{print $2}')

if [ "$SERVICE_NAME" = "None" ]; then
    echo "🔧 No service linked. Adding main application service..."
    railway add --service course-organizer-backend
    echo "✅ Service added"
    
    echo "🔗 Linking to service..."
    railway service course-organizer-backend
    echo "✅ Service linked"
else
    echo "🔗 Linking to existing service: $SERVICE_NAME"
    railway service "$SERVICE_NAME"
    echo "✅ Service linked"
fi

echo ""
echo "📊 Updated Railway status:"
railway status

echo ""
echo "✅ Service linking complete!"
echo "You can now set environment variables and deploy:"
echo "  railway variables --set 'KEY=VALUE'"
echo "  railway up"