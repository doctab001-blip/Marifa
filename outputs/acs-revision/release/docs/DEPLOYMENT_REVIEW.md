# Deployment review

The development release is linked to the isolated Vercel project `marifa-clinical` and Supabase project `marifa-development`. It is demonstration-only and is not approved for patient or clinical use.

## Release gates

- [ ] Production database and storage region approved.
- [ ] Real identity provider, MFA and recovery flow configured.
- [ ] Tenant-isolation integration tests pass against at least two organizations.
- [ ] Private file access and signed URL tests pass.
- [ ] Database migrations reviewed, backed up and rehearsed.
- [ ] Clinical records independently verified and approvals evidenced.
- [ ] Demo content excluded from production clinical results.
- [ ] Logs and analytics reviewed for sensitive-data exposure.
- [ ] Production CSP, rate limits and error redaction verified.
- [ ] Accessibility and responsive checks complete.
- [ ] Lint, type check, unit tests, Playwright and production build pass from a clean install.
- [ ] Rollback and recovery owners named and runbook rehearsed.
- [ ] Legal, security, clinical-safety and data-residency approvals recorded.

Vercel compatibility does not establish regulatory compliance, clinical approval, security fitness or data-residency suitability.
