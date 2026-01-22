/**
 * ========================================
 * KYC SELFIE CAMERA MODULE
 * ========================================
 * Module autonome pour capture de selfie KYC
 * - Aucune dépendance externe
 * - Intégration minimale
 * - Réversible (facile à désactiver)
 */

(function() {
  'use strict';

  console.log('📷 KYC Selfie Camera Module loaded');

  // ========================================
  // CONFIGURATION
  // ========================================
  const CONFIG = {
    // Qualité de l'image (0.0 - 1.0)
    imageQuality: 0.85,
    
    // Taille max en pixels (largeur)
    maxWidth: 1920,
    
    // Format de sortie
    outputFormat: 'image/jpeg',
    
    // Timeout upload (ms)
    uploadTimeout: 30000,
    
    // Endpoint backend (à configurer)
    uploadEndpoint: '/api/kyc/upload-selfie'
  };

  // ========================================
  // CLASSE KycSelfieCamera
  // ========================================
  class KycSelfieCamera {
    constructor(options = {}) {
      this.options = {
        onSuccess: options.onSuccess || null,
        onCancel: options.onCancel || null,
        onError: options.onError || null,
        ...options
      };
      
      this.stream = null;
      this.capturedImage = null;
      this.modal = null;
      this.video = null;
      this.canvas = null;
    }

    // ========================================
    // PUBLIC: Ouvrir la caméra
    // ========================================
    async open() {
      console.log('📷 Opening selfie camera...');
      
      try {
        // Vérifier support navigateur
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
        }

        // Demander permission et ouvrir caméra
        await this.requestCameraPermission();
        
        // Créer l'UI
        this.renderUI();
        
        // Démarrer le stream vidéo
        await this.startVideoStream();
        
      } catch (error) {
        console.error('❌ Erreur ouverture caméra:', error);
        this.handleError(error);
      }
    }

    // ========================================
    // Demander permission caméra
    // ========================================
    async requestCameraPermission() {
      try {
        // Demander caméra frontale
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Caméra frontale
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        console.log('✅ Permission caméra accordée');
        return true;
        
      } catch (error) {
        console.error('❌ Permission caméra refusée:', error);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('Aucune caméra détectée sur votre appareil.');
        } else {
          throw new Error('Impossible d\'accéder à la caméra: ' + error.message);
        }
      }
    }

    // ========================================
    // Démarrer le stream vidéo
    // ========================================
    async startVideoStream() {
      if (!this.stream || !this.video) {
        throw new Error('Stream ou élément vidéo non disponible');
      }

      this.video.srcObject = this.stream;
      
      // Attendre que la vidéo soit prête
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });
      
      console.log('✅ Stream vidéo démarré');
    }

    // ========================================
    // Capturer la photo
    // ========================================
    capturePhoto() {
      console.log('📸 Capturing photo...');
      
      if (!this.video || !this.canvas) {
        console.error('❌ Éléments vidéo/canvas non disponibles');
        return;
      }

      const context = this.canvas.getContext('2d');
      
      // Définir taille canvas = taille vidéo
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      
      // Dessiner l'image depuis la vidéo
      context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Convertir en blob avec compression
      this.canvas.toBlob((blob) => {
        if (!blob) {
          console.error('❌ Erreur conversion image');
          return;
        }
        
        // Créer URL pour preview
        this.capturedImage = {
          blob: blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          type: blob.type
        };
        
        console.log('✅ Photo capturée:', {
          size: (blob.size / 1024).toFixed(2) + ' KB',
          type: blob.type
        });
        
        // Afficher preview
        this.showPreview();
        
      }, CONFIG.outputFormat, CONFIG.imageQuality);
      
      // Arrêter le stream
      this.stopVideoStream();
    }

    // ========================================
    // Afficher preview
    // ========================================
    showPreview() {
      if (!this.capturedImage) return;
      
      // Cacher vue caméra
      document.getElementById('kyc-selfie-camera-view').style.display = 'none';
      
      // Afficher vue preview
      const previewView = document.getElementById('kyc-selfie-preview-view');
      previewView.style.display = 'block';
      
      // Afficher l'image
      const previewImg = document.getElementById('kyc-selfie-preview-image');
      previewImg.src = this.capturedImage.url;
    }

    // ========================================
    // Reprendre la photo
    // ========================================
    async retakePhoto() {
      console.log('🔄 Retaking photo...');
      
      // Nettoyer image capturée
      if (this.capturedImage) {
        URL.revokeObjectURL(this.capturedImage.url);
        this.capturedImage = null;
      }
      
      // Cacher preview
      document.getElementById('kyc-selfie-preview-view').style.display = 'none';
      
      // Réafficher caméra
      document.getElementById('kyc-selfie-camera-view').style.display = 'block';
      
      // Redémarrer stream
      await this.requestCameraPermission();
      await this.startVideoStream();
    }

    // ========================================
    // Valider et uploader
    // ========================================
    async validateAndUpload() {
      if (!this.capturedImage) {
        console.error('❌ Aucune image à uploader');
        return;
      }

      console.log('📤 Uploading selfie...');
      
      // Afficher loader
      this.showLoader('Envoi de la photo...');
      
      // Désactiver boutons
      this.disableButtons(true);
      
      try {
        // Upload vers backend
        const result = await this.uploadToBackend(this.capturedImage.blob);
        
        console.log('✅ Upload réussi:', result);
        
        // Nettoyer et fermer
        this.cleanup();
        this.close();
        
        // Callback succès
        if (this.options.onSuccess) {
          this.options.onSuccess({
            status: 'success',
            selfieUrl: result.url,
            selfieFileId: result.fileId,
            message: 'Selfie enregistré avec succès'
          });
        }
        
      } catch (error) {
        console.error('❌ Erreur upload:', error);
        
        // Réactiver boutons
        this.disableButtons(false);
        this.hideLoader();
        
        // Afficher erreur
        this.showError('Erreur lors de l\'envoi. Veuillez réessayer.');
        
        // Callback erreur
        if (this.options.onError) {
          this.options.onError({
            status: 'error',
            message: error.message
          });
        }
      }
    }

    // ========================================
    // Upload vers backend
    // ========================================
    async uploadToBackend(blob) {
      const formData = new FormData();
      formData.append('selfie', blob, 'selfie.jpg');
      formData.append('type', 'kyc_selfie');
      formData.append('timestamp', Date.now());
      
      // Récupérer token auth depuis localStorage
      const token = localStorage.getItem('amanah_token');
      
      console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour uploader un selfie. Veuillez vous reconnecter.');
      }
      
      console.log('📤 Uploading to:', CONFIG.uploadEndpoint);
      
      const response = await fetch(CONFIG.uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type, laissé automatique pour FormData
        },
        body: formData
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || `Erreur serveur (${response.status})`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur serveur');
      }
      
      return {
        url: data.url,
        fileId: data.fileId || data.id
      };
    }

    // ========================================
    // Annuler et fermer
    // ========================================
    cancel() {
      console.log('❌ Selfie capture cancelled');
      
      this.cleanup();
      this.close();
      
      if (this.options.onCancel) {
        this.options.onCancel({
          status: 'cancelled',
          message: 'Capture annulée par l\'utilisateur'
        });
      }
    }

    // ========================================
    // Arrêter le stream vidéo
    // ========================================
    stopVideoStream() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        console.log('🛑 Stream vidéo arrêté');
      }
    }

    // ========================================
    // Nettoyer ressources
    // ========================================
    cleanup() {
      // Arrêter stream
      this.stopVideoStream();
      
      // Nettoyer image
      if (this.capturedImage) {
        URL.revokeObjectURL(this.capturedImage.url);
        this.capturedImage = null;
      }
      
      console.log('🧹 Ressources nettoyées');
    }

    // ========================================
    // Fermer modal
    // ========================================
    close() {
      if (this.modal) {
        document.body.removeChild(this.modal);
        this.modal = null;
      }
    }

    // ========================================
    // Afficher loader
    // ========================================
    showLoader(message) {
      const loader = document.getElementById('kyc-selfie-loader');
      const loaderText = document.getElementById('kyc-selfie-loader-text');
      if (loader && loaderText) {
        loaderText.textContent = message;
        loader.style.display = 'flex';
      }
    }

    hideLoader() {
      const loader = document.getElementById('kyc-selfie-loader');
      if (loader) {
        loader.style.display = 'none';
      }
    }

    // ========================================
    // Désactiver boutons
    // ========================================
    disableButtons(disabled) {
      const buttons = this.modal.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.disabled = disabled;
        btn.style.opacity = disabled ? '0.5' : '1';
        btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
      });
    }

    // ========================================
    // Afficher erreur
    // ========================================
    showError(message) {
      alert('❌ ' + message);
    }

    // ========================================
    // Gérer erreur
    // ========================================
    handleError(error) {
      const message = error.message || 'Erreur inconnue';
      
      // Afficher UI erreur
      this.showError(message);
      
      // Fermer
      this.cleanup();
      this.close();
      
      // Callback erreur
      if (this.options.onError) {
        this.options.onError({
          status: 'error',
          message: message
        });
      }
    }

    // ========================================
    // Render UI
    // ========================================
    renderUI() {
      const html = `
        <div id="kyc-selfie-modal" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          z-index: 99999;
          display: flex;
          flex-direction: column;
        ">
          <!-- Header -->
          <div style="
            padding: 20px;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          ">
            <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
              📷 Selfie de vérification
            </h3>
            <button onclick="window.kycSelfieCamera.cancel()" style="
              background: transparent;
              border: none;
              color: white;
              font-size: 28px;
              cursor: pointer;
              padding: 0;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">&times;</button>
          </div>

          <!-- Vue Caméra -->
          <div id="kyc-selfie-camera-view" style="
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <!-- Vidéo -->
            <video id="kyc-selfie-video" autoplay playsinline style="
              width: 100%;
              max-width: 640px;
              border-radius: 12px;
              transform: scaleX(-1);
            "></video>

            <!-- Overlay cadre -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 280px;
              height: 350px;
              border: 3px solid rgba(66, 133, 244, 0.8);
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              pointer-events: none;
            "></div>

            <!-- Instructions -->
            <p style="
              color: white;
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              max-width: 400px;
            ">
              Positionnez votre visage dans le cadre et restez immobile
            </p>

            <!-- Bouton Capturer -->
            <button onclick="window.kycSelfieCamera.capturePhoto()" style="
              margin-top: 30px;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: white;
              border: 6px solid rgba(66, 133, 244, 0.8);
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size: 32px;">📸</span>
            </button>
          </div>

          <!-- Vue Preview -->
          <div id="kyc-selfie-preview-view" style="
            flex: 1;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          ">
            <!-- Image preview -->
            <img id="kyc-selfie-preview-image" style="
              max-width: 100%;
              max-height: 60vh;
              border-radius: 12px;
              transform: scaleX(-1);
            " />

            <!-- Boutons actions -->
            <div style="
              display: flex;
              gap: 15px;
              margin-top: 30px;
            ">
              <button onclick="window.kycSelfieCamera.retakePhoto()" style="
                padding: 14px 28px;
                background: transparent;
                border: 2px solid white;
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                🔄 Reprendre
              </button>
              
              <button onclick="window.kycSelfieCamera.validateAndUpload()" style="
                padding: 14px 28px;
                background: #4285f4;
                border: none;
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              " onmouseover="this.style.background='#357ae8'" onmouseout="this.style.background='#4285f4'">
                ✅ Valider
              </button>
            </div>
          </div>

          <!-- Loader -->
          <div id="kyc-selfie-loader" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          ">
            <div style="
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            "></div>
            <p id="kyc-selfie-loader-text" style="
              color: white;
              margin-top: 20px;
              font-size: 16px;
            ">Chargement...</p>
          </div>

          <!-- Canvas caché pour capture -->
          <canvas id="kyc-selfie-canvas" style="display: none;"></canvas>

          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;

      // Injecter dans le DOM
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = html;
      document.body.appendChild(modalDiv.firstElementChild);

      this.modal = document.getElementById('kyc-selfie-modal');
      this.video = document.getElementById('kyc-selfie-video');
      this.canvas = document.getElementById('kyc-selfie-canvas');
      
      // Référence globale pour onclick
      window.kycSelfieCamera = this;
    }
  }

  // ========================================
  // EXPORT GLOBAL
  // ========================================
  window.KycSelfieCamera = KycSelfieCamera;
  
  console.log('✅ KycSelfieCamera class ready');

})();
