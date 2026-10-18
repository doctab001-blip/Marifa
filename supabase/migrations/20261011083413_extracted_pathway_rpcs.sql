-- Authenticated, organization-scoped RPCs for creating unreviewed pathway drafts.
-- Both functions run as the caller so the table grants and RLS policies remain active.

-- These narrow existence helpers reveal no clinical payload content. They let the
-- invoker-scoped RPC enforce the no-duplicate rule even when another tenant's
-- rows are hidden by RLS.
-- SECURITY DEFINER is limited to these boolean lookups; callers must have the
-- matching organization permission, and neither helper returns row contents.
create or replace function private.topic_has_clinical_pathway_payload(target_topic uuid, target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.has_permission(target_org, 'guidelines.edit') and exists (
    select 1
    from public.disease_directory as dd
    join public.clinical_pathway_payloads as cp on cp.disease_directory_id = dd.id
    where dd.disease_topic_id = target_topic
  );
$function$;

create or replace function private.topic_directory_available_to_org(target_topic uuid, target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.has_permission(target_org, 'guidelines.edit') and (
    not exists (
      select 1
      from public.disease_directory as dd
      where dd.disease_topic_id = target_topic
    )
    or exists (
      select 1
      from public.disease_directory as dd
      where dd.disease_topic_id = target_topic
        and dd.organization_id = target_org
    )
  );
$function$;

revoke all on function private.topic_has_clinical_pathway_payload(uuid, uuid) from public, anon, authenticated;
revoke all on function private.topic_directory_available_to_org(uuid, uuid) from public, anon, authenticated;
grant execute on function private.topic_has_clinical_pathway_payload(uuid, uuid) to authenticated;
grant execute on function private.topic_directory_available_to_org(uuid, uuid) to authenticated;

create or replace function public.get_topics_without_payloads(
  organization_id uuid,
  batch_size integer default 10
)
returns table (topic_id uuid, topic_name text)
language plpgsql
stable
security invoker
set search_path = ''
as $function$
begin
  if organization_id is null then
    raise exception using errcode = '22004', message = 'organization_id is required';
  end if;

  if auth.uid() is null or not private.has_permission(get_topics_without_payloads.organization_id, 'guidelines.edit') then
    raise exception using errcode = '42501', message = 'guidelines.edit permission is required for this organization';
  end if;

  return query
  select t.id, t.name_en
  from public.disease_topics as t
  where (t.organization_id is null or t.organization_id = get_topics_without_payloads.organization_id)
    and private.topic_directory_available_to_org(
      t.id, get_topics_without_payloads.organization_id
    )
    and not private.topic_has_clinical_pathway_payload(
      t.id, get_topics_without_payloads.organization_id
    )
  order by t.name_en, t.id
  limit least(greatest(coalesce(batch_size, 10), 1), 10);
end;
$function$;

create or replace function public.save_extracted_pathway(
  organization_id uuid,
  topic_id uuid,
  source_pmcid text,
  source_article_title text,
  source_journal text,
  pathway_payload jsonb,
  source_record_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_actor_id uuid := auth.uid();
  v_topic_name text;
  v_topic_organization_id uuid;
  v_directory_id uuid;
  v_directory_organization_id uuid;
  v_guideline_id uuid;
  v_version_id uuid;
  v_payload_id uuid;
  v_source_url text;
  v_source_title text;
begin
  if organization_id is null then
    raise exception using errcode = '22004', message = 'organization_id is required';
  end if;
  if topic_id is null or source_record_id is null then
    raise exception using errcode = '22004', message = 'topic_id and source_record_id are required';
  end if;
  if v_actor_id is null or not private.has_permission(save_extracted_pathway.organization_id, 'guidelines.edit') then
    raise exception using errcode = '42501', message = 'guidelines.edit permission is required for this organization';
  end if;
  if source_pmcid is null or source_pmcid !~ '^PMC[0-9]+$' then
    raise exception using errcode = '22023', message = 'source_pmcid must be a canonical PMCID such as PMC1234567';
  end if;
  if source_article_title is null or length(btrim(source_article_title)) = 0
     or length(source_article_title) > 1000
     or source_journal is null or length(btrim(source_journal)) = 0
     or length(source_journal) > 500 then
    raise exception using errcode = '22023', message = 'source_article_title and source_journal are required provenance fields';
  end if;
  if jsonb_typeof(pathway_payload) is distinct from 'object'
     or pathway_payload ->> 'schema_version' is distinct from '1'
     or jsonb_typeof(pathway_payload -> 'Investigations') is distinct from 'array'
     or jsonb_typeof(pathway_payload -> 'Treatment_Plan') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'pathway_payload must be a schema_version 1 object with Investigations and Treatment_Plan arrays';
  end if;
  if jsonb_array_length(pathway_payload -> 'Investigations') = 0
     or jsonb_array_length(pathway_payload -> 'Treatment_Plan') = 0 then
    raise exception using errcode = '22023', message = 'pathway_payload must contain at least one investigation and treatment phase';
  end if;
  if not (pathway_payload @> pg_catalog.jsonb_build_object(
    'evidence', pg_catalog.jsonb_build_object(
      'sources', pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('id', save_extracted_pathway.source_record_id::text)
      )
    )
  )) then
    raise exception using errcode = '22023', message = 'Root evidence must reference source_record_id';
  end if;

  -- Serialize writes per topic, then recheck the no-existing-payload condition.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('save_extracted_pathway'),
    pg_catalog.hashtext(save_extracted_pathway.topic_id::text)
  );

  select t.name_en, t.organization_id
    into v_topic_name, v_topic_organization_id
  from public.disease_topics as t
  where t.id = save_extracted_pathway.topic_id
  for share;

  if not found then
    raise exception using errcode = 'P0002', message = 'Disease topic was not found or is not visible to this user';
  end if;
  if v_topic_organization_id is not null and v_topic_organization_id <> save_extracted_pathway.organization_id then
    raise exception using errcode = '42501', message = 'Disease topic belongs to a different organization';
  end if;

  if private.topic_has_clinical_pathway_payload(
    save_extracted_pathway.topic_id,
    save_extracted_pathway.organization_id
  ) then
    raise exception using errcode = '23505', message = 'This topic already has a clinical pathway payload';
  end if;

  select dd.id, dd.organization_id
    into v_directory_id, v_directory_organization_id
  from public.disease_directory as dd
  where dd.disease_topic_id = save_extracted_pathway.topic_id
  for update;

  if found then
    if v_directory_organization_id is distinct from save_extracted_pathway.organization_id then
      raise exception using errcode = '42501', message = 'Existing disease directory row is not owned by the requested organization';
    end if;
  else
    insert into public.disease_directory (
      disease_topic_id, organization_id, display_name, lifecycle_status
    ) values (
      save_extracted_pathway.topic_id,
      save_extracted_pathway.organization_id,
      v_topic_name,
      'draft'
    ) returning id into v_directory_id;
  end if;

  v_source_url := 'https://pmc.ncbi.nlm.nih.gov/articles/' || save_extracted_pathway.source_pmcid || '/';
  v_source_title := btrim(save_extracted_pathway.source_article_title)
    || ' (PMCID: ' || save_extracted_pathway.source_pmcid || ')';

  insert into public.clinical_guidelines (
    organization_id, disease_topic_id, title, source_type, is_shared_reference, status
  ) values (
    save_extracted_pathway.organization_id,
    save_extracted_pathway.topic_id,
    v_source_title,
    'open_access_article',
    false,
    'draft'
  ) returning id into v_guideline_id;

  insert into public.guideline_versions (
    guideline_id, version, version_number, status, change_summary,
    source_title, issuing_organization, source_url, jurisdiction,
    review_date, created_by, is_current
  ) values (
    v_guideline_id, '1.0', '1', 'draft',
    'Automated extraction from ' || save_extracted_pathway.source_pmcid || '; draft pending clinical review.',
    v_source_title,
    'NCBI PubMed Central; journal: ' || btrim(save_extracted_pathway.source_journal),
    v_source_url,
    'International',
    current_date, v_actor_id, false
  ) returning id into v_version_id;

  insert into public.guidelines_sources (
    id, disease_directory_id, guideline_version_id, issuer, title, edition,
    url, locator, scope_key, primary_source, selection_rationale,
    hierarchy_rank, verified_at
  ) values (
    save_extracted_pathway.source_record_id,
    v_directory_id,
    v_version_id,
    'Other',
    v_source_title,
    'PMCID: ' || save_extracted_pathway.source_pmcid,
    v_source_url,
    'NCBI PMC full text; section-level locators are retained in the draft payload.',
    'draft-extraction-' || source_pmcid, true,
    'Automated source selection for an unreviewed draft only; this record does not confer clinical approval.',
    100, null
  );

  insert into public.clinical_pathway_payloads (
    disease_directory_id, guideline_version_id, schema_version, payload
  ) values (
    directory_id, version_id, 1, save_extracted_pathway.pathway_payload
  ) returning id into v_payload_id;

  return pg_catalog.jsonb_build_object(
    'topic_id', save_extracted_pathway.topic_id,
    'topic_name', v_topic_name,
    'disease_directory_id', v_directory_id,
    'guideline_id', v_guideline_id,
    'version_id', v_version_id,
    'source_record_id', save_extracted_pathway.source_record_id,
    'payload_id', v_payload_id,
    'pmcid', save_extracted_pathway.source_pmcid,
    'version_status', 'draft',
    'is_verified', false
  );
end;
$function$;

revoke all on function public.get_topics_without_payloads(uuid, integer) from public, anon;
revoke all on function public.save_extracted_pathway(uuid, uuid, text, text, text, jsonb, uuid) from public, anon;
revoke all on function private.topic_has_clinical_pathway_payload(uuid, uuid) from public, anon;
revoke all on function private.topic_directory_available_to_org(uuid, uuid) from public, anon;
grant execute on function public.get_topics_without_payloads(uuid, integer) to authenticated;
grant execute on function public.save_extracted_pathway(uuid, uuid, text, text, text, jsonb, uuid) to authenticated;
grant execute on function private.topic_has_clinical_pathway_payload(uuid, uuid) to authenticated;
grant execute on function private.topic_directory_available_to_org(uuid, uuid) to authenticated;

comment on function public.get_topics_without_payloads(uuid, integer) is
  'Returns at most ten organization-visible disease topics with no pathway payload in any version.';
comment on function public.save_extracted_pathway(uuid, uuid, text, text, text, jsonb, uuid) is
  'Atomically stores an unverified PMC/StatPearls pathway draft for an organization where the caller has guidelines.edit.';
