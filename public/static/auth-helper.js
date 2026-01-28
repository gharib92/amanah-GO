/**
 * Auth Helper - Centralized authentication utilities
 * @version 1.0.0
 */

const AUTH_TOKEN_KEY = 'amanah_token'
const AUTH_USER_KEY = 'amanah_user'

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not authenticated
 */
function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token
 */
function setAuthToken(token) {
  if (!token) {
    throw new Error('Token is required')
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

/**
 * Remove authentication token from localStorage
 */
function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  const token = getAuthToken()
  if (!token) return false
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() < exp
  } catch (error) {
    console.error('Invalid token format:', error)
    return false
  }
}

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
function getCurrentUser() {
  const userJson = localStorage.getItem(AUTH_USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

/**
 * Set current user in localStorage
 * @param {object} user
 */
function setCurrentUser(user) {
  if (!user) {
    throw new Error('User object is required')
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

/**
 * Logout user (clear all auth data)
 */
function logout() {
  removeAuthToken()
  window.location.href = '/login'
}

/**
 * Make authenticated API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('Not authenticated')
  }
  
  // Check token expiration
  if (!isAuthenticated()) {
    console.warn('Token expired, redirecting to login...')
    logout()
    throw new Error('Token expired')
  }
  
  // Add Authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    console.warn('Unauthorized, redirecting to login...')
    logout()
    throw new Error('Unauthorized')
  }
  
  return response
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    console.warn('Authentication required, redirecting to login...')
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
  }
}

// Export functions
window.AuthHelper = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  logout,
  authenticatedFetch,
  requireAuth,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY
}

console.log('✅ AuthHelper loaded')
