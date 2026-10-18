-- Editor saves are append-only: a platform administrator must be able to add
-- a new revision for a shared reference topic. The existing shared policy is
-- UPDATE-only, so a valid Bulk/Text editor save is rejected by RLS at INSERT.
-- Keep the authorization boundary identical to the existing update policy.
create policy guideline_version_shared_platform_insert
  on public.guideline_versions for insert
  to authenticated
  with check (
    private.is_platform_admin()
    and exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and g.organization_id is null
        and g.is_shared_reference
    )
  );
