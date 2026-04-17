#!/bin/bash

# TLC-mission CRM Deployment Script
# Usage: ./deploy.sh [preview|production]

set -e

ENV=${1:-preview}

echo "🌊 TLC-mission CRM Deployment"
echo "Environment: $ENV"
echo ""

# Check for required env vars
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build
echo "🏗️ Building..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel ($ENV)..."
if [ "$ENV" = "production" ]; then
  vercel --prod
else
  vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations if needed"
echo "2. Verify environment variables"
echo "3. Test the deployment"
