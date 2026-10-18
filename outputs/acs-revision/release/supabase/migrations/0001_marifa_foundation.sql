-- Marifa foundation schema. Run in a dedicated development database first.
create extension if not exists pgcrypto;

create type public.content_status as enum ('draft','under_review','approved','published','superseded','archived');
create type public.professional_level as enum ('mbbs_gp','specialist','consultant');
create type public.competency_state as enum ('assigned','in_progress','pending_signoff','completed','expired','overdue');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  logo_path text,
  primary_color text not null default '#1F3C88',
  locale text not null default 'en-SA',
  timezone text not null default 'Asia/Riyadh',
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  professional_level public.professional_level,
  account_status text not null default 'active' check (account_status in ('invited','active','suspended','disabled')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table public.membership_roles (
  membership_id uuid not null references public.organization_memberships(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (membership_id, role_id)
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  unique (organization_id, name)
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  is_shared boolean not null default false
);

create table public.disease_topics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  specialty_id uuid references public.specialties(id),
  slug text not null,
  name_en text not null,
  name_ar text,
  summary_en text not null,
  summary_ar text,
  aliases text[] not null default '{}',
  search_document tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, slug)
);

create or replace function public.update_disease_search_document()
returns trigger language plpgsql set search_path = public as $$
begin
  new.search_document :=
    setweight(to_tsvector('simple', coalesce(new.name_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(new.aliases, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.summary_en, '')), 'C');
  return new;
end;
$$;

create trigger disease_topics_search_document_trigger
before insert or update of name_en, aliases, summary_en on public.disease_topics
for each row execute function public.update_disease_search_document();

create index disease_topics_search_idx on public.disease_topics using gin(search_document);
create index disease_topics_org_idx on public.disease_topics(organization_id);

create table public.clinical_guidelines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  disease_topic_id uuid references public.disease_topics(id),
  title text not null,
  source_type text not null,
  is_shared_reference boolean not null default false,
  responsible_owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((organization_id is not null) or is_shared_reference)
);

create table public.guideline_versions (
  id uuid primary key default gen_random_uuid(),
  guideline_id uuid not null references public.clinical_guidelines(id) on delete cascade,
  version text not null,
  status public.content_status not null default 'draft',
  content jsonb not null default '{}',
  change_summary text not null,
  source_title text not null,
  issuing_organization text not null,
  source_url text,
  jurisdiction text not null,
  publication_date date,
  effective_date date,
  last_verified_date date,
  review_date date not null,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (guideline_id, version),
  check ((status not in ('approved','published')) or approved_by is not null)
);

create table public.clinical_pathways (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  disease_topic_id uuid not null references public.disease_topics(id),
  guideline_version_id uuid not null references public.guideline_versions(id),
  title text not null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.pathway_nodes (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid not null references public.clinical_pathways(id) on delete cascade,
  node_key text not null,
  node_type text not null check (node_type in ('start','assessment','decision','action','escalation','end')),
  title text not null,
  detail text not null,
  reference_ids uuid[] not null,
  display_order integer not null,
  unique(pathway_id, node_key)
);

create table public.pathway_transitions (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid not null references public.clinical_pathways(id) on delete cascade,
  from_node_id uuid not null references public.pathway_nodes(id) on delete cascade,
  to_node_id uuid not null references public.pathway_nodes(id) on delete cascade,
  label text,
  unique(pathway_id, from_node_id, to_node_id)
);

create table public.competency_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null,
  professional_level public.professional_level,
  specialty_id uuid references public.specialties(id),
  department_id uuid references public.departments(id),
  practical_signoff_required boolean not null default false,
  renewal_months integer check (renewal_months is null or renewal_months > 0),
  created_at timestamptz not null default now()
);

create table public.competency_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  membership_id uuid not null references public.organization_memberships(id) on delete cascade,
  template_id uuid not null references public.competency_templates(id),
  state public.competency_state not null default 'assigned',
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  unique(membership_id, template_id, assigned_at)
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.competency_assignments(id),
  attempt_number integer not null check (attempt_number > 0),
  score numeric(5,2),
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  unique(assignment_id, attempt_number)
);

create table public.supervisor_signoffs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.competency_assignments(id),
  assessor_membership_id uuid not null references public.organization_memberships(id),
  decision text not null check (decision in ('pending','approved','rejected')),
  rationale text,
  decided_at timestamptz
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  disease_topic_id uuid not null references public.disease_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, disease_topic_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);
create index audit_events_org_time_idx on public.audit_events(organization_id, occurred_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_memberships m
    where m.organization_id = target_org and m.user_id = auth.uid() and m.account_status = 'active'
  );
$$;

create or replace function public.has_permission(target_org uuid, permission_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from organization_memberships m
    join membership_roles mr on mr.membership_id = m.id
    join role_permissions rp on rp.role_id = mr.role_id
    join permissions p on p.id = rp.permission_id
    where m.organization_id = target_org and m.user_id = auth.uid()
      and m.account_status = 'active' and p.code = permission_code
  );
$$;

alter table public.organization_memberships enable row level security;
alter table public.departments enable row level security;
alter table public.disease_topics enable row level security;
alter table public.clinical_guidelines enable row level security;
alter table public.guideline_versions enable row level security;
alter table public.clinical_pathways enable row level security;
alter table public.competency_templates enable row level security;
alter table public.competency_assignments enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.supervisor_signoffs enable row level security;
alter table public.bookmarks enable row level security;
alter table public.audit_events enable row level security;

create policy memberships_self_or_admin on public.organization_memberships for select
  using (user_id = auth.uid() or public.has_permission(organization_id, 'members.read'));
create policy departments_tenant_read on public.departments for select using (public.is_org_member(organization_id));
create policy disease_topic_read on public.disease_topics for select
  using (organization_id is null or public.is_org_member(organization_id));
create policy guideline_read on public.clinical_guidelines for select
  using (is_shared_reference or public.is_org_member(organization_id));
create policy guideline_version_read on public.guideline_versions for select
  using (exists (select 1 from clinical_guidelines g where g.id = guideline_id and (g.is_shared_reference or public.is_org_member(g.organization_id))));
create policy guideline_version_write on public.guideline_versions for all
  using (exists (select 1 from clinical_guidelines g where g.id = guideline_id and public.has_permission(g.organization_id, 'guidelines.edit')))
  with check (exists (select 1 from clinical_guidelines g where g.id = guideline_id and public.has_permission(g.organization_id, 'guidelines.edit')));
create policy pathway_read on public.clinical_pathways for select
  using (organization_id is null or public.is_org_member(organization_id));
create policy competency_template_tenant on public.competency_templates for select using (public.is_org_member(organization_id));
create policy assignment_self_or_admin on public.competency_assignments for select
  using (public.has_permission(organization_id, 'competencies.read_all') or exists (select 1 from organization_memberships m where m.id = membership_id and m.user_id = auth.uid()));
create policy attempts_self_or_admin on public.assessment_attempts for select
  using (public.has_permission(organization_id, 'competencies.read_all') or exists (select 1 from competency_assignments a join organization_memberships m on m.id = a.membership_id where a.id = assignment_id and m.user_id = auth.uid()));
create policy signoffs_self_or_assessor on public.supervisor_signoffs for select
  using (public.has_permission(organization_id, 'competencies.read_all') or exists (select 1 from organization_memberships m where m.id = assessor_membership_id and m.user_id = auth.uid()));
create policy bookmarks_private on public.bookmarks for all using (user_id = auth.uid() and public.is_org_member(organization_id)) with check (user_id = auth.uid() and public.is_org_member(organization_id));
create policy audit_authorized_read on public.audit_events for select using (public.has_permission(organization_id, 'audit.read'));

-- Deliberately no client INSERT/UPDATE policy for audit_events. Write through a privileged,
-- server-only audit function so actors cannot rewrite or remove history.
