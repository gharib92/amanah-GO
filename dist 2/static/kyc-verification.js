// KYC Verification - Selfie & ID Document
let stream = null;
let capturedSelfie = null;
let uploadedID = null;

// Vérifier si les deux documents sont prêts
function checkDocumentsReady() {
  const submitBtn = document.getElementById('submitKYCBtn');
  if (capturedSelfie && uploadedID) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('bg-green-500/20', 'text-green-300', 'cursor-not-allowed');
    submitBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white', 'cursor-pointer');
    submitBtn.classList.add('bg-green-500/20', 'text-green-300', 'cursor-not-allowed');
  }
}

// Démarrer la capture selfie
async function startSelfieCapture() {
  const videoElement = document.getElementById('selfieVideo');
  const captureBtn = document.getElementById('captureSelfieBtn');
  const retakeBtn = document.getElementById('retakeSelfieBtn');
  const selfiePreview = document.getElementById('selfiePreview');
  
  try {
    // Vérifier si getUserMedia est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('BROWSER_NOT_SUPPORTED');
    }
    
    // Demander accès à la caméra
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    videoElement.srcObject = stream;
    videoElement.classList.remove('hidden');
    captureBtn.classList.remove('hidden');
    
    // Cacher le bouton de démarrage et le placeholder
    const startBtn = document.getElementById('startSelfieBtn');
    if (startBtn) startBtn.classList.add('hidden');
    document.getElementById('selfiePreviewEmpty').classList.add('hidden');
    
    console.log('✅ Caméra activée avec succès');
    
  } catch (error) {
    console.error('Erreur accès caméra:', error);
    
    let errorMessage = '';
    let errorTitle = '';
    let solution = '';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorTitle = '🚫 Permission refusée';
      errorMessage = 'Vous avez refusé l\'accès à la caméra.';
      solution = '➡️ Solution :\n1. Cliquez sur l\'icône 🔒 dans la barre d\'adresse\n2. Autorisez l\'accès à la caméra\n3. Actualisez la page (F5)';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorTitle = '📷 Aucune caméra détectée';
      errorMessage = 'Aucune caméra n\'a été trouvée sur votre appareil.';
      solution = '➡️ Solution :\n1. Vérifiez qu\'une webcam est connectée\n2. Testez votre caméra dans une autre application\n3. Réessayez';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorTitle = '⚠️ Caméra déjà utilisée';
      errorMessage = 'La caméra est déjà utilisée par une autre application.';
      solution = '➡️ Solution :\n1. Fermez toutes les applications utilisant la caméra\n2. Fermez les autres onglets avec caméra\n3. Réessayez';
    } else if (error.name === 'OverconstrainedError') {
      errorTitle = '⚙️ Résolution non supportée';
      errorMessage = 'Votre caméra ne supporte pas la résolution demandée.';
      solution = '➡️ Solution : La caméra va redémarrer avec une résolution plus basse...';
      
      // Réessayer avec résolution plus basse
      setTimeout(() => startSelfieCaptureWithLowerResolution(), 2000);
      return;
    } else if (error.name === 'TypeError' || error.message === 'BROWSER_NOT_SUPPORTED') {
      errorTitle = '🔒 Connexion sécurisée requise (HTTPS)';
      errorMessage = 'L\'accès à la caméra nécessite une connexion HTTPS sécurisée.\n\n⚠️ IMPORTANT : Vous devez accéder au site via HTTPS.';
      solution = '➡️ Solutions :\n\n1. Utilisez l\'URL HTTPS du site :\n   https://votre-domaine.pages.dev\n\n2. En développement local :\n   http://localhost:3000\n\n3. Déployez sur Cloudflare Pages pour avoir HTTPS automatique';
    } else {
      errorTitle = '❌ Erreur inconnue';
      errorMessage = 'Une erreur inattendue s\'est produite : ' + error.message;
      solution = '➡️ Solution :\n1. Actualisez la page (F5)\n2. Réessayez dans quelques instants\n3. Contactez le support si le problème persiste';
    }
    
    alert(errorTitle + '\n\n' + errorMessage + '\n\n' + solution);
  }
}

// Réessayer avec résolution plus basse
async function startSelfieCaptureWithLowerResolution() {
  const videoElement = document.getElementById('selfieVideo');
  const captureBtn = document.getElementById('captureSelfieBtn');
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    });
    
    videoElement.srcObject = stream;
    videoElement.classList.remove('hidden');
    captureBtn.classList.remove('hidden');
    
    const startBtn = document.getElementById('startSelfieBtn');
    if (startBtn) startBtn.classList.add('hidden');
    document.getElementById('selfiePreviewEmpty').classList.add('hidden');
    
    console.log('✅ Caméra activée en résolution réduite (640x480)');
    alert('✅ Caméra activée en résolution réduite (640x480)');
    
  } catch (error) {
    console.error('Erreur même avec résolution réduite:', error);
    alert('❌ Impossible d\'activer la caméra même en basse résolution.\n\nVeuillez vérifier que votre caméra fonctionne correctement.');
  }
}

// Capturer le selfie
function captureSelfie() {
  const videoElement = document.getElementById('selfieVideo');
  const canvas = document.getElementById('selfieCanvas');
  const ctx = canvas.getContext('2d');
  const captureBtn = document.getElementById('captureSelfieBtn');
  const retakeBtn = document.getElementById('retakeSelfieBtn');
  const selfiePreview = document.getElementById('selfiePreview');
  
  // Définir les dimensions du canvas
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Capturer l'image
  ctx.drawImage(videoElement, 0, 0);
  
  // Convertir en blob
  canvas.toBlob((blob) => {
    capturedSelfie = blob;
    
    // Afficher l'aperçu
    const url = URL.createObjectURL(blob);
    selfiePreview.src = url;
    selfiePreview.classList.remove('hidden');
    
    // Masquer la vidéo et afficher le bouton retake
    videoElement.classList.add('hidden');
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    
    // Masquer le placeholder vide
    document.getElementById('selfiePreviewEmpty').classList.add('hidden');
    
    // Arrêter le stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    // Vérifier si on peut soumettre
    checkDocumentsReady();
    
    console.log('Selfie capturé:', blob.size, 'bytes');
  }, 'image/jpeg', 0.9);
}

// Reprendre le selfie
function retakeSelfie() {
  const videoElement = document.getElementById('selfieVideo');
  const retakeBtn = document.getElementById('retakeSelfieBtn');
  const selfiePreview = document.getElementById('selfiePreview');
  
  capturedSelfie = null;
  selfiePreview.classList.add('hidden');
  retakeBtn.classList.add('hidden');
  
  // Redémarrer la capture
  startSelfieCapture();
}

// Upload de la pièce d'identité
function uploadIDDocument() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }
    
    uploadedID = file;
    
    // Afficher l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('idPreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      
      // Afficher le nom du fichier
      document.getElementById('idFileName').textContent = file.name;
      document.getElementById('idFileName').classList.remove('hidden');
      
      // Masquer le placeholder vide
      document.getElementById('idPreviewEmpty').classList.add('hidden');
      
      // Vérifier si on peut soumettre
      checkDocumentsReady();
    };
    reader.readAsDataURL(file);
    
    console.log('Pièce d\'identité uploadée:', file.name, file.size, 'bytes');
  };
  
  input.click();
}

// Soumettre la vérification KYC
async function submitKYCVerification() {
  if (!capturedSelfie) {
    alert('Veuillez capturer un selfie.');
    return;
  }
  
  if (!uploadedID) {
    alert('Veuillez uploader votre pièce d\'identité.');
    return;
  }
  
  // Afficher le loader
  const submitBtn = document.getElementById('submitKYCBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification en cours...';
  
  try {
    // Créer FormData
    const formData = new FormData();
    formData.append('selfie', capturedSelfie, 'selfie.jpg');
    formData.append('id_document', uploadedID);
    
    // TODO: Ajouter user_id depuis la session
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id') || 'user001';
    formData.append('user_id', userId);
    
    // Envoyer au serveur
    const response = await axios.post('/api/auth/verify-kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      // Succès !
      alert('✅ Vérification KYC réussie ! Votre profil est maintenant vérifié.');
      
      // Rediriger vers le dashboard
      setTimeout(() => {
        window.location.href = '/voyageur';
      }, 2000);
    } else {
      alert('❌ Échec de la vérification: ' + (response.data.error || 'Erreur inconnue'));
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Soumettre la vérification';
    }
    
  } catch (error) {
    console.error('Erreur KYC:', error);
    alert('Erreur lors de la vérification: ' + (error.response?.data?.error || error.message));
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Soumettre la vérification';
  }
}
