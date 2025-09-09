#!/bin/bash

# Course Organizer Development Startup Script

echo "🚀 Starting Course Organizer Development Environment..."

# Check if we're in the right directory
if [ ! -f "docker/docker-compose.yml" ]; then
    echo "❌ Please run this script from the course-organizer root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command_exists docker; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend
echo "🔧 Starting Django backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create demo data
echo "👥 Creating demo data..."
python manage.py create_demo_data

# Start Django server in background
echo "🚀 Starting Django server on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

cd ..

# Start frontend
echo "🎨 Starting Angular frontend..."
cd frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start Angular server
echo "🚀 Starting Angular server on http://localhost:4200"
npm start &
ANGULAR_PID=$!

cd ..

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:8000/api/"
echo "⚙️ Django Admin: http://localhost:8000/admin/"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@uon.ac.ke / admin123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $DJANGO_PID 2>/dev/null
    kill $ANGULAR_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait