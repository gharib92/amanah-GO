// 📧 TEMPLATES D'EMAILS - Amanah GO
// ===================================

const EmailTemplates = {
  // Template de base
  baseTemplate: (content) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Amanah GO</h1>
          <p>Transport Collaboratif France ↔ Maroc</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2025 Amanah GO - Tous droits réservés</p>
          <p>🔒 Vos données sont sécurisées | 📧 contact@amanah-go.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // 1. Bienvenue / Confirmation inscription
  welcome: (userName) => EmailTemplates.baseTemplate(`
    <h2>👋 Bienvenue ${userName} !</h2>
    <p>Merci de rejoindre <strong>Amanah GO</strong>, la première plateforme de transport collaboratif France ↔ Maroc !</p>
    
    <h3>🎯 Prochaines étapes :</h3>
    <ol>
      <li>✅ Compte créé avec succès</li>
      <li>🔐 Vérifiez votre identité (KYC)</li>
      <li>📦 Publiez votre premier trajet ou colis</li>
    </ol>
    
    <p>💡 <strong>Astuce :</strong> Complétez votre profil pour gagner la confiance de la communauté !</p>
    
    <a href="https://amanah-go.com/verify-profile" class="button">Compléter mon profil</a>
    
    <p style="margin-top: 30px; color: #666;">Des questions ? Notre équipe est là pour vous aider !</p>
  `),

  // 2. Vérification email
  verifyEmail: (userName, code) => EmailTemplates.baseTemplate(`
    <h2>🔐 Vérification de votre email</h2>
    <p>Bonjour ${userName},</p>
    <p>Voici votre code de vérification :</p>
    
    <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; letter-spacing: 5px; margin: 20px 0;">
      ${code}
    </div>
    
    <p>⏱️ Ce code expire dans <strong>10 minutes</strong>.</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      ⚠️ Si vous n'avez pas demandé ce code, ignorez cet email.
    </p>
  `),

  // 3. Nouvelle réservation (pour le voyageur)
  newBooking: (travelerName, shipperName, packageDetails) => EmailTemplates.baseTemplate(`
    <h2>📦 Nouvelle réservation !</h2>
    <p>Bonjour ${travelerName},</p>
    <p><strong>${shipperName}</strong> souhaite réserver de l'espace dans vos bagages !</p>
    
    <h3>📋 Détails du colis :</h3>
    <ul>
      <li><strong>Poids :</strong> ${packageDetails.weight} kg</li>
      <li><strong>Route :</strong> ${packageDetails.from} → ${packageDetails.to}</li>
      <li><strong>Date :</strong> ${packageDetails.date}</li>
      <li><strong>Montant :</strong> ${packageDetails.amount}€</li>
    </ul>
    
    <a href="https://amanah-go.com/voyageur/reservations" class="button">Voir la réservation</a>
    
    <p style="color: #666; margin-top: 20px;">
      💬 Vous pouvez contacter ${shipperName} via le chat pour organiser la remise.
    </p>
  `),

  // 4. Paiement confirmé (pour l'expéditeur)
  paymentConfirmed: (shipperName, amount, travelerName) => EmailTemplates.baseTemplate(`
    <h2>✅ Paiement confirmé !</h2>
    <p>Bonjour ${shipperName},</p>
    <p>Votre paiement de <strong>${amount}€</strong> a été confirmé avec succès !</p>
    
    <h3>🔐 Fonds sécurisés (Escrow)</h3>
    <p>Vos fonds sont actuellement <strong>bloqués en sécurité</strong> et seront transférés à ${travelerName} uniquement après confirmation de livraison.</p>
    
    <h3>📍 Prochaines étapes :</h3>
    <ol>
      <li>Contactez ${travelerName} via le chat</li>
      <li>Organisez le RDV de remise</li>
      <li>Confirmez la livraison après réception</li>
    </ol>
    
    <a href="https://amanah-go.com/expediteur/mes-colis" class="button">Suivre mon colis</a>
    
    <p style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-top: 20px;">
      💡 <strong>Astuce :</strong> Utilisez les codes de sécurité à 6 chiffres lors de la remise pour garantir la transaction !
    </p>
  `),

  // 5. Livraison confirmée (pour les 2 parties)
  deliveryConfirmed: (userName, otherUserName, amount, isShipper) => EmailTemplates.baseTemplate(`
    <h2>🎉 Livraison confirmée !</h2>
    <p>Bonjour ${userName},</p>
    
    ${isShipper ? `
      <p>Votre colis a été livré avec succès à destination !</p>
      <p>Les fonds (<strong>${amount}€</strong>) ont été transférés à ${otherUserName}.</p>
      
      <h3>⭐ Laissez un avis</h3>
      <p>Aidez la communauté en notant votre expérience avec ${otherUserName} !</p>
    ` : `
      <p>Félicitations ! Vous avez gagné <strong>${amount}€</strong> pour ce transport !</p>
      <p>Les fonds ont été transférés sur votre compte Stripe.</p>
      
      <h3>💰 Vos gains</h3>
      <p>Montant net reçu : <strong>${amount}€</strong></p>
    `}
    
    <a href="https://amanah-go.com/${isShipper ? 'expediteur' : 'voyageur'}/historique" class="button">Voir les détails</a>
    
    <p style="margin-top: 30px;">Merci d'avoir utilisé Amanah GO ! 🚀</p>
  `),

  // 6. Nouveau message reçu
  newMessage: (recipientName, senderName, messagePreview) => EmailTemplates.baseTemplate(`
    <h2>💬 Nouveau message !</h2>
    <p>Bonjour ${recipientName},</p>
    <p><strong>${senderName}</strong> vous a envoyé un message :</p>
    
    <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; color: #666;">"${messagePreview}"</p>
    </div>
    
    <a href="https://amanah-go.com/messages" class="button">Répondre</a>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      💡 Vous pouvez désactiver ces notifications dans vos paramètres.
    </p>
  `),

  // 7. KYC validé
  kycVerified: (userName) => EmailTemplates.baseTemplate(`
    <h2>✅ Identité vérifiée !</h2>
    <p>Bonjour ${userName},</p>
    <p>Excellente nouvelle ! Votre identité a été <strong>vérifiée avec succès</strong> grâce à notre système de reconnaissance faciale IA.</p>
    
    <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
      <div style="font-size: 48px;">✓</div>
      <h3 style="margin: 10px 0;">Compte Vérifié</h3>
      <p style="margin: 0;">Badge de confiance activé</p>
    </div>
    
    <h3>🎯 Avantages du compte vérifié :</h3>
    <ul>
      <li>✅ Badge de confiance visible sur votre profil</li>
      <li>✅ Priorité dans les recherches</li>
      <li>✅ Taux de matching augmenté</li>
      <li>✅ Accès à toutes les fonctionnalités</li>
    </ul>
    
    <a href="https://amanah-go.com/mon-profil" class="button">Voir mon profil</a>
    
    <p style="margin-top: 30px;">Vous êtes maintenant prêt à voyager en toute confiance ! 🚀</p>
  `)
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailTemplates
}
