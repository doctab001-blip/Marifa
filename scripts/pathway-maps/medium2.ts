import type { PathwayMap } from "./types";

const sepsisBranches: PathwayMap["branches"] = [
  ["Fluid resuscitation", "Adult with sepsis-induced hypoperfusion or septic shock"],
  ["Septic shock — vasopressor", "Adult with septic shock and MAP below 65 despite fluids"],
  ["Not at target on noradrenaline", "Adult with septic shock not at target on noradrenaline"],
  ["Ongoing vasopressor need", "Adult with septic shock and an ongoing vasopressor requirement"],
];
const sepsisRows: PathwayMap["rows"] = [
  [0, 0, "Crystalloid", "pref", undefined, { genericName: "Balanced crystalloid" }],
  [0, 0, "Crystalloid", "alt", "Balanced crystalloid is unavailable", { genericName: "0.9% sodium chloride" }],
  [1, 1, "Vasopressor", "all"],
  [2, 2, "Second vasopressor", "all"],
  [3, 3, "Corticosteroid", "all"],
];

export const maps: PathwayMap[] = [
  {
    id: "progressive-neurological-disease-support",
    branches: [["Cramps or spasticity", "Adult with cramps or spasticity"]],
    rows: [
      [0, 0, "Antispasticity agent", "pref"],
      [1, 0, "Antispasticity agent", "alt", "Spasticity; chosen instead of baclofen"],
    ],
  },
  {
    id: "prostate-cancer-diagnosis-and-treatment-planning",
    branches: [
      ["Newly diagnosed metastatic disease", "Adult with newly diagnosed metastatic prostate cancer and no significant comorbidity"],
      ["Hot flushes on long-term ADT", "Man on long-term androgen deprivation therapy with troublesome hot flushes"],
      ["Metastatic disease — preserving sexual function", "Man with metastatic disease who wishes to preserve sexual function"],
      ["Bone loss on ADT", "Man on ADT at high fracture risk"],
    ],
    rows: [
      [0, 0, "Chemotherapy", "all"],
      [1, 1, "Hot flush treatment", "all"],
      [2, 2, "Anti-androgen", "all"],
      [3, 3, "Bone protection", "all"],
    ],
  },
  {
    id: "renal-colic-ed-analgesia-and-imaging",
    branches: [
      ["Analgesia for suspected renal colic", "Adult with suspected renal colic"],
      ["Medical expulsive therapy", "Adult, child or young person with a distal ureteric stone under 10 mm"],
    ],
    rows: [
      [0, 0, "Analgesic", "pref"],
      [1, 0, "Analgesic", "alt", "NSAID unsuitable or ineffective"],
      [2, 0, "Analgesic", "alt", "Other options ineffective"],
      [3, 1, "Alpha blocker", "all"],
    ],
  },
  {
    id: "respiratory-secretions-at-end-of-life-pharmacological-manage",
    branches: [
      ["Stat or as-needed dose", "Adult in the dying phase with respiratory secretions"],
      ["Continuous subcutaneous infusion", "Adult in the dying phase needing a syringe driver for respiratory secretions"],
    ],
    rows: [
      [0, 0, "Antimuscarinic", "pref"],
      [2, 0, "Antimuscarinic", "alt", "Chosen instead of hyoscine butylbromide"],
      [1, 1, "Antimuscarinic", "pref"],
      [3, 1, "Antimuscarinic", "alt", "Chosen instead of hyoscine butylbromide"],
    ],
  },
  { id: "sepsis", branches: sepsisBranches, rows: sepsisRows },
  { id: "sepsis-and-septic-shock", branches: sepsisBranches, rows: sepsisRows },
  {
    id: "severe-hypoglycaemia",
    branches: [
      ["Conscious and able to drink", "Adult with hypoglycaemia who is conscious and able to swallow"],
      ["Unconscious or unable to swallow — IV access", "Adult with severe hypoglycaemia and IV access"],
      ["Unconscious — no IV access", "Adult with severe hypoglycaemia and no IV access"],
    ],
    rows: [
      [0, 0, "Oral glucose", "all", undefined, { genericName: "Oral glucose (sugar, juice, honey)" }],
      [1, 1, "Intravenous glucose", "all"],
      [2, 2, "Glucagon", "all"],
    ],
  },
  {
    id: "severe-pre-eclampsia-and-eclampsia-emergency-management",
    branches: [
      ["Seizure prevention and treatment", "Pregnant or postpartum woman with severe hypertension or severe pre-eclampsia"],
      ["Severe hypertension", "Pregnant woman with severe pre-eclampsia and severe hypertension"],
    ],
    rows: [
      [0, 0, "Magnesium", "all"],
      [1, 1, "Antihypertensive", "pref"],
      [2, 1, "Antihypertensive", "alt", "Labetalol is unsuitable"],
    ],
  },
  {
    id: "suspected-ectopic-pregnancy-ed-pathway",
    branches: [
      ["Medical management of unruptured tubal ectopic pregnancy", "Woman meeting local criteria: less than 8 weeks, mass under 4 cm, hCG under 5,000 units/L"],
      ["Rhesus-negative woman having surgery", "Rhesus-negative woman having surgery for ectopic pregnancy or miscarriage"],
    ],
    rows: [
      [0, 0, "Methotrexate", "all"],
      [1, 1, "Anti-D immunoglobulin", "all"],
    ],
  },
  {
    id: "suspected-meningitis-community-recognition-and-pre-hospital-",
    branches: [
      ["No penicillin allergy", "Adult or child aged 10–17 years with suspected meningococcal disease or bacterial meningitis before hospital transfer"],
      ["Mild penicillin allergy", "Adult with suspected meningitis before transfer and mild penicillin allergy"],
    ],
    rows: [
      [0, 0, "Parenteral antibiotic", "all"],
      [1, 1, "Parenteral antibiotic", "pref"],
      [2, 1, "Parenteral antibiotic", "alt", "Chosen instead of ceftriaxone"],
    ],
  },
  {
    id: "suspected-spinal-cord-compression-red-flags-and-urgent-imagi",
    branches: [
      ["Neurological signs", "Adult with cancer and suspected or confirmed metastatic spinal cord compression with neurological signs"],
      ["Haematological malignancy", "Adult with haematological malignancy and spinal metastases"],
    ],
    rows: [
      [0, 0, "Corticosteroid", "all"],
      [1, 1, "Corticosteroid", "all"],
    ],
  },
  {
    id: "vitamin-d-deficiency-testing-indications-and-treatment",
    branches: [
      ["Loading regimen", "Adult with 25(OH)D below 25 nmol/L"],
      ["Maintenance", "Adult after loading, or with inadequate levels"],
    ],
    rows: [
      [0, 0, "Loading regimen", "pref"],
      [1, 0, "Loading regimen", "alt", "Chosen instead of the weekly option"],
      [2, 1, "Maintenance", "all"],
    ],
  },
];
