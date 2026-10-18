import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { inferMedicalSpecialityTags } from "@/lib/medical-specialities";

type CatalogRow = {
  condition: string;
  specialty: string;
  entry_types: string[];
  catalogue_statuses: string[];
  source_scenarios: string[];
};

type MasterRow = {
  condition: string;
  clinical_specialties: Set<string>;
  source_specialty_labels: Set<string>;
  entry_types: Set<string>;
  catalogue_statuses: Set<string>;
  source_scenarios: Set<string>;
};

const sql = `with current as (
  select g.title, g.specialty, g.status as catalogue_status,
         v.status as version_status, v.content
  from public.clinical_guidelines g
  join public.guideline_versions v on v.guideline_id = g.id and v.is_current = true
  where g.organization_id is null and g.is_shared_reference = true
), entries as (
  select title as condition, specialty, 'catalogue-topic' as entry_type,
         catalogue_status || '/' || version_status as catalogue_status,
         title as source_scenario
  from current
  union all
  select d.item->>'condition', specialty, 'differential',
         catalogue_status || '/' || version_status, title
  from current
  cross join lateral jsonb_array_elements(coalesce(content->'differentials','[]'::jsonb)) as d(item)
)
select condition, specialty, array_agg(distinct entry_type) as entry_types,
       array_agg(distinct catalogue_status) as catalogue_statuses,
       array_agg(distinct source_scenario) as source_scenarios
from entries
where nullif(trim(condition),'') is not null
group by condition, specialty
order by condition, specialty;`;

const output = execFileSync("supabase", ["db", "query", "--linked", "--output-format", "json", sql], {
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
const result = JSON.parse(output) as { rows: CatalogRow[] };

const specialtyDomains: Record<string, string[]> = {
  Cardiology: ["acc.org", "heart.org", "cpr.heart.org"],
  Pulmonology: ["ginasthma.org", "goldcopd.org", "thoracic.org"],
  Gastroenterology: ["gastro.org", "gi.org", "aasld.org"],
  Nephrology: ["kdigo.org", "kidney.org"],
  Endocrinology: ["diabetes.org", "diabetesjournals.org", "endocrine.org"],
  "Infectious Diseases": ["idsociety.org", "cdc.gov"],
  Neurology: ["aan.com", "stroke.org"],
  "General Surgery": ["facs.org", "sages.org", "fascrs.org"],
  "Acute Care Surgery": ["facs.org", "east.org"],
  "Obstetrics and Gynecology": ["acog.org", "rcog.org.uk"],
  Paediatrics: ["aap.org", "cdc.gov"],
  Neonatology: ["aap.org", "nice.org.uk"],
  "Emergency Medicine": ["acep.org", "facs.org"],
  "Orthopedics and Trauma": ["aaos.org", "ota.org"],
  "Otolaryngology (ENT)": ["entnet.org"],
  Ophthalmology: ["aao.org"],
  Dermatology: ["aad.org"],
  Psychiatry: ["psychiatry.org", "nice.org.uk"],
  Urology: ["auanet.org", "urologyhealth.org"],
  Anaesthesiology: ["asahq.org", "apsf.org"],
  "Internal Medicine": ["acponline.org"],
  "Family Medicine": ["aafp.org"],
  "Public Health": ["cdc.gov"],
  "Palliative Medicine": ["aahpm.org", "capc.org"],
  "Geriatric Medicine": ["americangeriatrics.org"],
  Rheumatology: ["rheumatology.org"],
  Oncology: ["asco.org", "cancer.gov"],
  "Medical Oncology": ["asco.org", "cancer.gov"],
  "Radiation Oncology": ["astro.org", "cancer.gov"],
  "Breast Surgery": ["facs.org", "breastsurgeons.org"],
  "Thoracic Surgery": ["sts.org"],
  "Maternal-Fetal Medicine": ["smfm.org", "acog.org"],
  "Preventive Medicine": ["acpm.org", "cdc.gov"],
  "Allergy and Immunology": ["aaaai.org", "acaai.org"],
  Toxicology: ["aactox.org", "acep.org"],
  "Critical Care Medicine": ["sccm.org"],
  "Vascular Surgery": ["vascular.org", "svs.org"],
  "Cardiothoracic Surgery": ["sts.org"],
  "Bariatric Surgery": ["asmbs.org"],
};

const extras: Array<{ condition: string; specialties: string[]; type: string }> = [
  { condition: "Acute Chest Pain", specialties: ["Emergency Medicine", "Cardiology"], type: "cardiovascular-branch" },
  { condition: "Stable Chest Pain", specialties: ["Cardiology", "Internal Medicine"], type: "cardiovascular-branch" },
  { condition: "Non-Cardiac Chest Pain", specialties: ["Emergency Medicine", "Internal Medicine", "Gastroenterology"], type: "cardiovascular-branch" },
  { condition: "Stable Angina", specialties: ["Cardiology"], type: "cardiovascular-branch" },
  { condition: "ST-Elevation Myocardial Infarction", specialties: ["Cardiology", "Emergency Medicine"], type: "cardiovascular-branch" },
  { condition: "Non-ST-Elevation Myocardial Infarction", specialties: ["Cardiology", "Emergency Medicine"], type: "cardiovascular-branch" },
  { condition: "Unstable Angina", specialties: ["Cardiology", "Emergency Medicine"], type: "cardiovascular-branch" },
  { condition: "Cardiac Arrest", specialties: ["Emergency Medicine", "Cardiology"], type: "cardiovascular-branch" },
  { condition: "Symptomatic Bradycardia", specialties: ["Emergency Medicine", "Cardiology"], type: "cardiovascular-branch" },
  { condition: "Tachyarrhythmia With a Pulse", specialties: ["Emergency Medicine", "Cardiology"], type: "cardiovascular-branch" },
  { condition: "Post-Cardiac Arrest Care", specialties: ["Emergency Medicine", "Cardiology", "Critical Care Medicine"], type: "cardiovascular-branch" },
  { condition: "Cardiogenic Shock", specialties: ["Cardiology", "Emergency Medicine", "Critical Care Medicine"], type: "cardiovascular-branch" },
  { condition: "Acute Pulmonary Embolism", specialties: ["Emergency Medicine", "Internal Medicine", "Pulmonology"], type: "cardiovascular-branch" },
  { condition: "Atopic Dermatitis", specialties: ["Dermatology"], type: "specialty-coverage" },
  { condition: "Psoriasis", specialties: ["Dermatology"], type: "specialty-coverage" },
  { condition: "Acne Vulgaris", specialties: ["Dermatology"], type: "specialty-coverage" },
  { condition: "Major Depressive Disorder", specialties: ["Psychiatry"], type: "specialty-coverage" },
  { condition: "Generalized Anxiety Disorder", specialties: ["Psychiatry"], type: "specialty-coverage" },
  { condition: "Bipolar Disorder", specialties: ["Psychiatry"], type: "specialty-coverage" },
  { condition: "Schizophrenia", specialties: ["Psychiatry"], type: "specialty-coverage" },
];

const master = new Map<string, MasterRow>();
function keyOf(condition: string) { return condition.trim().toLocaleLowerCase("en").replace(/\s+/g, " "); }
function ensure(condition: string) {
  const key = keyOf(condition);
  let row = master.get(key);
  if (!row) {
    row = { condition: condition.trim(), clinical_specialties: new Set(), source_specialty_labels: new Set(), entry_types: new Set(), catalogue_statuses: new Set(), source_scenarios: new Set() };
    master.set(key, row);
  }
  return row;
}

for (const item of result.rows) {
  const row = ensure(item.condition);
  const inferred = inferMedicalSpecialityTags(item.specialty);
  (inferred.length ? inferred : [item.specialty]).forEach((name) => row.clinical_specialties.add(name));
  row.source_specialty_labels.add(item.specialty);
  item.entry_types.forEach((name) => row.entry_types.add(name));
  item.catalogue_statuses.forEach((status) => row.catalogue_statuses.add(status));
  item.source_scenarios.forEach((scenario) => row.source_scenarios.add(scenario));
}

for (const extra of extras) {
  const row = ensure(extra.condition);
  extra.specialties.forEach((specialty) => row.clinical_specialties.add(specialty));
  extra.specialties.forEach((specialty) => row.source_specialty_labels.add(specialty));
  row.entry_types.add(extra.type);
  if (row.catalogue_statuses.size === 0) row.catalogue_statuses.add("not-in-catalogue");
}

function csvCell(value: string) { return `"${value.replaceAll('"', '""')}"`; }
const headers = ["condition", "clinical_specialties", "source_specialty_labels", "entry_types", "catalogue_statuses", "source_scenarios", "source_queries", "source_domains"];
const lines = [headers.join(",")];
for (const row of [...master.values()].sort((a, b) => a.condition.localeCompare(b.condition, "en"))) {
  const specialties = [...row.clinical_specialties].sort((a, b) => a.localeCompare(b, "en"));
  const sourceSpecialtyLabels = [...row.source_specialty_labels].sort((a, b) => a.localeCompare(b, "en"));
  const domains = new Set(["moh.gov.sa", "shc.gov.sa", "nice.org.uk", "who.int"]);
  for (const specialty of specialties) for (const domain of specialtyDomains[specialty] ?? []) domains.add(domain);
  for (const label of sourceSpecialtyLabels) {
    const lower = label.toLocaleLowerCase("en");
    for (const [specialty, mappedDomains] of Object.entries(specialtyDomains)) if (lower.includes(specialty.toLocaleLowerCase("en"))) mappedDomains.forEach((domain) => domains.add(domain));
  }
  const sourceQuery = specialties.some((specialty) => specialty === "Cardiology")
    ? `${row.condition} current ACC/AHA clinical practice guideline official source`
    : `${row.condition} current clinical practice guideline official Saudi MOH SHC NICE WHO source`;
  const values = [
    row.condition,
    specialties.join("|"),
    sourceSpecialtyLabels.join("|"),
    [...row.entry_types].sort().join("|"),
    [...row.catalogue_statuses].sort().join("|"),
    [...row.source_scenarios].sort().join("|"),
    sourceQuery,
    [...domains].sort().join("|"),
  ];
  lines.push(values.map(csvCell).join(","));
}

writeFileSync("data/clinical-branches/master-disease-list.csv", `${lines.join("\n")}\n`);
const covered = new Set([...master.values()].flatMap((row) => [...row.clinical_specialties]));
console.log(`Wrote ${master.size} unique conditions across ${covered.size} specialties (${result.rows.length} current catalogue rows plus explicit branch/specialty coverage).`);
