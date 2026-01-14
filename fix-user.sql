-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM users WHERE email = 'test-firebase-new@gmail.com';

-- Créer l'utilisateur de test
INSERT INTO users (
  id, 
  email, 
  name, 
  phone, 
  password_hash, 
  firebase_uid, 
  kyc_status, 
  rating, 
  reviews_count, 
  created_at
) VALUES (
  lower(hex(randomblob(16))),
  'test-firebase-new@gmail.com',
  'Test Firebase User',
  '+33612345679',
  '',
  'FIREBASE_TEST_USER_' || lower(hex(randomblob(8))),
  'VERIFIED',
  0,
  0,
  datetime('now')
);

-- Vérifier
SELECT id, email, name, firebase_uid, kyc_status FROM users WHERE email = 'test-firebase-new@gmail.com';
