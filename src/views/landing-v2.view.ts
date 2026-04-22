/**
 * Amanah GO — Nouvelle landing (v2)
 * Refonte complète avec le design system Indigo
 * Route : /v2 (isolée, ne touche pas à /)
 */

export function renderLandingV2Page(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Amanah GO - Transport Collaboratif France ↔ Maroc | Envoi Colis Pas Cher</title>

  <!-- SEO -->
  <meta name="description" content="🚀 Transportez vos colis entre la France et le Maroc avec Amanah GO. Économisez jusqu'à 70% sur l'envoi de colis. Plateforme sécurisée de transport collaboratif peer-to-peer." />
  <meta name="keywords" content="transport colis france maroc, envoi colis maroc, transport collaboratif, amanah go, colis pas cher maroc, voyageur transporteur, expédition france maroc, MRE, diaspora marocaine" />
  <meta name="author" content="Amanah GO" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://amanah-go.com/" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://amanah-go.com/" />
  <meta property="og:title" content="Amanah GO - Transport Collaboratif France ↔ Maroc" />
  <meta property="og:description" content="Économisez jusqu'à 70% sur vos envois de colis entre la France et le Maroc. Plateforme sécurisée de transport collaboratif." />
  <meta property="og:image" content="https://amanah-go.com/static/logo-amanah-go.png" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:site_name" content="Amanah GO" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://amanah-go.com/" />
  <meta name="twitter:title" content="Amanah GO - Transport Collaboratif France ↔ Maroc" />
  <meta name="twitter:description" content="Économisez jusqu'à 70% sur vos envois de colis entre la France et le Maroc" />
  <meta name="twitter:image" content="https://amanah-go.com/static/logo-amanah-go.png" />

  <!-- PWA -->
  <meta name="theme-color" content="#667eea" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Amanah GO" />
  <link rel="manifest" href="/manifest.json" />

  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="512x512" href="/static/icons/icon-512x512.png" />
  <link rel="apple-touch-icon" href="/static/icons/icon-180x180.png" />
  <link rel="icon" sizes="192x192" href="/static/icons/icon-192x192.png" />
  <link rel="icon" sizes="512x512" href="/static/icons/icon-512x512.png" />

  <!-- Schema.org Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Amanah GO",
    "description": "Plateforme de transport collaboratif de colis entre la France et le Maroc",
    "url": "https://amanah-go.com",
    "logo": "https://amanah-go.com/static/logo-amanah-go.png",
    "foundingDate": "2025",
    "address": { "@type": "PostalAddress", "addressCountry": "FR" },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@amanah-go.com",
      "availableLanguage": ["French", "Arabic", "English"]
    },
    "sameAs": [
      "https://facebook.com/amanahgo",
      "https://twitter.com/amanahgo",
      "https://instagram.com/amanahgo"
    ]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Amanah GO",
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }
  </script>

  <!-- Styles -->
  <link rel="stylesheet" href="/static/tailwind.css" />
  <link rel="stylesheet" href="/static/i18n.css?v=3" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
  <style>
    html { scroll-behavior: smooth; }
    .float-animation { animation: float 6s ease-in-out infinite; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    .fade-in-up { animation: fadeInUp 0.8s ease-out; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  </style>
</head>
<body class="bg-white text-slate-900 font-sans antialiased">

  <!-- ===== NAV ===== -->
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
          <span class="text-white font-bold text-lg">A</span>
        </div>
        <div>
          <div class="font-bold text-lg leading-tight">Amanah GO</div>
          <div class="text-xs text-slate-500 -mt-0.5">France ↔ Maroc</div>
        </div>
      </a>

      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
        <a href="#comment" class="hover:text-brand transition" data-i18n="nav.how_it_works">Comment ça marche</a>
        <a href="#securite" class="hover:text-brand transition" data-i18n="nav.security">Sécurité</a>
        <a href="#tarifs" class="hover:text-brand transition" data-i18n="nav.pricing">Tarifs</a>
        <a href="/prohibited-items" class="hover:text-brand transition" data-i18n="nav.prohibited_items">Liste noire</a>
        <a href="#faq" class="hover:text-brand transition">FAQ</a>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sélecteur de langue desktop -->
        <div id="langSwitcher" class="hidden sm:block"></div>
        <a href="/login" class="hidden sm:inline text-sm font-semibold text-slate-700 hover:text-brand transition" data-i18n="common.login">Se connecter</a>
        <a href="/signup" class="hidden sm:inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-brand hover:bg-primary-600 transition" data-i18n="common.signup">
          Créer un compte
        </a>
        <!-- Mobile burger -->
        <button id="mobile-toggle" class="md:hidden w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center" aria-label="Menu">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 bg-white">
      <div class="px-6 py-4 flex flex-col gap-3 text-sm font-medium">
        <a href="#comment" class="py-2 text-slate-700 hover:text-brand" data-i18n="nav.how_it_works">Comment ça marche</a>
        <a href="#securite" class="py-2 text-slate-700 hover:text-brand" data-i18n="nav.security">Sécurité</a>
        <a href="#tarifs" class="py-2 text-slate-700 hover:text-brand" data-i18n="nav.pricing">Tarifs</a>
        <a href="/prohibited-items" class="py-2 text-slate-700 hover:text-brand" data-i18n="nav.prohibited_items">Liste noire</a>
        <a href="#faq" class="py-2 text-slate-700 hover:text-brand">FAQ</a>
        <div id="langSwitcherMobile" class="py-2"></div>
        <div class="border-t border-slate-100 pt-3 flex flex-col gap-2">
          <a href="/login" class="py-2 text-slate-700" data-i18n="common.login">Se connecter</a>
          <a href="/signup" class="px-4 py-2.5 rounded-xl bg-primary text-white text-center font-semibold" data-i18n="common.signup">Créer un compte</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- ===== HERO ===== -->
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-brand-soft"></div>
    <div class="absolute top-20 -left-20 w-96 h-96 rounded-full bg-primary-200/40 blur-3xl"></div>
    <div class="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-primary-300/30 blur-3xl"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
      <div class="fade-in-up">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-primary-100 text-sm font-semibold text-primary-600 mb-6">
          <span class="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
          <span data-i18n="landing_v2.badge_verified">+3 500 voyageurs vérifiés ce mois</span>
        </div>

        <h1 class="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          <span data-i18n="landing_v2.hero_title_1">Envoyez vos colis</span><br/>
          <span class="bg-clip-text text-transparent bg-gradient-brand" data-i18n="landing_v2.hero_title_2">en toute confiance.</span>
        </h1>

        <p class="text-lg md:text-xl text-slate-600 mb-8 max-w-xl" data-i18n="landing_v2.hero_subtitle">
          La plateforme qui connecte les voyageurs France ↔ Maroc avec ceux qui veulent envoyer un colis. Jusqu'à 70% moins cher que les transporteurs classiques.
        </p>

        <div class="flex flex-wrap gap-3 mb-10">
          <a href="/voyageur" class="group px-6 py-4 rounded-xl bg-primary text-white font-bold shadow-brand hover:bg-primary-600 transition flex items-center gap-2">
            <i class="fa-solid fa-plane-departure"></i>
            <span data-i18n="landing_v2.cta_traveler">Je voyage & je transporte</span>
            <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
          </a>
          <a href="/expediteur" class="group px-6 py-4 rounded-xl bg-white border-2 border-primary text-primary-600 font-bold hover:bg-primary-50 transition flex items-center gap-2">
            <i class="fa-solid fa-box"></i>
            <span data-i18n="landing_v2.cta_sender">J'envoie un colis</span>
          </a>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 mb-8">
          <div class="flex items-center gap-2">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-gradient-brand border-2 border-white"></div>
              <div class="w-8 h-8 rounded-full bg-primary-400 border-2 border-white"></div>
              <div class="w-8 h-8 rounded-full bg-primary-300 border-2 border-white"></div>
            </div>
            <span data-i18n="landing_v2.users_count">+12 000 utilisateurs</span>
          </div>
          <div class="flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-warning-500">★★★★★</span>
            <span class="font-semibold">4.8/5</span>
            <span class="text-slate-400">·&nbsp;<span data-i18n="landing_v2.reviews_count">150 avis</span></span>
          </div>
        </div>

        <!-- Connexion rapide -->
        <div class="bg-white/60 backdrop-blur rounded-2xl p-5 border border-primary-100 shadow-lg w-full max-w-md">
          <div class="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3 text-center" data-i18n="landing_v2.quick_login">Connexion rapide</div>
          <div class="grid grid-cols-3 gap-2">
            <a href="/api/auth/apple" class="flex items-center justify-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition" aria-label="Sign in with Apple">
              <i class="fa-brands fa-apple text-xl"></i>
            </a>
            <a href="/api/auth/google" class="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition" aria-label="Continuer avec Google">
              <i class="fa-brands fa-google text-red-500 text-lg"></i>
            </a>
            <a href="/api/auth/facebook" class="flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition" aria-label="Continuer avec Facebook">
              <i class="fa-brands fa-facebook text-blue-600 text-lg"></i>
            </a>
          </div>
          <div class="text-center text-xs text-slate-500 mt-3">
            <span data-i18n="common.or">ou</span> <a href="/signup" class="font-semibold text-primary-600 hover:underline" data-i18n="landing_v2.or_email_signup">inscription par email</a>
          </div>
        </div>
      </div>

      <!-- Mockup carte trajet -->
      <div class="relative">
        <div class="absolute -inset-4 bg-gradient-brand rounded-3xl blur-2xl opacity-20"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl p-6 float-animation">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-success-500"></div>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide" data-i18n="landing_v2.mockup_available">Trajet disponible</span>
            </div>
            <span class="text-xs font-mono text-slate-400">AF1234</span>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="flex-1">
              <div class="text-xs text-slate-500 font-semibold" data-i18n="landing_v2.mockup_departure">DÉPART</div>
              <div class="text-2xl font-bold">Paris</div>
              <div class="text-sm text-slate-500">CDG · 13:20</div>
            </div>
            <div class="flex-1 relative">
              <div class="border-t-2 border-dashed border-primary-300"></div>
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                <i class="fa-solid fa-plane text-primary-600"></i>
              </div>
            </div>
            <div class="flex-1 text-right">
              <div class="text-xs text-slate-500 font-semibold" data-i18n="landing_v2.mockup_arrival">ARRIVÉE</div>
              <div class="text-2xl font-bold">Casa</div>
              <div class="text-sm text-slate-500">CMN · 15:45</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-primary-50 rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500" data-i18n="landing_v2.mockup_capacity">Capacité</div>
              <div class="font-bold text-primary-700">5 kg</div>
            </div>
            <div class="bg-primary-50 rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500" data-i18n="landing_v2.mockup_price_per_kg">Prix/kg</div>
              <div class="font-bold text-primary-700">8 €</div>
            </div>
            <div class="bg-success-50 rounded-xl p-3 text-center">
              <div class="text-xs text-slate-500" data-i18n="landing_v2.mockup_saving">Éco</div>
              <div class="font-bold text-success-700">-65%</div>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div class="w-11 h-11 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold">Y</div>
            <div class="flex-1">
              <div class="font-semibold text-sm flex items-center gap-1.5">
                Youssef B.
                <i class="fa-solid fa-circle-check text-success-500 text-xs"></i>
              </div>
              <div class="text-xs text-slate-500">★ 4.9 · 23 <span data-i18n="landing_v2.mockup_trips">trajets</span></div>
            </div>
            <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-600 transition" data-i18n="landing_v2.mockup_reserve">Réserver</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== TRUST BAR ===== -->
  <section class="border-y border-slate-200 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-brand">3.5M+</div>
        <div class="text-sm text-slate-600 mt-1" data-i18n="landing_v2.trust_travelers_label">voyageurs France ↔ Maroc/an</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-brand">70%</div>
        <div class="text-sm text-slate-600 mt-1" data-i18n="landing_v2.trust_savings_label">d'économies en moyenne</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-brand">100%</div>
        <div class="text-sm text-slate-600 mt-1" data-i18n="landing_v2.trust_security_label">paiement sécurisé</div>
      </div>
      <div class="text-center">
        <div class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-brand">48h</div>
        <div class="text-sm text-slate-600 mt-1" data-i18n="landing_v2.trust_delivery_label">délai moyen de livraison</div>
      </div>
    </div>
  </section>

  <!-- ===== COMMENT ÇA MARCHE ===== -->
  <section id="comment" class="py-24">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3" data-i18n="landing_v2.how_eyebrow">Comment ça marche</div>
        <h2 class="text-3xl md:text-5xl font-bold mb-4" data-i18n="landing_v2.how_title">Trois étapes, zéro friction.</h2>
        <p class="text-lg text-slate-600" data-i18n="landing_v2.how_subtitle">Que vous voyagiez ou envoyiez un colis, le processus est le même : simple, rapide, sécurisé.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Étape 1 -->
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-brand rounded-3xl opacity-0 group-hover:opacity-100 blur transition"></div>
          <div class="relative bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition h-full">
            <div class="text-7xl font-bold bg-clip-text text-transparent bg-gradient-brand mb-6 opacity-30">1</div>
            <div class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
              <i class="fa-solid fa-user-plus text-primary-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2" data-i18n="landing_v2.how_step1_title">Créez votre profil</h3>
            <p class="text-slate-600" data-i18n="landing_v2.how_step1_desc">Vérification d'identité en 2 minutes. KYC sécurisé avec pièce d'identité + selfie.</p>
          </div>
        </div>
        <!-- Étape 2 -->
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-brand rounded-3xl opacity-0 group-hover:opacity-100 blur transition"></div>
          <div class="relative bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition h-full">
            <div class="text-7xl font-bold bg-clip-text text-transparent bg-gradient-brand mb-6 opacity-30">2</div>
            <div class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
              <i class="fa-solid fa-handshake text-primary-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2" data-i18n="landing_v2.how_step2_title">Trouvez votre match</h3>
            <p class="text-slate-600" data-i18n="landing_v2.how_step2_desc">Publiez un trajet ou un colis. Notre algorithme vous connecte avec la meilleure option disponible.</p>
          </div>
        </div>
        <!-- Étape 3 -->
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-brand rounded-3xl opacity-0 group-hover:opacity-100 blur transition"></div>
          <div class="relative bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition h-full">
            <div class="text-7xl font-bold bg-clip-text text-transparent bg-gradient-brand mb-6 opacity-30">3</div>
            <div class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
              <i class="fa-solid fa-shield-halved text-primary-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2" data-i18n="landing_v2.how_step3_title">Livraison protégée</h3>
            <p class="text-slate-600" data-i18n="landing_v2.how_step3_desc">Paiement en séquestre. Libéré uniquement à la livraison validée par les deux parties.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SÉCURITÉ ===== -->
  <section id="securite" class="py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div class="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3" data-i18n="landing_v2.security_eyebrow">Sécurité</div>
          <h2 class="text-3xl md:text-5xl font-bold mb-6" data-i18n="landing_v2.security_title">La confiance, notre priorité absolue.</h2>
          <p class="text-lg text-slate-600 mb-8" data-i18n="landing_v2.security_subtitle">
            Chaque transaction est protégée par 4 couches de sécurité. Votre argent et vos colis sont entre de bonnes mains.
          </p>

          <div class="space-y-4">
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-id-card text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold" data-i18n="landing_v2.sec_kyc_title">Vérification KYC obligatoire</div>
                <div class="text-sm text-slate-600" data-i18n="landing_v2.sec_kyc_desc">Pièce d'identité + reconnaissance faciale</div>
              </div>
            </div>
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-lock text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold" data-i18n="landing_v2.sec_escrow_title">Paiement en séquestre sécurisé</div>
                <div class="text-sm text-slate-600" data-i18n="landing_v2.sec_escrow_desc">Fonds bloqués jusqu'à la livraison confirmée</div>
              </div>
            </div>
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-star text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold" data-i18n="landing_v2.sec_reviews_title">Système d'avis vérifiés</div>
                <div class="text-sm text-slate-600" data-i18n="landing_v2.sec_reviews_desc">Uniquement d'utilisateurs ayant voyagé ensemble</div>
              </div>
            </div>
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-ban text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold" data-i18n="landing_v2.sec_blacklist_title">Liste noire de produits</div>
                <div class="text-sm text-slate-600" data-i18n="landing_v2.sec_blacklist_desc">Contrôle automatique des objets interdits</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Illustration / Visual -->
        <div class="relative">
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center">
                <i class="fa-solid fa-shield-halved text-white text-lg"></i>
              </div>
              <div>
                <div class="font-bold">Transaction #A-2841</div>
                <div class="text-xs text-slate-500">Paris → Casablanca · 5 kg</div>
              </div>
            </div>

            <div class="space-y-3 mb-6">
              <div class="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100">
                <i class="fa-solid fa-check-circle text-success-600"></i>
                <div class="text-sm flex-1">
                  <div class="font-semibold text-success-700" data-i18n="landing_v2.status_verified_id">Identité vérifiée</div>
                  <div class="text-xs text-success-700/70">Youssef B. · KYC validé</div>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100">
                <i class="fa-solid fa-check-circle text-success-600"></i>
                <div class="text-sm flex-1">
                  <div class="font-semibold text-success-700" data-i18n="landing_v2.status_payment_locked">Paiement bloqué</div>
                  <div class="text-xs text-success-700/70" data-i18n="landing_v2.status_payment_locked_desc">45 € en séquestre sécurisé</div>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl bg-warning-50 border border-warning-100">
                <i class="fa-solid fa-clock text-warning-600"></i>
                <div class="text-sm flex-1">
                  <div class="font-semibold text-warning-700" data-i18n="landing_v2.status_in_transit">En transit</div>
                  <div class="text-xs text-warning-700/70" data-i18n="landing_v2.status_in_transit_desc">Vol AF1234 · départ dans 2h</div>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-60">
                <i class="fa-regular fa-circle text-slate-400"></i>
                <div class="text-sm flex-1">
                  <div class="font-semibold text-slate-500" data-i18n="landing_v2.status_release">Livraison & libération</div>
                  <div class="text-xs text-slate-400" data-i18n="landing_v2.status_release_desc">À la réception confirmée</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CALCULATEUR ===== -->
  <section id="tarifs" class="py-24">
    <div class="max-w-4xl mx-auto px-6 text-center mb-12">
      <div class="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3" data-i18n="landing_v2.pricing_eyebrow">Tarifs</div>
      <h2 class="text-3xl md:text-5xl font-bold mb-4" data-i18n="landing_v2.pricing_title">Calculez votre économie</h2>
      <p class="text-lg text-slate-600" data-i18n="landing_v2.pricing_subtitle">Comparez Amanah GO avec les transporteurs classiques.</p>
    </div>

    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10">
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2" data-i18n="landing_v2.pricing_weight_label">Poids du colis (kg)</label>
            <input id="calc-weight" type="number" value="5" min="1" max="30" step="0.5"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition text-lg font-semibold" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2" data-i18n="landing_v2.pricing_price_label">Prix voyageur (€/kg)</label>
            <input id="calc-price" type="number" value="8" min="3" max="30" step="0.5"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition text-lg font-semibold" />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-2xl p-6 bg-gradient-brand text-white">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <i class="fa-solid fa-plane"></i>
              </div>
              <span class="font-bold">Amanah GO</span>
            </div>
            <div class="text-4xl font-bold mb-1"><span id="calc-amanah">40</span> €</div>
            <div class="text-sm opacity-80" data-i18n="landing_v2.pricing_delivery_time">Livraison 24-48h · paiement sécurisé</div>
          </div>
          <div class="rounded-2xl p-6 bg-slate-100 border border-slate-200">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center">
                <i class="fa-solid fa-truck text-slate-600"></i>
              </div>
              <span class="font-bold text-slate-700">DHL / Chronopost</span>
            </div>
            <div class="text-4xl font-bold mb-1 text-slate-500 line-through"><span id="calc-dhl">120</span> €</div>
            <div class="text-sm text-slate-500" data-i18n="landing_v2.pricing_competitor_time">3-5 jours</div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3 text-lg">
          <i class="fa-solid fa-arrow-down text-success-500"></i>
          <span data-i18n="landing_v2.pricing_saving">Vous économisez</span>
          <span class="text-3xl font-bold text-success-600"><span id="calc-saving">80</span> €</span>
          <span class="text-slate-500">(<span id="calc-percent">66</span>%)</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== FAQ ===== -->
  <section id="faq" class="py-24 bg-slate-50">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-12">
        <div class="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">FAQ</div>
        <h2 class="text-3xl md:text-5xl font-bold mb-4" data-i18n="landing_v2.faq_title">Questions fréquentes</h2>
        <p class="text-lg text-slate-600" data-i18n="landing_v2.faq_subtitle">Tout ce que vous devez savoir avant de commencer.</p>
      </div>

      <div class="space-y-3">
        <details class="group bg-white rounded-2xl border border-slate-200 p-6 open:shadow-lg transition">
          <summary class="flex items-center justify-between cursor-pointer font-semibold text-lg">
            <span data-i18n="landing_v2.faq_q1">Comment fonctionne le paiement sécurisé ?</span>
            <i class="fa-solid fa-chevron-down text-primary-600 group-open:rotate-180 transition"></i>
          </summary>
          <p class="text-slate-600 mt-4" data-i18n="landing_v2.faq_a1">Votre paiement est mis en séquestre dès la réservation. Le voyageur ne reçoit les fonds qu'après la confirmation de livraison par les deux parties. Aucun risque de perte.</p>
        </details>

        <details class="group bg-white rounded-2xl border border-slate-200 p-6 open:shadow-lg transition">
          <summary class="flex items-center justify-between cursor-pointer font-semibold text-lg">
            <span data-i18n="landing_v2.faq_q2">Quels types de colis puis-je envoyer ?</span>
            <i class="fa-solid fa-chevron-down text-primary-600 group-open:rotate-180 transition"></i>
          </summary>
          <p class="text-slate-600 mt-4" data-i18n="landing_v2.faq_a2">Tous les objets légaux et conformes aux régulations douanières France ↔ Maroc. Consultez notre liste noire pour les produits interdits (médicaments sans ordonnance, produits dangereux, etc.).</p>
        </details>

        <details class="group bg-white rounded-2xl border border-slate-200 p-6 open:shadow-lg transition">
          <summary class="flex items-center justify-between cursor-pointer font-semibold text-lg">
            <span data-i18n="landing_v2.faq_q3">Comment sont vérifiés les voyageurs ?</span>
            <i class="fa-solid fa-chevron-down text-primary-600 group-open:rotate-180 transition"></i>
          </summary>
          <p class="text-slate-600 mt-4" data-i18n="landing_v2.faq_a3">Chaque voyageur passe une vérification KYC : pièce d'identité officielle + reconnaissance faciale. Seuls les profils validés peuvent proposer des trajets.</p>
        </details>

        <details class="group bg-white rounded-2xl border border-slate-200 p-6 open:shadow-lg transition">
          <summary class="flex items-center justify-between cursor-pointer font-semibold text-lg">
            <span data-i18n="landing_v2.faq_q4">Combien ça coûte réellement ?</span>
            <i class="fa-solid fa-chevron-down text-primary-600 group-open:rotate-180 transition"></i>
          </summary>
          <p class="text-slate-600 mt-4" data-i18n="landing_v2.faq_a4">L'inscription et la publication d'annonces sont gratuites. Une petite commission de service est prélevée uniquement sur les transactions confirmées. Économie moyenne vs DHL/Chronopost : 60 à 70 %.</p>
        </details>

        <details class="group bg-white rounded-2xl border border-slate-200 p-6 open:shadow-lg transition">
          <summary class="flex items-center justify-between cursor-pointer font-semibold text-lg">
            <span data-i18n="landing_v2.faq_q5">Que faire si mon colis n'arrive pas ?</span>
            <i class="fa-solid fa-chevron-down text-primary-600 group-open:rotate-180 transition"></i>
          </summary>
          <p class="text-slate-600 mt-4" data-i18n="landing_v2.faq_a5">Grâce au paiement en séquestre, vous êtes intégralement remboursé si la livraison n'a pas lieu. Notre équipe de support peut aussi intervenir en cas de litige.</p>
        </details>
      </div>

      <div class="text-center mt-8">
        <a href="mailto:contact@amanahgo.app" class="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline">
          <i class="fa-solid fa-envelope"></i>
          <span data-i18n="landing_v2.faq_contact">Contacter le support pour d'autres questions</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ===== CTA FINAL ===== -->
  <section class="relative py-24 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-brand"></div>
    <div class="absolute inset-0 opacity-20" style="background-image:radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px);background-size:50px 50px"></div>

    <div class="relative max-w-4xl mx-auto px-6 text-center text-white">
      <h2 class="text-3xl md:text-5xl font-bold mb-6" data-i18n="landing_v2.final_cta_title">Prêt à voyager malin ?</h2>
      <p class="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto" data-i18n="landing_v2.final_cta_subtitle">
        Rejoignez les milliers d'utilisateurs qui ont déjà simplifié leurs envois France ↔ Maroc.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/signup" class="px-8 py-4 rounded-xl bg-white text-primary-600 font-bold text-lg shadow-xl hover:scale-105 transition" data-i18n="landing_v2.final_cta_button">
          Créer mon compte gratuit
        </a>
        <a href="#comment" class="px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-lg border border-white/30 hover:bg-white/20 transition" data-i18n="landing_v2.final_cta_secondary">
          En savoir plus
        </a>
      </div>
      <p class="text-sm opacity-70 mt-6" data-i18n="landing_v2.final_cta_terms">Inscription gratuite · Sans engagement · Annulable à tout moment</p>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer class="bg-slate-900 text-slate-400">
    <div class="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-8">
      <div class="md:col-span-2">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <span class="text-white font-bold">A</span>
          </div>
          <div class="font-bold text-white text-lg">Amanah GO</div>
        </div>
        <p class="text-sm max-w-md" data-i18n="landing_v2.footer_tagline">
          La plateforme de confiance pour le transport collaboratif de colis entre la France et le Maroc.
        </p>
      </div>
      <div>
        <div class="font-semibold text-white mb-4" data-i18n="landing_v2.footer_product">Produit</div>
        <ul class="space-y-2 text-sm">
          <li><a href="/voyageur" class="hover:text-white" data-i18n="nav.traveler_space">Espace voyageur</a></li>
          <li><a href="/expediteur" class="hover:text-white" data-i18n="nav.sender_space">Espace expéditeur</a></li>
          <li><a href="#tarifs" class="hover:text-white" data-i18n="nav.pricing">Tarifs</a></li>
          <li><a href="#securite" class="hover:text-white" data-i18n="nav.security">Sécurité</a></li>
        </ul>
      </div>
      <div>
        <div class="font-semibold text-white mb-4" data-i18n="landing_v2.footer_legal">Légal</div>
        <ul class="space-y-2 text-sm">
          <li><a href="/cgu" class="hover:text-white" data-i18n="landing.footer_toc">CGU</a></li>
          <li><a href="/confidentialite" class="hover:text-white" data-i18n="landing.footer_privacy">Confidentialité</a></li>
          <li><a href="/mentions-legales" class="hover:text-white">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div>© 2026 Amanah GO · Tous droits réservés</div>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white"><i class="fa-brands fa-facebook text-lg"></i></a>
          <a href="#" class="hover:text-white"><i class="fa-brands fa-instagram text-lg"></i></a>
          <a href="#" class="hover:text-white"><i class="fa-brands fa-twitter text-lg"></i></a>
        </div>
      </div>
    </div>
  </footer>

  <!-- ===== i18n ===== -->
  <script src="/static/i18n.js?v=3"></script>
  <script>
    // Language switcher — reprend le mécanisme existant
    function createLanguageSwitcher() {
      const currentLang = (window.i18n && window.i18n.getCurrentLang) ? window.i18n.getCurrentLang() : 'fr';
      const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇲🇦' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
      ];
      const current = languages.find(l => l.code === currentLang) || languages[0];
      return \`
        <div class="lang-switcher">
          <button class="lang-switcher-minimal" id="langSwitcherBtn" title="\${current.name}" type="button">
            <span class="lang-flag-only">\${current.flag}</span>
          </button>
          <div class="lang-switcher-dropdown" id="langDropdown">
            \${languages.map(lang => \`
              <div class="lang-option \${lang.code === currentLang ? 'active' : ''}" data-lang="\${lang.code}">
                <span class="lang-flag">\${lang.flag}</span>
                <span>\${lang.name}</span>
                \${lang.code === currentLang ? '<i class="fas fa-check ml-auto text-primary-600"></i>' : ''}
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }
    function attachLanguageSwitcherEvents(container) {
      const btn = container.querySelector('#langSwitcherBtn');
      if (btn) btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('#langDropdown').forEach(d => d.classList.toggle('show'));
      });
      container.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
          const lang = option.getAttribute('data-lang');
          if (lang && window.i18n) window.i18n.setLanguage(lang);
        });
      });
    }
    document.addEventListener('click', (e) => {
      const switcher = document.querySelector('.lang-switcher');
      const dropdown = document.getElementById('langDropdown');
      if (switcher && dropdown && !switcher.contains(e.target)) dropdown.classList.remove('show');
    });

    // Init i18n (safe : si erreur, page reste en FR hardcodé)
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        if (window.i18n && window.i18n.init) {
          await window.i18n.init();
          // Inject switchers
          const desktopEl = document.getElementById('langSwitcher');
          const mobileEl = document.getElementById('langSwitcherMobile');
          if (desktopEl) { desktopEl.innerHTML = createLanguageSwitcher(); attachLanguageSwitcherEvents(desktopEl); }
          if (mobileEl)  { mobileEl.innerHTML  = createLanguageSwitcher(); attachLanguageSwitcherEvents(mobileEl); }
          // Apply translations (uniquement si une traduction existe pour la clé)
          document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && window.t) {
              const value = window.t(key);
              if (value && value !== key) el.textContent = value;
            }
          });
        }
      } catch (err) {
        console.warn('i18n init failed, falling back to FR:', err);
      }
    });
  </script>

  <!-- ===== JS ===== -->
  <script>
    // Calculateur
    function updateCalc() {
      const w = parseFloat(document.getElementById('calc-weight').value) || 0;
      const p = parseFloat(document.getElementById('calc-price').value) || 0;
      const amanah = Math.round(w * p);
      const dhl = Math.round(w * 24);
      const saving = dhl - amanah;
      const percent = dhl > 0 ? Math.round((saving / dhl) * 100) : 0;
      document.getElementById('calc-amanah').textContent = amanah;
      document.getElementById('calc-dhl').textContent = dhl;
      document.getElementById('calc-saving').textContent = saving;
      document.getElementById('calc-percent').textContent = percent;
    }
    document.getElementById('calc-weight').addEventListener('input', updateCalc);
    document.getElementById('calc-price').addEventListener('input', updateCalc);
    updateCalc();

    // Menu mobile
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      const icon = toggle.querySelector('i');
      icon.className = menu.classList.contains('hidden') ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
    });
    // Fermer le menu au clic sur un lien
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.add('hidden');
      toggle.querySelector('i').className = 'fa-solid fa-bars';
    }));
  </script>

</body>
</html>`
}
