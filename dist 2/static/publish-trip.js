// ==========================================
// PUBLISH TRIP - JavaScript
// ==========================================

let selectedDepartureAirport = null;
let selectedArrivalAirport = null;
let currentUser = null;

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
  //   alert('Vous devez compléter la vérification KYC avant de publier un trajet');
  //   window.location.href = '/verify-profile';
  //   return;
  // }
  
  document.getElementById('userName').textContent = currentUser.name;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initializeAutocomplete();
  initializeFlightNumber();
  calculateTotalEarnings();
});

// Airport autocomplete
function initializeAutocomplete() {
  const departureInput = document.getElementById('departureCity');
  const arrivalInput = document.getElementById('arrivalCity');
  
  departureInput.addEventListener('input', debounce((e) => searchAirports(e.target.value, 'departure'), 300));
  arrivalInput.addEventListener('input', debounce((e) => searchAirports(e.target.value, 'arrival'), 300));
  
  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.airport-autocomplete')) {
      document.getElementById('departureSuggestions').innerHTML = '';
      document.getElementById('arrivalSuggestions').innerHTML = '';
    }
  });
}

async function searchAirports(query, type) {
  if (query.length < 2) {
    document.getElementById(`${type}Suggestions`).innerHTML = '';
    return;
  }
  
  try {
    const response = await axios.get(`/api/airports/search?q=${encodeURIComponent(query)}`);
    const airports = response.data.airports;
    
    const suggestionsDiv = document.getElementById(`${type}Suggestions`);
    
    if (airports.length === 0) {
      suggestionsDiv.innerHTML = '<div class="p-2 text-gray-500">Aucun aéroport trouvé</div>';
      return;
    }
    
    suggestionsDiv.innerHTML = airports.map(airport => `
      <div class="airport-item p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0" 
           onclick="selectAirport('${type}', ${JSON.stringify(airport).replace(/"/g, '&quot;')})">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold text-gray-900">${airport.city}, ${airport.country}</div>
            <div class="text-sm text-gray-600">${airport.name}</div>
          </div>
          <div class="text-blue-600 font-bold">${airport.iata_code}</div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur recherche aéroports:', error);
  }
}

function selectAirport(type, airport) {
  const input = document.getElementById(`${type}City`);
  input.value = `${airport.city} (${airport.iata_code})`;
  
  if (type === 'departure') {
    selectedDepartureAirport = airport;
    document.getElementById('departureAirportCode').value = airport.iata_code;
  } else {
    selectedArrivalAirport = airport;
    document.getElementById('arrivalAirportCode').value = airport.iata_code;
  }
  
  document.getElementById(`${type}Suggestions`).innerHTML = '';
  
  // If both airports selected, enable flight search
  if (selectedDepartureAirport && selectedArrivalAirport) {
    document.getElementById('flightNumberSection').classList.remove('hidden');
  }
}

// Flight number import
function initializeFlightNumber() {
  document.getElementById('importFlight').addEventListener('click', importFlightInfo);
}

async function importFlightInfo() {
  const flightNumber = document.getElementById('flightNumber').value.trim().toUpperCase();
  const date = document.getElementById('departureDate').value;
  
  if (!flightNumber || !date) {
    alert('Veuillez entrer un numéro de vol et une date');
    return;
  }
  
  if (!selectedDepartureAirport || !selectedArrivalAirport) {
    alert('Veuillez sélectionner les aéroports de départ et d\'arrivée d\'abord');
    return;
  }
  
  try {
    document.getElementById('importFlight').disabled = true;
    document.getElementById('importFlight').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Recherche...';
    
    const response = await axios.get(`/api/flights/search?from=${selectedDepartureAirport.iata_code}&to=${selectedArrivalAirport.iata_code}&date=${date}`);
    
    const flights = response.data.flights;
    const matchingFlight = flights.find(f => f.flight_number === flightNumber);
    
    if (matchingFlight) {
      // Auto-fill departure time
      const departureTime = new Date(matchingFlight.departure.time);
      const timeString = departureTime.toTimeString().substring(0, 5);
      
      document.getElementById('departureDate').value = `${date}T${timeString}`;
      
      // Show success message
      showNotification('success', `Vol ${flightNumber} trouvé ! Informations importées.`);
    } else {
      showNotification('warning', `Vol ${flightNumber} non trouvé. Vous pouvez continuer manuellement.`);
    }
    
  } catch (error) {
    console.error('Erreur import vol:', error);
    showNotification('error', 'Erreur lors de l\'import du vol');
  } finally {
    document.getElementById('importFlight').disabled = false;
    document.getElementById('importFlight').innerHTML = '<i class="fas fa-plane mr-2"></i>Importer';
  }
}

// Calculate earnings
function calculateTotalEarnings() {
  const weightInput = document.getElementById('availableWeight');
  const priceInput = document.getElementById('pricePerKg');
  
  weightInput.addEventListener('input', updateEarnings);
  priceInput.addEventListener('input', updateEarnings);
}

function updateEarnings() {
  const weight = parseFloat(document.getElementById('availableWeight').value) || 0;
  const price = parseFloat(document.getElementById('pricePerKg').value) || 0;
  const total = weight * price;
  const commission = total * 0.12;
  const earnings = total - commission;
  
  document.getElementById('totalEarnings').textContent = earnings.toFixed(2);
  document.getElementById('commission').textContent = commission.toFixed(2);
}

// Submit form
async function submitTrip(event) {
  event.preventDefault();
  
  if (!selectedDepartureAirport || !selectedArrivalAirport) {
    showNotification('error', 'Veuillez sélectionner les aéroports de départ et d\'arrivée');
    return;
  }
  
  const formData = {
    user_id: currentUser.id,
    departure_city: selectedDepartureAirport.city,
    departure_country: selectedDepartureAirport.country,
    departure_airport: selectedDepartureAirport.iata_code,
    arrival_city: selectedArrivalAirport.city,
    arrival_country: selectedArrivalAirport.country,
    arrival_airport: selectedArrivalAirport.iata_code,
    departure_date: document.getElementById('departureDate').value,
    flight_number: document.getElementById('flightNumber').value.trim().toUpperCase() || null,
    available_weight: parseFloat(document.getElementById('availableWeight').value),
    price_per_kg: parseFloat(document.getElementById('pricePerKg').value),
    description: document.getElementById('description').value.trim() || null,
    flexible_dates: document.getElementById('flexibleDates').checked ? 1 : 0
  };
  
  try {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publication en cours...';
    
    const response = await axios.post('/api/trips', formData);
    
    if (response.data.success) {
      showNotification('success', 'Trajet publié avec succès !');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/voyageur/mes-trajets';
      }, 2000);
    } else {
      showNotification('error', response.data.error || 'Erreur lors de la publication');
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publier mon trajet';
    }
    
  } catch (error) {
    console.error('Erreur publication trajet:', error);
    showNotification('error', error.response?.data?.error || 'Erreur lors de la publication');
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publier mon trajet';
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
  document.getElementById('departureDate').min = today;
});
