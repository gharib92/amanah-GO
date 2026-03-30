/**
 * AMANAH GO - Verify Profile View
 */

export function renderVerifyProfilePage() {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification du Profil - Amanah GO</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 min-h-screen">
        <nav class="bg-blue-900/50 backdrop-blur-sm border-b border-blue-700">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-white">Amanah GO</span>
                </div>
            </div>
        </nav>
        <div class="max-w-4xl mx-auto px-4 py-12">
            <div id="kycCard" class="bg-white/5 rounded-xl p-6">
                <div class="mb-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-xl p-6">
                    <h3 class="text-white font-bold text-lg">Vérification Automatique Veriff</h3>
                    <button onclick="openVeriffKyc()" id="startVeriffBtn"
                            class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg mt-4">
                        🚀 Lancer la Vérification Veriff
                    </button>
                </div>
            </div>
        </div>
        <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
        <script src="/static/auth-helper.js"></script>
        <script>
          async function openVeriffKyc() {
            console.log('🔐 Opening Veriff...');
            try {
              const token = localStorage.getItem('amanah_token');
              if (!token) {
                alert('❌ Session expirée.');
                window.location.href = '/login';
                return;
              }
              const response = await fetch('/api/kyc/veriff-session', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
              });
              const data = await response.json();
              if (!data.success) throw new Error(data.error || 'Erreur Veriff');
              const veriffWindow = window.open(data.sessionUrl, 'veriff-kyc', 'width=800,height=900');
              if (!veriffWindow) {
                alert('⚠️ Autorisez les popups.');
                return;
              }
              alert('✅ Fenêtre Veriff ouverte !');
              const checkWindow = setInterval(() => {
                if (veriffWindow.closed) {
                  clearInterval(checkWindow);
                  setTimeout(() => window.location.reload(), 2000);
                }
              }, 1000);
            } catch (error) {
              alert('❌ Erreur: ' + error.message);
            }
          }
          if (typeof window !== 'undefined') {
            window.openVeriffKyc = openVeriffKyc;
          }
        </script>
    </body>
    </html>
  `
}
