/**
 * Amanah GO - Language Switcher Component
 * Creates a dropdown to switch between FR 🇫🇷 / AR 🇲🇦 / EN 🇬🇧
 * Compact version: Flag only (no text)
 */

function createLanguageSwitcher() {
  const currentLang = window.i18n?.getCurrentLang() || 'fr'
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]
  
  const current = languages.find(l => l.code === currentLang) || languages[0]
  
  return `
    <div class="lang-switcher">
      <button class="lang-switcher-button-compact" onclick="toggleLangDropdown()" id="langSwitcherBtn" title="${current.name}">
        <span class="lang-flag-large">${current.flag}</span>
        <i class="fas fa-chevron-down text-xs text-gray-500"></i>
      </button>
      
      <div class="lang-switcher-dropdown" id="langDropdown">
        ${languages.map(lang => `
          <div class="lang-option ${lang.code === currentLang ? 'active' : ''}" 
               onclick="switchLanguage('${lang.code}')">
            <span class="lang-flag">${lang.flag}</span>
            <span>${lang.name}</span>
            ${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function toggleLangDropdown() {
  const dropdown = document.getElementById('langDropdown')
  dropdown.classList.toggle('show')
}

function switchLanguage(lang) {
  if (window.i18n) {
    window.i18n.setLanguage(lang)
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const switcher = document.querySelector('.lang-switcher')
  const dropdown = document.getElementById('langDropdown')
  
  if (switcher && dropdown && !switcher.contains(event.target)) {
    dropdown.classList.remove('show')
  }
})
