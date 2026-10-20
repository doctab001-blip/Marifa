-- CBAHI Accreditation Hub foundation: standards register, assessments, evidence vault, policy control with
-- read-and-sign, incidents + CAPA, clinical audits, QIPs (PDSA), scoring settings and an audit trail.
--
-- Principles enforced HERE (not only in the UI):
--   * No standards are shipped. The register is imported from the edition the hospital is licensed to use
--     (CBAHI's standards text is copyrighted), so no code or wording in this platform is invented.
--   * A standard cannot be rated 'satisfactory' unless it has current (unexpired, not withdrawn) evidence.
--   * Partial / insufficient ratings must state the gap. Assessments are append-only history, never edited.
--   * Evidence is never deleted, only withdrawn with a reason. Files in storage are immutable.
--   * Approved policies are frozen (a new version is a new row); status only moves along the allowed path and
--     only a draft that has a document (or a linked Marifa guideline) can go to committee.
--   * A sentinel incident cannot be closed without a root cause and at least one corrective action; no incident
--     closes while a CAPA is still open.
--   * Every insert/update/delete on these tables writes an audit_events row (who, what, which fields changed).
--   * Access follows ASSIGNED ROLES only (never the user-editable professional_level).
--
-- Demonstration data only until the platform is approved for real patient data (see docs/DEPLOYMENT_REVIEW.md).

insert into public.roles (code, name) values
  ('quality_manager', 'Quality Improvement Manager'),
  ('clinical_director', 'Clinical Director')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------------------------------------------
-- Role helpers
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.gov_has_role(target_org uuid, target_user uuid, codes text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from organization_memberships m
    join membership_roles mr on mr.membership_id = m.id
    join roles r on r.id = mr.role_id
    where m.organization_id = target_org and m.user_id = target_user and m.account_status = 'active'
      and r.code = any (codes)
  );
$$;
revoke all on function public.gov_has_role(uuid, uuid, text[]) from public, anon, authenticated;

create or replace function public.gov_user_can_write(target_org uuid, target_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.gov_has_role(target_org, target_user,
    array['governance_lead', 'quality_manager', 'clinical_director', 'org_admin', 'hospital_admin', 'platform_admin']);
$$;
revoke all on function public.gov_user_can_write(uuid, uuid) from public, anon, authenticated;

create or replace function public.gov_can_write(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.gov_user_can_write(target_org, auth.uid());
$$;

create or replace function public.gov_can_read(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.gov_user_can_write(target_org, auth.uid()) or public.gov_has_role(target_org, auth.uid(), array['auditor']);
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Settings: scoring thresholds and accreditation dates (defaults = CBAHI Hospital Accreditation Process Guide, Oct 2016)
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  edition_label text not null default '' check (length(edition_label) <= 160),
  satisfactory_min_pct numeric not null default 80 check (satisfactory_min_pct between 1 and 100),
  partial_min_pct numeric not null default 50 check (partial_min_pct between 0 and 99),
  accredited_min_overall numeric not null default 85 check (accredited_min_overall between 1 and 100),
  conditional_min_overall numeric not null default 75 check (conditional_min_overall between 0 and 99),
  esr_unsatisfactory_max_pct numeric not null default 25 check (esr_unsatisfactory_max_pct between 0 and 100),
  validity_years integer not null default 3 check (validity_years between 1 and 10),
  accreditation_awarded_on date,
  scoring_source_note text not null default 'CBAHI Hospital Accreditation Process Guide, October 2016 (3rd edition standards). Confirm against the edition your hospital is surveyed under.',
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  check (partial_min_pct < satisfactory_min_pct),
  check (conditional_min_overall < accredited_min_overall)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Standards register + assessments + evidence
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_standards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  edition text not null check (length(trim(edition)) between 1 and 160),
  chapter_code text not null default '' check (length(chapter_code) <= 40),
  chapter_name text not null default '' check (length(chapter_name) <= 200),
  code text not null check (length(trim(code)) between 1 and 60),
  description text not null check (length(trim(description)) between 1 and 4000),
  is_esr boolean not null default false,
  department text not null default '' check (length(department) <= 160),
  owner_user_id uuid references public.profiles(id),
  review_interval_months integer not null default 12 check (review_interval_months between 1 and 60),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, edition, code),
  unique (id, organization_id)
);
create index gov_standards_org_chapter_idx on public.gov_standards(organization_id, chapter_code, code);

create table public.gov_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  standard_id uuid not null,
  rating text not null check (rating in ('insufficient', 'partial', 'satisfactory', 'not_applicable')),
  method text not null default 'self_assessment' check (method in ('self_assessment', 'mock_survey', 'audit', 'external_survey')),
  notes text not null default '' check (length(notes) <= 4000),
  next_review_due date,
  assessed_by uuid references public.profiles(id),
  assessed_at timestamptz not null default now(),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade
);
create index gov_assessments_standard_idx on public.gov_assessments(standard_id, assessed_at desc);

create table public.gov_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  standard_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 240),
  evidence_type text not null default 'other' check (evidence_type in ('policy', 'audit_report', 'meeting_minutes', 'training_record', 'log', 'certificate', 'other')),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  sha256 text,
  valid_from date,
  valid_until date,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  withdrawn_by uuid references public.profiles(id),
  withdrawn_reason text,
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade,
  check (valid_until is null or valid_from is null or valid_until >= valid_from),
  check ((withdrawn_at is null) = (withdrawn_reason is null))
);
create index gov_evidence_standard_idx on public.gov_evidence(standard_id, uploaded_at desc);

-- Latest assessment per standard.
create view public.gov_standard_status with (security_invoker = true) as
select s.id as standard_id, s.organization_id, a.rating, a.method, a.notes, a.assessed_at, a.assessed_by, a.next_review_due
from public.gov_standards s
left join lateral (
  select * from public.gov_assessments x where x.standard_id = s.id order by x.assessed_at desc, x.id desc limit 1
) a on true;

create or replace function public.gov_assessment_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then
    raise exception 'assessments_immutable: assessments are append-only history; record a new assessment instead' using errcode = 'P0001';
  end if;
  if new.rating = 'satisfactory' and not exists (
    select 1 from gov_evidence e
    where e.standard_id = new.standard_id and e.withdrawn_at is null
      and (e.valid_until is null or e.valid_until >= current_date)
  ) then
    raise exception 'evidence_required: a standard cannot be rated satisfactory without current evidence attached' using errcode = 'P0001';
  end if;
  if new.rating in ('insufficient', 'partial') and btrim(new.notes) = '' then
    raise exception 'notes_required: describe the gap for a partial or insufficient rating' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger gov_assessments_guard before insert or update or delete on public.gov_assessments
  for each row execute function public.gov_assessment_guard();

create or replace function public.gov_evidence_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'evidence_not_deletable: withdraw evidence with a reason instead of deleting it' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if (new.organization_id, new.standard_id, new.title, new.evidence_type, new.storage_path, new.file_name, new.sha256, new.uploaded_by, new.uploaded_at, new.valid_from, new.valid_until)
       is distinct from
       (old.organization_id, old.standard_id, old.title, old.evidence_type, old.storage_path, old.file_name, old.sha256, old.uploaded_by, old.uploaded_at, old.valid_from, old.valid_until) then
      raise exception 'evidence_immutable: only withdrawal can change an evidence record' using errcode = 'P0001';
    end if;
    if old.withdrawn_at is not null then
      raise exception 'evidence_withdrawn: a withdrawn record cannot be changed' using errcode = 'P0001';
    end if;
    if new.withdrawn_at is not null and btrim(coalesce(new.withdrawn_reason, '')) = '' then
      raise exception 'reason_required: give a reason for withdrawing evidence' using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger gov_evidence_guard before update or delete on public.gov_evidence
  for each row execute function public.gov_evidence_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- Policy control and read-and-sign
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 240),
  document_number text not null default '' check (length(document_number) <= 60),
  version text not null check (length(trim(version)) between 1 and 40),
  status text not null default 'draft' check (status in ('draft', 'under_committee_review', 'approved', 'retired')),
  department text not null default '' check (length(department) <= 160),
  owner_user_id uuid references public.profiles(id),
  effective_date date,
  next_review_due date,
  storage_path text,
  file_name text,
  clinical_guideline_id uuid references public.clinical_guidelines(id),
  submitted_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  retired_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique nulls not distinct (organization_id, document_number, version)
);
create index gov_policies_org_status_idx on public.gov_policies(organization_id, status, next_review_due);

create table public.gov_policy_standards (
  policy_id uuid not null,
  standard_id uuid not null,
  organization_id uuid not null,
  primary key (policy_id, standard_id),
  foreign key (policy_id, organization_id) references public.gov_policies(id, organization_id) on delete cascade,
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade
);

create table public.gov_policy_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  policy_id uuid not null,
  user_id uuid not null references public.profiles(id),
  due_date date,
  assigned_at timestamptz not null default now(),
  unique (policy_id, user_id),
  foreign key (policy_id, organization_id) references public.gov_policies(id, organization_id) on delete cascade
);
create index gov_assignments_user_idx on public.gov_policy_assignments(user_id);

create table public.gov_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  policy_id uuid not null,
  user_id uuid not null references public.profiles(id),
  acknowledged_at timestamptz not null default now(),
  unique (policy_id, user_id),
  foreign key (policy_id, organization_id) references public.gov_policies(id, organization_id) on delete cascade
);

create or replace function public.gov_policy_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare rpc boolean := coalesce(current_setting('gov.rpc', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then raise exception 'policy_must_start_as_draft' using errcode = 'P0001'; end if;
    return new;
  end if;
  if tg_op = 'DELETE' then
    raise exception 'policy_not_deletable: retire a policy instead of deleting it' using errcode = 'P0001';
  end if;
  if new.status is distinct from old.status then
    if not rpc then
      raise exception 'status_via_workflow: change policy status through the approval workflow' using errcode = 'P0001';
    end if;
    if not ((old.status = 'draft' and new.status = 'under_committee_review')
         or (old.status = 'under_committee_review' and new.status in ('approved', 'draft'))
         or (old.status = 'approved' and new.status = 'retired')) then
      raise exception 'invalid_transition: % to % is not allowed', old.status, new.status using errcode = 'P0001';
    end if;
    if new.status = 'under_committee_review' then
      if new.storage_path is null and new.clinical_guideline_id is null then
        raise exception 'document_required: attach the policy document (or link a Marifa guideline) before committee review' using errcode = 'P0001';
      end if;
      new.submitted_at := now();
    end if;
    if new.status = 'approved' then new.approved_at := now(); end if;
    if new.status = 'retired' then new.retired_at := now(); end if;
  elsif old.status in ('approved', 'retired') then
    if (new.title, new.version, new.document_number, new.storage_path, new.file_name, new.clinical_guideline_id)
       is distinct from
       (old.title, old.version, old.document_number, old.storage_path, old.file_name, old.clinical_guideline_id) then
      raise exception 'policy_frozen: an approved policy cannot be edited; create a new version' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger gov_policies_guard before insert or update or delete on public.gov_policies
  for each row execute function public.gov_policy_guard();


-- Read-and-sign counts per policy, aggregated in the database so the dashboard never pulls every assignment row.
create view public.gov_policy_ack_summary with (security_invoker = true) as
select p.id as policy_id, p.organization_id,
       count(a.id)::int as assigned,
       count(k.id)::int as acknowledged,
       (count(a.id) filter (where a.due_date < current_date and k.id is null))::int as overdue
from public.gov_policies p
left join public.gov_policy_assignments a on a.policy_id = p.id
left join public.gov_acknowledgements k on k.policy_id = a.policy_id and k.user_id = a.user_id
group by p.id, p.organization_id;

-- ---------------------------------------------------------------------------------------------------------------
-- Incidents, CAPA
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null,
  year integer not null,
  n integer not null default 0,
  primary key (organization_id, kind, year)
);

create or replace function public.gov_next_ref(target_org uuid, p_kind text, p_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare yr integer := extract(year from now())::integer; nn integer;
begin
  insert into gov_counters as c (organization_id, kind, year, n) values (target_org, p_kind, yr, 1)
  on conflict (organization_id, kind, year) do update set n = c.n + 1
  returning n into nn;
  return p_prefix || '-' || yr || '-' || lpad(nn::text, 4, '0');
end $$;
revoke all on function public.gov_next_ref(uuid, text, text) from public, anon, authenticated;

create table public.gov_incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reference text not null,
  title text not null check (length(trim(title)) between 1 and 240),
  category text not null default 'other' check (length(category) <= 80),
  description text not null default '' check (length(description) <= 8000),
  sbar jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  department text not null default '' check (length(department) <= 160),
  location text not null default '' check (length(location) <= 200),
  patient_mrn text check (patient_mrn is null or length(patient_mrn) <= 40),
  severity text not null default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  likelihood smallint not null default 1 check (likelihood between 1 and 5),
  impact smallint not null default 1 check (impact between 1 and 5),
  risk_score smallint generated always as (likelihood * impact) stored,
  is_sentinel boolean not null default false,
  status text not null default 'reported' check (status in ('reported', 'under_investigation', 'capa_assigned', 'under_review', 'closed')),
  root_cause text not null default '' check (length(root_cause) <= 8000),
  closure_note text not null default '' check (length(closure_note) <= 4000),
  reported_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (id, organization_id),
  unique (organization_id, reference)
);
create index gov_incidents_org_idx on public.gov_incidents(organization_id, status, occurred_at desc);
create index gov_incidents_risk_idx on public.gov_incidents(organization_id, likelihood, impact);

create table public.gov_incident_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  incident_id uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  foreign key (incident_id, organization_id) references public.gov_incidents(id, organization_id) on delete cascade
);

create table public.gov_audits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 240),
  category text not null default 'other' check (length(category) <= 80),
  standard_id uuid,
  department text not null default '' check (length(department) <= 160),
  owner_user_id uuid references public.profiles(id),
  scheduled_for date not null,
  recurrence_months integer check (recurrence_months is null or recurrence_months between 1 and 60),
  target_pct numeric check (target_pct is null or target_pct between 0 and 100),
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  sample_size integer check (sample_size is null or sample_size > 0),
  result_pct numeric check (result_pct is null or result_pct between 0 and 100),
  findings text not null default '' check (length(findings) <= 8000),
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id),
  check (status <> 'completed' or (result_pct is not null and sample_size is not null))
);
create index gov_audits_org_idx on public.gov_audits(organization_id, status, scheduled_for);

create table public.gov_capa (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  incident_id uuid,
  audit_id uuid,
  action text not null check (length(trim(action)) between 1 and 2000),
  kind text not null default 'corrective' check (kind in ('corrective', 'preventive')),
  owner_user_id uuid not null references public.profiles(id),
  due_date date not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'verified')),
  done_at timestamptz,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  verification_note text not null default '' check (length(verification_note) <= 4000),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (incident_id, organization_id) references public.gov_incidents(id, organization_id) on delete cascade,
  foreign key (audit_id, organization_id) references public.gov_audits(id, organization_id) on delete cascade,
  check (incident_id is not null or audit_id is not null)
);
create index gov_capa_org_idx on public.gov_capa(organization_id, status, due_date);
create index gov_capa_incident_idx on public.gov_capa(incident_id);

create or replace function public.gov_incident_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.reference is null or new.reference = '' then
      new.reference := public.gov_next_ref(new.organization_id, 'incident', 'INC');
    end if;
    if new.status <> 'reported' then raise exception 'incident_must_start_reported' using errcode = 'P0001'; end if;
    return new;
  end if;
  if tg_op = 'DELETE' then
    raise exception 'incident_not_deletable: incidents are part of the safety record and cannot be deleted' using errcode = 'P0001';
  end if;
  if new.reference is distinct from old.reference or new.organization_id is distinct from old.organization_id or new.reported_by is distinct from old.reported_by then
    raise exception 'incident_identity_immutable' using errcode = 'P0001';
  end if;
  if old.status = 'closed' and new.status = 'closed' and (new.root_cause, new.closure_note, new.is_sentinel, new.severity) is distinct from (old.root_cause, old.closure_note, old.is_sentinel, old.severity) then
    raise exception 'incident_closed: reopen the incident before changing it' using errcode = 'P0001';
  end if;
  if new.status = 'closed' and old.status <> 'closed' then
    if btrim(new.closure_note) = '' then
      raise exception 'closure_note_required: record why the incident can be closed' using errcode = 'P0001';
    end if;
    if exists (select 1 from gov_capa c where c.incident_id = new.id and c.status in ('open', 'in_progress')) then
      raise exception 'capa_open: close or complete every corrective action first' using errcode = 'P0001';
    end if;
    if new.is_sentinel then
      if btrim(new.root_cause) = '' then
        raise exception 'root_cause_required: a sentinel incident needs a root cause analysis before closure' using errcode = 'P0001';
      end if;
      if not exists (select 1 from gov_capa c where c.incident_id = new.id) then
        raise exception 'capa_required: a sentinel incident needs at least one corrective or preventive action before closure' using errcode = 'P0001';
      end if;
    end if;
    new.closed_at := now();
  elsif old.status = 'closed' and new.status <> 'closed' then
    new.closed_at := null;
  end if;
  return new;
end $$;
create trigger gov_incidents_guard before insert or update or delete on public.gov_incidents
  for each row execute function public.gov_incident_guard();

create or replace function public.gov_capa_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare rpc boolean := coalesce(current_setting('gov.rpc', true), '') = 'on';
begin
  if tg_op = 'DELETE' then
    raise exception 'capa_not_deletable' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'open' then raise exception 'capa_must_start_open' using errcode = 'P0001'; end if;
    return new;
  end if;
  if new.status is distinct from old.status and not rpc then
    raise exception 'status_via_workflow: change CAPA status through the workflow' using errcode = 'P0001';
  end if;
  if new.status = 'done' and old.status <> 'done' then new.done_at := now(); end if;
  return new;
end $$;
create trigger gov_capa_guard before insert or update or delete on public.gov_capa
  for each row execute function public.gov_capa_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- QIPs (PDSA)
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_qips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 240),
  aim text not null default '' check (length(aim) <= 2000),
  measure text not null default '' check (length(measure) <= 1000),
  unit text not null default '' check (length(unit) <= 40),
  baseline_value numeric,
  target_value numeric,
  current_value numeric,
  phase text not null default 'plan' check (phase in ('plan', 'do', 'study', 'act')),
  status text not null default 'active' check (status in ('active', 'completed', 'stopped')),
  department text not null default '' check (length(department) <= 160),
  lead_user_id uuid references public.profiles(id),
  standard_id uuid,
  started_on date,
  due_on date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id)
);
create index gov_qips_org_idx on public.gov_qips(organization_id, status, phase);

-- ---------------------------------------------------------------------------------------------------------------
-- Audit trail
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.gov_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rec jsonb; oldrec jsonb; actor uuid; changes jsonb := '{}'::jsonb; k text;
begin
  if tg_op = 'DELETE' then rec := to_jsonb(old); else rec := to_jsonb(new); end if;
  actor := coalesce(
    auth.uid(),
    nullif(current_setting('gov.actor', true), '')::uuid,
    nullif(rec->>'created_by', '')::uuid, nullif(rec->>'assessed_by', '')::uuid,
    nullif(rec->>'uploaded_by', '')::uuid, nullif(rec->>'reported_by', '')::uuid,
    nullif(rec->>'updated_by', '')::uuid, nullif(rec->>'user_id', '')::uuid
  );
  if tg_op = 'UPDATE' then
    oldrec := to_jsonb(old);
    for k in select jsonb_object_keys(rec) loop
      if rec->k is distinct from oldrec->k and k <> 'updated_at' then
        changes := changes || jsonb_build_object(k, jsonb_build_object('from', oldrec->k, 'to', rec->k));
      end if;
    end loop;
    if changes = '{}'::jsonb then return new; end if;
  end if;
  insert into audit_events (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (
    (rec->>'organization_id')::uuid, actor, 'governance.' || tg_table_name || '.' || lower(tg_op), tg_table_name,
    nullif(rec->>'id', '')::uuid,
    case when tg_op = 'UPDATE' then jsonb_build_object('changes', changes)
         when tg_op = 'INSERT' then jsonb_build_object('summary', coalesce(rec->>'title', rec->>'code', rec->>'action', rec->>'file_name', rec->>'rating', ''))
         else '{}'::jsonb end
  );
  return case when tg_op = 'DELETE' then old else new end;
end $$;

do $$
declare t text;
begin
  foreach t in array array['gov_settings', 'gov_standards', 'gov_assessments', 'gov_evidence', 'gov_policies', 'gov_policy_assignments',
                           'gov_acknowledgements', 'gov_incidents', 'gov_incident_files', 'gov_audits', 'gov_capa', 'gov_qips']
  loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.gov_audit()', t || '_audit', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------------------------------------------
-- Workflow functions. The caller is passed explicitly so the server's service-role path (temporary admin mode)
-- works, but a real signed-in user can only ever act as themselves.
-- ---------------------------------------------------------------------------------------------------------------
create or replace function public.gov_check_actor(p_actor uuid)
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if p_actor is null then raise exception 'not_authenticated' using errcode = 'P0001'; end if;
  if auth.uid() is not null and auth.uid() <> p_actor then raise exception 'actor_mismatch' using errcode = 'P0001'; end if;
  perform set_config('gov.actor', p_actor::text, true);
end $$;
revoke all on function public.gov_check_actor(uuid) from public, anon, authenticated;

create or replace function public.gov_set_policy_status(p_actor uuid, p_policy uuid, p_status text)
returns public.gov_policies language plpgsql security definer set search_path = public as $$
declare pol public.gov_policies;
begin
  perform public.gov_check_actor(p_actor);
  select * into pol from gov_policies where id = p_policy for update;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if not public.gov_user_can_write(pol.organization_id, p_actor) then raise exception 'not_authorised' using errcode = 'P0001'; end if;
  perform set_config('gov.rpc', 'on', true);
  update gov_policies set status = p_status,
    approved_by = case when p_status = 'approved' then p_actor else approved_by end
  where id = p_policy returning * into pol;
  perform set_config('gov.rpc', 'off', true);
  return pol;
end $$;

create or replace function public.gov_assign_policy(p_actor uuid, p_policy uuid, p_due date, p_role_codes text[] default null)
returns integer language plpgsql security definer set search_path = public as $$
declare pol public.gov_policies; n integer;
begin
  perform public.gov_check_actor(p_actor);
  select * into pol from gov_policies where id = p_policy;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if not public.gov_user_can_write(pol.organization_id, p_actor) then raise exception 'not_authorised' using errcode = 'P0001'; end if;
  if pol.status <> 'approved' then raise exception 'policy_not_approved: only an approved policy can be assigned for read-and-sign' using errcode = 'P0001'; end if;
  with targets as (
    select distinct m.user_id
    from organization_memberships m
    where m.organization_id = pol.organization_id and m.account_status = 'active'
      and (p_role_codes is null or exists (
        select 1 from membership_roles mr join roles r on r.id = mr.role_id
        where mr.membership_id = m.id and r.code = any (p_role_codes)))
  ), ins as (
    insert into gov_policy_assignments (organization_id, policy_id, user_id, due_date)
    select pol.organization_id, p_policy, user_id, p_due from targets
    on conflict (policy_id, user_id) do nothing
    returning 1
  )
  select count(*) into n from ins;
  return n;
end $$;

create or replace function public.gov_acknowledge_policy(p_actor uuid, p_policy uuid)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare pol public.gov_policies; ts timestamptz;
begin
  perform public.gov_check_actor(p_actor);
  select * into pol from gov_policies where id = p_policy;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if pol.status <> 'approved' then raise exception 'policy_not_approved' using errcode = 'P0001'; end if;
  if not exists (select 1 from gov_policy_assignments a where a.policy_id = p_policy and a.user_id = p_actor) then
    raise exception 'not_assigned: this policy was not assigned to you' using errcode = 'P0001';
  end if;
  insert into gov_acknowledgements (organization_id, policy_id, user_id) values (pol.organization_id, p_policy, p_actor)
  on conflict (policy_id, user_id) do nothing;
  select acknowledged_at into ts from gov_acknowledgements where policy_id = p_policy and user_id = p_actor;
  return ts;
end $$;

create or replace function public.gov_set_capa_status(p_actor uuid, p_capa uuid, p_status text, p_note text default '')
returns public.gov_capa language plpgsql security definer set search_path = public as $$
declare c public.gov_capa; writer boolean;
begin
  perform public.gov_check_actor(p_actor);
  select * into c from gov_capa where id = p_capa for update;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  writer := public.gov_user_can_write(c.organization_id, p_actor);
  if not (writer or c.owner_user_id = p_actor) then raise exception 'not_authorised' using errcode = 'P0001'; end if;
  if p_status = 'verified' then
    if not writer then raise exception 'not_authorised: only governance staff can verify an action' using errcode = 'P0001'; end if;
    if c.status <> 'done' then raise exception 'invalid_transition: verify only a completed action' using errcode = 'P0001'; end if;
    if btrim(coalesce(p_note, '')) = '' then raise exception 'verification_note_required: record how you checked it worked' using errcode = 'P0001'; end if;
  elsif p_status = 'open' and not writer then
    raise exception 'not_authorised: only governance staff can reopen an action' using errcode = 'P0001';
  elsif p_status not in ('open', 'in_progress', 'done') then
    raise exception 'invalid_status' using errcode = 'P0001';
  end if;
  perform set_config('gov.rpc', 'on', true);
  update gov_capa set status = p_status,
    verified_by = case when p_status = 'verified' then p_actor when p_status in ('open', 'in_progress', 'done') then null else verified_by end,
    verified_at = case when p_status = 'verified' then now() when p_status in ('open', 'in_progress', 'done') then null else verified_at end,
    verification_note = case when p_status = 'verified' then btrim(p_note) when p_status in ('open', 'in_progress', 'done') then '' else verification_note end,
    done_at = case when p_status in ('open', 'in_progress') then null else done_at end
  where id = p_capa returning * into c;
  perform set_config('gov.rpc', 'off', true);
  return c;
end $$;

create or replace function public.gov_complete_audit(p_actor uuid, p_audit uuid, p_result numeric, p_sample integer, p_findings text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare a public.gov_audits; next_id uuid;
begin
  perform public.gov_check_actor(p_actor);
  select * into a from gov_audits where id = p_audit for update;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if not public.gov_user_can_write(a.organization_id, p_actor) and a.owner_user_id is distinct from p_actor then
    raise exception 'not_authorised' using errcode = 'P0001';
  end if;
  if a.status in ('completed', 'cancelled') then raise exception 'audit_closed' using errcode = 'P0001'; end if;
  update gov_audits set status = 'completed', result_pct = p_result, sample_size = p_sample, findings = coalesce(p_findings, ''), completed_at = now()
  where id = p_audit;
  if a.recurrence_months is not null then
    insert into gov_audits (organization_id, title, category, standard_id, department, owner_user_id, scheduled_for, recurrence_months, target_pct, created_by)
    values (a.organization_id, a.title, a.category, a.standard_id, a.department, a.owner_user_id,
            (a.scheduled_for + make_interval(months => a.recurrence_months))::date, a.recurrence_months, a.target_pct, p_actor)
    returning id into next_id;
  end if;
  return next_id;
end $$;

create or replace function public.gov_people(target_org uuid)
returns table (user_id uuid, display_name text, role_codes text[])
language sql stable security definer set search_path = public as $$
  select m.user_id, p.display_name,
         coalesce(array(select r.code from membership_roles mr join roles r on r.id = mr.role_id where mr.membership_id = m.id order by r.code), '{}')
  from organization_memberships m join profiles p on p.id = m.user_id
  where m.organization_id = target_org and m.account_status = 'active'
    and (public.gov_can_read(target_org) or coalesce(auth.role(), '') = 'service_role')
  order by p.display_name;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------------------------------------------
alter table public.gov_settings enable row level security;
alter table public.gov_standards enable row level security;
alter table public.gov_assessments enable row level security;
alter table public.gov_evidence enable row level security;
alter table public.gov_policies enable row level security;
alter table public.gov_policy_standards enable row level security;
alter table public.gov_policy_assignments enable row level security;
alter table public.gov_acknowledgements enable row level security;
alter table public.gov_counters enable row level security;
alter table public.gov_incidents enable row level security;
alter table public.gov_incident_files enable row level security;
alter table public.gov_audits enable row level security;
alter table public.gov_capa enable row level security;
alter table public.gov_qips enable row level security;

revoke all on public.gov_settings, public.gov_standards, public.gov_assessments, public.gov_evidence, public.gov_policies,
  public.gov_policy_standards, public.gov_policy_assignments, public.gov_acknowledgements, public.gov_counters,
  public.gov_incidents, public.gov_incident_files, public.gov_audits, public.gov_capa, public.gov_qips, public.gov_standard_status,
  public.gov_policy_ack_summary from anon;

-- Governance staff read everything in their organisation; writers change it. Auditors are read-only.
create policy gov_settings_read on public.gov_settings for select using (public.gov_can_read(organization_id));
create policy gov_settings_write on public.gov_settings for all using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

create policy gov_standards_read on public.gov_standards for select using (public.gov_can_read(organization_id));
create policy gov_standards_write on public.gov_standards for all using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

create policy gov_assessments_read on public.gov_assessments for select using (public.gov_can_read(organization_id));
create policy gov_assessments_insert on public.gov_assessments for insert with check (public.gov_can_write(organization_id) and assessed_by = auth.uid());

create policy gov_evidence_read on public.gov_evidence for select using (public.gov_can_read(organization_id));
create policy gov_evidence_insert on public.gov_evidence for insert with check (public.gov_can_write(organization_id) and uploaded_by = auth.uid());
create policy gov_evidence_withdraw on public.gov_evidence for update using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

-- Any active member can read approved policies (that is how read-and-sign works); governance staff see all statuses.
create policy gov_policies_read on public.gov_policies for select using (public.gov_can_read(organization_id) or (status = 'approved' and public.is_org_member(organization_id)));
create policy gov_policies_insert on public.gov_policies for insert with check (public.gov_can_write(organization_id) and created_by = auth.uid());
create policy gov_policies_update on public.gov_policies for update using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));
create policy gov_policy_standards_read on public.gov_policy_standards for select using (public.gov_can_read(organization_id));
create policy gov_policy_standards_write on public.gov_policy_standards for all using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

create policy gov_assignments_read on public.gov_policy_assignments for select using (user_id = auth.uid() or public.gov_can_read(organization_id));
create policy gov_ack_read on public.gov_acknowledgements for select using (user_id = auth.uid() or public.gov_can_read(organization_id));
-- No client insert policy for assignments / acknowledgements: they are written by gov_assign_policy / gov_acknowledge_policy.

-- Incidents: anyone in the organisation can report; the reporter sees their own; governance staff see and manage all.
create policy gov_incidents_read on public.gov_incidents for select using (public.gov_can_read(organization_id) or reported_by = auth.uid());
create policy gov_incidents_insert on public.gov_incidents for insert with check (public.is_org_member(organization_id) and reported_by = auth.uid());
create policy gov_incidents_update on public.gov_incidents for update using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));
create policy gov_incident_files_read on public.gov_incident_files for select using (public.gov_can_read(organization_id));
create policy gov_incident_files_insert on public.gov_incident_files for insert with check (
  uploaded_by = auth.uid() and (public.gov_can_write(organization_id) or exists (
    select 1 from public.gov_incidents i where i.id = incident_id and i.reported_by = auth.uid())));

create policy gov_capa_read on public.gov_capa for select using (public.gov_can_read(organization_id) or owner_user_id = auth.uid());
create policy gov_capa_insert on public.gov_capa for insert with check (public.gov_can_write(organization_id) and created_by = auth.uid());
create policy gov_capa_update on public.gov_capa for update using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

create policy gov_audits_read on public.gov_audits for select using (public.gov_can_read(organization_id) or owner_user_id = auth.uid());
create policy gov_audits_insert on public.gov_audits for insert with check (public.gov_can_write(organization_id) and created_by = auth.uid());
create policy gov_audits_update on public.gov_audits for update using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));

create policy gov_qips_read on public.gov_qips for select using (public.gov_can_read(organization_id));
create policy gov_qips_write on public.gov_qips for all using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id) and created_by = auth.uid());
-- gov_counters has no policies: only the security-definer reference function touches it.


-- Governance staff can read the governance part of the audit trail (the existing audit.read permission is separate).
create policy audit_governance_read on public.audit_events for select
  using (action like 'governance.%' and public.gov_can_read(organization_id));

-- ---------------------------------------------------------------------------------------------------------------
-- Private storage for evidence, policy documents and incident attachments.
-- Object path convention: <organization_id>/<evidence|policies|incidents>/<uuid>-<file name>. No update/delete
-- policy exists, so stored files are immutable.
-- ---------------------------------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values (
  'governance-files', 'governance-files', false, 20971520,
  array['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword', 'application/vnd.ms-excel']
) on conflict (id) do nothing;

create policy gov_files_read on storage.objects for select using (
  bucket_id = 'governance-files' and public.gov_can_read(((storage.foldername(name))[1])::uuid));
create policy gov_files_insert on storage.objects for insert with check (
  bucket_id = 'governance-files' and (
    public.gov_can_write(((storage.foldername(name))[1])::uuid)
    or ((storage.foldername(name))[2] = 'incidents' and public.is_org_member(((storage.foldername(name))[1])::uuid))));
