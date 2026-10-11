-- Let a signed-in platform administrator edit and approve shared draft
-- versions while retaining the existing organization-scoped policy.
create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships m
    join public.membership_roles mr on mr.membership_id = m.id
    join public.roles r on r.id = mr.role_id
    where m.user_id = auth.uid()
      and m.account_status = 'active'
      and r.code = 'platform_admin'
  );
$function$;

revoke all on function private.is_platform_admin() from public, anon;
grant execute on function private.is_platform_admin() to authenticated;

create or replace function private.is_guideline_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select auth.uid() is not null and exists (
    select 1
    from public.organization_memberships m
    join public.membership_roles mr on mr.membership_id = m.id
    join public.roles r on r.id = mr.role_id
    where m.organization_id = target_organization_id
      and m.user_id = auth.uid()
      and m.account_status = 'active'
      and r.code in ('org_admin', 'hospital_admin', 'platform_admin')
  ) and private.has_permission(target_organization_id, 'guidelines.edit');
$function$;

revoke all on function private.is_guideline_admin(uuid) from public, anon;
grant execute on function private.is_guideline_admin(uuid) to authenticated;

drop policy if exists guideline_write on public.clinical_guidelines;
drop policy if exists guideline_org_write on public.clinical_guidelines;
drop policy if exists guideline_shared_platform_update on public.clinical_guidelines;

create policy guideline_org_write
  on public.clinical_guidelines for all
  to authenticated
  using (organization_id is not null and private.is_guideline_admin(organization_id))
  with check (organization_id is not null and not is_shared_reference and private.is_guideline_admin(organization_id));

create policy guideline_shared_platform_update
  on public.clinical_guidelines for update
  to authenticated
  using (organization_id is null and is_shared_reference and private.is_platform_admin())
  with check (organization_id is null and is_shared_reference and private.is_platform_admin());

drop policy if exists guideline_version_write on public.guideline_versions;
drop policy if exists guideline_version_org_write on public.guideline_versions;
drop policy if exists guideline_version_shared_platform_update on public.guideline_versions;

create policy guideline_version_org_write
  on public.guideline_versions for all
  to authenticated
  using (exists (
    select 1 from public.clinical_guidelines g
    where g.id = guideline_id and g.organization_id is not null
      and private.is_guideline_admin(g.organization_id)
  ))
  with check (exists (
    select 1 from public.clinical_guidelines g
    where g.id = guideline_id and g.organization_id is not null
      and private.is_guideline_admin(g.organization_id)
  ));

create policy guideline_version_shared_platform_update
  on public.guideline_versions for update
  to authenticated
  using (private.is_platform_admin() and exists (
    select 1 from public.clinical_guidelines g
    where g.id = guideline_id and g.organization_id is null and g.is_shared_reference
  ))
  with check (private.is_platform_admin() and exists (
    select 1 from public.clinical_guidelines g
    where g.id = guideline_id and g.organization_id is null and g.is_shared_reference
  ));

create or replace function public.approve_clinical_guideline_version(
  p_guideline_id uuid,
  p_version_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_is_shared boolean;
  v_guideline_status public.content_status;
  v_version_status public.content_status;
  v_is_current boolean;
  v_content jsonb;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select g.organization_id, g.is_shared_reference, g.status, v.status, v.is_current, v.content
    into v_organization_id, v_is_shared, v_guideline_status, v_version_status, v_is_current, v_content
    from public.clinical_guidelines g
    join public.guideline_versions v on v.guideline_id = g.id
   where g.id = p_guideline_id and v.id = p_version_id
   for update of g, v;

  if not found or v_version_status not in ('draft', 'under_review') then
    raise exception using errcode = '22023', message = 'Only a draft or under-review version can be approved';
  end if;

  if v_organization_id is null then
    if not v_is_shared or not private.is_platform_admin() then
      raise exception using errcode = '42501', message = 'Platform administrator approval required for shared drafts';
    end if;
  elsif not v_is_current
     or v_guideline_status not in ('draft', 'under_review')
     or not private.is_guideline_admin(v_organization_id) then
    raise exception using errcode = '42501', message = 'Organization administrator approval required';
  end if;

  if jsonb_typeof(v_content) <> 'object'
     or v_content ->> 'id' is distinct from p_guideline_id::text
     or v_content ->> 'status' not in ('draft', 'under_review') then
    raise exception using errcode = '22023', message = 'The selected version content is not an approvable draft';
  end if;

  if v_organization_id is null then
    update public.guideline_versions
       set is_current = false
     where guideline_id = p_guideline_id and is_current and id <> p_version_id;
  end if;

  update public.guideline_versions
     set status = 'approved',
         is_current = true,
         approved_by = v_user_id,
         approved_at = now(),
         content = jsonb_set(
           jsonb_set(v_content - 'clinicalReviewStatus', '{status}', '"approved"'::jsonb, true),
           '{lastReviewed}', to_jsonb((now() at time zone 'Asia/Riyadh')::date::text), true
         ),
         change_summary = 'Approved by an authorized administrator.'
   where id = p_version_id and guideline_id = p_guideline_id and status in ('draft', 'under_review');

  if not found then
    raise exception using errcode = '40001', message = 'The version changed before approval; refresh and try again';
  end if;

  update public.clinical_guidelines
     set status = 'approved', title = v_content ->> 'title', specialty = v_content ->> 'specialty'
   where id = p_guideline_id
     and ((v_organization_id is null and organization_id is null and is_shared_reference)
       or (v_organization_id is not null and organization_id = v_organization_id));

  if not found then
    raise exception using errcode = '40001', message = 'The topic changed before approval; refresh and try again';
  end if;

  return p_version_id;
end;
$function$;

revoke all on function public.approve_clinical_guideline_version(uuid, uuid) from public, anon;
grant execute on function public.approve_clinical_guideline_version(uuid, uuid) to authenticated;

comment on function public.approve_clinical_guideline_version(uuid, uuid) is
  'Approves an exact governed version, records the reviewer and promotes shared drafts only for platform administrators.';
