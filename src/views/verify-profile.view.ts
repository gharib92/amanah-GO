export function renderVerifyProfilePage() {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification du Profil - Amanah GO</title>
        <link rel="stylesheet" href="/static/tailwind.css">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-slate-50 min-h-screen font-sans">
        <!-- Header -->
        <nav class="bg-white border-b border-slate-200 sticky top-0 z-10">
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
                <a href="/voyageur" class="text-sm font-semibold text-slate-600 hover:text-brand transition inline-flex items-center gap-2">
                    <i class="fas fa-arrow-left"></i>Retour
                </a>
            </div>
        </nav>

        <!-- Hero bandeau -->
        <section class="relative overflow-hidden bg-gradient-brand-soft border-b border-primary-100">
            <div class="absolute top-0 -left-20 w-64 h-64 rounded-full bg-primary-200/40 blur-3xl"></div>
            <div class="absolute bottom-0 -right-20 w-64 h-64 rounded-full bg-primary-300/30 blur-3xl"></div>
            <div class="relative max-w-3xl mx-auto px-6 py-12 text-center">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-primary-100 text-xs font-bold uppercase tracking-widest text-primary-600 mb-4">
                    <i class="fas fa-shield-halved"></i>
                    Vérification d'identité
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Vérification du Profil</h1>
                <p class="text-slate-600 max-w-xl mx-auto">Soumettez votre selfie et pièce d'identité pour valider votre compte. Délai moyen : <strong class="text-slate-900">24h</strong>.</p>
            </div>
        </section>

        <div class="max-w-3xl mx-auto px-6 py-10">

            <!-- Statut KYC (déjà vérifié) -->
            <div id="kycStatus" class="bg-white rounded-2xl border border-success-100 p-8 mb-6 text-center hidden shadow-lg">
                <div class="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check-circle text-success-600 text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-slate-900 mb-2">Profil déjà vérifié !</h3>
                <p class="text-slate-600">Votre identité a été validée avec succès.</p>
            </div>

            <!-- Formulaire KYC -->
            <div id="kycForm" class="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
                <div class="grid md:grid-cols-2 gap-5">
                    <!-- Selfie -->
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-primary-200 transition">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                <i class="fas fa-camera text-primary-600 text-sm"></i>
                            </div>
                            <h4 class="font-bold text-slate-900">Étape 1 : Selfie</h4>
                        </div>
                        <div class="border-2 border-dashed border-primary-200 rounded-xl mb-4 overflow-hidden bg-white" style="height:200px">
                            <video id="selfieVideo" class="w-full h-full object-cover hidden" autoplay playsinline></video>
                            <canvas id="selfieCanvas" class="hidden"></canvas>
                            <img id="selfiePreview" class="w-full h-full object-cover hidden" alt="Selfie">
                            <div id="selfieEmpty" class="flex flex-col items-center justify-center h-full text-slate-400">
                                <i class="fas fa-camera text-4xl mb-2 text-primary-400"></i>
                                <p class="text-sm font-medium">Prenez un selfie</p>
                            </div>
                        </div>
                        <button onclick="startCamera()" id="startCameraBtn"
                                class="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-brand inline-flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-camera"></i>Ouvrir la caméra
                        </button>
                        <button onclick="takeSelfie()" id="takeSelfieBtn"
                                class="w-full bg-success-600 hover:bg-success-700 text-white px-4 py-2.5 rounded-xl font-semibold transition hidden inline-flex items-center justify-center gap-2">
                            <i class="fas fa-circle"></i>Prendre la photo
                        </button>
                        <div id="selfieStatus" class="mt-2 text-sm text-center hidden"></div>
                    </div>

                    <!-- Pièce d'identité -->
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-primary-200 transition">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                <i class="fas fa-id-card text-primary-600 text-sm"></i>
                            </div>
                            <h4 class="font-bold text-slate-900">Étape 2 : Pièce d'identité</h4>
                        </div>
                        <div class="border-2 border-dashed border-primary-200 rounded-xl mb-4 overflow-hidden bg-white" style="height:200px">
                            <img id="idPreview" class="w-full h-full object-cover hidden" alt="ID">
                            <div id="idEmpty" class="flex flex-col items-center justify-center h-full text-slate-400">
                                <i class="fas fa-id-card text-4xl mb-2 text-primary-400"></i>
                                <p class="text-sm font-medium">CIN, Passeport ou Permis</p>
                            </div>
                        </div>
                        <input type="file" id="idInput" accept="image/*" class="hidden" onchange="previewID(event)">
                        <button onclick="document.getElementById('idInput').click()"
                                class="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-brand inline-flex items-center justify-center gap-2">
                            <i class="fas fa-upload"></i>Télécharger la photo
                        </button>
                        <div id="idStatus" class="mt-2 text-sm text-center hidden"></div>
                    </div>
                </div>

                <!-- Bouton soumettre -->
                <div class="mt-8">
                    <button onclick="submitKYC()" id="submitBtn"
                            class="w-full bg-gradient-brand hover:opacity-95 text-white px-6 py-4 rounded-xl font-bold text-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-brand inline-flex items-center justify-center gap-2"
                            disabled>
                        <i class="fas fa-check"></i>Soumettre pour vérification
                    </button>
                    <p class="text-slate-500 text-sm text-center mt-3">
                        <i class="fas fa-info-circle text-primary-500 mr-1"></i>
                        Les deux documents sont requis. Notre équipe validera votre profil sous 24h.
                    </p>
                </div>

                <!-- Message résultat -->
                <div id="resultMsg" class="mt-4 hidden p-4 rounded-xl text-center font-medium"></div>
            </div>

            <!-- Info sécurité -->
            <div class="mt-6 grid md:grid-cols-3 gap-4">
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-lock text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-slate-900">Données chiffrées</div>
                        <div class="text-xs text-slate-500 mt-0.5">Stockage sécurisé</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user-shield text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-slate-900">Respect RGPD</div>
                        <div class="text-xs text-slate-500 mt-0.5">Conforme européen</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-clock text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-slate-900">Délai 24h</div>
                        <div class="text-xs text-slate-500 mt-0.5">Validation rapide</div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
        <script src="/static/firebase-compat.js?v=3"></script>
        <script>
          let capturedSelfie = null
          let uploadedID = null
          let stream = null

          // Vérifier statut KYC au chargement
          window.addEventListener('DOMContentLoaded', async () => {
            try {
              const user = window.firebaseAuth?.currentUser
              if (!user) return
              const token = await user.getIdToken()
              const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': 'Bearer ' + token }
              })
              const data = await res.json()
              if (data.user?.kyc_status === 'VERIFIED') {
                document.getElementById('kycStatus').classList.remove('hidden')
                document.getElementById('kycForm').classList.add('hidden')
              }
            } catch(e) { console.log('KYC check error:', e) }
          })

          function checkSubmitReady() {
            const btn = document.getElementById('submitBtn')
            btn.disabled = !(capturedSelfie && uploadedID)
          }

          async function startCamera() {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
              const video = document.getElementById('selfieVideo')
              video.srcObject = stream
              video.classList.remove('hidden')
              document.getElementById('selfieEmpty').classList.add('hidden')
              document.getElementById('startCameraBtn').classList.add('hidden')
              document.getElementById('takeSelfieBtn').classList.remove('hidden')
            } catch(e) {
              alert('Impossible d accéder à la caméra: ' + e.message)
            }
          }

          function takeSelfie() {
            const video = document.getElementById('selfieVideo')
            const canvas = document.getElementById('selfieCanvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            canvas.getContext('2d').drawImage(video, 0, 0)
            
            canvas.toBlob(blob => {
              capturedSelfie = blob
              const preview = document.getElementById('selfiePreview')
              preview.src = URL.createObjectURL(blob)
              preview.classList.remove('hidden')
              video.classList.add('hidden')
              
              // Arrêter la caméra
              stream?.getTracks().forEach(t => t.stop())
              
              document.getElementById('takeSelfieBtn').classList.add('hidden')
              document.getElementById('startCameraBtn').classList.remove('hidden')
              document.getElementById('startCameraBtn').textContent = 'Reprendre'
              
              const status = document.getElementById('selfieStatus')
              status.className = 'mt-2 text-sm text-center text-success-600 font-semibold'
              status.textContent = '✅ Selfie capturé'
              status.classList.remove('hidden')
              
              checkSubmitReady()
            }, 'image/jpeg', 0.8)
          }

          function previewID(event) {
            const file = event.target.files[0]
            if (!file) return
            uploadedID = file
            const preview = document.getElementById('idPreview')
            preview.src = URL.createObjectURL(file)
            preview.classList.remove('hidden')
            document.getElementById('idEmpty').classList.add('hidden')
            
            const status = document.getElementById('idStatus')
            status.className = 'mt-2 text-sm text-center text-success-600 font-semibold'
            status.textContent = '✅ Document chargé: ' + file.name
            status.classList.remove('hidden')
            
            checkSubmitReady()
          }

          async function submitKYC() {
            if (!capturedSelfie || !uploadedID) return
            
            const btn = document.getElementById('submitBtn')
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...'
            
            try {
              const firebaseUser = window.firebaseAuth?.currentUser
              const localUser = JSON.parse(localStorage.getItem('amanah_user') || '{}')
              const userId = localUser.uid || localUser.id || firebaseUser?.uid
              
              if (!userId) {
                alert('Session expirée. Reconnectez-vous.')
                window.location.href = '/login'
                return
              }
              
              const formData = new FormData()
              formData.append('selfie', capturedSelfie, 'selfie.jpg')
              formData.append('id_document', uploadedID)
              formData.append('user_id', userId)
              
              const token = firebaseUser 
                ? await firebaseUser.getIdToken()
                : localStorage.getItem('amanah_token')
              
              const response = await fetch('/api/auth/verify-kyc', {
                method: 'POST',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                body: formData
              })
              
              const data = await response.json()
              const resultMsg = document.getElementById('resultMsg')
              
              if (data.success) {
                resultMsg.className = 'mt-4 p-4 rounded-xl text-center font-semibold bg-success-50 border border-success-100 text-success-700'
                resultMsg.textContent = '✅ Documents soumis ! Notre équipe validera votre profil sous 24h.'
                resultMsg.classList.remove('hidden')
                btn.innerHTML = '✅ Documents soumis'
              } else {
                throw new Error(data.error || 'Erreur lors de la soumission')
              }
            } catch(error) {
              const resultMsg = document.getElementById('resultMsg')
              resultMsg.className = 'mt-4 p-4 rounded-xl text-center font-semibold bg-danger-50 border border-danger-100 text-danger-700'
              resultMsg.textContent = '❌ Erreur: ' + error.message
              resultMsg.classList.remove('hidden')
              btn.disabled = false
              btn.innerHTML = '<i class="fas fa-check mr-2"></i>Réessayer'
            }
          }
        </script>
    </body>
    </html>
  `
}
