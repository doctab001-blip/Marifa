-- Approve one current, organization-owned guideline version in a single
-- caller-authorized transaction. Approval changes governance state only; it
-- preserves the saved clinical content and records the signed-in reviewer.
create or replace function public.approve_clinical_guideline_version(
  p_guideline_id uuid,
  p_version_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_guideline_status public.content_status;
  v_version_status public.content_status;
  v_content jsonb;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select g.organization_id, g.status, v.status, v.content
    into v_organization_id, v_guideline_status, v_version_status, v_content
    from public.clinical_guidelines g
    join public.guideline_versions v on v.guideline_id = g.id
   where g.id = p_guideline_id
     and v.id = p_version_id
     and v.is_current
   for update of g, v;

  if not found
     or v_organization_id is null
     or v_guideline_status not in ('draft', 'under_review')
     or v_version_status not in ('draft', 'under_review') then
    raise exception using errcode = '22023', message = 'Only the current organization-owned draft version can be approved';
  end if;

  if not private.has_permission(v_organization_id, 'guidelines.edit')
     or not exists (
       select 1
         from public.organization_memberships m
         join public.membership_roles mr on mr.membership_id = m.id
         join public.roles r on r.id = mr.role_id
        where m.organization_id = v_organization_id
          and m.user_id = v_user_id
          and m.account_status = 'active'
          and r.code in ('org_admin', 'hospital_admin', 'platform_admin')
     ) then
    raise exception using errcode = '42501', message = 'Administrator approval permission required';
  end if;

  if jsonb_typeof(v_content) <> 'object'
     or v_content ->> 'id' is distinct from p_guideline_id::text
     or v_content ->> 'status' is null
     or v_content ->> 'status' not in ('draft', 'under_review') then
    raise exception using errcode = '22023', message = 'The current version content is not an approvable draft';
  end if;

  update public.guideline_versions
     set status = 'approved',
         approved_by = v_user_id,
         approved_at = now(),
         content = jsonb_set(
           jsonb_set(v_content - 'clinicalReviewStatus', '{status}', '"approved"'::jsonb, true),
           '{lastReviewed}', to_jsonb((now() at time zone 'Asia/Riyadh')::date::text), true
         ),
         change_summary = 'Approved by an organization administrator.'
   where id = p_version_id
     and guideline_id = p_guideline_id
     and is_current
     and status in ('draft', 'under_review');

  if not found then
    raise exception using errcode = '40001', message = 'The version changed before approval; refresh and try again';
  end if;

  update public.clinical_guidelines
     set status = 'approved'
   where id = p_guideline_id
     and organization_id = v_organization_id
     and status in ('draft', 'under_review');

  if not found then
    raise exception using errcode = '40001', message = 'The topic changed before approval; refresh and try again';
  end if;

  return p_version_id;
end;
$$;

revoke all on function public.approve_clinical_guideline_version(uuid, uuid) from public, anon;
grant execute on function public.approve_clinical_guideline_version(uuid, uuid) to authenticated;
