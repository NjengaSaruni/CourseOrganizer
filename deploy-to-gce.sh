#!/bin/bash

# Course Organizer GCE Deployment Script
# This script deploys the updated application to the GCE instance

set -e

# Configuration
VM_NAME="course-organizer-app"
ZONE="us-central1-a"
APP_DIR="/opt/course-organizer"

echo "🚀 Deploying Course Organizer to GCE..."
echo "======================================="

# Check if VM exists
if ! gcloud compute instances describe $VM_NAME --zone=$ZONE --quiet 2>/dev/null; then
    echo "❌ VM '$VM_NAME' not found in zone '$ZONE'"
    echo "Please create the VM first using: ./create-gce-vm.sh"
    exit 1
fi

# Get VM status
VM_STATUS=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)")
echo "VM Status: $VM_STATUS"

if [ "$VM_STATUS" != "RUNNING" ]; then
    echo "⚠️  VM is not running. Starting VM..."
    gcloud compute instances start $VM_NAME --zone=$ZONE
    echo "⏳ Waiting for VM to start..."
    sleep 30
fi

# Create updated package
echo "📦 Creating deployment package..."
tar -czf course-organizer-update.tar.gz \
    --exclude=node_modules \
    --exclude=venv \
    --exclude=.git \
    --exclude=dist \
    --exclude=course-organizer-update.tar.gz \
    .

echo "📤 Uploading package to VM..."
gcloud compute scp course-organizer-update.tar.gz ubuntu@$VM_NAME:/tmp/ --zone=$ZONE

echo "🔧 Deploying on VM..."
gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command "
    echo '📁 Extracting updated application...'
    cd /opt
    sudo rm -rf course-organizer-backup
    sudo mv course-organizer course-organizer-backup || true
    sudo mkdir -p course-organizer
    sudo tar -xzf /tmp/course-organizer-update.tar.gz -C course-organizer --strip-components=0
    sudo chown -R ubuntu:ubuntu course-organizer
    sudo mkdir -p /opt/course-organizer-data/media
    sudo chown -R ubuntu:ubuntu /opt/course-organizer-data
    cd course-organizer
    
    echo '🛑 Stopping existing services...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml down || true

    if docker volume ls --format '{{.Name}}' | grep -q '^course-organizer_media_files$'; then
        echo '🗃️  Migrating existing media files volume to host bind mount...'
        docker run --rm -v course-organizer_media_files:/source -v /opt/course-organizer-data/media:/target busybox sh -c 'cp -a /source/. /target/' || echo 'Warning: Media files migration failed'
    fi

    echo '🧹 Clearing old static files volume to avoid stale assets (media files are preserved separately)...'
    # Remove persisted static volume so new image assets are not masked
    docker volume ls --format '{{.Name}}' | grep -q '^course-organizer_static_files$' && docker volume rm course-organizer_static_files || true
    
    # Also clear any orphaned volumes with similar names
    docker volume ls --format '{{.Name}}' | grep -E '^course-organizer.*static' | xargs -r docker volume rm || true

    echo '🧹 Clearing Docker build cache to ensure fresh Angular build...'
    # Remove all build cache to ensure Angular build runs fresh
    docker builder prune -af || true

    echo '🏗️  Building images without cache...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml build --no-cache --pull

    echo '🚀 Starting updated services...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d

    echo '📦 Populating static files volume with fresh Angular build...'
    # Wait for backend to start, then copy files from image to volume
    sleep 10
    docker run --rm -v course-organizer_static_files:/target course-organizer-backend cp -r /app/static/* /target/ 2>/dev/null || echo 'Warning: Could not copy static files'
   
    echo '🔍 Verifying Angular build files are present...'
    docker exec course-organizer-backend ls -la /app/static/browser/ | head -10 || echo 'Warning: Angular build files not found'
    
    echo '🔍 Verifying nginx can access the same files...'
    docker exec course-organizer-nginx ls -la /var/www/static/browser/ | head -10 || echo 'Warning: Nginx cannot access Angular build files'
    
    echo '⏳ Waiting for services to start...'
    sleep 30
    
    echo '🔍 Checking service status...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml ps
    
    echo '🧹 Cleaning up...'
    rm -f /tmp/course-organizer-update.tar.gz
"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "✅ Deployment complete!"
echo "======================"
echo "Application URL: https://co.riverlearn.co.ke"
echo "External IP: $EXTERNAL_IP"
echo ""
echo "🔍 To check logs:"
echo "gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'cd $APP_DIR && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs -f'"
echo ""
echo "🔧 To restart services:"
echo "gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'cd $APP_DIR && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml restart'"

# Clean up local archive
rm -f course-organizer-update.tar.gz

echo ""
echo "🎉 Deployment finished! The frontend should now use the updated Angular build."
echo ""
echo "🔍 To verify the deployment:"
echo "1. Check if Angular files are present: gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'docker exec course-organizer-backend ls -la /app/static/browser/'"
echo "2. Check application logs: gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'cd $APP_DIR && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs backend'"
echo ""
echo "🚨 EMERGENCY FIX (if 502 errors):"
echo "gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'cd $APP_DIR && docker run --rm -v course-organizer_static_files:/target course-organizer-backend cp -r /app/static/* /target/'"
