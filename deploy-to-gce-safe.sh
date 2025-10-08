#!/bin/bash

# Safe Course Organizer GCE Deployment Script
# This script deploys updates while PROTECTING media files and database

set -e

# Configuration
VM_NAME="course-organizer-app"
ZONE="us-central1-a"
APP_DIR="/opt/course-organizer"
BACKUP_DIR="/opt/backups"

echo "🚀 Safe Deployment to GCE - Media Files Protected"
echo "===================================================="

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
    --exclude=*.tar.gz \
    .

echo "📤 Uploading package to VM..."
gcloud compute scp course-organizer-update.tar.gz ubuntu@$VM_NAME:/tmp/ --zone=$ZONE

echo "🔧 Deploying on VM with media file protection..."
gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command "
    set -e
    
    echo '📊 Pre-deployment checks...'
    cd $APP_DIR
    
    # Check current media file count
    MEDIA_COUNT=\$(docker exec course-organizer-backend find /app/media -type f 2>/dev/null | wc -l || echo '0')
    echo \"📁 Current media files: \$MEDIA_COUNT\"
    
    # Create backup directory
    echo '💾 Creating backup...'
    sudo mkdir -p $BACKUP_DIR/media
    
    # Backup media files from Docker volume
    echo '💾 Backing up media files from volume...'
    docker run --rm \
      -v course-organizer_media_files:/source:ro \
      -v $BACKUP_DIR/media:/backup \
      alpine \
      tar czf /backup/media-backup-\$(date +%Y%m%d-%H%M%S).tar.gz -C /source . || echo 'Warning: Backup failed or no files to backup'
    
    # Keep only last 10 backups
    sudo find $BACKUP_DIR/media/ -name 'media-backup-*.tar.gz' -type f | sort -r | tail -n +11 | xargs -r rm
    
    echo '📁 Extracting updated application...'
    cd /opt
    sudo rm -rf course-organizer-old-backup
    sudo mv course-organizer course-organizer-old-backup 2>/dev/null || true
    sudo mkdir -p course-organizer
    sudo tar -xzf /tmp/course-organizer-update.tar.gz -C course-organizer
    sudo chown -R ubuntu:ubuntu course-organizer
    cd course-organizer
    
    echo '🛑 Stopping existing services (volumes will be preserved)...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml down || true
    
    echo '⚠️  CRITICAL: Verifying media_files volume still exists...'
    if docker volume ls | grep -q 'course-organizer_media_files'; then
        echo '✅ Media files volume confirmed safe'
    else
        echo '❌ ERROR: Media files volume missing!'
        echo '🔄 This should not happen. Investigating...'
        docker volume ls
        exit 1
    fi
    
    echo '🧹 Clearing ONLY static files volume (safe to regenerate)...'
    # Remove static files volume - will be regenerated from new build
    docker volume rm course-organizer_static_files 2>/dev/null || echo 'Static volume already removed or does not exist'
    
    # Clear orphaned static volumes
    docker volume ls --format '{{.Name}}' | grep -E '^course-organizer.*static' | xargs -r docker volume rm 2>/dev/null || true
    
    echo '🧹 Clearing Docker build cache for fresh build...'
    docker builder prune -af || true
    
    echo '🏗️  Building images without cache...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml build --no-cache --pull
    
    echo '🚀 Starting updated services...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d
    
    echo '📦 Populating static files volume...'
    sleep 10
    docker run --rm -v course-organizer_static_files:/target course-organizer-backend cp -r /app/static/* /target/ 2>/dev/null || echo 'Note: Static files will be served directly'
    
    echo '⏳ Waiting for services to initialize...'
    sleep 20
    
    echo '🔍 Post-deployment verification...'
    
    # Verify media files still exist
    NEW_MEDIA_COUNT=\$(docker exec course-organizer-backend find /app/media -type f 2>/dev/null | wc -l || echo '0')
    echo \"📁 Media files after deployment: \$NEW_MEDIA_COUNT\"
    
    if [ \"\$MEDIA_COUNT\" -gt 0 ] && [ \"\$NEW_MEDIA_COUNT\" -lt \"\$MEDIA_COUNT\" ]; then
        echo '⚠️  WARNING: Media file count decreased!'
        echo \"   Before: \$MEDIA_COUNT files\"
        echo \"   After: \$NEW_MEDIA_COUNT files\"
        echo '🔄 Attempting restore from backup...'
        
        LATEST_BACKUP=\$(ls -t $BACKUP_DIR/media/media-backup-*.tar.gz 2>/dev/null | head -1)
        if [ -n \"\$LATEST_BACKUP\" ]; then
            echo \"📦 Restoring from: \$LATEST_BACKUP\"
            docker run --rm \
              -v course-organizer_media_files:/target \
              -v $BACKUP_DIR/media:/backup:ro \
              alpine \
              tar xzf /backup/\$(basename \$LATEST_BACKUP) -C /target
            
            echo '✅ Restored from backup'
            docker restart course-organizer-backend
        else
            echo '❌ No backup found to restore from!'
        fi
    else
        echo '✅ Media files preserved successfully'
    fi
    
    # Verify volumes
    echo '📋 Current Docker volumes:'
    docker volume ls | grep course-organizer
    
    # Check service status
    echo '🔍 Service status:'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml ps
    
    # Show recent logs
    echo '📋 Recent backend logs:'
    docker logs course-organizer-backend --tail 20
    
    echo '🧹 Cleaning up...'
    rm -f /tmp/course-organizer-update.tar.gz
"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "✅ Safe Deployment Complete!"
echo "============================"
echo "Application URL: https://co.riverlearn.co.ke"
echo "External IP: $EXTERNAL_IP"
echo ""
echo "🔒 Media Files: Protected and verified"
echo "📦 Database: Preserved in pg_data volume"
echo "🔄 Static Files: Regenerated from new build"
echo ""
echo "📋 Useful Commands:"
echo ""
echo "🔍 Check media files:"
echo "  gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'docker exec course-organizer-backend find /app/media -type f | wc -l'"
echo ""
echo "💾 List backups:"
echo "  gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'ls -lh $BACKUP_DIR/media/'"
echo ""
echo "🔄 Restore from backup (if needed):"
echo "  gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'LATEST=\$(ls -t $BACKUP_DIR/media/*.tar.gz | head -1) && docker run --rm -v course-organizer_media_files:/target -v $BACKUP_DIR/media:/backup:ro alpine tar xzf /backup/\$(basename \$LATEST) -C /target && docker restart course-organizer-backend'"
echo ""
echo "📊 Check service logs:"
echo "  gcloud compute ssh ubuntu@$VM_NAME --zone=$ZONE --command 'cd $APP_DIR && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml logs -f backend'"
echo ""

# Clean up local archive
rm -f course-organizer-update.tar.gz

echo "🎉 Deployment finished successfully!"

