-- Fix admin role: set role='admin' for the correct admin email
UPDATE users SET role = 'admin' WHERE email = 'ggharibel@gmail.com';
-- Also ensure the original email keeps admin if it exists
UPDATE users SET role = 'admin' WHERE email = 'gharibel@yahoo.fr';
