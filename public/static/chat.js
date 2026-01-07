// 💬 CHAT TEMPS RÉEL - Amanah GO
// ================================

const ChatApp = {
  currentUserId: null,
  currentConversationUserId: null,
  pollInterval: null,
  lastMessageId: 0,

  // Initialiser le chat
  async init() {
    console.log('💬 Initialisation Chat...')
    
    // Vérifier authentification
    if (!auth.isAuthenticated()) {
      window.location.href = '/login'
      return
    }
    
    const user = auth.getUser()
    this.currentUserId = user.id
    
    // Charger les conversations
    await this.loadConversations()
    
    // Démarrer le polling (toutes les 3 secondes)
    this.startPolling()
    
    // Event listeners
    this.setupEventListeners()
  },

  // Charger la liste des conversations
  async loadConversations() {
    try {
      const response = await auth.apiRequest('/api/conversations')
      
      if (response.success) {
        this.renderConversations(response.conversations)
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    }
  },

  // Afficher les conversations
  renderConversations(conversations) {
    const listEl = document.getElementById('conversations-list')
    if (!listEl) return
    
    if (conversations.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-comments text-4xl mb-3"></i>
          <p>Aucune conversation</p>
        </div>
      `
      return
    }
    
    listEl.innerHTML = conversations.map(conv => `
      <div class="conversation-item p-4 border-b hover:bg-gray-50 cursor-pointer ${conv.unread_count > 0 ? 'bg-blue-50' : ''}"
           data-user-id="${conv.user_id}"
           onclick="ChatApp.openConversation(${conv.user_id}, '${conv.user_name}')">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              ${conv.user_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="font-semibold">${conv.user_name}</h3>
              <p class="text-sm text-gray-600 truncate">${conv.last_message || 'Aucun message'}</p>
            </div>
          </div>
          ${conv.unread_count > 0 ? `
            <span class="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              ${conv.unread_count}
            </span>
          ` : ''}
        </div>
      </div>
    `).join('')
  },

  // Ouvrir une conversation
  async openConversation(userId, userName) {
    this.currentConversationUserId = userId
    
    // Afficher le panneau de chat
    document.getElementById('chat-panel').classList.remove('hidden')
    document.getElementById('chat-header-name').textContent = userName
    
    // Charger les messages
    await this.loadMessages(userId)
    
    // Marquer tous les messages comme lus
    await this.markAllAsRead(userId)
  },

  // Charger les messages d'une conversation
  async loadMessages(userId) {
    try {
      const response = await auth.apiRequest(`/api/messages/${userId}`)
      
      if (response.success) {
        this.renderMessages(response.messages)
        this.scrollToBottom()
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  },

  // Afficher les messages
  renderMessages(messages) {
    const messagesEl = document.getElementById('messages-container')
    if (!messagesEl) return
    
    messagesEl.innerHTML = messages.map(msg => {
      const isMe = msg.sender_id === this.currentUserId
      const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return `
        <div class="mb-4 ${isMe ? 'text-right' : 'text-left'}">
          <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isMe 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'
          }">
            <p>${msg.message}</p>
            <span class="text-xs opacity-75">${time}</span>
          </div>
        </div>
      `
    }).join('')
    
    // Mémoriser le dernier message
    if (messages.length > 0) {
      this.lastMessageId = messages[messages.length - 1].id
    }
  },

  // Envoyer un message
  async sendMessage() {
    const input = document.getElementById('message-input')
    const message = input.value.trim()
    
    if (!message || !this.currentConversationUserId) {
      return
    }
    
    try {
      const response = await auth.apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: this.currentConversationUserId,
          message: message,
          message_type: 'TEXT'
        })
      })
      
      if (response.success) {
        // Vider l'input
        input.value = ''
        
        // Recharger les messages
        await this.loadMessages(this.currentConversationUserId)
        
        // Recharger les conversations (pour mettre à jour le dernier message)
        await this.loadConversations()
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      alert('Erreur lors de l\'envoi du message')
    }
  },

  // Marquer tous les messages comme lus
  async markAllAsRead(userId) {
    try {
      const response = await auth.apiRequest(`/api/messages/${userId}`)
      
      if (response.success && response.messages) {
        // Marquer chaque message non lu
        const unreadMessages = response.messages.filter(m => 
          m.receiver_id === this.currentUserId && !m.read_at
        )
        
        for (const msg of unreadMessages) {
          await auth.apiRequest(`/api/messages/${msg.id}/read`, {
            method: 'PUT'
          })
        }
      }
    } catch (error) {
      console.error('Erreur marquage messages lus:', error)
    }
  },

  // Polling pour nouveaux messages
  startPolling() {
    // Polling toutes les 3 secondes
    this.pollInterval = setInterval(() => {
      if (this.currentConversationUserId) {
        this.checkNewMessages()
      }
      // Toujours rafraîchir les conversations pour les badges
      this.loadConversations()
    }, 3000)
  },

  // Vérifier nouveaux messages
  async checkNewMessages() {
    if (!this.currentConversationUserId) return
    
    try {
      const response = await auth.apiRequest(`/api/messages/${this.currentConversationUserId}`)
      
      if (response.success && response.messages.length > 0) {
        const lastMsg = response.messages[response.messages.length - 1]
        
        // Si nouveau message
        if (lastMsg.id > this.lastMessageId) {
          await this.loadMessages(this.currentConversationUserId)
          
          // Notification sonore (optionnel)
          if (lastMsg.sender_id !== this.currentUserId) {
            this.playNotificationSound()
          }
        }
      }
    } catch (error) {
      console.error('Erreur vérification nouveaux messages:', error)
    }
  },

  // Son de notification (simple beep)
  playNotificationSound() {
    // Créer un beep simple avec Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.log('Notification sonore non disponible')
    }
  },

  // Scroll vers le bas des messages
  scrollToBottom() {
    const container = document.getElementById('messages-container')
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
    }
  },

  // Setup event listeners
  setupEventListeners() {
    // Bouton envoyer
    const sendBtn = document.getElementById('send-message-btn')
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage())
    }
    
    // Entrée sur le champ de message
    const input = document.getElementById('message-input')
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage()
        }
      })
    }
    
    // Fermer le chat
    const closeBtn = document.getElementById('close-chat-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('chat-panel').classList.add('hidden')
        this.currentConversationUserId = null
      })
    }
  },

  // Arrêter le polling (cleanup)
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }
}

// Export pour utilisation globale
window.ChatApp = ChatApp

// Auto-init si on est sur la page chat
if (document.getElementById('chat-app')) {
  document.addEventListener('DOMContentLoaded', () => {
    ChatApp.init()
  })
}
