#!/bin/bash

# Simple AWS Deployment for StrayLove
# Uses AWS Amplify (frontend) + Elastic Beanstalk (backend)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🚀 Simple AWS Deployment for StrayLove"
echo "This will deploy using AWS Amplify + Elastic Beanstalk"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Configuration
PROJECT_NAME="straylove"
AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

print_status "Account ID: $ACCOUNT_ID"
print_status "Region: $AWS_REGION"

# Step 1: Create S3 bucket for backend deployment
print_status "Creating S3 bucket for backend deployment..."
S3_BUCKET="${PROJECT_NAME}-backend-${ACCOUNT_ID}"

if aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
    print_success "Created S3 bucket: $S3_BUCKET"
else
    print_status "S3 bucket already exists: $S3_BUCKET"
fi

# Step 2: Build and package backend
print_status "Building backend..."
cd backend

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
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
EOF
    print_success "Created Dockerfile"
fi

# Build Docker image
print_status "Building Docker image..."
docker build -t $PROJECT_NAME-backend .

# Step 3: Create Elastic Beanstalk application
print_status "Creating Elastic Beanstalk application..."
if ! aaws elasticbeanstalk describe-applications --application-names $PROJECT_NAME 2>&1 | grep -q 'ApplicationNotFound'; then
    print_status "Elastic Beanstalk application already exists"
else
    aws elasticbeanstalk create-application --application-name $PROJECT_NAME
    print_success "Created Elastic Beanstalk application"
fi

# Step 4: Create environment configuration
print_status "Creating environment configuration..."
cat > Dockerrun.aws.json << EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8080,
      "HostPort": 80
    }
  ]
}
EOF

# Step 5: Create environment
print_status "Creating Elastic Beanstalk environment..."
ENVIRONMENT_NAME="${PROJECT_NAME}-env"

# Check if environment exists
ENVIRONMENT_STATUS=$(aws elasticbeanstalk describe-environments --environment-names $ENVIRONMENT_NAME --query 'Environments[0].Status' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$ENVIRONMENT_STATUS" = "NOT_FOUND" ] || [ "$ENVIRONMENT_STATUS" = "None" ]; then
    print_status "Creating new environment..."
    aws elasticbeanstalk create-environment \
        --application-name $PROJECT_NAME \
        --environment-name $ENVIRONMENT_NAME \
        --solution-stack-name "64bit Amazon Linux 2 v4.2.0 running Docker"
    print_success "Created Elastic Beanstalk environment"
else
    print_status "Environment already exists with status: $ENVIRONMENT_STATUS"
fi

cd ..

# Step 6: Deploy frontend to Amplify
print_status "Setting up frontend for Amplify deployment..."

cd frontend

# Create amplify.yml for build configuration
cat > amplify.yml << 'EOF'
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
EOF

print_success "Created amplify.yml"

cd ..

print_success "Deployment setup completed!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up IAM permissions (if not done already):"
echo "   - Go to AWS IAM Console"
echo "   - Add EC2, RDS, S3, ECS permissions to your user"
echo ""
echo "2. Deploy backend to Elastic Beanstalk:"
echo "   - Go to AWS Elastic Beanstalk Console"
echo "   - Upload the backend code"
echo ""
echo "3. Deploy frontend to Amplify:"
echo "   - Go to AWS Amplify Console"
echo "   - Connect your GitHub repository"
echo "   - Deploy automatically"
echo ""
echo "4. Configure environment variables:"
echo "   - Set up database connection"
echo "   - Configure Cloudinary credentials"
echo "   - Set JWT secret"
echo ""
echo "🔗 Useful Links:"
echo "- Elastic Beanstalk: https://console.aws.amazon.com/elasticbeanstalk/"
echo "- Amplify: https://console.aws.amazon.com/amplify/"
echo "- IAM: https://console.aws.amazon.com/iam/" 