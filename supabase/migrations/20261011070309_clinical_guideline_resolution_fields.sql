-- Keep this additive: existing disease topics and governed guideline versions remain canonical.
alter table public.guidelines_sources
  add column hierarchy_rank integer;

update public.guidelines_sources
set hierarchy_rank = case issuer
  when 'Saudi MOH' then 1
  when 'Saudi Health Council' then 1
  when 'ACC/AHA' then 2
  when 'ESC' then 3
  when 'ADA' then 4
  when 'NICE' then 5
  when 'PHA' then 6
  else 100
end
where hierarchy_rank is null;

alter table public.guidelines_sources
  alter column hierarchy_rank set not null,
  alter column hierarchy_rank drop default,
  add column publication_year integer check (publication_year between 1800 and 2200),
  add constraint guidelines_sources_hierarchy_rank_positive check (hierarchy_rank > 0);

alter table public.clinical_pathway_payloads
  add column exact_dosing jsonb not null default '{}'::jsonb,
  add column strict_timeframes jsonb not null default '[]'::jsonb,
  add constraint clinical_pathway_exact_dosing_object check (jsonb_typeof(exact_dosing) = 'object'),
  add constraint clinical_pathway_strict_timeframes_array check (jsonb_typeof(strict_timeframes) = 'array');

comment on column public.guidelines_sources.hierarchy_rank is 'Smaller numbers indicate higher locally configured authority; ties are resolved by structured granularity.';
comment on column public.guidelines_sources.publication_year is 'Publication year when known; edition metadata remains available for sources without a numeric year.';
comment on column public.clinical_pathway_payloads.exact_dosing is 'Structured dose details including loading, maintenance, route, and duration; retained with the governed pathway version.';
comment on column public.clinical_pathway_payloads.strict_timeframes is 'Explicit clinical timing anchors such as Hour 0 or Within 10 minutes.';
