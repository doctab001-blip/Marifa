import json, re
rows = json.load(open("verified.json"))
def q(s): return "'" + s.replace("'", "''") + "'"
def arr(a): return "array[" + ",".join(q(x) for x in a) + "]::text[]"
KSA = re.compile(r"Saudi|Gulf|Middle East|thalass|sickle", re.I)
out = []
for e in rows:
    saudi = bool(KSA.search(e["why"] + e["headline"]))
    label = e["journal"] if e["journal"] else "Journal"
    out.append(
        "  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)" % (
            q("https://doi.org/" + e["doi"]), q(e["doi"]), q(e["cat"]), q(e["headline"]), q(e["summary"]),
            q(e["date"]), arr(e["spec"]), str(e["sig"]), q(e["why"]), q(label), "true" if saudi else "false"))
extra = ("  ('https://www.sfda.gov.sa/en/news/18703', null, 'regulatory_decision', "
  "'SFDA registers lecanemab (Leqembi) for early Alzheimer''s disease', "
  "'The Saudi Food and Drug Authority registered the anti-amyloid antibody lecanemab for early Alzheimer''s disease.', "
  "'2025-07-01', array['Neurology']::text[], 1, "
  "'First anti-amyloid disease-modifying treatment registered in Saudi Arabia; confirm the exact date and conditions on the SFDA page.', "
  "'SFDA', true)")
sql = f"""-- Medical Progress Archive (phase 1): a worldwide, year-by-year record of developments that matter to doctors.
-- Extends recent_developments. Archive rows are curated and verified against Crossref (DOI, title, date); all text is in our own words.
-- The weekly scan keeps filling the "Latest" tab (origin = 'weekly_scan'); the Archive tab shows origin = 'archive'.
alter table public.recent_developments drop constraint if exists recent_developments_category_check;
alter table public.recent_developments add constraint recent_developments_category_check check (category in
  ('new_drug_approval','safety_alert','guideline_update','key_trial','regulatory_decision','public_health',
   'vaccine','procedure_gene_cell_therapy','device_diagnostic','risk_score_criteria','definition_classification'));

alter table public.recent_developments drop constraint if exists recent_developments_summary_source_check;
alter table public.recent_developments add constraint recent_developments_summary_source_check
  check (summary_source is null or summary_source in ('pubmed_abstract','curated'));

alter table public.recent_developments
  add column if not exists origin text not null default 'weekly_scan' check (origin in ('weekly_scan','archive')),
  add column if not exists year integer generated always as (extract(year from published_at)::integer) stored,
  add column if not exists significance smallint not null default 2 check (significance in (1,2,3)),
  add column if not exists why_it_matters text check (why_it_matters is null or char_length(why_it_matters) <= 400),
  add column if not exists region text not null default 'global' check (region in ('global','gcc','ksa')),
  add column if not exists sfda_status text,
  add column if not exists source_label text,
  add column if not exists source_checked_at timestamptz,
  add column if not exists source_checked_by text;

create index if not exists recent_developments_archive_idx on public.recent_developments (origin, status, year desc, significance);

create or replace view public.recent_development_year_counts with (security_invoker = true) as
  select year, category, significance, region, count(*)::int as n
  from public.recent_developments
  where origin = 'archive' and status = 'published'
  group by year, category, significance, region;
grant select on public.recent_development_year_counts to authenticated;

insert into public.dev_sources (id, name, tier, kind, url)
  values ('archive-curated', 'Curated archive (verified against Crossref)', 'C', 'api', 'https://api.crossref.org/works')
  on conflict (id) do nothing;

insert into public.recent_developments
  (source_id, origin, status, summary_source, source_checked_at, source_checked_by,
   source_url, doi, category, title, summary, published_at, specialities, significance, why_it_matters, source_label, saudi_relevant)
select 'archive-curated','archive','published','curated', now(), 'crossref-doi', v.*
from (values
""" + ",\n".join(out + [extra]) + """
) as v(source_url, doi, category, title, summary, published_at, specialities, significance, why_it_matters, source_label, saudi_relevant)
on conflict (source_url) do nothing;
"""
# published_at is date typed: cast in select
sql = sql.replace("select 'archive-curated','archive','published','curated', now(), 'crossref-doi', v.*",
  "select 'archive-curated','archive','published','curated', now(), 'crossref-doi', v.source_url, v.doi, v.category, v.title, v.summary, v.published_at::date, v.specialities, v.significance::smallint, v.why_it_matters, v.source_label, v.saudi_relevant")
open("../../supabase/migrations/20261019100000_medical_progress_archive.sql","w").write(sql)
print(len(rows)+1, "rows;", len(sql), "bytes")
