// ==========================================
// STRIPE PAYMENT - Expéditeur
// ==========================================

let stripe = null
let elements = null
let cardElement = null
let clientSecret = null
let paymentIntentId = null

// Initialiser Stripe
async function initStripe() {
  try {
    // Récupérer la clé publique Stripe depuis l'API
    const response = await fetch('/api/stripe/config')
    const data = await response.json()
    
    if (!data.success || !data.publishableKey) {
      throw new Error('Impossible de récupérer la clé publique Stripe')
    }
    
    // Initialiser Stripe avec la clé publique
    stripe = Stripe(data.publishableKey)
    
    // Créer les Elements
    elements = stripe.elements()
    
    // Créer le Card Element (formulaire carte bancaire)
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    })
    
    // Monter le Card Element dans le DOM
    cardElement.mount('#card-element')
    
    // Gérer les erreurs en temps réel
    cardElement.on('change', (event) => {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
        displayError.classList.remove('hidden')
      } else {
        displayError.textContent = ''
        displayError.classList.add('hidden')
      }
    })
    
    console.log('✅ Stripe initialisé')
  } catch (error) {
    console.error('Erreur initialisation Stripe:', error)
    showNotification('Erreur lors de l\'initialisation du paiement', 'error')
  }
}

// Créer un Payment Intent
async function createPaymentIntent(bookingId, amount) {
  try {
    const response = await window.auth.apiRequest('/api/stripe/payment/create', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: bookingId,
        amount: amount,
        currency: 'eur'
      })
    })
    
    if (response && response.success) {
      clientSecret = response.client_secret
      paymentIntentId = response.payment_intent_id
      
      // Afficher le détail du paiement
      document.getElementById('amount-total').textContent = response.amount.toFixed(2) + '€'
      document.getElementById('amount-fee').textContent = response.application_fee.toFixed(2) + '€'
      document.getElementById('amount-traveler').textContent = response.traveler_amount.toFixed(2) + '€'
      
      console.log('✅ Payment Intent créé:', paymentIntentId)
      return true
    } else {
      throw new Error(response?.error || 'Impossible de créer le paiement')
    }
  } catch (error) {
    console.error('Erreur création Payment Intent:', error)
    showNotification('Erreur: ' + error.message, 'error')
    return false
  }
}

// Traiter le paiement
async function handlePayment(event) {
  event.preventDefault()
  
  const submitBtn = document.getElementById('submit-payment')
  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...'
  
  try {
    // Confirmer le paiement avec Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: document.getElementById('cardholder-name').value
        }
      }
    })
    
    if (error) {
      // Erreur de paiement
      console.error('Payment error:', error)
      showNotification('Paiement échoué: ' + error.message, 'error')
      submitBtn.disabled = false
      submitBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Payer maintenant'
    } else if (paymentIntent.status === 'succeeded') {
      // Paiement réussi !
      console.log('✅ Paiement réussi:', paymentIntent.id)
      
      // Confirmer côté backend
      await confirmPayment(paymentIntent.id)
      
      // Afficher le succès
      document.getElementById('payment-form-container').classList.add('hidden')
      document.getElementById('payment-success').classList.remove('hidden')
      
      // Rediriger après 3 secondes
      setTimeout(() => {
        window.location.href = '/expediteur/mes-reservations'
      }, 3000)
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    showNotification('Erreur lors du traitement du paiement', 'error')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Payer maintenant'
  }
}

// Confirmer le paiement côté backend
async function confirmPayment(paymentIntentId) {
  try {
    const response = await window.auth.apiRequest('/api/stripe/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId
      })
    })
    
    if (response && response.success) {
      console.log('✅ Paiement confirmé côté backend')
    }
  } catch (error) {
    console.error('Erreur confirmation backend:', error)
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
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transition = 'opacity 0.3s'
    setTimeout(() => notification.remove(), 300)
  }, 4000)
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search)
  const bookingId = urlParams.get('booking_id')
  const amount = parseFloat(urlParams.get('amount'))
  
  if (!bookingId || !amount) {
    showNotification('Paramètres de paiement manquants', 'error')
    return
  }
  
  // Initialiser Stripe
  await initStripe()
  
  // Créer le Payment Intent
  const success = await createPaymentIntent(bookingId, amount)
  
  if (success) {
    // Attacher l'événement submit au formulaire
    const form = document.getElementById('payment-form')
    form.addEventListener('submit', handlePayment)
  }
})
