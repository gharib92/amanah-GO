-- Migration: Add kyc_requests table
-- Date: 2026-02-04
-- But: stocker les demandes/flows KYC pour les utilisateurs
-- Champs principaux : id, user_id, provider, provider_ref (ex: aws job id),
-- status (PENDING/APPROVED/REJECTED), reason (texte optionnel),
-- selfie_url, document_url, score (float), created_at, updated_at

CREATE TABLE IF NOT EXISTS kyc_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,                -- ID interne de l'utilisateur (référence vers users.id)
  provider TEXT NOT NULL DEFAULT 'aws-rekognition', -- Nom du provider (ex: aws-rekognition)
  provider_ref TEXT NULL,               -- ID / référence donnée par le provider (ex: AWS job id)
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING / APPROVED / REJECTED
  reason TEXT NULL,                     -- Raison du rejet fournie par le provider (optionnel)
  selfie_url TEXT NULL,                 -- URL (ou clé R2) du selfie associé
  document_url TEXT NULL,               -- URL (ou clé R2) du document ID associé
  score REAL NULL,                      -- Score retourné par le provider (ex: similarité)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_provider_ref ON kyc_requests(provider_ref);