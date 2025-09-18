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
    cd course-organizer
    
    echo '🛑 Stopping existing services...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml down || true
    
    echo '🏗️  Building and starting updated services...'
    docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d --build
    
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
echo "🎉 Deployment finished! The frontend should now use the local backend instead of Railway."
