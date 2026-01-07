# 🎨 AMANAH GO - DESIGN SYSTEM
## Professional UI/UX Guidelines & Components Library

**Version** : 1.0  
**Date** : Janvier 2026  
**Status** : Production-Ready

---

# 📖 TABLE DES MATIÈRES

1. [Brand Identity](#brand-identity)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Color System](#color-system)
5. [Spacing & Layout](#spacing-layout)
6. [Components Library](#components-library)
7. [Page Templates](#page-templates)
8. [User Flows](#user-flows)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

---

# 1. BRAND IDENTITY

## 🎯 Mission Statement
**"Voyagez Malin, Envoyez Futé"**

Transport collaboratif de colis entre la France et le Maroc.  
Économies jusqu'à 70% vs services traditionnels.

## 🎨 Brand Personality
- **Fiable** : Sécurité et confiance avant tout
- **Moderne** : Tech-forward, digital-first
- **Accessible** : Simple, clair, pour tous
- **Communautaire** : Entraide, partage, connexion

## 🏷️ Logo Usage

### Logo Principal
- **Fichier** : `logo-amanah-go-v2.png` (820 KB)
- **Format** : PNG avec transparence
- **Taille minimale** : 120px largeur
- **Espace protégé** : 20px autour du logo

### Logo SVG
- **Fichier** : `logo-amanah-go.svg` (2.5 KB)
- **Usage** : Web (performance optimale)
- **Couleur** : Adaptable (light/dark mode)

### Règles
- ✅ Toujours garder les proportions
- ✅ Ne jamais déformer ou incliner
- ✅ Maintenir l'espace protégé
- ❌ Ne pas ajouter d'effets (ombre, reflet)
- ❌ Ne pas modifier les couleurs du logo

---

# 2. DESIGN TOKENS

## 🎨 Color Palette

### Primary Colors (Bleu)
```css
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Blue */
--primary-600: #2563eb;  /* Primary Action */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

**Usage** :
- Buttons primaires
- Links
- Focus states
- Headers

### Secondary Colors (Gradient)
```css
--gradient-start: #667eea;  /* Violet-Blue */
--gradient-end:   #764ba2;  /* Purple */
```

**Usage** :
- Hero sections
- Headers
- Premium features
- CTAs importantes

### Success (Vert)
```css
--success-50:  #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;  /* Main Green */
--success-700: #15803d;
```

**Usage** :
- Confirmations
- Success messages
- Validations
- KYC approved

### Warning (Jaune/Orange)
```css
--warning-500: #f59e0b;
--warning-600: #d97706;  /* Main Orange */
```

**Usage** :
- Alertes
- Pending status
- Attention states

### Error (Rouge)
```css
--error-50:  #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;  /* Main Red */
--error-700: #b91c1c;
```

**Usage** :
- Erreurs
- Rejections
- Dangerous actions
- Validation errors

### Neutral (Gris)
```css
--gray-50:  #f9fafb;  /* Backgrounds */
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;  /* Placeholders */
--gray-500: #6b7280;
--gray-600: #4b5563;  /* Secondary text */
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;  /* Primary text */
```

### Special Colors
```css
--white: #ffffff;
--black: #000000;

/* OAuth Brands */
--google-red:    #ea4335;
--apple-black:   #000000;
--facebook-blue: #1877f2;

/* Status Colors */
--pending:    #f59e0b;  /* Orange */
--active:     #22c55e;  /* Green */
--completed:  #3b82f6;  /* Blue */
--cancelled:  #6b7280;  /* Gray */
```

---

## 📏 Spacing Scale

```css
--space-0:  0px;
--space-1:  4px;    /* 0.25rem */
--space-2:  8px;    /* 0.5rem */
--space-3:  12px;   /* 0.75rem */
--space-4:  16px;   /* 1rem */
--space-5:  20px;   /* 1.25rem */
--space-6:  24px;   /* 1.5rem */
--space-8:  32px;   /* 2rem */
--space-10: 40px;   /* 2.5rem */
--space-12: 48px;   /* 3rem */
--space-16: 64px;   /* 4rem */
--space-20: 80px;   /* 5rem */
--space-24: 96px;   /* 6rem */
```

**Usage** :
- Margins
- Paddings
- Gaps (flexbox/grid)

---

## 🔤 Typography Scale

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### Font Sizes
```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
```

### Font Weights
```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose:  2;
```

---

## 🔲 Border Radius
```css
--radius-none: 0px;
--radius-sm:   0.125rem;  /* 2px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-2xl:  1rem;      /* 16px */
--radius-full: 9999px;    /* Circular */
```

---

## 💫 Shadows
```css
/* Elevation 1 - Subtle */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Elevation 2 - Cards */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Elevation 3 - Modals */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Elevation 4 - Dropdown */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Elevation 5 - Pop-over */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## ⚡ Animations

### Durations
```css
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   350ms;
```

### Easings
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transitions
```css
--transition-all:   all var(--duration-normal) var(--ease-in-out);
--transition-color: color var(--duration-fast) var(--ease-in-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
```

---

# 3. TYPOGRAPHY

## 📝 Text Styles

### H1 - Hero Title
```css
font-size: var(--text-5xl);      /* 48px */
font-weight: var(--font-bold);   /* 700 */
line-height: var(--leading-tight); /* 1.25 */
color: var(--gray-900);
```
**Usage** : Homepage hero, Landing pages

### H2 - Section Title
```css
font-size: var(--text-3xl);      /* 30px */
font-weight: var(--font-bold);   /* 700 */
line-height: var(--leading-tight);
color: var(--gray-900);
```
**Usage** : Section headers, Dashboard titles

### H3 - Card Title
```css
font-size: var(--text-xl);       /* 20px */
font-weight: var(--font-semibold); /* 600 */
line-height: var(--leading-snug);
color: var(--gray-900);
```
**Usage** : Card headers, Form sections

### H4 - Subsection
```css
font-size: var(--text-lg);       /* 18px */
font-weight: var(--font-medium); /* 500 */
line-height: var(--leading-normal);
color: var(--gray-800);
```

### Body Large
```css
font-size: var(--text-lg);       /* 18px */
font-weight: var(--font-normal); /* 400 */
line-height: var(--leading-relaxed);
color: var(--gray-700);
```
**Usage** : Hero descriptions, Important paragraphs

### Body Regular
```css
font-size: var(--text-base);     /* 16px */
font-weight: var(--font-normal); /* 400 */
line-height: var(--leading-normal);
color: var(--gray-600);
```
**Usage** : Default body text

### Body Small
```css
font-size: var(--text-sm);       /* 14px */
font-weight: var(--font-normal); /* 400 */
line-height: var(--leading-normal);
color: var(--gray-600);
```
**Usage** : Secondary information, Captions

### Caption
```css
font-size: var(--text-xs);       /* 12px */
font-weight: var(--font-normal); /* 400 */
line-height: var(--leading-normal);
color: var(--gray-500);
```
**Usage** : Timestamps, Meta info, Fine print

### Link
```css
font-size: inherit;
font-weight: var(--font-medium); /* 500 */
color: var(--primary-600);
text-decoration: underline;
transition: var(--transition-color);
```
```css
/* Hover state */
color: var(--primary-700);
```

---

# 4. COLOR SYSTEM

## 🎨 Usage Guidelines

### Primary (Bleu #2563eb)
**Où l'utiliser** :
- Boutons d'action principaux
- Links cliquables
- Navigation active
- Icons interactifs
- Progress bars

**Quand l'éviter** :
- Texte long (fatigue visuelle)
- Backgrounds larges
- Erreurs ou warnings

### Success (Vert #16a34a)
**Où l'utiliser** :
- Confirmations
- Success notifications
- KYC approved badges
- Completed status
- Positive stats

### Warning (Orange #d97706)
**Où l'utiliser** :
- Pending status
- Cautions
- Important notes
- Review requests

### Error (Rouge #dc2626)
**Où l'utiliser** :
- Erreurs de validation
- Actions destructives
- KYC rejected
- Cancelled status
- Error messages

### Neutral (Gris)
**Où l'utiliser** :
- Texte principal (gray-900)
- Texte secondaire (gray-600)
- Borders (gray-200)
- Backgrounds (gray-50)
- Disabled states (gray-400)

---

## 🌈 Gradient Usage

### Primary Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Où l'utiliser** :
- Hero sections
- Dashboard headers
- Premium features
- Call-to-actions
- Banners

### Subtle Gradient (Backgrounds)
```css
background: linear-gradient(to bottom right, #eff6ff, #f3f4f6);
```

**Où l'utiliser** :
- Page backgrounds
- Section separators
- Cards subtiles

---

# 5. SPACING & LAYOUT

## 📐 Grid System

### Container Widths
```css
--container-sm:  640px;   /* Mobile */
--container-md:  768px;   /* Tablet */
--container-lg:  1024px;  /* Desktop */
--container-xl:  1280px;  /* Large Desktop */
--container-2xl: 1536px;  /* Extra Large */
```

### Standard Container
```css
max-width: var(--container-xl);  /* 1280px */
margin: 0 auto;
padding: 0 var(--space-4);       /* 16px */
```

### Grid Columns
```css
/* 12-column grid */
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: var(--space-6);  /* 24px */
```

---

## 📏 Spacing Guidelines

### Component Internal Spacing
- **Buttons** : padding: 12px 24px
- **Cards** : padding: 24px
- **Forms** : gap between fields: 16px
- **Sections** : margin-bottom: 48px

### Page Layout Spacing
- **Header height** : 80px
- **Footer height** : auto (min 200px)
- **Section padding** : 64px vertical
- **Container padding** : 16px horizontal

---

# 6. COMPONENTS LIBRARY

## 🔘 Buttons

### Primary Button
```html
<button class="btn-primary">
  Action Principale
</button>
```

```css
.btn-primary {
  background: var(--primary-600);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: var(--transition-all);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
  transform: none;
}
```

### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--primary-600);
  border: 2px solid var(--primary-600);
  /* ... rest similar to primary */
}

.btn-secondary:hover {
  background: var(--primary-50);
}
```

### Tertiary Button (Ghost)
```css
.btn-tertiary {
  background: transparent;
  color: var(--gray-700);
  border: none;
  /* ... */
}

.btn-tertiary:hover {
  background: var(--gray-100);
}
```

### Button Sizes
```css
/* Small */
.btn-sm {
  padding: 8px 16px;
  font-size: var(--text-sm);
}

/* Regular (default) */
.btn-md {
  padding: 12px 24px;
  font-size: var(--text-base);
}

/* Large */
.btn-lg {
  padding: 16px 32px;
  font-size: var(--text-lg);
}
```

### OAuth Buttons

#### Apple Sign In
```html
<button class="btn-oauth btn-apple">
  <i class="fab fa-apple"></i>
  Sign in with Apple
</button>
```

```css
.btn-apple {
  background: var(--apple-black);
  color: white;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  gap: 12px;
  transition: var(--transition-all);
}

.btn-apple:hover {
  background: #333;
}

.btn-apple i {
  font-size: 20px;
}
```

#### Google Sign In
```css
.btn-google {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  /* ... similar structure */
}

.btn-google i {
  color: var(--google-red);
}
```

---

## 📝 Forms

### Input Field
```html
<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email" placeholder="vous@exemple.com">
</div>
```

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);  /* 8px */
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  color: var(--gray-900);
  transition: var(--transition-all);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input::placeholder {
  color: var(--gray-400);
}

.form-group input:disabled {
  background: var(--gray-50);
  cursor: not-allowed;
}

/* Error state */
.form-group.error input {
  border-color: var(--error-600);
}

.form-group .error-message {
  font-size: var(--text-sm);
  color: var(--error-600);
}
```

---

## 🎴 Cards

### Trip Card
```html
<div class="card trip-card">
  <div class="card-header">
    <div class="route">
      <span class="city">Paris</span>
      <i class="fas fa-arrow-right"></i>
      <span class="city">Casablanca</span>
    </div>
    <span class="date">15 Jan 2026</span>
  </div>
  
  <div class="card-body">
    <div class="info">
      <span class="weight">10 kg disponibles</span>
      <span class="price">5€/kg</span>
    </div>
  </div>
  
  <div class="card-footer">
    <div class="user">
      <img src="avatar.jpg" alt="User">
      <span>Ahmed K.</span>
      <span class="rating">⭐ 4.8</span>
    </div>
    <button class="btn-primary btn-sm">Contacter</button>
  </div>
</div>
```

```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: var(--transition-all);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.route {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
}

.city {
  color: var(--gray-900);
}

.date {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.card-body {
  margin-bottom: var(--space-4);
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weight {
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.price {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--primary-600);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-200);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user img {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
}

.rating {
  font-size: var(--text-sm);
  color: var(--warning-600);
}
```

---

## 🔔 Notifications

### Success Alert
```html
<div class="alert alert-success">
  <i class="fas fa-check-circle"></i>
  <div>
    <strong>Succès !</strong>
    <p>Votre trajet a été publié avec succès.</p>
  </div>
</div>
```

```css
.alert {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
}

.alert-success {
  background: var(--success-50);
  border-color: var(--success-600);
  color: var(--success-700);
}

.alert-success i {
  color: var(--success-600);
  font-size: var(--text-xl);
}

.alert-error {
  background: var(--error-50);
  border-color: var(--error-600);
  color: var(--error-700);
}

.alert-warning {
  background: #fef3c7;
  border-color: var(--warning-600);
  color: var(--warning-700);
}

.alert strong {
  font-weight: var(--font-semibold);
  display: block;
  margin-bottom: var(--space-1);
}

.alert p {
  font-size: var(--text-sm);
  margin: 0;
}
```

---

## 🏷️ Badges

### Status Badges
```html
<span class="badge badge-success">Vérifié</span>
<span class="badge badge-warning">En attente</span>
<span class="badge badge-error">Rejeté</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-warning {
  background: #fef3c7;
  color: var(--warning-700);
}

.badge-error {
  background: var(--error-100);
  color: var(--error-700);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-gray {
  background: var(--gray-100);
  color: var(--gray-700);
}
```

---

*[Suite du Design System dans le prochain fichier...]*

---

## 📊 SUITE À VENIR

Dans les prochains fichiers :
- Navigation Components
- Modal & Overlay System
- Page Templates (Desktop & Mobile)
- User Journey Flows
- Responsive Breakpoints
- Animation Guidelines
- Accessibility Standards

---

**Temps écoulé** : 30 min  
**Progression** : 40% ✅

**Prochain fichier** : Mockups & Templates
