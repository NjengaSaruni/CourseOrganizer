#!/bin/bash

# Course Organizer Backend Startup Script
# This script handles database setup and application startup

set -e

echo "🚀 Starting Course Organizer Backend..."

# Wait for database to be ready (for production deployments)
if [ "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database to be ready..."
    python3 manage.py migrate --check || {
        echo "🗄️ Database not ready, running migrations..."
        python3 manage.py migrate
    }
    
    # Set up academic year and create initial data
    echo "📚 Setting up academic year and initial data..."
    python3 manage.py setup_academic_year
    python3 manage.py create_uon_law_data
else
    # For local development, reset database completely
    echo "🗄️ Resetting database with fresh academic year structure..."
    python3 manage.py reset_database
fi

echo "✅ Database setup complete"

# Start the application
echo "🚀 Starting Gunicorn server..."
exec gunicorn course_organizer.wsgi:application --bind 0.0.0.0:8000
