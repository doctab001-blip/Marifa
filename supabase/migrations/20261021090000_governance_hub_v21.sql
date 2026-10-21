-- Governance Hub V2.1: extends the CBAHI Accreditation Hub (20261020190000) without replacing anything in it.
--
-- Scope (every change is additive; see docs/governance-hub-v21.md for the full inventory):
--   * Standards hierarchy: accreditation editions and chapters as their own records, measurable elements under standards,
--     element assessments as append-only history. Existing gov_standards rows are backfilled with edition_id/chapter_id;
--     their ids, codes, assessments and evidence are untouched.
--   * Evidence vault: one stored file can be linked to several standards or elements (no duplicate upload), evidence
--     versions (supersedes_id), configurable evidence requirements with a Missing -> Uploaded -> Under review -> Verified
--     workflow (expired / superseded are derived from the evidence itself).
--   * Clinical quality indicators: hospital-defined indicators and append-only reporting periods with verification.
--   * Committees: committee profiles, members, meetings (Scheduled -> Held -> Minutes drafted -> Approved -> Actions followed
--     up), attendance, decisions, attachments. Meeting actions are rows in the EXISTING gov_capa table so they appear in
--     the same action tracker instead of a second task list.
--   * Incidents: investigator and investigation dates, linked policy/guideline, RCA attachments, a status timeline,
--     CAPA completion evidence and effectiveness checks, hospital-configured regulatory reporting rules.
--   * Audits and QIP: reusable audit templates with criteria, per-case observations, numerator/denominator, re-audit dates,
--     multiple PDSA cycles per project, audit -> QIP -> re-audit and incident -> QIP links.
--   * Guideline governance: governance status per Marifa clinical guideline / local protocol, pinned to a specific version.
--     Clinical content is never copied: only ids are stored.
--   * One generic, validated link table (gov_links) so a committee decision, indicator, element or guideline can point at
--     any other governance record without copying it.
--   * Configurable risk-band thresholds in gov_settings (defaults equal the bands already used by the app).
--
-- Not changed: no existing table, column, row, policy or function is dropped. Two CHECK constraints on gov_capa are
-- WIDENED (meeting actions, 'follow_up' kind) and gov_assessment_guard is replaced by a version that ALSO accepts evidence
-- linked through gov_evidence_links; every value valid before remains valid.
-- No demonstration rows are inserted. No CBAHI text, ESR list, regulatory deadline or clinical target is shipped.

-- ---------------------------------------------------------------------------------------------------------------
-- 0. Settings: risk methodology thresholds (score = likelihood x impact on the existing 5x5 matrix)
-- ---------------------------------------------------------------------------------------------------------------
alter table public.gov_settings
  add column if not exists risk_moderate_min smallint not null default 5,
  add column if not exists risk_high_min smallint not null default 10,
  add column if not exists risk_extreme_min smallint not null default 15,
  add column if not exists risk_methodology_note text not null default '';
alter table public.gov_settings
  add constraint gov_settings_risk_bands_check check (
    risk_moderate_min between 2 and 25 and risk_high_min between 2 and 25 and risk_extreme_min between 2 and 25
    and risk_moderate_min < risk_high_min and risk_high_min < risk_extreme_min),
  add constraint gov_settings_risk_note_check check (length(risk_methodology_note) <= 500);

-- ---------------------------------------------------------------------------------------------------------------
-- 1. Standards hierarchy: Edition -> Chapter -> Standard -> Measurable element
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_editions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program text not null default 'CBAHI' check (length(trim(program)) between 1 and 80),
  label text not null check (length(trim(label)) between 1 and 160),
  hospital_type text not null default '' check (length(hospital_type) <= 120),
  -- false = an internal framework the hospital wrote itself; it is always shown as non-official.
  is_official boolean not null default true,
  source_note text not null default '' check (length(source_note) <= 1000),
  status text not null default 'active' check (status in ('active', 'superseded', 'draft')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, label),
  unique (id, organization_id)
);

create table public.gov_chapters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  edition_id uuid not null,
  code text not null default '' check (length(code) <= 40),
  name text not null default '' check (length(name) <= 200),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (edition_id, code, name),
  unique (id, organization_id),
  foreign key (edition_id, organization_id) references public.gov_editions(id, organization_id) on delete cascade
);

alter table public.gov_standards
  add column if not exists edition_id uuid,
  add column if not exists chapter_id uuid,
  add column if not exists is_official boolean not null default true,
  add column if not exists source_reference text not null default '',
  add column if not exists updated_at timestamptz;
alter table public.gov_standards
  add constraint gov_standards_edition_fk foreign key (edition_id, organization_id) references public.gov_editions(id, organization_id),
  add constraint gov_standards_chapter_fk foreign key (chapter_id, organization_id) references public.gov_chapters(id, organization_id),
  add constraint gov_standards_source_reference_check check (length(source_reference) <= 500);

-- Backfill: one edition per distinct label already in use, one chapter per distinct (code, name) inside it.
insert into public.gov_editions (organization_id, label, created_at)
select organization_id, edition, min(created_at) from public.gov_standards group by organization_id, edition
on conflict (organization_id, label) do nothing;
insert into public.gov_chapters (organization_id, edition_id, code, name)
select distinct s.organization_id, e.id, s.chapter_code, s.chapter_name
from public.gov_standards s join public.gov_editions e on e.organization_id = s.organization_id and e.label = s.edition
on conflict (edition_id, code, name) do nothing;
update public.gov_standards s set
  edition_id = e.id,
  chapter_id = c.id
from public.gov_editions e, public.gov_chapters c
where e.organization_id = s.organization_id and e.label = s.edition
  and c.edition_id = e.id and c.code = s.chapter_code and c.name = s.chapter_name
  and (s.edition_id is null or s.chapter_id is null);

-- Keeps edition_id / chapter_id filled for every insert path, including the original CSV import, which only sends text.
create or replace function public.gov_standard_hierarchy()
returns trigger language plpgsql security definer set search_path = public as $$
declare ed uuid; ch uuid;
begin
  if tg_op = 'UPDATE' and (new.edition, new.chapter_code, new.chapter_name, new.organization_id)
     is not distinct from (old.edition, old.chapter_code, old.chapter_name, old.organization_id)
     and new.edition_id is not distinct from old.edition_id and new.chapter_id is not distinct from old.chapter_id then
    new.updated_at := now();
    return new;
  end if;
  insert into gov_editions (organization_id, label, created_by) values (new.organization_id, new.edition, new.created_by)
  on conflict (organization_id, label) do nothing;
  select id into ed from gov_editions where organization_id = new.organization_id and label = new.edition;
  insert into gov_chapters (organization_id, edition_id, code, name) values (new.organization_id, ed, new.chapter_code, new.chapter_name)
  on conflict (edition_id, code, name) do nothing;
  select id into ch from gov_chapters where edition_id = ed and code = new.chapter_code and name = new.chapter_name;
  new.edition_id := ed;
  new.chapter_id := ch;
  if tg_op = 'UPDATE' then new.updated_at := now(); end if;
  return new;
end $$;
create trigger gov_standards_hierarchy before insert or update on public.gov_standards
  for each row execute function public.gov_standard_hierarchy();

create table public.gov_elements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  standard_id uuid not null,
  -- Internal identifier, unique inside its standard. official_code holds the code printed in the licensed manual, if any.
  code text not null check (length(trim(code)) between 1 and 80),
  official_code text not null default '' check (length(official_code) <= 80),
  description text not null check (length(trim(description)) between 1 and 4000),
  is_esr boolean not null default false,
  -- Where the ESR classification was verified (e.g. the manual page or the import file). Required when is_esr.
  esr_source text not null default '' check (length(esr_source) <= 300),
  department text not null default '' check (length(department) <= 160),
  owner_user_id uuid references public.profiles(id),
  applicability text not null default 'applicable' check (applicability in ('applicable', 'not_applicable', 'to_confirm')),
  evidence_guidance text not null default '' check (length(evidence_guidance) <= 2000),
  verified_on date,
  review_due date,
  is_official boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (standard_id, code),
  unique (id, organization_id),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade,
  check (not is_esr or length(trim(esr_source)) > 0)
);
create index gov_elements_org_idx on public.gov_elements(organization_id, standard_id, sort_order, code);

create table public.gov_element_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  element_id uuid not null,
  rating text not null check (rating in ('insufficient', 'partial', 'satisfactory', 'not_applicable')),
  method text not null default 'self_assessment' check (method in ('self_assessment', 'mock_survey', 'audit', 'external_survey')),
  notes text not null default '' check (length(notes) <= 4000),
  next_review_due date,
  assessed_by uuid references public.profiles(id),
  assessed_at timestamptz not null default now(),
  foreign key (element_id, organization_id) references public.gov_elements(id, organization_id) on delete cascade
);
create index gov_element_assessments_idx on public.gov_element_assessments(element_id, assessed_at desc);

create view public.gov_element_status with (security_invoker = true) as
select el.id as element_id, el.organization_id, el.standard_id, a.rating, a.method, a.notes, a.assessed_at, a.assessed_by, a.next_review_due
from public.gov_elements el
left join lateral (
  select * from public.gov_element_assessments x where x.element_id = el.id order by x.assessed_at desc, x.id desc limit 1
) a on true;

-- ---------------------------------------------------------------------------------------------------------------
-- 2. Evidence vault
-- ---------------------------------------------------------------------------------------------------------------
alter table public.gov_evidence add column if not exists supersedes_id uuid references public.gov_evidence(id);
create index if not exists gov_evidence_supersedes_idx on public.gov_evidence(supersedes_id);
-- gov_evidence has no unique (id, organization_id) yet; the composite foreign keys below need one.
alter table public.gov_evidence add constraint gov_evidence_id_org_key unique (id, organization_id);

create or replace function public.gov_evidence_version_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.supersedes_id is not null and not exists (
      select 1 from gov_evidence p where p.id = new.supersedes_id and p.organization_id = new.organization_id) then
      raise exception 'invalid_reference: the earlier version belongs to another organisation or does not exist' using errcode = 'P0001';
    end if;
    return new;
  end if;
  if new.supersedes_id is distinct from old.supersedes_id then
    raise exception 'evidence_immutable: the version chain of an evidence record cannot be changed' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger gov_evidence_version_guard before insert or update on public.gov_evidence
  for each row execute function public.gov_evidence_version_guard();

-- The same stored file may support several standards or measurable elements. Unlinking keeps the row (with a reason).
create table public.gov_evidence_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  evidence_id uuid not null,
  standard_id uuid,
  element_id uuid,
  linked_by uuid references public.profiles(id),
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  unlinked_by uuid references public.profiles(id),
  unlink_reason text,
  foreign key (evidence_id, organization_id) references public.gov_evidence(id, organization_id) on delete cascade,
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade,
  foreign key (element_id, organization_id) references public.gov_elements(id, organization_id) on delete cascade,
  check ((standard_id is null) <> (element_id is null)),
  check ((unlinked_at is null) = (unlink_reason is null))
);
create unique index gov_evidence_links_standard_uq on public.gov_evidence_links(evidence_id, standard_id) where unlinked_at is null and standard_id is not null;
create unique index gov_evidence_links_element_uq on public.gov_evidence_links(evidence_id, element_id) where unlinked_at is null and element_id is not null;
create index gov_evidence_links_target_idx on public.gov_evidence_links(organization_id, standard_id, element_id);

create or replace function public.gov_evidence_link_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'link_not_deletable: unlink the evidence with a reason instead' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if (new.organization_id, new.evidence_id, new.standard_id, new.element_id, new.linked_by, new.linked_at)
       is distinct from (old.organization_id, old.evidence_id, old.standard_id, old.element_id, old.linked_by, old.linked_at) then
      raise exception 'link_immutable: only unlinking can change an evidence link' using errcode = 'P0001';
    end if;
    if old.unlinked_at is not null then
      raise exception 'link_closed: this link was already removed' using errcode = 'P0001';
    end if;
    if new.unlinked_at is not null and btrim(coalesce(new.unlink_reason, '')) = '' then
      raise exception 'reason_required: give a reason for unlinking evidence' using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger gov_evidence_links_guard before update or delete on public.gov_evidence_links
  for each row execute function public.gov_evidence_link_guard();

-- Current evidence for a standard: attached directly, or linked to it, not withdrawn, not expired, not superseded.
create or replace function public.gov_has_current_evidence(p_standard uuid, p_element uuid default null)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from gov_evidence e
    where e.withdrawn_at is null
      and (e.valid_until is null or e.valid_until >= current_date)
      and not exists (select 1 from gov_evidence n where n.supersedes_id = e.id and n.withdrawn_at is null)
      and (
        (p_standard is not null and e.standard_id = p_standard)
        or exists (select 1 from gov_evidence_links l where l.evidence_id = e.id and l.unlinked_at is null
                   and ((p_standard is not null and l.standard_id = p_standard) or (p_element is not null and l.element_id = p_element)))
      )
  );
$$;
revoke all on function public.gov_has_current_evidence(uuid, uuid) from public, anon;

-- Same rules as before, plus evidence linked through gov_evidence_links counts. A superseded file no longer counts.
create or replace function public.gov_assessment_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then
    raise exception 'assessments_immutable: assessments are append-only history; record a new assessment instead' using errcode = 'P0001';
  end if;
  if new.rating = 'satisfactory' and not public.gov_has_current_evidence(new.standard_id, null) then
    raise exception 'evidence_required: a standard cannot be rated satisfactory without current evidence attached' using errcode = 'P0001';
  end if;
  if new.rating in ('insufficient', 'partial') and btrim(new.notes) = '' then
    raise exception 'notes_required: describe the gap for a partial or insufficient rating' using errcode = 'P0001';
  end if;
  return new;
end $$;

create or replace function public.gov_element_assessment_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare parent uuid;
begin
  if tg_op <> 'INSERT' then
    raise exception 'assessments_immutable: assessments are append-only history; record a new assessment instead' using errcode = 'P0001';
  end if;
  select standard_id into parent from gov_elements where id = new.element_id;
  if new.rating = 'satisfactory' and not public.gov_has_current_evidence(parent, new.element_id) then
    raise exception 'evidence_required: a measurable element cannot be rated satisfactory without current evidence for it or its standard' using errcode = 'P0001';
  end if;
  if new.rating in ('insufficient', 'partial') and btrim(new.notes) = '' then
    raise exception 'notes_required: describe the gap for a partial or insufficient rating' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger gov_element_assessments_guard before insert or update or delete on public.gov_element_assessments
  for each row execute function public.gov_element_assessment_guard();

-- Expected-evidence checklist. Categories are the hospital's own configuration, not a claim about what CBAHI requires.
create table public.gov_evidence_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  standard_id uuid,
  element_id uuid,
  category text not null check (category in ('approved_policy', 'guideline_sop', 'audit_report', 'qi_report', 'committee_minutes',
    'training_record', 'equipment_checklist', 'incident_investigation', 'capa_report', 'other')),
  description text not null default '' check (length(description) <= 1000),
  department text not null default '' check (length(department) <= 160),
  owner_user_id uuid references public.profiles(id),
  is_required boolean not null default true,
  due_date date,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id) on delete cascade,
  foreign key (element_id, organization_id) references public.gov_elements(id, organization_id) on delete cascade,
  check ((standard_id is null) <> (element_id is null))
);
create index gov_evidence_requirements_idx on public.gov_evidence_requirements(organization_id, standard_id, element_id);

create table public.gov_requirement_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  requirement_id uuid not null,
  evidence_id uuid not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'under_review', 'verified', 'rejected')),
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewer_user_id uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text not null default '' check (length(review_note) <= 2000),
  unique (requirement_id, evidence_id),
  foreign key (requirement_id, organization_id) references public.gov_evidence_requirements(id, organization_id) on delete cascade,
  foreign key (evidence_id, organization_id) references public.gov_evidence(id, organization_id) on delete cascade
);
create index gov_requirement_submissions_idx on public.gov_requirement_submissions(requirement_id, submitted_at desc);

create or replace function public.gov_submission_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then raise exception 'submission_not_deletable' using errcode = 'P0001'; end if;
  if tg_op = 'INSERT' then
    if new.status <> 'uploaded' then raise exception 'submission_must_start_uploaded' using errcode = 'P0001'; end if;
    return new;
  end if;
  if (new.organization_id, new.requirement_id, new.evidence_id, new.submitted_by, new.submitted_at)
     is distinct from (old.organization_id, old.requirement_id, old.evidence_id, old.submitted_by, old.submitted_at) then
    raise exception 'submission_immutable: only the review fields can change' using errcode = 'P0001';
  end if;
  if new.status is distinct from old.status then
    if not ((old.status = 'uploaded' and new.status = 'under_review')
         or (old.status = 'under_review' and new.status in ('verified', 'rejected'))
         or (old.status in ('verified', 'rejected') and new.status = 'under_review')) then
      raise exception 'invalid_transition: % to % is not allowed', old.status, new.status using errcode = 'P0001';
    end if;
    if new.status in ('verified', 'rejected') then
      if new.reviewer_user_id is null then raise exception 'reviewer_required: record who reviewed the evidence' using errcode = 'P0001'; end if;
      if new.status = 'rejected' and btrim(new.review_note) = '' then
        raise exception 'note_required: explain why the evidence was rejected' using errcode = 'P0001';
      end if;
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end $$;
create trigger gov_requirement_submissions_guard before insert or update or delete on public.gov_requirement_submissions
  for each row execute function public.gov_submission_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- 3. Clinical quality indicators
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_indicators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null check (length(trim(code)) between 1 and 40),
  title text not null check (length(trim(title)) between 1 and 240),
  domain text not null default '' check (length(domain) <= 120),
  department text not null default '' check (length(department) <= 160),
  description text not null default '' check (length(description) <= 4000),
  numerator_definition text not null default '' check (length(numerator_definition) <= 2000),
  denominator_definition text not null default '' check (length(denominator_definition) <= 2000),
  inclusion_criteria text not null default '' check (length(inclusion_criteria) <= 2000),
  exclusion_criteria text not null default '' check (length(exclusion_criteria) <= 2000),
  data_source text not null default '' check (length(data_source) <= 500),
  frequency text not null default 'monthly' check (frequency in ('weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'ad_hoc')),
  measure_type text not null default 'percentage' check (measure_type in ('percentage', 'rate', 'count', 'time', 'continuous')),
  rate_multiplier numeric check (rate_multiplier is null or rate_multiplier > 0),
  unit text not null default '' check (length(unit) <= 40),
  -- Targets are set by the hospital. Nothing is pre-filled.
  target_value numeric,
  target_upper numeric,
  direction text not null default 'higher_is_better' check (direction in ('higher_is_better', 'lower_is_better', 'within_range')),
  owner_user_id uuid references public.profiles(id),
  template_key text check (template_key is null or length(template_key) <= 60),
  status text not null default 'active' check (status in ('active', 'retired')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (id, organization_id),
  check (measure_type <> 'percentage' or target_value is null or target_value between 0 and 100),
  check (measure_type <> 'rate' or rate_multiplier is not null),
  check (direction <> 'within_range' or (target_value is not null and target_upper is not null and target_upper >= target_value))
);

create table public.gov_indicator_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  indicator_id uuid not null,
  period_start date not null,
  period_end date not null,
  numerator numeric check (numerator is null or numerator >= 0),
  denominator numeric check (denominator is null or denominator >= 0),
  -- Calculated for percentage and rate indicators; entered directly for count, time and continuous ones.
  -- Null with denominator 0 means "no eligible cases in the period", never 0%.
  value numeric,
  sample_size integer check (sample_size is null or sample_size > 0),
  evidence_id uuid,
  notes text not null default '' check (length(notes) <= 2000),
  -- 'verified_events' (automated measurement from verified clinical events) is reserved and NOT enabled.
  source_kind text not null default 'manual' check (source_kind in ('manual', 'audit')),
  audit_id uuid,
  verification text not null default 'unverified' check (verification in ('unverified', 'verified', 'rejected')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  verification_note text not null default '' check (length(verification_note) <= 2000),
  supersedes_id uuid references public.gov_indicator_results(id),
  entered_by uuid references public.profiles(id),
  entered_at timestamptz not null default now(),
  foreign key (indicator_id, organization_id) references public.gov_indicators(id, organization_id) on delete cascade,
  foreign key (evidence_id, organization_id) references public.gov_evidence(id, organization_id),
  foreign key (audit_id, organization_id) references public.gov_audits(id, organization_id),
  check (period_end >= period_start)
);
create index gov_indicator_results_idx on public.gov_indicator_results(indicator_id, period_start desc, entered_at desc);

create or replace function public.gov_indicator_result_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare ind public.gov_indicators;
begin
  if tg_op = 'DELETE' then
    raise exception 'result_not_deletable: record a correction instead of deleting a reported value' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if (new.organization_id, new.indicator_id, new.period_start, new.period_end, new.numerator, new.denominator, new.value,
        new.sample_size, new.evidence_id, new.notes, new.source_kind, new.audit_id, new.supersedes_id, new.entered_by, new.entered_at)
       is distinct from
       (old.organization_id, old.indicator_id, old.period_start, old.period_end, old.numerator, old.denominator, old.value,
        old.sample_size, old.evidence_id, old.notes, old.source_kind, old.audit_id, old.supersedes_id, old.entered_by, old.entered_at) then
      raise exception 'result_immutable: reported values cannot be edited; record a correction' using errcode = 'P0001';
    end if;
    if new.verification is distinct from old.verification then
      if new.verification in ('verified', 'rejected') and new.verified_by is null then
        raise exception 'reviewer_required: record who verified the value' using errcode = 'P0001';
      end if;
      if new.verification = 'rejected' and btrim(new.verification_note) = '' then
        raise exception 'note_required: explain why the value was rejected' using errcode = 'P0001';
      end if;
      new.verified_at := case when new.verification = 'unverified' then null else now() end;
    end if;
    return new;
  end if;

  select * into ind from gov_indicators where id = new.indicator_id and organization_id = new.organization_id;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if new.verification <> 'unverified' then raise exception 'result_must_start_unverified' using errcode = 'P0001'; end if;
  if new.supersedes_id is not null and not exists (
    select 1 from gov_indicator_results r where r.id = new.supersedes_id and r.indicator_id = new.indicator_id) then
    raise exception 'invalid_reference: a correction must replace a value of the same indicator' using errcode = 'P0001';
  end if;
  if ind.measure_type in ('percentage', 'rate') then
    if new.numerator is null or new.denominator is null then
      raise exception 'numerator_required: enter both the numerator and the denominator' using errcode = 'P0001';
    end if;
    if ind.measure_type = 'percentage' and new.numerator > new.denominator then
      raise exception 'invalid_percentage: the numerator cannot be larger than the denominator' using errcode = 'P0001';
    end if;
    if new.denominator = 0 then
      if new.numerator <> 0 then raise exception 'invalid_percentage: with no eligible cases the numerator must be 0' using errcode = 'P0001'; end if;
      new.value := null;
    else
      new.value := round((new.numerator / new.denominator) * case when ind.measure_type = 'percentage' then 100 else ind.rate_multiplier end, 4);
    end if;
  else
    if new.value is null then raise exception 'value_required: enter the measured value' using errcode = 'P0001'; end if;
    if ind.measure_type = 'count' and (new.value < 0 or new.value <> trunc(new.value)) then
      raise exception 'invalid_count: a count must be a whole number of 0 or more' using errcode = 'P0001';
    end if;
    if ind.measure_type = 'time' and new.value < 0 then
      raise exception 'invalid_time: a duration cannot be negative' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger gov_indicator_results_guard before insert or update or delete on public.gov_indicator_results
  for each row execute function public.gov_indicator_result_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- 4. Committees and meetings
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_committees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 200),
  purpose text not null default '' check (length(purpose) <= 4000),
  chair_user_id uuid references public.profiles(id),
  secretary_user_id uuid references public.profiles(id),
  meeting_frequency text not null default 'monthly' check (meeting_frequency in ('weekly', 'fortnightly', 'monthly', 'bimonthly', 'quarterly', 'biannual', 'annual', 'ad_hoc')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  template_key text check (template_key is null or length(template_key) <= 60),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table public.gov_committee_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  committee_id uuid not null,
  user_id uuid not null references public.profiles(id),
  member_role text not null default 'member' check (member_role in ('chair', 'secretary', 'member', 'advisor')),
  added_at timestamptz not null default now(),
  unique (committee_id, user_id),
  foreign key (committee_id, organization_id) references public.gov_committees(id, organization_id) on delete cascade
);

create table public.gov_meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  committee_id uuid not null,
  scheduled_at timestamptz not null,
  location text not null default '' check (length(location) <= 200),
  agenda text not null default '' check (length(agenda) <= 8000),
  status text not null default 'scheduled' check (status in ('scheduled', 'held', 'minutes_drafted', 'approved', 'actions_followed_up', 'cancelled')),
  held_at timestamptz,
  minutes text not null default '' check (length(minutes) <= 20000),
  minutes_approved_by uuid references public.profiles(id),
  minutes_approved_at timestamptz,
  next_meeting_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (committee_id, organization_id) references public.gov_committees(id, organization_id) on delete cascade
);
create index gov_meetings_idx on public.gov_meetings(organization_id, committee_id, scheduled_at desc);

create table public.gov_meeting_attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  meeting_id uuid not null,
  user_id uuid not null references public.profiles(id),
  status text not null check (status in ('present', 'apologies', 'absent')),
  recorded_at timestamptz not null default now(),
  unique (meeting_id, user_id),
  foreign key (meeting_id, organization_id) references public.gov_meetings(id, organization_id) on delete cascade
);

create table public.gov_meeting_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  meeting_id uuid not null,
  decision text not null check (length(trim(decision)) between 1 and 4000),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (meeting_id, organization_id) references public.gov_meetings(id, organization_id) on delete cascade
);

create table public.gov_meeting_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  meeting_id uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  foreign key (meeting_id, organization_id) references public.gov_meetings(id, organization_id) on delete cascade
);

-- Meeting actions are CAPA rows, so one tracker shows every owned, dated action whatever raised it.
alter table public.gov_capa
  add column if not exists meeting_id uuid,
  add column if not exists decision_id uuid,
  add column if not exists completion_note text not null default '',
  add column if not exists completion_evidence_path text,
  add column if not exists completion_file_name text,
  add column if not exists effectiveness text not null default 'not_assessed',
  add column if not exists effectiveness_checked_by uuid references public.profiles(id),
  add column if not exists effectiveness_checked_at timestamptz;
alter table public.gov_capa
  add constraint gov_capa_meeting_fk foreign key (meeting_id, organization_id) references public.gov_meetings(id, organization_id) on delete cascade,
  add constraint gov_capa_decision_fk foreign key (decision_id, organization_id) references public.gov_meeting_decisions(id, organization_id),
  add constraint gov_capa_effectiveness_check check (effectiveness in ('not_assessed', 'effective', 'partially_effective', 'not_effective')),
  add constraint gov_capa_completion_note_check check (length(completion_note) <= 4000);
create index if not exists gov_capa_meeting_idx on public.gov_capa(meeting_id);

-- Widen the two CHECK constraints that pinned CAPA to incidents/audits and to two kinds. Found by definition, not by name.
do $$
declare c record;
begin
  for c in
    select conname, pg_get_constraintdef(oid) as def from pg_constraint
    where conrelid = 'public.gov_capa'::regclass and contype = 'c'
  loop
    if c.def ilike '%incident_id IS NOT NULL%audit_id IS NOT NULL%' and c.def not ilike '%meeting_id%' then
      execute format('alter table public.gov_capa drop constraint %I', c.conname);
    elsif c.def ilike '%kind%corrective%preventive%' and c.def not ilike '%follow_up%' then
      execute format('alter table public.gov_capa drop constraint %I', c.conname);
    end if;
  end loop;
end $$;
alter table public.gov_capa
  add constraint gov_capa_source_check check (incident_id is not null or audit_id is not null or meeting_id is not null),
  add constraint gov_capa_kind_v21_check check (kind in ('corrective', 'preventive', 'follow_up'));

create or replace function public.gov_capa_effectiveness_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Reopening an action invalidates an earlier effectiveness check.
  if new.status in ('open', 'in_progress') and old.status in ('done', 'verified') then
    new.effectiveness := 'not_assessed';
    new.effectiveness_checked_by := null;
    new.effectiveness_checked_at := null;
    return new;
  end if;
  if new.effectiveness is distinct from old.effectiveness then
    if new.status not in ('done', 'verified') then
      raise exception 'not_complete: assess effectiveness only after the action is done' using errcode = 'P0001';
    end if;
    if new.effectiveness <> 'not_assessed' and new.effectiveness_checked_by is null then
      raise exception 'reviewer_required: record who checked the effectiveness' using errcode = 'P0001';
    end if;
    new.effectiveness_checked_at := case when new.effectiveness = 'not_assessed' then null else now() end;
  end if;
  return new;
end $$;
create trigger gov_capa_effectiveness_guard before update on public.gov_capa
  for each row execute function public.gov_capa_effectiveness_guard();

create or replace function public.gov_meeting_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then raise exception 'meeting_not_deletable: cancel the meeting instead' using errcode = 'P0001'; end if;
  if tg_op = 'INSERT' then
    if new.status <> 'scheduled' then raise exception 'meeting_must_start_scheduled' using errcode = 'P0001'; end if;
    return new;
  end if;
  if old.status in ('approved', 'actions_followed_up') and (new.minutes, new.agenda, new.scheduled_at, new.held_at, new.committee_id)
     is distinct from (old.minutes, old.agenda, old.scheduled_at, old.held_at, old.committee_id) then
    raise exception 'minutes_frozen: approved minutes cannot be edited' using errcode = 'P0001';
  end if;
  if new.status is distinct from old.status then
    if not ((old.status = 'scheduled' and new.status in ('held', 'cancelled'))
         or (old.status = 'held' and new.status = 'minutes_drafted')
         or (old.status = 'minutes_drafted' and new.status in ('approved', 'held'))
         or (old.status = 'approved' and new.status = 'actions_followed_up')) then
      raise exception 'invalid_transition: % to % is not allowed', old.status, new.status using errcode = 'P0001';
    end if;
    if new.status = 'held' and old.status = 'scheduled' then new.held_at := coalesce(new.held_at, now()); end if;
    if new.status = 'minutes_drafted' and btrim(new.minutes) = '' then
      raise exception 'minutes_required: write the minutes before marking them drafted' using errcode = 'P0001';
    end if;
    if new.status = 'approved' then
      if new.minutes_approved_by is null then raise exception 'approver_required: record who approved the minutes' using errcode = 'P0001'; end if;
      new.minutes_approved_at := now();
    end if;
    if new.status = 'actions_followed_up' and exists (
      select 1 from gov_capa c where c.meeting_id = new.id and c.status in ('open', 'in_progress')) then
      raise exception 'actions_open: every action from this meeting must be done before it is marked followed up' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger gov_meetings_guard before insert or update or delete on public.gov_meetings
  for each row execute function public.gov_meeting_guard();

-- Attendance and decisions can change until the minutes are approved; after that they are part of the record.
create or replace function public.gov_meeting_child_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare st text;
begin
  select status into st from gov_meetings where id = coalesce(new.meeting_id, old.meeting_id);
  if st in ('approved', 'actions_followed_up') then
    raise exception 'minutes_frozen: the minutes of this meeting are approved; record changes at the next meeting' using errcode = 'P0001';
  end if;
  if st = 'cancelled' then
    raise exception 'meeting_cancelled: this meeting was cancelled' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
create trigger gov_meeting_attendance_guard before insert or update or delete on public.gov_meeting_attendance
  for each row execute function public.gov_meeting_child_guard();
create trigger gov_meeting_decisions_guard before insert or update or delete on public.gov_meeting_decisions
  for each row execute function public.gov_meeting_child_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- 5. Incidents: investigation fields, timeline, attachment kinds, regulatory reporting rules
-- ---------------------------------------------------------------------------------------------------------------
alter table public.gov_incidents
  add column if not exists investigator_user_id uuid references public.profiles(id),
  add column if not exists investigation_started_on date,
  add column if not exists investigation_completed_on date,
  add column if not exists linked_policy_id uuid,
  add column if not exists linked_guideline_id uuid references public.clinical_guidelines(id);
alter table public.gov_incidents
  add constraint gov_incidents_policy_fk foreign key (linked_policy_id, organization_id) references public.gov_policies(id, organization_id),
  add constraint gov_incidents_investigation_dates_check check (
    investigation_completed_on is null or investigation_started_on is null or investigation_completed_on >= investigation_started_on);

alter table public.gov_incident_files
  add column if not exists kind text not null default 'report';
alter table public.gov_incident_files
  add constraint gov_incident_files_kind_check check (kind in ('report', 'rca', 'capa_evidence'));

-- Status timeline. Only the status and who changed it are kept (no narrative), so it can be shown to governance staff.
create table public.gov_incident_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  incident_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now(),
  foreign key (incident_id, organization_id) references public.gov_incidents(id, organization_id) on delete cascade
);
create index gov_incident_status_history_idx on public.gov_incident_status_history(incident_id, changed_at);

create or replace function public.gov_incident_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into gov_incident_status_history (organization_id, incident_id, from_status, to_status, changed_by)
    values (new.organization_id, new.id, case when tg_op = 'INSERT' then null else old.status end, new.status,
            coalesce(auth.uid(), nullif(current_setting('gov.actor', true), '')::uuid, case when tg_op = 'INSERT' then new.reported_by end));
  end if;
  return new;
end $$;
create trigger gov_incidents_history after insert or update on public.gov_incidents
  for each row execute function public.gov_incident_history();

-- Existing incidents get their first timeline entry; earlier changes were not recorded and are not invented.
insert into public.gov_incident_status_history (organization_id, incident_id, from_status, to_status, changed_by, changed_at)
select organization_id, id, null, 'reported', reported_by, created_at from public.gov_incidents;

-- Regulatory reporting rules are configured by the hospital from the programme/edition it follows. None are shipped.
create table public.gov_regulatory_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program text not null default 'CBAHI' check (length(trim(program)) between 1 and 80),
  edition_id uuid,
  name text not null check (length(trim(name)) between 1 and 200),
  description text not null default '' check (length(description) <= 2000),
  applies_to_sentinel boolean not null default true,
  min_severity text check (min_severity is null or min_severity in ('low', 'medium', 'high', 'critical')),
  categories text[] not null default '{}',
  report_within_hours integer not null check (report_within_hours between 1 and 8760),
  remind_before_hours integer not null default 0 check (remind_before_hours >= 0),
  recipient text not null default '' check (length(recipient) <= 200),
  source_note text not null default '' check (length(source_note) <= 500),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (edition_id, organization_id) references public.gov_editions(id, organization_id),
  check (remind_before_hours < report_within_hours)
);

create table public.gov_incident_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  incident_id uuid not null,
  rule_id uuid not null,
  reported_at timestamptz not null,
  external_reference text not null default '' check (length(external_reference) <= 120),
  note text not null default '' check (length(note) <= 1000),
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz not null default now(),
  unique (incident_id, rule_id),
  foreign key (incident_id, organization_id) references public.gov_incidents(id, organization_id) on delete cascade,
  foreign key (rule_id, organization_id) references public.gov_regulatory_rules(id, organization_id)
);

-- ---------------------------------------------------------------------------------------------------------------
-- 6. Audits and quality improvement
-- ---------------------------------------------------------------------------------------------------------------
alter table public.gov_qips add constraint gov_qips_id_org_key unique (id, organization_id);

create table public.gov_audit_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 240),
  objective text not null default '' check (length(objective) <= 2000),
  clinical_standard text not null default '' check (length(clinical_standard) <= 500),
  standard_id uuid,
  -- [{ "id": "c1", "text": "Hand hygiene before patient contact" }, ...] written by the hospital.
  criteria jsonb not null default '[]'::jsonb check (jsonb_typeof(criteria) = 'array' and jsonb_array_length(criteria) <= 40),
  inclusion_criteria text not null default '' check (length(inclusion_criteria) <= 2000),
  exclusion_criteria text not null default '' check (length(exclusion_criteria) <= 2000),
  sample_size integer check (sample_size is null or sample_size > 0),
  measurement_period text not null default '' check (length(measurement_period) <= 200),
  data_collection_method text not null default '' check (length(data_collection_method) <= 500),
  numerator_definition text not null default '' check (length(numerator_definition) <= 1000),
  denominator_definition text not null default '' check (length(denominator_definition) <= 1000),
  lead_user_id uuid references public.profiles(id),
  action_plan_guidance text not null default '' check (length(action_plan_guidance) <= 2000),
  reaudit_interval_months integer check (reaudit_interval_months is null or reaudit_interval_months between 1 and 60),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (standard_id, organization_id) references public.gov_standards(id, organization_id)
);

alter table public.gov_audits
  add column if not exists template_id uuid,
  add column if not exists objective text not null default '',
  add column if not exists numerator numeric,
  add column if not exists denominator numeric,
  add column if not exists action_plan text not null default '',
  add column if not exists reaudit_due date,
  add column if not exists source_qip_id uuid;
alter table public.gov_audits
  add constraint gov_audits_template_fk foreign key (template_id, organization_id) references public.gov_audit_templates(id, organization_id),
  add constraint gov_audits_source_qip_fk foreign key (source_qip_id, organization_id) references public.gov_qips(id, organization_id),
  add constraint gov_audits_objective_check check (length(objective) <= 2000),
  add constraint gov_audits_action_plan_check check (length(action_plan) <= 4000),
  add constraint gov_audits_fraction_check check (
    (numerator is null and denominator is null)
    or (numerator is not null and denominator is not null and numerator >= 0 and denominator > 0 and numerator <= denominator));

create table public.gov_audit_observations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  audit_id uuid not null,
  -- A case or sample label chosen by the auditor. Never a patient identifier.
  case_ref text not null default '' check (length(case_ref) <= 60),
  -- { "<criterion id>": "met" | "not_met" | "na" }
  results jsonb not null check (jsonb_typeof(results) = 'object'),
  note text not null default '' check (length(note) <= 1000),
  observed_on date not null default current_date,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz not null default now(),
  foreign key (audit_id, organization_id) references public.gov_audits(id, organization_id) on delete cascade
);
create index gov_audit_observations_idx on public.gov_audit_observations(audit_id, recorded_at);

create or replace function public.gov_observation_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare st text; bad int;
begin
  select status into st from gov_audits where id = coalesce(new.audit_id, old.audit_id);
  if st in ('completed', 'cancelled') then
    raise exception 'audit_closed: observations cannot change after the audit is finished' using errcode = 'P0001';
  end if;
  if tg_op <> 'DELETE' then
    select count(*) into bad from jsonb_each_text(new.results) r where r.value not in ('met', 'not_met', 'na');
    if bad > 0 then raise exception 'invalid_result: each criterion must be met, not met or not applicable' using errcode = 'P0001'; end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger gov_audit_observations_guard before insert or update or delete on public.gov_audit_observations
  for each row execute function public.gov_observation_guard();

-- Completes an audit from counted cases (numerator/denominator), calculating the percentage here rather than trusting a
-- typed figure. Same permission as the original gov_complete_audit: governance staff or the audit's own lead.
create or replace function public.gov_complete_audit_counts(p_actor uuid, p_audit uuid, p_numerator integer, p_denominator integer,
  p_findings text default '', p_action_plan text default '', p_reaudit date default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare a public.gov_audits;
begin
  perform public.gov_check_actor(p_actor);
  select * into a from gov_audits where id = p_audit for update;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
  if not public.gov_user_can_write(a.organization_id, p_actor) and a.owner_user_id is distinct from p_actor then
    raise exception 'not_authorised' using errcode = 'P0001';
  end if;
  if p_denominator is null or p_denominator <= 0 then
    raise exception 'denominator_required: record at least one case where a criterion applies' using errcode = 'P0001';
  end if;
  if p_numerator is null or p_numerator < 0 or p_numerator > p_denominator then
    raise exception 'invalid_percentage: the compliant cases must be between 0 and the number of cases' using errcode = 'P0001';
  end if;
  update gov_audits set numerator = p_numerator, denominator = p_denominator, action_plan = coalesce(p_action_plan, ''), reaudit_due = p_reaudit
  where id = p_audit;
  return public.gov_complete_audit(p_actor, p_audit, round(p_numerator::numeric / p_denominator * 100, 1), p_denominator, coalesce(p_findings, ''));
end $$;
revoke all on function public.gov_complete_audit_counts(uuid, uuid, integer, integer, text, text, date) from public, anon;
grant execute on function public.gov_complete_audit_counts(uuid, uuid, integer, integer, text, text, date) to authenticated, service_role;

alter table public.gov_qips
  add column if not exists source_audit_id uuid,
  add column if not exists source_incident_id uuid;
alter table public.gov_qips
  add constraint gov_qips_source_audit_fk foreign key (source_audit_id, organization_id) references public.gov_audits(id, organization_id),
  add constraint gov_qips_source_incident_fk foreign key (source_incident_id, organization_id) references public.gov_incidents(id, organization_id);

create table public.gov_qip_cycles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  qip_id uuid not null,
  cycle_no integer not null check (cycle_no between 1 and 200),
  status text not null default 'plan' check (status in ('plan', 'do', 'study', 'act', 'closed')),
  plan_aim text not null default '' check (length(plan_aim) <= 2000),
  prediction text not null default '' check (length(prediction) <= 2000),
  intervention text not null default '' check (length(intervention) <= 2000),
  measurement_plan text not null default '' check (length(measurement_plan) <= 2000),
  do_notes text not null default '' check (length(do_notes) <= 4000),
  do_observations text not null default '' check (length(do_observations) <= 4000),
  study_results text not null default '' check (length(study_results) <= 4000),
  study_comparison text not null default '' check (length(study_comparison) <= 4000),
  lessons_learned text not null default '' check (length(lessons_learned) <= 4000),
  act_decision text check (act_decision is null or act_decision in ('adopt', 'adapt', 'abandon', 'repeat')),
  act_notes text not null default '' check (length(act_notes) <= 4000),
  started_on date not null default current_date,
  closed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (qip_id, cycle_no),
  foreign key (qip_id, organization_id) references public.gov_qips(id, organization_id) on delete cascade
);

create or replace function public.gov_qip_cycle_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then raise exception 'cycle_not_deletable: PDSA history is kept' using errcode = 'P0001'; end if;
  if tg_op = 'INSERT' then
    if new.status <> 'plan' then raise exception 'cycle_must_start_in_plan' using errcode = 'P0001'; end if;
    if exists (select 1 from gov_qip_cycles c where c.qip_id = new.qip_id and c.status <> 'closed') then
      raise exception 'cycle_open: close the current PDSA cycle before starting another' using errcode = 'P0001';
    end if;
    return new;
  end if;
  if old.status = 'closed' then raise exception 'cycle_closed: a closed PDSA cycle cannot be changed' using errcode = 'P0001'; end if;
  if new.status is distinct from old.status then
    if not ((old.status = 'plan' and new.status = 'do') or (old.status = 'do' and new.status = 'study')
         or (old.status = 'study' and new.status in ('act', 'do')) or (old.status = 'act' and new.status = 'closed')) then
      raise exception 'invalid_transition: % to % is not allowed', old.status, new.status using errcode = 'P0001';
    end if;
    if new.status = 'do' and old.status = 'plan' and (btrim(new.plan_aim) = '' or btrim(new.intervention) = '') then
      raise exception 'plan_incomplete: record the aim and the intervention before testing it' using errcode = 'P0001';
    end if;
    if new.status = 'act' and btrim(new.study_results) = '' then
      raise exception 'study_incomplete: record the results before deciding what to do' using errcode = 'P0001';
    end if;
    if new.status = 'closed' then
      if new.act_decision is null then raise exception 'decision_required: choose adopt, adapt, abandon or repeat' using errcode = 'P0001'; end if;
      new.closed_at := now();
    end if;
  end if;
  return new;
end $$;
create trigger gov_qip_cycles_guard before insert or update or delete on public.gov_qip_cycles
  for each row execute function public.gov_qip_cycle_guard();

-- The project board keeps working: the project phase follows its open cycle.
create or replace function public.gov_qip_cycle_sync()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'closed' then
    update gov_qips set phase = new.status where id = new.qip_id and phase is distinct from new.status;
  end if;
  return new;
end $$;
create trigger gov_qip_cycles_sync after insert or update on public.gov_qip_cycles
  for each row execute function public.gov_qip_cycle_sync();

-- ---------------------------------------------------------------------------------------------------------------
-- 7. Clinical guideline governance (ids only; clinical content stays in clinical_guidelines / guideline_versions)
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_guideline_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  guideline_id uuid not null references public.clinical_guidelines(id),
  -- The exact version governance reviewed. A newer clinical version does not inherit the approval.
  governed_version_id uuid references public.guideline_versions(id),
  status text not null default 'not_reviewed' check (status in ('not_reviewed', 'under_review', 'approved', 'changes_requested', 'retired')),
  owner_user_id uuid references public.profiles(id),
  next_review_due date,
  decision_note text not null default '' check (length(decision_note) <= 2000),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, guideline_id)
);

create or replace function public.gov_guideline_review_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then raise exception 'review_not_deletable: retire the governance record instead' using errcode = 'P0001'; end if;
  if not exists (select 1 from clinical_guidelines g where g.id = new.guideline_id
                 and (g.organization_id = new.organization_id or g.is_shared_reference)) then
    raise exception 'invalid_reference: that guideline is not available to this organisation' using errcode = 'P0001';
  end if;
  if new.governed_version_id is not null and not exists (
    select 1 from guideline_versions v where v.id = new.governed_version_id and v.guideline_id = new.guideline_id) then
    raise exception 'invalid_reference: the version does not belong to this guideline' using errcode = 'P0001';
  end if;
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    if new.governed_version_id is null then raise exception 'version_required: choose the version being approved' using errcode = 'P0001'; end if;
    if new.approved_by is null then raise exception 'approver_required: record who approved it' using errcode = 'P0001'; end if;
    new.approved_at := now();
  end if;
  if new.status = 'changes_requested' and btrim(new.decision_note) = '' then
    raise exception 'note_required: describe the changes requested' using errcode = 'P0001';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger gov_guideline_reviews_guard before insert or update or delete on public.gov_guideline_reviews
  for each row execute function public.gov_guideline_review_guard();

-- ---------------------------------------------------------------------------------------------------------------
-- 8. Generic validated links between governance records
-- ---------------------------------------------------------------------------------------------------------------
create table public.gov_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null check (source_type in ('standard', 'element', 'policy', 'guideline', 'capa', 'audit', 'audit_template', 'qip', 'incident', 'indicator', 'decision', 'meeting', 'committee')),
  source_id uuid not null,
  target_type text not null check (target_type in ('standard', 'element', 'policy', 'guideline', 'capa', 'audit', 'audit_template', 'qip', 'incident', 'indicator', 'decision', 'meeting', 'committee')),
  target_id uuid not null,
  -- Guidelines only: the version the link was made against, so the link keeps pointing at what was reviewed.
  target_version_id uuid references public.guideline_versions(id),
  note text not null default '' check (length(note) <= 500),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, source_type, source_id, target_type, target_id),
  check (not (source_type = target_type and source_id = target_id)),
  check (target_version_id is null or target_type = 'guideline')
);
create index gov_links_source_idx on public.gov_links(organization_id, source_type, source_id);
create index gov_links_target_idx on public.gov_links(organization_id, target_type, target_id);

create or replace function public.gov_entity_exists(p_org uuid, p_type text, p_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare found boolean;
begin
  if p_type = 'guideline' then
    return exists (select 1 from clinical_guidelines g where g.id = p_id and (g.organization_id = p_org or g.is_shared_reference));
  end if;
  execute format('select exists (select 1 from public.%I where id = $1 and organization_id = $2)', case p_type
    when 'standard' then 'gov_standards' when 'element' then 'gov_elements' when 'policy' then 'gov_policies'
    when 'capa' then 'gov_capa' when 'audit' then 'gov_audits' when 'audit_template' then 'gov_audit_templates'
    when 'qip' then 'gov_qips' when 'incident' then 'gov_incidents' when 'indicator' then 'gov_indicators'
    when 'decision' then 'gov_meeting_decisions' when 'meeting' then 'gov_meetings' when 'committee' then 'gov_committees' end)
  into found using p_id, p_org;
  return coalesce(found, false);
end $$;
revoke all on function public.gov_entity_exists(uuid, text, uuid) from public, anon;

create or replace function public.gov_link_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and (new.organization_id, new.source_type, new.source_id, new.target_type, new.target_id, new.target_version_id)
     is distinct from (old.organization_id, old.source_type, old.source_id, old.target_type, old.target_id, old.target_version_id) then
    raise exception 'link_immutable: remove the link and create a new one' using errcode = 'P0001';
  end if;
  if not public.gov_entity_exists(new.organization_id, new.source_type, new.source_id) then
    raise exception 'invalid_reference: the % being linked does not exist in this organisation', new.source_type using errcode = 'P0001';
  end if;
  if not public.gov_entity_exists(new.organization_id, new.target_type, new.target_id) then
    raise exception 'invalid_reference: the linked % does not exist in this organisation', new.target_type using errcode = 'P0001';
  end if;
  if new.target_version_id is not null and not exists (
    select 1 from guideline_versions v where v.id = new.target_version_id and v.guideline_id = new.target_id) then
    raise exception 'invalid_reference: the version does not belong to this guideline' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger gov_links_guard before insert or update on public.gov_links
  for each row execute function public.gov_link_guard();

-- Read-only governance summary for the protocol page. Any member of the organisation may see it; it returns codes and
-- titles only, never incident narratives or evidence files.
create or replace function public.gov_guideline_summary(p_org uuid, p_guideline uuid)
returns table (status text, governed_version_id uuid, next_review_due date, standard_codes text[], element_codes text[], indicator_titles text[])
language sql stable security definer set search_path = public as $$
  select
    coalesce(r.status, 'not_reviewed'),
    r.governed_version_id,
    r.next_review_due,
    coalesce(array(
      select distinct s.code from gov_links l join gov_standards s on s.id = case when l.source_type = 'standard' then l.source_id else l.target_id end
      where l.organization_id = p_org
        and ((l.source_type = 'guideline' and l.source_id = p_guideline and l.target_type = 'standard')
          or (l.target_type = 'guideline' and l.target_id = p_guideline and l.source_type = 'standard'))
      order by 1), '{}'),
    coalesce(array(
      select distinct st.code || ' / ' || e.code from gov_links l join gov_elements e on e.id = case when l.source_type = 'element' then l.source_id else l.target_id end
      join gov_standards st on st.id = e.standard_id
      where l.organization_id = p_org
        and ((l.source_type = 'guideline' and l.source_id = p_guideline and l.target_type = 'element')
          or (l.target_type = 'guideline' and l.target_id = p_guideline and l.source_type = 'element'))
      order by 1), '{}'),
    coalesce(array(
      select distinct i.title from gov_links l join gov_indicators i on i.id = case when l.source_type = 'indicator' then l.source_id else l.target_id end
      where l.organization_id = p_org and i.status = 'active'
        and ((l.source_type = 'guideline' and l.source_id = p_guideline and l.target_type = 'indicator')
          or (l.target_type = 'guideline' and l.target_id = p_guideline and l.source_type = 'indicator'))
      order by 1), '{}')
  from (select 1) one
  left join gov_guideline_reviews r on r.organization_id = p_org and r.guideline_id = p_guideline
  where private.is_org_member(p_org) or coalesce(auth.role(), '') = 'service_role';
$$;
revoke all on function public.gov_guideline_summary(uuid, uuid) from public, anon;
grant execute on function public.gov_guideline_summary(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------------------------------------------
-- 9. Audit trail for every new table
-- ---------------------------------------------------------------------------------------------------------------
-- Same function as before; the only change is more "who did it" columns to fall back on for the new tables.
create or replace function public.gov_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rec jsonb; oldrec jsonb; actor uuid; changes jsonb := '{}'::jsonb; k text;
  -- Incident narratives and attachments may name patients, so the trail records which fields changed, never their content.
  redact boolean := tg_table_name in ('gov_incidents', 'gov_incident_files');
begin
  if tg_op = 'DELETE' then rec := to_jsonb(old); else rec := to_jsonb(new); end if;
  actor := coalesce(
    auth.uid(),
    nullif(current_setting('gov.actor', true), '')::uuid,
    nullif(rec->>'created_by', '')::uuid, nullif(rec->>'assessed_by', '')::uuid,
    nullif(rec->>'uploaded_by', '')::uuid, nullif(rec->>'reported_by', '')::uuid,
    nullif(rec->>'updated_by', '')::uuid, nullif(rec->>'user_id', '')::uuid,
    nullif(rec->>'entered_by', '')::uuid, nullif(rec->>'recorded_by', '')::uuid,
    nullif(rec->>'linked_by', '')::uuid, nullif(rec->>'submitted_by', '')::uuid
  );
  if tg_op = 'UPDATE' then
    oldrec := to_jsonb(old);
    for k in select jsonb_object_keys(rec) loop
      if rec->k is distinct from oldrec->k and k <> 'updated_at' then
        changes := changes || case when redact then jsonb_build_object(k, 'changed') else jsonb_build_object(k, jsonb_build_object('from', oldrec->k, 'to', rec->k)) end;
      end if;
    end loop;
    if changes = '{}'::jsonb then return new; end if;
  end if;
  insert into audit_events (organization_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (
    (rec->>'organization_id')::uuid, actor, 'governance.' || tg_table_name || '.' || lower(tg_op), tg_table_name,
    nullif(rec->>'id', '')::uuid,
    case when tg_op = 'UPDATE' then jsonb_build_object('changes', changes)
         when tg_op = 'INSERT' and redact then jsonb_build_object('summary', '')
         when tg_op = 'INSERT' then jsonb_build_object('summary', coalesce(rec->>'title', rec->>'code', rec->>'action', rec->>'file_name', rec->>'rating', rec->>'name', rec->>'label', rec->>'decision', ''))
         else '{}'::jsonb end
  );
  return case when tg_op = 'DELETE' then old else new end;
end $$;

do $$
declare t text;
begin
  foreach t in array array['gov_editions', 'gov_chapters', 'gov_elements', 'gov_element_assessments', 'gov_evidence_links',
                           'gov_evidence_requirements', 'gov_requirement_submissions', 'gov_indicators', 'gov_indicator_results',
                           'gov_committees', 'gov_committee_members', 'gov_meetings', 'gov_meeting_attendance', 'gov_meeting_decisions',
                           'gov_meeting_files', 'gov_regulatory_rules', 'gov_incident_notifications', 'gov_audit_templates',
                           'gov_audit_observations', 'gov_qip_cycles', 'gov_guideline_reviews', 'gov_links']
  loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.gov_audit()', t || '_audit', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------------------------------------------
-- 10. Row level security. Same model as the hub: governance staff read; writers change; auditors read only.
-- ---------------------------------------------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['gov_editions', 'gov_chapters', 'gov_elements', 'gov_element_assessments', 'gov_evidence_links',
                           'gov_evidence_requirements', 'gov_requirement_submissions', 'gov_indicators', 'gov_indicator_results',
                           'gov_committees', 'gov_committee_members', 'gov_meetings', 'gov_meeting_attendance', 'gov_meeting_decisions',
                           'gov_meeting_files', 'gov_regulatory_rules', 'gov_incident_notifications', 'gov_audit_templates',
                           'gov_audit_observations', 'gov_qip_cycles', 'gov_guideline_reviews', 'gov_links', 'gov_incident_status_history']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('create policy %I on public.%I for select using (public.gov_can_read(organization_id))', t || '_read', t);
  end loop;
end $$;
revoke all on public.gov_element_status from anon;

-- Ordinary editable records.
do $$
declare t text;
begin
  foreach t in array array['gov_editions', 'gov_chapters', 'gov_elements', 'gov_evidence_requirements', 'gov_indicators',
                           'gov_committees', 'gov_committee_members', 'gov_meetings', 'gov_meeting_attendance', 'gov_meeting_decisions',
                           'gov_regulatory_rules', 'gov_audit_templates', 'gov_audit_observations', 'gov_qip_cycles', 'gov_guideline_reviews']
  loop
    execute format('create policy %I on public.%I for all using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id))', t || '_write', t);
  end loop;
end $$;

-- Append-only or review-only records: insert as yourself; the guards above decide what an update may change.
create policy gov_element_assessments_insert on public.gov_element_assessments for insert
  with check (public.gov_can_write(organization_id) and assessed_by = auth.uid());
create policy gov_evidence_links_insert on public.gov_evidence_links for insert
  with check (public.gov_can_write(organization_id) and linked_by = auth.uid());
create policy gov_evidence_links_unlink on public.gov_evidence_links for update
  using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));
create policy gov_requirement_submissions_insert on public.gov_requirement_submissions for insert
  with check (public.gov_can_write(organization_id) and submitted_by = auth.uid());
create policy gov_requirement_submissions_review on public.gov_requirement_submissions for update
  using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));
create policy gov_indicator_results_insert on public.gov_indicator_results for insert
  with check (public.gov_can_write(organization_id) and entered_by = auth.uid());
create policy gov_indicator_results_verify on public.gov_indicator_results for update
  using (public.gov_can_write(organization_id)) with check (public.gov_can_write(organization_id));
create policy gov_meeting_files_insert on public.gov_meeting_files for insert
  with check (public.gov_can_write(organization_id) and uploaded_by = auth.uid());
create policy gov_incident_notifications_insert on public.gov_incident_notifications for insert
  with check (public.gov_can_write(organization_id) and recorded_by = auth.uid());
create policy gov_links_insert on public.gov_links for insert
  with check (public.gov_can_write(organization_id) and created_by = auth.uid());
create policy gov_links_delete on public.gov_links for delete using (public.gov_can_write(organization_id));
-- The lead auditor of an audit records its observations even without a governance role (mirrors gov_complete_audit).
create policy gov_audit_observations_lead_read on public.gov_audit_observations for select
  using (exists (select 1 from public.gov_audits a where a.id = gov_audit_observations.audit_id and a.owner_user_id = auth.uid()));
create policy gov_audit_observations_lead_insert on public.gov_audit_observations for insert
  with check (recorded_by = auth.uid() and exists (select 1 from public.gov_audits a where a.id = gov_audit_observations.audit_id and a.organization_id = gov_audit_observations.organization_id and a.owner_user_id = auth.uid()));
create policy gov_audit_templates_lead_read on public.gov_audit_templates for select
  using (exists (select 1 from public.gov_audits a where a.template_id = gov_audit_templates.id and a.owner_user_id = auth.uid()));
-- gov_incident_status_history is written only by its trigger: no client insert/update/delete policy.
