// Script d'initialisation de la base de données
// Ce script exécute les migrations SQL via l'API

const MIGRATION_SQL = `
-- ==========================================
-- AMANAH GO - Initial Database Schema
-- ==========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- KYC
  kyc_status TEXT DEFAULT 'PENDING' CHECK(kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  kyc_document_url TEXT,
  kyc_selfie_url TEXT,
  kyc_verified_at DATETIME,
  
  -- Stats
  total_trips INTEGER DEFAULT 0,
  total_packages INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  
  -- OAuth
  google_id TEXT UNIQUE,
  facebook_id TEXT UNIQUE,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Trips Table (Voyageurs)
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  
  -- Itinéraire
  departure_city TEXT NOT NULL,
  departure_country TEXT DEFAULT 'France',
  arrival_city TEXT NOT NULL,
  arrival_country TEXT DEFAULT 'Maroc',
  departure_date DATETIME NOT NULL,
  
  -- Capacité
  available_weight REAL NOT NULL CHECK(available_weight > 0),
  price_per_kg REAL NOT NULL CHECK(price_per_kg >= 0),
  
  -- Statut
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'FULL', 'COMPLETED', 'CANCELLED')),
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Packages Table (Colis)
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  
  -- Description
  title TEXT NOT NULL,
  description TEXT,
  content_declaration TEXT NOT NULL,
  
  -- Dimensions
  weight REAL NOT NULL CHECK(weight > 0),
  length REAL,
  width REAL,
  height REAL,
  
  -- Prix
  budget REAL NOT NULL CHECK(budget >= 0),
  
  -- Photos (JSON array)
  photos TEXT DEFAULT '[]',
  
  -- Trajet souhaité
  departure_city TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  preferred_date DATETIME,
  
  -- Statut
  status TEXT DEFAULT 'PUBLISHED' CHECK(status IN ('PUBLISHED', 'RESERVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  package_id TEXT NOT NULL,
  trip_id TEXT NOT NULL,
  shipper_id TEXT NOT NULL,
  traveler_id TEXT NOT NULL,
  
  -- Prix
  agreed_price REAL NOT NULL CHECK(agreed_price >= 0),
  platform_fee REAL NOT NULL DEFAULT 0.12,
  traveler_payout REAL NOT NULL,
  
  -- Paiement Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  
  -- Statut
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED')),
  
  -- Livraison
  delivery_code TEXT,
  pickup_photo_url TEXT,
  delivery_photo_url TEXT,
  pickup_at DATETIME,
  delivered_at DATETIME,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (traveler_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  transaction_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewed_id TEXT NOT NULL,
  
  -- Note
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  
  -- Critères détaillés
  punctuality_rating INTEGER CHECK(punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating INTEGER CHECK(communication_rating >= 1 AND communication_rating <= 5),
  care_rating INTEGER CHECK(care_rating >= 1 AND care_rating <= 5),
  
  -- Commentaire
  comment TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE(transaction_id, reviewer_id)
);

-- Messages Table (Chat)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  transaction_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  
  -- Contenu
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  
  -- Type
  type TEXT NOT NULL CHECK(type IN ('TRANSACTION', 'MESSAGE', 'REVIEW', 'KYC', 'SYSTEM')),
  
  -- Contenu
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  -- Statut
  is_read INTEGER DEFAULT 0,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_trips_cities ON trips(departure_city, arrival_city);

CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_cities ON packages(departure_city, arrival_city);

CREATE INDEX IF NOT EXISTS idx_transactions_package_id ON transactions(package_id);
CREATE INDEX IF NOT EXISTS idx_transactions_trip_id ON transactions(trip_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shipper_id ON transactions(shipper_id);
CREATE INDEX IF NOT EXISTS idx_transactions_traveler_id ON transactions(traveler_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON reviews(transaction_id);

CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Test Users
INSERT OR IGNORE INTO users (id, email, name, phone, kyc_status, rating, reviews_count, created_at) VALUES 
  ('user001', 'mohammed@example.com', 'Mohammed Alami', '+33612345678', 'VERIFIED', 4.8, 12, datetime('now', '-6 months')),
  ('user002', 'fatima@example.com', 'Fatima Benali', '+33623456789', 'VERIFIED', 4.9, 8, datetime('now', '-4 months')),
  ('user003', 'youssef@example.com', 'Youssef Idrissi', '+33634567890', 'VERIFIED', 4.5, 5, datetime('now', '-2 months')),
  ('user004', 'amina@example.com', 'Amina Zerouali', '+33645678901', 'PENDING', 0.0, 0, datetime('now', '-1 week'));

-- Test Trips
INSERT OR IGNORE INTO trips (id, user_id, departure_city, arrival_city, departure_date, available_weight, price_per_kg, status) VALUES 
  ('trip001', 'user001', 'Paris', 'Casablanca', datetime('now', '+5 days'), 15.0, 8.0, 'ACTIVE'),
  ('trip002', 'user003', 'Lyon', 'Marrakech', datetime('now', '+10 days'), 20.0, 7.5, 'ACTIVE'),
  ('trip003', 'user001', 'Marseille', 'Rabat', datetime('now', '+15 days'), 12.0, 9.0, 'ACTIVE');

-- Test Packages
INSERT OR IGNORE INTO packages (id, user_id, title, description, content_declaration, weight, budget, departure_city, arrival_city, preferred_date, status, photos) VALUES 
  ('pkg001', 'user002', 'Cadeaux pour famille', 'Vêtements et jouets pour enfants', 'Vêtements, jouets, produits non périssables', 8.0, 70.0, 'Paris', 'Casablanca', datetime('now', '+5 days'), 'PUBLISHED', '["https://example.com/photo1.jpg"]'),
  ('pkg002', 'user004', 'Médicaments pour maman', 'Médicaments prescrits + vitamines', 'Médicaments avec ordonnance', 3.0, 30.0, 'Lyon', 'Marrakech', datetime('now', '+10 days'), 'PUBLISHED', '["https://example.com/photo2.jpg"]'),
  ('pkg003', 'user002', 'Documents importants', 'Contrats et documents administratifs', 'Documents administratifs', 1.0, 15.0, 'Paris', 'Rabat', datetime('now', '+7 days'), 'PUBLISHED', '[]');

-- Test Transaction (exemple de transaction complétée)
INSERT OR IGNORE INTO transactions (id, package_id, trip_id, shipper_id, traveler_id, agreed_price, platform_fee, traveler_payout, status, delivery_code, created_at) VALUES 
  ('txn001', 'pkg001', 'trip001', 'user002', 'user001', 64.0, 0.12, 56.32, 'PAID', '123456', datetime('now', '-2 days'));

-- Test Reviews
INSERT OR IGNORE INTO reviews (id, transaction_id, reviewer_id, reviewed_id, rating, punctuality_rating, communication_rating, care_rating, comment) VALUES 
  ('rev001', 'txn001', 'user002', 'user001', 5, 5, 5, 5, 'Excellent voyageur ! Très professionnel et ponctuel.');
`;

console.log('Initializing database...');
console.log('SQL:', MIGRATION_SQL.substring(0, 200) + '...');
