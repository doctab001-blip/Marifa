insert into public.specialties (organization_id, name, is_shared, slug, parent_specialty_id)
values (null, 'Palliative Medicine', true, 'palliative-medicine', null)
on conflict (organization_id, name) do update set slug = excluded.slug, is_shared = true;

with topic_tags(slug, speciality, sub_specialities) as (values
  ('copd-exacerbation', 'Pulmonology', array['Internal Medicine']),
  ('acute-kidney-injury', 'Nephrology', array['Internal Medicine']),
  ('adult-asthma', 'Pulmonology', array['Internal Medicine']),
  ('adult-dka-hhs', 'Endocrinology', array['Internal Medicine']),
  ('adult-immunisation', 'Internal Medicine', array[]::text[]),
  ('preoperative-assessment', 'Anaesthesiology', array['General Surgery']),
  ('sepsis-adult', 'Emergency Medicine', array['Internal Medicine','Infectious Diseases']),
  ('last-days-of-life', 'Palliative Medicine', array[]::text[]),
  ('colorectal-screening', 'Gastroenterology', array['Internal Medicine']),
  ('antenatal-hypertension', 'Obstetrics and Gynecology', array['Maternal-Fetal Medicine']),
  ('sepsis-recognition', 'Emergency Medicine', array['Infectious Diseases']),
  ('type-2-diabetes', 'Endocrinology', array['Internal Medicine'])
)
update public.disease_topics t
set specialty_id = s.id,
    sub_specialities = topic_tags.sub_specialities
from topic_tags
join public.specialties s on s.organization_id is null and s.name = topic_tags.speciality and s.is_shared
where t.organization_id is null and t.slug = topic_tags.slug;
