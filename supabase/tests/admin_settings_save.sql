-- Run against the linked database. Every settings/profile write is rolled back.
begin;

do $test$
declare
  admin_membership public.organization_memberships%rowtype;
begin
  select m.* into strict admin_membership
  from public.organization_memberships m
  where m.account_status = 'active'
    and exists (
      select 1 from public.membership_roles mr
      join public.roles r on r.id = mr.role_id
      where mr.membership_id = m.id
        and r.code in ('org_admin', 'hospital_admin', 'platform_admin')
    )
  order by m.id limit 1;

  perform set_config('request.jwt.claim.sub', admin_membership.user_id::text, true);
  perform set_config('marifa.test_organization', admin_membership.organization_id::text, true);
  perform set_config('marifa.test_membership', admin_membership.id::text, true);
end;
$test$;

set local role authenticated;

do $test$
declare
  target_organization_id uuid := current_setting('marifa.test_organization')::uuid;
  saved public.organization_settings%rowtype;
begin
  perform public.save_admin_settings(
    target_organization_id, 'Settings save rollback check', 'consultant',
    '#0e7490', 'ar-SA', 'UTC'
  );

  if (select display_name from public.profiles where id = auth.uid())
      is distinct from 'Settings save rollback check' then
    raise exception 'Profile save was not persisted';
  end if;
  if (select professional_level from public.organization_memberships
      where id = current_setting('marifa.test_membership')::uuid)
      is distinct from 'consultant'::public.professional_level then
    raise exception 'Designation save was not persisted';
  end if;

  select s.* into strict saved from public.organization_settings s
  where s.organization_id = target_organization_id;
  if saved.primary_color <> '#0e7490' or saved.locale <> 'ar-SA'
      or saved.timezone <> 'UTC' or saved.updated_at <> now() then
    raise exception 'Appearance save or internal timestamp failed';
  end if;

  begin
    perform public.save_admin_settings(
      '00000000-0000-4000-8000-000000000000', 'Forbidden tenant',
      'consultant', '#1f3c88', 'en-SA', 'Asia/Riyadh'
    );
    raise exception 'Cross-tenant save was allowed';
  exception when insufficient_privilege then null;
  end;

  if has_column_privilege(current_user, 'public.organization_settings', 'updated_at', 'UPDATE')
      or has_column_privilege(current_user, 'public.organization_settings', 'updated_at', 'INSERT') then
    raise exception 'Clients gained timestamp write access';
  end if;
  if has_function_privilege('anon',
      'public.save_admin_settings(uuid,text,public.professional_level,text,text,text)', 'EXECUTE') then
    raise exception 'Anonymous settings saves are allowed';
  end if;
end;
$test$;

reset role;
rollback;
select 'Settings save, timestamp, tenant isolation, and anonymous-access checks passed; all test writes rolled back' as result;
