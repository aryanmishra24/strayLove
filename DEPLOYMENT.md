# StrayLove Deployment Guide

## Overview
This guide covers deploying both the backend (Spring Boot) and frontend (React) of the StrayLove application to production.

## Backend Deployment (Render)

### 1. Prerequisites
- Render account
- Cloudinary account (for image storage)
- PostgreSQL database (already configured on Render)

### 2. Environment Variables
Set these environment variables in your Render backend service:

```bash
# Database (already configured)
DB_URL=jdbc:postgresql://your-db-url
DB_USER=your-db-user
DB_PASS=your-db-password

# JWT Secret (generate a strong one)
JWT_SECRET=your-very-long-jwt-secret-key

# File Storage Strategy
STORAGE_STRATEGY=cloudinary

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server URL (Render will provide this)
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

### 3. Build Configuration
- **Build Command**: `mvn clean install -DskipTests`
- **Start Command**: `java -jar target/stray-love-backend-1.0.0.jar`
- **Runtime**: Java 17

### 4. Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Set the environment variables above
4. Images will be stored in the `straylove/animals` folder

## Frontend Deployment (Vercel/Netlify)

### 1. Environment Variables
Create `.env.production` file:

```bash
# Production API URL (your Render backend URL)
VITE_API_URL=https://your-backend-app-name.onrender.com/api/v1

# Google Maps API Key (optional)
VITE_GOOGLE_MAPS_API=your_google_maps_api_key_here
```

### 2. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard

### 3. Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Production Checklist

### Backend
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Cloudinary account set up
- [ ] JWT secret is strong and secure
- [ ] CORS configured for frontend domain
- [ ] Logging configured appropriately
- [ ] Health check endpoint working

### Frontend
- [ ] Environment variables set
- [ ] API URL points to production backend
- [ ] Google Maps API key configured (if using)
- [ ] Build succeeds without errors
- [ ] Images display correctly
- [ ] Authentication works

### Security
- [ ] HTTPS enabled
- [ ] Environment variables are secure
- [ ] Database credentials are protected
- [ ] JWT secret is not in code
- [ ] CORS is properly configured

## Monitoring & Maintenance

### 1. Logs
- Monitor Render logs for backend errors
- Set up log aggregation if needed
- Monitor Cloudinary usage and costs

### 2. Database
- Regular backups (Render handles this)
- Monitor connection pool usage
- Check for slow queries

### 3. Performance
- Monitor API response times
- Check image upload/download speeds
- Monitor Cloudinary bandwidth usage

## Troubleshooting

### Common Issues

1. **Images not displaying**
   - Check Cloudinary configuration
   - Verify image URLs in database
   - Check CORS settings

2. **Authentication failing**
   - Verify JWT secret is set correctly
   - Check token expiration settings
   - Ensure frontend and backend URLs match

3. **Database connection issues**
   - Verify database credentials
   - Check connection pool settings
   - Monitor database performance

### Support
- Render: Check their documentation and support
- Cloudinary: Check their dashboard and documentation
- Vercel/Netlify: Check their deployment logs

## Cost Optimization

### Render
- Use appropriate instance size
- Monitor usage and scale as needed
- Consider auto-scaling for traffic spikes

### Cloudinary
- Use appropriate transformation settings
- Monitor bandwidth and storage usage
- Consider using free tier for development

### Database
- Monitor query performance
- Use appropriate indexes
- Consider read replicas for high traffic 