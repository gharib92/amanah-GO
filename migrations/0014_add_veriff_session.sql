-- Migration: Add Veriff KYC session tracking
-- Date: 2026-02-10
-- Purpose: Store Veriff session IDs and verification timestamps

ALTER TABLE users ADD COLUMN kyc_veriff_session_id TEXT;
ALTER TABLE users ADD COLUMN kyc_verified_at TEXT;
CREATE INDEX IF NOT EXISTS idx_users_kyc_veriff_session ON users(kyc_veriff_session_id);
