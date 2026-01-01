# ⚡ DÉPLOIEMENT RAPIDE - 2 MÉTHODES

## 🚀 MÉTHODE 1: GitHub Actions (AUTOMATIQUE - RECOMMANDÉ)

**Temps**: 5 min setup + déploiements auto après

### Setup Unique (5 min):
1. Suivre `GITHUB_ACTIONS_SETUP.md`
2. Configurer 2 secrets GitHub
3. Merger vers `main`

### Déploiements Automatiques:
```bash
git push origin main
```
✅ Déploiement automatique à chaque push !

---

## 💻 MÉTHODE 2: Script Local (MANUEL)

**Temps**: 20-30 min

### Prérequis:
```bash
# Sur TA machine (pas sandbox)
wrangler login
```

### Déploiement:
```bash
./deploy-cloudflare.sh
```

---

## 📖 GUIDES COMPLETS

- **GitHub Actions**: `GITHUB_ACTIONS_SETUP.md` (5 étapes, 5 min)
- **Manuel Détaillé**: `DEPLOYMENT_GUIDE.md` (12 étapes, 30 min)
- **Script Auto**: `deploy-cloudflare.sh` (exécution complète)

---

## ✅ APRÈS DÉPLOIEMENT

1. **Bindings** (Dashboard Cloudflare):
   - Bind D1: `DB` → `amanah-go-db`
   - Bind R2: `R2` → `amanah-go-storage`

2. **Variables d'Env** (minimum):
   ```
   ENVIRONMENT=production
   JWT_SECRET=<générer: openssl rand -base64 32>
   ```

3. **Test**:
   ```bash
   curl https://amanah-go.pages.dev/api/health
   ```

---

**URL Production**: https://amanah-go.pages.dev  
**Dashboard**: https://dash.cloudflare.com/
