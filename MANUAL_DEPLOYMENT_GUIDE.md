# 🚀 Manual AWS Deployment Guide for StrayLove

This guide will help you deploy StrayLove to AWS using **AWS Amplify** (frontend) and **AWS Elastic Beanstalk** (backend).

## 📋 Prerequisites

- ✅ AWS Account with billing set up
- ✅ AWS CLI installed and configured
- ✅ Docker installed and running
- ✅ Git repository with your code

## 🎯 Step-by-Step Deployment

### Step 1: Set Up IAM Permissions

1. **Go to AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Find your user**: `straylove-admin`
3. **Add permissions**:
   - Click "Add permissions"
   - Choose "Attach policies directly"
   - Search and select these policies:
     - `AmazonEC2FullAccess`
     - `AmazonRDSFullAccess`
     - `AmazonS3FullAccess`
     - `AmazonElasticBeanstalkFullAccess`
     - `AWSAmplifyAdmin`
   - Click "Next" and "Add permissions"

### Step 2: Deploy Backend to Elastic Beanstalk

#### 2.1 Create Backend Package

```bash
cd backend
./mvnw clean package -DskipTests
```

#### 2.2 Go to Elastic Beanstalk Console

1. **Open**: https://console.aws.amazon.com/elasticbeanstalk/
2. **Click**: "Create application"
3. **Application name**: `straylove-backend`
4. **Platform**: Docker
5. **Platform branch**: Docker running on 64bit Amazon Linux 2
6. **Platform version**: Latest
7. **Application code**: Upload your code
8. **Click**: "Configure more options"

#### 2.3 Configure Environment

1. **Software**:
   - Add environment variables:
     ```
     SPRING_PROFILES_ACTIVE=prod
     DB_URL=jdbc:postgresql://your-rds-endpoint:5432/straylove
     DB_USER=straylove_user
     DB_PASS=your-db-password
     JWT_SECRET=your-jwt-secret
     CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
     CLOUDINARY_API_KEY=your-cloudinary-api-key
     CLOUDINARY_API_SECRET=your-cloudinary-api-secret
     ```

2. **Instances**:
   - Instance type: `t3.micro` (free tier)
   - Enable load balancing: Yes

3. **Capacity**:
   - Environment type: Load balanced
   - Min instances: 1
   - Max instances: 2

4. **Click**: "Create environment"

#### 2.4 Set Up Database (RDS)

1. **Go to RDS Console**: https://console.aws.amazon.com/rds/
2. **Click**: "Create database"
3. **Engine type**: PostgreSQL
4. **Template**: Free tier
5. **DB instance identifier**: `straylove-db`
6. **Master username**: `straylove_user`
7. **Master password**: Create a strong password
8. **VPC**: Default VPC
9. **Public access**: Yes (for now)
10. **Click**: "Create database"

### Step 3: Deploy Frontend to Amplify

#### 3.1 Prepare Frontend

```bash
cd frontend
npm install
npm run build
```

#### 3.2 Go to Amplify Console

1. **Open**: https://console.aws.amazon.com/amplify/
2. **Click**: "New app" → "Host web app"
3. **Choose**: "GitHub" (or your Git provider)
4. **Connect repository**: Select your StrayLove repository
5. **Branch**: `main` (or your default branch)

#### 3.3 Configure Build Settings

Amplify will auto-detect React settings, but verify:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### 3.4 Add Environment Variables

Add these environment variables in Amplify:

```
REACT_APP_API_URL=https://your-elastic-beanstalk-url.elasticbeanstalk.com
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### 3.5 Deploy

1. **Click**: "Save and deploy"
2. **Wait**: 5-10 minutes for deployment
3. **Get URL**: Your app will be available at `https://random-id.amplifyapp.com`

### Step 4: Connect Backend and Frontend

#### 4.1 Update Frontend API URL

1. **Go to Amplify Console**
2. **Click**: "Environment variables"
3. **Add**: `REACT_APP_API_URL` with your Elastic Beanstalk URL
4. **Redeploy**: Trigger a new deployment

#### 4.2 Update CORS in Backend

Add your Amplify domain to CORS configuration in your Spring Boot app.

### Step 5: Test Your Deployment

1. **Frontend**: Visit your Amplify URL
2. **Register**: Create a new user account
3. **Test features**: Report animals, view dashboard, etc.
4. **Check logs**: Monitor CloudWatch logs for any errors

## 🔧 Troubleshooting

### Common Issues

**Issue**: Backend not starting
**Solution**: 
- Check Elastic Beanstalk logs
- Verify environment variables
- Check database connectivity

**Issue**: Frontend can't connect to backend
**Solution**:
- Verify CORS configuration
- Check API URL in environment variables
- Test backend endpoint directly

**Issue**: Database connection failed
**Solution**:
- Check RDS security group
- Verify database credentials
- Ensure RDS is publicly accessible

### Useful Commands

```bash
# Check Elastic Beanstalk status
aws elasticbeanstalk describe-environments --application-names straylove-backend

# View logs
aws logs describe-log-groups --log-group-name-prefix /aws/elasticbeanstalk

# Test backend endpoint
curl https://your-eb-url.elasticbeanstalk.com/api/health
```

## 💰 Cost Optimization

### Free Tier Usage
- **EC2**: 750 hours/month (t3.micro)
- **RDS**: 750 hours/month (db.t3.micro)
- **Amplify**: 1000 build minutes/month
- **S3**: 5GB storage

### Estimated Monthly Cost
- **With Free Tier**: $0-5/month
- **After Free Tier**: $20-40/month

## 🎉 Success!

Your StrayLove app is now deployed on AWS! 

### Your URLs
- **Frontend**: `https://your-app.amplifyapp.com`
- **Backend**: `https://your-app.elasticbeanstalk.com`

### Next Steps
1. **Set up custom domain** (optional)
2. **Configure SSL certificates**
3. **Set up monitoring and alerts**
4. **Create backup strategy**
5. **Optimize performance**

## 📞 Getting Help

- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Support**: https://aws.amazon.com/support/
- **Amplify Docs**: https://docs.amplify.aws/
- **Elastic Beanstalk Docs**: https://docs.aws.amazon.com/elasticbeanstalk/

---

**Congratulations! You've successfully deployed StrayLove to AWS! 🚀** 