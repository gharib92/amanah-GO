# 🔥 GUIDE D'INTÉGRATION FIREBASE AUTHENTICATION

**Date** : 9 janvier 2026  
**Projet** : Amanah GO  
**Statut** : ✅ Firebase configuré et prêt

---

## 📋 CE QUI A ÉTÉ FAIT

✅ Firebase SDK installé (`npm install firebase`)  
✅ Module `src/firebase-config.ts` créé  
✅ Toutes les méthodes d'authentification configurées :
- Email/Password
- Google OAuth
- Facebook OAuth
- Apple OAuth
- SMS/Phone verification

---

## 🔧 CONFIGURATION FIREBASE (DÉJÀ FAITE)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCtz79Y0HLOuTibmaoeJm-w0dzkpY18aiQ",
  authDomain: "studio-1096025835-e3034.firebaseapp.com",
  projectId: "studio-1096025835-e3034",
  storageBucket: "studio-1096025835-e3034.firebasestorage.app",
  messagingSenderId: "867447961267",
  appId: "1:867447961267:web:892fdbbdf8c8c7bcf1a2c6"
};
```

---

## 📱 ACTIVER LA VÉRIFICATION SMS DANS FIREBASE

### Étape 1 : Activer Phone Authentication

1. Va sur : https://console.firebase.google.com/
2. Sélectionne ton projet : **studio-1096025835-e3034**
3. Menu gauche → **Authentication**
4. Onglet **"Sign-in method"**
5. Clique sur **"Phone"**
6. **Active** le provider
7. **Enregistre**

### Étape 2 : Quotas gratuits Firebase

Firebase offre **GRATUITEMENT** :
- ✅ **10,000 vérifications SMS/mois**
- ✅ Illimité pour Email
- ✅ Illimité pour OAuth

Après 10,000 SMS : ~$0.01/vérification

---

## 🔐 CONFIGURER OAUTH (GOOGLE, FACEBOOK, APPLE)

### Google OAuth

1. Firebase Console → Authentication → Sign-in method
2. Clique sur **"Google"**
3. **Active** le provider
4. Email du projet : ton email
5. **Enregistre**

### Facebook OAuth

1. Crée une app sur : https://developers.facebook.com/
2. Récupère **App ID** et **App Secret**
3. Firebase Console → Authentication → Facebook
4. Colle **App ID** et **App Secret**
5. Copie l'**URL de redirection OAuth** depuis Firebase
6. Va sur Facebook Developers → Ton app → Paramètres → Basique
7. Ajoute l'URL de redirection
8. **Active** l'app Facebook (mode Production)

### Apple OAuth

1. Firebase Console → Authentication → Apple
2. **Active** le provider
3. Enregistre

---

## 🚀 UTILISATION DANS LE CODE

### 1. Inscription par Email

```typescript
import { signUpWithEmail } from './firebase-config';

// Dans ton code
try {
  const user = await signUpWithEmail('user@example.com', 'password123');
  console.log('Utilisateur créé:', user.uid);
  
  // Un email de vérification est automatiquement envoyé
  alert('Email de vérification envoyé !');
} catch (error) {
  console.error(error.message);
}
```

### 2. Connexion par Email

```typescript
import { signInWithEmail } from './firebase-config';

try {
  const user = await signInWithEmail('user@example.com', 'password123');
  console.log('Connecté:', user.email);
} catch (error) {
  console.error(error.message);
}
```

### 3. Connexion avec Google

```typescript
import { signInWithGoogle } from './firebase-config';

try {
  const user = await signInWithGoogle();
  console.log('Connecté avec Google:', user.displayName);
} catch (error) {
  console.error(error.message);
}
```

### 4. Connexion avec Facebook

```typescript
import { signInWithFacebook } from './firebase-config';

try {
  const user = await signInWithFacebook();
  console.log('Connecté avec Facebook:', user.displayName);
} catch (error) {
  console.error(error.message);
}
```

### 5. Vérification par SMS

```html
<!-- Ajoute un container pour reCAPTCHA -->
<div id="recaptcha-container"></div>

<button onclick="sendSMS()">Envoyer SMS</button>
```

```typescript
import { sendSMSVerification } from './firebase-config';

async function sendSMS() {
  try {
    // Numéro au format international (+33...)
    const confirmationResult = await sendSMSVerification('+33612345678', 'recaptcha-container');
    
    // Demande le code à l'utilisateur
    const code = prompt('Entrez le code reçu par SMS:');
    
    // Vérifie le code
    const result = await confirmationResult.confirm(code);
    console.log('Téléphone vérifié:', result.user.phoneNumber);
  } catch (error) {
    console.error(error.message);
  }
}
```

### 6. Récupérer l'utilisateur actuel

```typescript
import { getCurrentUser, onAuthStateChanged } from './firebase-config';

// Méthode 1 : Synchrone
const user = getCurrentUser();
if (user) {
  console.log('Connecté:', user.email);
}

// Méthode 2 : Observer (recommandé)
onAuthStateChanged((user) => {
  if (user) {
    console.log('Utilisateur connecté:', user.email);
  } else {
    console.log('Aucun utilisateur connecté');
  }
});
```

### 7. Récupérer le Token pour l'API

```typescript
import { getIdToken } from './firebase-config';

async function callAPI() {
  const token = await getIdToken();
  
  if (!token) {
    throw new Error('Non authentifié');
  }
  
  const response = await fetch('/api/trips', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

### 8. Déconnexion

```typescript
import { signOut } from './firebase-config';

async function logout() {
  try {
    await signOut();
    console.log('Déconnecté');
    window.location.href = '/login';
  } catch (error) {
    console.error(error.message);
  }
}
```

---

## 🔒 VÉRIFIER LES TOKENS CÔTÉ SERVEUR

Firebase génère des **JWT tokens** qu'on doit vérifier côté serveur.

### Installation

```bash
npm install firebase-admin
```

### Code serveur (Cloudflare Workers)

```typescript
import admin from 'firebase-admin';

// Initialiser Firebase Admin (une seule fois)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "studio-1096025835-e3034",
      // Ajoute les autres credentials depuis Firebase Console
    })
  });
}

// Middleware de vérification
async function verifyFirebaseToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token manquant');
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken; // { uid, email, ... }
  } catch (error) {
    throw new Error('Token invalide');
  }
}

// Utilisation dans une route
app.post('/api/trips', async (c) => {
  try {
    const user = await verifyFirebaseToken(c.req.raw);
    
    // user.uid = ID Firebase de l'utilisateur
    // Crée ou récupère l'utilisateur dans ta DB
    
    // ... ton code
  } catch (error) {
    return c.json({ error: error.message }, 401);
  }
});
```

---

## 🎯 PROCHAINES ÉTAPES

### 1. Activer Phone Authentication dans Firebase
- Va dans Firebase Console
- Authentication → Sign-in method → Phone
- Active

### 2. Configurer les OAuth Providers
- Google : Déjà activé par défaut
- Facebook : Nécessite App ID/Secret
- Apple : Activer dans Firebase

### 3. Intégrer dans les pages existantes
- Page `/signup` : Utiliser `signUpWithEmail()`
- Page `/login` : Utiliser `signInWithEmail()` ou OAuth
- Page `/verify-profile` : Utiliser `sendSMSVerification()`

### 4. Remplacer le système JWT actuel
- Utiliser `getIdToken()` côté client
- Utiliser `verifyIdToken()` côté serveur

---

## 📊 AVANTAGES FIREBASE

✅ **Gratuit** : 10,000 SMS/mois + illimité Email/OAuth  
✅ **Fiable** : Infrastructure Google  
✅ **Sécurisé** : Tokens JWT auto-gérés  
✅ **Scalable** : Supporte des millions d'utilisateurs  
✅ **Simple** : SDK facile à utiliser  
✅ **Multi-plateforme** : Web, iOS, Android  

---

## 🐛 DÉPANNAGE

### Erreur "Firebase: Error (auth/popup-blocked)"
→ Le navigateur bloque les popups. Demande à l'utilisateur d'autoriser.

### Erreur "Firebase: Error (auth/network-request-failed)"
→ Problème de connexion internet

### Erreur "Firebase: Error (auth/too-many-requests)"
→ Trop de tentatives. Attendre quelques minutes.

### SMS non reçus
→ Vérifie que Phone Authentication est activé dans Firebase Console

---

## 📚 DOCUMENTATION

- Firebase Auth : https://firebase.google.com/docs/auth
- Firebase Web SDK : https://firebase.google.com/docs/web/setup
- Phone Auth : https://firebase.google.com/docs/auth/web/phone-auth

---

**Créé le** : 9 janvier 2026  
**Dernière mise à jour** : 9 janvier 2026  
**Statut** : Module prêt, intégration en cours
