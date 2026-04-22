-- Table pour stocker les codes de vérification email
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- timestamp Unix en secondes
  used_at INTEGER DEFAULT NULL, -- NULL = non utilisé
  attempts INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_codes(email);
