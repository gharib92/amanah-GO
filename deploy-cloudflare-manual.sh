#!/bin/bash

# =====================================================
# Script de déploiement manuel Cloudflare Pages
# Projet: Amanah GO
# Date: 9 janvier 2026
# =====================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       AMANAH GO - Déploiement Cloudflare Pages            ║"
echo "║              Script de déploiement manuel                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =====================================================
# Étape 1 : Vérification de l'environnement
# =====================================================
echo -e "${YELLOW}[1/5] Vérification de l'environnement...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur : package.json non trouvé${NC}"
    echo "   Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

if [ ! -f "wrangler.jsonc" ]; then
    echo -e "${RED}❌ Erreur : wrangler.jsonc non trouvé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environnement OK${NC}"

# =====================================================
# Étape 2 : Nettoyage
# =====================================================
echo -e "\n${YELLOW}[2/5] Nettoyage des anciens builds...${NC}"

if [ -d "dist" ]; then
    rm -rf dist
    echo "   Ancien dossier dist/ supprimé"
fi

echo -e "${GREEN}✅ Nettoyage terminé${NC}"

# =====================================================
# Étape 3 : Build du projet
# =====================================================
echo -e "\n${YELLOW}[3/5] Build du projet...${NC}"

npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erreur : Le build a échoué (dossier dist/ absent)${NC}"
    exit 1
fi

# Vérifier les fichiers essentiels
if [ ! -f "dist/_worker.js" ]; then
    echo -e "${RED}❌ Erreur : _worker.js manquant dans dist/${NC}"
    exit 1
fi

WORKER_SIZE=$(du -h dist/_worker.js | cut -f1)
echo "   _worker.js : ${WORKER_SIZE}"

echo -e "${GREEN}✅ Build réussi${NC}"

# =====================================================
# Étape 4 : Copie des fichiers statiques
# =====================================================
echo -e "\n${YELLOW}[4/5] Copie des fichiers statiques...${NC}"

# Créer le dossier static dans dist s'il n'existe pas
mkdir -p dist/static

# Copier les fichiers statiques
if [ -d "public/static" ]; then
    cp -r public/static/* dist/static/
    echo "   Fichiers statiques copiés"
fi

# Vérifier les fichiers critiques
CRITICAL_FILES=(
    "dist/static/logo-amanah-go.png"
    "dist/static/logo-amanah-go-v2.png"
    "dist/manifest.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Attention : $file manquant${NC}"
    else
        echo "   ✓ $file présent"
    fi
done

echo -e "${GREEN}✅ Fichiers statiques prêts${NC}"

# =====================================================
# Étape 5 : Création de l'archive de déploiement
# =====================================================
echo -e "\n${YELLOW}[5/5] Création de l'archive de déploiement...${NC}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="amanah-go-deploy-${TIMESTAMP}.tar.gz"

tar -czf "$ARCHIVE_NAME" -C dist .

if [ ! -f "$ARCHIVE_NAME" ]; then
    echo -e "${RED}❌ Erreur : Échec de création de l'archive${NC}"
    exit 1
fi

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "   Archive créée : $ARCHIVE_NAME ($ARCHIVE_SIZE)"

echo -e "${GREEN}✅ Archive prête${NC}"

# =====================================================
# Résumé et instructions de déploiement
# =====================================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║             BUILD TERMINÉ AVEC SUCCÈS ! ✅                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📦 Fichiers prêts pour le déploiement :${NC}"
echo "   1. Dossier : dist/"
echo "   2. Archive : $ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo ""

echo -e "${BLUE}🚀 OPTIONS DE DÉPLOIEMENT :${NC}"
echo ""
echo -e "${YELLOW}Option 1 : Upload via Cloudflare Dashboard (RECOMMANDÉ)${NC}"
echo "   1. Allez sur : https://dash.cloudflare.com"
echo "   2. Workers & Pages → Create application → Pages → Upload assets"
echo "   3. Project name : amanah-go"
echo "   4. Glissez-déposez le dossier dist/ OU l'archive $ARCHIVE_NAME"
echo "   5. Cliquez sur 'Deploy site'"
echo "   ⏳ Temps : ~30 secondes"
echo "   ✅ Site en ligne : https://amanah-go.pages.dev"
echo ""

echo -e "${YELLOW}Option 2 : Déploiement via Wrangler CLI${NC}"
echo "   1. Créez un token API : https://dash.cloudflare.com/profile/api-tokens"
echo "   2. Permissions : Cloudflare Pages:Edit + Zone:Read + User Details:Read"
echo "   3. Sauvegardez le token :"
echo "      echo 'VOTRE_TOKEN' > .cloudflare-token.txt"
echo "   4. Déployez :"
echo "      export CLOUDFLARE_API_TOKEN=\$(cat .cloudflare-token.txt)"
echo "      npx wrangler pages deploy dist --project-name=amanah-go"
echo "   ⏳ Temps : ~1-2 minutes"
echo ""

echo -e "${YELLOW}Option 3 : Connexion GitHub (pour déploiements automatiques)${NC}"
echo "   1. Dashboard Cloudflare → Pages → Create application → Connect to Git"
echo "   2. Sélectionnez : gharib92/amanah-GO"
echo "   3. Configuration :"
echo "      - Project name : amanah-go"
echo "      - Production branch : main"
echo "      - Build command : npm run build"
echo "      - Build output : dist"
echo "   4. Save and Deploy"
echo "   ⏳ Temps : ~2-3 minutes"
echo "   ✅ Déploiements automatiques activés"
echo ""

echo -e "${BLUE}🌐 Configuration du domaine personnalisé :${NC}"
echo "   Après le déploiement, configurez amanalgo.app :"
echo "   1. Dashboard → Projet amanah-go → Custom domains"
echo "   2. Add custom domain : amanalgo.app"
echo "   3. Cloudflare configurera automatiquement le DNS"
echo "   ⏳ Propagation DNS : 5-10 minutes"
echo ""

echo -e "${BLUE}🧪 Tests à effectuer après déploiement :${NC}"
echo "   ✅ Logo Amanah GO visible"
echo "   ✅ Navigation fonctionnelle"
echo "   ✅ Hero avec gradient bleu-vert"
echo "   ✅ Titre : 'Voyagez Malin, Envoyez Futé'"
echo "   ✅ Boutons CTA : 'Je voyage' et 'J'envoie un colis'"
echo "   ✅ Statistiques : 3.5M+ voyageurs, 70% économies, 100% sécurisé"
echo "   ✅ Boutons OAuth (Apple, Google, Facebook)"
echo "   ✅ Design responsive"
echo ""

echo -e "${BLUE}📁 Localisation des fichiers :${NC}"
echo "   - Dossier de build : ./dist/"
echo "   - Archive : ./$ARCHIVE_NAME"
echo "   - Documentation : ./CLOUDFLARE_SETUP_COMPLET.md"
echo "   - Guide dépannage : ./TROUBLESHOOTING_522.md"
echo ""

echo -e "${GREEN}🎯 PROCHAINE ACTION :${NC}"
echo "   Choisissez une option de déploiement ci-dessus et suivez les étapes."
echo "   Je recommande l'Option 1 (Upload Dashboard) pour un déploiement rapide."
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo "   Tout est prêt ! Bon déploiement ! 🚀"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
