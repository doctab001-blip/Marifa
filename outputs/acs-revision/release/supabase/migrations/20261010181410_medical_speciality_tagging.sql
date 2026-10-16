-- Shared taxonomy used as the primary speciality FK for disease topics and guidelines.
alter table public.specialties
  add column if not exists parent_specialty_id uuid references public.specialties(id) on delete set null,
  add column if not exists slug text;

alter table public.specialties add column if not exists sub_specialities text[] not null default '{}';
create unique index if not exists specialties_shared_slug_idx
  on public.specialties(slug) where organization_id is null and slug is not null;
create unique index if not exists specialties_org_name_unique
  on public.specialties(organization_id, name) nulls not distinct;

alter table public.disease_topics
  add column if not exists sub_specialities text[] not null default '{}';
alter table public.clinical_guidelines
  add column if not exists speciality_id uuid references public.specialties(id),
  add column if not exists sub_specialities text[] not null default '{}';
create index if not exists clinical_guidelines_speciality_idx
  on public.clinical_guidelines(speciality_id, organization_id, status);
create index if not exists disease_topics_speciality_idx
  on public.disease_topics(specialty_id, organization_id);

insert into public.specialties (organization_id, name, is_shared, slug, parent_specialty_id)
values
  (null, 'Internal Medicine', true, 'internal-medicine', null),
  (null, 'General Surgery', true, 'general-surgery', null),
  (null, 'Acute Care Surgery', true, 'acute-care-surgery', null),
  (null, 'Obstetrics and Gynecology', true, 'obstetrics-and-gynecology', null),
  (null, 'Paediatrics', true, 'paediatrics', null),
  (null, 'Neonatology', true, 'neonatology', null),
  (null, 'Emergency Medicine', true, 'emergency-medicine', null),
  (null, 'Orthopedics and Trauma', true, 'orthopedics-and-trauma', null),
  (null, 'Otolaryngology (ENT)', true, 'otolaryngology-ent', null),
  (null, 'Ophthalmology', true, 'ophthalmology', null),
  (null, 'Dermatology', true, 'dermatology', null),
  (null, 'Psychiatry', true, 'psychiatry', null),
  (null, 'Urology', true, 'urology', null),
  (null, 'Anaesthesiology', true, 'anaesthesiology', null)
on conflict (organization_id, name) do update set slug = excluded.slug, is_shared = true;

insert into public.specialties (organization_id, name, is_shared, slug, parent_specialty_id)
select null, child.name, true, child.slug, parent.id
from (values
  ('Internal Medicine', 'Cardiology', 'cardiology'),
  ('Internal Medicine', 'Pulmonology', 'pulmonology'),
  ('Internal Medicine', 'Gastroenterology', 'gastroenterology'),
  ('Internal Medicine', 'Nephrology', 'nephrology'),
  ('Internal Medicine', 'Endocrinology', 'endocrinology'),
  ('Internal Medicine', 'Infectious Diseases', 'infectious-diseases'),
  ('Internal Medicine', 'Neurology', 'neurology'),
  ('Internal Medicine', 'Haematology', 'haematology'),
  ('Internal Medicine', 'Medical Oncology', 'medical-oncology'),
  ('Internal Medicine', 'Rheumatology', 'rheumatology'),
  ('Internal Medicine', 'Geriatric Medicine', 'geriatric-medicine'),
  ('Internal Medicine', 'Critical Care Medicine', 'critical-care-medicine'),
  ('Obstetrics and Gynecology', 'Maternal-Fetal Medicine', 'maternal-fetal-medicine'),
  ('Obstetrics and Gynecology', 'Reproductive Medicine', 'reproductive-medicine'),
  ('Paediatrics', 'Paediatric Cardiology', 'paediatric-cardiology'),
  ('Paediatrics', 'Paediatric Emergency Medicine', 'paediatric-emergency-medicine'),
  ('Paediatrics', 'Paediatric Infectious Diseases', 'paediatric-infectious-diseases')
) as child(parent_name, name, slug)
join public.specialties parent on parent.organization_id is null and parent.name = child.parent_name
on conflict (organization_id, name) do update set slug = excluded.slug, parent_specialty_id = excluded.parent_specialty_id, is_shared = true;

-- Preserve legacy composite labels while converting their first recognized taxonomy term
-- into a primary speciality and the remaining terms into secondary tags.
with matched as (
  select g.id,
         (array_agg(s.id order by strpos(lower(g.specialty), lower(s.name)), length(s.name) desc))[1] as primary_id,
         array_remove(array_agg(s.name order by strpos(lower(g.specialty), lower(s.name)), length(s.name) desc),
           (array_agg(s.name order by strpos(lower(g.specialty), lower(s.name)), length(s.name) desc))[1]) as secondary_names
  from public.clinical_guidelines g
  join public.specialties s on s.organization_id is null and s.is_shared
    and strpos(lower(coalesce(g.specialty, '')), lower(s.name)) > 0
  where g.speciality_id is null
  group by g.id, g.specialty
)
update public.clinical_guidelines g
set speciality_id = matched.primary_id,
    sub_specialities = matched.secondary_names
from matched
where g.id = matched.id;

update public.disease_topics t
set specialty_id = s.id
from public.specialties s
where s.organization_id is null and t.specialty_id is null
  and lower(trim(t.name_en)) = lower(s.name)
  and s.parent_specialty_id is null;

alter table public.specialties enable row level security;
drop policy if exists shared_specialties_read on public.specialties;
create policy shared_specialties_read on public.specialties for select to anon
  using (organization_id is null and is_shared);
grant select on public.specialties to anon, authenticated;
