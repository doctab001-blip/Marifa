-- Recent Developments: a weekly digest of new drug approvals, safety alerts, guideline news and key trials.
-- Items are fetched from allow-listed official sources by /api/cron/recent-developments (Mondays 06:00 Riyadh).
-- Regulator items (tier A) are published automatically; journal items (tier B) wait in 'pending_review'
-- until an administrator approves them. Nothing here ever edits a clinical topic.
-- Only the service role writes. Signed-in users can read published items only.

create table if not exists public.dev_sources (
  id text primary key,
  name text not null,
  tier char(1) not null check (tier in ('A', 'B', 'C')),
  kind text not null check (kind in ('rss', 'api', 'scrape')),
  url text not null,
  enabled boolean not null default true,
  last_ok_at timestamptz,
  last_error text
);

create table if not exists public.dev_scan_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched integer,
  inserted integer,
  skipped integer,
  errors jsonb
);

create table if not exists public.recent_developments (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.dev_sources (id),
  category text not null check (category in
    ('new_drug_approval', 'safety_alert', 'guideline_update', 'key_trial', 'regulatory_decision', 'public_health')),
  title text not null check (char_length(title) between 1 and 500),
  -- Excerpt supplied by the source itself (regulators). Null for journals: we store title, citation and link only.
  excerpt text check (excerpt is null or char_length(excerpt) <= 600),
  source_url text not null unique check (source_url like 'https://%'),
  doi text,
  pmid text,
  published_at date not null,
  specialities text[] not null default '{}',
  saudi_relevant boolean not null default false,
  status text not null default 'pending_review' check (status in ('published', 'pending_review', 'hidden')),
  reviewed_by text,
  reviewed_at timestamptz,
  scan_run_id uuid references public.dev_scan_runs (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists recent_developments_status_date_idx
  on public.recent_developments (status, published_at desc);
create index if not exists recent_developments_category_idx
  on public.recent_developments (category);

alter table public.dev_sources enable row level security;
alter table public.dev_scan_runs enable row level security;
alter table public.recent_developments enable row level security;

-- No policies on dev_sources / dev_scan_runs: service role only.
revoke all on table public.dev_sources, public.dev_scan_runs from anon, authenticated;
revoke all on table public.recent_developments from anon, authenticated;

grant select on table public.recent_developments to authenticated;
create policy "Signed-in users read published developments"
  on public.recent_developments for select to authenticated
  using (status = 'published');

insert into public.dev_sources (id, name, tier, kind, url) values
  ('fda-drugs',    'FDA: Drugs news',             'A', 'rss', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml'),
  ('fda-medwatch', 'FDA: MedWatch safety',        'A', 'rss', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml'),
  ('ema-news',     'European Medicines Agency',   'A', 'rss', 'https://www.ema.europa.eu/en/news.xml'),
  ('who-news',     'World Health Organization',   'A', 'rss', 'https://www.who.int/rss-feeds/news-english.xml'),
  ('nejm',         'New England Journal of Medicine', 'B', 'rss', 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss'),
  ('lancet',       'The Lancet',                  'B', 'rss', 'https://www.thelancet.com/rssfeed/lancet_current.xml'),
  ('bmj',          'The BMJ',                     'B', 'rss', 'https://www.bmj.com/rss/recent.xml'),
  ('jama',         'JAMA',                        'B', 'rss', 'https://jamanetwork.com/rss/site_3/67.xml')
on conflict (id) do nothing;
