-- Shared catalogue policies may evaluate the membership predicate even when
-- organization_id is null. Permit that predicate without exposing it as a
-- public-schema RPC; unauthenticated auth.uid() still resolves to null.
grant usage on schema private to anon;
grant execute on function private.is_org_member(uuid) to anon;
