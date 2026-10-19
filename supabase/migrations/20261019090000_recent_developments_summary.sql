-- Recent Developments: short plain-language summaries.
-- Regulator items already carry the source's own excerpt. For journal items we never store the publisher's
-- abstract; we keep only a short summary written in our own words from the FREE PubMed abstract, plus a
-- link to a free full-text copy (PubMed Central) when one exists. No paywalled content is fetched.
alter table public.recent_developments
  add column if not exists summary text check (summary is null or char_length(summary) <= 900),
  add column if not exists summary_source text check (summary_source is null or summary_source in ('pubmed_abstract')),
  add column if not exists summarised_at timestamptz,
  add column if not exists summary_attempted_at timestamptz,
  add column if not exists free_full_text_url text check (free_full_text_url is null or free_full_text_url like 'https://%');
