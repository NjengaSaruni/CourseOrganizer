# Simple Dockerfile (legacy, previously used for Railway). No longer used.
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

# Debug: Check if build was successful
RUN ls -la dist/
RUN ls -la dist/course-organizer/
RUN ls -la dist/course-organizer/browser/ || echo "Browser directory not found"

# Copy backend source
WORKDIR /app
COPY backend/ ./

# Run migrations and create UoN Law data
RUN python3 manage.py migrate
RUN python3 manage.py create_uon_law_data
# Demo data creation removed for production deployment

# Collect static files first
RUN python3 manage.py collectstatic --noinput

# Debug: Check static directory before copying
RUN ls -la static/ || echo "Static directory not found"

# Copy Angular build to static directory (after collectstatic)
RUN mkdir -p static/browser
RUN cp -r frontend/dist/course-organizer/browser/* static/browser/

# Debug: Check static directory after copying
RUN ls -la static/
RUN ls -la static/browser/
RUN ls -la static/browser/index.html || echo "index.html not found in static/browser/"

# Make startup script executable
RUN chmod +x startup.sh

# Expose port
EXPOSE 8080

# Start command
CMD ["./startup.sh"]