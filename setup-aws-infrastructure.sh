#!/bin/bash

# AWS Infrastructure Setup Script for StrayLove
# This script creates all necessary AWS resources for the application

set -e  # Exit on any error

# Configuration - Update these values
AWS_REGION="us-east-1"
PROJECT_NAME="straylove"
DOMAIN_NAME="yourdomain.com"  # Replace with your domain name

# Resource names
VPC_NAME="${PROJECT_NAME}-vpc"
CLUSTER_NAME="${PROJECT_NAME}-cluster"
DB_INSTANCE_ID="${PROJECT_NAME}-db"
DB_NAME="${PROJECT_NAME}"
DB_USERNAME="${PROJECT_NAME}_user"
S3_BUCKET="${PROJECT_NAME}-frontend"
S3_STORAGE_BUCKET="${PROJECT_NAME}-storage"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "Starting AWS infrastructure setup..."

# Step 1: Create VPC and Networking
print_status "Creating VPC and networking resources..."

# Create VPC
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
    --query 'Vpc.VpcId' \
    --output text)

print_success "VPC created: $VPC_ID"

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Create public subnets
SUBNET1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

SUBNET2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Create private subnets for RDS
PRIVATE_SUBNET1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.3.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.4.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Create route table for public subnets
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 create-route \
    --route-table-id $ROUTE_TABLE_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

aws ec2 associate-route-table --subnet-id $SUBNET1_ID --route-table-id $ROUTE_TABLE_ID
aws ec2 associate-route-table --subnet-id $SUBNET2_ID --route-table-id $ROUTE_TABLE_ID

# Create security groups
print_status "Creating security groups..."

# Security group for ALB
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-alb-sg" \
    --description "Security group for Application Load Balancer" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Security group for ECS tasks
ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-ecs-sg" \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8080 \
    --source-group $ALB_SG_ID

# Security group for RDS
RDS_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-rds-sg" \
    --description "Security group for RDS database" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG_ID \
    --protocol tcp \
    --port 5432 \
    --source-group $ECS_SG_ID

print_success "Security groups created"

# Step 2: Create RDS Database
print_status "Creating RDS database..."

# Generate a secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Create DB subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name "${PROJECT_NAME}-subnet-group" \
    --db-subnet-group-description "Subnet group for ${PROJECT_NAME} RDS" \
    --subnet-ids $PRIVATE_SUBNET1_ID $PRIVATE_SUBNET2_ID

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_ID \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids $RDS_SG_ID \
    --db-subnet-group-name "${PROJECT_NAME}-subnet-group" \
    --backup-retention-period 7 \
    --multi-az \
    --publicly-accessible \
    --storage-encrypted

print_success "RDS instance created: $DB_INSTANCE_ID"

# Step 3: Create S3 Buckets
print_status "Creating S3 buckets..."

# Create frontend bucket
aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html

# Create storage bucket for files
aws s3 mb "s3://$S3_STORAGE_BUCKET" --region $AWS_REGION

# Set bucket policies
cat > frontend-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://frontend-bucket-policy.json
rm frontend-bucket-policy.json

print_success "S3 buckets created"

# Step 4: Create ECS Cluster
print_status "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME
print_success "ECS cluster created: $CLUSTER_NAME"

# Step 5: Create IAM Roles
print_status "Creating IAM roles..."

# Create ECS task execution role
aws iam create-role \
    --role-name "${PROJECT_NAME}-ecs-task-execution-role" \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

aws iam attach-role-policy \
    --role-name "${PROJECT_NAME}-ecs-task-execution-role" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create ECS task role
aws iam create-role \
    --role-name "${PROJECT_NAME}-ecs-task-role" \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Create policy for S3 access
cat > s3-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::$S3_STORAGE_BUCKET/*"
        }
    ]
}
EOF

aws iam put-role-policy \
    --role-name "${PROJECT_NAME}-ecs-task-role" \
    --policy-name "${PROJECT_NAME}-s3-policy" \
    --policy-document file://s3-policy.json

rm s3-policy.json

print_success "IAM roles created"

# Step 6: Create Application Load Balancer
print_status "Creating Application Load Balancer..."

# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
    --name "${PROJECT_NAME}-alb" \
    --subnets $SUBNET1_ID $SUBNET2_ID \
    --security-groups $ALB_SG_ID \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

# Create target group
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
    --name "${PROJECT_NAME}-tg" \
    --protocol HTTP \
    --port 8080 \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN

print_success "Application Load Balancer created"

# Step 7: Create CloudWatch Log Groups
print_status "Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name "/ecs/${PROJECT_NAME}-backend"
aws logs create-log-group --log-group-name "/ecs/${PROJECT_NAME}-frontend"
print_success "CloudWatch log groups created"

# Step 8: Generate configuration file
print_status "Generating configuration file..."

cat > aws-config.env << EOF
# AWS Infrastructure Configuration
# Generated on $(date)

# VPC and Networking
VPC_ID=$VPC_ID
SUBNET_IDS=$SUBNET1_ID,$SUBNET2_ID
PRIVATE_SUBNET_IDS=$PRIVATE_SUBNET1_ID,$PRIVATE_SUBNET2_ID
SECURITY_GROUP_IDS=$ECS_SG_ID
ALB_SECURITY_GROUP_ID=$ALB_SG_ID
RDS_SECURITY_GROUP_ID=$RDS_SG_ID

# ECS
CLUSTER_NAME=$CLUSTER_NAME
TASK_EXECUTION_ROLE_ARN=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${PROJECT_NAME}-ecs-task-execution-role
TASK_ROLE_ARN=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${PROJECT_NAME}-ecs-task-role

# RDS
DB_INSTANCE_ID=$DB_INSTANCE_ID
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

# S3
S3_BUCKET=$S3_BUCKET
S3_STORAGE_BUCKET=$S3_STORAGE_BUCKET

# Load Balancer
ALB_ARN=$ALB_ARN
TARGET_GROUP_ARN=$TARGET_GROUP_ARN

# Environment Variables for Application
DB_URL=jdbc:postgresql://$(aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_ID --query 'DBInstances[0].Endpoint.Address' --output text):5432/$DB_NAME
DB_USER=$DB_USERNAME
DB_PASS=$DB_PASSWORD

# Update these with your actual values
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
JWT_SECRET=$(openssl rand -base64 64)
EOF

print_success "Configuration file generated: aws-config.env"

# Step 9: Display summary
print_status "Infrastructure setup completed! 🎉"
echo ""
echo "=== RESOURCE SUMMARY ==="
echo "VPC ID: $VPC_ID"
echo "ECS Cluster: $CLUSTER_NAME"
echo "RDS Instance: $DB_INSTANCE_ID"
echo "S3 Frontend Bucket: $S3_BUCKET"
echo "S3 Storage Bucket: $S3_STORAGE_BUCKET"
echo "Load Balancer ARN: $ALB_ARN"
echo ""
echo "=== NEXT STEPS ==="
echo "1. Update the environment variables in aws-config.env"
echo "2. Wait for RDS instance to be available (check AWS console)"
echo "3. Run the backend deployment script: ./deploy-backend.sh"
echo "4. Run the frontend deployment script: ./deploy-frontend.sh"
echo ""
echo "=== IMPORTANT NOTES ==="
echo "- Database password: $DB_PASSWORD"
echo "- JWT Secret: $(grep JWT_SECRET aws-config.env | cut -d'=' -f2)"
echo "- Keep these credentials secure!"
echo ""
print_success "AWS infrastructure setup completed successfully!" 