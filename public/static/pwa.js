// PWA Installation et Service Worker
// Amanah GO - Progressive Web App

let deferredPrompt;
let installButton;

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration.scope);
        
        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Erreur Service Worker:', error);
      });
  });
}

// Capturer l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📱 PWA installable détecté');
  
  // Empêcher le prompt automatique
  e.preventDefault();
  
  // Stocker l'événement pour l'utiliser plus tard
  deferredPrompt = e;
  
  // Afficher le bouton d'installation personnalisé
  showInstallButton();
});

// Créer et afficher le bouton d'installation
function showInstallButton() {
  // Vérifier si le bouton existe déjà
  if (document.getElementById('pwa-install-banner')) {
    return;
  }

  // Créer le banner d'installation
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML = `
    <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
                color: white; padding: 16px 24px; border-radius: 12px; 
                box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4); z-index: 9999;
                max-width: 90%; animation: slideUp 0.3s ease-out;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
            📱 Installer Amanah GO
          </div>
          <div style="font-size: 13px; opacity: 0.9;">
            Accès rapide depuis votre écran d'accueil
          </div>
        </div>
        <button id="pwa-install-button" 
                style="background: white; color: #2563eb; border: none; 
                       padding: 10px 20px; border-radius: 8px; font-weight: bold;
                       cursor: pointer; font-size: 14px; transition: all 0.2s;">
          Installer
        </button>
        <button id="pwa-close-button" 
                style="background: transparent; color: white; border: none; 
                       padding: 8px; cursor: pointer; font-size: 20px; opacity: 0.8;">
          ×
        </button>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      #pwa-install-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    </style>
  `;
  
  document.body.appendChild(banner);
  
  // Gérer le clic sur Installer
  document.getElementById('pwa-install-button').addEventListener('click', installApp);
  
  // Gérer le clic sur Fermer
  document.getElementById('pwa-close-button').addEventListener('click', () => {
    banner.remove();
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  });
}

// Fonction d'installation
async function installApp() {
  if (!deferredPrompt) {
    console.log('❌ Pas de prompt d\'installation disponible');
    return;
  }

  // Afficher le prompt natif
  deferredPrompt.prompt();
  
  // Attendre le choix de l'utilisateur
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`👤 Choix utilisateur: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ PWA installée !');
    // Masquer le bouton
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => banner.remove(), 300);
    }
  }
  
  // Réinitialiser le prompt
  deferredPrompt = null;
}

// Détecter si l'app est déjà installée
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installée avec succès !');
  
  // Masquer le bouton d'installation
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
  
  // Afficher un message de succès
  showSuccessMessage();
});

// Message de succès après installation
function showSuccessMessage() {
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; 
                background: #10b981; color: white; padding: 16px 24px; 
                border-radius: 12px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
                z-index: 9999; animation: slideIn 0.3s ease-out;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">✅</span>
        <div>
          <div style="font-weight: bold;">Application installée !</div>
          <div style="font-size: 13px; opacity: 0.9;">
            Retrouvez Amanah GO sur votre écran d'accueil
          </div>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>
  `;
  
  document.body.appendChild(message);
  
  // Retirer après 5 secondes
  setTimeout(() => {
    message.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => message.remove(), 300);
  }, 5000);
}

// Vérifier si l'app tourne en mode standalone (installée)
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Logger le mode d'affichage
if (isStandalone()) {
  console.log('📱 App lancée en mode standalone (installée)');
} else {
  console.log('🌐 App lancée dans le navigateur');
}

// Gérer les erreurs réseau
window.addEventListener('online', () => {
  console.log('✅ Connexion internet rétablie');
  showNetworkStatus('online');
});

window.addEventListener('offline', () => {
  console.log('❌ Connexion internet perdue');
  showNetworkStatus('offline');
});

// Afficher le statut réseau
function showNetworkStatus(status) {
  const existingStatus = document.getElementById('network-status');
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusDiv = document.createElement('div');
  statusDiv.id = 'network-status';
  statusDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; 
                background: ${status === 'online' ? '#10b981' : '#ef4444'}; 
                color: white; padding: 12px; text-align: center; z-index: 10000;
                font-size: 14px; font-weight: 500; animation: slideDown 0.3s ease-out;">
      ${status === 'online' ? '✅ Connexion rétablie' : '❌ Pas de connexion internet - Mode hors ligne'}
    </div>
    <style>
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
        }
        to {
          transform: translateY(0);
        }
      }
    </style>
  `;
  
  document.body.appendChild(statusDiv);
  
  // Retirer après 3 secondes si online
  if (status === 'online') {
    setTimeout(() => {
      statusDiv.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => statusDiv.remove(), 300);
    }, 3000);
  }
}

console.log('📱 PWA Script Amanah GO chargé ✅');
