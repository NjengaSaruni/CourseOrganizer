# Media Files Protection Guide

## Problem
During redeployment, media files (uploaded course materials, PDFs, images) can disappear if proper precautions aren't taken.

## Root Cause
While Docker volumes are configured correctly to persist data, media files can be lost if:
1. Someone runs `docker-compose down -v` (which removes volumes)
2. Volume names change due to project name differences
3. The deployment process isn't followed correctly

## Current Volume Configuration

In `docker-compose.gce.yml`, we have:
```yaml
volumes:
  media_files:    # Persists uploaded files (PDFs, images, etc.)
  static_files:   # Cleared on each deploy (frontend assets)
  db_data:        # Persists database data
  pg_data:        # Persists PostgreSQL data
```

Docker Compose automatically prefixes these with the project name:
- `course-organizer_media_files` ✅ **NEVER DELETE THIS**
- `course-organizer_static_files` (cleared on deploy - OK)
- `course-organizer_db_data` ✅ **NEVER DELETE THIS**
- `course-organizer_pg_data` ✅ **NEVER DELETE THIS**

## ⚠️ CRITICAL: What NOT to Do

**NEVER run these commands:**
```bash
# ❌ DON'T: This removes ALL volumes including media files!
docker-compose down -v

# ❌ DON'T: This deletes the media volume!
docker volume rm course-organizer_media_files

# ❌ DON'T: This deletes the database!
docker volume rm course-organizer_pg_data
docker volume rm course-organizer_db_data
```

## ✅ Safe Deployment Process

### Method 1: Using the Safe Deployment Script (Recommended)

We've created a new safe deployment script that protects media files:

```bash
# From your local machine
./deploy-to-gce-safe.sh
```

This script:
- ✅ Backs up media files before deployment
- ✅ Never touches the media_files volume
- ✅ Only clears static_files (which should be regenerated)
- ✅ Verifies media files after deployment
- ✅ Can restore from backup if needed

### Method 2: Manual Deployment

If deploying manually on the GCE instance:

```bash
# SSH into the server
gcloud compute ssh course-organizer-app --zone us-central1-a

cd /opt/course-organizer

# Pull latest changes
git pull origin main

# Stop containers (WITHOUT removing volumes)
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml down

# Remove ONLY the static files volume (safe to delete)
docker volume rm course-organizer_static_files || true

# Rebuild images
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml build --no-cache

# Start services
docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml up -d
```

## 🔒 Backup and Restore

### Create a Backup

```bash
# On the GCE instance
cd /opt/course-organizer

# Create backup directory
sudo mkdir -p /opt/backups/media

# Backup media files from the Docker volume
docker run --rm \
  -v course-organizer_media_files:/source:ro \
  -v /opt/backups/media:/backup \
  alpine \
  tar czf /backup/media-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .

# List backups
ls -lh /opt/backups/media/
```

### Restore from Backup

```bash
# On the GCE instance
cd /opt/course-organizer

# List available backups
ls -lh /opt/backups/media/

# Restore from a specific backup (replace with your backup filename)
docker run --rm \
  -v course-organizer_media_files:/target \
  -v /opt/backups/media:/backup:ro \
  alpine \
  tar xzf /backup/media-backup-YYYYMMDD-HHMMSS.tar.gz -C /target
```

### Automated Daily Backups

Add this to crontab on the GCE instance:

```bash
# Edit crontab
sudo crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * docker run --rm -v course-organizer_media_files:/source:ro -v /opt/backups/media:/backup alpine tar czf /backup/media-backup-$(date +\%Y\%m\%d-\%H\%M\%S).tar.gz -C /source . && find /opt/backups/media/ -name "media-backup-*.tar.gz" -mtime +30 -delete
```

This creates daily backups and keeps them for 30 days.

## 🔍 Verify Media Files

### Check if media volume exists:
```bash
docker volume ls | grep media_files
```

### Check files in the volume:
```bash
docker run --rm -v course-organizer_media_files:/media alpine ls -lah /media
```

### Check from within the running container:
```bash
docker exec course-organizer-backend ls -lah /app/media
```

### Check media file count:
```bash
docker exec course-organizer-backend find /app/media -type f | wc -l
```

## 🚨 Recovery from Accidental Deletion

If media files were accidentally deleted:

1. **Check if backup exists:**
   ```bash
   ls -lh /opt/backups/media/
   ```

2. **Restore from latest backup:**
   ```bash
   LATEST_BACKUP=$(ls -t /opt/backups/media/media-backup-*.tar.gz | head -1)
   docker run --rm \
     -v course-organizer_media_files:/target \
     -v /opt/backups/media:/backup:ro \
     alpine \
     tar xzf /backup/$(basename $LATEST_BACKUP) -C /target
   ```

3. **Verify restoration:**
   ```bash
   docker exec course-organizer-backend ls -lah /app/media
   ```

4. **Restart backend:**
   ```bash
   docker restart course-organizer-backend
   ```

## 📊 Monitoring Media Storage

### Check volume size:
```bash
docker system df -v | grep media_files
```

### Check available disk space on host:
```bash
df -h /var/lib/docker
```

### Get detailed volume information:
```bash
docker volume inspect course-organizer_media_files
```

## Best Practices

1. **Always backup before deployment** - Run the backup script before any major changes
2. **Never use `-v` flag** with `docker-compose down` in production
3. **Test deployments** in a staging environment first
4. **Monitor disk usage** to avoid running out of space
5. **Keep multiple backup generations** (at least 7-30 days worth)
6. **Document any manual interventions** for future reference

## Troubleshooting

### Media files not showing in app:
1. Check if volume is mounted: `docker inspect course-organizer-backend | grep media`
2. Check permissions: `docker exec course-organizer-backend ls -la /app/media`
3. Check nginx can access files: `docker exec course-organizer-nginx ls -la /var/www/media`
4. Restart containers: `docker restart course-organizer-backend course-organizer-nginx`

### Upload failing:
1. Check disk space: `df -h`
2. Check permissions: `docker exec course-organizer-backend ls -la /app`
3. Check logs: `docker logs course-organizer-backend --tail 100`

### Volume disappeared:
1. Check if volume exists: `docker volume ls | grep course-organizer`
2. If missing, restore from backup (see Recovery section)
3. If no backup, media files are lost - need to re-upload

## Additional Security

### Create read-only snapshots (GCP-specific):
```bash
# Create a disk snapshot
gcloud compute disks snapshot course-organizer-app \
  --snapshot-names=media-snapshot-$(date +%Y%m%d) \
  --zone=us-central1-a
```

### Export media files to Google Cloud Storage:
```bash
# Install gsutil if not present
# Then backup to GCS
docker run --rm \
  -v course-organizer_media_files:/source:ro \
  google/cloud-sdk:alpine \
  gsutil -m cp -r /source/* gs://your-backup-bucket/media/$(date +%Y%m%d)/
```

## Support

For issues or questions about media file management, refer to:
- Main documentation: `ARCHITECTURE.md`
- Deployment guide: `GCE_DEPLOYMENT.md`
- Troubleshooting: `TROUBLESHOOTING.md`

