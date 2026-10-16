-- Require the structured investigation contract for newly written guideline content.
-- Backfill existing content before enforcing the contract on future writes.
create or replace function public.normalize_guideline_investigation_array(items jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    item || jsonb_build_object(
      'tier', coalesce(item ->> 'tier', case
        when lower(item ->> 'testName') ~ '(computed tomography|(^|[^a-z])ct([ -]|$)|mri|magnetic resonance|angiograph|pet scan)'
          then 'advancedImaging'
        when lower(item ->> 'testName') ~ '(radiograph|x-ray|xray|plain film|chest film|abdominal film)'
          then 'firstLineImaging'
        when lower(item ->> 'testName') ~ '(ultrasound|echocardiograph|contrast study|gastrografin|endoscop|bronchoscop|spirometr|ambulatory|home monitoring|holter|stress test|biopsy|culture|microscopy|electrocardiogram|(^|[^a-z])ecg([^a-z]|$))'
          then 'specializedAdjunctive'
        else 'laboratory'
      end),
      'modalityTarget', coalesce(
        nullif(btrim(item ->> 'modalityTarget'), ''),
        concat_ws(' — ', nullif(btrim(item ->> 'testName'), ''), nullif(btrim(item ->> 'targetCondition'), ''))
      )
    ) order by ordinal
  ), '[]'::jsonb)
  from jsonb_array_elements(items) with ordinality as source(item, ordinal)
$$;

update public.guideline_versions
set content = jsonb_set(
  jsonb_set(
    content,
    '{investigations,ruleIn}',
    public.normalize_guideline_investigation_array(content #> '{investigations,ruleIn}')
  ),
  '{investigations,ruleOut}',
  public.normalize_guideline_investigation_array(content #> '{investigations,ruleOut}')
)
where jsonb_typeof(content #> '{investigations,ruleIn}') = 'array'
  and jsonb_typeof(content #> '{investigations,ruleOut}') = 'array';

drop function public.normalize_guideline_investigation_array(jsonb);
create or replace function public.guideline_investigations_are_structured(content jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce((
    jsonb_typeof(content -> 'investigations') = 'object'
    and jsonb_typeof(content #> '{investigations,ruleIn}') = 'array'
    and jsonb_typeof(content #> '{investigations,ruleOut}') = 'array'
    and case when jsonb_typeof(content #> '{investigations,ruleIn}') = 'array'
      then jsonb_array_length(content #> '{investigations,ruleIn}') > 0 else false end
    and case when jsonb_typeof(content #> '{investigations,ruleOut}') = 'array'
      then jsonb_array_length(content #> '{investigations,ruleOut}') > 0 else false end
    and not exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(content #> '{investigations,ruleIn}') = 'array'
            and jsonb_typeof(content #> '{investigations,ruleOut}') = 'array'
          then (content #> '{investigations,ruleIn}') || (content #> '{investigations,ruleOut}')
          else '[]'::jsonb
        end
      ) as investigation(item)
      where
        investigation.item ->> 'tier' is null
        or investigation.item ->> 'tier' not in (
          'laboratory', 'firstLineImaging', 'advancedImaging', 'specializedAdjunctive'
        )
        or nullif(btrim(investigation.item ->> 'testName'), '') is null
        or nullif(btrim(investigation.item ->> 'modalityTarget'), '') is null
        or nullif(btrim(investigation.item ->> 'targetCondition'), '') is null
        or nullif(btrim(investigation.item ->> 'expectedFinding'), '') is null
        or nullif(btrim(investigation.item ->> 'clinicalRationale'), '') is null
    )), false)
$$;

alter table public.guideline_versions
  drop constraint if exists guideline_versions_structured_investigations_check;

alter table public.guideline_versions
  add constraint guideline_versions_structured_investigations_check
  check (public.guideline_investigations_are_structured(content)) not valid;

comment on function public.guideline_investigations_are_structured(jsonb) is
  'Validates categorized investigations and required modality/target, interpretation, and rationale fields for new guideline content.';
