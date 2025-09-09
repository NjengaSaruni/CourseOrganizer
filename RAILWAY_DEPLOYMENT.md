# Railway Deployment Guide

## Overview
This guide covers deploying the Course Organizer application to Railway with multiple deployment options.

## Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account
- Python 3.x
- Node.js 18+

## Deployment Options

### 🚀 Main Deployment Script (Recommended)
**Use this for both first-time and subsequent deployments**

```bash
./railway-deploy.sh
```

**What it does:**
- ✅ Checks prerequisites and authentication
- ✅ Detects first-time vs existing project
- ✅ Sets up project, database, and service (first-time only)
- ✅ Configures Dockerfile deployment
- ✅ Sets up all environment variables
- ✅ Deploys the application
- ✅ Provides monitoring instructions

### 🔧 Service Fix Script
**Use this if you have service linking issues**

```bash
./railway-fix-service.sh
```

**What it does:**
- ✅ Fixes service linking problems
- ✅ Adds missing services
- ✅ Links to correct service
- ✅ Verifies project setup

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Login to Railway
```bash
railway login
```

### 2. Initialize Project
```bash
railway init course-organizer
```

### 3. Add Database
```bash
railway add --database postgres
```

### 4. Set Environment Variables
```bash
# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

# Set variables
railway variables --set "SECRET_KEY=$SECRET_KEY"
railway variables --set "DEBUG=false"
railway variables --set "ALLOWED_HOSTS=*.railway.app"
railway variables --set "CORS_ALLOWED_ORIGINS=https://*.railway.app"
```

### 5. Deploy
```bash
railway up
```

## Environment Variables

### Required
- `SECRET_KEY`: Django secret key (auto-generated)
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Railway)

### Optional
- `DEBUG`: Set to `false` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of CORS origins

## Services

### Backend Service
- **Runtime**: Python 3.11
- **Framework**: Django 5.2.6
- **Server**: Gunicorn
- **Database**: PostgreSQL (provided by Railway)

### Frontend Service
- **Runtime**: Node.js 18+
- **Framework**: Angular 20
- **Build**: Production build with optimization

## Demo Accounts
After deployment, use these accounts:
- **Admin**: admin@uon.ac.ke / admin123
- **Student**: john.doe@student.uon.ac.ke / student123

## Monitoring

### View Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

### Open Dashboard
```bash
railway open
```

### Connect to Database
```bash
railway connect postgresql
```

### View Environment Variables
```bash
railway variables
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
railway logs
```
Check the logs for detailed error messages.

#### 2. Database Connection Issues
- Ensure PostgreSQL service is added: `railway add --database postgres`
- Check `DATABASE_URL` is set: `railway variables`

#### 3. CORS Issues
- Verify `CORS_ALLOWED_ORIGINS` includes your domain
- Check `ALLOWED_HOSTS` is set correctly

#### 4. Static Files Issues
- Ensure frontend build completed successfully
- Check `npm run build:prod` works locally

### Useful Commands

```bash
# View all projects
railway list

# Link to existing project
railway link <project-id>

# Unlink current directory
railway unlink

# Redeploy latest deployment
railway redeploy

# Scale service
railway scale

# View service details
railway service
```

## Project Structure

```
course-organizer/
├── backend/                 # Django backend
├── frontend/               # Angular frontend
├── railway.json           # Railway project config
├── Dockerfile             # Docker build configuration
├── .dockerignore          # Docker build exclusions
├── .railwayignore         # Railway deployment exclusions
├── railway-deploy.sh      # Main deployment script
└── railway-fix-service.sh # Service linking fix script
```

## First-Time Deployment Checklist

- [ ] Railway CLI installed
- [ ] Logged into Railway account
- [ ] In project root directory
- [ ] All prerequisites installed (Python, Node.js)
- [ ] Run `./railway-deploy.sh`
- [ ] Monitor deployment with `railway logs`
- [ ] Test application at provided URL
- [ ] Verify demo accounts work

## Support

If you encounter issues:
1. Check the logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Check Railway status: `railway status`
4. Review this documentation
5. Check Railway documentation: `railway docs`