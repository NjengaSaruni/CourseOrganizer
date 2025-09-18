#!/bin/bash

# Course Organizer GCE Startup Script
# This script runs when the VM starts up to install Docker and prerequisites

set -e

echo "🚀 Course Organizer GCE Startup Script"
echo "======================================"
echo "Starting at: $(date)"

# Update system packages
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    unzip \
    wget \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose (standalone)
echo "🔧 Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/course-organizer
chown ubuntu:ubuntu /opt/course-organizer

# Create a simple welcome page for testing
echo "🌐 Creating welcome page..."
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Course Organizer - GCE Deployment</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 3px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Course Organizer</h1>
            <h2>GCE Deployment Ready</h2>
        </div>
        
        <div class="status">
            <h3>✅ VM Setup Complete</h3>
            <p>The Course Organizer VM has been successfully set up with:</p>
            <ul>
                <li>Docker and Docker Compose</li>
                <li>Nginx web server</li>
                <li>Certbot for SSL certificates</li>
                <li>All necessary dependencies</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>📋 Next Steps</h3>
            <p>To deploy the Course Organizer application:</p>
            <ol>
                <li>Connect to the VM: <span class="code">gcloud compute ssh course-organizer-app --zone=us-central1-a</span></li>
                <li>Navigate to the app directory: <span class="code">cd /opt/course-organizer</span></li>
                <li>Clone your repository or upload your code</li>
                <li>Run the deployment script</li>
                <li>Configure your domain and SSL certificates</li>
            </ol>
        </div>
        
        <div class="info">
            <h3>🌐 VM Information</h3>
            <p><strong>External IP:</strong> <span id="external-ip">Loading...</span></p>
            <p><strong>Internal IP:</strong> <span id="internal-ip">Loading...</span></p>
            <p><strong>Zone:</strong> us-central1-a</p>
            <p><strong>Machine Type:</strong> e2-medium</p>
        </div>
        
        <div class="info">
            <h3>📞 Support</h3>
            <p>This VM is ready for Course Organizer deployment. All prerequisites have been installed and configured.</p>
        </div>
    </div>
    
    <script>
        // Get VM metadata
        fetch('http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip', {
            headers: {'Metadata-Flavor': 'Google'}
        })
        .then(response => response.text())
        .then(ip => document.getElementById('external-ip').textContent = ip)
        .catch(() => document.getElementById('external-ip').textContent = 'Not available');
        
        fetch('http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/ip', {
            headers: {'Metadata-Flavor': 'Google'}
        })
        .then(response => response.text())
        .then(ip => document.getElementById('internal-ip').textContent = ip)
        .catch(() => document.getElementById('internal-ip').textContent = 'Not available');
    </script>
</body>
</html>
EOF

# Configure Nginx
echo "⚙️ Configuring Nginx..."
systemctl start nginx
systemctl enable nginx

# Create a basic Nginx configuration for the application
cat > /etc/nginx/sites-available/course-organizer << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Redirect HTTP to HTTPS (will be configured after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    # For now, serve the welcome page
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Proxy to Django app (will be configured after deployment)
    # location /api/ {
    #     proxy_pass http://localhost:8080;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }
}

# HTTPS configuration (will be enabled after SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com;
#     
#     ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
#     
#     root /var/www/html;
#     index index.html;
#     
#     location / {
#         try_files $uri $uri/ =404;
#     }
# }
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/course-organizer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl reload nginx

# Create deployment user and directory structure
echo "👤 Setting up deployment environment..."
useradd -m -s /bin/bash deploy || true
usermod -aG docker deploy
mkdir -p /home/deploy/apps
chown deploy:deploy /home/deploy/apps

# Create deployment script template
cat > /home/deploy/deploy-course-organizer.sh << 'EOF'
#!/bin/bash
# Course Organizer Deployment Script for GCE
# This script should be run on the VM after connecting

set -e

APP_DIR="/home/deploy/apps/course-organizer"
REPO_URL="https://github.com/your-username/course-organizer.git"  # Update this

echo "🚀 Deploying Course Organizer to GCE..."

# Clone or update the repository
if [ -d "$APP_DIR" ]; then
    echo "📁 Updating existing repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "📁 Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Build and run with Docker Compose
echo "🐳 Building and starting containers..."
docker-compose down || true
docker-compose build
docker-compose up -d

echo "✅ Deployment complete!"
echo "Application should be available at: http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H 'Metadata-Flavor: Google')"
EOF

chmod +x /home/deploy/deploy-course-organizer.sh
chown deploy:deploy /home/deploy/deploy-course-organizer.sh

# Set up log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/course-organizer << 'EOF'
/var/log/course-organizer/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# Create log directory
mkdir -p /var/log/course-organizer

echo ""
echo "✅ GCE Startup Script Complete!"
echo "================================"
echo "VM is ready for Course Organizer deployment"
echo "External IP: $(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H 'Metadata-Flavor: Google')"
echo "Completed at: $(date)"
