#!/bin/bash
set -e

echo "🚀 AMANAH GO - BUILD PRODUCTION STABLE"
echo "======================================"
echo ""

# Clean
echo "📦 Nettoyage..."
rm -rf dist
rm -f amanah-go-STABLE-*.tar.gz

# Build
echo "🔨 Build Vite..."
npm run build

# Copy static files
echo "📂 Copie fichiers statiques..."
cp -r public/static dist/

# Create archive
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="amanah-go-STABLE-PRODUCTION-${TIMESTAMP}.tar.gz"

echo "📦 Création archive..."
tar -czf "$ARCHIVE" -C dist .

SIZE=$(du -h "$ARCHIVE" | cut -f1)
echo ""
echo "✅ BUILD TERMINÉ !"
echo "📦 Archive: $ARCHIVE ($SIZE)"
echo ""
echo "🚀 PROCHAINES ÉTAPES:"
echo "1. Télécharger: https://8000-ikj7vehc4xiv693sw77yx-2e1b9533.sandbox.novita.ai/$ARCHIVE"
echo "2. Cloudflare Dashboard → amanah-go → Créer un déploiement"
echo "3. Upload l'archive"
echo "4. Deploy!"
echo ""
