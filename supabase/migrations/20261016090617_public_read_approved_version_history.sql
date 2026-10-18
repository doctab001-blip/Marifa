-- Approved shared topics are public read-only content. Keep drafts and
-- under-review versions behind authenticated governance policies.
drop policy if exists guideline_read on public.clinical_guidelines;
drop policy if exists guideline_version_read on public.guideline_versions;

create policy guideline_read
  on public.clinical_guidelines for select
  to anon, authenticated
  using (
    (
      status = 'approved'
      and is_shared_reference
      and organization_id is null
    )
    or (
      status = 'approved'
      and is_shared_reference
      and private.is_org_member(organization_id)
    )
    or (organization_id is null and is_shared_reference and private.is_platform_admin())
    or (organization_id is not null and private.is_guideline_admin(organization_id))
  );

create policy guideline_version_read
  on public.guideline_versions for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and g.status = 'approved'
        and guideline_versions.status = 'approved'
        and g.is_shared_reference
        and g.organization_id is null
    )
    or exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and g.status = 'approved'
        and guideline_versions.status = 'approved'
        and g.is_shared_reference
        and private.is_org_member(g.organization_id)
    )
    or exists (
      select 1 from public.clinical_guidelines g
      where g.id = guideline_id
        and ((g.organization_id is null and g.is_shared_reference and private.is_platform_admin())
          or (g.organization_id is not null and private.is_guideline_admin(g.organization_id)))
    )
  );

grant select on table public.clinical_guidelines to anon, authenticated;
grant select on table public.guideline_versions to anon, authenticated;
