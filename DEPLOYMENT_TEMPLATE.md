# Deployment Template for New Environments

This template provides a standardized approach for deploying Course Organizer to new domains/environments.

## Template Variables
Replace these placeholders in all configuration files:

- `{DOMAIN}` - Primary domain (e.g., `co-dev.riverlearn.co.ke`)
- `{VM_NAME}` - GCE VM instance name (e.g., `course-organizer-dev`)
- `{ZONE}` - GCE zone (e.g., `us-central1-a`)
- `{PROJECT_ID}` - GCE project ID
- `{EMAIL}` - Admin email for SSL certificates

## 1. VM Creation Template

### Create VM Script: `create-{VM_NAME}-vm.sh`
```bash
#!/bin/bash
set -e

VM_NAME="{VM_NAME}"
ZONE="{ZONE}"
PROJECT_ID="{PROJECT_ID}"

echo "🚀 Creating GCE VM: $VM_NAME"
echo "================================"

# Create VM instance
gcloud compute instances create $VM_NAME \
    --zone=$ZONE \
    --machine-type=e2-medium \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --create-disk=auto-delete=yes,boot=yes,device-name=$VM_NAME,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20231213,mode=rw,size=20,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-standard \
    --no-shielded-secure-boot \
    --shielded-vm-integrity-monitoring \
    --shielded-vm-learned-integrity-monitoring \
    --labels=purpose=course-organizer,environment=production \
    --reservation-affinity=any

# Configure firewall
gcloud compute firewall-rules create allow-http-https-$VM_NAME \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server,https-server

# Add tags to VM
gcloud compute instances add-tags $VM_NAME \
    --zone=$ZONE \
    --tags=http-server,https-server

echo "✅ VM created: $VM_NAME"
echo "🌐 External IP:"
gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

## 2. Environment Configuration Template

### Environment File: `docker-compose.{DOMAIN}.env`
```env
# Security
SECRET_KEY=your-secret-key-here
ADMIN_PASSWORD=your-admin-password

# Domain Configuration
ALLOWED_HOSTS={DOMAIN},{VM_IP}
CORS_ALLOWED_ORIGINS=https://{DOMAIN},https://jitsi.riverlearn.co.ke
CSRF_TRUSTED_ORIGINS=https://{DOMAIN}

# Email Configuration
EMAIL_HOST_USER=noreply@riverlearn.co.ke
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=Course Organizer <noreply@riverlearn.co.ke>
FRONTEND_URL=https://{DOMAIN}

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

## 3. Docker Compose Template

### Compose File: `docker-compose.{DOMAIN}.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.gce
    container_name: course-organizer-backend-{DOMAIN}
    restart: unless-stopped
    env_file:
      - docker-compose.{DOMAIN}.env
    ports:
      - "8080:8080"
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS:-localhost,127.0.0.1,{DOMAIN}}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-https://{DOMAIN},https://jitsi.riverlearn.co.ke}
      - CSRF_TRUSTED_ORIGINS=${CSRF_TRUSTED_ORIGINS:-https://{DOMAIN}}
      - EMAIL_HOST=${EMAIL_HOST:-smtp.googlemail.com}
      - EMAIL_PORT=${EMAIL_PORT:-465}
      - EMAIL_USE_TLS=${EMAIL_USE_TLS:-False}
      - EMAIL_USE_SSL=${EMAIL_USE_SSL:-True}
      - EMAIL_HOST_USER=${EMAIL_HOST_USER}
      - EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}
      - DEFAULT_FROM_EMAIL=${DEFAULT_FROM_EMAIL:-Course Organizer <noreply@riverlearn.co.ke>}
      - FRONTEND_URL=${FRONTEND_URL:-https://{DOMAIN}}
      - DATABASE_URL=${DATABASE_URL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - JITSI_DOMAIN=${JITSI_DOMAIN:-jitsi.riverlearn.co.ke}
      - JITSI_APP_ID=${JITSI_APP_ID:-course-organizer}
      - JITSI_AUDIENCE=${JITSI_AUDIENCE:-jitsi}
      - JITSI_ISSUER=${JITSI_ISSUER:-course-organizer}
      - JITSI_PRIVATE_KEY=${JITSI_PRIVATE_KEY}
      - JITSI_PUBLIC_KEY=${JITSI_PUBLIC_KEY}
    volumes:
      - static_files_{DOMAIN}:/app/static
      - media_files_{DOMAIN}:/app/media
      - db_data_{DOMAIN}:/app/db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: course-organizer-nginx-{DOMAIN}
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.{DOMAIN}.conf:/etc/nginx/nginx.conf:ro
      - static_files_{DOMAIN}:/var/www/static:ro
      - media_files_{DOMAIN}:/var/www/media:ro
      - ./ssl:/etc/nginx/ssl:ro
      - certbot-webroot_{DOMAIN}:/var/www/certbot
      - letsencrypt_{DOMAIN}:/etc/letsencrypt
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  certbot:
    image: certbot/certbot:latest
    container_name: course-organizer-certbot-{DOMAIN}
    restart: unless-stopped
    volumes:
      - certbot-webroot_{DOMAIN}:/var/www/certbot
      - letsencrypt_{DOMAIN}:/etc/letsencrypt
    entrypoint: /bin/sh
    command: -c "trap 'exit 0' TERM; while :; do certbot renew --webroot -w /var/www/certbot --quiet --deploy-hook 'nginx -s reload' || true; sleep 12h; done"
    depends_on:
      - nginx

volumes:
  static_files_{DOMAIN}:
  media_files_{DOMAIN}:
  db_data_{DOMAIN}:
  certbot-webroot_{DOMAIN}:
  letsencrypt_{DOMAIN}:
```

## 4. Nginx Configuration Template

### Nginx Config: `nginx.{DOMAIN}.conf`
```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;
    client_max_body_size 50m;

    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    upstream backend_app {
        server backend:8080;
        keepalive 32;
    }

    server {
        listen 80;
        server_name {DOMAIN};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name {DOMAIN};

        ssl_certificate /etc/letsencrypt/live/{DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/{DOMAIN}/privkey.pem;

        # SSL configuration
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 8.8.8.8 8.8.4.4 valid=300s;
        resolver_timeout 5s;

        root /var/www/static;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /media/ {
            alias /var/www/media/;
        }

        location /health {
            access_log off;
            add_header Content-Type text/plain;
            return 200 "ok";
        }
    }
}
```

## 5. Deployment Script Template

### Deploy Script: `deploy-{DOMAIN}.sh`
```bash
#!/bin/bash
set -e

DOMAIN="{DOMAIN}"
VM_NAME="{VM_NAME}"
ZONE="{ZONE}"

echo "🚀 Deploying Course Organizer to $DOMAIN"
echo "========================================"

# Get VM IP
VM_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo "📍 VM IP: $VM_IP"

# Package application
echo "📦 Packaging application..."
tar -czf course-organizer.tar.gz --exclude=node_modules --exclude=venv --exclude=.git .

# Upload to VM
echo "⬆️  Uploading to VM..."
gcloud compute scp course-organizer.tar.gz ubuntu@$VM_NAME:/tmp/ --zone=$ZONE

# Deploy on VM
echo "🚀 Deploying on VM..."
gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command "
  set -e
  cd /opt
  sudo rm -rf course-organizer
  sudo mkdir -p course-organizer
  sudo tar -xzf /tmp/course-organizer.tar.gz -C course-organizer --strip-components=0
  sudo chown -R ubuntu:ubuntu course-organizer
  cd course-organizer
  
  # Create environment file
  cp docker-compose.gce.env.example docker-compose.$DOMAIN.env
  sed -i 's/co.riverlearn.co.ke/$DOMAIN/g' docker-compose.$DOMAIN.env
  sed -i 's/34.121.171.1/$VM_IP/g' docker-compose.$DOMAIN.env
  
  # Create nginx config
  cp nginx.gce.conf nginx.$DOMAIN.conf
  sed -i 's/co.riverlearn.co.ke/$DOMAIN/g' nginx.$DOMAIN.conf
  
  # Create compose file
  cp docker-compose.gce.yml docker-compose.$DOMAIN.yml
  sed -i 's/course-organizer-/course-organizer-$DOMAIN-/g' docker-compose.$DOMAIN.yml
  sed -i 's/docker-compose.gce.env/docker-compose.$DOMAIN.env/g' docker-compose.$DOMAIN.yml
  sed -i 's/nginx.gce.conf/nginx.$DOMAIN.conf/g' docker-compose.$DOMAIN.yml
  
  # Start services
  docker compose --env-file docker-compose.$DOMAIN.env -f docker-compose.$DOMAIN.yml up -d
"

# Issue SSL certificate
echo "🔒 Issuing SSL certificate..."
gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command "
  cd /opt/course-organizer
  docker run --rm -v course-organizer_certbot-webroot_$DOMAIN:/var/www/certbot -v course-organizer_letsencrypt_$DOMAIN:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --agree-tos -m {EMAIL} --no-eff-email --non-interactive
"

echo "✅ Deployment complete!"
echo "🌐 Application: https://$DOMAIN"
echo "🏥 Health: https://$DOMAIN/health"
echo "🔧 Admin: https://$DOMAIN/admin"
```

## Usage Example

For `co-dev.riverlearn.co.ke`:

1. **Create VM**: `./create-course-organizer-dev-vm.sh`
2. **Deploy**: `./deploy-co-dev.riverlearn.co.ke.sh`
3. **Configure DNS**: Point `co-dev.riverlearn.co.ke` to VM IP
4. **Access**: `https://co-dev.riverlearn.co.ke`

## Notes
- Each environment gets isolated Docker volumes
- SSL certificates are domain-specific
- Environment files are domain-specific
- Container names include domain for uniqueness
- All configurations are templated for easy replication
