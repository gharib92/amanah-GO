ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'gharibel@yahoo.fr';
