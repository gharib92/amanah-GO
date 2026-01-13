-- Migration: Add Firebase UID column
-- Date: 2026-01-13

ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
