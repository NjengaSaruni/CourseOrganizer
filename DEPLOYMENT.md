# Course Organizer - Deployment Guide

This guide covers deploying the Course Organizer application to Render.com.

## Prerequisites

- GitHub repository with the code
- Render.com account
- PostgreSQL database (provided by Render)

## Deployment Options

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Deploy**: Render will automatically detect the `render.yaml` file and deploy all services
3. **Environment Variables**: Set the following environment variables in Render dashboard:
   - `SECRET_KEY`: Generate a secure Django secret key
   - `DEBUG`: Set to `false` for production
   - `ALLOWED_HOSTS`: Set to your Render backend URL
   - `CORS_ALLOWED_ORIGINS`: Set to your Render frontend URL
   - `DATABASE_URL`: Automatically provided by Render PostgreSQL service

### Option 2: Manual Deployment

#### Backend Service

1. **Create Web Service**:
   - Name: `course-organizer-backend`
   - Environment: `Python 3`
   - Build Command: 
     ```bash
     cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py create_demo_data
     ```
   - Start Command: 
     ```bash
     cd backend && gunicorn course_organizer.wsgi:application --bind 0.0.0.0:$PORT
     ```

2. **Environment Variables**:
   - `SECRET_KEY`: Generate a secure Django secret key
   - `DEBUG`: `false`
   - `ALLOWED_HOSTS`: Your backend URL (e.g., `course-organizer-backend.onrender.com`)
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://course-organizer-frontend.onrender.com`)
   - `DATABASE_URL`: From your PostgreSQL service

#### Frontend Service

1. **Create Static Site**:
   - Name: `course-organizer-frontend`
   - Build Command: 
     ```bash
     cd frontend && npm install && npm run build:prod
     ```
   - Publish Directory: `frontend/dist/course-organizer`

2. **Environment Variables**:
   - `API_URL`: Your backend API URL (e.g., `https://course-organizer-backend.onrender.com/api`)

#### Database Service

1. **Create PostgreSQL Service**:
   - Name: `course-organizer-db`
   - Plan: Free tier (or higher for production)

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Debug mode | `false` |
| `ALLOWED_HOSTS` | Allowed hostnames | `course-organizer-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `https://course-organizer-frontend.onrender.com` |
| `DATABASE_URL` | Database connection string | `postgresql://...` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `https://course-organizer-backend.onrender.com/api` |

## Post-Deployment Steps

1. **Verify Services**: Check that all services are running
2. **Test API**: Test the backend API endpoints
3. **Test Frontend**: Verify the frontend loads and can connect to the backend
4. **Demo Data**: Demo data is automatically created during deployment

## Demo Accounts

After deployment, you can use these demo accounts:

**Admin Account:**
- Email: `admin@uon.ac.ke`
- Password: `admin123`
- Registration: `GPR3/000001/2025`

**Student Account:**
- Email: `john.doe@student.uon.ac.ke`
- Password: `student123`
- Registration: `GPR3/123456/2025`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `requirements.txt`
   - Verify Node.js and Python versions are compatible

2. **Database Connection Issues**:
   - Ensure `DATABASE_URL` is set correctly
   - Check that PostgreSQL service is running

3. **CORS Issues**:
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
   - Check that URLs use HTTPS in production

4. **Static Files Issues**:
   - Ensure `whitenoise` is properly configured
   - Check that static files are collected during build

### Logs

- Check Render service logs for detailed error messages
- Backend logs: Available in the Render dashboard
- Frontend logs: Check browser console for client-side errors

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS origins to your frontend domain only
4. **Database**: Use strong database credentials
5. **Secret Key**: Generate a strong, unique secret key for production

## Scaling

For production use with higher traffic:

1. **Upgrade Plans**: Consider upgrading from free tier
2. **Database**: Use a dedicated PostgreSQL plan
3. **CDN**: Consider using a CDN for static assets
4. **Monitoring**: Set up monitoring and alerting
5. **Backup**: Configure automated database backups

## Support

For deployment issues:
1. Check Render documentation
2. Review service logs
3. Verify environment variables
4. Test locally with production settings