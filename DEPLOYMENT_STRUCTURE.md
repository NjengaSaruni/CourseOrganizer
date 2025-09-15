# Deployment Structure

This project has two separate deployment environments on Railway:

## Development/Staging Environment

**Script**: `railway-deploy.sh`  
**Railway Project**: `uoncourseorganizer`  
**Dockerfile**: `Dockerfile`  
**Server**: Django development server  
**Purpose**: Development, testing, and staging

### Features:
- Uses Django's built-in development server
- Hot reloading enabled
- Debug mode enabled
- Suitable for development and testing

---

## Production Environment

**Script**: `railway-deploy-prod.sh`  
**Railway Project**: `course-organizer-prod`  
**Dockerfile**: `Dockerfile.prod`  
**Server**: Nginx + Gunicorn  
**Purpose**: Production deployment

### Features:
- Multi-stage Docker build for optimization
- Nginx reverse proxy
- Gunicorn WSGI server
- Static file serving
- Security headers
- Rate limiting
- Production-optimized settings

---

## Usage

### Deploy to Development/Staging:
```bash
./railway-deploy.sh
```
- Automatically switches to `uoncourseorganizer` project
- Links to `course-organizer-backend` service
- Uses Django development server

### Deploy to Production:
```bash
./railway-deploy-prod.sh
```
- Automatically switches to `course-organizer-prod` project  
- Links to `course-organizer-prod-backend` service
- Uses Nginx + Gunicorn production server

---

## Project Switching

Both scripts now properly handle Railway project switching:

- **Development Script**: Automatically switches to `uoncourseorganizer` project
- **Production Script**: Automatically switches to `course-organizer-prod` project

The scripts will:
1. Handle Railway configuration files appropriately:
   - **Development**: Removes `railway.json` (production config) and uses `Dockerfile` + `startup.sh`
   - **Production**: Ensures `railway.json` exists and uses `Dockerfile.prod` + `startup-prod.sh`
2. Attempt to link to the target project
3. If project doesn't exist, create it with the correct name
4. Link to the appropriate service within that project
5. Verify the connection before proceeding with deployment

---

## Configuration Files

### Railway Configuration (`railway.json`)
- **Development**: File is temporarily removed during deployment to prevent production config interference
- **Production**: File is required and specifies `Dockerfile.prod` and production startup script

### Dockerfiles
- **Development**: Uses `Dockerfile` (simple Python setup with Django dev server)
- **Production**: Uses `Dockerfile.prod` (multi-stage build with Nginx + Gunicorn)

### Startup Scripts
- **Development**: `backend/startup.sh` - Django development server
- **Production**: `backend/startup-prod.sh` - Nginx + Gunicorn production server

---

## Environment Variables

Both environments use the same environment variables but with different values:
- `DEBUG`: `True` for dev, `False` for prod
- `SECRET_KEY`: Generated automatically
- Database URL: Provided by Railway PostgreSQL addon
- CORS settings: Configured for respective domains

---

## Domains

- **Development**: Railway's default domain
- **Production**: Custom domain `co.riverlearn.co.ke` (if configured)
