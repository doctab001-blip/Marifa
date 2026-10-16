# Security checklist

## Implemented foundation

- HTTP-only, same-site demo cookie with secure mode in production.
- No real credentials, production secrets or predictable administrator password.
- Strict TypeScript, Zod-ready dependency set and server-route boundary.
- Security response headers including frame denial, content sniffing prevention and restricted browser permissions.
- Explicit organization identifiers and database membership checks.
- RLS enabled on primary tenant-owned and sensitive tables.
- Separate `has_permission` and membership checks; role display is not authorization.
- Audit event table has no client write policy.
- Shared reference content is distinguishable from hospital-local content.
- No public clinical document URLs or AI provider integration.

## Required before production

- Complete Supabase Auth invitation administration, password recovery and MFA policy; keep demo sessions isolated from production access.
- Add server-side repository functions that derive organization membership from the authenticated user.
- Test RLS with malicious cross-tenant IDs across read, write, search, export and file access.
- Use private storage, file signatures, allow-listed MIME types, size limits, malware scanning and short-lived signed URLs.
- Add server-side rate limiting for authentication, search, upload, export and future AI endpoints.
- Replace development CSP allowances with nonces or hashes.
- Add CSRF threat review for every cookie-authenticated mutation.
- Encrypt backups, document restoration drills and define retention/deletion schedules.
- Redact tokens, secrets and sensitive content from errors, logs and telemetry.
- Add dependency, secret and infrastructure scanning in CI.
- Complete threat modeling and penetration testing.
- Assess Saudi PDPL, implementing regulations, NCA controls, health-sector obligations, residency and cross-border transfer with qualified specialists. No compliance claim is made here.

## Clinical safety controls required

- Maintain named content owners, verified sources, reviewer and approver separation.
- Prevent publication when citations are absent, pathway graphs are invalid or review dates are missing.
- Preserve immutable published versions and explicit supersession links.
- Warn on overdue, withdrawn, expired and conflicting sources.
- Keep illustrative content visibly separated and unavailable to production clinical search.
- Disable AI answers unless retrieval authorization and per-claim citations pass acceptance testing.
