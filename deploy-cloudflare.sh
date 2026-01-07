#!/bin/bash

# ============================================================================
# AMANAH GO - DÉPLOIEMENT CLOUDFLARE PAGES (EXPERT MODE)
# ============================================================================
# Déploiement automatisé, efficace et sans erreurs
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_NAME="amanah-go"
DB_NAME="amanah-go-db"
R2_BUCKET="amanah-go-storage"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║      🚀 DÉPLOIEMENT CLOUDFLARE PAGES - AMANAH GO 🚀          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# STEP 1: BUILD PRODUCTION
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Build Production${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build réussi${NC}"
else
    echo -e "${RED}✗ Build échoué${NC}"
    exit 1
fi
echo ""

# ============================================================================
# STEP 2: VÉRIFICATION WRANGLER AUTH
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Vérification Wrangler Auth${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if wrangler is authenticated
if ! wrangler whoami &>/dev/null; then
    echo -e "${YELLOW}⚠️  Wrangler non authentifié${NC}"
    echo -e "${YELLOW}Exécutez: wrangler login${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Wrangler authentifié${NC}"
    wrangler whoami
fi
echo ""

# ============================================================================
# STEP 3: CRÉER DATABASE D1
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Créer Database D1${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if DB exists
if wrangler d1 list | grep -q "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  Database $DB_NAME existe déjà${NC}"
else
    echo "Création database $DB_NAME..."
    wrangler d1 create "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database créée${NC}"
    else
        echo -e "${RED}✗ Création database échouée${NC}"
        exit 1
    fi
fi
echo ""

# ============================================================================
# STEP 4: RUN MIGRATIONS
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Run Migrations D1${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Application des migrations..."
wrangler d1 migrations apply "$DB_NAME" --remote

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations appliquées${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations partiellement appliquées (peut être normal)${NC}"
fi
echo ""

# ============================================================================
# STEP 5: SEED DATA (OPTIONAL)
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 5: Seed Data (Optional)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "./seed.sql" ]; then
    read -p "Voulez-vous seed la database avec des données de test ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        wrangler d1 execute "$DB_NAME" --remote --file=./seed.sql
        echo -e "${GREEN}✓ Data seeded${NC}"
    else
        echo -e "${YELLOW}⊘ Seed skippé${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Pas de fichier seed.sql${NC}"
fi
echo ""

# ============================================================================
# STEP 6: CRÉER R2 BUCKET
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 6: Créer R2 Bucket${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if bucket exists
if wrangler r2 bucket list | grep -q "$R2_BUCKET"; then
    echo -e "${YELLOW}⚠️  R2 Bucket $R2_BUCKET existe déjà${NC}"
else
    echo "Création R2 bucket $R2_BUCKET..."
    wrangler r2 bucket create "$R2_BUCKET"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ R2 Bucket créé${NC}"
    else
        echo -e "${RED}✗ Création R2 bucket échouée${NC}"
        exit 1
    fi
fi
echo ""

# ============================================================================
# STEP 7: DÉPLOYER PAGES
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 7: Déployer sur Cloudflare Pages${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Déploiement en cours..."
wrangler pages deploy dist --project-name="$PROJECT_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Déploiement réussi !${NC}"
else
    echo -e "${RED}✗ Déploiement échoué${NC}"
    exit 1
fi
echo ""

# ============================================================================
# STEP 8: BIND D1 DATABASE
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 8: Bind D1 Database to Pages${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Configuration du binding D1..."
echo -e "${YELLOW}⚠️  Binding D1 doit être fait manuellement via Dashboard${NC}"
echo ""
echo "1. Allez sur: https://dash.cloudflare.com/"
echo "2. Pages > $PROJECT_NAME > Settings > Bindings"
echo "3. Add binding > D1 Database"
echo "   - Variable name: DB"
echo "   - D1 Database: $DB_NAME"
echo "4. Add binding > R2 Bucket"
echo "   - Variable name: R2"
echo "   - R2 Bucket: $R2_BUCKET"
echo ""

# ============================================================================
# STEP 9: VARIABLES D'ENVIRONNEMENT
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 9: Variables d'Environnement${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}⚠️  Variables à configurer manuellement via Dashboard:${NC}"
echo ""
echo "1. ENVIRONMENT=production"
echo "2. JWT_SECRET=<générer-secret-sécurisé>"
echo "3. STRIPE_SECRET_KEY=<stripe-key>"
echo "4. STRIPE_WEBHOOK_SECRET=<webhook-secret>"
echo "5. RESEND_API_KEY=<resend-key>"
echo "6. TWILIO_ACCOUNT_SID=<twilio-sid>"
echo "7. TWILIO_AUTH_TOKEN=<twilio-token>"
echo "8. TWILIO_PHONE_NUMBER=+33757591098"
echo "9. GOOGLE_CLIENT_ID=<google-id>"
echo "10. GOOGLE_CLIENT_SECRET=<google-secret>"
echo "11. FACEBOOK_APP_ID=<facebook-id>"
echo "12. FACEBOOK_APP_SECRET=<facebook-secret>"
echo "13. VAPID_PUBLIC_KEY=<vapid-public>"
echo "14. VAPID_PRIVATE_KEY=<vapid-private>"
echo ""
echo "Dashboard: https://dash.cloudflare.com/"
echo "Pages > $PROJECT_NAME > Settings > Environment variables"
echo ""

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║              ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Amanah GO est déployé sur Cloudflare Pages !${NC}"
echo ""
echo "📊 Résumé:"
echo "  ✅ Build production"
echo "  ✅ Database D1 créée et migrations appliquées"
echo "  ✅ R2 Bucket créé"
echo "  ✅ Déploiement Pages réussi"
echo ""
echo "🔧 Actions manuelles requises:"
echo "  ⚠️  Bind D1 Database via Dashboard"
echo "  ⚠️  Bind R2 Bucket via Dashboard"
echo "  ⚠️  Configurer variables d'environnement"
echo ""
echo "🌐 URL du projet:"
echo "  https://$PROJECT_NAME.pages.dev"
echo ""
echo "📖 Dashboard Cloudflare:"
echo "  https://dash.cloudflare.com/"
echo ""
echo "🚀 Prochaines étapes:"
echo "  1. Configurer bindings (D1 + R2)"
echo "  2. Ajouter variables d'environnement"
echo "  3. Tester l'application"
echo "  4. Configurer domaine personnalisé (optionnel)"
echo ""
