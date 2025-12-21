-- ==========================================
-- AMANAH GO - Airports Database
-- ==========================================

-- Table des aéroports
CREATE TABLE IF NOT EXISTS airports (
  id TEXT PRIMARY KEY,
  iata_code TEXT UNIQUE NOT NULL,
  icao_code TEXT,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  timezone TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_search ON airports(name, city);

-- Aéroports France (principaux)
INSERT OR IGNORE INTO airports (id, iata_code, icao_code, name, city, country, latitude, longitude, timezone) VALUES
  ('cdg', 'CDG', 'LFPG', 'Aéroport Charles de Gaulle', 'Paris', 'France', 49.0097, 2.5479, 'Europe/Paris'),
  ('ory', 'ORY', 'LFPO', 'Aéroport d''Orly', 'Paris', 'France', 48.7233, 2.3794, 'Europe/Paris'),
  ('lys', 'LYS', 'LFLL', 'Aéroport Lyon-Saint Exupéry', 'Lyon', 'France', 45.7256, 5.0811, 'Europe/Paris'),
  ('mrs', 'MRS', 'LFML', 'Aéroport Marseille-Provence', 'Marseille', 'France', 43.4393, 5.2214, 'Europe/Paris'),
  ('nce', 'NCE', 'LFMN', 'Aéroport Nice Côte d''Azur', 'Nice', 'France', 43.6584, 7.2159, 'Europe/Paris'),
  ('tls', 'TLS', 'LFBO', 'Aéroport Toulouse-Blagnac', 'Toulouse', 'France', 43.6290, 1.3638, 'Europe/Paris'),
  ('bva', 'BVA', 'LFOB', 'Aéroport Paris-Beauvais', 'Beauvais', 'France', 49.4544, 2.1128, 'Europe/Paris'),
  ('bod', 'BOD', 'LFBD', 'Aéroport de Bordeaux-Mérignac', 'Bordeaux', 'France', 44.8283, -0.7153, 'Europe/Paris'),
  ('nte', 'NTE', 'LFRS', 'Aéroport Nantes Atlantique', 'Nantes', 'France', 47.1532, -1.6108, 'Europe/Paris'),
  ('sxb', 'SXB', 'LFST', 'Aéroport de Strasbourg', 'Strasbourg', 'France', 48.5383, 7.6283, 'Europe/Paris'),
  ('mpl', 'MPL', 'LFMT', 'Aéroport Montpellier-Méditerranée', 'Montpellier', 'France', 43.5762, 3.9630, 'Europe/Paris');

-- Aéroports Maroc (tous les principaux)
INSERT OR IGNORE INTO airports (id, iata_code, icao_code, name, city, country, latitude, longitude, timezone) VALUES
  ('cmn', 'CMN', 'GMMN', 'Aéroport Mohammed V', 'Casablanca', 'Maroc', 33.3675, -7.5898, 'Africa/Casablanca'),
  ('rak', 'RAK', 'GMMX', 'Aéroport Marrakech-Ménara', 'Marrakech', 'Maroc', 31.6069, -8.0363, 'Africa/Casablanca'),
  ('aga', 'AGA', 'GMAD', 'Aéroport d''Agadir-Al Massira', 'Agadir', 'Maroc', 30.3250, -9.4131, 'Africa/Casablanca'),
  ('fez', 'FEZ', 'GMFF', 'Aéroport de Fès-Saïss', 'Fès', 'Maroc', 33.9273, -4.9780, 'Africa/Casablanca'),
  ('tng', 'TNG', 'GMTT', 'Aéroport de Tanger-Ibn Battouta', 'Tanger', 'Maroc', 35.7269, -5.9169, 'Africa/Casablanca'),
  ('oud', 'OUD', 'GMFO', 'Aéroport d''Oujda-Angads', 'Oujda', 'Maroc', 34.7872, -1.9240, 'Africa/Casablanca'),
  ('rba', 'RBA', 'GMME', 'Aéroport de Rabat-Salé', 'Rabat', 'Maroc', 34.0515, -6.7515, 'Africa/Casablanca'),
  ('esu', 'ESU', 'GMMI', 'Aéroport d''Essaouira-Mogador', 'Essaouira', 'Maroc', 31.3975, -9.6816, 'Africa/Casablanca'),
  ('ndr', 'NDR', 'GMMW', 'Aéroport de Nador-El Aroui', 'Nador', 'Maroc', 34.9888, -3.0282, 'Africa/Casablanca'),
  ('ttu', 'TTU', 'GMTT', 'Aéroport de Tétouan-Sania Ramel', 'Tétouan', 'Maroc', 35.5943, -5.3202, 'Africa/Casablanca');

-- Table pour stocker les vols récents (cache)
CREATE TABLE IF NOT EXISTS flight_cache (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  flight_number TEXT NOT NULL,
  airline_name TEXT,
  airline_iata TEXT,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  flight_status TEXT,
  aircraft_type TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  
  FOREIGN KEY (departure_airport) REFERENCES airports(iata_code),
  FOREIGN KEY (arrival_airport) REFERENCES airports(iata_code)
);

CREATE INDEX IF NOT EXISTS idx_flight_cache_number ON flight_cache(flight_number);
CREATE INDEX IF NOT EXISTS idx_flight_cache_route ON flight_cache(departure_airport, arrival_airport);
CREATE INDEX IF NOT EXISTS idx_flight_cache_expires ON flight_cache(expires_at);
