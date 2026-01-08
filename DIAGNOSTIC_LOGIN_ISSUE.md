# 🔴 DIAGNOSTIC: Problème de Login

**Date**: 7 janvier 2026  
**Statut**: ❌ CRITIQUE - Utilisateurs ne peuvent pas se connecter

---

## 🎯 Résumé du Problème

### Symptômes
✅ **Signup fonctionne** : Les utilisateurs peuvent créer un compte  
❌ **Login échoue** : "Email ou mot de passe incorrect"  
❌ **Routes protégées inaccessibles** : Erreur "Utilisateur non trouvé"

### Impact
- **Critique** : Aucun utilisateur ne peut se connecter
- **Production** : Site https://amanahgo.app affecté
- **Fonctionnalités bloquées** : Trajets, colis, chat, paiements

---

## 🔍 Diagnostic Effectué

### Étape 1: Test de Signup ✅
```bash
# Création d'utilisateur - FONCTIONNE
POST https://amanahgo.app/api/auth/signup
{
  "email": "test2@test.com",
  "password": "password123",
  "name": "Test 2",
  "phone": "+33688888888"
}

# Réponse (SUCCESS)
{
  "success": true,
  "user": {
    "id": "4de407bc-5904-4ff7-ad8c-2cc746b342f9",  # ✅ UUID avec tirets
    "email": "test2@test.com",
    "name": "Test 2",
    "kyc_status": "PENDING"
  },
  "token": "eyJ..."  # ✅ JWT généré
}
```

### Étape 2: Test de Login ❌
```bash
# Tentative de connexion - ÉCHOUE
POST https://amanahgo.app/api/auth/login
{
  "email": "test2@test.com",
  "password": "password123"
}

# Réponse (FAIL)
{
  "success": false,
  "error": "Email ou mot de passe incorrect"
}
```

### Étape 3: Analyse du Code
```typescript
// ✅ Signup: Hash bcrypt correctement
const passwordHash = await bcrypt.hash(password, 10)

// ✅ Login: Comparaison bcrypt
const passwordMatch = await bcrypt.compare(password, user.password_hash)
```

### Étape 4: Test bcrypt Local ✅
```javascript
// Test local: bcrypt fonctionne parfaitement
Hash: $2b$10$Q.I67jSG1ceTN8fI6G9vCudY.1UAAQXXc09MDozVxaIMf0TtPgOjy
Compare: true ✅
```

---

## 🐛 BUG IDENTIFIÉ

### Bug #1: UUID Format (RÉSOLU ✅)
**Problème**: Les UUIDs étaient sauvegardés **sans tirets** en D1, mais le JWT contenait des UUIDs **avec tirets**

```typescript
// ❌ AVANT (causait le bug)
const userId = crypto.randomUUID().replace(/-/g, '')  // Supprime les tirets
// D1: "4de407bc59044ff7ad8c2cc746b342f9"
// JWT: "4de407bc-5904-4ff7-ad8c-2cc746b342f9"
// Résultat: Utilisateur jamais retrouvé!

// ✅ APRÈS (corrigé)
const userId = crypto.randomUUID()  // Garde les tirets
// D1: "4de407bc-5904-4ff7-ad8c-2cc746b342f9"
// JWT: "4de407bc-5904-4ff7-ad8c-2cc746b342f9"
// Résultat: ✅ Match!
```

**Commit**: `24df052` - fix: Keep UUID dashes for JWT compatibility

---

### Bug #2: Password Hash Non Sauvegardé (HYPOTHÈSE 🔍)
**Problème Possible**: Le `password_hash` n'est peut-être pas sauvegardé correctement en D1

#### Hypothèses:
1. **Colonne manquante** : La colonne `password_hash` n'existe pas dans la table `users`
2. **Type incorrect** : La colonne `password_hash` est `TEXT` mais tronquée
3. **NULL constraint** : Un problème de contrainte SQL

#### Vérifications Nécessaires:
```sql
-- Vérifier la structure de la table
PRAGMA table_info(users);

-- Vérifier les données
SELECT id, email, 
       LENGTH(password_hash) as hash_length,
       SUBSTR(password_hash, 1, 20) as hash_preview
FROM users 
WHERE email = 'test2@test.com';
```

---

## 🔧 Solutions Proposées

### Solution Immédiate
1. **Vérifier la structure D1** via Cloudflare Dashboard
   - Aller sur: https://dash.cloudflare.com → Workers & Pages → D1
   - Base: `amanah-go-db`
   - Vérifier la table `users` et la colonne `password_hash`

2. **Tester avec endpoint de debug** (déjà créé mais pas encore déployé)
   ```bash
   GET https://amanahgo.app/api/debug/user/test2@test.com
   ```

3. **Redéployer manuellement** pour activer les endpoints de debug
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=amanah-go
   ```

### Solution Long Terme
1. **Migration D1**: Vérifier que toutes les migrations ont été appliquées
2. **Tests E2E**: Ajouter des tests automatisés pour signup/login
3. **Monitoring**: Ajouter des logs détaillés pour tracer les problèmes

---

## 📊 État Actuel

### ✅ Ce qui Fonctionne
- Homepage accessible
- API Health OK (`/api/health`)
- Signup API (création d'utilisateurs)
- Base D1 connectée
- Build réussi (542.87 kB)
- UUID avec tirets (bug #1 corrigé)

### ❌ Ce qui Ne Fonctionne Pas
- Login (erreur "Email ou mot de passe incorrect")
- Routes protégées (auth middleware)
- Création d'annonces (nécessite auth)
- Chat (nécessite auth)
- Paiements (nécessite auth)

### 🔄 En Attente
- Déploiement des endpoints de debug
- Vérification de la structure D1
- Test du login après corrections

---

## 📝 Prochaines Actions

### Action 1: Déploiement Manuel (5 min)
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name=amanah-go
```

### Action 2: Test des Endpoints Debug (2 min)
```bash
# Vérifier l'utilisateur en D1
curl https://amanahgo.app/api/debug/user/test2@test.com

# Tester le login avec debug
curl -X POST https://amanahgo.app/api/auth/login/debug \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"password123"}'
```

### Action 3: Corriger Selon Résultats (15-30 min)
- Si password_hash est NULL → Bug dans `db.createUser()`
- Si password_hash est tronqué → Problème de migration SQL
- Si password_hash est correct → Problème bcrypt dans Cloudflare Workers

---

## 🚨 URGENT

**Le site est en production mais non fonctionnel!**

Options:
- **A) Résoudre maintenant** : Déployer et tester (30 min)
- **B) Mode maintenance** : Afficher un message temporaire
- **C) Rollback** : Revenir à une version antérieure

**Recommandation**: Option A - Résoudre maintenant (le plus rapide)

---

## 📌 Fichiers Modifiés

### Commits
1. `24df052` - fix: Keep UUID dashes for JWT compatibility
2. `3903502` - debug: Add user debug endpoint to check D1 data
3. `7bccbfa` - debug: Add temporary login debug endpoint

### Fichiers
- `src/index.tsx` : Routes signup, login, debug
- `src/db.service.ts` : generateId() avec tirets
- `test-bcrypt-cf.js` : Tests bcrypt locaux

---

## 💡 Leçons Apprises

1. **UUID Format Critique** : Les UUIDs doivent être cohérents (avec ou sans tirets)
2. **Déploiement Auto**: Cloudflare Pages ne redéploie pas automatiquement sur push
3. **Debug First**: Toujours créer des endpoints de debug en production
4. **Tests E2E**: Essentiels pour éviter ce genre de bugs

---

**Fin du Diagnostic** 📋
