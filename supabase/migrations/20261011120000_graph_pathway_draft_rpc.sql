-- Additive writer for the existing graph-based clinical_pathways tables.
-- A narrowly scoped definer routine is needed because the authenticated role has
-- read-only grants on normalized graph tables. It preserves user identity and
-- enforces guidelines.edit plus tenant ownership before performing the writes.
create or replace function public.save_extracted_graph_pathway(
  p_organization_id uuid,
  p_topic_id uuid,
  p_title text,
  p_source_id uuid,
  p_source_title text,
  p_source_url text,
  p_source_edition text,
  p_source_locator text,
  p_nodes jsonb,
  p_transitions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_topic_name text;
  v_topic_org uuid;
  v_directory_id uuid;
  v_directory_org uuid;
  v_guideline_id uuid;
  v_version_id uuid;
  v_pathway_id uuid;
  v_node jsonb;
  v_edge jsonb;
  v_node_id uuid;
  v_from_id uuid;
  v_to_id uuid;
  v_node_ids jsonb := '{}'::jsonb;
begin
  if v_actor is null or p_organization_id is null or p_topic_id is null or p_source_id is null then
    raise exception using errcode = '22004', message = 'Authenticated actor, organization, topic, and source IDs are required';
  end if;
  if not private.has_permission(p_organization_id, 'guidelines.edit') then
    raise exception using errcode = '42501', message = 'guidelines.edit permission is required for this organization';
  end if;
  if not exists (select 1 from public.profiles pr where pr.id = v_actor) then
    raise exception using errcode = '23503', message = 'The authenticated user must have a profile before creating a draft';
  end if;
  if not exists (
    select 1 from public.organization_settings s where s.organization_id = p_organization_id
  ) then
    raise exception using errcode = '23503', message = 'Organization settings must exist before pathway drafts can be saved';
  end if;
  if p_source_title is null or length(btrim(p_source_title)) = 0
     or p_source_url is null or p_source_url !~ '^https://'
     or p_source_edition is null or p_source_locator is null
     or p_nodes is null or p_transitions is null
     or jsonb_typeof(p_nodes) is distinct from 'array'
     or jsonb_typeof(p_transitions) is distinct from 'array'
     or jsonb_array_length(p_nodes) = 0 then
    raise exception using errcode = '22023', message = 'Source provenance and non-empty graph arrays are required';
  end if;

  select t.name_en, t.organization_id into v_topic_name, v_topic_org
  from public.disease_topics t where t.id = p_topic_id for share;
  if not found then
    raise exception using errcode = 'P0002', message = 'Disease topic was not found or is not visible to this user';
  end if;
  if v_topic_org is not null and v_topic_org <> p_organization_id then
    raise exception using errcode = '42501', message = 'Disease topic belongs to another organization';
  end if;

  -- Never overwrite or fork content behind an existing topic pathway.
  if exists (
    select 1 from public.clinical_pathways p
    where p.disease_topic_id = p_topic_id
      and (p.organization_id = p_organization_id or p.organization_id is null)
  ) then
    raise exception using errcode = '23505', message = 'A pathway already exists for this disease topic';
  end if;

  select d.id, d.organization_id into v_directory_id, v_directory_org
  from public.disease_directory d where d.disease_topic_id = p_topic_id for update;
  if found then
    if v_directory_org is distinct from p_organization_id then
      raise exception using errcode = '42501', message = 'Existing disease directory row is not owned by this organization';
    end if;
  else
    insert into public.disease_directory(disease_topic_id, organization_id, display_name, lifecycle_status)
    values (p_topic_id, p_organization_id, v_topic_name, 'draft') returning id into v_directory_id;
  end if;

  insert into public.clinical_guidelines(organization_id, disease_topic_id, title, source_type, is_shared_reference, responsible_owner_id, status)
  values (p_organization_id, p_topic_id, p_source_title, 'open_access_article', false, v_actor, 'draft')
  returning id into v_guideline_id;
  insert into public.guideline_versions(
    guideline_id, version, version_number, status, change_summary, source_title,
    issuing_organization, source_url, jurisdiction, review_date, created_by, is_current
  ) values (
    v_guideline_id, '1.0', '1', 'draft',
    'Automated evidence extraction; draft pending clinical review.', p_source_title,
    'NCBI PubMed Central / Bookshelf', p_source_url, 'International', current_date, v_actor, false
  ) returning id into v_version_id;
  insert into public.guidelines_sources(
    id, disease_directory_id, guideline_version_id, issuer, title, edition, url,
    locator, scope_key, primary_source, selection_rationale, hierarchy_rank, verified_at
  ) values (
    p_source_id, v_directory_id, v_version_id, 'Other', p_source_title, p_source_edition,
    p_source_url, p_source_locator, 'extracted-pathway', true,
    'Automated source candidate for an unverified draft; requires clinician review.', 100, null
  );
  insert into public.clinical_pathways(organization_id, disease_topic_id, guideline_version_id, title, status)
  values (p_organization_id, p_topic_id, v_version_id, coalesce(nullif(btrim(p_title), ''), v_topic_name), 'draft')
  returning id into v_pathway_id;

  for v_node in select value from jsonb_array_elements(p_nodes) loop
    v_node_id := pg_catalog.gen_random_uuid();
    if v_node ->> 'id' is null or v_node ->> 'type' is null
       or v_node ->> 'type' not in ('start','assessment','decision','action','escalation','end')
       or jsonb_typeof(v_node -> 'referenceIds') is distinct from 'array'
       or not (v_node -> 'referenceIds' @> jsonb_build_array(p_source_id::text)) then
      raise exception using errcode = '22023', message = 'Each node must have a valid graph type and include the saved source ID';
    end if;
    if v_node_ids ? (v_node ->> 'id') then
      raise exception using errcode = '22023', message = 'Duplicate pathway node ID';
    end if;
    v_node_ids := v_node_ids || jsonb_build_object(v_node ->> 'id', v_node_id::text);
    insert into public.pathway_nodes(pathway_id, node_key, node_type, title, detail, reference_ids, display_order)
    values (
      v_pathway_id, v_node ->> 'id', v_node ->> 'type', v_node ->> 'title',
      v_node ->> 'detail', array[p_source_id], (select count(*)::integer from public.pathway_nodes n where n.pathway_id = v_pathway_id)
    );
  end loop;

  for v_edge in select value from jsonb_array_elements(p_transitions) loop
    if not (v_node_ids ? (v_edge ->> 'from')) or not (v_node_ids ? (v_edge ->> 'to')) then
      raise exception using errcode = '22023', message = 'Transition endpoints must reference pathway nodes';
    end if;
    select id into v_from_id from public.pathway_nodes where pathway_id = v_pathway_id and node_key = v_edge ->> 'from';
    select id into v_to_id from public.pathway_nodes where pathway_id = v_pathway_id and node_key = v_edge ->> 'to';
    insert into public.pathway_transitions(pathway_id, from_node_id, to_node_id, label)
    values (v_pathway_id, v_from_id, v_to_id, nullif(v_edge ->> 'label', ''));
  end loop;

  return jsonb_build_object(
    'topic_id', p_topic_id, 'pathway_id', v_pathway_id,
    'guideline_id', v_guideline_id, 'version_id', v_version_id,
    'source_id', p_source_id, 'status', 'draft', 'is_verified', false,
    'created_by', v_actor, 'organization_id', p_organization_id
  );
end;
$function$;

revoke all on function public.save_extracted_graph_pathway(uuid, uuid, text, uuid, text, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.save_extracted_graph_pathway(uuid, uuid, text, uuid, text, text, text, text, jsonb, jsonb) to authenticated;
comment on function public.save_extracted_graph_pathway(uuid, uuid, text, uuid, text, text, text, text, jsonb, jsonb) is
  'Atomically writes a caller-authorized, unverified draft into the existing graph pathway and governance tables.';
