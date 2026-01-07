-- Migration: Add security code attempts tracking
-- Date: 2024-12-31
-- Description: Add pickup_attempts and delivery_attempts columns to exchanges table

-- Add pickup_attempts column
ALTER TABLE exchanges ADD COLUMN pickup_attempts INTEGER DEFAULT 0;

-- Add delivery_attempts column
ALTER TABLE exchanges ADD COLUMN delivery_attempts INTEGER DEFAULT 0;

-- Update existing records to have 0 attempts
UPDATE exchanges SET pickup_attempts = 0 WHERE pickup_attempts IS NULL;
UPDATE exchanges SET delivery_attempts = 0 WHERE delivery_attempts IS NULL;
