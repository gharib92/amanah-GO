/**
 * Page de test isolée — démo du nouveau design system Amanah GO
 * Route : /design-preview (à ne pas exposer en production)
 */

export function renderDesignPreviewPage(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Amanah GO — Design Preview</title>
  <link rel="stylesheet" href="/static/tailwind.css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-neutral-50 font-sans text-neutral-900 antialiased">

  <!-- HEADER -->
  <header class="bg-white border-b border-neutral-200">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold shadow-brand">
          A
        </div>
        <div>
          <div class="font-bold text-lg leading-tight">Amanah GO</div>
          <div class="text-xs text-neutral-500">Design System Preview</div>
        </div>
      </div>
      <nav class="flex items-center gap-6 text-sm font-medium">
        <a href="#" class="text-neutral-600 hover:text-brand">Trajets</a>
        <a href="#" class="text-neutral-600 hover:text-brand">Colis</a>
        <a href="#" class="text-neutral-600 hover:text-brand">Comment ça marche</a>
        <button class="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-600 transition">
          Se connecter
        </button>
      </nav>
    </div>
  </header>

  <!-- HERO -->
  <section class="bg-gradient-brand text-white">
    <div class="max-w-6xl mx-auto px-6 py-16">
      <div class="max-w-2xl">
        <div class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide uppercase mb-4">
          Transport collaboratif France ↔ Maroc
        </div>
        <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Envoyez vos colis<br/>en toute confiance
        </h1>
        <p class="text-lg opacity-90 mb-8">
          Connectez-vous avec des voyageurs vérifiés qui transportent vos paquets à petit prix.
        </p>
        <div class="flex flex-wrap gap-3">
          <button class="px-6 py-3 rounded-xl bg-white text-primary-600 font-bold shadow-lg hover:shadow-xl transition">
            Envoyer un colis
          </button>
          <button class="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition">
            Devenir voyageur
          </button>
        </div>
      </div>
    </div>
  </section>

  <main class="max-w-6xl mx-auto px-6 py-12 space-y-12">

    <!-- SECTION: CARTES TRAJETS -->
    <section>
      <h2 class="text-2xl font-bold mb-1">Trajets disponibles</h2>
      <p class="text-neutral-500 mb-6">Exemple de cartes avec les nouvelles couleurs</p>

      <div class="grid md:grid-cols-2 gap-5">
        <!-- Card 1 -->
        <article class="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-xs font-bold uppercase tracking-wide text-brand mb-1">Vol direct</div>
              <div class="text-xl font-bold">Paris → Casablanca</div>
              <div class="text-sm text-neutral-500 mt-1">Vol AF1234 · 22 avr 2026 · 13h20</div>
            </div>
            <span class="px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold">
              5 kg dispo
            </span>
          </div>
          <div class="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <div class="w-10 h-10 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold">
              Y
            </div>
            <div class="flex-1">
              <div class="font-semibold text-sm">Youssef B.</div>
              <div class="text-xs text-neutral-500">⭐ 4.9 · 23 trajets effectués</div>
            </div>
            <button class="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-600 transition">
              Réserver
            </button>
          </div>
        </article>

        <!-- Card 2 -->
        <article class="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-xs font-bold uppercase tracking-wide text-brand mb-1">Avec escale</div>
              <div class="text-xl font-bold">Lyon → Marrakech</div>
              <div class="text-sm text-neutral-500 mt-1">Vol AT781 · 25 avr 2026 · 08h00</div>
            </div>
            <span class="px-3 py-1 rounded-full bg-warning-100 text-warning-700 text-xs font-semibold">
              2 kg restants
            </span>
          </div>
          <div class="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <div class="w-10 h-10 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold">
              S
            </div>
            <div class="flex-1">
              <div class="font-semibold text-sm">Sarah M.</div>
              <div class="text-xs text-neutral-500">⭐ 4.7 · 12 trajets effectués</div>
            </div>
            <button class="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-600 transition">
              Réserver
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- SECTION: NOTIFICATIONS / ÉTATS -->
    <section>
      <h2 class="text-2xl font-bold mb-1">Notifications & états</h2>
      <p class="text-neutral-500 mb-6">Utilisation des couleurs sémantiques</p>

      <div class="space-y-3">
        <div class="flex items-center gap-3 p-4 rounded-xl bg-success-50 border border-success-100">
          <div class="w-8 h-8 rounded-full bg-success-500 text-white flex items-center justify-center font-bold">✓</div>
          <div class="flex-1">
            <div class="font-semibold text-success-700">Paiement validé</div>
            <div class="text-sm text-success-700/70">Votre réservation de 45€ a bien été confirmée</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 rounded-xl bg-warning-50 border border-warning-100">
          <div class="w-8 h-8 rounded-full bg-warning-500 text-white flex items-center justify-center font-bold">!</div>
          <div class="flex-1">
            <div class="font-semibold text-warning-700">KYC en cours de vérification</div>
            <div class="text-sm text-warning-700/70">Nous examinons vos documents, délai estimé : 24h</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 rounded-xl bg-danger-50 border border-danger-100">
          <div class="w-8 h-8 rounded-full bg-danger-500 text-white flex items-center justify-center font-bold">✕</div>
          <div class="flex-1">
            <div class="font-semibold text-danger-700">Document illisible</div>
            <div class="text-sm text-danger-700/70">Merci de re-prendre la photo de votre pièce d'identité</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 rounded-xl bg-info-50 border border-info-100">
          <div class="w-8 h-8 rounded-full bg-info-500 text-white flex items-center justify-center font-bold">i</div>
          <div class="flex-1">
            <div class="font-semibold text-info-700">Nouveau message</div>
            <div class="text-sm text-info-700/70">Youssef B. vous a envoyé un message concernant votre colis</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: BOUTONS -->
    <section>
      <h2 class="text-2xl font-bold mb-1">Boutons</h2>
      <p class="text-neutral-500 mb-6">Variantes disponibles</p>

      <div class="bg-white rounded-2xl p-6 border border-neutral-200">
        <div class="flex flex-wrap gap-3">
          <button class="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-600 transition">Primaire</button>
          <button class="px-5 py-2.5 rounded-lg bg-white text-primary border-2 border-primary font-semibold hover:bg-primary-50 transition">Secondaire</button>
          <button class="px-5 py-2.5 rounded-lg bg-success-600 text-white font-semibold hover:bg-success-700 transition">Valider</button>
          <button class="px-5 py-2.5 rounded-lg bg-danger-600 text-white font-semibold hover:bg-danger-700 transition">Supprimer</button>
          <button class="px-5 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200 transition">Neutre</button>
          <button class="px-5 py-2.5 rounded-lg bg-gradient-brand text-white font-semibold shadow-brand hover:shadow-xl transition">Gradient</button>
        </div>
      </div>
    </section>

    <!-- SECTION: STATS -->
    <section>
      <h2 class="text-2xl font-bold mb-1">Statistiques</h2>
      <p class="text-neutral-500 mb-6">Exemple de KPIs dashboard</p>

      <div class="grid md:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-neutral-200">
          <div class="text-sm text-neutral-500 mb-1">Trajets actifs</div>
          <div class="text-3xl font-bold text-primary">1 247</div>
          <div class="text-xs text-success-600 mt-1">↑ 12% ce mois</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-neutral-200">
          <div class="text-sm text-neutral-500 mb-1">Colis livrés</div>
          <div class="text-3xl font-bold text-primary">3 892</div>
          <div class="text-xs text-success-600 mt-1">↑ 8% ce mois</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-neutral-200">
          <div class="text-sm text-neutral-500 mb-1">Utilisateurs</div>
          <div class="text-3xl font-bold text-primary">12 540</div>
          <div class="text-xs text-success-600 mt-1">↑ 23% ce mois</div>
        </div>
        <div class="bg-gradient-brand rounded-2xl p-5 text-white">
          <div class="text-sm opacity-80 mb-1">Note moyenne</div>
          <div class="text-3xl font-bold">4.8 ★</div>
          <div class="text-xs opacity-80 mt-1">sur 2 341 avis</div>
        </div>
      </div>
    </section>

    <!-- AVERTISSEMENT -->
    <div class="mt-16 p-5 rounded-xl bg-info-50 border border-info-100 text-sm text-info-700">
      <strong>⚠️ Page de test isolée.</strong> Cette page utilise uniquement le nouveau design system.
      Le reste du site est inchangé pour l'instant.
    </div>

  </main>

  <footer class="mt-12 py-8 bg-neutral-900 text-neutral-400 text-center text-sm">
    Amanah GO · Design System v1 · Teal
  </footer>

</body>
</html>`
}
