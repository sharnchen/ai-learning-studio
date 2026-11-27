# Login record storage

The existing production Worker binds AUTH_DB to ai-learning-records. Keep LEARNING_DB bound to ai-learning-studio-progress; they serve different purposes.

Run auth-records.sql when preparing an environment. Schema timestamps are server-generated Unix seconds (UTC). Session IDs are SHA-256 fingerprints, never bearer credentials. users.user_id follows the existing Google-subject-derived learning account ID.

Verified login records the account and session before issuing a successful response. POST /public/logout records an explicit logout and revokes that session; other sessions remain valid. Valid pre-migration tokens are registered on first use with their signed issue time. Last activity is updated at most once per five minutes of authenticated requests. Browser closure is not treated as logout. Expired sessions have logout_at NULL; login_history computes their effective end at expires_at even if the browser never reconnects.

Database errors return 503 rather than misreporting a Google verification failure. The client attempts the server logout before clearing its local credential; if the network is unavailable the local credential is cleared and the server session remains valid until its scheduled expiry. The tables and login_history are backend-only; no public all-user history endpoint is exposed.

Verification: scripts/test-auth-records.mjs uses a real temporary SQLite database with Google signature fixtures and the actual Worker route handlers. tests/auth-session-switch.cjs also verifies server notification on explicit logout.

## Database management

The canonical website route `#admin` provides filtered, paginated account and login-history queries plus a current-page CSV export. Only the server-verified Google emails `sharnchen@gmail.com` and `liesharn@gmail.com` may use `/public/admin/users`, `/public/admin/sessions`, or `/public/admin/summary`. Origin, session signature, expiry and revocation checks run before the role check. The browser uses the server's `canManageDatabase` flag only to present the entry point; it does not grant authorization. Queries use bound parameters and fixed columns, and never accept raw SQL. No database credential or session fingerprint is returned by these endpoints. Date filters use Taiwan calendar days; stored timestamps remain UTC Unix seconds. Responses are not cached, and pending admin requests/data are discarded on route changes or account switches. CSV export quotes fields and neutralizes spreadsheet formula prefixes.
