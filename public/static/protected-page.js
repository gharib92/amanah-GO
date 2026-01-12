/**
 * Amanah GO - Page Protection Script
 * À charger dans les pages protégées (voyageur, expediteur)
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔒 PROTECTED PAGE: Checking authentication...');
  console.log('🔒 window.auth exists:', !!window.auth);
  console.log('🔒 isAuthenticated:', window.auth?.isAuthenticated());
  console.log('🔒 Token:', window.auth?.getToken()?.substring(0, 20) + '...');
  console.log('🔒 User:', window.auth?.getUser());
  
  // Protection: redirect if not authenticated
  if (!window.auth || !window.auth.isAuthenticated()) {
    console.error('❌ PROTECTED PAGE: Not authenticated, redirecting to login');
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }
  
  console.log('✅ PROTECTED PAGE: Authenticated, loading page...');
  
  // Display user name in navbar
  const user = window.auth.getUser();
  if (user) {
    const userNameElements = document.querySelectorAll('#userName, [data-auth="user-name"]');
    userNameElements.forEach(el => {
      el.textContent = user.name;
    });
  }
  
  // Add logout button functionality
  const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        window.auth.logout();
      }
    });
  });
});
