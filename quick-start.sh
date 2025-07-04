#!/bin/bash

# Quick Start Script for First-Time AWS Users
# This script helps you verify your setup and get started

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

echo "🚀 Welcome to StrayLove AWS Deployment!"
echo "This script will help you get started with AWS deployment."
echo ""

# Step 1: Check prerequisites
print_status "Step 1: Checking prerequisites..."

# Check AWS CLI
if command -v aws &> /dev/null; then
    print_success "AWS CLI is installed"
    aws --version
else
    print_error "AWS CLI is not installed"
    echo "Please install AWS CLI first:"
    echo "  macOS: brew install awscli"
    echo "  Windows: Download from https://aws.amazon.com/cli/"
    echo "  Linux: curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\""
    exit 1
fi

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS credentials are configured"
    echo "Account ID: $(aws sts get-caller-identity --query Account --output text)"
    echo "User ARN: $(aws sts get-caller-identity --query Arn --output text)"
else
    print_error "AWS credentials are not configured"
    echo "Please run 'aws configure' and enter your credentials"
    echo "You can get these from the IAM user you created in AWS Console"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        print_success "Docker is installed and running"
        docker --version
    else
        print_error "Docker is installed but not running"
        echo "Please start Docker Desktop or Docker daemon"
        exit 1
    fi
else
    print_error "Docker is not installed"
    echo "Please install Docker first:"
    echo "  macOS: brew install docker"
    echo "  Windows: Download from https://www.docker.com/products/docker-desktop"
    echo "  Linux: sudo apt-get install docker.io"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    print_success "Node.js is installed"
    node --version
else
    print_error "Node.js is not installed"
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Windows: Download from https://nodejs.org/"
    echo "  Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm is installed"
    npm --version
else
    print_error "npm is not installed"
    exit 1
fi

echo ""
print_success "All prerequisites are met! ✅"
echo ""

# Step 2: Check project structure
print_status "Step 2: Checking project structure..."

if [ -d "backend" ] && [ -d "frontend" ]; then
    print_success "Project structure looks good"
else
    print_error "Project structure is missing"
    echo "Make sure you're in the correct directory with backend/ and frontend/ folders"
    exit 1
fi

# Step 3: Test local builds
print_status "Step 3: Testing local builds..."

# Test backend build
print_status "Testing backend build..."
cd backend
if ./mvnw clean package -DskipTests &> /dev/null; then
    print_success "Backend builds successfully"
else
    print_error "Backend build failed"
    echo "Please check the backend directory and try again"
    exit 1
fi
cd ..

# Test frontend build
print_status "Testing frontend build..."
cd frontend
if npm install &> /dev/null && npm run build &> /dev/null; then
    print_success "Frontend builds successfully"
else
    print_error "Frontend build failed"
    echo "Please check the frontend directory and try again"
    exit 1
fi
cd ..

echo ""
print_success "All local builds are working! ✅"
echo ""

# Step 4: Check Cloudinary setup
print_status "Step 4: Checking Cloudinary setup..."

if [ -f "backend/src/main/resources/application.yml" ]; then
    if grep -q "cloudinary" backend/src/main/resources/application.yml; then
        print_success "Cloudinary configuration found"
    else
        print_warning "Cloudinary configuration not found"
        echo "You'll need to set up Cloudinary for image uploads"
        echo "Visit https://cloudinary.com/ to create a free account"
    fi
else
    print_warning "Application configuration not found"
fi

echo ""
print_success "Setup verification completed! 🎉"
echo ""

# Step 5: Provide next steps
echo "📋 Next Steps:"
echo ""
echo "1. Set up billing alerts in AWS Console:"
echo "   - Go to Billing → Billing preferences"
echo "   - Set up alerts for $10, $25, $50"
echo ""
echo "2. Run the infrastructure setup:"
echo "   ./setup-aws-infrastructure.sh"
echo ""
echo "3. After infrastructure is ready, deploy:"
echo "   source aws-config.env"
echo "   ./deploy-backend.sh"
echo "   ./deploy-frontend.sh"
echo ""
echo "4. Monitor your deployment:"
echo "   - Check AWS Console for resource status"
echo "   - Monitor CloudWatch logs"
echo "   - Test your application URLs"
echo ""
echo "📚 Helpful Resources:"
echo "- AWS Free Tier: https://aws.amazon.com/free/"
echo "- AWS Documentation: https://docs.aws.amazon.com/"
echo "- AWS Support: https://aws.amazon.com/support/"
echo ""
echo "💡 Tips:"
echo "- Start with the free tier to avoid unexpected costs"
echo "- Set up billing alerts immediately"
echo "- Use AWS Console to monitor your resources visually"
echo "- Don't worry if you don't understand everything at first"
echo ""
print_success "You're ready to deploy! Good luck! 🚀" 