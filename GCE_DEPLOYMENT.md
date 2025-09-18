# GCE Deployment Guide

## Overview
This guide covers deploying the Course Organizer application to Google Cloud Engine (GCE) with Docker Compose, Nginx reverse proxy, and SSL/TLS encryption.

## Architecture
- **VM**: Ubuntu 22.04 LTS on GCE
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy + static files)
- **SSL**: Let's Encrypt with Certbot
- **Database**: SQLite (can be upgraded to PostgreSQL)
- **Domain**: `co.riverlearn.co.ke` (configurable)

## Prerequisites
- Google Cloud Platform account
- Domain name with DNS control
- `gcloud` CLI installed and configured

## Quick Start

### 1. Create GCE VM
```bash
./create-gce-vm.sh
```

### 2. Deploy Application
```bash
# Package and upload to VM
tar -czf course-organizer.tar.gz --exclude=node_modules --exclude=venv --exclude=.git .
gcloud compute scp course-organizer.tar.gz ubuntu@course-organizer-app:/tmp/ --zone=us-central1-a

# Extract and start services
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command "
  cd /opt && sudo rm -rf course-organizer && sudo mkdir -p course-organizer
  sudo tar -xzf /tmp/course-organizer.tar.gz -C course-organizer --strip-components=0
  sudo chown -R ubuntu:ubuntu course-organizer
  cd course-organizer
  cp docker-compose.gce.env.example docker-compose.gce.env
  # Edit docker-compose.gce.env with your values
  docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d
"
```

### 3. Configure SSL
```bash
# Issue SSL certificate
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command "
  cd /opt/course-organizer
  docker run --rm -v course-organizer_certbot-webroot:/var/www/certbot -v course-organizer_letsencrypt:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot -d co.riverlearn.co.ke --agree-tos -m admin@riverlearn.co.ke --no-eff-email --non-interactive
"
```

## Environment Configuration

### Required Environment Variables
Create `docker-compose.gce.env` with:

```env
# Security
SECRET_KEY=your-secret-key-here
ADMIN_PASSWORD=your-admin-password

# Domain Configuration
ALLOWED_HOSTS=co.riverlearn.co.ke,34.121.171.1
CORS_ALLOWED_ORIGINS=https://co.riverlearn.co.ke,https://jitsi.riverlearn.co.ke
CSRF_TRUSTED_ORIGINS=https://co.riverlearn.co.ke

# Email Configuration
EMAIL_HOST_USER=noreply@riverlearn.co.ke
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=Course Organizer <noreply@riverlearn.co.ke>
FRONTEND_URL=https://co.riverlearn.co.ke

# Database
DATABASE_URL=sqlite:///app/db/db.sqlite3

# Jitsi Configuration
JITSI_DOMAIN=jitsi.riverlearn.co.ke
JITSI_APP_ID=course-organizer
JITSI_AUDIENCE=jitsi
JITSI_ISSUER=course-organizer
JITSI_PRIVATE_KEY=your-jitsi-private-key
JITSI_PUBLIC_KEY=your-jitsi-public-key
```

## Deployment Commands

### Start Services
```bash
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d
```

### View Logs
```bash
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs -f
```

### Restart Services
```bash
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml restart
```

### Update Application
```bash
# Rebuild and restart
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d --build
```

### SSL Certificate Renewal
Certificates auto-renew via the `certbot` service. Manual renewal:
```bash
docker run --rm -v course-organizer_certbot-webroot:/var/www/certbot -v course-organizer_letsencrypt:/etc/letsencrypt certbot/certbot renew
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec nginx nginx -s reload
```

## File Structure
```
/opt/course-organizer/
├── docker-compose.gce.yml          # Main compose file
├── docker-compose.gce.env          # Environment variables
├── docker-compose.gce.env.example  # Environment template
├── Dockerfile.gce                  # Multi-stage build
├── nginx.gce.conf                  # Nginx configuration
├── backend/startup.sh              # Backend startup script
└── ssl/                            # SSL certificates (mounted)
```

## Health Checks
- **Application**: `https://co.riverlearn.co.ke/health`
- **API**: `https://co.riverlearn.co.ke/api/`
- **Admin**: `https://co.riverlearn.co.ke/admin/`

## Monitoring
```bash
# Container status
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml ps

# Resource usage
docker stats

# Logs
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs backend
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs nginx
```

## Troubleshooting

### SSL Issues
```bash
# Check certificate status
docker run --rm -v course-organizer_letsencrypt:/etc/letsencrypt certbot/certbot certificates

# Test SSL configuration
curl -I https://co.riverlearn.co.ke/health
```

### Database Issues
```bash
# Access database
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec backend python manage.py dbshell

# Run migrations
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec backend python manage.py migrate
```

### Container Issues
```bash
# Rebuild specific service
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d --build backend

# View container logs
docker logs course-organizer-backend
docker logs course-organizer-nginx
```

## Security Notes
- SSL/TLS encryption enabled
- CORS properly configured
- Admin password set via environment
- Database stored in persistent volume
- Static files served by Nginx
- Automatic SSL certificate renewal

## Scaling
- VM can be resized in GCE console
- Database can be migrated to Cloud SQL
- Load balancer can be added for multiple VMs
- CDN can be added for static files
