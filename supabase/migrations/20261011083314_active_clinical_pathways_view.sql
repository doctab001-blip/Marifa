-- One current pathway payload per disease topic, preferring an approved
-- guideline version and then the newest version.
create or replace view public.v_active_clinical_pathways
with (security_invoker = true)
as
select distinct on (t.id)
  t.id as topic_id,
  t.name_en as topic_name,
  gv.id as version_id,
  gv.status as version_status,
  pv.payload,
  gv.created_at as version_created_at,
  case
    when gv.status = 'approved'::public.content_status then true
    else false
  end as is_verified
from public.disease_topics as t
left join public.disease_directory as dd
  on dd.disease_topic_id = t.id
left join public.clinical_pathway_payloads as pv
  on pv.disease_directory_id = dd.id
left join public.guideline_versions as gv
  on gv.id = pv.guideline_version_id
order by
  t.id,
  case when gv.status = 'approved'::public.content_status then 1 else 2 end,
  gv.created_at desc nulls last,
  pv.id desc nulls last;

comment on view public.v_active_clinical_pathways is
  'Latest approved pathway payload per disease topic, falling back to the latest available version; verification reflects guideline version approval status.';
