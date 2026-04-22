-- Table pour le rate limiting persistant
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,       -- format: "ip:path"
  count INTEGER DEFAULT 1,
  reset_at INTEGER NOT NULL   -- timestamp Unix en secondes
);
