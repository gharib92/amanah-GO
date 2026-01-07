// ==========================================
// ADMIN DASHBOARD - Gestion KYC
// ==========================================

let currentTab = 'pending';
let allUsers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  loadStats();
  loadUsers();
});

// Check if user is admin
function checkAdminAuth() {
  const user = JSON.parse(localStorage.getItem('amanah_user') || '{}');
  
  // TODO: Vérifier rôle admin en production
  // Pour dev, simuler admin
  if (!user.id) {
    // Mode demo admin
    document.getElementById('adminName').textContent = 'Admin Demo';
  } else {
    document.getElementById('adminName').textContent = user.name;
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('amanah_token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      document.getElementById('totalUsers').textContent = data.total || 0;
      document.getElementById('pendingKYC').textContent = data.pending || 0;
      document.getElementById('verifiedUsers').textContent = data.verified || 0;
      document.getElementById('rejectedKYC').textContent = data.rejected || 0;
    }
  } catch (error) {
    console.error('Erreur chargement stats:', error);
  }
}

// Load users list
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('amanah_token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      allUsers = data.users || [];
      filterAndDisplayUsers();
    } else {
      // Mode demo avec données simulées
      allUsers = generateMockUsers();
      filterAndDisplayUsers();
    }
  } catch (error) {
    console.error('Erreur chargement users:', error);
    // Mode demo avec données simulées
    allUsers = generateMockUsers();
    filterAndDisplayUsers();
  }
}

// Generate mock users for demo
function generateMockUsers() {
  return [
    {
      id: 1,
      name: 'Mohammed Alami',
      email: 'mohammed@example.com',
      phone: '+33612345678',
      kyc_status: 'SUBMITTED',
      kyc_selfie_url: 'https://via.placeholder.com/300x400?text=Selfie+1',
      kyc_document_url: 'https://via.placeholder.com/300x200?text=ID+Document+1',
      created_at: '2025-12-20T10:00:00Z'
    },
    {
      id: 2,
      name: 'Fatima Benali',
      email: 'fatima@example.com',
      phone: '+33687654321',
      kyc_status: 'SUBMITTED',
      kyc_selfie_url: 'https://via.placeholder.com/300x400?text=Selfie+2',
      kyc_document_url: 'https://via.placeholder.com/300x200?text=ID+Document+2',
      created_at: '2025-12-21T14:30:00Z'
    },
    {
      id: 3,
      name: 'Youssef Idrissi',
      email: 'youssef@example.com',
      phone: '+33698765432',
      kyc_status: 'VERIFIED',
      created_at: '2025-12-15T09:00:00Z'
    },
    {
      id: 4,
      name: 'Amina Rachid',
      email: 'amina@example.com',
      phone: '+33623456789',
      kyc_status: 'REJECTED',
      kyc_rejection_reason: 'Document illisible',
      created_at: '2025-12-18T11:00:00Z'
    }
  ];
}

// Switch tabs
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab styles
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-yellow-500', 'border-green-500', 'border-red-500', 'border-purple-500', 'text-yellow-600', 'text-green-600', 'text-red-600', 'text-purple-600');
    btn.classList.add('border-transparent', 'text-gray-600');
  });
  
  const activeBtn = document.getElementById(`tab-${tab}`);
  const colors = {
    pending: ['border-yellow-500', 'text-yellow-600'],
    verified: ['border-green-500', 'text-green-600'],
    rejected: ['border-red-500', 'text-red-600'],
    all: ['border-purple-500', 'text-purple-600']
  };
  
  activeBtn.classList.remove('border-transparent', 'text-gray-600');
  activeBtn.classList.add(...colors[tab]);
  
  filterAndDisplayUsers();
}

// Filter and display users
function filterAndDisplayUsers() {
  const statusMap = {
    pending: ['PENDING', 'SUBMITTED'],
    verified: ['VERIFIED'],
    rejected: ['REJECTED'],
    all: null
  };
  
  const statuses = statusMap[currentTab];
  const filtered = statuses 
    ? allUsers.filter(u => statuses.includes(u.kyc_status))
    : allUsers;
  
  displayUsers(filtered);
}

// Display users
function displayUsers(users) {
  const container = document.getElementById('usersList');
  
  if (users.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun utilisateur à afficher</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = users.map(user => {
    const statusConfig = {
      PENDING: { color: 'gray', icon: 'clock', label: 'En attente' },
      SUBMITTED: { color: 'yellow', icon: 'hourglass-half', label: 'Soumis' },
      VERIFIED: { color: 'green', icon: 'check-circle', label: 'Vérifié' },
      REJECTED: { color: 'red', icon: 'times-circle', label: 'Rejeté' }
    };
    
    const status = statusConfig[user.kyc_status] || statusConfig.PENDING;
    const date = new Date(user.created_at).toLocaleDateString('fr-FR');
    
    return `
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-${status.color}-400 to-${status.color}-600 flex items-center justify-center text-white text-2xl font-bold">
              ${user.name.charAt(0)}
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800">${user.name}</h3>
              <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span><i class="fas fa-envelope mr-1"></i> ${user.email}</span>
                <span><i class="fas fa-phone mr-1"></i> ${user.phone}</span>
                <span><i class="fas fa-calendar mr-1"></i> ${date}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="px-4 py-2 rounded-full bg-${status.color}-100 text-${status.color}-700 text-sm font-medium">
              <i class="fas fa-${status.icon} mr-1"></i>
              ${status.label}
            </span>
            
            ${user.kyc_status === 'SUBMITTED' ? `
              <button onclick="openValidationModal(${user.id})" 
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                <i class="fas fa-eye mr-2"></i>
                Valider KYC
              </button>
            ` : user.kyc_status === 'VERIFIED' ? `
              <button onclick="viewUserDetails(${user.id})" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                <i class="fas fa-user mr-2"></i>
                Voir Détails
              </button>
            ` : user.kyc_status === 'REJECTED' ? `
              <button onclick="openValidationModal(${user.id})" 
                      class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium">
                <i class="fas fa-redo mr-2"></i>
                Revoir
              </button>
            ` : ''}
          </div>
        </div>
        
        ${user.kyc_rejection_reason ? `
          <div class="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p class="text-sm text-red-700">
              <i class="fas fa-exclamation-circle mr-1"></i>
              <strong>Raison du rejet:</strong> ${user.kyc_rejection_reason}
            </p>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Open validation modal
function openValidationModal(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  
  const modal = document.getElementById('kycModal');
  const content = document.getElementById('modalContent');
  
  content.innerHTML = `
    <div class="space-y-6">
      <!-- User Info -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-bold text-lg text-gray-800 mb-3">Informations Utilisateur</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Nom:</strong> ${user.name}</div>
          <div><strong>Email:</strong> ${user.email}</div>
          <div><strong>Téléphone:</strong> ${user.phone}</div>
          <div><strong>Inscription:</strong> ${new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
      
      <!-- KYC Documents -->
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h4 class="font-bold text-gray-800 mb-3">
            <i class="fas fa-camera text-blue-600 mr-2"></i>
            Selfie
          </h4>
          <img src="${user.kyc_selfie_url || 'https://via.placeholder.com/300x400?text=Selfie'}" 
               alt="Selfie" 
               class="w-full rounded-lg border-2 border-gray-200 shadow-md">
        </div>
        
        <div>
          <h4 class="font-bold text-gray-800 mb-3">
            <i class="fas fa-id-card text-green-600 mr-2"></i>
            Pièce d'Identité
          </h4>
          <img src="${user.kyc_document_url || 'https://via.placeholder.com/300x200?text=ID'}" 
               alt="ID Document" 
               class="w-full rounded-lg border-2 border-gray-200 shadow-md">
        </div>
      </div>
      
      <!-- Rejection Reason (if rejected) -->
      ${user.kyc_status === 'REJECTED' ? `
        <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p class="text-red-700 font-medium">${user.kyc_rejection_reason}</p>
        </div>
      ` : ''}
      
      <!-- Validation Form -->
      <div class="border-t pt-6">
        <h4 class="font-bold text-gray-800 mb-4">Décision de Validation</h4>
        
        <textarea id="adminNotes" 
                  placeholder="Notes ou raison de rejet (optionnel)..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                  rows="3"></textarea>
        
        <div class="flex space-x-4">
          <button onclick="validateKYC(${user.id}, 'VERIFIED')" 
                  class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold">
            <i class="fas fa-check-circle mr-2"></i>
            Approuver
          </button>
          
          <button onclick="validateKYC(${user.id}, 'REJECTED')" 
                  class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold">
            <i class="fas fa-times-circle mr-2"></i>
            Rejeter
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('kycModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Validate KYC
async function validateKYC(userId, newStatus) {
  const notes = document.getElementById('adminNotes').value.trim();
  
  if (newStatus === 'REJECTED' && !notes) {
    alert('Veuillez indiquer la raison du rejet');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/validate-kyc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('amanah_token')}`
      },
      body: JSON.stringify({
        user_id: userId,
        status: newStatus,
        notes: notes
      })
    });
    
    if (response.ok) {
      // Update local data
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        user.kyc_status = newStatus;
        if (newStatus === 'REJECTED') {
          user.kyc_rejection_reason = notes;
        }
      }
      
      // Show success notification
      showNotification('success', `KYC ${newStatus === 'VERIFIED' ? 'approuvé' : 'rejeté'} avec succès`);
      
      // Reload data
      loadStats();
      filterAndDisplayUsers();
      closeModal();
    } else {
      // Mode demo: Simuler succès
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        user.kyc_status = newStatus;
        if (newStatus === 'REJECTED') {
          user.kyc_rejection_reason = notes;
        }
      }
      
      showNotification('success', `KYC ${newStatus === 'VERIFIED' ? 'approuvé' : 'rejeté'} (mode demo)`);
      loadStats();
      filterAndDisplayUsers();
      closeModal();
    }
    
  } catch (error) {
    console.error('Erreur validation KYC:', error);
    showNotification('error', 'Erreur lors de la validation');
  }
}

// View user details
function viewUserDetails(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  
  openValidationModal(userId);
}

// Show notification
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
  }, 4000);
}
