/**
 * KYC Selfie Camera Module v2.0
 * Module autonome pour la capture de selfie KYC
 * Zero regression - Isolated implementation
 */

class KycSelfieCamera {
  constructor(options = {}) {
    this.options = {
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {}),
      onError: options.onError || (() => {}),
      maxFileSize: options.maxFileSize || 5 * 1024 * 1024, // 5MB
      quality: options.quality || 0.85
    };
    
    this.stream = null;
    this.capturedBlob = null;
    this.modalId = 'kyc-selfie-modal-v2';
    
    console.log('📷 KycSelfieCamera v2 initialized');
  }

  /**
   * Ouvrir la caméra
   */
  async open() {
    try {
      console.log('📷 Opening camera...');
      
      // Vérifier authentification
      const token = localStorage.getItem('amanah_token');
      if (!token) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      }
      
      // Créer et afficher le modal
      this.createModal();
      this.showModal();
      
      // Demander permission caméra
      await this.startCamera();
      
    } catch (error) {
      console.error('❌ Error opening camera:', error);
      this.handleError(error);
    }
  }

  /**
   * Créer le modal HTML
   */
  createModal() {
    // Supprimer ancien modal si existe
    const oldModal = document.getElementById(this.modalId);
    if (oldModal) {
      oldModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">📷 Selfie KYC</h2>
            <button onclick="window.kycCamera.close()" class="text-white/80 hover:text-white">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
          <p class="text-blue-100 mt-2">Prenez une photo claire de votre visage</p>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Camera View -->
          <div id="cameraView" class="relative">
            <video id="selfieVideo" autoplay playsinline class="w-full rounded-lg bg-black"></video>
            <canvas id="selfieCanvas" style="display:none;"></canvas>
            
            <!-- Overlay guide -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-64 h-80 border-4 border-white/50 rounded-full"></div>
            </div>
            
            <!-- Buttons -->
            <div class="mt-6 flex justify-center space-x-4">
              <button id="captureBtn" onclick="window.kycCamera.capture()" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center space-x-2">
                <i class="fas fa-camera"></i>
                <span>Capturer</span>
              </button>
              <button onclick="window.kycCamera.close()" 
                class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition">
                Annuler
              </button>
            </div>
          </div>

          <!-- Preview View (hidden by default) -->
          <div id="previewView" style="display:none;">
            <img id="selfiePreviewImg" class="w-full rounded-lg" />
            
            <!-- Buttons -->
            <div class="mt-6 flex justify-center space-x-4">
              <button id="validateBtn" onclick="window.kycCamera.upload()" 
                class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center space-x-2">
                <i class="fas fa-check"></i>
                <span>Valider</span>
              </button>
              <button onclick="window.kycCamera.retake()" 
                class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition flex items-center space-x-2">
                <i class="fas fa-redo"></i>
                <span>Reprendre</span>
              </button>
            </div>
          </div>

          <!-- Loading View (hidden by default) -->
          <div id="loadingView" style="display:none;" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p class="text-gray-600 text-lg">Upload en cours...</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Afficher le modal
   */
  showModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Démarrer la caméra
   */
  async startCamera() {
    try {
      console.log('📷 Requesting camera access...');
      
      // Demander caméra frontale
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Caméra frontale
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('✅ Camera access granted');
      
      // Attacher le stream à la vidéo
      const video = document.getElementById('selfieVideo');
      if (video) {
        video.srcObject = this.stream;
      }
      
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('Aucune caméra détectée sur cet appareil.');
      } else {
        throw new Error('Erreur lors de l\'accès à la caméra: ' + error.message);
      }
    }
  }

  /**
   * Capturer la photo
   */
  capture() {
    try {
      console.log('📸 Capturing photo...');
      
      const video = document.getElementById('selfieVideo');
      const canvas = document.getElementById('selfieCanvas');
      
      if (!video || !canvas) {
        throw new Error('Éléments vidéo/canvas introuvables');
      }
      
      // Configurer le canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dessiner l'image
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convertir en Blob (JPEG avec compression)
      canvas.toBlob((blob) => {
        if (!blob) {
          this.handleError(new Error('Erreur lors de la capture'));
          return;
        }
        
        console.log('✅ Photo captured:', {
          size: (blob.size / 1024).toFixed(2) + ' KB',
          type: blob.type
        });
        
        // Vérifier la taille
        if (blob.size > this.options.maxFileSize) {
          this.handleError(new Error(`Image trop volumineuse (${(blob.size / 1024 / 1024).toFixed(2)} MB). Maximum: ${(this.options.maxFileSize / 1024 / 1024).toFixed(2)} MB`));
          return;
        }
        
        this.capturedBlob = blob;
        this.showPreview();
        
      }, 'image/jpeg', this.options.quality);
      
    } catch (error) {
      console.error('❌ Capture error:', error);
      this.handleError(error);
    }
  }

  /**
   * Afficher le preview
   */
  showPreview() {
    // Arrêter la caméra
    this.stopCamera();
    
    // Masquer la vue caméra
    document.getElementById('cameraView').style.display = 'none';
    
    // Afficher la vue preview
    const previewView = document.getElementById('previewView');
    const previewImg = document.getElementById('selfiePreviewImg');
    
    if (previewView && previewImg && this.capturedBlob) {
      const url = URL.createObjectURL(this.capturedBlob);
      previewImg.src = url;
      previewView.style.display = 'block';
    }
  }

  /**
   * Reprendre la photo
   */
  async retake() {
    console.log('🔄 Retaking photo...');
    
    // Réinitialiser
    this.capturedBlob = null;
    
    // Masquer preview
    document.getElementById('previewView').style.display = 'none';
    
    // Afficher caméra
    document.getElementById('cameraView').style.display = 'block';
    
    // Redémarrer la caméra
    await this.startCamera();
  }

  /**
   * Upload de la photo
   */
  async upload() {
    try {
      console.log('⬆️ Uploading selfie...');
      
      if (!this.capturedBlob) {
        throw new Error('Aucune photo capturée');
      }
      
      // Afficher le loader
      document.getElementById('previewView').style.display = 'none';
      document.getElementById('loadingView').style.display = 'block';
      
      // Préparer FormData
      const formData = new FormData();
      formData.append('selfie', this.capturedBlob, 'selfie.jpg');
      
      // Récupérer le token
      const token = localStorage.getItem('amanah_token');
      if (!token) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      // Upload vers le backend
      const response = await fetch('/api/kyc/upload-selfie', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Upload successful:', result);
      
      // Nettoyer et fermer
      this.cleanup();
      this.close();
      
      // Callback succès
      this.options.onSuccess({
        status: 'success',
        selfieUrl: result.selfieUrl,
        selfieFileId: result.fileId
      });
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Masquer le loader
      document.getElementById('loadingView').style.display = 'none';
      document.getElementById('previewView').style.display = 'block';
      
      this.handleError(error);
    }
  }

  /**
   * Fermer le modal
   */
  close() {
    console.log('🚪 Closing camera...');
    
    this.stopCamera();
    this.cleanup();
    
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'none';
      modal.remove();
    }
    
    this.options.onCancel();
  }

  /**
   * Arrêter la caméra
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('🛑 Camera stopped');
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopCamera();
    this.capturedBlob = null;
  }

  /**
   * Gérer les erreurs
   */
  handleError(error) {
    alert('❌ Erreur: ' + error.message);
    this.options.onError({
      status: 'error',
      errorCode: error.name,
      errorMessage: error.message
    });
  }
}

// Export global
window.KycSelfieCamera = KycSelfieCamera;

console.log('✅ KycSelfieCamera v2 module loaded');
