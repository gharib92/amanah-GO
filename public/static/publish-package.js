// ==========================================
// PUBLISH PACKAGE - JavaScript
// ==========================================

let selectedDepartureCity = null;
let selectedArrivalCity = null;
let currentUser = null;
let uploadedPhotos = [];

// Check authentication
async function checkAuth() {
  const userStr = localStorage.getItem('amanah_user');
  if (!userStr) {
    // Default user for demo/testing (no authentication required)
    currentUser = { id: 1, name: 'Utilisateur Demo', kyc_status: 'VERIFIED' };
    localStorage.setItem('userId', '1');
    document.getElementById('userName').textContent = currentUser.name;
    return;
  }
  
  currentUser = JSON.parse(userStr);
  
  // Optional: Check KYC status (disabled for demo)
  // if (currentUser.kyc_status !== 'VERIFIED') {
  //   alert('Vous devez compléter la vérification KYC avant de publier un colis');
  //   window.location.href = '/verify-profile';
  //   return;
  // }
  
  document.getElementById('userName').textContent = currentUser.name;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initializeAutocomplete();
  initializePhotos();
  calculateEstimatedCost();
});

// City autocomplete
function initializeAutocomplete() {
  const departureInput = document.getElementById('departureCity');
  const arrivalInput = document.getElementById('arrivalCity');
  
  departureInput.addEventListener('input', debounce((e) => searchCities(e.target.value, 'departure'), 300));
  arrivalInput.addEventListener('input', debounce((e) => searchCities(e.target.value, 'arrival'), 300));
  
  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.city-autocomplete')) {
      document.getElementById('departureSuggestions').innerHTML = '';
      document.getElementById('arrivalSuggestions').innerHTML = '';
    }
  });
}

async function searchCities(query, type) {
  if (query.length < 2) {
    document.getElementById(`${type}Suggestions`).innerHTML = '';
    return;
  }
  
  try {
    const response = await axios.get(`/api/airports/search?q=${encodeURIComponent(query)}`);
    const airports = response.data.airports;
    
    const suggestionsDiv = document.getElementById(`${type}Suggestions`);
    
    if (airports.length === 0) {
      suggestionsDiv.innerHTML = '<div class="p-2 text-gray-500">Aucune ville trouvée</div>';
      return;
    }
    
    // Group by city to avoid duplicates
    const cities = {};
    airports.forEach(airport => {
      const key = `${airport.city}, ${airport.country}`;
      if (!cities[key]) {
        cities[key] = airport;
      }
    });
    
    suggestionsDiv.innerHTML = Object.values(cities).map(airport => `
      <div class="city-item p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0" 
           onclick="selectCity('${type}', ${JSON.stringify(airport).replace(/"/g, '&quot;')})">
        <div class="font-semibold text-gray-900">${airport.city}</div>
        <div class="text-sm text-gray-600">${airport.country}</div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur recherche villes:', error);
  }
}

function selectCity(type, airport) {
  const input = document.getElementById(`${type}City`);
  input.value = `${airport.city}, ${airport.country}`;
  
  if (type === 'departure') {
    selectedDepartureCity = { city: airport.city, country: airport.country };
  } else {
    selectedArrivalCity = { city: airport.city, country: airport.country };
  }
  
  document.getElementById(`${type}Suggestions`).innerHTML = '';
}

// Photo upload
function initializePhotos() {
  const photoInput = document.getElementById('photoInput');
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  
  uploadBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', handlePhotoUpload);
}

async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  
  if (uploadedPhotos.length + files.length > 5) {
    showNotification('warning', 'Maximum 5 photos autorisées');
    return;
  }
  
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Seules les images sont autorisées');
      continue;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Taille maximale 5MB par photo');
      continue;
    }
    
    // TODO: Upload to Cloudflare R2
    // For now, create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = {
        url: e.target.result,
        name: file.name
      };
      
      uploadedPhotos.push(photoData);
      renderPhotos();
    };
    reader.readAsDataURL(file);
  }
  
  // Reset input
  event.target.value = '';
}

function renderPhotos() {
  const container = document.getElementById('photosPreview');
  
  container.innerHTML = uploadedPhotos.map((photo, index) => `
    <div class="relative group">
      <img src="${photo.url}" alt="${photo.name}" class="w-full h-24 object-cover rounded-lg border-2 border-gray-200">
      <button type="button" 
              onclick="removePhoto(${index})"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  `).join('');
  
  // Show/hide upload button
  if (uploadedPhotos.length >= 5) {
    document.getElementById('uploadPhotoBtn').classList.add('hidden');
  } else {
    document.getElementById('uploadPhotoBtn').classList.remove('hidden');
  }
}

function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotos();
}

// Calculate estimated cost
function calculateEstimatedCost() {
  const weightInput = document.getElementById('weight');
  
  weightInput.addEventListener('input', updateCost);
}

function updateCost() {
  const weight = parseFloat(document.getElementById('weight').value) || 0;
  const avgPricePerKg = 8; // Average price
  const estimatedCost = weight * avgPricePerKg;
  
  document.getElementById('estimatedCost').textContent = estimatedCost.toFixed(2);
}

// Submit form
async function submitPackage(event) {
  event.preventDefault();
  
  if (!selectedDepartureCity || !selectedArrivalCity) {
    showNotification('error', 'Veuillez sélectionner les villes de départ et d\'arrivée');
    return;
  }
  
  if (uploadedPhotos.length === 0) {
    showNotification('warning', 'Il est recommandé d\'ajouter au moins une photo');
  }
  
  const formData = {
    user_id: currentUser.id,
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim() || null,
    content_declaration: document.getElementById('contentDeclaration').value.trim(),
    weight: parseFloat(document.getElementById('weight').value),
    dimensions: document.getElementById('dimensions').value.trim() || null,
    budget: parseFloat(document.getElementById('budget').value),
    departure_city: selectedDepartureCity.city,
    departure_country: selectedDepartureCity.country,
    arrival_city: selectedArrivalCity.city,
    arrival_country: selectedArrivalCity.country,
    preferred_date: document.getElementById('preferredDate').value || null,
    flexible_dates: document.getElementById('flexibleDates').checked ? 1 : 0,
    photos: uploadedPhotos.map(p => p.url) // TODO: Replace with R2 URLs
  };
  
  try {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publication en cours...';
    
    const response = await window.auth.apiRequest('/api/packages', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    if (response.success) {
      showNotification('success', 'Colis publié avec succès !');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/expediteur/mes-colis';
      }, 2000);
    } else {
      showNotification('error', response.error || 'Erreur lors de la publication');
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publier mon colis';
    }
    
  } catch (error) {
    console.error('Erreur publication colis:', error);
    showNotification('error', error.message || 'Erreur lors de la publication');
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publier mon colis';
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showNotification(type, message) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Set minimum date to today
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    dateInput.min = today;
  }
});
