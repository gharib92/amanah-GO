#!/bin/bash
set -e

# Configuration
PROJECT_NAME="amanah-go"
ACCOUNT_ID="13560ab2731eaaa2b5625e054c0b"
API_TOKEN="_RO3n8qDbYZjDNvvepnRrXK95A2seTqkaLJfmnH5"

echo "🚀 Deploying Amanah GO to Cloudflare Pages..."

# Create a tarball
cd /home/user/webapp/dist
tar czf /tmp/deploy.tar.gz *

echo "📦 Files packaged: $(ls -lh /tmp/deploy.tar.gz)"

# Deploy using wrangler
export CLOUDFLARE_API_TOKEN="$API_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

cd /home/user/webapp
npx wrangler pages deploy dist --project-name="$PROJECT_NAME" --branch=main

echo "✅ Deployment complete!"
