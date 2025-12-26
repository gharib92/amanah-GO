/**
 * Amanah GO - Page Protection Script
 * À charger dans les pages protégées (voyageur, expediteur)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Protection: redirect if not authenticated
  if (!window.auth || !window.auth.isAuthenticated()) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }
  
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
