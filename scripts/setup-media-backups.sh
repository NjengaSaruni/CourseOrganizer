#!/bin/bash

# Setup Automated Media File Backups on GCE
# Run this script ONCE on the GCE instance to set up daily backups

set -e

BACKUP_DIR="/opt/backups"
RETENTION_DAYS=30

echo "🔒 Setting up automated media file backups"
echo "==========================================="

# Create backup directory
echo "📁 Creating backup directory..."
sudo mkdir -p $BACKUP_DIR/media
sudo chown ubuntu:ubuntu $BACKUP_DIR/media

# Create backup script
echo "📝 Creating backup script..."
cat > $BACKUP_DIR/backup-media.sh << 'BACKUP_SCRIPT'
#!/bin/bash
# Automated Media Backup Script
# Created by setup-media-backups.sh

BACKUP_DIR="/opt/backups/media"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="media-backup-$TIMESTAMP.tar.gz"
RETENTION_DAYS=30

echo "[$(date)] Starting media backup..."

# Create backup from Docker volume
docker run --rm \
  -v course-organizer_media_files:/source:ro \
  -v $BACKUP_DIR:/backup \
  alpine \
  tar czf /backup/$BACKUP_FILE -C /source .

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)
    echo "[$(date)] Backup successful: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Count files in backup
    FILE_COUNT=$(docker run --rm -v course-organizer_media_files:/source:ro alpine find /source -type f | wc -l)
    echo "[$(date)] Backed up $FILE_COUNT files"
    
    # Clean up old backups
    find $BACKUP_DIR -name "media-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
    echo "[$(date)] Cleaned up backups older than $RETENTION_DAYS days"
else
    echo "[$(date)] Backup failed!" >&2
    exit 1
fi

# Log backup summary
TOTAL_BACKUPS=$(ls -1 $BACKUP_DIR/media-backup-*.tar.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "[$(date)] Total backups: $TOTAL_BACKUPS (Total size: $TOTAL_SIZE)"
echo "[$(date)] Backup completed successfully"
BACKUP_SCRIPT

# Make backup script executable
chmod +x $BACKUP_DIR/backup-media.sh
echo "✅ Backup script created at: $BACKUP_DIR/backup-media.sh"

# Test the backup script
echo ""
echo "🧪 Testing backup script..."
$BACKUP_DIR/backup-media.sh

if [ $? -eq 0 ]; then
    echo "✅ Test backup successful!"
    
    # List created backups
    echo ""
    echo "📦 Current backups:"
    ls -lh $BACKUP_DIR/media/media-backup-*.tar.gz 2>/dev/null || echo "No backups found"
else
    echo "❌ Test backup failed!"
    exit 1
fi

# Add to crontab
echo ""
echo "⏰ Setting up daily automated backups..."

# Check if cron job already exists
if sudo crontab -l 2>/dev/null | grep -q "backup-media.sh"; then
    echo "ℹ️  Cron job already exists, skipping..."
else
    # Add cron job (runs at 2 AM daily)
    (sudo crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/backup-media.sh >> /var/log/media-backups.log 2>&1") | sudo crontab -
    echo "✅ Cron job added (runs daily at 2 AM)"
fi

# Create log file
sudo touch /var/log/media-backups.log
sudo chown ubuntu:ubuntu /var/log/media-backups.log
echo "📋 Backup logs will be written to: /var/log/media-backups.log"

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/media-backups > /dev/null << 'LOGROTATE'
/var/log/media-backups.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
LOGROTATE

echo "✅ Log rotation configured"

# Summary
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📊 Backup Configuration:"
echo "  - Backup directory: $BACKUP_DIR/media/"
echo "  - Backup schedule: Daily at 2:00 AM"
echo "  - Retention period: $RETENTION_DAYS days"
echo "  - Log file: /var/log/media-backups.log"
echo ""
echo "📋 Useful Commands:"
echo ""
echo "  Manual backup:"
echo "    $BACKUP_DIR/backup-media.sh"
echo ""
echo "  List backups:"
echo "    ls -lh $BACKUP_DIR/media/"
echo ""
echo "  View backup logs:"
echo "    tail -f /var/log/media-backups.log"
echo ""
echo "  Check cron jobs:"
echo "    sudo crontab -l"
echo ""
echo "  Restore from latest backup:"
echo "    LATEST=\$(ls -t $BACKUP_DIR/media/media-backup-*.tar.gz | head -1)"
echo "    docker run --rm -v course-organizer_media_files:/target -v $BACKUP_DIR/media:/backup:ro alpine tar xzf /backup/\$(basename \$LATEST) -C /target"
echo "    docker restart course-organizer-backend"
echo ""
echo "🎉 Your media files are now backed up automatically!"

