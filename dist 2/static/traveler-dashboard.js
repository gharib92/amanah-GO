// ==========================================
// TRAVELER DASHBOARD - JavaScript
// ==========================================

let currentUser = null;
let allTrips = [];
let currentFilter = 'ALL';

// Check authentication
async function checkAuth() {
  const userStr = localStorage.getItem('amanah_user');
  if (!userStr) {
    window.location.href = '/login?redirect=/voyageur/mes-trajets';
    return;
  }
  
  currentUser = JSON.parse(userStr);
  document.getElementById('userName').textContent = currentUser.name;
  
  // Load user trips
  await loadTrips();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initializeFilters();
});

// Load user trips
async function loadTrips() {
  try {
    showLoading(true);
    
    const response = await axios.get(`/api/users/${currentUser.id}/trips`);
    
    if (response.data.success) {
      allTrips = response.data.trips;
      renderTrips();
      updateStatistics();
    } else {
      showNotification('error', 'Erreur lors du chargement des trajets');
    }
    
  } catch (error) {
    console.error('Erreur chargement trajets:', error);
    showNotification('error', 'Erreur lors du chargement des trajets');
  } finally {
    showLoading(false);
  }
}

// Initialize filters
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTrips();
    });
  });
}

// Render trips
function renderTrips() {
  const filteredTrips = currentFilter === 'ALL' 
    ? allTrips 
    : allTrips.filter(t => t.status === currentFilter);
  
  const container = document.getElementById('tripsContainer');
  
  if (filteredTrips.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-plane-slash text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun trajet trouvé</p>
        <a href="/voyageur/publier-trajet" class="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>Publier un trajet
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredTrips.map(trip => `
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <span class="px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trip.status)}">
          ${getStatusLabel(trip.status)}
        </span>
        <span class="text-sm text-gray-500">
          <i class="far fa-calendar mr-1"></i>
          ${formatDate(trip.departure_date)}
        </span>
      </div>
      
      <!-- Route -->
      <div class="mb-4">
        <div class="flex items-center text-lg font-semibold text-gray-900">
          <div class="flex-1">
            <i class="fas fa-plane-departure text-blue-600 mr-2"></i>
            ${trip.departure_city}
            ${trip.departure_airport ? `<span class="text-sm text-gray-500 ml-1">(${trip.departure_airport})</span>` : ''}
          </div>
          <i class="fas fa-arrow-right text-gray-400 mx-3"></i>
          <div class="flex-1 text-right">
            <i class="fas fa-plane-arrival text-green-600 mr-2"></i>
            ${trip.arrival_city}
            ${trip.arrival_airport ? `<span class="text-sm text-gray-500 ml-1">(${trip.arrival_airport})</span>` : ''}
          </div>
        </div>
        ${trip.flight_number ? `
          <p class="text-sm text-gray-600 mt-2">
            <i class="fas fa-plane mr-1"></i>
            Vol ${trip.flight_number}
          </p>
        ` : ''}
      </div>
      
      <!-- Details -->
      <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
        <div>
          <p class="text-sm text-gray-500">Poids disponible</p>
          <p class="text-lg font-semibold text-gray-900">
            <i class="fas fa-weight-hanging text-blue-600 mr-1"></i>
            ${trip.available_weight} kg
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Prix par kg</p>
          <p class="text-lg font-semibold text-gray-900">
            <i class="fas fa-euro-sign text-green-600 mr-1"></i>
            ${trip.price_per_kg} €
          </p>
        </div>
      </div>
      
      <!-- Earnings -->
      <div class="mb-4 bg-green-50 rounded-lg p-3">
        <p class="text-sm text-gray-600">Gains potentiels (après commission)</p>
        <p class="text-2xl font-bold text-green-600">
          ${calculateEarnings(trip.available_weight, trip.price_per_kg)} €
        </p>
      </div>
      
      ${trip.description ? `
        <p class="text-sm text-gray-600 mb-4">
          <i class="fas fa-info-circle mr-1"></i>
          ${trip.description}
        </p>
      ` : ''}
      
      <!-- Actions -->
      <div class="flex gap-2">
        <button 
          onclick="editTrip('${trip.id}')"
          class="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <i class="fas fa-edit mr-2"></i>Modifier
        </button>
        <button 
          onclick="deleteTrip('${trip.id}', '${trip.departure_city} → ${trip.arrival_city}')"
          class="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <i class="fas fa-trash mr-2"></i>Supprimer
        </button>
      </div>
    </div>
  `).join('');
}

// Update statistics
function updateStatistics() {
  const totalTrips = allTrips.length;
  const activeTrips = allTrips.filter(t => t.status === 'ACTIVE').length;
  const totalWeight = allTrips.reduce((sum, t) => sum + (t.available_weight || 0), 0);
  const totalEarnings = allTrips.reduce((sum, t) => 
    sum + calculateEarnings(t.available_weight, t.price_per_kg), 0
  );
  
  document.getElementById('statTotalTrips').textContent = totalTrips;
  document.getElementById('statActiveTrips').textContent = activeTrips;
  document.getElementById('statTotalWeight').textContent = totalWeight.toFixed(1);
  document.getElementById('statTotalEarnings').textContent = totalEarnings.toFixed(2);
}

// Edit trip
function editTrip(tripId) {
  // TODO: Navigate to edit page or open modal
  showNotification('info', 'Fonction d\'édition en cours de développement');
  // window.location.href = `/voyageur/modifier-trajet/${tripId}`;
}

// Delete trip
async function deleteTrip(tripId, tripName) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le trajet "${tripName}" ?\n\nCette action est irréversible.`)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/trips/${tripId}?user_id=${currentUser.id}`);
    
    if (response.data.success) {
      showNotification('success', 'Trajet supprimé avec succès');
      // Remove from local array
      allTrips = allTrips.filter(t => t.id !== tripId);
      renderTrips();
      updateStatistics();
    } else {
      showNotification('error', response.data.error || 'Erreur lors de la suppression');
    }
    
  } catch (error) {
    console.error('Erreur suppression trajet:', error);
    showNotification('error', error.response?.data?.error || 'Erreur lors de la suppression');
  }
}

// Helper functions
function calculateEarnings(weight, pricePerKg) {
  const total = weight * pricePerKg;
  const commission = total * 0.12;
  return (total - commission).toFixed(2);
}

function getStatusColor(status) {
  const colors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'FULL': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status) {
  const labels = {
    'ACTIVE': 'Actif',
    'FULL': 'Complet',
    'COMPLETED': 'Terminé',
    'CANCELLED': 'Annulé'
  };
  return labels[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('fr-FR', options);
}

function showLoading(show) {
  const loader = document.getElementById('loader');
  const content = document.getElementById('mainContent');
  
  if (show) {
    loader.classList.remove('hidden');
    content.classList.add('opacity-50');
  } else {
    loader.classList.add('hidden');
    content.classList.remove('opacity-50');
  }
}

function showNotification(type, message) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
