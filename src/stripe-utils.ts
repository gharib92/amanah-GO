// ================================
// Stripe Utilities - Amanah GO
// Fonctions utilitaires pour Stripe Connect et Payments
// ================================

/**
 * Configuration Stripe
 */
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

/**
 * Données d'un compte Stripe Connect
 */
export interface StripeConnectAccount {
  id: string;
  object: string;
  type: string;
  business_type: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  email: string;
  country: string;
}

/**
 * Résultat de la création d'un compte Connect
 */
export interface CreateConnectAccountResult {
  account_id: string;
  onboarding_url: string;
  account: StripeConnectAccount;
}

/**
 * Données de transaction pour calcul
 */
export interface TransactionAmounts {
  agreedPrice: number;        // Prix négocié (ex: 80.00€)
  platformFee: number;         // Commission 12% (ex: 9.60€)
  travelerPayout: number;      // 88% pour voyageur (ex: 70.40€)
  totalAmount: number;         // Total à payer = agreedPrice + platformFee
  stripeFee: number;           // Frais Stripe estimés
  platformNet: number;         // Net pour la plateforme après frais Stripe
}

/**
 * Résultat de création Payment Intent
 */
export interface PaymentIntentResult {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Données d'un webhook Stripe
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

/**
 * Calculer les montants d'une transaction
 * Commission plateforme : 12%
 * Voyageur reçoit : 88%
 */
export function calculateTransactionAmounts(agreedPrice: number): TransactionAmounts {
  const platformFee = agreedPrice * 0.12;
  const travelerPayout = agreedPrice * 0.88;
  const totalAmount = agreedPrice + platformFee;
  
  // Frais Stripe : 1.4% + 0.25€
  const stripeFee = (totalAmount * 0.014) + 0.25;
  const platformNet = platformFee - stripeFee;
  
  return {
    agreedPrice: Math.round(agreedPrice * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    travelerPayout: Math.round(travelerPayout * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    platformNet: Math.round(platformNet * 100) / 100
  };
}

/**
 * Convertir un montant en euros vers centimes (format Stripe)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convertir un montant en centimes vers euros
 */
export function centsToEuros(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Générer un code de livraison à 6 chiffres
 */
export function generateDeliveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Valider une signature webhook Stripe
 * Note: Cette fonction nécessite la bibliothèque Stripe officielle
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // En production, utiliser stripe.webhooks.constructEvent()
  // Pour le moment, validation basique
  return signature && signature.length > 0;
}

/**
 * Formater un montant en euros pour affichage
 */
export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Statuts des transactions Stripe
 */
export enum StripePaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

/**
 * Statuts des transfers Stripe
 */
export enum StripeTransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

/**
 * Types d'événements webhook Stripe
 */
export enum StripeEventType {
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED = 'payment_intent.canceled',
  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_PAID = 'transfer.paid',
  TRANSFER_FAILED = 'transfer.failed',
  ACCOUNT_UPDATED = 'account.updated',
  CHARGE_REFUNDED = 'charge.refunded'
}

/**
 * Erreurs Stripe communes
 */
export const StripeErrors = {
  INVALID_API_KEY: 'invalid_api_key',
  INVALID_CARD: 'invalid_card',
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVC: 'incorrect_cvc',
  PROCESSING_ERROR: 'processing_error',
  RATE_LIMIT: 'rate_limit'
};

/**
 * Messages d'erreur Stripe en français
 */
export function getStripeErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    'invalid_api_key': 'Erreur de configuration Stripe',
    'invalid_card': 'Numéro de carte invalide',
    'card_declined': 'Carte refusée par votre banque',
    'insufficient_funds': 'Fonds insuffisants sur votre carte',
    'expired_card': 'Carte expirée',
    'incorrect_cvc': 'Code de sécurité incorrect',
    'processing_error': 'Erreur lors du traitement du paiement',
    'rate_limit': 'Trop de requêtes, veuillez réessayer dans quelques instants'
  };
  
  return messages[errorCode] || 'Une erreur est survenue lors du paiement';
}

/**
 * Calculer la date d'arrivée estimée des fonds
 * Standard : 2 jours ouvrés
 */
export function estimatePayoutArrivalDate(): Date {
  const date = new Date();
  let daysToAdd = 2;
  
  // Ajouter les jours ouvrés (exclure weekends)
  while (daysToAdd > 0) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    // Si c'est un jour ouvré (lundi à vendredi)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysToAdd--;
    }
  }
  
  return date;
}

/**
 * Vérifier si un compte Stripe Connect est actif et opérationnel
 */
export function isConnectAccountActive(account: StripeConnectAccount): boolean {
  return account.charges_enabled && 
         account.payouts_enabled && 
         account.details_submitted;
}

/**
 * Obtenir le statut d'un compte Connect en français
 */
export function getConnectAccountStatus(account: StripeConnectAccount): string {
  if (isConnectAccountActive(account)) {
    return 'Actif';
  }
  
  if (!account.details_submitted) {
    return 'En attente de complétion';
  }
  
  if (!account.charges_enabled || !account.payouts_enabled) {
    return 'En cours de vérification';
  }
  
  return 'Inactif';
}

/**
 * Logger un événement Stripe (pour audit et debugging)
 */
export function logStripeEvent(
  eventType: string,
  eventData: any,
  error?: string
): void {
  const log = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    event_data: eventData,
    error: error || null
  };
  
  console.log('[STRIPE EVENT]', JSON.stringify(log));
}

// ================================
// Exemple d'utilisation
// ================================

/*
// 1. Calculer les montants d'une transaction
const amounts = calculateTransactionAmounts(80.00);
console.log(amounts);
// {
//   agreedPrice: 80.00,
//   platformFee: 9.60,
//   travelerPayout: 70.40,
//   totalAmount: 89.60,
//   stripeFee: 1.50,
//   platformNet: 8.10
// }

// 2. Formater un montant
const formattedAmount = formatAmount(amounts.totalAmount);
console.log(formattedAmount); // "89,60 €"

// 3. Convertir euros en centimes pour Stripe
const amountInCents = eurosToCents(amounts.totalAmount);
console.log(amountInCents); // 8960

// 4. Générer un code de livraison
const deliveryCode = generateDeliveryCode();
console.log(deliveryCode); // "123456"

// 5. Vérifier un compte Connect
const isActive = isConnectAccountActive(account);
console.log(isActive); // true/false
*/
