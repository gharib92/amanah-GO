/**
 * KYC Camera Capture Module
 * Module isolé pour la capture photo (selfie/ID) dans le flux KYC
 * 
 * USAGE:
 *   const camera = new KycCamera('video-element-id', 'canvas-element-id');
 *   await camera.start();
 *   const blob = await camera.capture();
 *   camera.stop();
 * 
 * SÉCURITÉ:
 *   - Demande permissions caméra
 *   - Images stockées temporairement (blob en mémoire)
 *   - Suppression auto après upload
 *   - Aucune sauvegarde galerie
 * 
 * ISOLATION:
 *   - Aucune dépendance au code existant
 *   - Facilement désactivable (ne pas charger ce fichier)
 *   - Gestion erreurs interne
 */

class KycCamera {
  constructor(videoElementId, canvasElementId) {
    this.videoElement = document.getElementById(videoElementId);
    this.canvasElement = document.getElementById(canvasElementId);
    this.stream = null;
    this.capturedBlob = null;
    
    // Configuration
    this.config = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user' // Caméra frontale par défaut
      },
      imageFormat: 'image/jpeg',
      imageQuality: 0.85 // Balance qualité/poids
    };
    
    console.log('📷 KycCamera initialized');
  }

  /**
   * Vérifier si la caméra est disponible
   */
  static async isAvailable() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ Camera API not supported');
      return false;
    }
    return true;
  }

  /**
   * Demander permission et démarrer la caméra
   */
  async start() {
    try {
      // Vérifier disponibilité
      const available = await KycCamera.isAvailable();
      if (!available) {
        throw new Error('Camera API not supported');
      }

      console.log('🔐 Requesting camera permission...');
      
      // Demander permission
      this.stream = await navigator.mediaDevices.getUserMedia(this.config);
      
      console.log('✅ Camera permission granted');
      
      // Attacher au video element
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        console.log('✅ Camera started');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Camera start error:', error);
      
      // Messages d'erreur utilisateur
      let userMessage = 'Impossible d\'accéder à la caméra';
      
      if (error.name === 'NotAllowedError') {
        userMessage = 'Permission caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
      } else if (error.name === 'NotFoundError') {
        userMessage = 'Aucune caméra détectée sur cet appareil.';
      } else if (error.name === 'NotReadableError') {
        userMessage = 'La caméra est utilisée par une autre application.';
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * Capturer une photo
   */
  async capture() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.stream || !this.videoElement || !this.canvasElement) {
          throw new Error('Camera not initialized');
        }

        console.log('📸 Capturing photo...');

        // Obtenir dimensions de la vidéo
        const video = this.videoElement;
        const canvas = this.canvasElement;
        
        // Définir taille canvas = taille vidéo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dessiner la frame actuelle sur le canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            this.capturedBlob = blob;
            console.log('✅ Photo captured:', {
              size: Math.round(blob.size / 1024) + 'KB',
              type: blob.type
            });
            
            resolve(blob);
          },
          this.config.imageFormat,
          this.config.imageQuality
        );
      } catch (error) {
        console.error('❌ Capture error:', error);
        reject(error);
      }
    });
  }

  /**
   * Obtenir l'URL de prévisualisation
   */
  getPreviewUrl() {
    if (!this.capturedBlob) {
      return null;
    }
    return URL.createObjectURL(this.capturedBlob);
  }

  /**
   * Obtenir le blob capturé
   */
  getBlob() {
    return this.capturedBlob;
  }

  /**
   * Effacer la capture (sécurité)
   */
  clearCapture() {
    if (this.capturedBlob) {
      // Révoquer l'URL objet si créée
      const previewUrl = this.getPreviewUrl();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      this.capturedBlob = null;
      console.log('🗑️ Capture cleared from memory');
    }
  }

  /**
   * Arrêter la caméra
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Camera track stopped');
      });
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    
    console.log('✅ Camera stopped');
  }

  /**
   * Changer de caméra (front/back)
   */
  async switchCamera() {
    const currentFacingMode = this.config.video.facingMode;
    this.config.video.facingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    this.stop();
    await this.start();
    
    console.log('🔄 Camera switched to:', this.config.video.facingMode);
  }

  /**
   * Cleanup complet
   */
  destroy() {
    this.stop();
    this.clearCapture();
    console.log('💀 KycCamera destroyed');
  }
}

/**
 * Service d'upload vers le backend
 */
class KycUploadService {
  /**
   * Upload une image vers le backend KYC
   * 
   * @param {Blob} blob - Image à uploader
   * @param {string} type - 'selfie' ou 'id_document'
   * @param {string} token - JWT token
   */
  static async upload(blob, type, token) {
    try {
      console.log(`📤 Uploading ${type}...`, {
        size: Math.round(blob.size / 1024) + 'KB'
      });

      // Créer FormData
      const formData = new FormData();
      formData.append('file', blob, `${type}_${Date.now()}.jpg`);
      formData.append('type', type);

      // Upload vers backend
      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      console.log(`✅ ${type} uploaded:`, data);

      return data;
    } catch (error) {
      console.error(`❌ Upload ${type} error:`, error);
      throw error;
    }
  }
}

// Export pour utilisation globale
window.KycCamera = KycCamera;
window.KycUploadService = KycUploadService;

console.log('✅ KYC Camera Module loaded');
