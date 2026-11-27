CREATE TABLE IF NOT EXISTS users (
 user_id TEXT PRIMARY KEY,
 google_sub TEXT UNIQUE,
 email TEXT NOT NULL,
 display_name TEXT,
 first_login_at INTEGER NOT NULL DEFAULT (unixepoch()),
 last_login_at INTEGER NOT NULL DEFAULT (unixepoch()),
 CHECK (last_login_at >= first_login_at)
);
CREATE TABLE IF NOT EXISTS login_sessions (
 session_id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(user_id),
 login_at INTEGER NOT NULL DEFAULT (unixepoch()),
 last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
 expires_at INTEGER NOT NULL,
 logout_at INTEGER,
 ended_at INTEGER,
 end_reason TEXT CHECK (end_reason IN ('logout','expired','revoked')),
 CHECK (expires_at > login_at),
 CHECK (last_seen_at >= login_at),
 CHECK (logout_at IS NULL OR logout_at >= login_at),
 CHECK (ended_at IS NULL OR ended_at >= login_at),
 CHECK ((end_reason IS NULL AND ended_at IS NULL AND logout_at IS NULL)
 OR (end_reason = 'logout' AND ended_at IS NOT NULL AND logout_at IS NOT NULL AND ended_at = logout_at)
 OR (end_reason IN ('expired','revoked') AND ended_at IS NOT NULL AND logout_at IS NULL))
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS login_sessions_user_login_idx ON login_sessions(user_id,login_at DESC);
CREATE INDEX IF NOT EXISTS login_sessions_login_idx ON login_sessions(login_at DESC);
CREATE INDEX IF NOT EXISTS login_sessions_expires_idx ON login_sessions(expires_at) WHERE ended_at IS NULL;
CREATE VIEW IF NOT EXISTS login_history AS SELECT s.session_id,s.user_id,u.email,u.display_name,s.login_at,s.last_seen_at,s.expires_at,s.logout_at,COALESCE(s.ended_at,CASE WHEN s.expires_at<=unixepoch() THEN s.expires_at END) AS ended_at,COALESCE(s.end_reason,CASE WHEN s.expires_at<=unixepoch() THEN 'expired' END) AS end_reason FROM login_sessions s JOIN users u ON u.user_id=s.user_id;
