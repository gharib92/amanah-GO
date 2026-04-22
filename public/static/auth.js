/**
 * Amanah GO - Authentication Module
 * Gère les tokens JWT et les requêtes authentifiées
 */

const AUTH_USER_KEY = 'amanah_user'

// ==========================================
// GESTION UTILISATEUR (localStorage — données non sensibles uniquement)
// ==========================================

function saveUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function getUser() {
  const userStr = localStorage.getItem(AUTH_USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

function removeUser() {
  localStorage.removeItem(AUTH_USER_KEY)
  // Supprime aussi l'ancien token s'il existait (migration)
  localStorage.removeItem('amanah_token')
}

function isAuthenticated() {
  return !!getUser()
}

// ==========================================
// REQUÊTES API AUTHENTIFIÉES
// credentials: 'include' → envoie le cookie httpOnly automatiquement
// Authorization header → fallback pour les flux Firebase
// ==========================================

async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Fallback : si un ancien token JWT existe en localStorage (migration), l'utiliser
  const legacyToken = localStorage.getItem('amanah_token')
  if (legacyToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${legacyToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // envoie le cookie httpOnly
  })

  if (response.status === 401) {
    logout()
    window.location.href = '/login'
    return null
  }

  return await response.json()
}

// ==========================================
// AUTHENTIFICATION
// ==========================================

async function signup(email, password, name, phone) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name, phone })
    })

    const data = await response.json()

    if (response.ok) {
      saveUser(data.user)
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || 'Erreur lors de l\'inscription' }
    }
  } catch (error) {
    return { success: false, error: 'Erreur réseau: ' + error.message }
  }
}

async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      saveUser(data.user)
      // Compatibilité : stocker le token pour les appels Firebase
      if (data.token) {
        localStorage.setItem('amanah_token', data.token)
      }
      return { success: true, user: data.user, token: data.token }
    } else {
      return { success: false, error: data.error || 'Email ou mot de passe incorrect' }
    }
  } catch (error) {
    return { success: false, error: 'Erreur réseau: ' + error.message }
  }
}

function logout() {
  removeUser()
  // Invalider le cookie côté serveur
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
  window.location.href = '/'
}

async function getMe() {
  try {
    const data = await apiRequest('/api/auth/me')
    if (data?.success && data.user) {
      saveUser(data.user)
      return data.user
    }
    return null
  } catch (error) {
    return null
  }
}

// ==========================================
// PROTECTION DES PAGES
// ==========================================

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    return false
  }
  return true
}

function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') || '/'
    window.location.href = redirect
    return true
  }
  return false
}

// ==========================================
// UI HELPERS
// ==========================================

function updateAuthUI() {
  const user = getUser()
  const loginBtn = document.querySelector('[data-auth="login"]')
  const signupBtn = document.querySelector('[data-auth="signup"]')
  const userMenu = document.querySelector('[data-auth="user-menu"]')
  const userName = document.querySelector('[data-auth="user-name"]')

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none'
    if (signupBtn) signupBtn.style.display = 'none'
    if (userMenu) {
      userMenu.style.display = 'flex'
      userMenu.classList.remove('hidden')
    }
    if (userName) userName.textContent = user.name || user.displayName || user.email
  } else {
    if (loginBtn) loginBtn.style.display = 'block'
    if (signupBtn) signupBtn.style.display = 'block'
    if (userMenu) {
      userMenu.style.display = 'none'
      userMenu.classList.add('hidden')
    }
  }
}

// Export vers window
window.auth = {
  signup,
  login,
  logout,
  getMe,
  getUser,
  isAuthenticated,
  requireAuth,
  redirectIfAuthenticated,
  updateAuthUI,
  apiRequest
}

// Auto-update UI on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI)
} else {
  updateAuthUI()
}
