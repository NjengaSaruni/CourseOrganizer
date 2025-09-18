#!/bin/bash

# Course Organizer GCE VM Creation Script
# This script creates a Google Cloud Engine VM instance for the Course Organizer application

set -e

# Configuration
VM_NAME="course-organizer-app"
MACHINE_TYPE="e2-medium"  # 2 vCPUs, 4 GB RAM
ZONE="us-central1-a"
BOOT_DISK_SIZE="20GB"
BOOT_DISK_TYPE="pd-standard"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
FIREWALL_TAG="course-organizer-web"

echo "🚀 Creating GCE VM for Course Organizer..."
echo "=============================================="

# Check if VM already exists
if gcloud compute instances describe $VM_NAME --zone=$ZONE --quiet 2>/dev/null; then
    echo "⚠️  VM '$VM_NAME' already exists in zone '$ZONE'"
    echo "Current status:"
    gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)"
    echo ""
    echo "To delete and recreate, run:"
    echo "gcloud compute instances delete $VM_NAME --zone=$ZONE --quiet"
    echo ""
    read -p "Do you want to continue with the existing VM? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
else
    echo "Creating new VM instance: $VM_NAME"
    
    # Create the VM instance
    gcloud compute instances create $VM_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --boot-disk-size=$BOOT_DISK_SIZE \
        --boot-disk-type=$BOOT_DISK_TYPE \
        --image-family=$IMAGE_FAMILY \
        --image-project=$IMAGE_PROJECT \
        --tags=$FIREWALL_TAG \
        --metadata-from-file startup-script=gce-startup-script.sh \
        --scopes=https://www.googleapis.com/auth/cloud-platform
    
    echo "✅ VM instance '$VM_NAME' created successfully!"
fi

# Create firewall rule for HTTP/HTTPS traffic
echo ""
echo "🔧 Setting up firewall rules..."

# Check if firewall rule already exists
if ! gcloud compute firewall-rules describe allow-course-organizer-web --quiet 2>/dev/null; then
    echo "Creating firewall rule for web traffic..."
    gcloud compute firewall-rules create allow-course-organizer-web \
        --allow tcp:80,tcp:443,tcp:8080 \
        --source-ranges 0.0.0.0/0 \
        --target-tags $FIREWALL_TAG \
        --description "Allow HTTP, HTTPS, and port 8080 for Course Organizer"
    
    echo "✅ Firewall rule created successfully!"
else
    echo "✅ Firewall rule already exists"
fi

# Get the external IP
echo ""
echo "🌐 Getting VM information..."
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
INTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].networkIP)")

echo "VM Details:"
echo "  Name: $VM_NAME"
echo "  Zone: $ZONE"
echo "  Machine Type: $MACHINE_TYPE"
echo "  External IP: $EXTERNAL_IP"
echo "  Internal IP: $INTERNAL_IP"
echo "  Firewall Tags: $FIREWALL_TAG"

echo ""
echo "🔑 To connect to the VM:"
echo "  gcloud compute ssh $VM_NAME --zone=$ZONE"

echo ""
echo "📋 Next steps:"
echo "  1. Wait for the VM to finish startup (about 2-3 minutes)"
echo "  2. Connect to the VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "  3. Run the deployment script on the VM"
echo "  4. Configure your domain to point to: $EXTERNAL_IP"

echo ""
echo "✅ GCE VM setup complete!"
echo "External IP: $EXTERNAL_IP"
