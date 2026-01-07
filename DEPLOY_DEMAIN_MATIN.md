# 🚀 DÉPLOIEMENT EXPRESS - DEMAIN MATIN (5 minutes)

## ⚠️ PROBLÈME ACTUEL

Le bouton **🍎 Sign in with Apple** n'apparaît pas sur https://amanahgo.app parce que :
- ✅ Le code est écrit et commité **localement dans le sandbox**
- ❌ Le code n'est **pas encore sur GitHub**
- ❌ Donc **pas encore déployé sur Cloudflare Pages**

---

## ✅ SOLUTION : 5 MINUTES CHRONO

### 🕐 ÉTAPE 1 : Ouvrir Terminal sur ton Mac (10 secondes)

```bash
cd ~/Desktop/amanah-GO
```

---

### 🕑 ÉTAPE 2 : Pull les changements du sandbox (30 secondes)

**⚠️ IMPORTANT** : Le sandbox et GitHub sont désynchronisés. On va forcer le pull depuis GitHub d'abord, puis appliquer les changements du sandbox.

#### Option A : Si tu as un backup local

```bash
# Sauvegarder tes changements locaux (au cas où)
git stash

# Pull depuis GitHub
git pull origin genspark_ai_developer

# Réappliquer tes changements
git stash pop
```

#### Option B : Force reset (plus simple)

```bash
# Récupérer la dernière version de GitHub
git fetch origin

# Voir la différence
git log HEAD..origin/genspark_ai_developer --oneline

# Merger
git pull origin genspark_ai_developer
```

**❌ PROBLÈME** : Le sandbox a créé des commits qui ne sont pas sur GitHub !

---

## 🎯 SOLUTION ALTERNATIVE : COPIER LES CHANGEMENTS MANUELLEMENT

Puisque les commits du sandbox ne peuvent pas être pushés facilement, voici la solution la plus simple :

### 🕒 ÉTAPE 1 : Ajouter le bouton Apple sur /login (1 min)

1. Sur ton Mac, ouvre : `~/Desktop/amanah-GO/src/index.tsx`
2. Cherche la ligne (environ ligne 4424) :

```typescript
                <!-- OAuth Buttons -->
                <div class="space-y-3">
                    <a href="/api/auth/google"
```

3. **Juste avant** `<a href="/api/auth/google"`, ajoute :

```typescript
                    <!-- Apple Sign In -->
                    <a href="/api/auth/apple"
                       class="w-full flex items-center justify-center px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition cursor-pointer">
                        <i class="fab fa-apple text-white mr-2 text-xl"></i>
                        <span class="font-medium">Sign in with Apple</span>
                    </a>
                    
```

---

### 🕓 ÉTAPE 2 : Ajouter les routes Apple OAuth dans le backend (2 min)

1. Dans le même fichier `src/index.tsx`
2. Cherche la section des routes OAuth Google (environ ligne 3380) :

```typescript
// ==========================================
// OAUTH GOOGLE - Authentification
// ==========================================

app.get('/api/auth/google', (c) => {
```

3. **Juste AVANT** cette section Google, ajoute tout ce code :

```typescript
// ==========================================
// OAUTH APPLE - Sign in with Apple
// ==========================================

// Rediriger vers Apple OAuth
app.get('/api/auth/apple', (c) => {
  const appleClientId = c.env?.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID'
  const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/apple/callback`
  
  // Apple utilise OpenID Connect
  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?` +
    `client_id=${appleClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&response_mode=form_post` +
    `&scope=name email`
  
  return c.redirect(appleAuthUrl)
})

// Callback Apple OAuth (POST car Apple utilise form_post)
app.post('/api/auth/apple/callback', async (c) => {
  try {
    const formData = await c.req.formData()
    const code = formData.get('code')
    const user = formData.get('user') // Apple envoie les infos user seulement la première fois
    
    if (!code) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    const appleClientId = c.env?.APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID'
    const appleTeamId = c.env?.APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID'
    const appleKeyId = c.env?.APPLE_KEY_ID || 'YOUR_APPLE_KEY_ID'
    const applePrivateKey = c.env?.APPLE_PRIVATE_KEY || 'YOUR_APPLE_PRIVATE_KEY'
    const redirectUri = `${c.req.url.split('/api')[0]}/api/auth/apple/callback`
    
    // Créer client secret JWT pour Apple (valide 6 mois)
    const clientSecret = await sign(
      {
        iss: appleTeamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 180), // 6 mois
        aud: 'https://appleid.apple.com',
        sub: appleClientId
      },
      applePrivateKey,
      { algorithm: 'ES256', kid: appleKeyId }
    )
    
    // Échanger le code contre un access token
    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: appleClientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    
    const tokenData = await tokenResponse.json()
    if (!tokenData.id_token) {
      return c.redirect('/login?error=oauth_failed')
    }
    
    // Décoder l'id_token (JWT) pour récupérer les infos utilisateur
    const [, payloadBase64] = tokenData.id_token.split('.')
    const payload = JSON.parse(atob(payloadBase64))
    
    // Parser les infos user si disponibles (première connexion uniquement)
    let userName = 'Utilisateur Apple'
    if (user) {
      try {
        const userObj = typeof user === 'string' ? JSON.parse(user) : user
        userName = userObj.name ? `${userObj.name.firstName || ''} ${userObj.name.lastName || ''}`.trim() : userName
      } catch (e) {
        console.error('Erreur parsing user Apple:', e)
      }
    }
    
    // Vérifier si l'utilisateur existe déjà
    let dbUser = Array.from(inMemoryDB.users.values()).find(u => 
      u.email === payload.email || (u.oauth_provider === 'apple' && u.oauth_id === payload.sub)
    )
    
    if (!dbUser) {
      // Créer un nouvel utilisateur
      const userId = crypto.randomUUID()
      dbUser = {
        id: userId,
        email: payload.email,
        name: userName,
        phone: '', // À remplir plus tard
        avatar_url: null,
        oauth_provider: 'apple',
        oauth_id: payload.sub,
        kyc_status: 'PENDING',
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      }
      inMemoryDB.users.set(userId, dbUser)
      
      // 📧 Envoyer email de bienvenue
      try {
        const resendKey = c.env?.RESEND_API_KEY
        const emailHtml = EmailTemplates.welcome(dbUser.name)
        await sendEmail(dbUser.email, '👋 Bienvenue sur Amanah GO !', emailHtml, resendKey)
      } catch (emailError) {
        console.error('Erreur envoi email bienvenue:', emailError)
      }
    }
    
    // Générer JWT token
    const secret = c.env?.JWT_SECRET || JWT_SECRET
    const token = await sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 jours
      },
      secret
    )
    
    // Rediriger vers le dashboard avec le token
    return c.redirect(`/voyageur?token=${token}`)
    
  } catch (error: any) {
    console.error('Erreur OAuth Apple:', error)
    return c.redirect('/login?error=oauth_failed')
  }
})

```

---

### 🕔 ÉTAPE 3 : Ajouter sur la page /signup aussi (30 sec)

Répète l'ÉTAPE 1 pour la page signup (cherche "signup" et trouve la section OAuth, ajoute le même bouton Apple).

---

### 🕕 ÉTAPE 4 : Ajouter sur la Homepage (optionnel mais cool) (1 min)

Dans `src/index.tsx`, cherche la section Homepage (environ ligne 1160).

Après les cartes "Je voyage" / "J'envoie un colis", ajoute :

```typescript
                <!-- Quick OAuth Login Section -->
                <div class="mt-16 max-w-md mx-auto">
                    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h3 class="text-2xl font-bold text-white text-center mb-2">
                            Connexion rapide
                        </h3>
                        <p class="text-blue-100 text-center mb-6 text-sm">
                            Commencez en quelques secondes
                        </p>
                        
                        <div class="space-y-3">
                            <!-- Apple Sign In -->
                            <a href="/api/auth/apple"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-apple text-white mr-3 text-2xl"></i>
                                <span class="font-semibold text-lg">Sign in with Apple</span>
                            </a>
                            
                            <!-- Google Sign In -->
                            <a href="/api/auth/google"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-google text-red-500 mr-3 text-xl"></i>
                                <span class="font-semibold">Continuer avec Google</span>
                            </a>
                            
                            <!-- Facebook Sign In -->
                            <a href="/api/auth/facebook"
                               class="w-full flex items-center justify-center px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                                <i class="fab fa-facebook text-blue-600 mr-3 text-xl"></i>
                                <span class="font-semibold">Continuer avec Facebook</span>
                            </a>
                        </div>
                        
                        <!-- Divider -->
                        <div class="relative my-6">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-white/30"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-3 bg-transparent text-blue-100">ou</span>
                            </div>
                        </div>
                        
                        <!-- Email/Password Login Link -->
                        <div class="text-center">
                            <a href="/login" class="text-white hover:text-blue-100 font-medium text-sm underline decoration-2 underline-offset-4">
                                Se connecter avec email / mot de passe
                            </a>
                        </div>
                        
                        <!-- Signup Link -->
                        <p class="mt-4 text-center text-sm text-blue-100">
                            Pas encore de compte ?
                            <a href="/signup" class="text-white hover:text-blue-100 font-bold underline decoration-2 underline-offset-4">
                                Créer un compte
                            </a>
                        </p>
                    </div>
                </div>
```

---

### 🕖 ÉTAPE 5 : Build + Deploy (1 min)

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=amanah-go
```

---

### 🕗 ÉTAPE 6 : Commit (30 sec)

```bash
git add src/index.tsx
git commit -m "feat: Add Apple Sign In OAuth on all pages"
git push origin genspark_ai_developer
```

---

## ✅ RÉSULTAT

Après le déploiement, tu verras le bouton **🍎 Sign in with Apple** sur :
- https://amanahgo.app/ (homepage)
- https://amanahgo.app/login
- https://amanahgo.app/signup

---

## ⚠️ ATTENTION

Le bouton Apple sera **visible** mais **ne fonctionnera pas encore** tant que tu n'auras pas :
1. Créé le compte Apple Developer (99$/an)
2. Configuré Service ID + Private Key
3. Ajouté les 4 variables dans Cloudflare Pages

**Mais au moins il sera visible !** 🎉

---

## 🚀 POUR ALLER PLUS VITE

Au lieu de copier-coller le code manuellement, tu peux aussi :

### Méthode Alternative : Créer un nouveau fichier de patch

Je vais créer un fichier `.patch` que tu appliqueras :

```bash
cd ~/Desktop/amanah-GO
git apply apple-signin.patch
npm run build
npx wrangler pages deploy dist --project-name=amanah-go
```

**Dis-moi si tu veux que je crée le patch file !**

---

## 💡 QUESTION POUR TOI

**Tu préfères :**

**A)** Copier-coller le code manuellement demain matin (5 min) ← Plus pédagogique

**B)** Je crée un fichier patch que tu appliqueras en 1 commande (1 min) ← Plus rapide

**Dis-moi !** 😊

---

**En attendant, bonne nuit ! À demain pour voir le beau bouton Apple 🍎 !**
