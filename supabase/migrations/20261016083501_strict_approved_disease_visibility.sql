-- End-user disease visibility is deliberately narrower than admin access.
-- A topic and its current version must both be approved before a non-admin
-- authenticated user can read it through the Data API.
drop policy if exists guideline_read on public.clinical_guidelines;
drop policy if exists guideline_version_read on public.guideline_versions;

create policy guideline_read
  on public.clinical_guidelines for select
  to authenticated
  using (
    (
      status = 'approved'
      and (is_shared_reference or private.is_org_member(organization_id))
    )
    or (organization_id is null and is_shared_reference and private.is_platform_admin())
    or (organization_id is not null and private.is_guideline_admin(organization_id))
  );

create policy guideline_version_read
  on public.guideline_versions for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and (
          (
            g.status = 'approved'
            and guideline_versions.status = 'approved'
            and guideline_versions.is_current
            and (g.is_shared_reference or private.is_org_member(g.organization_id))
          )
          or (g.organization_id is null and g.is_shared_reference and private.is_platform_admin())
          or (g.organization_id is not null and private.is_guideline_admin(g.organization_id))
        )
    )
  );

-- Keep the explicit grants: RLS provides row isolation and the authenticated
-- role needs table access for authorized administrator workflow actions.
grant select, insert, update, delete on table public.clinical_guidelines to authenticated;
grant select, insert, update, delete on table public.guideline_versions to authenticated;
