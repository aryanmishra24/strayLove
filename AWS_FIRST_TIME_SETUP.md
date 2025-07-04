# 🆕 First-Time AWS Setup Guide for StrayLove

This guide is specifically designed for users who are new to AWS and want to deploy their StrayLove application.

## 📋 Prerequisites Checklist

Before we start, make sure you have:
- ✅ AWS Account created
- ✅ Credit card added to AWS account
- ✅ Computer with internet connection
- ✅ Basic command line knowledge

## 🔐 Step 1: AWS Account Security Setup

### 1.1 Enable Multi-Factor Authentication (MFA)
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Click on your username in the top right
3. Select "Security credentials"
4. Under "Multi-factor authentication (MFA)", click "Assign MFA device"
5. Choose "Virtual MFA device" and follow the setup

### 1.2 Create an IAM User (Don't use root account)
1. Go to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Name: `straylove-admin`
4. Check "Programmatic access" and "AWS Management Console access"
5. Click "Next: Permissions"
6. Attach policies:
   - `AdministratorAccess` (for now - we'll restrict later)
7. Complete the setup
8. **IMPORTANT**: Download the CSV file with access keys

### 1.3 Set Up AWS CLI
1. Install AWS CLI:
   ```bash
   # macOS
   brew install awscli
   
   # Windows
   # Download from https://aws.amazon.com/cli/
   
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. Configure AWS CLI:
   ```bash
   aws configure
   ```
   - Enter your Access Key ID from the CSV
   - Enter your Secret Access Key from the CSV
   - Default region: `us-east-1`
   - Default output format: `json`

3. Test the configuration:
   ```bash
   aws sts get-caller-identity
   ```

## 🛠️ Step 2: Install Required Tools

### 2.1 Install Docker
```bash
# macOS
brew install docker
# Open Docker Desktop app

# Windows
# Download from https://www.docker.com/products/docker-desktop

# Linux
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2.2 Install Node.js (if not already installed)
```bash
# macOS
brew install node

# Windows
# Download from https://nodejs.org/

# Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3 Verify Installations
```bash
aws --version
docker --version
node --version
npm --version
```

## 🏗️ Step 3: Prepare Your Application

### 3.1 Clone/Download Your Project
Make sure you have your StrayLove project ready in your local machine.

### 3.2 Test Local Build
```bash
# Test backend build
cd backend
./mvnw clean package -DskipTests

# Test frontend build
cd ../frontend
npm install
npm run build
```

## 🚀 Step 4: Deploy to AWS

### 4.1 Set Up Infrastructure (One-time setup)
```bash
# Make scripts executable
chmod +x setup-aws-infrastructure.sh
chmod +x deploy-backend.sh
chmod +x deploy-frontend.sh

# Run infrastructure setup
./setup-aws-infrastructure.sh
```

**This will take 10-15 minutes and create:**
- VPC with networking
- RDS PostgreSQL database
- S3 buckets for frontend and storage
- ECS cluster for backend
- Load balancer
- Security groups
- IAM roles

### 4.2 Configure Environment Variables
After the infrastructure setup completes, you'll get a file called `aws-config.env`. Update it with your actual values:

```bash
# Edit the configuration file
nano aws-config.env
```

Update these values:
```bash
# Your Cloudinary credentials (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Your domain name (optional for now)
DOMAIN_NAME=yourdomain.com
```

### 4.3 Deploy Backend
```bash
# Source the environment variables
source aws-config.env

# Deploy backend
./deploy-backend.sh
```

### 4.4 Deploy Frontend
```bash
# Deploy frontend
./deploy-frontend.sh
```

## 🌐 Step 5: Access Your Application

### 5.1 Get Your URLs
After deployment, you'll get URLs like:
- **Frontend**: `http://straylove-frontend.s3-website-us-east-1.amazonaws.com`
- **Backend**: `http://straylove-alb-123456789.us-east-1.elb.amazonaws.com`

### 5.2 Test Your Application
1. Open the frontend URL in your browser
2. Register a new user
3. Test the features

## 💰 Step 6: Cost Monitoring

### 6.1 Set Up Billing Alerts
1. Go to AWS Billing Console
2. Click "Billing preferences"
3. Set up billing alerts:
   - $10 alert
   - $25 alert
   - $50 alert

### 6.2 Estimated Monthly Costs
- **Development/Testing**: ~$20-30/month
- **Production**: ~$60-80/month

## 🔧 Step 7: Custom Domain (Optional)

### 7.1 Register a Domain
1. Go to Route 53 in AWS Console
2. Click "Register domain"
3. Choose a domain name
4. Complete the registration

### 7.2 Set Up SSL Certificate
1. Go to Certificate Manager
2. Request a certificate for your domain
3. Validate via DNS
4. Attach to your load balancer

## 🛡️ Step 8: Security Best Practices

### 8.1 Restrict IAM Permissions
After successful deployment, create a more restricted IAM user:
1. Create new IAM user with specific permissions
2. Remove AdministratorAccess
3. Use least privilege principle

### 8.2 Regular Maintenance
- Monitor CloudWatch logs
- Keep dependencies updated
- Review security groups regularly
- Monitor costs

## 🆘 Troubleshooting Common Issues

### Issue 1: "Access Denied" Errors
```bash
# Check your AWS credentials
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

### Issue 2: Docker Build Fails
```bash
# Check Docker is running
docker ps

# Clean Docker cache
docker system prune -a
```

### Issue 3: Database Connection Issues
```bash
# Check RDS status in AWS Console
# Wait for database to be "Available"
# Check security group rules
```

### Issue 4: Frontend Not Loading
```bash
# Check S3 bucket permissions
# Verify CloudFront distribution
# Check browser console for errors
```

## 📞 Getting Help

### AWS Resources
- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Support](https://aws.amazon.com/support/)
- [AWS Free Tier](https://aws.amazon.com/free/)

### Community Support
- [AWS Developer Forums](https://forums.aws.amazon.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/amazon-web-services)
- [Reddit r/aws](https://www.reddit.com/r/aws/)

## 🎯 Next Steps After Deployment

1. **Test All Features**: Make sure everything works
2. **Set Up Monitoring**: Configure CloudWatch alarms
3. **Backup Strategy**: Set up automated backups
4. **Scaling**: Plan for traffic growth
5. **Security**: Regular security audits
6. **Documentation**: Document your setup

## 💡 Pro Tips for Beginners

1. **Start Small**: Use the free tier when possible
2. **Monitor Costs**: Set up billing alerts immediately
3. **Use Tags**: Tag all resources for cost tracking
4. **Backup Everything**: Regular backups are crucial
5. **Learn Gradually**: Don't try to understand everything at once
6. **Use AWS Console**: Visual interface helps with learning

---

**Remember: AWS can be overwhelming at first, but take it step by step. You'll get the hang of it! 🚀** 