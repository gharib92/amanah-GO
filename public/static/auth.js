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
  
  // Toujours retourner le JSON, même en cas d'erreur
  return await response.json()
}

// ==========================================
// AUTHENTIFICATION
// ==========================================

async function signup(email, password, name, phone) {
  try {
    console.log('🔐 auth.signup called:', { email, name, phone });
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone })
    })
    
    console.log('📡 Signup response status:', response.status, response.ok);
    
    const data = await response.json()
    console.log('📦 Signup response data:', data);
    
    if (response.ok) {
      console.log('✅ Signup successful, saving token...');
      saveToken(data.token)
      saveUser(data.user)
      console.log('✅ Token saved, localStorage check:', !!getToken());
      return { success: true, user: data.user }
    } else {
      console.error('❌ Signup failed:', data.error);
      return { success: false, error: data.error || 'Erreur lors de l\'inscription' }
    }
  } catch (error) {
    console.error('❌ Signup network error:', error);
    return { success: false, error: 'Erreur réseau: ' + error.message }
  }
}

async function login(email, password) {
  try {
    console.log('🔐 auth.login called:', email)
    
    // 🔍 DIAGNOSTIC: Appel à l'API debug
    console.log('🔍 Calling debug endpoint...')
    const debugResponse = await fetch('/api/auth/login/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const debugData = await debugResponse.json()
    console.log('🔍 DEBUG RESULT:', debugData)
    
    // Si l'utilisateur n'existe pas, arrêter ici
    if (debugData.debug && !debugData.debug.user_found) {
      console.error('❌ User not found in D1:', email)
      return { 
        success: false, 
        error: 'Compte introuvable. Veuillez créer un compte via /signup'
      }
    }
    
    // Si le mot de passe ne correspond pas
    if (debugData.debug && !debugData.debug.password_match) {
      console.error('❌ Password incorrect for user:', email)
      console.error('🔍 Password hash info:', {
        has_hash: debugData.debug.has_password_hash,
        hash_length: debugData.debug.password_hash_length,
        hash_prefix: debugData.debug.password_hash_starts_with
      })
      return { 
        success: false, 
        error: 'Mot de passe incorrect'
      }
    }
    
    // ✅ Debug OK, appel normal
    console.log('✅ Debug passed, calling normal login...')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    console.log('📡 Response status:', response.status, response.ok)
    
    const data = await response.json()
    console.log('📦 Response data:', data)
    
    if (response.ok && data.token) {
      console.log('✅ Saving token:', data.token.substring(0, 20) + '...')
      saveToken(data.token)
      saveUser(data.user)
      console.log('✅ Token saved, localStorage check:', !!getToken())
      return { success: true, user: data.user, token: data.token }
    } else {
      console.error('❌ Login failed:', data.error)
      return { success: false, error: data.error || 'Email ou mot de passe incorrect' }
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    return { success: false, error: 'Erreur réseau: ' + error.message }
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
    if (userMenu) {
      userMenu.style.display = 'flex'
      userMenu.classList.remove('hidden')
    }
    if (userName) userName.textContent = user.name || user.displayName || user.email
  } else {
    // Non connecté
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
