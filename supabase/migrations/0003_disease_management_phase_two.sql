-- Phase 2 disease directory projection.
-- All seeded records are explicitly marked as UI demonstration content.

create table public.disease_protocol_profiles (
  disease_topic_id uuid primary key references public.disease_topics(id) on delete cascade,
  short_title text not null,
  care_pillar text not null check (care_pillar in (
    'urgent-care', 'chronic-care', 'keep-well', 'planned-care', 'safe-birth', 'palliative-care'
  )),
  source_authority text not null,
  version text not null,
  last_reviewed date not null,
  updated_at timestamptz not null default now(),
  approval_status public.content_status not null default 'draft'
    check (approval_status in ('draft', 'approved')),
  red_flags text[] not null default '{}',
  pathway jsonb,
  is_demo boolean not null default true,
  source_note text not null default 'Illustrative UI record — not verified clinical guidance',
  check (pathway is null or jsonb_typeof(pathway) = 'object')
);

create index disease_protocol_profiles_pillar_idx
  on public.disease_protocol_profiles(care_pillar, updated_at desc);

alter table public.disease_protocol_profiles enable row level security;

create policy public_demo_protocol_read
  on public.disease_protocol_profiles for select
  using (is_demo = true);

grant select on public.disease_protocol_profiles to anon, authenticated;

insert into public.disease_topics (
  id, organization_id, specialty_id, slug, name_en, name_ar, summary_en, aliases
) values
  (
    '30000000-0000-0000-0000-000000000010', null, null, 'adult-dka-hhs',
    'Adult Diabetic Ketoacidosis & Hyperosmolar Hyperglycaemic State', null,
    'Recognition, early stabilisation, electrolyte decisions and monitored resolution.',
    array['DKA', 'HHS', 'diabetic ketoacidosis', 'hyperosmolar state']
  ),
  (
    '30000000-0000-0000-0000-000000000011', null, null, 'sepsis-adult',
    'Adult Sepsis Recognition and Escalation', null,
    'Early recognition, severity assessment and time-critical escalation.',
    array['sepsis', 'septic shock', 'infection']
  ),
  (
    '30000000-0000-0000-0000-000000000012', null, null, 'adult-asthma',
    'Adult Asthma Long-Term Management', null,
    'Assessment, stepped care, inhaler review and planned follow-up.',
    array['asthma', 'wheeze', 'airway disease']
  ),
  (
    '30000000-0000-0000-0000-000000000013', null, null, 'type-2-diabetes',
    'Type 2 Diabetes Integrated Care', null,
    'Risk review, treatment planning and complication surveillance.',
    array['T2DM', 'diabetes', 'glycaemic care']
  ),
  (
    '30000000-0000-0000-0000-000000000014', null, null, 'adult-immunisation',
    'Adult Immunisation Schedule', null,
    'Eligibility, schedule review and shared preventive-care decisions.',
    array['vaccination', 'vaccines', 'immunization']
  ),
  (
    '30000000-0000-0000-0000-000000000015', null, null, 'colorectal-screening',
    'Colorectal Cancer Screening', null,
    'Risk-based eligibility, testing and referral workflow.',
    array['bowel screening', 'FIT', 'colorectal cancer']
  ),
  (
    '30000000-0000-0000-0000-000000000016', null, null, 'preoperative-assessment',
    'Adult Pre-operative Assessment', null,
    'Readiness assessment, medication review and peri-operative planning.',
    array['pre-op', 'surgical assessment', 'elective surgery']
  ),
  (
    '30000000-0000-0000-0000-000000000017', null, null, 'antenatal-hypertension',
    'Hypertension in Pregnancy', null,
    'Recognition, maternal-fetal assessment and escalation planning.',
    array['pre-eclampsia', 'preeclampsia', 'gestational hypertension']
  ),
  (
    '30000000-0000-0000-0000-000000000018', null, null, 'last-days-of-life',
    'Care in the Last Days of Life', null,
    'Recognition, comfort priorities and communication with patients and families.',
    array['end of life', 'terminal care', 'comfort care']
  )
on conflict (id) do update set
  slug = excluded.slug,
  name_en = excluded.name_en,
  summary_en = excluded.summary_en,
  aliases = excluded.aliases;

insert into public.disease_protocol_profiles (
  disease_topic_id, short_title, care_pillar, source_authority, version, last_reviewed,
  updated_at, approval_status, red_flags, pathway, is_demo, source_note
) values
  (
    '30000000-0000-0000-0000-000000000010', 'Adult DKA/HHS', 'urgent-care', 'Saudi Ministry of Health', '2.4',
    '2026-10-02', '2026-10-02T09:00:00+03:00', 'approved',
    array[
      'Haemodynamic instability, reduced consciousness or rapidly worsening observations.',
      'Severe potassium abnormality, significant cardiac or renal comorbidity, or suspected cerebral oedema.',
      'Failure to improve despite initial treatment or uncertainty about DKA/HHS overlap.'
    ],
    $pathway$
    {
      "title": "Adult DKA/HHS Protocol",
      "description": "A structured UI demonstration of assessment, treatment and decision branches.",
      "steps": [
        {
          "id": "recognise",
          "title": "Recognise and assess",
          "subtitle": "Confirm the presentation and assess immediate stability.",
          "actions": [
            "Record airway, breathing, circulation, neurological status and fluid balance.",
            "Obtain bedside glucose and ketones, venous blood gas, electrolytes, urea and creatinine.",
            "Look for a precipitating cause and request senior review early."
          ]
        },
        {
          "id": "potassium",
          "title": "Check potassium before insulin",
          "subtitle": "Use the current potassium result to choose the safe next action.",
          "actions": [
            "Start cardiac monitoring when clinically indicated.",
            "Repeat potassium according to the locally approved monitoring schedule."
          ],
          "branches": [
            {"condition": "If K+ < 3.3 mmol/L", "outcome": "Hold insulin and replace potassium with urgent senior oversight."},
            {"condition": "If K+ is 3.3–5.2 mmol/L", "outcome": "Add potassium to fluids according to the approved local protocol."},
            {"condition": "If K+ > 5.2 mmol/L", "outcome": "Do not add potassium initially; monitor closely and reassess."}
          ]
        },
        {
          "id": "fluids",
          "title": "Begin fluid replacement",
          "subtitle": "Restore circulating volume while accounting for individual risk.",
          "actions": [
            "Use isotonic crystalloid as directed by the approved local protocol.",
            "Adjust the rate for haemodynamic status, age, renal impairment and heart failure risk.",
            "Document input, output and clinical response."
          ]
        },
        {
          "id": "insulin",
          "title": "Start fixed-rate insulin",
          "subtitle": "Only after potassium and fluid priorities have been addressed.",
          "actions": [
            "Use the locally approved weight-based infusion dose and independent medication check.",
            "Continue background basal insulin when specified by local policy.",
            "Do not use this UI demonstration to calculate or prescribe a dose."
          ]
        },
        {
          "id": "monitor",
          "title": "Monitor response and resolve",
          "subtitle": "Trend biochemical and clinical recovery; escalate unexpected change.",
          "actions": [
            "Repeat glucose, ketones, electrolytes and acid-base assessment at locally approved intervals.",
            "Review fluid balance, neurological status and treatment complications.",
            "Transition only when resolution criteria are met and a safe ongoing plan is documented."
          ],
          "branches": [
            {"condition": "If targets are improving", "outcome": "Continue the pathway and planned monitoring."},
            {"condition": "If targets are not improving", "outcome": "Reassess diagnosis, delivery systems and precipitating factors; escalate care."}
          ]
        }
      ]
    }
    $pathway$::jsonb,
    true, 'Illustrative UI record attributed for layout testing; not verified Saudi MOH clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000011', 'Adult Sepsis', 'urgent-care', 'Saudi Health Council', '1.8',
    '2026-09-28', '2026-09-28T09:00:00+03:00', 'approved',
    array['Suspected infection with shock, altered mental status or rapidly worsening observations.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified SHC clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000012', 'Adult Asthma', 'chronic-care', 'Saudi Ministry of Health', '3.1',
    '2026-09-22', '2026-09-22T09:00:00+03:00', 'approved',
    array['Severe breathlessness, exhaustion, cyanosis or reduced conscious level requires urgent escalation.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified Saudi MOH clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000013', 'Type 2 Diabetes', 'chronic-care', 'Saudi Health Council', '2.0',
    '2026-09-18', '2026-09-18T09:00:00+03:00', 'draft',
    array['Acute metabolic decompensation or serious hypoglycaemia requires urgent assessment.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified SHC clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000014', 'Adult Immunisation', 'keep-well', 'Saudi Ministry of Health', '2026.2',
    '2026-09-15', '2026-09-15T09:00:00+03:00', 'approved',
    array['Suspected anaphylaxis after vaccination requires immediate emergency management.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified Saudi MOH clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000015', 'Colorectal Screening', 'keep-well', 'Saudi Health Council', '1.3',
    '2026-09-10', '2026-09-10T09:00:00+03:00', 'draft',
    array['Alarm symptoms should enter the appropriate diagnostic pathway rather than routine screening.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified SHC clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000016', 'Pre-operative Assessment', 'planned-care', 'Saudi Health Council', '1.6',
    '2026-09-07', '2026-09-07T09:00:00+03:00', 'approved',
    array['Unstable acute illness or decompensated comorbidity requires senior review before planned surgery.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified SHC clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000017', 'Hypertension in Pregnancy', 'safe-birth', 'Saudi Ministry of Health', '2.2',
    '2026-09-01', '2026-09-01T09:00:00+03:00', 'approved',
    array['Severe hypertension, neurological symptoms, epigastric pain or fetal concern requires urgent obstetric review.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified Saudi MOH clinical guidance.'
  ),
  (
    '30000000-0000-0000-0000-000000000018', 'Last Days of Life', 'palliative-care', 'Saudi Health Council', '1.1',
    '2026-08-26', '2026-08-26T09:00:00+03:00', 'draft',
    array['Uncontrolled distress or an unexpected clinical change requires prompt senior reassessment.'],
    null, true, 'Illustrative UI record attributed for layout testing; not verified SHC clinical guidance.'
  )
on conflict (disease_topic_id) do update set
  short_title = excluded.short_title,
  care_pillar = excluded.care_pillar,
  source_authority = excluded.source_authority,
  version = excluded.version,
  last_reviewed = excluded.last_reviewed,
  updated_at = excluded.updated_at,
  approval_status = excluded.approval_status,
  red_flags = excluded.red_flags,
  pathway = excluded.pathway,
  is_demo = excluded.is_demo,
  source_note = excluded.source_note;
