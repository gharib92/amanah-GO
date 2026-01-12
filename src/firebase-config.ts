// Firebase Configuration pour Amanah GO
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  User
} from 'firebase/auth';

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

// ============================================
// 1. INSCRIPTION PAR EMAIL
// ============================================
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Envoyer l'email de vérification
    await sendEmailVerification(userCredential.user);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Erreur inscription email:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 2. CONNEXION PAR EMAIL
// ============================================
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erreur connexion email:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 3. CONNEXION AVEC GOOGLE
// ============================================
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erreur connexion Google:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 4. CONNEXION AVEC FACEBOOK
// ============================================
export async function signInWithFacebook(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erreur connexion Facebook:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 5. CONNEXION AVEC APPLE
// ============================================
export async function signInWithApple(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erreur connexion Apple:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 6. VÉRIFICATION PAR SMS (TÉLÉPHONE)
// ============================================
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function initRecaptcha(containerId: string) {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA résolu');
      }
    });
  }
  return recaptchaVerifier;
}

export async function sendSMSVerification(phoneNumber: string, recaptchaContainer: string) {
  try {
    // Format international requis : +33612345678
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Le numéro doit être au format international (+33...)');
    }

    const verifier = initRecaptcha(recaptchaContainer);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    
    return confirmationResult;
  } catch (error: any) {
    console.error('Erreur envoi SMS:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 7. RÉCUPÉRER L'UTILISATEUR ACTUEL
// ============================================
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ============================================
// 8. DÉCONNEXION
// ============================================
export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error: any) {
    console.error('Erreur déconnexion:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

// ============================================
// 9. RÉCUPÉRER LE TOKEN ID
// ============================================
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Erreur récupération token:', error);
    return null;
  }
}

// ============================================
// 10. ÉCOUTER LES CHANGEMENTS D'AUTH
// ============================================
export function onAuthStateChanged(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged(callback);
}

// ============================================
// MESSAGES D'ERREUR EN FRANÇAIS
// ============================================
function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Email invalide',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Mot de passe trop faible (min 6 caractères)',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
    'auth/invalid-phone-number': 'Numéro de téléphone invalide',
    'auth/invalid-verification-code': 'Code de vérification invalide',
    'auth/missing-phone-number': 'Numéro de téléphone manquant',
    'auth/quota-exceeded': 'Quota SMS dépassé',
    'auth/captcha-check-failed': 'Vérification reCAPTCHA échouée',
    'auth/popup-closed-by-user': 'Fenêtre de connexion fermée',
    'auth/cancelled-popup-request': 'Demande de connexion annulée',
    'auth/popup-blocked': 'Popup bloquée par le navigateur',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email'
  };

  return errorMessages[errorCode] || `Erreur d'authentification: ${errorCode}`;
}

// Export auth pour utilisation directe
export { auth };
export default app;
