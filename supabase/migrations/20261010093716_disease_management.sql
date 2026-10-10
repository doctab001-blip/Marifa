-- Disease Management Module: evolve the existing guideline foundation without
-- replacing tenant-aware foreign keys, audit fields, or lifecycle metadata.

alter table public.clinical_guidelines
  add column if not exists specialty text,
  add column if not exists status public.content_status not null default 'draft';

alter table public.clinical_guidelines
  drop constraint if exists clinical_guidelines_shared_scope_check;

alter table public.clinical_guidelines
  add constraint clinical_guidelines_shared_scope_check
  check (
    (organization_id is null and is_shared_reference)
    or (organization_id is not null and not is_shared_reference)
  );

alter table public.guideline_versions
  add column if not exists version_number text,
  add column if not exists is_current boolean not null default false;

update public.guideline_versions
set version_number = version
where version_number is null;

alter table public.guideline_versions
  alter column version_number set not null,
  alter column created_by drop not null;

alter table public.guideline_versions
  drop constraint if exists guideline_versions_content_object_check;

alter table public.guideline_versions
  add constraint guideline_versions_content_object_check
  check (jsonb_typeof(content) = 'object');

create unique index if not exists guideline_versions_one_current_idx
  on public.guideline_versions(guideline_id)
  where is_current;

create index if not exists clinical_guidelines_scope_status_idx
  on public.clinical_guidelines(organization_id, status, specialty);

create index if not exists guideline_versions_guideline_current_idx
  on public.guideline_versions(guideline_id, is_current, created_at desc);

drop policy if exists guideline_read on public.clinical_guidelines;
drop policy if exists guideline_write on public.clinical_guidelines;
drop policy if exists guideline_version_read on public.guideline_versions;
drop policy if exists guideline_version_write on public.guideline_versions;

create policy guideline_read
  on public.clinical_guidelines for select
  to authenticated
  using (is_shared_reference or public.is_org_member(organization_id));

create policy guideline_write
  on public.clinical_guidelines for all
  to authenticated
  using (
    organization_id is not null
    and public.has_permission(organization_id, 'guidelines.edit')
  )
  with check (
    organization_id is not null
    and not is_shared_reference
    and public.has_permission(organization_id, 'guidelines.edit')
  );

create policy guideline_version_read
  on public.guideline_versions for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and (g.is_shared_reference or public.is_org_member(g.organization_id))
    )
  );

create policy guideline_version_write
  on public.guideline_versions for all
  to authenticated
  using (
    exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and g.organization_id is not null
        and public.has_permission(g.organization_id, 'guidelines.edit')
    )
  )
  with check (
    exists (
      select 1
      from public.clinical_guidelines g
      where g.id = guideline_id
        and g.organization_id is not null
        and public.has_permission(g.organization_id, 'guidelines.edit')
    )
  );

revoke all on table public.clinical_guidelines from anon;
revoke all on table public.guideline_versions from anon;
grant select, insert, update, delete on table public.clinical_guidelines to authenticated;
grant select, insert, update, delete on table public.guideline_versions to authenticated;
grant select, insert, update, delete on table public.clinical_guidelines to service_role;
grant select, insert, update, delete on table public.guideline_versions to service_role;

comment on column public.guideline_versions.content is
  'Strict DiseaseDetailSchema JSON payload; validated by the server-side seed pipeline before persistence.';
