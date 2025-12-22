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
    
    // Cacher le bouton de démarrage
    document.querySelector('[onclick="startSelfieCapture()"]').classList.add('hidden');
    
  } catch (error) {
    console.error('Erreur accès caméra:', error);
    alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
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
