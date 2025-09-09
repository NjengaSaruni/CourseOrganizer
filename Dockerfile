# Simple Dockerfile for Railway deployment
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy backend requirements first (for better caching)
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build:prod

# Copy backend source
WORKDIR /app
COPY backend/ ./

# Create static files directory and copy built frontend
RUN mkdir -p static
RUN cp -r frontend/dist/course-organizer/* static/

# Run migrations and create demo data
RUN python manage.py migrate
RUN python manage.py create_demo_data

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE $PORT

# Start command
CMD gunicorn course_organizer.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120