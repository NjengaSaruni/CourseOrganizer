# Course Organizer - Common Commands

## Important Notes
- **Docker Permission**: All Docker commands require `sudo` on the GCE instance
- **Interactive Commands**: For interactive commands (like `createsuperuser`, `shell`, `bash`), use SSH without `--command` flag first, then run the Docker command
- **TTY Issues**: The `-it` flag doesn't work well with `gcloud compute ssh --command`, so it's removed from non-interactive commands
- **Instance Details**: Commands assume instance name `course-organizer-app` in zone `us-central1-a`

## Admin Password Management

### Check Admin Password from Container Logs (from local machine)
```bash
# Get the generated admin password from startup logs
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-backend | grep -A 5 -B 5 'Generated secure password\|🔑 Password'"

# Or check the full startup log
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-backend | tail -50"
```

### Reset Admin Password (from local machine)
```bash
# Reset admin password (will generate new secure password)
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin reset-password --email admin@uon.ac.ke --force"

# Reset with specific password
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin reset-password --email admin@uon.ac.ke --password 'kingjulian' --force"
```

### Check Admin Status (from local machine)
```bash
# Check if admin user exists and get details
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin status --email admin@uon.ac.ke"
```

### Create New Admin User (from local machine)
```bash
# Create admin with auto-generated password
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin create --email admin@uon.ac.ke"

# Create admin with specific password
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin create --email admin@uon.ac.ke --password 'your_password'"
```

## Container Management

### View Container Status (from local machine)
```bash
# Check all containers
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker ps -a"

# Check specific container logs
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-backend"
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-nginx"
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-postgres"
```

### Restart Services (from local machine)
```bash
# Restart all services
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml restart"

# Restart specific service
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml restart backend"
```

### Access Container Shell (from local machine)
```bash
# Access backend container (interactive - use SSH without --command)
gcloud compute ssh course-organizer-app --zone=us-central1-a
# Then run: sudo docker exec -it course-organizer-backend bash

# Access database container (interactive - use SSH without --command)
gcloud compute ssh course-organizer-app --zone=us-central1-a
# Then run: sudo docker exec -it course-organizer-postgres psql -U course_organizer -d course_organizer
```

## Database Management

### Run Migrations (from local machine)
```bash
# Apply migrations
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py migrate"

# Check migration status
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py showmigrations"
```

### Create Superuser (Alternative Method) (from local machine)
```bash
# Interactive superuser creation (use SSH without --command for interactive)
gcloud compute ssh course-organizer-app --zone=us-central1-a
# Then run: sudo docker exec -it course-organizer-backend python manage.py createsuperuser
```

### Database Shell (from local machine)
```bash
# Django shell (use SSH without --command for interactive)
gcloud compute ssh course-organizer-app --zone=us-central1-a
# Then run: sudo docker exec -it course-organizer-backend python manage.py shell

# Direct PostgreSQL access (use SSH without --command for interactive)
gcloud compute ssh course-organizer-app --zone=us-central1-a
# Then run: sudo docker exec -it course-organizer-postgres psql -U course_organizer -d course_organizer
```

## Environment & Configuration

### Check Environment Variables (from local machine)
```bash
# Check if environment file exists and has content
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cat /opt/course-organizer/docker-compose.gce.env"

# Check specific environment variable in container
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend env | grep ADMIN_PASSWORD"
```

### Update Environment (from local machine)
```bash
# After changing docker-compose.gce.env, restart services
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml down && sudo docker-compose -f docker-compose.gce.yml up -d"
```

## Logs & Debugging

### View Real-time Logs (from local machine)
```bash
# Follow all logs
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml logs -f"

# Follow specific service logs
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml logs -f backend"
```

### Check Application Health (from local machine)
```bash
# Check if backend is responding
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="curl http://localhost:8080/api/"

# Check nginx health
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="curl http://localhost/health"

# Check from external (your domain)
curl https://co.riverlearn.co.ke/api/
```

## Quick Fixes

### If Admin Password is Lost (from local machine)
```bash
# Method 1: Reset password
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py manage_admin reset-password --email admin@uon.ac.ke --force"

# Method 2: Check startup logs for original password
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-backend | grep '🔑 Password'"
```

### If Container Won't Start (from local machine)
```bash
# Check logs for errors
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker logs course-organizer-backend"

# Rebuild and restart
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml down && sudo docker-compose -f docker-compose.gce.yml up -d --build"
```

### If Database Issues (from local machine)
```bash
# Reset database (WARNING: This will delete all data!)
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="cd /opt/course-organizer && sudo docker-compose -f docker-compose.gce.yml down -v && sudo docker-compose -f docker-compose.gce.yml up -d"
```

### If Students Not Assigned to Class (from local machine)
```bash
# Setup school structure and create default class (Class of 2029)
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py setup_school_structure"

# Assign approved students to default class
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py assign_approved_students_to_class"
```

### If Students Can't Access Announcements from UI (from local machine)
```bash
# This was fixed by adding announcements to main navigation
# All students can now access announcements from:
# 1. Main navbar (top navigation)
# 2. Sidebar navigation
# 3. Direct URL: /announcements

# The announcements page shows different UI based on permissions:
# - Class reps: Can create/edit/delete announcements
# - Regular students: Can view announcements only
```

## Development Commands

### Run Tests (from local machine)
```bash
# Run all tests
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py test"

# Run specific app tests
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py test course_api"
```

### Collect Static Files (from local machine)
```bash
# Collect static files
gcloud compute ssh course-organizer-app --zone=us-central1-a --command="sudo docker exec course-organizer-backend python manage.py collectstatic --noinput"
```

## GCE Instance Management

### Check Instance Status
```bash
# List all instances
gcloud compute instances list

# Check specific instance status
gcloud compute instances describe course-organizer-app --zone=us-central1-a
```

### SSH into Instance (Interactive)
```bash
# SSH into the instance for interactive commands
gcloud compute ssh course-organizer-app --zone=us-central1-a
```

### Copy Files to/from Instance
```bash
# Copy file to instance
gcloud compute scp local-file course-organizer-app:/opt/course-organizer/ --zone=us-central1-a

# Copy file from instance
gcloud compute scp course-organizer-app:/opt/course-organizer/file local-file --zone=us-central1-a
```

---

## Notes
- The admin password is auto-generated on first startup if `ADMIN_PASSWORD` is empty in `docker-compose.gce.env`
- Check container logs to find the generated password
- All `gcloud` commands assume your instance is named `course-organizer-app` in zone `us-central1-a`
- Adjust the zone and instance name if different
- Use `docker-compose -f docker-compose.gce.yml` for production environment

# Delete test student
```bash
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); print(U.objects.filter(email=\"GPR31505612025@students.uonbi.ac.ke\").delete())"'
```
