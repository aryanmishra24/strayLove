#!/bin/bash

# AWS Deployment Script for StrayLove Frontend
# This script builds and deploys the frontend to AWS S3 and CloudFront

set -e  # Exit on any error

# Configuration - Update these values
AWS_REGION="us-east-1"
S3_BUCKET="straylove-frontend"
CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"  # Replace with your CloudFront distribution ID
DOMAIN_NAME="yourdomain.com"  # Replace with your domain name

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install it first."
    exit 1
fi

print_status "Starting frontend deployment process..."

# Step 1: Check if S3 bucket exists
print_status "Checking if S3 bucket exists..."
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    print_status "Creating S3 bucket..."
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_BUCKET" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read access
    cat > bucket-policy.json << EOF
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
    
    aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://bucket-policy.json
    rm bucket-policy.json
    
    print_success "S3 bucket created and configured: $S3_BUCKET"
else
    print_status "S3 bucket already exists: $S3_BUCKET"
fi

# Step 2: Build frontend application
print_status "Building frontend application..."
cd frontend

# Check if .env.production exists, if not create it
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating with default values..."
    cat > .env.production << EOF
VITE_API_URL=https://api.$DOMAIN_NAME/api/v1
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EOF
    print_warning "Please update .env.production with your actual values before deploying."
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the application
print_status "Building application..."
npm run build

# Step 3: Upload files to S3
print_status "Uploading files to S3..."
aws s3 sync dist/ "s3://$S3_BUCKET" --delete

print_success "Files uploaded to S3 successfully!"

# Step 4: Invalidate CloudFront cache (if distribution ID is provided)
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "your-distribution-id" ]; then
    print_status "Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    print_status "Waiting for CloudFront invalidation to complete..."
    aws cloudfront wait invalidation-completed \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --id $INVALIDATION_ID
    
    print_success "CloudFront cache invalidated successfully!"
else
    print_warning "CloudFront distribution ID not provided. Skipping cache invalidation."
fi

# Step 5: Display deployment information
print_status "Deployment information:"
echo "S3 Bucket: $S3_BUCKET"
echo "S3 Website URL: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"

if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "your-distribution-id" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id $CLOUDFRONT_DISTRIBUTION_ID \
        --query 'Distribution.DomainName' \
        --output text)
    echo "CloudFront URL: https://$CLOUDFRONT_DOMAIN"
fi

print_success "Frontend deployment completed! 🚀"

# Step 6: Optional - Create CloudFront distribution if it doesn't exist
if [ "$CLOUDFRONT_DISTRIBUTION_ID" = "your-distribution-id" ]; then
    print_status "Would you like to create a CloudFront distribution? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Creating CloudFront distribution..."
        
        # Create CloudFront distribution
        DISTRIBUTION_CONFIG=$(cat << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "StrayLove Frontend Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$S3_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true,
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$S3_BUCKET",
                "DomainName": "$S3_BUCKET.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    }
}
EOF
)
        
        NEW_DISTRIBUTION_ID=$(aws cloudfront create-distribution \
            --distribution-config "$DISTRIBUTION_CONFIG" \
            --query 'Distribution.Id' \
            --output text)
        
        print_success "CloudFront distribution created: $NEW_DISTRIBUTION_ID"
        print_status "Please update the CLOUDFRONT_DISTRIBUTION_ID in this script for future deployments."
    fi
fi 