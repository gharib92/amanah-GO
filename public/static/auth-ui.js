/**
 * Amanah GO - Auth UI Initialization
 * Automatically attach logout events on all pages
 */

function initAuthUI() {
  // Attach logout event
  const logoutBtns = document.querySelectorAll('[data-auth="logout"]')
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      if (window.auth && window.auth.logout) {
        window.auth.logout()
      }
    })
  })
  
  // Update UI based on auth status
  if (window.auth && window.auth.updateAuthUI) {
    window.auth.updateAuthUI()
  }
}

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI)
} else {
  initAuthUI()
}
