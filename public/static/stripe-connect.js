// ==========================================
// STRIPE CONNECT - Voyageur
// ==========================================

let stripeStatus = null

// Charger le statut du compte Stripe Connect
async function loadStripeStatus() {
  try {
    const response = await window.auth.apiRequest('/api/stripe/connect/status')
    
    if (response.success) {
      stripeStatus = response
      updateStripeUI()
    } else {
      console.error('Erreur lors du chargement du statut Stripe:', response.error)
    }
  } catch (error) {
    console.error('Erreur lors du chargement du statut Stripe:', error)
  }
}

// Mettre à jour l'interface selon le statut
function updateStripeUI() {
  const statusCard = document.getElementById('stripe-status')
  const onboardBtn = document.getElementById('onboard-btn')
  const dashboardBtn = document.getElementById('dashboard-btn')
  
  if (!stripeStatus || !stripeStatus.connected) {
    // Pas encore connecté
    statusCard.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-4 mt-1"></i>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 mb-2">Compte Stripe non configuré</h3>
            <p class="text-gray-700 mb-4">Pour recevoir des paiements, vous devez créer un compte Stripe Connect.</p>
            <p class="text-sm text-gray-600">• Configuration en 5 minutes</p>
            <p class="text-sm text-gray-600">• KYC requis (pièce d'identité)</p>
            <p class="text-sm text-gray-600">• Virements automatiques sur votre compte bancaire</p>
          </div>
        </div>
      </div>
    `
    onboardBtn.style.display = 'block'
    dashboardBtn.style.display = 'none'
  } else if (!stripeStatus.details_submitted) {
    // Compte créé mais onboarding incomplet
    statusCard.innerHTML = `
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div class="flex items-start">
          <i class="fas fa-clock text-orange-600 text-2xl mr-4 mt-1"></i>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 mb-2">Configuration incomplète</h3>
            <p class="text-gray-700 mb-2">Finalisez votre inscription Stripe pour recevoir des paiements.</p>
            <p class="text-sm text-gray-600">Informations manquantes détectées par Stripe.</p>
          </div>
        </div>
      </div>
    `
    onboardBtn.innerHTML = '<i class="fas fa-arrow-right mr-2"></i>Finaliser la configuration'
    onboardBtn.style.display = 'block'
    dashboardBtn.style.display = 'none'
  } else if (!stripeStatus.charges_enabled || !stripeStatus.payouts_enabled) {
    // En attente de validation
    statusCard.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <i class="fas fa-hourglass-half text-blue-600 text-2xl mr-4 mt-1"></i>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 mb-2">Validation en cours</h3>
            <p class="text-gray-700 mb-2">Stripe vérifie vos informations.</p>
            <p class="text-sm text-gray-600">• Paiements: ${stripeStatus.charges_enabled ? '✅ Activés' : '⏳ En attente'}</p>
            <p class="text-sm text-gray-600">• Virements: ${stripeStatus.payouts_enabled ? '✅ Activés' : '⏳ En attente'}</p>
          </div>
        </div>
      </div>
    `
    onboardBtn.style.display = 'none'
    dashboardBtn.style.display = 'block'
  } else {
    // Tout est OK !
    statusCard.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="flex items-start">
          <i class="fas fa-check-circle text-green-600 text-2xl mr-4 mt-1"></i>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 mb-2">Compte Stripe actif ✅</h3>
            <p class="text-gray-700 mb-2">Vous pouvez recevoir des paiements !</p>
            <p class="text-sm text-gray-600">• Paiements: ✅ Activés</p>
            <p class="text-sm text-gray-600">• Virements: ✅ Activés</p>
            <p class="text-sm text-gray-600 mt-2">ID: ${stripeStatus.account_id}</p>
          </div>
        </div>
      </div>
    `
    onboardBtn.style.display = 'none'
    dashboardBtn.style.display = 'block'
  }
}

// Démarrer l'onboarding Stripe Connect
async function startOnboarding() {
  const btn = document.getElementById('onboard-btn')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Redirection...'
  
  try {
    const response = await window.auth.apiRequest('/api/stripe/connect/onboard', {
      method: 'POST'
    })
    
    if (response.success && response.onboarding_url) {
      // Rediriger vers Stripe
      window.location.href = response.onboarding_url
    } else {
      alert('Erreur: ' + (response.error || 'Impossible de créer le compte Stripe'))
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-plus mr-2"></i>Créer mon compte Stripe'
    }
  } catch (error) {
    console.error('Erreur onboarding:', error)
    alert('Erreur lors de la création du compte Stripe')
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-plus mr-2"></i>Créer mon compte Stripe'
  }
}

// Ouvrir le dashboard Stripe
async function openDashboard() {
  const btn = document.getElementById('dashboard-btn')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Ouverture...'
  
  try {
    const response = await window.auth.apiRequest('/api/stripe/connect/dashboard')
    
    if (response.success && response.dashboard_url) {
      // Ouvrir dans un nouvel onglet
      window.open(response.dashboard_url, '_blank')
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-external-link-alt mr-2"></i>Voir mon dashboard Stripe'
    } else {
      alert('Erreur: ' + (response.error || 'Impossible d\'ouvrir le dashboard'))
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-external-link-alt mr-2"></i>Voir mon dashboard Stripe'
    }
  } catch (error) {
    console.error('Erreur dashboard:', error)
    alert('Erreur lors de l\'ouverture du dashboard')
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-external-link-alt mr-2"></i>Voir mon dashboard Stripe'
  }
}

// Vérifier si on revient de Stripe (URL params)
function checkStripeReturn() {
  const urlParams = new URLSearchParams(window.location.search)
  
  if (urlParams.get('success') === 'true') {
    // Onboarding réussi !
    showNotification('Compte Stripe configuré avec succès ! 🎉', 'success')
    // Recharger le statut
    setTimeout(() => loadStripeStatus(), 1000)
  } else if (urlParams.get('refresh') === 'true') {
    // L'utilisateur a cliqué sur "Refresh" dans Stripe
    showNotification('Veuillez finaliser votre inscription Stripe', 'warning')
  }
  
  // Nettoyer l'URL
  if (urlParams.has('success') || urlParams.has('refresh')) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// Notification toast
function showNotification(message, type = 'success') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500'
  }
  
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transition = 'opacity 0.3s'
    setTimeout(() => notification.remove(), 300)
  }, 4000)
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  checkStripeReturn()
  loadStripeStatus()
})
