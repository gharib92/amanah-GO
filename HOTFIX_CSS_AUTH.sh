#!/bin/bash
set -e

echo "🔧 HOTFIX - CSS + AUTH"
echo "====================="
echo ""

# Build
echo "🔨 Build avec corrections CSS..."
npm run build

# Copy static
echo "📂 Copie fichiers statiques..."
cp -r public/static dist/

# Verify critical files
echo "✅ Vérification fichiers critiques..."
if [ -f "dist/_worker.js" ]; then
  echo "  ✓ _worker.js présent ($(du -h dist/_worker.js | cut -f1))"
fi
if [ -d "dist/static" ]; then
  echo "  ✓ static/ présent ($(find dist/static -type f | wc -l) fichiers)"
fi

# Create archive
ARCHIVE="amanah-go-HOTFIX-CSS-AUTH-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$ARCHIVE" -C dist .

SIZE=$(du -h "$ARCHIVE" | cut -f1)
echo ""
echo "✅ HOTFIX PRÊT !"
echo "📦 Archive: $ARCHIVE ($SIZE)"
echo ""
echo "🔗 Télécharger:"
echo "https://8000-ikj7vehc4xiv693sw77yx-2e1b9533.sandbox.novita.ai/$ARCHIVE"
echo ""
echo "🚀 Déployer sur Cloudflare et tester !"
