#!/bin/bash
# Script de déploiement d'urgence pour Amanah GO
# Ce script déploie directement le code sans passer par git

set -e

echo "🚀 Déploiement d'urgence Amanah GO"
echo "=================================="
echo ""

# 1. Build du projet
echo "📦 1/3 - Build du projet..."
npm run build
echo "✅ Build terminé"
echo ""

# 2. Copier les fichiers statiques
echo "📁 2/3 - Copie des fichiers statiques..."
cp -r public/static dist/ 2>/dev/null || echo "Fichiers statiques déjà copiés"
echo "✅ Fichiers copiés"
echo ""

# 3. Instructions de déploiement
echo "📤 3/3 - Déploiement..."
echo ""
echo "Le build est prêt dans le dossier 'dist/'"
echo ""
echo "OPTIONS DE DÉPLOIEMENT :"
echo ""
echo "Option 1 : Via l'interface Cloudflare Pages"
echo "  1. Aller sur https://dash.cloudflare.com"
echo "  2. Pages → amanah-go → Create deployment"
echo "  3. Glisser-déposer le dossier 'dist/'"
echo ""
echo "Option 2 : Via GitHub (recommandé)"
echo "  1. Merger la Pull Request #3"
echo "  2. Cloudflare déploiera automatiquement"
echo "  3. URL: https://github.com/gharib92/amanah-GO/pull/3"
echo ""
echo "Option 3 : Via Wrangler (si vous avez un token valide)"
echo "  export CLOUDFLARE_API_TOKEN=VOTRE_TOKEN"
echo "  npx wrangler pages deploy dist --project-name=amanah-go"
echo ""
echo "✅ Le site est prêt à être déployé !"
echo ""
echo "📊 Contenu du build :"
ls -lh dist/
echo ""
echo "🌐 Après déploiement, votre site sera accessible sur :"
echo "   - https://amanah-go.pages.dev (Cloudflare)"
echo "   - https://amanalgo.app (votre domaine personnalisé)"
