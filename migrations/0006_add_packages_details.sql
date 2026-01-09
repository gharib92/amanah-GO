-- ==========================================
-- AMANAH GO - Add Details to Packages
-- Migration 0006
-- ==========================================

-- Add missing columns to packages table
ALTER TABLE packages ADD COLUMN dimensions TEXT;
ALTER TABLE packages ADD COLUMN departure_country TEXT DEFAULT 'France';
ALTER TABLE packages ADD COLUMN arrival_country TEXT DEFAULT 'Maroc';
ALTER TABLE packages ADD COLUMN flexible_dates INTEGER DEFAULT 0;

-- Add indexes for search
CREATE INDEX IF NOT EXISTS idx_packages_flexible ON packages(flexible_dates);
CREATE INDEX IF NOT EXISTS idx_packages_countries ON packages(departure_country, arrival_country);
