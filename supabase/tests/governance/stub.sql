create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role', true), '') $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)] $$;
create table public.organizations (id uuid primary key default gen_random_uuid(), name text);
create table public.profiles (id uuid primary key, display_name text not null default 'User');
create table public.organization_memberships (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), user_id uuid not null references public.profiles(id), professional_level text, account_status text not null default 'active');
create table public.roles (id uuid primary key default gen_random_uuid(), code text unique not null, name text not null default '');
create table public.membership_roles (membership_id uuid references public.organization_memberships(id), role_id uuid references public.roles(id));
create table public.clinical_guidelines (id uuid primary key, title text, organization_id uuid, status text);
create table public.audit_events (id uuid primary key default gen_random_uuid(), organization_id uuid, actor_user_id uuid references public.profiles(id), action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', occurred_at timestamptz not null default now());
create function public.is_org_member(target_org uuid) returns boolean language sql stable security definer as $$
  select exists (select 1 from organization_memberships m where m.organization_id = target_org and m.user_id = auth.uid() and m.account_status = 'active') $$;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
