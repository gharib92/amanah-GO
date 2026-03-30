/**
 * Amanah GO - i18n System
 * Multi-language support: FR 🇫🇷 / AR 🇲🇦 / EN 🇬🇧
 */

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('lang') || 'fr'
    this.translations = {}
    this.fallbackLang = 'fr'
  }

  /**
   * Initialize i18n system
   */
  async init() {
    await this.loadTranslations(this.currentLang)
    this.applyLanguage()
  }

  /**
   * Load translations from JSON file
   */
  async loadTranslations(lang) {
    try {
      const response = await fetch(`/static/locales/${lang}.json`)
      if (!response.ok) {
        console.warn(`Failed to load ${lang}.json, falling back to ${this.fallbackLang}`)
        if (lang !== this.fallbackLang) {
          return await this.loadTranslations(this.fallbackLang)
        }
        throw new Error(`Cannot load translations for ${lang}`)
      }
      this.translations = await response.json()
      this.currentLang = lang
      console.log(`✅ Loaded translations: ${lang}`)
    } catch (error) {
      console.error('Error loading translations:', error)
      this.translations = {}
    }
  }

  /**
   * Get translation by key (supports nested keys with dot notation)
   * Example: t('landing.hero_title') or t('common.home')
   */
  t(key, fallback = key) {
    const keys = key.split('.')
    let value = this.translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation missing for key: ${key} (lang: ${this.currentLang})`)
        return fallback
      }
    }

    return value || fallback
  }

  /**
   * Change language
   */
  async setLanguage(lang) {
    if (this.currentLang === lang) return

    localStorage.setItem('lang', lang)
    await this.loadTranslations(lang)
    this.applyLanguage()
    
    // Reload page to apply translations
    window.location.reload()
  }

  /**
   * Apply language-specific settings (RTL for Arabic)
   */
  applyLanguage() {
    const html = document.documentElement
    html.setAttribute('lang', this.currentLang)
    
    // RTL for Arabic
    if (this.currentLang === 'ar') {
      html.setAttribute('dir', 'rtl')
      document.body.classList.add('rtl')
    } else {
      html.setAttribute('dir', 'ltr')
      document.body.classList.remove('rtl')
    }
  }

  /**
   * Get current language code
   */
  getCurrentLang() {
    return this.currentLang
  }

  /**
   * Get current language name
   */
  getCurrentLangName() {
    return this.t('lang_name', this.currentLang.toUpperCase())
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', name: 'العربية', flag: '🇲🇦' },
      { code: 'en', name: 'English', flag: '🇬🇧' }
    ]
  }
}

// Global instance
window.i18n = new I18n()

// Shorthand for translation
window.t = (key, fallback) => window.i18n.t(key, fallback)

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init()
  })
} else {
  window.i18n.init()
}
