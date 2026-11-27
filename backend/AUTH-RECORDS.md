# Login record storage

The existing production Worker binds AUTH_DB to ai-learning-records. Keep LEARNING_DB bound to ai-learning-studio-progress; they serve different purposes.

Run auth-records.sql when preparing an environment. Schema timestamps are server-generated Unix seconds (UTC). Session IDs are SHA-256 fingerprints, never bearer credentials. users.user_id follows the existing Google-subject-derived learning account ID.

Verified login records the account and session before issuing a successful response. POST /public/logout records an explicit logout and revokes that session; other sessions remain valid. Valid pre-migration tokens are registered on first use with their signed issue time. Last activity is updated at most once per five minutes of authenticated requests. Browser closure is not treated as logout. Expired sessions have logout_at NULL; login_history computes their effective end at expires_at even if the browser never reconnects.

Database errors return 503 rather than misreporting a Google verification failure. The client attempts the server logout before clearing its local credential; if the network is unavailable the local credential is cleared and the server session remains valid until its scheduled expiry. The tables and login_history are backend-only; no public all-user history endpoint is exposed.

Verification: scripts/test-auth-records.mjs uses a real temporary SQLite database with Google signature fixtures and the actual Worker route handlers. tests/auth-session-switch.cjs also verifies server notification on explicit logout.
