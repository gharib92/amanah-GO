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
                <p class="text-blue-200">Vérifiez votre téléphone puis soumettez vos documents d'identité</p>
            </div>

            <!-- Indicateur d'étapes -->
            <div class="flex items-center justify-center mb-8 space-x-4">
                <div id="step-indicator-0" class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span class="text-white text-sm ml-2">Téléphone</span>
                </div>
                <div class="h-px w-8 bg-white/30"></div>
                <div id="step-indicator-1" class="flex items-center opacity-40">
                    <div class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span class="text-white text-sm ml-2">Identité</span>
                </div>
            </div>

            <!-- Statut KYC déjà vérifié -->
            <div id="kycStatus" class="bg-white/10 rounded-xl p-6 mb-6 text-white text-center hidden">
                <i class="fas fa-check-circle text-green-400 text-4xl mb-3"></i>
                <h3 class="text-xl font-bold">Profil déjà vérifié !</h3>
                <p class="text-blue-200 mt-2">Votre identité a été validée avec succès.</p>
            </div>

            <!-- ÉTAPE 0 : Vérification téléphone -->
            <div id="phoneStep" class="bg-white/10 rounded-xl p-6 mb-6">
                <h3 class="text-white font-bold text-lg mb-1">
                    <i class="fas fa-mobile-alt text-blue-400 mr-2"></i>Étape 1 : Vérification du numéro de téléphone
                </h3>
                <p class="text-blue-200 text-sm mb-5">Un code SMS sera envoyé pour confirmer que ce numéro vous appartient.</p>

                <!-- Saisie du numéro -->
                <div id="phoneInputSection">
                    <label class="text-white text-sm font-medium mb-2 block">Numéro de téléphone</label>
                    <div class="flex gap-3">
                        <input type="tel" id="phoneInput"
                               placeholder="+33 6 12 34 56 78"
                               class="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 text-lg tracking-wider">
                        <button onclick="sendPhoneCode()" id="sendCodeBtn"
                                class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition whitespace-nowrap">
                            <i class="fas fa-sms mr-2"></i>Envoyer le code
                        </button>
                    </div>
                    <div id="recaptcha-container" class="mt-2"></div>
                    <p id="phoneError" class="text-red-300 text-sm mt-2 hidden"></p>
                </div>

                <!-- Saisie du code SMS -->
                <div id="codeSection" class="hidden mt-5">
                    <label class="text-white text-sm font-medium mb-2 block">Code reçu par SMS</label>
                    <div class="flex gap-3">
                        <input type="text" id="smsCode"
                               placeholder="_ _ _ _ _ _"
                               maxlength="6"
                               class="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 text-2xl tracking-widest text-center"
                               oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                        <button onclick="verifyPhoneCode()" id="verifyCodeBtn"
                                class="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                            <i class="fas fa-check mr-2"></i>Vérifier
                        </button>
                    </div>
                    <button onclick="sendPhoneCode()" class="text-blue-300 text-sm mt-2 hover:text-white transition">
                        <i class="fas fa-redo mr-1"></i>Renvoyer le code
                    </button>
                    <p id="codeError" class="text-red-300 text-sm mt-2 hidden"></p>
                </div>
            </div>

            <!-- ÉTAPES 1 & 2 : KYC (selfie + document) — masqué jusqu'à vérif téléphone -->
            <div id="kycForm" class="bg-white/10 rounded-xl p-6 hidden">
                <h3 class="text-white font-bold text-lg mb-5">
                    <i class="fas fa-id-card text-blue-400 mr-2"></i>Étape 2 : Vérification d'identité
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Selfie -->
                    <div class="bg-white/5 border border-white/20 rounded-lg p-5">
                        <h4 class="text-white font-bold mb-3">
                            <i class="fas fa-camera text-blue-400 mr-2"></i>Selfie
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
                            <i class="fas fa-id-card text-blue-400 mr-2"></i>Pièce d'identité
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
          let recaptchaVerifier = null
          let phoneConfirmationResult = null

          // ==========================================
          // INITIALISATION
          // ==========================================
          window.addEventListener('DOMContentLoaded', async () => {
            // Attendre que Firebase auth soit prêt
            window.firebaseAuth.onAuthStateChanged(async (user) => {
              if (!user) return

              try {
                const token = await user.getIdToken()
                const res = await fetch('/api/auth/me', {
                  headers: { 'Authorization': 'Bearer ' + token }
                })
                const data = await res.json()

                // KYC déjà validé → montrer message succès
                if (data.user?.kyc_status === 'VERIFIED') {
                  document.getElementById('kycStatus').classList.remove('hidden')
                  document.getElementById('phoneStep').classList.add('hidden')
                  document.getElementById('kycForm').classList.add('hidden')
                  return
                }

                // Pré-remplir le numéro si connu
                const existingPhone = data.user?.phone || user.phoneNumber || ''
                if (existingPhone) {
                  document.getElementById('phoneInput').value = existingPhone
                }

                // Téléphone déjà lié à Firebase → passer directement au KYC
                if (user.phoneNumber) {
                  markPhoneVerified(user.phoneNumber, token)
                  return
                }

                // Téléphone déjà en DB et marqué vérifié (providerData Google/Apple)
                const isGoogleOrApple = user.providerData?.some(p =>
                  p.providerId === 'google.com' || p.providerId === 'apple.com'
                )
                if (isGoogleOrApple && data.user?.phone && data.user.phone.length > 5) {
                  // Google/Apple — proposer de vérifier ou skip
                  // On garde l'étape téléphone car le numéro n'est pas vérifié par SMS
                }
              } catch(e) {
                console.log('Init error:', e)
              }
            })
          })

          // ==========================================
          // VÉRIFICATION TÉLÉPHONE
          // ==========================================
          async function sendPhoneCode() {
            const phone = document.getElementById('phoneInput').value.trim()
            const errEl = document.getElementById('phoneError')
            errEl.classList.add('hidden')

            if (!phone || phone.length < 8) {
              errEl.textContent = 'Entrez un numéro valide (ex: +33612345678)'
              errEl.classList.remove('hidden')
              return
            }

            const btn = document.getElementById('sendCodeBtn')
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...'

            try {
              // Nettoyer reCAPTCHA précédent
              if (recaptchaVerifier) {
                try { recaptchaVerifier.clear() } catch(e) {}
                recaptchaVerifier = null
              }
              document.getElementById('recaptcha-container').innerHTML = ''

              recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                size: 'invisible',
                callback: () => {}
              })

              const currentUser = window.firebaseAuth.currentUser
              if (!currentUser) {
                alert('Session expirée. Reconnectez-vous.')
                window.location.href = '/'
                return
              }

              // Lier le téléphone au compte existant (ne remplace pas la session)
              phoneConfirmationResult = await currentUser.linkWithPhoneNumber(phone, recaptchaVerifier)

              btn.innerHTML = '<i class="fas fa-check mr-2"></i>Code envoyé !'
              document.getElementById('codeSection').classList.remove('hidden')
              document.getElementById('smsCode').focus()

            } catch(e) {
              btn.disabled = false
              btn.innerHTML = '<i class="fas fa-sms mr-2"></i>Envoyer le code'
              if (recaptchaVerifier) {
                try { recaptchaVerifier.clear() } catch(_) {}
                recaptchaVerifier = null
              }

              // Téléphone déjà lié à CE compte → passer directement
              if (e.code === 'auth/provider-already-linked') {
                const token = await window.firebaseAuth.currentUser.getIdToken()
                markPhoneVerified(phone, token)
                return
              }
              // Téléphone lié à UN AUTRE compte Firebase → forcer via signInWithPhoneNumber
              if (e.code === 'auth/credential-already-in-use' || e.code === 'auth/phone-number-already-exists') {
                try {
                  recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible', callback: () => {} })
                  phoneConfirmationResult = await window.firebaseAuth.signInWithPhoneNumber(phone, recaptchaVerifier)
                  btn.innerHTML = '<i class="fas fa-check mr-2"></i>Code envoyé !'
                  document.getElementById('codeSection').classList.remove('hidden')
                  document.getElementById('smsCode').focus()
                  return
                } catch(e2) {
                  errEl.textContent = 'Erreur envoi SMS : ' + e2.message
                  errEl.classList.remove('hidden')
                }
                return
              }

              errEl.textContent = 'Erreur : ' + e.message
              errEl.classList.remove('hidden')
            }
          }

          async function verifyPhoneCode() {
            const code = document.getElementById('smsCode').value.trim()
            const errEl = document.getElementById('codeError')
            errEl.classList.add('hidden')

            if (!code || code.length !== 6) {
              errEl.textContent = 'Entrez le code à 6 chiffres reçu par SMS'
              errEl.classList.remove('hidden')
              return
            }

            const btn = document.getElementById('verifyCodeBtn')
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification...'

            try {
              await phoneConfirmationResult.confirm(code)

              const phone = document.getElementById('phoneInput').value.trim()
              const token = await window.firebaseAuth.currentUser.getIdToken()
              await markPhoneVerified(phone, token)

            } catch(e) {
              btn.disabled = false
              btn.innerHTML = '<i class="fas fa-check mr-2"></i>Vérifier'
              errEl.textContent = 'Code incorrect ou expiré. Réessayez.'
              errEl.classList.remove('hidden')
            }
          }

          async function markPhoneVerified(phone, token) {
            try {
              // Sauvegarder le numéro vérifié en base
              await fetch('/api/auth/update-phone', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + token,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
              })
            } catch(e) {
              console.log('Phone save error:', e)
            }

            // Marquer étape 1 comme complète et afficher KYC
            document.getElementById('phoneStep').classList.add('hidden')
            document.getElementById('step-indicator-0').innerHTML =
              '<div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold"><i class="fas fa-check"></i></div>' +
              '<span class="text-white text-sm ml-2">✅ Téléphone vérifié</span>'
            document.getElementById('step-indicator-1').classList.remove('opacity-40')
            document.getElementById('kycForm').classList.remove('hidden')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }

          // ==========================================
          // KYC — SELFIE & DOCUMENT
          // ==========================================
          function checkSubmitReady() {
            document.getElementById('submitBtn').disabled = !(capturedSelfie && uploadedID)
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
                window.location.href = '/'
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
