#!/bin/sh

# Railway Production Startup Script
# This script runs in the production container with nginx and gunicorn

set -e

echo "🚀 Starting Course Organizer Production Application..."
echo "======================================================"

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
python manage.py migrate --noinput

# Set up admin account if ADMIN_PASSWORD is provided
if [ ! -z "$ADMIN_PASSWORD" ]; then
    echo "🔐 Setting up admin account with provided password..."
    python manage.py setup_admin --force --password "$ADMIN_PASSWORD"
    echo "✅ Admin account setup complete!"
else
    echo "⚠️  No ADMIN_PASSWORD provided. Admin account not set up."
    echo "   Run 'python manage.py setup_admin' manually to create admin account."
fi

# Set up school structure
echo "🏫 Setting up school structure..."
python manage.py setup_school_structure

# Assign students to default class
echo "👥 Assigning students to default class..."
python manage.py assign_students_to_default_class

echo "✅ Application startup complete!"

# Test Django app is working
echo "🧪 Testing Django application..."
python manage.py check --deploy

# Debug: Check if static files exist
echo "🔍 Debugging static files..."
if [ -f "static/index.html" ]; then
    echo "✅ index.html found in static directory"
else
    echo "❌ index.html NOT found in static directory"
    echo "Contents of static directory:"
    ls -la static/ || echo "Static directory does not exist"
fi

# Start gunicorn in background
echo "🚀 Starting Gunicorn server..."
gunicorn course_organizer.wsgi:application --config gunicorn.conf.py &

# Wait for gunicorn to start and test health endpoint
echo "⏳ Waiting for Gunicorn to start..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
for i in {1..5}; do
    if curl -f http://localhost:8000/api/ >/dev/null 2>&1; then
        echo "✅ Health endpoint is responding"
        break
    else
        echo "⏳ Health endpoint not ready, attempt $i/5..."
        sleep 5
    fi
done

# Start nginx in foreground
echo "🌐 Starting Nginx server..."
exec nginx -g "daemon off;"
