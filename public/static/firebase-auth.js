/**
 * Firebase Authentication Module for Amanah GO
 * Remplace le système JWT manuel par Firebase Authentication
 */

// Import Firebase SDK depuis CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCtz79Y0HLOuTibmaoeJm-w0dzkpY18aiQ",
  authDomain: "studio-1096025835-e3034.firebaseapp.com",
  projectId: "studio-1096025835-e3034",
  storageBucket: "studio-1096025835-e3034.firebasestorage.app",
  messagingSenderId: "867447961267",
  appId: "1:867447961267:web:892fdbbdf8c8c7bcf1a2c6"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Providers OAuth
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Storage keys (compatible avec auth.js)
const AUTH_TOKEN_KEY = 'amanah_token';
const AUTH_USER_KEY = 'amanah_user';

// ==========================================
// TOKEN MANAGEMENT (Compatible avec auth.js)
// ==========================================
function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// ==========================================
// INSCRIPTION
// ==========================================
async function signup(email, password, name, phone) {
  try {
    console.log('🔥 Firebase signup:', email);
    
    // 1. Créer l'utilisateur dans Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Firebase user created:', firebaseUser.uid);
    
    // 2. Envoyer l'email de vérification
    await sendEmailVerification(firebaseUser);
    console.log('✅ Verification email sent');
    
    // 3. Récupérer le token Firebase
    const idToken = await firebaseUser.getIdToken();
    
    // 4. Créer l'utilisateur dans notre DB via API
    const response = await fetch('/api/auth/firebase-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        email,
        name,
        phone
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création du compte');
    }
    
    // 5. Sauvegarder l'utilisateur localement ET le token Firebase
    const user = {
      id: data.user.id,
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name,
      phone,
      emailVerified: firebaseUser.emailVerified,
      kyc_status: data.user.kyc_status
    };
    
    saveUser(user);
    saveToken(idToken); // ✅ Sauvegarder le token pour compatibilité auth.js
    
    console.log('✅ User saved in DB:', user);
    console.log('✅ Firebase token saved in localStorage');
    
    return { success: true, user, token: idToken };
    
  } catch (error) {
    console.error('❌ Firebase signup error:', error);
    return { 
      success: false, 
      error: getFirebaseErrorMessage(error.code) || error.message 
    };
  }
}

// ==========================================
// CONNEXION
// ==========================================
async function login(email, password) {
  try {
    console.log('🔥 Firebase login:', email);
    
    // 1. Se connecter avec Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Firebase login successful:', firebaseUser.uid);
    
    // 2. Récupérer le token
    const idToken = await firebaseUser.getIdToken();
    
    // 3. Récupérer les données utilisateur depuis notre DB
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération du profil');
    }
    
    // 4. Sauvegarder localement ET le token
    const user = {
      ...data.user,
      firebaseUid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified
    };
    
    saveUser(user);
    saveToken(idToken); // ✅ Sauvegarder le token pour compatibilité auth.js
    
    console.log('✅ User logged in:', user);
    console.log('✅ Firebase token saved in localStorage');
    
    return { success: true, user, token: idToken };
    
  } catch (error) {
    console.error('❌ Firebase login error:', error);
    return { 
      success: false, 
      error: getFirebaseErrorMessage(error.code) || error.message 
    };
  }
}

// ==========================================
// CONNEXION GOOGLE
// ==========================================
async function loginWithGoogle() {
  try {
    console.log('🔥 Firebase Google login');
    
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();
    
    // Créer ou récupérer l'utilisateur dans notre DB
    const response = await fetch('/api/auth/firebase-oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        provider: 'google',
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    const user = {
      ...data.user,
      firebaseUid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified
    };
    
    saveUser(user);
    saveToken(idToken); // ✅ Sauvegarder le token pour compatibilité auth.js
    console.log('✅ Google login successful, token saved');
    
    return { success: true, user, token: idToken };
    
  } catch (error) {
    console.error('❌ Google login error:', error);
    return { success: false, error: getFirebaseErrorMessage(error.code) || error.message };
  }
}

// ==========================================
// VÉRIFICATION SMS
// ==========================================
let recaptchaVerifier = null;
let confirmationResult = null;

async function sendSMSVerification(phoneNumber) {
  try {
    console.log('🔥 Firebase SMS verification:', phoneNumber);
    
    // Initialiser reCAPTCHA si pas encore fait
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('✅ reCAPTCHA solved');
        }
      });
    }
    
    // Envoyer le SMS
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    console.log('✅ SMS sent to:', phoneNumber);
    
    return { success: true, message: 'SMS envoyé' };
    
  } catch (error) {
    console.error('❌ SMS verification error:', error);
    return { 
      success: false, 
      error: getFirebaseErrorMessage(error.code) || error.message 
    };
  }
}

async function verifySMSCode(code) {
  try {
    if (!confirmationResult) {
      throw new Error('Aucune vérification SMS en cours');
    }
    
    const result = await confirmationResult.confirm(code);
    console.log('✅ Phone verified:', result.user.phoneNumber);
    
    // Mettre à jour le téléphone dans notre DB
    const idToken = await result.user.getIdToken();
    
    await fetch('/api/auth/update-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        phone: result.user.phoneNumber
      })
    });
    
    return { success: true, phoneNumber: result.user.phoneNumber };
    
  } catch (error) {
    console.error('❌ Code verification error:', error);
    return { 
      success: false, 
      error: getFirebaseErrorMessage(error.code) || error.message 
    };
  }
}

// ==========================================
// RÉCUPÉRER TOKEN (pour les requêtes API)
// ==========================================
async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
}

// ==========================================
// REQUÊTES API AUTHENTIFIÉES
// ==========================================
async function apiRequest(url, options = {}) {
  const token = await getToken();
  
  if (!token) {
    console.error('❌ No Firebase token available');
    window.location.href = '/login';
    return null;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Si 401, token invalide
  if (response.status === 401) {
    await logout();
    window.location.href = '/login';
    return null;
  }
  
  return await response.json();
}

// ==========================================
// DÉCONNEXION
// ==========================================
async function logout() {
  try {
    await firebaseSignOut(auth);
    removeUser();
    console.log('✅ Logged out');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
}

// ==========================================
// GESTION UTILISATEUR LOCAL
// ==========================================
function saveUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getUser() {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function removeUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

function isAuthenticated() {
  return !!auth.currentUser;
}

// ==========================================
// OBSERVER AUTH STATE
// ==========================================
onAuthStateChanged(auth, (firebaseUser) => {
  console.log('🔥 Auth state changed:', firebaseUser ? firebaseUser.email : 'logged out');
  
  if (!firebaseUser) {
    removeUser();
  }
});

// ==========================================
// PROTECTION DES PAGES
// ==========================================
function requireAuth() {
  if (!auth.currentUser) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

function redirectIfAuthenticated() {
  if (auth.currentUser) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    window.location.href = redirect;
    return true;
  }
  return false;
}

// ==========================================
// MESSAGES D'ERREUR
// ==========================================
function getFirebaseErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Email invalide',
    'auth/weak-password': 'Mot de passe trop faible (min 6 caractères)',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur réseau',
    'auth/popup-closed-by-user': 'Fenêtre de connexion fermée',
    'auth/invalid-phone-number': 'Numéro de téléphone invalide',
    'auth/invalid-verification-code': 'Code de vérification invalide'
  };
  
  return messages[errorCode];
}

// ==========================================
// EXPORT
// ==========================================
window.firebaseAuth = {
  signup,
  login,
  loginWithGoogle,
  sendSMSVerification,
  verifySMSCode,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  requireAuth,
  redirectIfAuthenticated,
  apiRequest,
  auth // Accès direct à Firebase auth si besoin
};

console.log('🔥 Firebase Auth Module loaded');
