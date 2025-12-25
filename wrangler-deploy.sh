#!/bin/bash
export CLOUDFLARE_API_TOKEN="_RO3n8qDbYZjDNvvepnRrXK95A2seTqkaLJfmnH5"

echo "🚀 Déploiement direct sur Cloudflare Pages..."
echo ""

# Deploy without creating project first
npx wrangler pages deploy dist \
  --project-name=amanah-go \
  --branch=production

echo ""
echo "✅ Déploiement terminé !"
