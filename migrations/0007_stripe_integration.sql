-- ================================
-- Migration: Stripe Integration
-- Date: 2026-01-09
-- Description: Ajout des champs Stripe pour Payment Intent, Connect Accounts et Escrow
-- ================================

-- --------------------------------
-- 1. TABLE USERS - Ajout du compte Stripe Connect
-- --------------------------------
-- Ajouter les colonnes pour Stripe Connect (comptes voyageurs)
ALTER TABLE users ADD COLUMN stripe_connect_account_id TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN stripe_connect_onboarding_completed BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_connect_charges_enabled BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_connect_payouts_enabled BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_connect_details_submitted BOOLEAN DEFAULT 0;

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_stripe_connect ON users(stripe_connect_account_id);

-- --------------------------------
-- 2. TABLE TRANSACTIONS - Ajout des champs Stripe
-- --------------------------------
-- Vérifier si les colonnes existent déjà avant de les ajouter
-- (pour éviter les erreurs si migration déjà appliquée)

-- Ajouter payment_intent_id si pas déjà présent
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_intent_id TEXT DEFAULT NULL;

-- Ajouter transfer_id si pas déjà présent
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transfer_id TEXT DEFAULT NULL;

-- Ajouter refund_id si pas déjà présent (pour les remboursements)
ALTER TABLE transactions ADD COLUMN refund_id TEXT DEFAULT NULL;

-- Ajouter les colonnes de montants Stripe
ALTER TABLE transactions ADD COLUMN stripe_fee INTEGER DEFAULT 0; -- En centimes (ex: 150 = 1.50€)
ALTER TABLE transactions ADD COLUMN stripe_net_amount INTEGER DEFAULT 0; -- Montant net après frais Stripe

-- Statuts de paiement Stripe
ALTER TABLE transactions ADD COLUMN stripe_payment_status TEXT DEFAULT 'pending'; -- pending, succeeded, failed, refunded
ALTER TABLE transactions ADD COLUMN stripe_transfer_status TEXT DEFAULT 'pending'; -- pending, succeeded, failed, canceled

-- Métadonnées Stripe
ALTER TABLE transactions ADD COLUMN stripe_metadata TEXT DEFAULT NULL; -- JSON avec infos supplémentaires

-- Timestamps Stripe
ALTER TABLE transactions ADD COLUMN stripe_payment_at TIMESTAMP DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN stripe_transfer_at TIMESTAMP DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN stripe_refund_at TIMESTAMP DEFAULT NULL;

-- Index pour optimiser les recherches Stripe
CREATE INDEX IF NOT EXISTS idx_transactions_payment_intent ON transactions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer ON transactions(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_status ON transactions(stripe_payment_status);

-- --------------------------------
-- 3. TABLE STRIPE_EVENTS - Webhook logs
-- --------------------------------
-- Cette table stocke tous les événements webhooks Stripe pour debugging et audit
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- payment_intent.succeeded, transfer.created, etc.
  event_object TEXT NOT NULL, -- JSON de l'objet Stripe
  event_data TEXT NOT NULL, -- JSON complet de l'événement
  processed BOOLEAN DEFAULT 0,
  processed_at TIMESTAMP DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour retrouver rapidement les événements
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON stripe_events(created_at);

-- --------------------------------
-- 4. TABLE STRIPE_DISPUTES - Gestion des litiges
-- --------------------------------
CREATE TABLE IF NOT EXISTS stripe_disputes (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  dispute_id TEXT NOT NULL, -- ID du dispute Stripe (dp_...)
  amount INTEGER NOT NULL, -- Montant en centimes
  currency TEXT DEFAULT 'eur',
  reason TEXT NOT NULL, -- fraudulent, duplicate, product_not_received, etc.
  status TEXT DEFAULT 'needs_response', -- needs_response, won, lost, warning_closed
  evidence_details TEXT DEFAULT NULL, -- JSON avec détails des preuves
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Index pour les disputes
CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON stripe_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON stripe_disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created ON stripe_disputes(created_at);

-- --------------------------------
-- 5. TABLE STRIPE_PAYOUTS - Suivi des payouts voyageurs
-- --------------------------------
CREATE TABLE IF NOT EXISTS stripe_payouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  payout_id TEXT NOT NULL, -- ID du payout Stripe (po_...)
  amount INTEGER NOT NULL, -- Montant en centimes
  currency TEXT DEFAULT 'eur',
  arrival_date TIMESTAMP DEFAULT NULL, -- Date estimée de réception des fonds
  status TEXT DEFAULT 'pending', -- pending, paid, failed, canceled
  failure_code TEXT DEFAULT NULL,
  failure_message TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour les payouts
CREATE INDEX IF NOT EXISTS idx_payouts_user ON stripe_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON stripe_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON stripe_payouts(created_at);

-- --------------------------------
-- 6. TABLE STRIPE_CONNECT_EVENTS - Logs des événements Connect
-- --------------------------------
CREATE TABLE IF NOT EXISTS stripe_connect_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_account_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- account.updated, account.application.authorized, etc.
  event_data TEXT NOT NULL, -- JSON complet
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour Connect events
CREATE INDEX IF NOT EXISTS idx_connect_events_user ON stripe_connect_events(user_id);
CREATE INDEX IF NOT EXISTS idx_connect_events_account ON stripe_connect_events(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_connect_events_type ON stripe_connect_events(event_type);

-- --------------------------------
-- 7. Mise à jour des contraintes
-- --------------------------------

-- Ajouter une contrainte pour s'assurer que les montants sont cohérents
-- platform_fee doit être égal à agreed_price * 0.12
-- traveler_payout doit être égal à agreed_price * 0.88

-- Note: SQLite ne supporte pas CHECK avec des colonnes calculées
-- La validation sera faite côté application

-- --------------------------------
-- 8. Données de test (optionnel)
-- --------------------------------

-- Exemple: Mettre à jour un utilisateur test avec un compte Stripe Connect
-- UPDATE users 
-- SET stripe_connect_account_id = 'acct_test_1234567890',
--     stripe_connect_onboarding_completed = 1,
--     stripe_connect_charges_enabled = 1,
--     stripe_connect_payouts_enabled = 1
-- WHERE email = 'mohammed.alami@example.com';

-- ================================
-- FIN DE MIGRATION
-- ================================

-- Vérifier que les tables ont été créées
SELECT 'Migration 0007_stripe_integration.sql terminée avec succès' as message;
