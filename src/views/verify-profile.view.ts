export function renderVerifyProfilePage() {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification du Profil - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 min-h-screen">
        <nav class="bg-blue-900/50 border-b border-blue-700">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-12 w-auto">
                    <span class="text-xl font-bold text-white">Amanah GO</span>
                </div>
                <a href="/voyageur" class="text-white hover:text-blue-200 text-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Retour
                </a>
            </div>
        </nav>

        <div class="max-w-3xl mx-auto px-4 py-12">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-white mb-2">Vérification du Profil</h1>
                <p class="text-blue-200">Soumettez votre selfie et pièce d'identité pour valider votre compte</p>
            </div>

            <!-- Statut KYC -->
            <div id="kycStatus" class="bg-white/10 rounded-xl p-6 mb-6 text-white text-center hidden">
                <i class="fas fa-check-circle text-green-400 text-4xl mb-3"></i>
                <h3 class="text-xl font-bold">Profil déjà vérifié !</h3>
                <p class="text-blue-200 mt-2">Votre identité a été validée avec succès.</p>
            </div>

            <!-- Formulaire KYC -->
            <div id="kycForm" class="bg-white/10 rounded-xl p-6">
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Selfie -->
                    <div class="bg-white/5 border border-white/20 rounded-lg p-5">
                        <h4 class="text-white font-bold mb-3">
                            <i class="fas fa-camera text-blue-400 mr-2"></i>Étape 1 : Selfie
                        </h4>
                        <div class="border-2 border-dashed border-white/20 rounded-lg mb-4 overflow-hidden bg-black/30" style="height:200px">
                            <video id="selfieVideo" class="w-full h-full object-cover hidden" autoplay playsinline></video>
                            <canvas id="selfieCanvas" class="hidden"></canvas>
                            <img id="selfiePreview" class="w-full h-full object-cover hidden" alt="Selfie">
                            <div id="selfieEmpty" class="flex flex-col items-center justify-center h-full text-blue-200">
                                <i class="fas fa-camera text-4xl mb-2"></i>
                                <p class="text-sm">Prenez un selfie</p>
                            </div>
                        </div>
                        <button onclick="startCamera()" id="startCameraBtn"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition mb-2">
                            <i class="fas fa-camera mr-2"></i>Ouvrir la caméra
                        </button>
                        <button onclick="takeSelfie()" id="takeSelfieBtn"
                                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition hidden">
                            <i class="fas fa-circle mr-2"></i>Prendre la photo
                        </button>
                        <div id="selfieStatus" class="mt-2 text-sm text-center hidden"></div>
                    </div>

                    <!-- Pièce d'identité -->
                    <div class="bg-white/5 border border-white/20 rounded-lg p-5">
                        <h4 class="text-white font-bold mb-3">
                            <i class="fas fa-id-card text-blue-400 mr-2"></i>Étape 2 : Pièce d'identité
                        </h4>
                        <div class="border-2 border-dashed border-white/20 rounded-lg mb-4 overflow-hidden bg-black/30" style="height:200px">
                            <img id="idPreview" class="w-full h-full object-cover hidden" alt="ID">
                            <div id="idEmpty" class="flex flex-col items-center justify-center h-full text-blue-200">
                                <i class="fas fa-id-card text-4xl mb-2"></i>
                                <p class="text-sm">CIN, Passeport ou Permis</p>
                            </div>
                        </div>
                        <input type="file" id="idInput" accept="image/*" class="hidden" onchange="previewID(event)">
                        <button onclick="document.getElementById('idInput').click()"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                            <i class="fas fa-upload mr-2"></i>Télécharger la photo
                        </button>
                        <div id="idStatus" class="mt-2 text-sm text-center hidden"></div>
                    </div>
                </div>

                <!-- Bouton soumettre -->
                <div class="mt-6">
                    <button onclick="submitKYC()" id="submitBtn"
                            class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled>
                        <i class="fas fa-check mr-2"></i>Soumettre pour vérification
                    </button>
                    <p class="text-blue-200 text-sm text-center mt-2">
                        Les deux documents sont requis. Notre équipe validera votre profil sous 24h.
                    </p>
                </div>

                <!-- Message résultat -->
                <div id="resultMsg" class="mt-4 hidden p-4 rounded-lg text-center font-medium"></div>
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
              status.className = 'mt-2 text-sm text-center text-green-300'
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
            status.className = 'mt-2 text-sm text-center text-green-300'
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
                resultMsg.className = 'mt-4 p-4 rounded-lg text-center font-medium bg-green-500/20 text-green-300'
                resultMsg.textContent = '✅ Documents soumis ! Notre équipe validera votre profil sous 24h.'
                resultMsg.classList.remove('hidden')
                btn.innerHTML = '✅ Documents soumis'
              } else {
                throw new Error(data.error || 'Erreur lors de la soumission')
              }
            } catch(error) {
              const resultMsg = document.getElementById('resultMsg')
              resultMsg.className = 'mt-4 p-4 rounded-lg text-center font-medium bg-red-500/20 text-red-300'
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
