-- Temporary credential-free UI mode uses a server-only Supabase secret key.
-- Keep this RPC unavailable to browser roles and remove it when login returns.
create or replace function public.approve_clinical_guideline_version_as_temporary_admin(
  p_guideline_id uuid,
  p_version_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_organization_id uuid;
  v_is_shared boolean;
  v_guideline_status public.content_status;
  v_version_status public.content_status;
  v_is_current boolean;
  v_content jsonb;
begin
  if not exists (
    select 1
      from public.organization_memberships m
      join public.membership_roles mr on mr.membership_id = m.id
      join public.roles r on r.id = mr.role_id
     where m.user_id = p_actor_id
       and m.account_status = 'active'
       and r.code = 'platform_admin'
  ) then
    raise exception using errcode = '42501', message = 'Configured temporary actor must be an active platform administrator';
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
    if not v_is_shared then
      raise exception using errcode = '42501', message = 'Shared-reference approval required';
    end if;
  elsif not v_is_current or v_guideline_status not in ('draft', 'under_review') then
    raise exception using errcode = '42501', message = 'The organization draft is not approvable';
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
         approved_by = p_actor_id,
         approved_at = now(),
         content = jsonb_set(
           jsonb_set(v_content - 'clinicalReviewStatus', '{status}', '"approved"'::jsonb, true),
           '{lastReviewed}', to_jsonb((now() at time zone 'Asia/Riyadh')::date::text), true
         ),
         change_summary = 'Approved in temporary credential-free admin mode; configured platform administrator recorded.'
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

revoke all on function public.approve_clinical_guideline_version_as_temporary_admin(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.approve_clinical_guideline_version_as_temporary_admin(uuid, uuid, uuid) to service_role;

comment on function public.approve_clinical_guideline_version_as_temporary_admin(uuid, uuid, uuid) is
  'Temporary server-only approval bridge for credential-free Marifa administration. Remove when interactive authentication is restored.';
