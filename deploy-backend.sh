#!/bin/bash

# AWS Deployment Script for StrayLove Backend
# This script builds and deploys the backend to AWS ECS

set -e  # Exit on any error

# Configuration - Update these values
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="your-account-id"  # Replace with your AWS account ID
ECR_REPOSITORY="straylove-backend"
ECS_CLUSTER="straylove-cluster"
ECS_SERVICE="straylove-backend-service"
TASK_DEFINITION_FAMILY="straylove-backend"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$AWS_ACCOUNT_ID" ] || [ "$AWS_ACCOUNT_ID" = "your-account-id" ]; then
    print_error "Please update AWS_ACCOUNT_ID in the script or set it as an environment variable."
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Login to ECR
print_status "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 2: Create ECR repository if it doesn't exist
print_status "Checking if ECR repository exists..."
if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION &> /dev/null; then
    print_status "Creating ECR repository..."
    aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
    print_success "ECR repository created: $ECR_REPOSITORY"
else
    print_status "ECR repository already exists: $ECR_REPOSITORY"
fi

# Step 3: Build Docker image
print_status "Building Docker image..."
cd backend
docker build -t $ECR_REPOSITORY .

# Step 4: Tag and push image to ECR
print_status "Tagging and pushing Docker image to ECR..."
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Step 5: Create ECS cluster if it doesn't exist
print_status "Checking if ECS cluster exists..."
if ! aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION --query 'clusters[0].status' --output text &> /dev/null || [ "$(aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION --query 'clusters[0].status' --output text)" = "None" ]; then
    print_status "Creating ECS cluster..."
    aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION
    print_success "ECS cluster created: $ECS_CLUSTER"
else
    print_status "ECS cluster already exists: $ECS_CLUSTER"
fi

# Step 6: Register new task definition
print_status "Registering new task definition..."
TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
    --family $TASK_DEFINITION_FAMILY \
    --network-mode awsvpc \
    --requires-compatibilities FARGATE \
    --cpu 512 \
    --memory 1024 \
    --execution-role-arn arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole \
    --container-definitions "[
        {
            \"name\": \"$ECR_REPOSITORY\",
            \"image\": \"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest\",
            \"portMappings\": [
                {
                    \"containerPort\": 8080,
                    \"protocol\": \"tcp\"
                }
            ],
            \"environment\": [
                {
                    \"name\": \"DB_URL\",
                    \"value\": \"$DB_URL\"
                },
                {
                    \"name\": \"DB_USER\",
                    \"value\": \"$DB_USER\"
                },
                {
                    \"name\": \"DB_PASS\",
                    \"value\": \"$DB_PASS\"
                },
                {
                    \"name\": \"CLOUDINARY_CLOUD_NAME\",
                    \"value\": \"$CLOUDINARY_CLOUD_NAME\"
                },
                {
                    \"name\": \"CLOUDINARY_API_KEY\",
                    \"value\": \"$CLOUDINARY_API_KEY\"
                },
                {
                    \"name\": \"CLOUDINARY_API_SECRET\",
                    \"value\": \"$CLOUDINARY_API_SECRET\"
                },
                {
                    \"name\": \"JWT_SECRET\",
                    \"value\": \"$JWT_SECRET\"
                }
            ],
            \"logConfiguration\": {
                \"logDriver\": \"awslogs\",
                \"options\": {
                    \"awslogs-group\": \"/ecs/$ECR_REPOSITORY\",
                    \"awslogs-region\": \"$AWS_REGION\",
                    \"awslogs-stream-prefix\": \"ecs\"
                }
            },
            \"healthCheck\": {
                \"command\": [\"CMD-SHELL\", \"curl -f http://localhost:8080/health || exit 1\"],
                \"interval\": 30,
                \"timeout\": 5,
                \"retries\": 3,
                \"startPeriod\": 60
            }
        }
    ]" \
    --region $AWS_REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

print_success "Task definition registered: $TASK_DEFINITION_ARN"

# Step 7: Create or update ECS service
print_status "Checking if ECS service exists..."
if ! aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].status' --output text &> /dev/null || [ "$(aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].status' --output text)" = "None" ]; then
    print_status "Creating ECS service..."
    aws ecs create-service \
        --cluster $ECS_CLUSTER \
        --service-name $ECS_SERVICE \
        --task-definition $TASK_DEFINITION_ARN \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SECURITY_GROUP_IDS],assignPublicIp=ENABLED}" \
        --region $AWS_REGION
    
    print_success "ECS service created: $ECS_SERVICE"
else
    print_status "Updating ECS service..."
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --task-definition $TASK_DEFINITION_ARN \
        --force-new-deployment \
        --region $AWS_REGION
    
    print_success "ECS service updated: $ECS_SERVICE"
fi

# Step 8: Wait for service to be stable
print_status "Waiting for service to be stable..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

print_success "Deployment completed successfully!"

# Step 9: Display service information
print_status "Service information:"
aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].{ServiceName:serviceName,Status:status,DesiredCount:desiredCount,RunningCount:runningCount,PendingCount:pendingCount}' \
    --output table

print_success "Backend deployment completed! 🚀" 