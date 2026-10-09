-- Public demo catalogue and profile protections for the hosted development environment.
alter table public.profiles enable row level security;

create policy profiles_self_read on public.profiles for select
  using (id = auth.uid());

create policy profiles_self_update on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

grant select on public.disease_topics to anon, authenticated;

insert into public.specialties (id, organization_id, name, is_shared) values
  ('20000000-0000-0000-0000-000000000001', null, 'Respiratory medicine', true),
  ('20000000-0000-0000-0000-000000000002', null, 'Emergency medicine', true),
  ('20000000-0000-0000-0000-000000000003', null, 'Nephrology', true)
on conflict (id) do nothing;

insert into public.disease_topics (
  id, organization_id, specialty_id, slug, name_en, name_ar, summary_en, aliases
) values
  (
    '30000000-0000-0000-0000-000000000001', null,
    '20000000-0000-0000-0000-000000000001', 'copd-exacerbation',
    'Acute exacerbation of COPD', 'التفاقم الحاد لمرض الانسداد الرئوي المزمن',
    'DEMO — NOT FOR CLINICAL USE. Structured product demonstration only.',
    array['COPD','AECOPD','shortness of breath','dyspnoea','wheeze']
  ),
  (
    '30000000-0000-0000-0000-000000000002', null,
    '20000000-0000-0000-0000-000000000002', 'sepsis-recognition',
    'Sepsis recognition', 'التعرف على الإنتان',
    'DEMO — NOT FOR CLINICAL USE. Structured product demonstration only.',
    array['sepsis','suspected sepsis','fever','confusion','deterioration']
  ),
  (
    '30000000-0000-0000-0000-000000000003', null,
    '20000000-0000-0000-0000-000000000003', 'acute-kidney-injury',
    'Acute kidney injury', 'إصابة الكلى الحادة',
    'DEMO — NOT FOR CLINICAL USE. Structured product demonstration only.',
    array['AKI','acute renal injury','reduced urine output']
  )
on conflict (id) do update set
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  summary_en = excluded.summary_en,
  aliases = excluded.aliases;
