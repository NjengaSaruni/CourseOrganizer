#!/bin/bash

# Railway Startup Script
# This script runs after deployment to set up the application

set -e

echo "🚀 Starting Course Organizer Application..."
echo "============================================="

# Debug environment variables
echo "🔍 Environment Debug:"
echo "PORT: ${PORT:-'not set'}"

# Wait for database to be ready
echo "⏳ Running database migrations..."
python manage.py migrate --noinput
echo "✅ Database migrations complete"

# Set up admin account if ADMIN_PASSWORD is provided
if [ ! -z "$ADMIN_PASSWORD" ]; then
    echo "🔐 Setting up admin account with provided password..."
    python manage.py setup_admin --force --password "$ADMIN_PASSWORD"
    echo "✅ Admin account setup complete!"
else
    echo "⚠️  No ADMIN_PASSWORD provided. Admin account not set up."
    echo "   Run 'python manage.py setup_admin' manually to create admin account."
fi

# Demo data creation removed for production deployment
# Uncomment the line below if you need demo data for testing:
# python manage.py create_demo_data

echo "✅ Application startup complete!"

# Debug: Check if static files exist
echo "🔍 Debugging static files..."
if [ -f "static/index.html" ]; then
    echo "✅ index.html found in static directory"
else
    echo "❌ index.html NOT found in static directory"
    echo "Contents of static directory:"
    ls -la static/ || echo "Static directory does not exist"
fi

echo "🌐 Starting Django server..."

# Use Railway's PORT env var, but default to 8000 for development
SERVER_PORT=${PORT:-8000}
echo "Starting Django development server on port: $SERVER_PORT"

# Start the Django server
echo "🚀 Starting Django development server..."
echo "Server will be available at: http://0.0.0.0:$SERVER_PORT"

# Start the Django server
exec python manage.py runserver 0.0.0.0:$SERVER_PORT