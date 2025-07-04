# 🚀 AWS Deployment Guide for StrayLove

This guide provides step-by-step instructions for deploying the StrayLove application on AWS using various services.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Backend Deployment Options](#backend-deployment-options)
- [Frontend Deployment Options](#frontend-deployment-options)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Domain & SSL Setup](#domain--ssl-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Recommended AWS Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront    │    │   S3 + CloudFront│
│   (DNS + SSL)   │───▶│   (CDN)         │───▶│   (Frontend)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │◀───│   Load Balancer │◀───│   ECS/EKS       │
│   Load Balancer │    │   (ALB)         │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RDS           │    │   ElastiCache   │    │   S3            │
│   (PostgreSQL)  │    │   (Redis)       │    │   (File Storage)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### AWS Account Setup
1. **Create AWS Account** at [aws.amazon.com](https://aws.amazon.com)
2. **Set up IAM User** with appropriate permissions
3. **Install AWS CLI** and configure credentials
4. **Install Docker** for containerization

### Required AWS Services
- **EC2/ECS/EKS** - Backend hosting
- **RDS** - PostgreSQL database
- **S3** - File storage and frontend hosting
- **CloudFront** - CDN and SSL termination
- **Route 53** - DNS management
- **ACM** - SSL certificates
- **ALB** - Load balancing
- **CloudWatch** - Monitoring and logging

## 🖥️ Backend Deployment Options

### Option 1: AWS ECS (Recommended)

#### Step 1: Create Docker Image

1. **Create Dockerfile** in backend directory:
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Install Maven and build
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

# Create runtime image
FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=0 /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

2. **Build and push to ECR**:
```bash
# Create ECR repository
aws ecr create-repository --repository-name straylove-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t straylove-backend .
docker tag straylove-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/straylove-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/straylove-backend:latest
```

#### Step 2: Create ECS Cluster

1. **Create ECS Cluster**:
```bash
aws ecs create-cluster --cluster-name straylove-cluster
```

2. **Create Task Definition**:
```json
{
  "family": "straylove-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "straylove-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/straylove-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DB_URL",
          "value": "jdbc:postgresql://<rds-endpoint>:5432/straylove"
        },
        {
          "name": "DB_USER",
          "value": "straylove_user"
        },
        {
          "name": "DB_PASS",
          "value": "<your-db-password>"
        },
        {
          "name": "CLOUDINARY_CLOUD_NAME",
          "value": "<your-cloudinary-cloud-name>"
        },
        {
          "name": "CLOUDINARY_API_KEY",
          "value": "<your-cloudinary-api-key>"
        },
        {
          "name": "CLOUDINARY_API_SECRET",
          "value": "<your-cloudinary-api-secret>"
        },
        {
          "name": "JWT_SECRET",
          "value": "<your-jwt-secret>"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/straylove-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Create Service**:
```bash
aws ecs create-service \
  --cluster straylove-cluster \
  --service-name straylove-backend-service \
  --task-definition straylove-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/straylove-backend/12345,containerName=straylove-backend,containerPort=8080"
```

### Option 2: AWS EC2

#### Step 1: Launch EC2 Instance

1. **Launch EC2 Instance**:
   - **AMI**: Amazon Linux 2
   - **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
   - **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (App)

2. **Install Java and Maven**:
```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Java 17
sudo yum update -y
sudo yum install -y java-17-amazon-corretto-devel

# Install Maven
sudo yum install -y maven

# Verify installation
java -version
mvn -version
```

#### Step 2: Deploy Application

1. **Clone and Build**:
```bash
# Clone repository
git clone <your-repo-url>
cd strayLove/backend

# Build application
mvn clean package -DskipTests
```

2. **Create Systemd Service**:
```bash
sudo nano /etc/systemd/system/straylove-backend.service
```

Add content:
```ini
[Unit]
Description=StrayLove Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/strayLove/backend
ExecStart=/usr/bin/java -jar target/stray-love-backend-1.0.0.jar
Environment="DB_URL=jdbc:postgresql://<rds-endpoint>:5432/straylove"
Environment="DB_USER=straylove_user"
Environment="DB_PASS=<your-db-password>"
Environment="CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>"
Environment="CLOUDINARY_API_KEY=<your-cloudinary-api-key>"
Environment="CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>"
Environment="JWT_SECRET=<your-jwt-secret>"
Restart=always

[Install]
WantedBy=multi-user.target
```

3. **Start Service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable straylove-backend
sudo systemctl start straylove-backend
sudo systemctl status straylove-backend
```

### Option 3: AWS Elastic Beanstalk

1. **Create Application**:
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init straylove-backend --platform java --region us-east-1

# Create environment
eb create straylove-backend-prod --instance-type t3.medium --envvars \
  DB_URL=jdbc:postgresql://<rds-endpoint>:5432/straylove,\
  DB_USER=straylove_user,\
  DB_PASS=<your-db-password>,\
  CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>,\
  CLOUDINARY_API_KEY=<your-cloudinary-api-key>,\
  CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>,\
  JWT_SECRET=<your-jwt-secret>

# Deploy
eb deploy
```

## 🌐 Frontend Deployment Options

### Option 1: S3 + CloudFront (Recommended)

#### Step 1: Build Frontend

1. **Build Application**:
```bash
cd frontend
npm install
npm run build
```

2. **Create S3 Bucket**:
```bash
aws s3 mb s3://straylove-frontend
aws s3 website s3://straylove-frontend --index-document index.html --error-document index.html
```

3. **Upload Files**:
```bash
aws s3 sync dist/ s3://straylove-frontend
```

4. **Configure Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::straylove-frontend/*"
    }
  ]
}
```

#### Step 2: Setup CloudFront

1. **Create CloudFront Distribution**:
   - **Origin Domain**: straylove-frontend.s3.amazonaws.com
   - **Origin Path**: (leave empty)
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Default Root Object**: index.html
   - **Error Pages**: Redirect 403/404 to /index.html

2. **Configure Custom Domain** (optional):
   - Add your domain to the distribution
   - Request SSL certificate in ACM
   - Update Route 53 with CNAME record

### Option 2: AWS Amplify

1. **Install Amplify CLI**:
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialize Amplify**:
```bash
cd frontend
amplify init
```

3. **Add Hosting**:
```bash
amplify add hosting
# Choose: Amazon CloudFront and S3
```

4. **Deploy**:
```bash
amplify publish
```

## 🗄️ Database Setup

### RDS PostgreSQL Setup

1. **Create RDS Instance**:
```bash
aws rds create-db-instance \
  --db-instance-identifier straylove-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username straylove_user \
  --master-user-password <your-password> \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-12345 \
  --db-subnet-group-name straylove-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible
```

2. **Create Database**:
```sql
CREATE DATABASE straylove;
```

3. **Configure Security Group**:
   - Allow inbound traffic on port 5432 from your application security group

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `application-prod.yml`:
```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASS}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

app:
  cloudinary:
    cloud-name: ${CLOUDINARY_CLOUD_NAME}
    api-key: ${CLOUDINARY_API_KEY}
    api-secret: ${CLOUDINARY_API_SECRET}

logging:
  level:
    com.straylove: INFO
    org.springframework.security: INFO
```

### Frontend Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🌍 Domain & SSL Setup

### Route 53 Configuration

1. **Register Domain** (if not already owned):
```bash
aws route53domains register-domain \
  --domain-name yourdomain.com \
  --duration-in-years 1
```

2. **Create Hosted Zone**:
```bash
aws route53 create-hosted-zone --name yourdomain.com
```

3. **Update Name Servers**:
   - Copy the name servers from the hosted zone
   - Update your domain registrar with these name servers

### SSL Certificate Setup

1. **Request Certificate**:
```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names *.yourdomain.com \
  --validation-method DNS
```

2. **Validate Certificate**:
   - Add the validation CNAME records to Route 53
   - Wait for validation to complete

3. **Attach to Load Balancer/CloudFront**:
   - Attach the certificate to your ALB or CloudFront distribution

## 📊 Monitoring & Logging

### CloudWatch Setup

1. **Create Log Groups**:
```bash
aws logs create-log-group --log-group-name /ecs/straylove-backend
aws logs create-log-group --log-group-name /ecs/straylove-frontend
```

2. **Set up Alarms**:
```bash
# CPU Utilization Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name straylove-cpu-alarm \
  --alarm-description "CPU utilization is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Memory Utilization Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name straylove-memory-alarm \
  --alarm-description "Memory utilization is high" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Application Monitoring

1. **Add Health Check Endpoint**:
```java
@RestController
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
```

2. **Configure Load Balancer Health Check**:
   - Path: `/health`
   - Port: 8080
   - Protocol: HTTP
   - Healthy threshold: 2
   - Unhealthy threshold: 3
   - Timeout: 5 seconds
   - Interval: 30 seconds

## 💰 Cost Optimization

### Estimated Monthly Costs (US East)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| ECS Fargate | 2 tasks, 0.5 vCPU, 1GB RAM | ~$30 |
| RDS PostgreSQL | db.t3.micro, Multi-AZ | ~$25 |
| S3 | 10GB storage | ~$0.25 |
| CloudFront | 100GB transfer | ~$10 |
| Route 53 | Hosted zone + queries | ~$1 |
| **Total** | | **~$66** |

### Cost Optimization Tips

1. **Use Spot Instances** for non-critical workloads
2. **Enable RDS Multi-AZ** only for production
3. **Use S3 Lifecycle Policies** to move old files to cheaper storage
4. **Monitor CloudWatch costs** and set up billing alerts
5. **Use Reserved Instances** for predictable workloads

## 🔧 Troubleshooting

### Common Issues

1. **Application Won't Start**:
   ```bash
   # Check logs
   aws logs describe-log-streams --log-group-name /ecs/straylove-backend
   aws logs get-log-events --log-group-name /ecs/straylove-backend --log-stream-name <stream-name>
   ```

2. **Database Connection Issues**:
   - Verify security group allows traffic on port 5432
   - Check RDS endpoint and credentials
   - Ensure database exists and is accessible

3. **Frontend Not Loading**:
   - Check S3 bucket permissions
   - Verify CloudFront distribution is deployed
   - Check Route 53 DNS propagation

4. **SSL Certificate Issues**:
   - Ensure certificate is validated
   - Check certificate is attached to correct service
   - Verify domain name matches certificate

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster straylove-cluster --services straylove-backend-service

# Check RDS status
aws rds describe-db-instances --db-instance-identifier straylove-db

# Check CloudFront distribution
aws cloudfront get-distribution --id <distribution-id>

# Check Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id <zone-id>
```

## 🚀 Deployment Scripts

### Automated Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="straylove-backend"
ECS_CLUSTER="straylove-cluster"
ECS_SERVICE="straylove-backend-service"

# Build and push Docker image
echo "Building and pushing Docker image..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t $ECR_REPOSITORY .
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Update ECS service
echo "Updating ECS service..."
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE

echo "Deployment completed successfully!"
```

### Frontend Deployment Script

Create `deploy-frontend.sh`:
```bash
#!/bin/bash

# Configuration
S3_BUCKET="straylove-frontend"
CLOUDFRONT_DISTRIBUTION_ID="<your-distribution-id>"

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "Frontend deployment completed!"
```

## 📞 Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Review security group configurations
3. Verify environment variables
4. Check AWS service quotas and limits
5. Consult AWS documentation and support

---

**Happy Deploying! 🚀** 