# Railway Deployment Guide

## Overview
This guide covers deploying the Course Organizer application to Railway with multiple deployment options.

## Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account
- Python 3.x
- Node.js 18+

## Deployment Options

### 🚀 Option 1: First-Time Deployment (Recommended)
**Use this for your very first deployment to Railway**

```bash
./railway-first-deploy.sh
```

**What it does:**
- ✅ Checks prerequisites
- ✅ Logs you into Railway
- ✅ Creates new Railway project
- ✅ Adds PostgreSQL database service
- ✅ Sets up all environment variables
- ✅ Deploys the application
- ✅ Provides monitoring instructions

### ⚡ Option 2: Quick Deploy
**Use this for subsequent deployments**

```bash
./railway-deploy.sh
```

**What it does:**
- ✅ Quick setup and deployment
- ✅ Sets environment variables
- ✅ Deploys to existing project

### 🔧 Option 3: Comprehensive Deploy
**Use this for full setup with validation**

```bash
./deploy-railway.sh
```

**What it does:**
- ✅ Full validation and setup
- ✅ Creates configuration files
- ✅ Comprehensive error checking
- ✅ Interactive deployment

### 📝 Option 4: Simple Deploy (Manual Variables)
**Use this if you prefer manual environment variable setup**

```bash
./railway-simple.sh
```

**What it does:**
- ✅ Creates project and database
- ✅ Shows environment variables to set manually
- ✅ Waits for your confirmation
- ✅ Deploys the application

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
railway add postgresql
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
- Ensure PostgreSQL service is added: `railway add postgresql`
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
├── nixpacks.toml          # Build configuration
├── .railwayignore         # Files to exclude
├── railway-first-deploy.sh # First-time deployment
├── railway-deploy.sh      # Quick deployment
├── deploy-railway.sh      # Comprehensive deployment
└── railway-simple.sh      # Manual variables deployment
```

## First-Time Deployment Checklist

- [ ] Railway CLI installed
- [ ] Logged into Railway account
- [ ] In project root directory
- [ ] All prerequisites installed (Python, Node.js)
- [ ] Run `./railway-first-deploy.sh`
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