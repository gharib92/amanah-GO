/**
 * Amanah GO - Authentication Module
 * Gère les tokens JWT, localStorage, et les requêtes authentifiées
 */

const AUTH_TOKEN_KEY = 'amanah_token'
const AUTH_USER_KEY = 'amanah_user'

// ==========================================
// GESTION DES TOKENS
// ==========================================

function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

function saveUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function getUser() {
  const userStr = localStorage.getItem(AUTH_USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

function isAuthenticated() {
  return !!getToken()
}

// ==========================================
// REQUÊTES API AUTHENTIFIÉES
// ==========================================

async function apiRequest(url, options = {}) {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  // Si 401, token invalide → logout
  if (response.status === 401) {
    logout()
    window.location.href = '/login'
    return null
  }
  
  return response
}

// ==========================================
// AUTHENTIFICATION
// ==========================================

async function signup(email, password, name, phone) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      saveToken(data.token)
      saveUser(data.user)
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || 'Erreur lors de l\'inscription' }
    }
  } catch (error) {
    return { success: false, error: 'Erreur réseau' }
  }
}

async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      saveToken(data.token)
      saveUser(data.user)
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || 'Email ou mot de passe incorrect' }
    }
  } catch (error) {
    return { success: false, error: 'Erreur réseau' }
  }
}

function logout() {
  removeToken()
  window.location.href = '/'
}

async function getMe() {
  try {
    const response = await apiRequest('/api/auth/me')
    if (!response) return null
    
    const data = await response.json()
    if (response.ok) {
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
    // Utilisateur connecté
    if (loginBtn) loginBtn.style.display = 'none'
    if (signupBtn) signupBtn.style.display = 'none'
    if (userMenu) userMenu.style.display = 'flex'
    if (userName) userName.textContent = user.name
  } else {
    // Non connecté
    if (loginBtn) loginBtn.style.display = 'block'
    if (signupBtn) signupBtn.style.display = 'block'
    if (userMenu) userMenu.style.display = 'none'
  }
}

// Export vers window
window.auth = {
  signup,
  login,
  logout,
  getMe,
  getToken,
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
