-- ==========================================
-- AMANAH GO - Seed Data
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
