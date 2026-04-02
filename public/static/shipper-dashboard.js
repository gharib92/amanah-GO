// ==========================================
// SHIPPER DASHBOARD - JavaScript
// ==========================================

let currentUser = null;
let allPackages = [];
let currentFilter = 'ALL';

// Check authentication
async function checkAuth() {
  const userStr = localStorage.getItem('amanah_user');
  if (!userStr) {
    window.location.href = '/login?redirect=/expediteur/mes-colis';
    return;
  }
  
  currentUser = JSON.parse(userStr);
  document.getElementById('userName').textContent = currentUser.name;
  
  // Load user packages
  await loadPackages();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initializeFilters();
});

// Load user packages
async function loadPackages() {
  try {
    showLoading(true);
    
    const response = await axios.get(`/api/users/${currentUser.id}/packages`);
    
    if (response.data.success) {
      allPackages = response.data.packages;
      renderPackages();
      updateStatistics();
    } else {
      showNotification('error', 'Erreur lors du chargement des colis');
    }
    
  } catch (error) {
    console.error('Erreur chargement colis:', error);
    showNotification('error', 'Erreur lors du chargement des colis');
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
      renderPackages();
    });
  });
}

// Render packages
function renderPackages() {
  const filteredPackages = currentFilter === 'ALL' 
    ? allPackages 
    : allPackages.filter(p => p.status === currentFilter);
  
  const container = document.getElementById('packagesContainer');
  
  if (filteredPackages.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun colis trouvé</p>
        <a href="/expediteur/publier-colis" class="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>Publier un colis
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredPackages.map(pkg => {
    const photos = JSON.parse(pkg.photos || '[]');
    
    return `
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <span class="px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(pkg.status)}">
          ${getStatusLabel(pkg.status)}
        </span>
        <span class="text-sm text-gray-500">
          <i class="far fa-calendar mr-1"></i>
          ${formatDate(pkg.created_at)}
        </span>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-900 mb-2">
        <i class="fas fa-box text-blue-600 mr-2"></i>
        ${pkg.title}
      </h3>
      
      ${pkg.description ? `
        <p class="text-sm text-gray-600 mb-3">${pkg.description}</p>
      ` : ''}
      
      <!-- Photos -->
      ${photos.length > 0 ? `
        <div class="flex gap-2 mb-4 overflow-x-auto">
          ${photos.slice(0, 3).map(photo => `
            <img src="${photo}" alt="Photo colis" class="w-20 h-20 object-cover rounded-lg border-2 border-gray-200">
          `).join('')}
          ${photos.length > 3 ? `
            <div class="w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
              <span class="text-gray-500 text-sm">+${photos.length - 3}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <!-- Route -->
      <div class="mb-4 pb-4 border-b">
        <div class="flex items-center text-sm text-gray-900">
          <div class="flex-1">
            <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>
            ${pkg.departure_city}
          </div>
          <i class="fas fa-arrow-right text-gray-400 mx-3"></i>
          <div class="flex-1 text-right">
            <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>
            ${pkg.arrival_city}
          </div>
        </div>
        ${pkg.preferred_date ? `
          <p class="text-xs text-gray-500 mt-2">
            <i class="far fa-calendar-check mr-1"></i>
            Date préférée: ${formatDate(pkg.preferred_date)}
          </p>
        ` : ''}
      </div>
      
      <!-- Details -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-500">Poids</p>
          <p class="text-lg font-semibold text-gray-900">
            <i class="fas fa-weight-hanging text-blue-600 mr-1"></i>
            ${pkg.weight} kg
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Budget</p>
          <p class="text-lg font-semibold text-gray-900">
            <i class="fas fa-euro-sign text-green-600 mr-1"></i>
            ${pkg.budget} €
          </p>
        </div>
      </div>
      
      ${pkg.dimensions ? `
        <p class="text-sm text-gray-600 mb-4">
          <i class="fas fa-ruler-combined mr-1"></i>
          Dimensions: ${pkg.dimensions}
        </p>
      ` : ''}
      
      <!-- Content Declaration -->
      <div class="mb-4 bg-gray-50 rounded-lg p-3">
        <p class="text-xs text-gray-500 mb-1">Contenu déclaré</p>
        <p class="text-sm text-gray-900">${pkg.content_declaration}</p>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2 flex-wrap">
        ${pkg.status === 'DELIVERED' ? `
        <button
          onclick="openReviewModal('${pkg.id}', '${pkg.title}')"
          class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          <i class="fas fa-star mr-2"></i>Noter le voyageur
        </button>
        ` : `
        <button
          onclick="editPackage('${pkg.id}')"
          class="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <i class="fas fa-edit mr-2"></i>Modifier
        </button>
        `}
        <button
          onclick="deletePackage('${pkg.id}', '${pkg.title}')"
          class="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <i class="fas fa-trash mr-2"></i>Supprimer
        </button>
      </div>
    </div>
  `;
  }).join('');

  // Injecter le modal de notation si absent
  if (!document.getElementById('reviewModal')) {
    document.body.insertAdjacentHTML('beforeend', getReviewModalHTML());
  }
}

// Update statistics
function updateStatistics() {
  const totalPackages = allPackages.length;
  const publishedPackages = allPackages.filter(p => p.status === 'PUBLISHED').length;
  const totalWeight = allPackages.reduce((sum, p) => sum + (p.weight || 0), 0);
  const avgBudget = allPackages.length > 0 
    ? (allPackages.reduce((sum, p) => sum + (p.budget || 0), 0) / allPackages.length).toFixed(2)
    : 0;
  
  document.getElementById('statTotalPackages').textContent = totalPackages;
  document.getElementById('statPublishedPackages').textContent = publishedPackages;
  document.getElementById('statTotalWeight').textContent = totalWeight.toFixed(1);
  document.getElementById('statAvgBudget').textContent = avgBudget;
}

// Edit package
function editPackage(packageId) {
  // TODO: Navigate to edit page or open modal
  showNotification('info', 'Fonction d\'édition en cours de développement');
  // window.location.href = `/expediteur/modifier-colis/${packageId}`;
}

// Delete package
async function deletePackage(packageId, packageTitle) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le colis "${packageTitle}" ?\n\nCette action est irréversible.`)) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/packages/${packageId}?user_id=${currentUser.id}`);
    
    if (response.data.success) {
      showNotification('success', 'Colis supprimé avec succès');
      // Remove from local array
      allPackages = allPackages.filter(p => p.id !== packageId);
      renderPackages();
      updateStatistics();
    } else {
      showNotification('error', response.data.error || 'Erreur lors de la suppression');
    }
    
  } catch (error) {
    console.error('Erreur suppression colis:', error);
    showNotification('error', error.response?.data?.error || 'Erreur lors de la suppression');
  }
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    'PUBLISHED': 'bg-green-100 text-green-800',
    'RESERVED': 'bg-blue-100 text-blue-800',
    'IN_TRANSIT': 'bg-yellow-100 text-yellow-800',
    'DELIVERED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status) {
  const labels = {
    'PUBLISHED': 'Publié',
    'RESERVED': 'Réservé',
    'IN_TRANSIT': 'En transit',
    'DELIVERED': 'Livré',
    'CANCELLED': 'Annulé'
  };
  return labels[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
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

// ==========================================
// SYSTÈME DE NOTATION
// ==========================================

let reviewContext = { packageId: null, packageLabel: null, selectedRating: 0 };

function getReviewModalHTML() {
  return `
  <div id="reviewModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50" onclick="closeReviewModal(event)">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">
          <i class="fas fa-star text-yellow-500 mr-2"></i>
          Noter le voyageur
        </h2>
        <button onclick="closeReviewModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      <p class="text-sm text-gray-600 mb-6" id="reviewPkgLabel"></p>

      <!-- Email ou ID du voyageur -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email ou ID du voyageur à noter</label>
        <input type="text" id="revieweeInput" placeholder="ex: voyage@exemple.com"
               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
      </div>

      <!-- Étoiles -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
        <div class="flex space-x-2" id="starRating">
          ${[1,2,3,4,5].map(n => `
          <button onclick="setRating(${n})" data-star="${n}"
                  class="text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none star-btn">
            <i class="fas fa-star"></i>
          </button>`).join('')}
        </div>
        <p class="text-sm text-gray-500 mt-1" id="ratingLabel">Sélectionnez une note</p>
      </div>

      <!-- Commentaire -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
        <textarea id="reviewComment" rows="3" placeholder="Décrivez votre expérience avec ce voyageur..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"></textarea>
      </div>

      <div class="flex gap-3">
        <button onclick="closeReviewModal()" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
          Annuler
        </button>
        <button onclick="submitReview()" class="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold">
          <i class="fas fa-paper-plane mr-2"></i>Envoyer
        </button>
      </div>
    </div>
  </div>`;
}

function openReviewModal(packageId, packageLabel) {
  reviewContext = { packageId, packageLabel, selectedRating: 0 };
  document.getElementById('reviewPkgLabel').textContent = `Colis : ${packageLabel}`;
  document.getElementById('revieweeInput').value = '';
  document.getElementById('reviewComment').value = '';
  setRating(0);
  const modal = document.getElementById('reviewModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeReviewModal(event) {
  if (event && event.target !== document.getElementById('reviewModal')) return;
  const modal = document.getElementById('reviewModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function setRating(value) {
  reviewContext.selectedRating = value;
  const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];
  document.getElementById('ratingLabel').textContent = value > 0 ? labels[value] : 'Sélectionnez une note';
  document.querySelectorAll('.star-btn').forEach(btn => {
    const star = parseInt(btn.dataset.star);
    btn.style.color = star <= value ? '#EAB308' : '#D1D5DB';
  });
}

async function submitReview() {
  const revieweeInput = document.getElementById('revieweeInput').value.trim();
  const comment = document.getElementById('reviewComment').value.trim();

  if (!revieweeInput) {
    showNotification('error', 'Veuillez entrer l\'email ou l\'ID du voyageur');
    return;
  }
  if (reviewContext.selectedRating < 1) {
    showNotification('error', 'Veuillez sélectionner une note');
    return;
  }

  try {
    // Résoudre l'ID si un email est fourni
    let revieweeId = revieweeInput;
    if (revieweeInput.includes('@')) {
      const res = await axios.get(`/api/users/by-email?email=${encodeURIComponent(revieweeInput)}`);
      if (res.data.success && res.data.user) {
        revieweeId = res.data.user.id;
      } else {
        showNotification('error', 'Utilisateur introuvable avec cet email');
        return;
      }
    }

    const token = localStorage.getItem('amanah_token');
    const response = await axios.post('/api/reviews', {
      reviewee_id: revieweeId,
      booking_id: reviewContext.packageId,
      rating: reviewContext.selectedRating,
      comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      showNotification('success', 'Votre avis a été enregistré !');
      closeReviewModal();
    } else {
      showNotification('error', response.data.error || 'Erreur lors de l\'envoi');
    }
  } catch (error) {
    showNotification('error', error.response?.data?.error || 'Erreur lors de l\'envoi de l\'avis');
  }
}
