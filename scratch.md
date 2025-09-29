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

## User Password Management

### Change User Password (from local machine)
```bash
# Change password for specific user (GPR31505612025@students.uonbi.ac.ke)
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"GPR31505612025@students.uonbi.ac.ke\"); user.set_password(\"kingjulian\"); user.save(); print(f\"Password changed for {user.email}\")"'

# Change password for any user (replace email and password)
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"USER_EMAIL_HERE\"); user.set_password(\"NEW_PASSWORD_HERE\"); user.save(); print(f\"Password changed for {user.email}\")"'
```

### Check User Status (from local machine)
```bash
# Check if user exists and get details
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"GPR31505612025@students.uonbi.ac.ke\"); print(f\"User: {user.email}\"); print(f\"Active: {user.is_active}\"); print(f\"Verified: {user.email_verified}\"); print(f\"Status: {user.status}\"); print(f\"Class: {user.student_class}\")"'
```

### Reset User Password to Default (from local machine)
```bash
# Reset password to a simple default for testing
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"GPR31505612025@students.uonbi.ac.ke\"); user.set_password(\"password123\"); user.save(); print(f\"Password reset to \'password123\' for {user.email}\")"'
```

### Make User Active and Verified (from local machine)
```bash
# Make user active and verify email
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"GPR31505612025@students.uonbi.ac.ke\"); user.is_active = True; user.email_verified = True; user.status = \"approved\"; user.save(); print(f\"User {user.email} is now active, verified, and approved\")"'
```

### Complete User Setup (Password + Status) (from local machine)
```bash
# Complete setup: change password, make active, verify email, and approve
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); user = U.objects.get(email=\"GPR31505612025@students.uonbi.ac.ke\"); user.set_password(\"password123\"); user.is_active = True; user.email_verified = True; user.status = \"approved\"; user.save(); print(f\"User {user.email} is fully set up with password \'password123\'\")"'
```

# Delete test student
```bash
gcloud compute ssh ubuntu@course-organizer-app --zone=us-central1-a --command 'cd /opt/course-organizer && docker compose --env-file docker-compose.gce.env -f docker-compose.gce.yml exec -T backend python3 manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); print(U.objects.filter(email=\"GPR31505612025@students.uonbi.ac.ke\").delete())"'
```


iq xmlns='jabber:client' id='453e261a-5c50-491c-91c6-5e59cbe81b74:sendIQ' from='jitsi.riverlearn.co.ke' type='result' to='moderator@auth.jitsi.riverlearn.co.ke/lTT4j9VhFt-h'><query xmlns='http://jabber.org/protocol/disco#info'><identity category='component' type='room_metadata' name='metadata.jitsi.riverlearn.co.ke'/><identity category='component' type='av_moderation' name='avmoderation.jitsi.riverlearn.co.ke'/><identity category='component' type='end_conference' name='endconference.jitsi.riverlearn.co.ke'/><identity category='component' type='speakerstats' name='speakerstats.jitsi.riverlearn.co.ke'/><identity category='component' type='polls' name='polls.jitsi.riverlearn.co.ke'/><identity category='component' type='lobbyrooms' name='lobby.jitsi.riverlearn.co.ke'/><identity category='component' type='conference_duration' name='conferenceduration.jitsi.riverlearn.co.ke'/><identity category='server' type='im' name='Prosody'/><identity category='component' type='breakout_rooms' name='breakout.jitsi.riverlearn.co.ke'/><feature var='jabber:iq:roster'/><feature var='http://jabber.org/protocol/disco#info'/><feature var='http://jabber.org/protocol/disco#items'/><feature var='urn:xmpp:ping'/><feature var='jabber:iq:version'/><feature var='jabber:iq:private'/></query></iq>	1284	
11:16:27.314
<iq from="moderator@auth.jitsi.riverlearn.co.ke/lTT4j9VhFt-h" id="fe4b9bba-2b0f-4f1f-8636-bc9b91b77449:sendIQ" to="lobby.jitsi.riverlearn.co.ke" type="get" xmlns="jabber:client"><query node="lobbyrooms" xmlns="http://jabber.org/protocol/disco#info"/></iq>	255	
11:16:27.314
<iq from="moderator@auth.jitsi.riverlearn.co.ke/lTT4j9VhFt-h" id="533404ce-b5a2-41a4-893f-45efa1269209:sendIQ" to="breakout.jitsi.riverlearn.co.ke" type="get" xmlns="jabber:client"><query node="breakout_rooms" xmlns="http://jabber.org/protocol/disco#info"/></iq>	262	
11:16:27.314
<iq xml:lang='en-US' id='33d94fa5-5b0e-4aaa-8602-d881489d1de9:sendIQ' xmlns='jabber:client' to='moderator@auth.jitsi.riverlearn.co.ke/lTT4j9VhFt-h' type='error' from='focus.jitsi.riverlearn.co.ke'><error type='auth'><not-authorized xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/><text xml:lang='en'>not authorized user domain</text></error><conference machine-uid='a2e49480ed6847c787abb294829abc97' xmlns='http://jitsi.org/protocol/focus' room='reliablechambersdesignateabsolutely@conference.jitsi.riverlearn.co.ke'/></iq>	520	
11:16:27.314
<presence type="unavailable" xmlns="jabber:client"/>	52	
11:16:27.315
<close xmlns="urn:ietf:params:xml:ns:xmpp-framing"/>