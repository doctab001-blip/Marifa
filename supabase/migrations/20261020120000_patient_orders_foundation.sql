-- Protocol -> patient order integration: minimal patient / encounter / draft-order foundation.
--
-- Marifa had no patient, encounter or order tables. This migration adds the smallest set needed to apply a
-- clinical protocol to a patient encounter as DRAFT orders:
--   patients, encounters, patient_orders, patient_order_provenance,
--   protocol_order_sets, protocol_order_items (immutable per-version snapshots of what a protocol proposed).
--
-- Safety rules enforced here, not just in the application:
--   * an order can only reference an encounter that belongs to the same patient and organisation (composite keys);
--   * orders are never signed by this module (status 'signed' is rejected unless a future authorised workflow opts in);
--   * signed and cancelled orders are immutable; orders are never deleted (they are cancelled);
--   * an incomplete order, or a conditional order whose condition was not confirmed, can never be 'reviewed';
--   * applying a protocol is one transaction (snapshot + orders + provenance + audit commit together or not at all);
--   * possible duplicates are refused unless the clinician explicitly allowed them;
--   * access follows ASSIGNED ROLES only (professional_level is user-editable and is deliberately not used).
--
-- Demonstration data only: the platform is not approved for real patient data (see docs/DEPLOYMENT_REVIEW.md).

create or replace function public.normalize_order_name(value text)
returns text language sql immutable set search_path = public as $$
  select regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '', 'g');
$$;

-- Role check for an explicit user (used by the apply function, which may run for a service-role caller).
create or replace function public.user_can_manage_patient_orders(target_org uuid, target_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from organization_memberships m
    join membership_roles mr on mr.membership_id = m.id
    join roles r on r.id = mr.role_id
    where m.organization_id = target_org and m.user_id = target_user and m.account_status = 'active'
      and r.code in ('consultant', 'specialist', 'mbbs_gp', 'org_admin', 'hospital_admin', 'platform_admin')
  );
$$;

create or replace function public.can_manage_patient_orders(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_can_manage_patient_orders(target_org, auth.uid());
$$;

create or replace function public.can_read_patient_orders(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_can_manage_patient_orders(target_org, auth.uid()) or exists (
    select 1
    from organization_memberships m
    join membership_roles mr on mr.membership_id = m.id
    join roles r on r.id = mr.role_id
    where m.organization_id = target_org and m.user_id = auth.uid() and m.account_status = 'active' and r.code = 'auditor'
  );
$$;

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  mrn text not null check (length(trim(mrn)) between 1 and 40),
  full_name text not null check (length(trim(full_name)) between 1 and 160),
  date_of_birth date,
  sex text check (sex in ('female', 'male', 'other', 'unknown')),
  is_fictional boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, mrn),
  unique (id, organization_id)
);

create table public.encounters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  patient_id uuid not null,
  encounter_type text not null default 'emergency' check (encounter_type in ('emergency', 'inpatient', 'outpatient')),
  status text not null default 'active' check (status in ('active', 'closed')),
  started_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by uuid references public.profiles(id),
  foreign key (patient_id, organization_id) references public.patients(id, organization_id),
  unique (id, patient_id),
  unique (id, organization_id),
  check ((status = 'closed') = (closed_at is not null))
);
create index encounters_patient_status_idx on public.encounters(patient_id, status);
create index encounters_org_status_idx on public.encounters(organization_id, status, started_at desc);

-- What a protocol version proposed, frozen at first use. Later protocol edits never change these rows.
create table public.protocol_order_sets (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.clinical_guidelines(id),
  protocol_version_id uuid not null references public.guideline_versions(id),
  protocol_version text not null,
  title text not null,
  approval_status text not null,
  derivation text not null default 'structured_fields_v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (protocol_version_id)
);

create table public.protocol_order_items (
  id uuid primary key default gen_random_uuid(),
  order_set_id uuid not null references public.protocol_order_sets(id) on delete cascade,
  source_key text not null,
  order_type text not null check (order_type in ('laboratory', 'imaging', 'investigation', 'medication', 'procedure', 'monitoring')),
  order_name text not null,
  catalog_reference_id uuid,
  instructions text not null default '',
  order_parameters jsonb not null default '{}'::jsonb,
  required_information jsonb not null default '[]'::jsonb,
  condition_rules jsonb not null default '[]'::jsonb,
  requirement text not null check (requirement in ('required', 'optional', 'conditional')),
  is_optional boolean not null default false,
  display_order integer not null default 0,
  unique (order_set_id, source_key)
);

create table public.patient_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  order_type text not null check (order_type in ('laboratory', 'imaging', 'investigation', 'medication', 'procedure', 'monitoring')),
  order_name text not null check (length(trim(order_name)) between 1 and 240),
  category text not null default '',
  priority text check (priority in ('routine', 'urgent', 'stat')),
  indication text not null default '',
  instructions text not null default '',
  details jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'signed', 'cancelled')),
  incomplete boolean not null default false,
  missing_fields jsonb not null default '[]'::jsonb,
  is_conditional boolean not null default false,
  condition_text text not null default '',
  condition_confirmed boolean not null default false,
  is_manual boolean not null default false,
  is_edited boolean not null default false,
  modified_from_protocol boolean not null default false,
  application_id uuid,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id),
  foreign key (encounter_id, patient_id) references public.encounters(id, patient_id),
  foreign key (encounter_id, organization_id) references public.encounters(id, organization_id)
);
create index patient_orders_encounter_status_idx on public.patient_orders(encounter_id, status);
create index patient_orders_patient_idx on public.patient_orders(organization_id, patient_id, created_at desc);

create table public.patient_order_provenance (
  id uuid primary key default gen_random_uuid(),
  patient_order_id uuid not null unique references public.patient_orders(id),
  organization_id uuid not null,
  encounter_id uuid not null,
  application_id uuid not null,
  protocol_id uuid not null references public.clinical_guidelines(id),
  protocol_version_id uuid not null references public.guideline_versions(id),
  protocol_order_item_id uuid not null references public.protocol_order_items(id),
  source_module text not null check (source_module in ('disease_management', 'clinical_guidelines')),
  protocol_title text not null,
  protocol_version text not null,
  source_key text not null,
  applied_by uuid references public.profiles(id),
  applied_at timestamptz not null default now()
);
create index patient_order_provenance_lookup_idx on public.patient_order_provenance(encounter_id, protocol_id, source_key);
create index patient_order_provenance_application_idx on public.patient_order_provenance(application_id);

-- ---------------------------------------------------------------------------------------------------------------
-- Guards and audit
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.patient_orders_guard()
returns trigger language plpgsql set search_path = public as $$
declare
  content_changed boolean;
begin
  if new.status = 'signed' and coalesce(current_setting('marifa.order_signing_workflow', true), '') <> 'on' then
    raise exception 'orders_cannot_be_signed_by_the_protocol_workflow' using errcode = '42501';
  end if;
  if new.status = 'reviewed' then
    if new.incomplete then raise exception 'incomplete_order_cannot_be_reviewed' using errcode = '23514'; end if;
    if new.is_conditional and not new.condition_confirmed then raise exception 'unconfirmed_condition_cannot_be_reviewed' using errcode = '23514'; end if;
  end if;

  if tg_op = 'INSERT' then
    return new;
  end if;

  if new.id <> old.id or new.organization_id <> old.organization_id or new.patient_id <> old.patient_id or new.encounter_id <> old.encounter_id then
    raise exception 'order_patient_and_encounter_are_immutable' using errcode = '42501';
  end if;
  if old.status = 'signed' then raise exception 'signed_order_is_immutable' using errcode = '42501'; end if;
  if old.status = 'cancelled' then raise exception 'removed_order_is_final' using errcode = '42501'; end if;

  content_changed := (new.order_type, new.order_name, new.category, new.priority, new.indication, new.instructions, new.details)
    is distinct from (old.order_type, old.order_name, old.category, old.priority, old.indication, old.instructions, old.details);
  if content_changed then
    new.is_edited := true;
    -- Editing a reviewed order withdraws the review: the clinician must confirm the changed order again.
    if old.status = 'reviewed' and new.status = 'reviewed' then
      new.status := 'draft';
      new.reviewed_at := null;
      new.reviewed_by := null;
    end if;
  end if;
  if new.status = 'reviewed' and old.status <> 'reviewed' then
    new.reviewed_at := coalesce(new.reviewed_at, now());
    new.reviewed_by := coalesce(new.reviewed_by, new.updated_by);
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    new.cancelled_at := coalesce(new.cancelled_at, now());
    new.cancelled_by := coalesce(new.cancelled_by, new.updated_by);
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger patient_orders_guard_trg before insert or update on public.patient_orders
  for each row execute function public.patient_orders_guard();

create or replace function public.patient_orders_no_delete()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'orders_are_never_deleted_cancel_instead' using errcode = '42501';
end;
$$;
create trigger patient_orders_no_delete_trg before delete on public.patient_orders
  for each row execute function public.patient_orders_no_delete();

create or replace function public.audit_patient_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := coalesce(auth.uid(), new.updated_by, new.created_by);
  verb text;
begin
  if tg_op = 'INSERT' then
    verb := 'patient_order.created';
  elsif new.status = 'cancelled' and old.status <> 'cancelled' then
    verb := 'patient_order.removed';
  elsif new.status = 'reviewed' and old.status <> 'reviewed' then
    verb := 'patient_order.reviewed';
  else
    verb := 'patient_order.updated';
  end if;
  insert into public.audit_events (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (new.organization_id, actor, verb, 'patient_order', new.id, jsonb_build_object(
    'encounter_id', new.encounter_id, 'patient_id', new.patient_id, 'order_type', new.order_type, 'order_name', new.order_name,
    'status', new.status, 'previous_status', case when tg_op = 'UPDATE' then old.status else null end,
    'incomplete', new.incomplete, 'application_id', new.application_id));
  return new;
end;
$$;
create trigger audit_patient_order_trg after insert or update on public.patient_orders
  for each row execute function public.audit_patient_order();

create or replace function public.audit_clinical_record()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_events (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (new.organization_id, coalesce(auth.uid(), new.created_by), tg_table_name || '.' || lower(tg_op), tg_table_name, new.id,
    jsonb_build_object('status', to_jsonb(new) ->> 'status'));
  return new;
end;
$$;
create trigger audit_patients_trg after insert on public.patients for each row execute function public.audit_clinical_record();
create trigger audit_encounters_trg after insert or update on public.encounters for each row execute function public.audit_clinical_record();

-- ---------------------------------------------------------------------------------------------------------------
-- Apply a protocol to an encounter: ONE transaction.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.apply_protocol_orders(
  p_actor uuid,
  p_encounter uuid,
  p_protocol jsonb,
  p_set_items jsonb,
  p_orders jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := coalesce(auth.uid(), p_actor);
  v_enc public.encounters%rowtype;
  v_version public.guideline_versions%rowtype;
  v_guideline public.clinical_guidelines%rowtype;
  v_set uuid;
  v_app uuid := gen_random_uuid();
  v_item uuid;
  v_order uuid;
  v_status text;
  v_rec jsonb;
  v_created jsonb := '[]'::jsonb;
  v_duplicates jsonb := '[]'::jsonb;
  v_source_key text;
  v_name text;
  v_type text;
begin
  if v_actor is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if auth.uid() is not null and p_actor is not null and auth.uid() <> p_actor then raise exception 'actor_mismatch' using errcode = '42501'; end if;
  if jsonb_typeof(p_orders) <> 'array' or jsonb_array_length(p_orders) = 0 then raise exception 'no_orders_selected' using errcode = '22023'; end if;

  -- Locking the encounter row serialises concurrent applications, so the duplicate check below cannot race.
  select * into v_enc from public.encounters where id = p_encounter for update;
  if not found then raise exception 'encounter_not_found' using errcode = 'P0002'; end if;
  if not public.user_can_manage_patient_orders(v_enc.organization_id, v_actor) then raise exception 'not_authorised' using errcode = '42501'; end if;
  if v_enc.status <> 'active' then raise exception 'encounter_closed' using errcode = '23514'; end if;

  select * into v_version from public.guideline_versions where id = (p_protocol ->> 'version_id')::uuid;
  select * into v_guideline from public.clinical_guidelines where id = (p_protocol ->> 'id')::uuid;
  if v_version.id is null or v_guideline.id is null or v_version.guideline_id <> v_guideline.id
     or v_version.status not in ('approved', 'published')
     or (v_guideline.organization_id is not null and v_guideline.organization_id <> v_enc.organization_id) then
    raise exception 'protocol_unavailable' using errcode = '23514';
  end if;

  -- Frozen snapshot of what this protocol version proposed (first use wins; never rewritten).
  insert into public.protocol_order_sets (protocol_id, protocol_version_id, protocol_version, title, approval_status)
  values (v_guideline.id, v_version.id, coalesce(nullif(p_protocol ->> 'version', ''), 'unknown'), coalesce(nullif(p_protocol ->> 'title', ''), v_guideline.title), v_version.status)
  on conflict (protocol_version_id) do nothing;
  select id into v_set from public.protocol_order_sets where protocol_version_id = v_version.id;

  if jsonb_typeof(p_set_items) = 'array' then
    insert into public.protocol_order_items (order_set_id, source_key, order_type, order_name, instructions, order_parameters, required_information, condition_rules, requirement, is_optional, display_order)
    select v_set, i ->> 'source_key', i ->> 'order_type', i ->> 'order_name', coalesce(i ->> 'instructions', ''),
           coalesce(i -> 'order_parameters', '{}'::jsonb), coalesce(i -> 'required_information', '[]'::jsonb), coalesce(i -> 'condition_rules', '[]'::jsonb),
           i ->> 'requirement', coalesce((i ->> 'is_optional')::boolean, false), coalesce((i ->> 'display_order')::integer, 0)
    from jsonb_array_elements(p_set_items) as i
    on conflict (order_set_id, source_key) do nothing;
  end if;

  -- Duplicate guard: refuse unless the clinician explicitly allowed each possible duplicate.
  for v_rec in select * from jsonb_array_elements(p_orders) loop
    continue when coalesce((v_rec ->> 'allow_duplicate')::boolean, false);
    v_source_key := nullif(v_rec ->> 'source_key', '');
    if exists (
      select 1 from public.patient_orders o
      left join public.patient_order_provenance pv on pv.patient_order_id = o.id
      where o.encounter_id = p_encounter and o.status <> 'cancelled'
        and ((v_source_key is not null and pv.protocol_id = v_guideline.id and pv.source_key = v_source_key)
          or (o.order_type = (v_rec ->> 'order_type') and public.normalize_order_name(o.order_name) = public.normalize_order_name(v_rec ->> 'order_name')))
    ) then
      v_duplicates := v_duplicates || jsonb_build_array(coalesce(v_source_key, v_rec ->> 'order_name'));
    end if;
  end loop;
  if jsonb_array_length(v_duplicates) > 0 then
    raise exception 'duplicate_orders_require_review' using errcode = '23505', detail = v_duplicates::text;
  end if;

  for v_rec in select * from jsonb_array_elements(p_orders) loop
    v_source_key := nullif(v_rec ->> 'source_key', '');
    v_name := trim(v_rec ->> 'order_name');
    v_type := v_rec ->> 'order_type';
    v_status := case when v_rec ->> 'status' = 'reviewed' then 'reviewed' else 'draft' end;
    -- Defence in depth: the application already downgrades these, the database refuses to trust it.
    if v_status = 'reviewed' and (coalesce((v_rec ->> 'incomplete')::boolean, false)
        or (coalesce((v_rec ->> 'is_conditional')::boolean, false) and not coalesce((v_rec ->> 'condition_confirmed')::boolean, false))) then
      v_status := 'draft';
    end if;

    insert into public.patient_orders (
      organization_id, patient_id, encounter_id, order_type, order_name, category, priority, indication, instructions, details,
      status, incomplete, missing_fields, is_conditional, condition_text, condition_confirmed, is_manual, modified_from_protocol,
      application_id, created_by, updated_by, reviewed_at, reviewed_by)
    values (
      v_enc.organization_id, v_enc.patient_id, v_enc.id, v_type, v_name, coalesce(v_rec ->> 'category', ''), nullif(v_rec ->> 'priority', ''),
      coalesce(v_rec ->> 'indication', ''), coalesce(v_rec ->> 'instructions', ''), coalesce(v_rec -> 'details', '{}'::jsonb),
      v_status, coalesce((v_rec ->> 'incomplete')::boolean, false), coalesce(v_rec -> 'missing_fields', '[]'::jsonb),
      coalesce((v_rec ->> 'is_conditional')::boolean, false), coalesce(v_rec ->> 'condition_text', ''),
      coalesce((v_rec ->> 'condition_confirmed')::boolean, false), v_source_key is null,
      coalesce((v_rec ->> 'modified_from_protocol')::boolean, false), v_app, v_actor, v_actor,
      case when v_status = 'reviewed' then now() end, case when v_status = 'reviewed' then v_actor end)
    returning id into v_order;

    if v_source_key is not null then
      select id into v_item from public.protocol_order_items where order_set_id = v_set and source_key = v_source_key;
      if v_item is null then raise exception 'unknown_protocol_item' using errcode = '23503', detail = v_source_key; end if;
      insert into public.patient_order_provenance (patient_order_id, organization_id, encounter_id, application_id, protocol_id, protocol_version_id, protocol_order_item_id, source_module, protocol_title, protocol_version, source_key, applied_by)
      values (v_order, v_enc.organization_id, v_enc.id, v_app, v_guideline.id, v_version.id, v_item, p_protocol ->> 'source_module',
              coalesce(nullif(p_protocol ->> 'title', ''), v_guideline.title), coalesce(nullif(p_protocol ->> 'version', ''), 'unknown'), v_source_key, v_actor);
    end if;
    v_created := v_created || jsonb_build_array(jsonb_build_object('order_id', v_order, 'source_key', v_source_key, 'status', v_status));
  end loop;

  insert into public.audit_events (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (v_enc.organization_id, v_actor, 'protocol.applied_to_encounter', 'encounter', v_enc.id, jsonb_build_object(
    'application_id', v_app, 'protocol_id', v_guideline.id, 'protocol_version_id', v_version.id, 'protocol_version', p_protocol ->> 'version',
    'source_module', p_protocol ->> 'source_module', 'orders_created', jsonb_array_length(v_created), 'patient_id', v_enc.patient_id));

  return jsonb_build_object('application_id', v_app, 'created', v_created);
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------------------------
alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.patient_orders enable row level security;
alter table public.patient_order_provenance enable row level security;
alter table public.protocol_order_sets enable row level security;
alter table public.protocol_order_items enable row level security;

create policy patients_read on public.patients for select using (public.can_read_patient_orders(organization_id));
create policy patients_insert on public.patients for insert with check (public.can_manage_patient_orders(organization_id));
create policy patients_update on public.patients for update using (public.can_manage_patient_orders(organization_id)) with check (public.can_manage_patient_orders(organization_id));

create policy encounters_read on public.encounters for select using (public.can_read_patient_orders(organization_id));
create policy encounters_insert on public.encounters for insert with check (public.can_manage_patient_orders(organization_id));
create policy encounters_update on public.encounters for update using (public.can_manage_patient_orders(organization_id)) with check (public.can_manage_patient_orders(organization_id));

create policy patient_orders_read on public.patient_orders for select using (public.can_read_patient_orders(organization_id));
create policy patient_orders_insert on public.patient_orders for insert with check (public.can_manage_patient_orders(organization_id));
create policy patient_orders_update on public.patient_orders for update using (public.can_manage_patient_orders(organization_id)) with check (public.can_manage_patient_orders(organization_id));

create policy provenance_read on public.patient_order_provenance for select using (public.can_read_patient_orders(organization_id));

create policy protocol_order_sets_read on public.protocol_order_sets for select using (exists (select 1 from public.organization_memberships m where m.user_id = auth.uid() and m.account_status = 'active'));
create policy protocol_order_items_read on public.protocol_order_items for select using (exists (select 1 from public.protocol_order_sets s where s.id = order_set_id));

revoke all on table public.patients, public.encounters, public.patient_orders, public.patient_order_provenance, public.protocol_order_sets, public.protocol_order_items from anon;
grant select, insert, update on table public.patients, public.encounters, public.patient_orders to authenticated;
grant select on table public.patient_order_provenance, public.protocol_order_sets, public.protocol_order_items to authenticated;
grant all on table public.patients, public.encounters, public.patient_orders, public.patient_order_provenance, public.protocol_order_sets, public.protocol_order_items to service_role;

revoke all on function public.apply_protocol_orders(uuid, uuid, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.apply_protocol_orders(uuid, uuid, jsonb, jsonb, jsonb) to authenticated, service_role;
revoke all on function public.user_can_manage_patient_orders(uuid, uuid) from public, anon, authenticated;
grant execute on function public.user_can_manage_patient_orders(uuid, uuid) to service_role;
revoke all on function public.can_manage_patient_orders(uuid), public.can_read_patient_orders(uuid) from public, anon;
grant execute on function public.can_manage_patient_orders(uuid), public.can_read_patient_orders(uuid) to authenticated, service_role;
