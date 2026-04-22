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
    <body class="bg-slate-50 min-h-screen font-sans text-slate-900">
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
                <h1 class="text-3xl md:text-4xl font-bold mb-3">Vérification du Profil</h1>
                <p class="text-slate-600 max-w-xl mx-auto">Vérifiez votre téléphone puis soumettez vos documents d'identité. Délai moyen : <strong class="text-slate-900">24h</strong>.</p>
            </div>
        </section>

        <div class="max-w-3xl mx-auto px-6 py-10">

            <!-- Indicateur d'étapes -->
            <div class="flex items-center justify-center mb-8 gap-3">
                <div id="step-indicator-0" class="flex items-center gap-2">
                    <div class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-brand">1</div>
                    <span class="text-sm font-semibold text-slate-900">Téléphone</span>
                </div>
                <div class="h-px w-10 bg-slate-300"></div>
                <div id="step-indicator-1" class="flex items-center gap-2 opacity-40">
                    <div class="w-9 h-9 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">2</div>
                    <span class="text-sm font-semibold text-slate-500">Identité</span>
                </div>
            </div>

            <!-- Statut KYC déjà vérifié -->
            <div id="kycStatus" class="bg-white rounded-2xl border border-success-100 p-8 mb-6 text-center hidden shadow-lg">
                <div class="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check-circle text-success-600 text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-2">Profil déjà vérifié !</h3>
                <p class="text-slate-600">Votre identité a été validée avec succès.</p>
            </div>

            <!-- ÉTAPE 0 : Vérification téléphone -->
            <div id="phoneStep" class="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <i class="fas fa-mobile-alt text-primary-600"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">Étape 1 : Vérification du téléphone</h3>
                        <p class="text-sm text-slate-500">Un code SMS sera envoyé pour confirmer votre numéro.</p>
                    </div>
                </div>

                <!-- Saisie du numéro -->
                <div id="phoneInputSection">
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Numéro de téléphone</label>
                    <div class="flex gap-2">
                        <input type="tel" id="phoneInput"
                               placeholder="+33 6 12 34 56 78"
                               class="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition text-lg tracking-wide">
                        <button onclick="sendPhoneCode()" id="sendCodeBtn"
                                class="px-5 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold transition shadow-brand inline-flex items-center justify-center gap-2 whitespace-nowrap">
                            <i class="fas fa-sms"></i><span class="hidden sm:inline">Envoyer le code</span>
                        </button>
                    </div>
                    <div id="recaptcha-container" class="mt-2"></div>
                    <p id="phoneError" class="text-danger-600 text-sm mt-2 hidden"></p>
                </div>

                <!-- Saisie du code SMS -->
                <div id="codeSection" class="hidden mt-5 pt-5 border-t border-slate-100">
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Code reçu par SMS</label>
                    <div class="flex gap-2">
                        <input type="text" id="smsCode"
                               placeholder="_ _ _ _ _ _"
                               maxlength="6"
                               class="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition text-2xl tracking-widest text-center font-bold"
                               oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                        <button onclick="verifyPhoneCode()" id="verifyCodeBtn"
                                class="px-5 py-3 rounded-xl bg-success-600 hover:bg-success-700 text-white font-semibold transition inline-flex items-center gap-2">
                            <i class="fas fa-check"></i><span class="hidden sm:inline">Vérifier</span>
                        </button>
                    </div>
                    <button onclick="sendPhoneCode()" class="text-primary-600 hover:text-primary-700 text-sm mt-2 font-semibold inline-flex items-center gap-1">
                        <i class="fas fa-redo"></i>Renvoyer le code
                    </button>
                    <p id="codeError" class="text-danger-600 text-sm mt-2 hidden"></p>
                </div>
            </div>

            <!-- ÉTAPES 1 & 2 : KYC (selfie + document) — masqué jusqu'à vérif téléphone -->
            <div id="kycForm" class="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 hidden">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <i class="fas fa-id-card text-primary-600"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">Étape 2 : Vérification d'identité</h3>
                        <p class="text-sm text-slate-500">Selfie + pièce d'identité.</p>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-5">
                    <!-- Selfie -->
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-primary-200 transition">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                <i class="fas fa-camera text-primary-600 text-sm"></i>
                            </div>
                            <h4 class="font-bold">Selfie</h4>
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
                            <h4 class="font-bold">Pièce d'identité</h4>
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

                <div id="resultMsg" class="mt-4 hidden p-4 rounded-xl text-center font-semibold"></div>
            </div>

            <!-- Info sécurité -->
            <div class="mt-6 grid md:grid-cols-3 gap-4">
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-lock text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Données chiffrées</div>
                        <div class="text-xs text-slate-500 mt-0.5">Stockage sécurisé</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user-shield text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Respect RGPD</div>
                        <div class="text-xs text-slate-500 mt-0.5">Conforme européen</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-clock text-primary-600"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Délai 24h</div>
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
              // Nettoyer reCAPTCHA précédent (remplacer le node DOM pour éviter "already been rendered")
              if (recaptchaVerifier) {
                try { recaptchaVerifier.clear() } catch(e) {}
                recaptchaVerifier = null
              }
              const oldContainer = document.getElementById('recaptcha-container')
              const newContainer = document.createElement('div')
              newContainer.id = 'recaptcha-container'
              newContainer.className = oldContainer.className
              oldContainer.parentNode.replaceChild(newContainer, oldContainer)

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
                  // Re-créer le container pour éviter "already rendered"
                  const oldC = document.getElementById('recaptcha-container')
                  const newC = document.createElement('div')
                  newC.id = 'recaptcha-container'
                  newC.className = oldC.className
                  oldC.parentNode.replaceChild(newC, oldC)
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
