-- Inline If/Then management pathways (docs/management-inline-pathways.md).
-- The content JSONB gains an OPTIONAL clinicalManagement[].actionDetails array. Nothing existing is rewritten:
-- rows without it stay valid, and the app (lib/validations/disease.ts) treats it as optional.
-- This migration (1) snapshots every version's content, (2) adds a validity function, (3) adds a NOT VALID check so
-- only NEW writes are checked and no existing row can block the migration.
-- actionDetails are authored per topic (docs/management-inline-pathways.md). Deploy the app code first: older code rejects them.
-- Apply to BOTH databases (Saudi, India). Not yet applied anywhere.

begin;

-- 1. Safety snapshot (drop it after you have verified the new data).
create table if not exists public.guideline_versions_content_backup_20261103 as
  select id, content, now() as backed_up_at from public.guideline_versions;

-- 2. Every actionDetails entry must point at an existing action of its own step.
create or replace function public.marifa_action_details_valid(content jsonb)
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(
    case
      when jsonb_typeof(step -> 'actionDetails') is distinct from 'array' then not (step ? 'actionDetails')
      else not exists (
        select 1
        from jsonb_array_elements(step -> 'actionDetails') d
        where case
                when jsonb_typeof(d -> 'actionIndex') <> 'number' then true
                when jsonb_typeof(step -> 'actions') <> 'array' then true
                else (d ->> 'actionIndex')::numeric < 0
                  or (d ->> 'actionIndex')::numeric >= jsonb_array_length(step -> 'actions')
                  or (d ->> 'actionIndex')::numeric <> trunc((d ->> 'actionIndex')::numeric)
              end
      )
    end
  ), true)
  from jsonb_array_elements(
    case when jsonb_typeof(content -> 'clinicalManagement') = 'array' then content -> 'clinicalManagement' else '[]'::jsonb end
  ) step
$$;

-- 3. NOT VALID: existing rows are not scanned or rejected; inserts and updates from now on are checked.
alter table public.guideline_versions
  drop constraint if exists guideline_versions_action_details_valid;
alter table public.guideline_versions
  add constraint guideline_versions_action_details_valid
  check (public.marifa_action_details_valid(content)) not valid;

commit;

-- Rollback:
--   alter table public.guideline_versions drop constraint if exists guideline_versions_action_details_valid;
--   drop function if exists public.marifa_action_details_valid(jsonb);
--   -- to undo data changes: update guideline_versions v set content = b.content
--   --   from guideline_versions_content_backup_20261103 b where b.id = v.id;
