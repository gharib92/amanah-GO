-- ==========================================
-- AMANAH GO - Add Flight Details to Trips
-- Migration 0005
-- ==========================================

-- Add flight-related columns to trips table
ALTER TABLE trips ADD COLUMN departure_airport TEXT;
ALTER TABLE trips ADD COLUMN arrival_airport TEXT;
ALTER TABLE trips ADD COLUMN flight_number TEXT;
ALTER TABLE trips ADD COLUMN description TEXT;
ALTER TABLE trips ADD COLUMN flexible_dates INTEGER DEFAULT 0;

-- Add indexes for search
CREATE INDEX IF NOT EXISTS idx_trips_airports ON trips(departure_airport, arrival_airport);
CREATE INDEX IF NOT EXISTS idx_trips_flight_number ON trips(flight_number);
CREATE INDEX IF NOT EXISTS idx_trips_flexible ON trips(flexible_dates);
