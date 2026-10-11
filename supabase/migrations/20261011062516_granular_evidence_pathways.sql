
-- Additive clinical directory. Existing disease topics and governed guideline versions remain canonical.
create table public.disease_directory (
  id uuid primary key default gen_random_uuid(),
  disease_topic_id uuid not null unique references public.disease_topics(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  display_name text not null,
  display_name_ar text,
  lifecycle_status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disease_directory_codes (
  id uuid primary key default gen_random_uuid(),
  disease_directory_id uuid not null references public.disease_directory(id) on delete cascade,
  coding_system text not null check (coding_system in ('ICD-10', 'SNOMED CT')),
  code text not null,
  preferred_term text not null,
  terminology_release text not null,
  UNIQUE (coding_system, code, terminology_release),
  UNIQUE (disease_directory_id, coding_system, code)
);

create table public.guidelines_sources (
  id uuid primary key default gen_random_uuid(),
  disease_directory_id uuid not null references public.disease_directory(id) on delete cascade,
  guideline_version_id uuid references public.guideline_versions(id) on delete set null,
  issuer text not null check (issuer in ('Saudi MOH','Saudi Health Council','ADA','ACC/AHA','ESC','NICE','PHA','Other')),
  title text not null,
  edition text not null,
  url text not null check (url ~ '^https://'),
  locator text not null,
  scope_key text not null,
  primary_source boolean not null default false,
  selection_rationale text not null,
  verified_at date,
  created_at timestamptz not null default now()
);

-- At most one designated primary source in each investigation/treatment scope.
create unique index guidelines_sources_one_primary_per_scope
  on public.guidelines_sources(disease_directory_id, scope_key)
  where primary_source;

create table public.clinical_pathway_payloads (
  id uuid primary key default gen_random_uuid(),
  disease_directory_id uuid not null references public.disease_directory(id) on delete cascade,
  guideline_version_id uuid not null references public.guideline_versions(id) on delete restrict,
  schema_version integer not null default 1 check (schema_version = 1),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  unique (guideline_version_id),
  check (jsonb_typeof(payload -> 'Investigations') = 'array'),
  check (jsonb_typeof(payload -> 'Treatment_Plan') = 'array')
);

alter table public.disease_directory enable row level security;
alter table public.disease_directory_codes enable row level security;
alter table public.guidelines_sources enable row level security;
alter table public.clinical_pathway_payloads enable row level security;

create policy disease_directory_read on public.disease_directory for select to authenticated
  using (organization_id is null or private.is_org_member(organization_id));
create policy disease_directory_write on public.disease_directory for all to authenticated
  using (organization_id is not null and private.has_permission(organization_id, 'guidelines.edit'))
  with check (organization_id is not null and private.has_permission(organization_id, 'guidelines.edit'));
create policy disease_directory_codes_read on public.disease_directory_codes for select to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and (d.organization_id is null or private.is_org_member(d.organization_id))));
create policy disease_directory_codes_write on public.disease_directory_codes for all to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')))
  with check (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')));
create policy guidelines_sources_read on public.guidelines_sources for select to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and (d.organization_id is null or private.is_org_member(d.organization_id))));
create policy guidelines_sources_write on public.guidelines_sources for all to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')))
  with check (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')));
create policy clinical_pathways_read on public.clinical_pathway_payloads for select to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and (d.organization_id is null or private.is_org_member(d.organization_id))));
create policy clinical_pathways_write on public.clinical_pathway_payloads for all to authenticated
  using (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')))
  with check (exists (select 1 from public.disease_directory d where d.id = disease_directory_id and d.organization_id is not null and private.has_permission(d.organization_id, 'guidelines.edit')));

revoke all on public.disease_directory, public.disease_directory_codes, public.guidelines_sources, public.clinical_pathway_payloads from anon;
grant select, insert, update, delete on public.disease_directory, public.disease_directory_codes, public.guidelines_sources, public.clinical_pathway_payloads to authenticated;
grant all on public.disease_directory, public.disease_directory_codes, public.guidelines_sources, public.clinical_pathway_payloads to service_role;

comment on table public.disease_directory is 'Additive directory projection over disease_topics; coding and pathway provenance are stored relationally.';
comment on column public.guidelines_sources.primary_source is 'Per-scope source selection; requires rationale and does not confer clinical approval.';
comment on column public.clinical_pathway_payloads.payload is 'Validate with ClinicalPathwaySchema at application ingestion; clinical content changes use a new governed guideline version.';
