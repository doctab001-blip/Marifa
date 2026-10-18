-- Close pre-existing foundation-table RLS gaps reported by Supabase Security Advisor.
-- Authorization helpers live outside the exposed public schema so they cannot be
-- called directly as Data API RPC endpoints.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter function public.is_org_member(uuid) set schema private;
alter function public.has_permission(uuid, text) set schema private;

revoke all on function private.is_org_member(uuid) from public, anon, authenticated;
revoke all on function private.has_permission(uuid, text) from public, anon, authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_permission(uuid, text) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_settings enable row level security;
alter table public.membership_roles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.specialties enable row level security;
alter table public.pathway_nodes enable row level security;
alter table public.pathway_transitions enable row level security;

create policy organizations_member_read
  on public.organizations for select
  to authenticated
  using (private.is_org_member(id));

create policy organization_settings_member_read
  on public.organization_settings for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy membership_roles_self_or_admin_read
  on public.membership_roles for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_memberships m
      where m.id = membership_id
        and (
          m.user_id = (select auth.uid())
          or private.has_permission(m.organization_id, 'members.read')
        )
    )
  );

create policy authenticated_role_catalog_read
  on public.roles for select
  to authenticated
  using (true);

create policy authenticated_permission_catalog_read
  on public.permissions for select
  to authenticated
  using (true);

create policy role_permissions_authenticated_read
  on public.role_permissions for select
  to authenticated
  using (true);

create policy specialties_scope_read
  on public.specialties for select
  to authenticated
  using (organization_id is null or private.is_org_member(organization_id));

create policy pathway_nodes_scope_read
  on public.pathway_nodes for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinical_pathways p
      where p.id = pathway_id
        and (p.organization_id is null or private.is_org_member(p.organization_id))
    )
  );

create policy pathway_transitions_scope_read
  on public.pathway_transitions for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinical_pathways p
      where p.id = pathway_id
        and (p.organization_id is null or private.is_org_member(p.organization_id))
    )
  );

revoke all on table public.organizations from anon;
revoke all on table public.organization_settings from anon;
revoke all on table public.membership_roles from anon;
revoke all on table public.roles from anon;
revoke all on table public.permissions from anon;
revoke all on table public.role_permissions from anon;
revoke all on table public.specialties from anon;
revoke all on table public.pathway_nodes from anon;
revoke all on table public.pathway_transitions from anon;

grant select on table public.organizations to authenticated;
grant select on table public.organization_settings to authenticated;
grant select on table public.membership_roles to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.permissions to authenticated;
grant select on table public.role_permissions to authenticated;
grant select on table public.specialties to authenticated;
grant select on table public.pathway_nodes to authenticated;
grant select on table public.pathway_transitions to authenticated;

grant all on table public.organizations to service_role;
grant all on table public.organization_settings to service_role;
grant all on table public.membership_roles to service_role;
grant all on table public.roles to service_role;
grant all on table public.permissions to service_role;
grant all on table public.role_permissions to service_role;
grant all on table public.specialties to service_role;
grant all on table public.pathway_nodes to service_role;
grant all on table public.pathway_transitions to service_role;
