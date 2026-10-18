-- Replace the retired teal workspace theme with Aqua Blue.
-- Other selectable theme colours and all organization settings remain unchanged.

update public.organization_settings
set primary_color = '#0e7490'
where lower(primary_color) = '#0f766e';

create or replace function public.save_admin_settings(
  p_organization_id uuid,
  p_display_name text,
  p_professional_level public.professional_level,
  p_primary_color text,
  p_locale text,
  p_timezone text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.organization_memberships m
    join public.membership_roles mr on mr.membership_id = m.id
    join public.roles r on r.id = mr.role_id
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.account_status = 'active'
      and r.code in ('org_admin', 'hospital_admin', 'platform_admin')
  ) then
    raise exception 'Organization administrator access required' using errcode = '42501';
  end if;

  if char_length(trim(p_display_name)) not between 2 and 80 then
    raise exception 'Name must be between 2 and 80 characters' using errcode = '22023';
  end if;

  if p_primary_color not in ('#1f3c88', '#0e7490', '#166534', '#7c3aed', '#be123c') then
    raise exception 'Choose one of the available color themes' using errcode = '22023';
  end if;

  if p_locale not in ('en-SA', 'ar-SA') then
    raise exception 'Choose a supported workspace language' using errcode = '22023';
  end if;

  if p_timezone not in ('Asia/Riyadh', 'UTC') then
    raise exception 'Choose a supported workspace time zone' using errcode = '22023';
  end if;

  update public.profiles
  set display_name = trim(p_display_name)
  where id = (select auth.uid());
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  update public.organization_memberships
  set professional_level = p_professional_level
  where organization_id = p_organization_id
    and user_id = (select auth.uid())
    and account_status = 'active';
  if not found then
    raise exception 'Active organization membership not found' using errcode = 'P0002';
  end if;

  insert into public.organization_settings (organization_id, primary_color, locale, timezone)
  values (p_organization_id, p_primary_color, p_locale, p_timezone)
  on conflict (organization_id) do update
    set primary_color = excluded.primary_color,
        locale = excluded.locale,
        timezone = excluded.timezone;
end;
$function$;
