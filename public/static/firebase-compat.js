/**
 * Firebase Authentication COMPAT for Amanah GO
 * Simple global Firebase configuration
 */

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCtz79Y0HLOuTibmaoeJm-w0dzkpY18aiQ",
  authDomain: "studio-1096025835-e3034.firebaseapp.com",
  projectId: "studio-1096025835-e3034",
  storageBucket: "studio-1096025835-e3034.firebasestorage.app",
  messagingSenderId: "867447961267",
  appId: "1:867447961267:web:892fdbbdf8c8c7bcf1a2c6"
};

// Initialiser Firebase (seulement si pas déjà initialisé)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Auth instance globale
window.firebaseAuth = firebase.auth();

// Storage keys (utiliser celles définies dans auth.js pour éviter les duplications)
// const AUTH_TOKEN_KEY = 'amanah_token';
// const AUTH_USER_KEY = 'amanah_user';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Sauvegarder le token dans localStorage
 */
window.saveFirebaseToken = function(token) {
  localStorage.setItem('amanah_token', token);
  console.log('🔐 Token sauvegardé');
};

/**
 * Récupérer le token depuis localStorage
 */
window.getFirebaseToken = function() {
  return localStorage.getItem('amanah_token');
};

/**
 * Sauvegarder l'utilisateur dans localStorage
 */
window.saveFirebaseUser = function(user) {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber
  };
  localStorage.setItem('amanah_user', JSON.stringify(userData));
  console.log('👤 Utilisateur sauvegardé:', user.email);
};

/**
 * Récupérer l'utilisateur depuis localStorage
 */
window.getFirebaseUser = function() {
  const userData = localStorage.getItem('amanah_user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Vérifier si l'utilisateur est connecté
 */
window.isFirebaseAuthenticated = function() {
  return !!window.firebaseAuth.currentUser || !!window.getFirebaseUser();
};

/**
 * Déconnexion
 */
window.firebaseLogout = async function() {
  try {
    await window.firebaseAuth.signOut();
    localStorage.removeItem('amanah_token');
    localStorage.removeItem('amanah_user');
    console.log('👋 Déconnexion réussie');
    window.location.href = '/';
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
  }
};

/**
 * Connexion avec Google
 */
window.loginWithGoogle = async function() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await window.firebaseAuth.signInWithPopup(provider);
    const user = result.user;
    
    // Sauvegarder token et user
    const token = await user.getIdToken();
    window.saveFirebaseToken(token);
    window.saveFirebaseUser(user);
    
    // Créer/mettre à jour l'utilisateur dans notre DB
    await fetch('/api/auth/firebase-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        phone: user.phoneNumber || '',
        firebase_uid: user.uid
      })
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Google login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer SMS de vérification avec Firebase Phone Auth
 */
window.sendSMSVerification = async function(phoneNumber) {
  try {
    // Créer le reCAPTCHA invisible (une seule fois)
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('✅ reCAPTCHA résolu');
        }
      });
    }
    
    console.log('🔥 Envoi SMS Firebase à:', phoneNumber);
    
    // Envoyer le SMS via Firebase
    const confirmationResult = await window.firebaseAuth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
    
    // Sauvegarder pour vérification ultérieure
    window.phoneConfirmationResult = confirmationResult;
    
    console.log('✅ SMS envoyé avec succès');
    
    return { success: true, message: 'SMS envoyé' };
  } catch (error) {
    console.error('❌ Erreur SMS:', error);
    
    // Reset reCAPTCHA en cas d'erreur
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Vérifier le code SMS
 */
window.verifySMSCode = async function(code) {
  try {
    if (!window.phoneConfirmationResult) {
      throw new Error('Aucune vérification SMS en cours');
    }
    
    console.log('🔥 Vérification du code:', code);
    
    // Confirmer le code
    const result = await window.phoneConfirmationResult.confirm(code);
    const user = result.user;
    
    console.log('✅ Téléphone vérifié:', user.phoneNumber);
    
    // Récupérer le token
    const token = await user.getIdToken();
    
    return { success: true, token, phoneNumber: user.phoneNumber };
  } catch (error) {
    console.error('❌ Erreur vérification code:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// AUTH STATE LISTENER
// ==========================================
window.firebaseAuth.onAuthStateChanged((user) => {
  if (user) {
    console.log('🔥 Auth state: logged in', user.email);
    window.saveFirebaseUser(user);
  } else {
    console.log('🔥 Auth state: logged out');
  }
});

console.log('🔥 Firebase COMPAT initialized');
