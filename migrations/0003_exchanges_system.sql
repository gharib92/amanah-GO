-- Migration 0003: Système d'échanges de colis (RDV Public)
-- Date: 2025-12-23
-- Description: Tables pour gérer les échanges de colis entre Amanautes

-- ==========================================
-- TABLE: exchanges
-- ==========================================
-- Gère les échanges de colis entre expéditeur, voyageur et destinataire

CREATE TABLE IF NOT EXISTS exchanges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Relations
  package_id INTEGER NOT NULL,
  trip_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,        -- Expéditeur
  traveler_id INTEGER NOT NULL,      -- Voyageur
  receiver_id INTEGER,               -- Destinataire final (peut être différent de sender)
  
  -- Informations de collecte (Pickup)
  pickup_location TEXT NOT NULL,     -- "Gare de Lyon, Paris" ou adresse complète
  pickup_latitude REAL,              -- GPS pour carte
  pickup_longitude REAL,
  pickup_date DATETIME,              -- Date/heure proposée
  pickup_code TEXT NOT NULL,         -- Code unique 6 chiffres
  pickup_confirmed BOOLEAN DEFAULT 0,
  pickup_photo_url TEXT,             -- Photo du colis à la collecte
  pickup_notes TEXT,                 -- Notes pour le RDV
  
  -- Informations de livraison (Delivery)
  delivery_location TEXT NOT NULL,   -- "Gare Casa-Voyageurs, Casablanca"
  delivery_latitude REAL,
  delivery_longitude REAL,
  delivery_date DATETIME,            -- Date/heure proposée
  delivery_code TEXT NOT NULL,       -- Code unique 6 chiffres (différent de pickup)
  delivery_confirmed BOOLEAN DEFAULT 0,
  delivery_photo_url TEXT,           -- Photo du colis à la livraison
  delivery_notes TEXT,
  
  -- Sécurité et statut
  status TEXT DEFAULT 'PENDING',     -- PENDING, ACCEPTED, PICKUP_CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED, DISPUTED
  transaction_code TEXT NOT NULL,    -- Code de transaction unique (pour validation finale)
  
  -- Paiement
  amount REAL NOT NULL,              -- Montant total (weight × price_per_kg)
  commission REAL NOT NULL,          -- Commission Amanah GO (12%)
  traveler_earnings REAL NOT NULL,   -- Gain du voyageur (amount - commission)
  payment_status TEXT DEFAULT 'PENDING', -- PENDING, HELD, RELEASED, REFUNDED
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  pickup_confirmed_at DATETIME,
  delivery_confirmed_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  
  -- Relations avec foreign keys
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (traveler_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_exchanges_package ON exchanges(package_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_trip ON exchanges(trip_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_sender ON exchanges(sender_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_traveler ON exchanges(traveler_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);
CREATE INDEX IF NOT EXISTS idx_exchanges_created ON exchanges(created_at);

-- ==========================================
-- TABLE: exchange_messages
-- ==========================================
-- Chat entre expéditeur et voyageur pour coordination

CREATE TABLE IF NOT EXISTS exchange_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exchange_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'TEXT', -- TEXT, IMAGE, LOCATION, SYSTEM
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_exchange ON exchange_messages(exchange_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON exchange_messages(created_at);

-- ==========================================
-- TABLE: public_meeting_places
-- ==========================================
-- Lieux publics suggérés pour les RDV (gares, aéroports, centres commerciaux)

CREATE TABLE IF NOT EXISTS public_meeting_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,               -- TRAIN_STATION, AIRPORT, MALL, CAFE, OTHER
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  description TEXT,
  hours TEXT,                        -- JSON: {"mon": "24/7", ...}
  safety_rating REAL DEFAULT 5.0,   -- 0-5 étoiles
  is_recommended BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meeting_city ON public_meeting_places(city);
CREATE INDEX IF NOT EXISTS idx_meeting_country ON public_meeting_places(country);

-- Insertion de lieux publics par défaut

-- FRANCE - Paris
INSERT OR IGNORE INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) VALUES
  ('Gare de Lyon', 'TRAIN_STATION', 'Place Louis-Armand, 75012', 'Paris', 'France', 48.8443, 2.3736, 'Grande gare SNCF avec de nombreux commerces', '{"all": "24/7"}', 5.0),
  ('Gare du Nord', 'TRAIN_STATION', 'Rue de Dunkerque, 75010', 'Paris', 'France', 48.8809, 2.3553, 'Gare internationale Eurostar et Thalys', '{"all": "24/7"}', 5.0),
  ('Aéroport Charles de Gaulle', 'AIRPORT', 'Terminal 2, 95700 Roissy', 'Paris', 'France', 49.0097, 2.5479, 'Terminal 2 - Zone publique', '{"all": "24/7"}', 5.0),
  ('Centre Commercial Les Halles', 'MALL', '101 Porte Berger, 75001', 'Paris', 'France', 48.8622, 2.3469, 'Grand centre commercial en plein centre', '{"mon-sat": "10h-20h", "sun": "11h-19h"}', 4.5);

-- FRANCE - Marseille
INSERT OR IGNORE INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) VALUES
  ('Gare Saint-Charles', 'TRAIN_STATION', 'Place Victor Hugo, 13001', 'Marseille', 'France', 43.3028, 5.3808, 'Gare principale de Marseille', '{"all": "24/7"}', 5.0),
  ('Aéroport Marseille-Provence', 'AIRPORT', '13700 Marignane', 'Marseille', 'France', 43.4393, 5.2214, 'Terminal 1 - Zone publique', '{"all": "24/7"}', 5.0);

-- MAROC - Casablanca
INSERT OR IGNORE INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) VALUES
  ('Gare Casa-Voyageurs', 'TRAIN_STATION', 'Boulevard Mohammed V', 'Casablanca', 'Maroc', 33.5925, -7.6187, 'Gare ONCF principale de Casablanca', '{"all": "24/7"}', 5.0),
  ('Aéroport Mohammed V', 'AIRPORT', 'Nouasseur, 27000', 'Casablanca', 'Maroc', 33.3675, -7.5898, 'Terminal 1 - Zone publique', '{"all": "24/7"}', 5.0),
  ('Morocco Mall', 'MALL', 'Boulevard de la Corniche', 'Casablanca', 'Maroc', 33.5699, -7.6771, 'Plus grand centre commercial du Maroc', '{"all": "10h-22h"}', 5.0);

-- MAROC - Marrakech
INSERT OR IGNORE INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) VALUES
  ('Gare de Marrakech', 'TRAIN_STATION', 'Avenue Hassan II', 'Marrakech', 'Maroc', 31.6319, -8.0118, 'Gare ONCF de Marrakech', '{"all": "24/7"}', 5.0),
  ('Aéroport Marrakech-Menara', 'AIRPORT', 'Marrakech 40000', 'Marrakech', 'Maroc', 31.6069, -8.0363, 'Terminal - Zone publique', '{"all": "24/7"}', 5.0);

-- MAROC - Rabat
INSERT OR IGNORE INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) VALUES
  ('Gare de Rabat-Ville', 'TRAIN_STATION', 'Avenue Mohammed V', 'Rabat', 'Maroc', 34.0209, -6.8326, 'Gare ONCF principale de Rabat', '{"all": "24/7"}', 5.0),
  ('Mega Mall', 'MALL', 'Hay Riad', 'Rabat', 'Maroc', 33.9672, -6.8737, 'Grand centre commercial', '{"all": "10h-22h"}', 4.5);
