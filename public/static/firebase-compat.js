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

// Storage keys
const AUTH_TOKEN_KEY = 'amanah_token';
const AUTH_USER_KEY = 'amanah_user';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Sauvegarder le token dans localStorage
 */
window.saveFirebaseToken = function(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  console.log('🔐 Token sauvegardé');
};

/**
 * Récupérer le token depuis localStorage
 */
window.getFirebaseToken = function() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
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
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  console.log('👤 Utilisateur sauvegardé:', user.email);
};

/**
 * Récupérer l'utilisateur depuis localStorage
 */
window.getFirebaseUser = function() {
  const userData = localStorage.getItem(AUTH_USER_KEY);
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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
