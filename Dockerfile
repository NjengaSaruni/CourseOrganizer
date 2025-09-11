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
    libjpeg62-turbo-dev \
    zlib1g-dev \
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

# Install frontend dependencies (including dev dependencies for build)
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build:prod

# Copy backend source
WORKDIR /app
COPY backend/ ./

# Run migrations and create UoN Law data
RUN python3 manage.py migrate
RUN python3 manage.py create_uon_law_data

# Collect static files first
RUN python3 manage.py collectstatic --noinput

# Copy Angular build to static directory (after collectstatic)
RUN cp -r frontend/dist/course-organizer/browser/* static/

# Expose port (Railway provides PORT env var)
EXPOSE 8080

# Start command - Railway will set PORT automatically
CMD gunicorn course_organizer.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120