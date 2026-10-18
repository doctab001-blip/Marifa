-- Topic view tracking for the dashboard ("Most viewed", "Trending this week").
-- One row per topic per UTC day keeps writes cheap and lets the dashboard compute both all-time
-- totals and a rolling 7-day window. Topic ids are the clinical_guidelines ids (text, no foreign key,
-- so a view row never blocks a topic from being superseded or removed).
-- No personal data is stored: no user id, no IP, no timestamp finer than a day.

create table if not exists public.topic_view_daily (
  guideline_id text not null,
  view_date date not null default ((now() at time zone 'utc')::date),
  view_count integer not null default 0 check (view_count >= 0),
  primary key (guideline_id, view_date)
);

create index if not exists topic_view_daily_date_idx on public.topic_view_daily (view_date desc);

alter table public.topic_view_daily enable row level security;
-- Intentionally no policies: the table is only reachable through the two functions below.
revoke all on table public.topic_view_daily from anon, authenticated;

create or replace function public.record_topic_view(p_guideline_id text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.topic_view_daily (guideline_id, view_date, view_count)
  values (left(p_guideline_id, 200), (now() at time zone 'utc')::date, 1)
  on conflict (guideline_id, view_date)
  do update set view_count = public.topic_view_daily.view_count + 1;
$$;

create or replace function public.topic_view_stats()
returns table (guideline_id text, total_views bigint, views_7d bigint, last_viewed date)
language sql
stable
security definer
set search_path = public
as $$
  select
    guideline_id,
    sum(view_count)::bigint as total_views,
    coalesce(sum(view_count) filter (where view_date >= (now() at time zone 'utc')::date - 6), 0)::bigint as views_7d,
    max(view_date) as last_viewed
  from public.topic_view_daily
  group by guideline_id;
$$;

revoke all on function public.record_topic_view(text) from public, anon;
revoke all on function public.topic_view_stats() from public, anon;
grant execute on function public.record_topic_view(text) to authenticated, service_role;
grant execute on function public.topic_view_stats() to authenticated, service_role;
