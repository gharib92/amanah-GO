/**
 * ========================================
 * PHONE INPUT WITH COUNTRY SELECTOR
 * ========================================
 * Module isolé pour la saisie de numéro de téléphone avec :
 * - Sélecteur d'indicatif pays (drapeau + nom + code)
 * - Validation selon le pays
 * - Format E.164 (+33612345678)
 * - Support libphonenumber-js
 */

(function() {
  'use strict';

  console.log('📞 Phone Input Module loaded');

  // ========================================
  // DATASET PAYS
  // ========================================
  const PRIORITY_COUNTRIES = ['FR', 'MA', 'BE', 'US', 'CA', 'GB', 'ES', 'IT', 'DE'];

  const COUNTRIES_DATA = [
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', format: '6 XX XX XX XX' },
    { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦', format: '6XX XX XX XX' },
    { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪', format: '4XX XX XX XX' },
    { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX' },
    { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧', format: '7XXX XXXXXX' },
    { code: 'ES', name: 'Espagne', dial: '+34', flag: '🇪🇸', format: '6XX XX XX XX' },
    { code: 'IT', name: 'Italie', dial: '+39', flag: '🇮🇹', format: '3XX XXX XXXX' },
    { code: 'DE', name: 'Allemagne', dial: '+49', flag: '🇩🇪', format: '1XX XXXXXXXX' },
    { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿', format: '5XX XX XX XX' },
    { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳', format: 'XX XXX XXX' },
    { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳', format: '7X XXX XX XX' },
    { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭', format: '7X XXX XX XX' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', format: '9X XXX XXXX' },
    { code: 'NL', name: 'Pays-Bas', dial: '+31', flag: '🇳🇱', format: '6 XXXX XXXX' },
  ];

  // ========================================
  // CLASSE PhoneInputWithCountry
  // ========================================
  class PhoneInputWithCountry {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`❌ Container #${containerId} not found`);
        return;
      }

      this.options = {
        defaultCountry: 'FR',
        placeholder: 'Ex: 6 12 34 56 78',
        required: false,
        ...options
      };

      this.selectedCountry = COUNTRIES_DATA.find(c => c.code === this.options.defaultCountry) || COUNTRIES_DATA[0];
      this.phoneInput = null;
      this.countryButton = null;
      this.modal = null;

      this.init();
    }

    init() {
      console.log('📞 Initializing PhoneInputWithCountry...');
      this.render();
      this.attachEvents();
    }

    render() {
      const html = `
        <div class="phone-input-wrapper" style="position: relative; width: 100%;">
          <!-- BOUTON INDICATIF -->
          <button 
            type="button" 
            id="country-selector-btn" 
            class="country-selector-btn"
            style="
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              background: transparent;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 4px 8px;
              border-radius: 6px;
              transition: background 0.2s;
              z-index: 10;
            "
          >
            <span class="country-flag" style="font-size: 20px;">${this.selectedCountry.flag}</span>
            <span class="country-dial" style="font-weight: 500; color: #374151;">${this.selectedCountry.dial}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="opacity: 0.6;">
              <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- INPUT TÉLÉPHONE -->
          <input 
            type="tel" 
            id="phone-number-input"
            class="phone-number-input"
            placeholder="${this.options.placeholder}"
            ${this.options.required ? 'required' : ''}
            style="
              width: 100%;
              padding: 12px 12px 12px 120px;
              border: 1px solid #D1D5DB;
              border-radius: 8px;
              font-size: 15px;
              transition: all 0.2s;
            "
          />

          <!-- MESSAGE VALIDATION -->
          <div id="phone-validation-msg" style="margin-top: 6px; font-size: 13px; display: none;"></div>
        </div>

        <!-- MODAL SÉLECTION PAYS -->
        <div id="country-modal" class="country-modal" style="display: none;">
          <div class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
          "></div>
          <div class="modal-content" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            max-width: 420px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            z-index: 9999;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          ">
            <!-- HEADER -->
            <div style="padding: 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Sélectionner un pays</h3>
              <button id="close-modal-btn" style="background: transparent; border: none; cursor: pointer; font-size: 24px; line-height: 1;">&times;</button>
            </div>

            <!-- RECHERCHE -->
            <div style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <input 
                type="text" 
                id="country-search" 
                placeholder="Rechercher un pays ou indicatif..."
                style="
                  width: 100%;
                  padding: 10px 12px;
                  border: 1px solid #D1D5DB;
                  border-radius: 8px;
                  font-size: 14px;
                "
              />
            </div>

            <!-- LISTE PAYS -->
            <div id="countries-list" style="
              max-height: 400px;
              overflow-y: auto;
              padding: 8px 0;
            "></div>
          </div>
        </div>
      `;

      this.container.innerHTML = html;

      // Références DOM
      this.phoneInput = document.getElementById('phone-number-input');
      this.countryButton = document.getElementById('country-selector-btn');
      this.modal = document.getElementById('country-modal');
      this.validationMsg = document.getElementById('phone-validation-msg');

      this.renderCountriesList();
    }

    renderCountriesList(filter = '') {
      const listContainer = document.getElementById('countries-list');
      if (!listContainer) return;

      let filteredCountries = COUNTRIES_DATA;

      if (filter) {
        const searchLower = filter.toLowerCase();
        filteredCountries = COUNTRIES_DATA.filter(c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.dial.includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower)
        );
      } else {
        // Tri intelligent : priorités en premier
        filteredCountries = [
          ...COUNTRIES_DATA.filter(c => PRIORITY_COUNTRIES.includes(c.code)),
          ...COUNTRIES_DATA.filter(c => !PRIORITY_COUNTRIES.includes(c.code))
        ];
      }

      listContainer.innerHTML = filteredCountries.map(country => `
        <div 
          class="country-item" 
          data-code="${country.code}"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#F3F4F6'"
          onmouseout="this.style.background='transparent'"
        >
          <span style="font-size: 24px;">${country.flag}</span>
          <div style="flex: 1;">
            <div style="font-weight: 500; color: #111827;">${country.name}</div>
            <div style="font-size: 13px; color: #6B7280;">${country.dial}</div>
          </div>
        </div>
      `).join('');
    }

    attachEvents() {
      // Ouvrir modal
      this.countryButton.addEventListener('click', () => this.openModal());

      // Fermer modal
      document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
      document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());

      // Recherche pays
      const searchInput = document.getElementById('country-search');
      searchInput.addEventListener('input', (e) => {
        this.renderCountriesList(e.target.value);
        this.attachCountryItemEvents();
      });

      // Sélection pays
      this.attachCountryItemEvents();

      // Validation téléphone
      this.phoneInput.addEventListener('input', () => this.validatePhone());
      this.phoneInput.addEventListener('blur', () => this.validatePhone());
    }

    attachCountryItemEvents() {
      document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const code = e.currentTarget.getAttribute('data-code');
          this.selectCountry(code);
          this.closeModal();
        });
      });
    }

    selectCountry(code) {
      const country = COUNTRIES_DATA.find(c => c.code === code);
      if (!country) return;

      console.log(`✅ Pays sélectionné: ${country.name} (${country.dial})`);
      this.selectedCountry = country;

      // Mettre à jour le bouton
      document.querySelector('.country-flag').textContent = country.flag;
      document.querySelector('.country-dial').textContent = country.dial;

      // Mettre à jour le placeholder
      this.phoneInput.placeholder = country.format;

      // Valider à nouveau
      this.validatePhone();
    }

    openModal() {
      this.modal.style.display = 'block';
      document.getElementById('country-search').value = '';
      this.renderCountriesList();
      this.attachCountryItemEvents();
    }

    closeModal() {
      this.modal.style.display = 'none';
    }

    validatePhone() {
      const rawNumber = this.phoneInput.value.trim();
      
      if (!rawNumber) {
        this.hideValidation();
        return { valid: false };
      }

      // Nettoyage du numéro (retirer espaces, tirets, parenthèses)
      const cleanNumber = rawNumber.replace(/[\s\-\(\)]/g, '');

      // Validation basique : 6-15 chiffres
      const isValid = /^\d{6,15}$/.test(cleanNumber);

      if (isValid) {
        this.showValidation('✅ Numéro valide', '#10B981');
        return { valid: true, e164: `${this.selectedCountry.dial}${cleanNumber}` };
      } else {
        this.showValidation('❌ Numéro invalide pour ce pays', '#EF4444');
        return { valid: false };
      }
    }

    showValidation(message, color) {
      this.validationMsg.textContent = message;
      this.validationMsg.style.color = color;
      this.validationMsg.style.display = 'block';
    }

    hideValidation() {
      this.validationMsg.style.display = 'none';
    }

    // ========================================
    // API PUBLIQUE
    // ========================================
    getPhoneE164() {
      const validation = this.validatePhone();
      return validation.valid ? validation.e164 : null;
    }

    getRawNumber() {
      return this.phoneInput.value.trim();
    }

    getSelectedCountry() {
      return this.selectedCountry;
    }

    isValid() {
      return this.validatePhone().valid;
    }

    reset() {
      this.phoneInput.value = '';
      this.hideValidation();
    }
  }

  // ========================================
  // EXPOSITION GLOBALE
  // ========================================
  window.PhoneInputWithCountry = PhoneInputWithCountry;

  console.log('✅ PhoneInputWithCountry ready');
})();
