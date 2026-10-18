import { SRC, cite, reg, type Spec } from "./common";
const F = "t2dm-pathway.authoring-standard-2026-10-12-v1.json";
const S = (ed: string) => cite(SRC.SDCPG, ed);
const N = (ed: string) => cite(SRC.NG28, ed);
const LABEL = (name: string, setid: string) => ({ ref: { title: `${name} prescribing information (US FDA label, DailyMed)`, url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setid}` }, edition: "US FDA label via DailyMed, as accessed 12 Oct 2026 for the repository's type 2 diabetes topics; Section 2 (Dosage and Administration) and Section 4 (Contraindications)", locator: "Section 2 Dosage and Administration; Section 4 Contraindications" });
const labels = [
  LABEL("Metformin hydrochloride", "011de1a5-1ac0-4831-9e8d-26ec79ba2205"), LABEL("Empagliflozin (Jardiance)", "1782b947-4a72-4feb-a488-1469d9af82bd"),
  LABEL("Dapagliflozin (Farxiga)", "01f90c94-71cb-4a1f-81ff-8004b850529b"), LABEL("Semaglutide (Ozempic)", "42bdd912-2393-44c4-b7e0-47672ca28991"),
];
const unverified = [
  "Figure 2 (glycaemic targets) in the Saudi guideline is an image and was not read; target ranges quoted come from its text on pp. 28 and 31.",
  "Medicine doses were reused from the repository's earlier label-checked type 2 diabetes topic and were not re-opened on 14 Oct 2026.",
  "SFDA registration and hospital formulary availability were not independently verified.",
  "Haemoglobin variants are common in the region; the sources give the fructosamine and total glycated haemoglobin alternatives but no local prevalence.",
];

export const specs: Spec[] = [
{
  key: "t2dm-initial", draftTitle: "Type 2 Diabetes: New Diagnosis and Initial Treatment", pillar: "Chronic Care", authority: "SHC",
  scope: "Adults with newly diagnosed type 2 diabetes: confirm the diagnosis, agree an individual HbA1c target, choose initial treatment (including the triggers for insulin) and start safely. Checked against SDCPG 2021 (pp. 20, 28, 31, 35, 42, 46–48) and NICE NG28 (updated 18 Feb 2026, sections 1.2, 1.5, 1.8 and 1.13–1.22).",
  unverified,
  mech: [
    "Insulin resistance with progressive beta-cell failure causes chronic hyperglycaemia; HbA1c reflects average glucose over about 3 months (SDCPG p. 28).",
    "Better control lowers complications: in UKPDS, microvascular events fell 25% and macrovascular events 15% (SDCPG p. 28).",
    "Pushing HbA1c below 7% raises hypoglycaemia and polypharmacy, so the target is individualised (SDCPG p. 28).",
    "Severe hyperglycaemia with catabolic features (weight loss, hypertriglyceridaemia, ketosis) reflects glucose toxicity and responds best to insulin (SDCPG p. 47).",
    "SGLT-2 inhibitors reduce cardiovascular events, heart-failure admissions and kidney failure, so NICE pairs one with metformin from diagnosis (NG28 section 1.13 and its rationale).",
  ],
  symptoms: ["Polyuria and polydipsia suggest glucose toxicity and need early insulin (SDCPG p. 47).", "Weight loss with catabolic features (SDCPG p. 47).", "Often found by screening of at-risk adults rather than by symptoms (SDCPG p. 20)."],
  signs: ["BMI and weight at every visit (SDCPG p. 42).", "Insulin-resistance signs such as acanthosis nigricans (SDCPG p. 20 risk-factor list).", "Frailty, volume depletion or low blood pressure change SGLT-2 inhibitor safety (NG28 1.19.1)."],
  red: [
    "HbA1c above 10% or glucose consistently above 300 mg/dL (16.7 mmol/L): start insulin or a GLP-1 receptor agonist (SDCPG pp. 47–48).",
    "Weight loss, ketosis or hypertriglyceridaemia with severe hyperglycaemia: insulin preferred (SDCPG p. 47).",
    "Previous DKA, intercurrent illness, dehydration risk or a very-low-carbohydrate or ketogenic diet: check before any SGLT-2 inhibitor (NG28 1.21.1).",
    "Ketosis with vomiting or drowsiness is an emergency: use the Diabetic Ketoacidosis topic, not outpatient titration.",
  ],
  precip: ["Overweight or obesity, including abdominal obesity (SDCPG pp. 19–20).", "Age 35 or over (SDCPG p. 20).", "Family history, previous gestational diabetes, PCOS, hypertension, dyslipidaemia or physical inactivity (SDCPG pp. 19–20).", "Diabetogenic drugs: glucocorticoids, atypical antipsychotics, statins, antiretroviral therapy, anti-rejection drugs (SDCPG p. 20)."],
  diffs: [
    { condition: "Prediabetes", distinguishingFeatures: "HbA1c 5.7–6.4% or fasting glucose 100–125 mg/dL: lifestyle prevention, not diabetes treatment (SDCPG p. 20)." },
    { condition: "Type 1 or another diabetes type", distinguishingFeatures: "If response to medicines does not fit type 2 diabetes, revisit the diagnosis (NG28 1.22.3)." },
    { condition: "Drug-induced hyperglycaemia", distinguishingFeatures: "Review glucocorticoids, atypical antipsychotics and other diabetogenic drugs (SDCPG p. 20)." },
  ],
  criteria: [
    { criterion: "Diabetes (any one, confirmed by repeat if asymptomatic)", threshold: "HbA1c 6.5% or more; fasting glucose 126 mg/dL (7 mmol/L) or more; 2-h OGTT glucose 200 mg/dL (11.1 mmol/L) or more; random glucose 200 mg/dL (11.1 mmol/L) or more (SDCPG p. 20, Table 2)" },
    { criterion: "Prediabetes", threshold: "HbA1c 5.7–6.4%; fasting glucose 100 to under 126 mg/dL; 2-h OGTT 140 to under 200 mg/dL (SDCPG p. 20, Table 2)" },
    { criterion: "Individual HbA1c target", threshold: "Most adults below 7%, within a 6.5–8% spectrum (SDCPG pp. 28, 31); NICE 48 mmol/mol (6.5%) on lifestyle or non-hypoglycaemic medicines, 53 mmol/mol (7.0%) on a hypoglycaemia-associated medicine (NG28 1.5.7)" },
    { criterion: "Start dual therapy", threshold: "HbA1c more than 1.5% above target (SDCPG p. 46); NICE offers metformin plus an SGLT-2 inhibitor from diagnosis when there is no relevant comorbidity (NG28 1.13.1)" },
    { criterion: "Insulin at presentation", threshold: "HbA1c above 10%, glucose consistently above 300 mg/dL, or catabolic features (SDCPG pp. 47–48)" },
  ],
  rule_in: [
    { name: "HbA1c", target: "Adult with suspected or new diabetes", condition: "Type 2 diabetes", finding: "6.5% or more diagnoses diabetes; repeat every 3–6 months until stable, then 6-monthly (NG28 1.5.1); SDCPG: at least twice a year when controlled, four times when not (p. 31).", why: "Confirms diagnosis and sets the baseline for the target; if HbA1c is unreliable use fructosamine or total glycated haemoglobin.", normal: "Below 5.7%", ref: S("1st ed. 2021, p. 20, Table 2 (diagnosis) and p. 31 (HbA1c testing frequency)") },
    { name: "Fasting plasma glucose and 75-g OGTT", target: "Adult with suspected diabetes", condition: "Type 2 diabetes", finding: "Fasting 126 mg/dL (7 mmol/L) or more, or 2-h glucose 200 mg/dL (11.1 mmol/L) or more.", why: "Alternative diagnostic tests when HbA1c is invalid or unavailable.", normal: "Fasting below 100 mg/dL (5.6 mmol/L); 2-h below 140 mg/dL (7.8 mmol/L)", ref: S("1st ed. 2021, p. 20, Table 2") },
    { name: "Capillary blood glucose (self-monitoring)", target: "Adult starting treatment", condition: "Glycaemic control and hypoglycaemia", finding: "For HbA1c 7%, fasting 80–130 mg/dL and post-meal peak below 180 mg/dL (SDCPG p. 31).", why: "Not routine on oral drugs alone; offer if on insulin, hypoglycaemic episodes, driving risk with hypoglycaemic drugs, or pregnancy (NG28 1.6.2). Consider short-term use when starting corticosteroids (NG28 1.6.3).", normal: "Fasting below 100 mg/dL (5.6 mmol/L)", ref: N("Recommendations 1.6.2–1.6.3; SDCPG p. 31") },
  ],
  rule_out: [
    { name: "Blood or urine ketones", target: "Adult with weight loss, vomiting or severe hyperglycaemia", condition: "Ketosis, DKA or type 1 diabetes", finding: "Ketosis with weight loss and severe hyperglycaemia: insulin preferred (SDCPG p. 47); poor response to treatment: revisit the diagnosis (NG28 1.22.3).", why: "Separates glucose toxicity from DKA and type 1 diabetes before starting an SGLT-2 inhibitor.", normal: "Not detected", ref: S("1st ed. 2021, p. 47; NG28 Recommendation 1.22.3") },
    { name: "eGFR", target: "Adult before choosing drugs", condition: "Diabetic kidney disease", finding: "eGFR 30 or more: metformin plus SGLT-2 inhibitor; 20 to under 30: dapagliflozin or empagliflozin plus a DPP-4 inhibitor; under 20: consider a DPP-4 inhibitor (NG28 1.18.1–1.18.3). Metformin is safe if eGFR is above 30 (SDCPG p. 46).", why: "Drug choice and dose depend on kidney function; repeat with urine ACR.", normal: "60 mL/min/1.73 m² or more", ref: N("Recommendations 1.18.1–1.18.3; SDCPG p. 46") },
    { name: "Vitamin B12", target: "Adult on long-term metformin", condition: "Metformin-related deficiency and neuropathy", finding: "Prolonged metformin can cause B12 deficiency and worsen neuropathy symptoms (SDCPG p. 46).", why: "Check periodically; replace if low.", normal: "Within the local laboratory reference range", ref: S("1st ed. 2021, p. 46") },
  ],
  steps: [
    { id: "confirm", title: "Confirm and classify", timeframe: "At diagnosis", actions: ["Confirm with Table 2 criteria (SDCPG p. 20); repeat if asymptomatic.", "Look for ketosis, weight loss and other catabolic features, and for diabetogenic drugs (SDCPG pp. 20, 47).", "Record BMI at every visit (SDCPG p. 42)."] },
    { id: "educate", title: "Education and lifestyle", timeframe: "At diagnosis, reinforced yearly", actions: ["Offer structured education at diagnosis with annual reinforcement; group education is the preferred option (NG28 1.2.1, 1.2.4; SDCPG p. 35).", "Aim for more than 5% weight loss; dietary energy deficit of 500–750 kcal/day (SDCPG pp. 35, 42)."] },
    { id: "target", title: "Agree an individual HbA1c target", timeframe: "First review", actions: ["Most adults: below 7% (SDCPG p. 31). NICE: 48 mmol/mol (6.5%) on lifestyle or non-hypoglycaemic drugs; 53 mmol/mol (7.0%) on a hypoglycaemia-associated drug (NG28 1.5.7).", "Consider a relaxed target for older or frailer people, limited life expectancy, high hypoglycaemia risk or major comorbidity (NG28 1.5.9).", "If HbA1c is below target without hypoglycaemia, keep it there (NG28 1.5.10)."] },
    { id: "start", title: "Choose initial treatment by profile", timeframe: "From diagnosis", actions: ["SDCPG: metformin first unless contraindicated; dual therapy if HbA1c is more than 1.5% above target (p. 46).", "NICE: modified-release metformin plus an SGLT-2 inhibitor; if metformin is not tolerated, SGLT-2 inhibitor alone (NG28 1.13.1–1.13.2)."],
      branches: [
        { condition: "Heart failure or living with obesity", actions: ["Same as above: modified-release metformin plus an SGLT-2 inhibitor (NG28 1.14.1, 1.17.1)."] },
        { condition: "Atherosclerotic cardiovascular disease", actions: ["Add subcutaneous semaglutide, up to 1 mg once weekly (NG28 1.15.1)."] },
        { condition: "Early onset type 2 diabetes", actions: ["Metformin plus SGLT-2 inhibitor, and consider adding a GLP-1 receptor agonist or tirzepatide (NG28 1.16.1)."] },
        { condition: "Chronic kidney disease", actions: ["eGFR 30 or more: metformin plus SGLT-2 inhibitor. eGFR 20 to under 30: dapagliflozin or empagliflozin plus a DPP-4 inhibitor. eGFR under 20: consider a DPP-4 inhibitor (NG28 1.18.1–1.18.3)."] },
        { condition: "Frailty", actions: ["Modified-release metformin; add an SGLT-2 inhibitor only if frailty does not risk volume depletion or hypotension (NG28 1.19.1)."] },
      ] },
    { id: "sequence", title: "Introduce one drug at a time", timeframe: "First 1–3 months", actions: ["Introduce medicines stepwise, checking tolerability and effect of each (NG28 1.20.1).", "Start metformin first; add the SGLT-2 inhibitor once metformin is at the maximum tolerated dose (NG28 1.20.2).", "Before an SGLT-2 inhibitor, check DKA risk and fix modifiable risks, for example delay while on a ketogenic diet (NG28 1.21.1–1.21.2).", "Tell people that a ketogenic or very-low-carbohydrate diet raises DKA risk on an SGLT-2 inhibitor (NG28 1.21.3)."] },
    { id: "insulin", title: "Insulin or GLP-1 receptor agonist at presentation", timeframe: "Same day if criteria are met", actions: ["Criteria: HbA1c above 10%, glucose consistently above 300 mg/dL, severe weight loss or osmotic symptoms (SDCPG pp. 47–48).", "Basal insulin 0.1–0.2 units/kg/day if HbA1c is below 8%; 0.2–0.3 units/kg/day if above 8%; titrate by 2 units every third day to the fasting target (SDCPG p. 48).", "With symptoms of hyperglycaemia, consider insulin or a sulfonylurea and review once glucose is in target (NG28 1.8.1)."] },
    { id: "review", title: "Review and escalate", timeframe: "3–6 months", actions: ["HbA1c every 3–6 months until stable, then every 6 months (NG28 1.5.1).", "If the target is not met about 3 months after starting, add a second drug (SDCPG p. 47). If HbA1c rises to 58 mmol/mol (7.5%) or more, reinforce lifestyle and adherence, aim for 53 mmol/mol (7.0%) and intensify (NG28 1.5.8).", "Use the Treatment Intensification topic for the add-on choice."] },
  ],
  meds: { status: "source-verified", regimens: [
    reg(F, "Metformin"), reg(F, "Empagliflozin", { indication: "Initial treatment with metformin, or alone if metformin is not tolerated (NICE NG28 1.13)" }),
    reg(F, "Dapagliflozin", { indication: "Initial treatment with metformin, or alone if metformin is not tolerated (NICE NG28 1.13)" }),
    reg(F, "Semaglutide", { indication: "Type 2 diabetes with atherosclerotic cardiovascular disease (NICE NG28 1.15.1)", frequency: "Once weekly; NICE NG28 covers doses up to 1 mg once weekly only (1.15.1)", duration: "Long term with review (NG28 1.24)" }),
    reg(F, "Basal insulin", { indication: "Insulin at presentation or when oral therapy fails (SDCPG p. 48)" }),
  ], note: "Doses are from the US FDA labels and SDCPG p. 48 as recorded in the repository's earlier type 2 diabetes topic; NICE NG28 gives drug classes and, for semaglutide, a 1 mg weekly ceiling. SFDA registration was not verified. Check hospital formulary." },
  comparison: { title: "Initial treatment: SDCPG 2021 vs NICE NG28 (2026)", columns: ["SDCPG 2021", "NICE NG28 (Feb 2026)"], rows: [
    { parameter: "First-line drug", values: ["Metformin unless contraindicated (p. 46)", "Modified-release metformin plus an SGLT-2 inhibitor (1.13.1)"] },
    { parameter: "When to use two drugs", values: ["HbA1c more than 1.5% above target (p. 46)", "From diagnosis when there is no relevant comorbidity (1.13.1)"] },
    { parameter: "Individual HbA1c target", values: ["Below 7% for most; 6.5–8% spectrum (pp. 28, 31)", "48 mmol/mol (6.5%) or 53 mmol/mol (7.0%) depending on drugs (1.5.7)"] },
    { parameter: "Insulin trigger", values: ["HbA1c above 10% or glucose consistently above 300 mg/dL (pp. 47–48)", "Symptomatic hyperglycaemia: consider insulin or a sulfonylurea (1.8.1)"] },
  ], note: "The sources differ on first-line therapy. Both are shown and not merged; follow the local protocol." },
  teach: {
    objectives: ["Confirm type 2 diabetes with the Saudi diagnostic criteria and set an individual HbA1c target.", "Choose initial treatment by comorbidity and recognise who needs insulin at presentation."],
    keyPoints: ["HbA1c above 10%, glucose above 300 mg/dL or catabolic features: insulin first.", "Check DKA risk before an SGLT-2 inhibitor and warn about ketogenic diets.", "Add drugs one at a time and recheck HbA1c every 3–6 months."],
    pitfalls: ["Starting an SGLT-2 inhibitor in a person on a ketogenic diet or with a recent DKA episode.", "Delaying insulin in a person with catabolic features.", "Applying one HbA1c target to every adult regardless of frailty or hypoglycaemia risk."],
    refs: [{ ref: SRC.SDCPG, edition: "1st ed. 2021", locator: "pp. 20, 28, 31, 35, 42, 46–48" }, { ref: SRC.NG28, edition: "NICE NG28, updated 18 Feb 2026", locator: "Recommendations 1.2, 1.5, 1.8, 1.13–1.22" }, ...labels],
  },
  edu: ["Explain that diabetes is lifelong and that treatment aims to prevent complications.", "Offer a structured group education programme at diagnosis and each year (NG28 1.2.1, 1.2.4)."],
  life: ["Aim for more than 5% weight loss with an energy deficit of 500–750 kcal/day (SDCPG p. 42).", "Ask about ketogenic or very-low-carbohydrate diets before an SGLT-2 inhibitor (NG28 1.21.3)."],
  mdt: ["Dietitian and diabetes educator.", "Endocrinology if insulin is needed at presentation or the diagnosis is uncertain.", "Ophthalmology, podiatry and renal services as complications are found (SDCPG p. 32 team list)."],
  discharge: ["Diagnosis confirmed, target agreed and documented.", "Initial drugs started with tolerability checked and education booked.", "Review date within 3 months."],
  follow: "Review within 3 months, then HbA1c every 3–6 months until stable and every 6 months after (NG28 1.5.1); structured education reinforced each year.",
},
{
  key: "t2dm-intensify", draftTitle: "Type 2 Diabetes: Treatment Intensification and Add-On Therapy", pillar: "Chronic Care", authority: "SHC",
  scope: "Adults with type 2 diabetes above their HbA1c target on initial therapy: optimise first, then choose add-on drugs by comorbidity, start insulin when criteria are met, and review or stop drugs. Checked against SDCPG 2021 (pp. 28, 31, 42, 46–48) and NICE NG28 (updated 18 Feb 2026, sections 1.5–1.8, 1.19–1.31).",
  unverified,
  mech: [
    "Each new non-insulin class added to initial therapy lowers HbA1c by about 0.7–1.0% (SDCPG p. 47).",
    "SGLT-2 inhibitors and GLP-1 receptor agonists are chosen for cardiovascular and kidney benefit as much as for glucose lowering (NG28 section 1.13 preamble).",
    "Insulin, sulfonylureas, thiazolidinediones and glinides add weight; DPP-4 inhibitors and metformin are weight neutral; GLP-1 receptor agonists and SGLT-2 inhibitors lower weight (SDCPG p. 42).",
    "Sulfonylureas and insulin raise hypoglycaemia and fall risk, most importantly in frailty (NG28 1.31.2).",
    "Insulin is indicated whatever the diabetes duration once the criteria are met (SDCPG p. 48).",
  ],
  symptoms: ["Persisting or new polyuria and polydipsia despite treatment (SDCPG p. 47).", "Hypoglycaemic symptoms on a sulfonylurea or insulin (NG28 1.31.2).", "Weight loss or weight gain since starting treatment (SDCPG p. 42)."],
  signs: ["HbA1c at or above 58 mmol/mol (7.5%) on the initial regimen (NG28 1.5.8).", "BMI below 18.5 kg/m² (NG28 1.24.3).", "Injection-site problems that reduce insulin delivery (SDCPG p. 48)."],
  red: [
    "HbA1c above 10%, glucose consistently above 300 mg/dL or catabolic features: do not delay insulin (SDCPG p. 48).",
    "BMI below 18.5 kg/m²: stop GLP-1 receptor agonist or tirzepatide (NG28 1.24.3).",
    "Recurrent or severe hypoglycaemia or impaired awareness on multiple daily insulin: offer intermittently scanned CGM (NG28 1.7.1).",
    "Response that does not fit type 2 diabetes: revisit the diagnosis (NG28 1.22.3).",
  ],
  precip: ["Poor adherence, wrong dose or formulation, or diet drift (NG28 1.22.2).", "Intercurrent illness or starting oral or intravenous corticosteroids (NG28 1.6.3–1.6.4).", "New cardiovascular disease, heart failure or kidney disease (NG28 1.27.1, 1.30.1).", "Weight-gaining drugs (SDCPG p. 42)."],
  diffs: [
    { condition: "Non-adherence or wrong formulation", distinguishingFeatures: "Check doses, formulation, adherence and diet before changing drugs (NG28 1.22.2)." },
    { condition: "Inaccurate HbA1c", distinguishingFeatures: "Disturbed red-cell turnover or abnormal haemoglobin: use fructosamine or total glycated haemoglobin (NG28 1.5.3; SDCPG p. 31)." },
    { condition: "Steroid or illness-related hyperglycaemia", distinguishingFeatures: "Short-term capillary monitoring and review when steroids start or illness occurs (NG28 1.6.3–1.6.4)." },
    { condition: "Type 1 or other diabetes", distinguishingFeatures: "Unexpected response should prompt a diagnosis review (NG28 1.22.3)." },
  ],
  criteria: [
    { criterion: "Intensify therapy", threshold: "HbA1c 58 mmol/mol (7.5%) or higher on the initial regimen: reinforce lifestyle and adherence, aim for 53 mmol/mol (7.0%) and intensify (NG28 1.5.8)" },
    { criterion: "Add a second agent", threshold: "Target not reached about 3 months after initial therapy (SDCPG p. 47)" },
    { criterion: "Start insulin", threshold: "HbA1c above target on 3 or more agents for 3 months or more; HbA1c above 10%; glucose consistently above 300 mg/dL; severe weight loss or osmotic symptoms (SDCPG p. 48)" },
    { criterion: "Stop GLP-1 receptor agonist or tirzepatide", threshold: "BMI below 18.5 kg/m², or no glycaemic benefit and not taken for cardiovascular benefit (NG28 1.24.3–1.24.4)" },
  ],
  rule_in: [
    { name: "HbA1c", target: "Adult on treatment", condition: "Type 2 diabetes control", finding: "At or above 58 mmol/mol (7.5%) on the initial regimen: intensify and aim for 53 mmol/mol (7.0%) (NG28 1.5.8).", why: "Measure every 3–6 months until stable on unchanging therapy, then every 6 months (NG28 1.5.1).", normal: "Below 5.7%", ref: N("Recommendations 1.5.1 and 1.5.8") },
    { name: "eGFR", target: "Adult choosing an add-on drug", condition: "Chronic kidney disease", finding: "Sulfonylurea only if eGFR is 30 or more (NG28 1.30.1); eGFR 20 to under 30: dapagliflozin or empagliflozin plus a DPP-4 inhibitor (1.18.2).", why: "Sets which add-on drugs are suitable; check the product information for renal limits.", normal: "60 mL/min/1.73 m² or more", ref: N("Recommendations 1.18.2 and 1.30.1") },
    { name: "Capillary blood glucose", target: "Adult on insulin or at risk of hypoglycaemia", condition: "Hypoglycaemia and titration", finding: "Fasting 80–130 mg/dL and post-meal below 180 mg/dL correspond to HbA1c 7% (SDCPG p. 31).", why: "Use for insulin titration; review every 2 weeks until readings are near target (SDCPG p. 48). Do a structured assessment at least yearly if self-monitoring (NG28 1.6.5).", normal: "Fasting below 100 mg/dL (5.6 mmol/L)", ref: S("1st ed. 2021, pp. 31 and 48; NG28 Recommendation 1.6.5") },
  ],
  rule_out: [
    { name: "Fructosamine or total glycated haemoglobin", target: "Adult with unreliable HbA1c", condition: "Invalid HbA1c", finding: "Use when disturbed red-cell turnover or an abnormal haemoglobin makes HbA1c unreliable (NG28 1.5.3).", why: "Investigate unexplained gaps between HbA1c and glucose readings; seek specialist advice (NG28 1.5.4).", normal: "Within the local laboratory reference range", ref: N("Recommendations 1.5.3–1.5.4; SDCPG p. 31") },
    { name: "BMI", target: "Adult on a GLP-1 receptor agonist or tirzepatide", condition: "Underweight on treatment", finding: "Below 18.5 kg/m²: stop the GLP-1 receptor agonist or tirzepatide (NG28 1.24.3).", why: "Check at every visit (SDCPG p. 42).", normal: "18.5–24.9 kg/m²", ref: N("Recommendation 1.24.3; SDCPG p. 42") },
  ],
  steps: [
    { id: "optimise", title: "Optimise before adding", timeframe: "Same visit", actions: ["Check adverse effects, doses, formulations, adherence and diet advice before changing drugs (NG28 1.22.2).", "Check that HbA1c is valid and that the diagnosis still fits (NG28 1.5.3, 1.22.3).", "Make the change as a shared decision (NG28 1.22.1)."] },
    { id: "choose", title: "Choose the add-on by profile", timeframe: "When HbA1c is above target", actions: ["SDCPG: for ASCVD, heart failure or CKD prefer a GLP-1 receptor agonist or SGLT-2 inhibitor; otherwise choose by side effects, price and patient preference (p. 47).", "NICE: follow the profile branches below (NG28 1.25–1.31)."],
      branches: [
        { condition: "No relevant comorbidity", actions: ["Add a DPP-4 inhibitor; if contraindicated, not tolerated or ineffective add a sulfonylurea, pioglitazone or insulin (NG28 1.25.1)."] },
        { condition: "Heart failure", actions: ["Add a DPP-4 inhibitor; if not suitable add a sulfonylurea or insulin (NG28 1.26.1)."] },
        { condition: "Atherosclerotic cardiovascular disease", actions: ["If it develops after starting treatment, add subcutaneous semaglutide up to 1 mg weekly (NG28 1.27.1). For glucose, add a sulfonylurea, pioglitazone or insulin (1.27.2)."] },
        { condition: "Early onset or living with obesity", actions: ["Consider a GLP-1 receptor agonist or tirzepatide; for obesity only after at least 3 months of initial therapy (NG28 1.28.1, 1.29.2)."] },
        { condition: "Chronic kidney disease", actions: ["Consider a DPP-4 inhibitor, then pioglitazone, a sulfonylurea (eGFR 30 or more) or insulin (NG28 1.30.1)."] },
        { condition: "Frailty", actions: ["Consider a DPP-4 inhibitor, then pioglitazone, a sulfonylurea or insulin; sulfonylureas and insulin raise hypoglycaemia and fall risk (NG28 1.31.1–1.31.2)."] },
      ] },
    { id: "rules", title: "Combination rules", timeframe: "At each addition", actions: ["Introduce one drug at a time and check tolerability and effect (NG28 1.20.1).", "Start a GLP-1 receptor agonist or tirzepatide once the SGLT-2 inhibitor is at its maximum tolerated dose (NG28 1.20.2).", "Do not offer a GLP-1 receptor agonist or tirzepatide together with a DPP-4 inhibitor (NG28 1.24.6)."] },
    { id: "insulin", title: "Start or add insulin", timeframe: "As soon as criteria are met", actions: ["Criteria: HbA1c above target on 3 or more agents for 3 months or more, HbA1c above 10%, glucose consistently above 300 mg/dL, severe weight loss or osmotic symptoms (SDCPG p. 48).", "Basal insulin 0.1–0.2 units/kg/day if HbA1c is below 8%, 0.2–0.3 units/kg/day if above 8%; titrate by 2 units every third day to the fasting target (SDCPG p. 48).", "Add prandial insulin with the largest meal if post-meal glucose is high despite fasting at target: start 4–5 units or 10% of the basal dose; titrate by 1–2 units or 10% every 2–3 days (SDCPG p. 48).", "Premixed insulin: at least twice and at most three times daily (SDCPG p. 48). Review every 2 weeks until self-monitored glucose is near target (SDCPG p. 48).", "Offer intermittently scanned CGM on multiple daily insulin with recurrent or severe hypoglycaemia, impaired awareness, inability to self-monitor, or a need for 8 or more checks a day (NG28 1.7.1)."] },
    { id: "deprescribe", title: "Review and stop", timeframe: "Each review", actions: ["Consider continuing drugs that helped reach the glycaemic and weight targets (NG28 1.24.1).", "Consider continuing an SGLT-2 inhibitor for cardiovascular or kidney benefit even if it does not help the glucose target (NG28 1.24.2).", "Stop a GLP-1 receptor agonist or tirzepatide if BMI falls below 18.5 kg/m² or if there is no glycaemic benefit and no cardiovascular indication (NG28 1.24.3–1.24.4).", "In frailty, keep the smallest effective number of drugs at the lowest effective dose (NG28 1.19.3)."] },
    { id: "monitor", title: "Monitor", timeframe: "Ongoing", actions: ["HbA1c every 3–6 months until stable, then every 6 months (NG28 1.5.1).", "Do not offer routine self-monitoring unless on insulin, hypoglycaemic episodes, hypoglycaemic drugs while driving or operating machinery, or pregnancy (NG28 1.6.2).", "Check vitamin B12 periodically on prolonged metformin (SDCPG p. 46)."] },
  ],
  meds: { status: "source-verified", regimens: [
    reg(F, "Sitagliptin", { indication: "Add-on without ASCVD or CKD; weight neutral (SDCPG p. 47; NICE NG28 1.25.1)" }), reg(F, "Glimepiride", { indication: "Add-on when a DPP-4 inhibitor is unsuitable; hypoglycaemia and fall risk (NICE NG28 1.25.1, 1.31.2)" }),
    reg(F, "Empagliflozin", { indication: "Add-on for ASCVD, heart failure or CKD (SDCPG p. 47)" }),
    reg(F, "Semaglutide", { indication: "Add-on when ASCVD develops (NICE NG28 1.27.1)", frequency: "Once weekly; NICE NG28 covers doses up to 1 mg once weekly only (1.27.1)", duration: "Long term with review (NG28 1.24)" }),
    reg(F, "Basal insulin", { indication: "Insulin criteria met (SDCPG p. 48)" }),
  ], note: "Pioglitazone is a NICE option (NG28 1.25.1) but no dose is reproduced here without an opened product source. Doses are from the repository's earlier label-checked topic and SDCPG p. 48. SFDA registration was not verified. Check hospital formulary." },
  comparison: { title: "Add-on therapy: SDCPG 2021 vs NICE NG28 (2026)", columns: ["SDCPG 2021", "NICE NG28 (Feb 2026)"], rows: [
    { parameter: "No relevant comorbidity", values: ["Sulfonylurea, TZD, DPP-4 inhibitor, SGLT-2 inhibitor, GLP-1 receptor agonist or basal insulin by side effects, price and preference (p. 47)", "DPP-4 inhibitor first; then sulfonylurea, pioglitazone or insulin (1.25.1)"] },
    { parameter: "ASCVD, heart failure or CKD", values: ["GLP-1 receptor agonist or SGLT-2 inhibitor with proven benefit preferred (p. 47)", "SGLT-2 inhibitor is already in initial therapy; add semaglutide in ASCVD (1.27.1)"] },
    { parameter: "When to add", values: ["Target not met about 3 months after initial therapy (p. 47)", "HbA1c 58 mmol/mol (7.5%) or higher on the initial regimen (1.5.8)"] },
  ], note: "The sources differ. Both are shown and not merged; follow the local protocol." },
  teach: {
    objectives: ["Optimise before intensifying, then pick an add-on that fits the person's comorbidity.", "Start insulin on time using the Saudi criteria and doses."],
    keyPoints: ["Add one drug at a time and recheck HbA1c in 3 months.", "Never combine a GLP-1 receptor agonist or tirzepatide with a DPP-4 inhibitor.", "Do not delay insulin when HbA1c is above 10%, glucose is above 300 mg/dL or there are catabolic features."],
    pitfalls: ["Adding drugs without checking adherence, dose and diet first.", "Using a sulfonylurea or insulin in a frail person without weighing hypoglycaemia and falls.", "Continuing a GLP-1 receptor agonist after BMI falls below 18.5 kg/m²."],
    refs: [{ ref: SRC.SDCPG, edition: "1st ed. 2021", locator: "pp. 28, 31, 42, 46–48" }, { ref: SRC.NG28, edition: "NICE NG28, updated 18 Feb 2026", locator: "Recommendations 1.5–1.8, 1.19–1.31" }, ...labels],
  },
  edu: ["Explain why a second or third drug may be needed and which side effects to report.", "Teach injection technique and site rotation before insulin starts (SDCPG p. 48)."],
  life: ["Revisit diet and activity advice at every intensification (NG28 1.22.2).", "Recheck weight and BMI at each visit (SDCPG p. 42)."],
  mdt: ["Diabetes specialist team if HbA1c stays above target on 3 agents or insulin is started.", "Dietitian; ophthalmology review before rapid HbA1c reduction (NG28 1.20.2 refers to the diabetic retinopathy guideline)."],
  discharge: ["New regimen tolerated with no hypoglycaemia.", "Insulin technique checked and titration plan written.", "Next HbA1c booked for about 3 months."],
  follow: "Review every 2 weeks while titrating insulin until readings are near target (SDCPG p. 48); HbA1c 3 months after any change, then every 3–6 months until stable (NG28 1.5.1).",
},
];
