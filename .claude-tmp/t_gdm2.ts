import { SRC, cite, reg, type Spec } from "./common.ts";
const G = "gdm.emergency-2026-10-12-v1.json";
const MOH = { title: "MOH Pocket Manual in Obstetrics & Gynaecology, Saudi Ministry of Health", url: "https://www.moh.gov.sa/Documents/MOH%20Pocket%20Manual%20in%20Obstetrics%20and%20Gynaecology.pdf" };
const N = (ed: string) => cite(SRC.NG3, ed);
const M = (ed: string) => cite(MOH, ed);
const met = reg(G, "Metformin", { indication: "Gestational diabetes not at target after 1–2 weeks of diet and exercise (NICE NG3 1.2.19)", sourceEdition: "NICE NG3, Recommendations 1.2.19–1.2.21 (indication); dose from the FDA label as accessed 12 Oct 2026, Section 2" });
const gly = reg(G, "Glyburide", { indication: "Alternative to insulin for glycaemic control in gestational diabetes (Saudi MOH)", sourceEdition: "MOH Pocket Manual 2014, p. 167 (non-insulin therapy); dose from the FDA label as accessed 12 Oct 2026, Section 2" });
const ins = reg(G, "Insulin (rapid", { sourceEdition: "MOH Pocket Manual 2014, p. 167 (insulin therapy); NICE NG3 Recommendations 1.2.20–1.2.22 for when to start; NG3 1.3.12 prefers rapid-acting analogues" });
const ivi = reg(G, "Insulin, soluble", { indication: "Labour or birth with capillary glucose outside 4–7 mmol/L (NICE NG3 1.4.12); MOH: blood sugar above 140 mg/dL in established labour", sourceEdition: "MOH Pocket Manual 2014, p. 170 (labour and delivery); NICE NG3 Recommendations 1.4.10–1.4.12" });
const MC = " Checked against the Saudi MOH Pocket Manual in Obstetrics & Gynaecology (2014) and NICE NG3.";
export const specs: Spec[] = [
{
  key: "gdm-antenatal", draftTitle: "Gestational Diabetes: Antenatal Glucose Management and Delivery Planning", pillar: "Safe Birth", authority: "MOH",
  scope: "Women with gestational diabetes after diagnosis: glucose monitoring and targets, escalation to metformin or insulin, fetal surveillance, timing and mode of birth, glucose control in labour and caesarean, and neonatal glucose checks." + MC + " Sections: MOH pp. 166–171; NG3 recommendations 1.2.9–1.2.23, 1.3.1–1.3.5, 1.3.33–1.3.40, 1.4.1–1.4.12 and 1.5.1–1.5.11.",
  unverified: ["The MOH manual is a 2014 document; whether a newer Saudi national guideline replaced it was not checked.", "NG3 1.3.1–1.3.40 cover all types of diabetes; only the parts that apply to gestational diabetes are used here, and pre-existing diabetes in pregnancy is not covered by this topic.", "Metformin and glyburide doses were reused from the repository's earlier gestational diabetes topic (FDA label) and were not re-opened on 14 Oct 2026; NICE NG3 gives no dose.", "Insulin doses are the MOH total-daily-dose figures; NICE NG3 gives none and titration is specialist work.", "The MOH manual text on fetal testing starting at 32 weeks and a caesarean threshold of 4,750 g was read once and is not cross-checked with a second source.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "Placental hormones raise insulin resistance in the second and third trimester; if insulin secretion does not keep up, maternal glucose rises and crosses to the fetus, which responds with extra insulin and growth (summarised from NG3 1.2.1 and the MOH overview, p. 166).",
    "Good glucose control throughout pregnancy lowers the risk of macrosomia, birth trauma, induction or caesarean, neonatal hypoglycaemia and perinatal death (NG3 1.2.10).",
    "Fasting glucose at diagnosis guides treatment: below 7.0 mmol/L a trial of diet and exercise; 7.0 or above immediate insulin, with or without metformin (NG3 1.2.18, 1.2.22).",
    "Maternal glucose in labour drives neonatal hypoglycaemia, so labour glucose is kept between 4 and 7 mmol/L and newborn glucose is checked 2 to 4 hours after birth (NG3 1.4.10, 1.5.3).",
  ],
  symptoms: ["Usually none; glucose is found by monitoring (NG3 1.2.11).", "Symptoms of hypoglycaemia on insulin: sweating, tremor, confusion (advise to carry fast-acting glucose, NG3 1.3.14).", "Reduced fetal movements or a large-for-dates uterus prompt review (NG3 1.3.34)."],
  signs: ["Capillary glucose readings from self-monitoring against targets (NG3 1.3.5).", "Fetal growth and amniotic fluid volume on ultrasound, estimated fetal weight (NG3 1.3.34).", "Blood pressure and urine protein at every visit as part of routine antenatal care (NG3 1.3.39)."],
  red: [
    "Hyperglycaemia or feeling unwell: test urgently for ketones and seek urgent medical advice (NG3 1.3.22–1.3.23).",
    "Suspected diabetic ketoacidosis: immediate admission to level 2 critical care with obstetric care (NG3 1.3.24).",
    "Fasting plasma glucose 7.0 mmol/L or above at diagnosis: start insulin immediately, with or without metformin (NG3 1.2.22).",
    "Capillary glucose below 4 mmol/L on insulin, or hypoglycaemia that needs help: treat at once and review the dose (NG3 1.3.6).",
  ],
  precip: ["Fasting glucose 7.0 mmol/L or above at diagnosis, or macrosomia or hydramnios with fasting 6.0–6.9 mmol/L (NG3 1.2.22–1.2.23).", "Non-adherence to diet, exercise and monitoring (NG3 1.2.11, 1.2.14).", "Maternal obesity or comorbidity needing anaesthetic assessment in the third trimester (NG3 1.4.8)."],
  diffs: [
    { condition: "Pre-existing type 2 diabetes first found in pregnancy", distinguishingFeatures: "HbA1c measured at diagnosis to identify possible pre-existing type 2 diabetes; follow type 1 or type 2 pathway if confirmed (NG3 1.3.10)." },
    { condition: "Diabetic ketoacidosis", distinguishingFeatures: "Ketonaemia with hyperglycaemia or unwell; level 2 critical care (NG3 1.3.23–1.3.24)." },
    { condition: "Fetal growth restriction with vascular disease", distinguishingFeatures: "Macrovascular disease or nephropathy needs individualised fetal monitoring rather than the routine schedule (NG3 1.3.36)." },
  ],
  criteria: [
    { criterion: "Capillary glucose targets", threshold: "NICE: fasting 5.3, 1 hour after meals 7.8 or 2 hours 6.4 mmol/L; MOH: before meals below 95, 1 hour below 140, 2 hours below 120 mg/dL; MOH also HbA1c below 7% (NG3 1.3.5; MOH pp. 167–168)" },
    { criterion: "Self-monitoring frequency", threshold: "Fasting and 1-hour post-meal daily on diet, tablets or single-dose insulin; fasting, pre-meal, 1-hour post-meal and bedtime daily on multiple daily insulin (NG3 1.3.2–1.3.3)" },
    { criterion: "Escalation", threshold: "Fasting below 7.0 mmol/L: diet and exercise trial; targets missed after 1–2 weeks: metformin; then insulin; fasting 7.0 or above: insulin at once (NG3 1.2.18–1.2.22)" },
    { criterion: "Timing of birth", threshold: "NICE: no later than 40 weeks plus 6 days, earlier if complications; MOH: induction at 39 weeks with good control, as clinically indicated otherwise (NG3 1.4.4–1.4.5; MOH p. 168)" },
    { criterion: "Glucose in labour", threshold: "Hourly capillary glucose, keep 4–7 mmol/L; IV dextrose and insulin if outside range (NG3 1.4.10, 1.4.12)" },
    { criterion: "Newborn", threshold: "Blood glucose at 2 to 4 hours; feed within 30 minutes and every 2–3 hours; pre-feed glucose at least 2.0 mmol/L (NG3 1.5.3, 1.5.9)" },
  ],
  rule_in: [
    { name: "Capillary blood glucose self-monitoring", target: "Woman with gestational diabetes", condition: "Glycaemic control against target", finding: "Readings above target for 1–2 weeks despite diet and exercise: add metformin, then insulin (NG3 1.2.19–1.2.21).", why: "Teach self-monitoring at diagnosis; use the same targets as pre-existing diabetes (NG3 1.2.11–1.2.12, 1.3.5).", normal: "NICE: fasting below 5.3, 1-hour below 7.8, 2-hour below 6.4 mmol/L; MOH: pre-meal below 95, 1-hour below 140, 2-hour below 120 mg/dL", ref: N("Recommendations 1.2.11–1.2.12, 1.3.3 and 1.3.5") },
    { name: "Ultrasound for fetal growth and amniotic fluid volume", target: "Woman with gestational diabetes from 28 to 36 weeks", condition: "Macrosomia and polyhydramnios", finding: "Large fetus or raised fluid volume changes timing of birth and is a reason to consider insulin with fasting 6.0–6.9 mmol/L (NG3 1.2.23, 1.4.7).", why: "NICE offers monitoring every 4 weeks from 28 to 36 weeks; MOH describes growth scans at 28, 32 and 36 weeks (NG3 1.3.34; MOH p. 168).", normal: "Estimated fetal weight within the centile range; normal fluid volume", tier: "firstLineImaging", ref: N("Recommendation 1.3.34; MOH Pocket Manual 2014 p. 168") },
    { name: "HbA1c at diagnosis", target: "Woman newly diagnosed with gestational diabetes", condition: "Possible pre-existing type 2 diabetes", finding: "Raised HbA1c suggests pre-existing diabetes, raising pregnancy risk above 48 mmol/mol (6.5%) (NG3 1.3.9–1.3.10).", why: "Do not use HbA1c routinely to judge control in the second and third trimesters (NG3 1.3.11).", normal: "Below 48 mmol/mol (6.5%)", ref: N("Recommendations 1.3.9–1.3.11") },
  ],
  rule_out: [
    { name: "Blood ketones", target: "Pregnant woman with diabetes who is hyperglycaemic or unwell", condition: "Diabetic ketoacidosis", finding: "Ketonaemia with hyperglycaemia: admit to level 2 critical care (NG3 1.3.23–1.3.24).", why: "Test urgently for ketonaemia whenever a pregnant woman with any form of diabetes is hyperglycaemic or unwell (NG3 1.3.23).", normal: "Blood ketones below 0.6 mmol/L", ref: N("Recommendations 1.3.22–1.3.24") },
    { name: "Neonatal blood glucose", target: "Baby of a woman with diabetes", condition: "Neonatal hypoglycaemia", finding: "Below 2.0 mmol/L on two consecutive readings despite feeding support: tube feeding or intravenous dextrose (NG3 1.5.10).", why: "Test routinely at 2 to 4 hours after birth with a quality-assured method validated for neonates (NG3 1.5.3, 1.5.8).", normal: "At least 2.0 mmol/L before feeds", ref: N("Recommendations 1.5.3, 1.5.8–1.5.10") },
  ],
  steps: [
    { id: "start", title: "First week after diagnosis", timeframe: "Within 1 week", actions: ["Review at the joint diabetes and antenatal clinic within 1 week (NG3 1.2.9).", "Teach self-monitoring, refer to a dietitian and advise regular exercise such as a 30-minute walk after a meal (NG3 1.2.11, 1.2.16–1.2.17; MOH p. 166).", "Measure HbA1c to identify possible pre-existing type 2 diabetes (NG3 1.3.10)."] },
    { id: "targets", title: "Monitor against targets", timeframe: "Daily; review every 1–2 weeks", actions: ["Monitor glucose at the frequency in NG3 1.3.2–1.3.3 and agree individual targets (NG3 1.3.4–1.3.5).", "Keep joint clinic contact every 1–2 weeks (NG3 1.3.38).", "Give information and education at every appointment (NG3 1.3.40)."] },
    { id: "escalate", title: "Escalate treatment", timeframe: "After 1–2 weeks above target", actions: ["Fasting below 7.0 mmol/L: diet and exercise trial; if targets are not met in 1–2 weeks offer metformin; add insulin if still not met; insulin if metformin is unsuitable (NG3 1.2.18–1.2.21).", "Fasting 7.0 mmol/L or above, or 6.0–6.9 with macrosomia or hydramnios: consider immediate insulin with or without metformin (NG3 1.2.22–1.2.23).", "MOH practice: insulin, with glyburide as an alternative (MOH p. 167). Prefer rapid-acting analogues (NG3 1.3.12).", "Advise insulin users to carry fast-acting glucose and to keep capillary glucose above 4 mmol/L (NG3 1.3.6, 1.3.14)."] },
    { id: "fetal", title: "Fetal surveillance", timeframe: "20 weeks; 28 to 36 weeks", actions: ["Ultrasound for fetal anomalies including the heart at 20 weeks (NG3 1.3.33).", "Growth and fluid volume ultrasound every 4 weeks from 28 to 36 weeks (NG3 1.3.34); MOH describes antenatal testing from 32 weeks (p. 168).", "Routine fetal wellbeing tests before 38 weeks are not recommended unless there is a risk of growth restriction (NG3 1.3.35)."] },
    { id: "birth", title: "Plan the birth", timeframe: "Third trimester", actions: ["Discuss timing and mode of birth in the third trimester (NG3 1.4.1).", "Gestational diabetes: birth no later than 40 weeks plus 6 days; consider earlier for complications; offer induction or caesarean if not delivered by then (NG3 1.4.4–1.4.5).", "MOH: induction at 39 weeks with good control; scheduled caesarean for estimated fetal weight above 4,750 g (MOH p. 168).", "Discuss risks and benefits of vaginal birth, induction and caesarean for a macrosomic fetus (NG3 1.4.7).", "Offer anaesthetic assessment in the third trimester for obesity or autonomic neuropathy (NG3 1.4.8)."] },
    { id: "labour", title: "Labour and birth", timeframe: "Throughout labour", actions: ["Check capillary glucose hourly and keep it between 4 and 7 mmol/L (NG3 1.4.10).", "Use intravenous dextrose and insulin if out of range (NG3 1.4.12). MOH: glucose every 2 hours, start insulin infusion above 120 mg/dL, adjust per local protocol (MOH p. 170).", "Caesarean: hold the morning dose, give 5% dextrose, check glucose hourly, insulin infusion for raised glucose (MOH p. 169).", "General anaesthesia: monitor glucose every 30 minutes until fully conscious (NG3 1.4.9)."] },
    { id: "baby", title: "Care of the baby", timeframe: "First 24 hours", actions: ["Keep the baby with the mother unless complications arise (NG3 1.5.2).", "Feed within 30 minutes, then every 2–3 hours; test glucose at 2–4 hours (NG3 1.5.3, 1.5.9).", "Tube feed or give intravenous dextrose only if glucose below 2.0 mmol/L twice, abnormal signs or ineffective feeding (NG3 1.5.10).", "Do not transfer to community care before 24 hours of age with stable glucose and good feeding (NG3 1.5.6)."] },
  ],
  comparison: {
    title: "Saudi MOH Pocket Manual (2014) versus NICE NG3 for antenatal management",
    columns: ["Saudi MOH (2014)", "NICE NG3"],
    rows: [
      { parameter: "Glucose targets", values: ["Before meals below 95; 1 hour below 140; 2 hours below 120 mg/dL; HbA1c below 7% (pp. 167–168)", "Fasting 5.3; 1 hour 7.8; 2 hours 6.4 mmol/L (1.3.5)"] },
      { parameter: "First drug", values: ["Insulin; glyburide as an alternative (p. 167)", "Metformin, then insulin; insulin first at fasting 7.0 or above (1.2.19–1.2.22)"] },
      { parameter: "Fetal testing and growth scans", values: ["Antenatal testing from 32 weeks; growth scans at 28, 32 and 36 weeks (p. 168)", "Growth and fluid every 4 weeks 28–36 weeks; no routine wellbeing tests before 38 weeks (1.3.34–1.3.35)"] },
      { parameter: "Timing of birth", values: ["Induction at 39 weeks with good control (p. 168)", "No later than 40 weeks plus 6 days; earlier for complications (1.4.4–1.4.5)"] },
      { parameter: "Labour glucose", values: ["Check every 2 hours; insulin infusion above 120 mg/dL (p. 170)", "Hourly; keep 4–7 mmol/L (1.4.10)"] },
    ],
    note: "The guidelines disagree on drug order, timing of birth and labour monitoring; follow the local protocol. Conversions: 95 mg/dL is about 5.3 mmol/L, 140 mg/dL about 7.8 mmol/L and 120 mg/dL about 6.7 mmol/L, so the MOH 2-hour target is looser than NICE's 6.4 mmol/L.",
  },
  meds: { status: "source-verified", regimens: [met, gly, ins, ivi], note: "NICE NG3 sets when to add metformin or insulin and the labour glucose range but gives no doses (1.2.19–1.2.22, 1.4.10–1.4.12). Metformin and glyburide doses are from the FDA label as reused from the repository's earlier topic; insulin doses and the labour infusion regimen are the MOH figures (pp. 167, 170). Metformin crosses the placenta; discuss this with the woman. SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Monitor and escalate treatment by fasting glucose and response to 1–2 weeks of diet and exercise.", "Plan the timing and mode of birth, labour glucose control and newborn glucose checks."],
    keyPoints: ["Joint clinic review within 1 week and every 1–2 weeks after.", "Fasting 7.0 mmol/L or above: insulin at once.", "Labour glucose 4–7 mmol/L hourly (NICE); MOH checks every 2 hours.", "Baby glucose at 2–4 hours; feed within 30 minutes."],
    pitfalls: ["Mixing mg/dL and mmol/L targets from the two guidelines.", "Using HbA1c to judge control in the second and third trimesters.", "Delaying insulin when fasting glucose is 7.0 mmol/L or above.", "Discharging the baby before 24 hours or before glucose is stable."],
    refs: [{ ref: MOH, edition: "MOH Pocket Manual in Obstetrics & Gynaecology, 2014", locator: "pp. 166–171" }, { ref: SRC.NG3, edition: "NICE NG3 (recommendations updated 2020)", locator: "Recommendations 1.2.9–1.2.23, 1.3.1–1.3.40, 1.4.1–1.4.12, 1.5.1–1.5.11" }],
  },
  edu: ["Explain that good control lowers the risk of a large baby, birth trauma, induction or caesarean, neonatal hypoglycaemia and stillbirth (NG3 1.2.10).", "Teach glucose checks, fast-acting glucose for hypoglycaemia, and to seek urgent advice if unwell or hyperglycaemic (NG3 1.2.11, 1.3.14, 1.3.22).", "Explain the plan for timing and mode of birth and for feeding the baby soon after birth (NG3 1.4.1, 1.5.9)."],
  life: ["See a dietitian and follow the advised diet (NG3 1.2.16; MOH p. 167).", "Walk about 30 minutes after a meal or exercise regularly (NG3 1.2.17; MOH p. 166).", "Aim for normoglycaemia, no ketosis and adequate weight gain (MOH p. 167)."],
  mdt: ["Joint diabetes and antenatal clinic every 1–2 weeks (NG3 1.3.37–1.3.38).", "Dietitian for every woman (NG3 1.2.16).", "Anaesthetist in the third trimester for obesity or autonomic neuropathy (NG3 1.4.8).", "Neonatal team available around the clock at the delivery hospital (NG3 1.5.1)."],
  discharge: ["Glucose-lowering treatment stopped after birth and glucose checked (NG3 1.6.3; MOH p. 171).", "Baby at least 24 hours old with stable glucose and feeding (NG3 1.5.6).", "Postnatal diabetes test booked (see the postnatal follow-up topic)."],
  follow: "Joint clinic contact every 1–2 weeks to birth, then postnatal glucose test before community transfer and later diabetes testing (NG3 1.3.38, 1.6.8, 1.6.11; MOH p. 171).",
},
{
  key: "gdm-postnatal", draftTitle: "Gestational Diabetes: Postnatal Follow-Up for Type 2 Diabetes Risk", pillar: "Safe Birth", authority: "MOH",
  scope: "Women who had gestational diabetes, after birth and in primary care: stopping treatment, postpartum glucose checks, the 6–13 week diabetes test, annual testing and planning the next pregnancy." + MC + " Sections: MOH pp. 170–171; NG3 recommendations 1.6.3, 1.6.8–1.6.15.",
  unverified: ["The MOH manual is a 2014 document and gives no postpartum OGTT interpretation cut-offs; the diabetes thresholds here are the NICE fasting glucose and HbA1c values.", "NICE and the MOH differ on the diabetes test (fasting glucose 6–13 weeks versus a 75-g OGTT at 6–12 weeks); both are shown and local protocol decides.", "The NICE National Diabetes Prevention Programme is a UK service; the Saudi equivalent was not assessed.", "Contraception choice follows the MOH statement that any method is acceptable without medical contraindication; the UK eligibility criteria were not opened.", "SFDA registration was not assessed; no medicines are recommended in this topic."],
  mech: [
    "Women with gestational diabetes have a markedly higher risk of developing type 2 diabetes after the pregnancy, so structured testing is needed even when glucose returns to normal at birth (summarised from NG3 1.6.9–1.6.14).",
    "Hyperglycaemia usually settles quickly after delivery, so glucose-lowering treatment is stopped immediately after birth (NG3 1.6.3).",
    "Glucose is tested before transfer to community care to exclude persisting hyperglycaemia (NG3 1.6.8).",
    "Women with gestational diabetes may have recurrence in future pregnancies and should be offered early testing then (NG3 1.6.10, 1.6.15).",
  ],
  symptoms: ["Frequent urination, excessive thirst, weight loss or fatigue suggest diabetes; the woman should see her doctor (NG3 1.6.9).", "No symptoms is common; testing is by schedule, not symptoms."],
  signs: ["Weight and BMI at the postnatal review.", "Blood pressure at the postnatal review."],
  red: [
    "Symptoms of hyperglycaemia (polyuria, polydipsia, weight loss, fatigue) after birth: test glucose that day (NG3 1.6.9).",
    "Fasting glucose 7.0 mmol/L or above, or HbA1c 48 mmol/mol (6.5%) or above: likely type 2 diabetes; confirm or refer (NG3 1.6.12–1.6.13).",
    "Persisting hyperglycaemia before transfer to community care: do not discharge without a plan (NG3 1.6.8).",
  ],
  precip: ["Gestational diabetes in the index pregnancy (NG3 1.6.10).", "Overweight or obesity and inactivity.", "Hyperglycaemia needing insulin or tablets in pregnancy."],
  diffs: [
    { condition: "Persisting type 2 diabetes", distinguishingFeatures: "Fasting glucose 7.0 mmol/L or above or HbA1c 48 mmol/mol (6.5%) or above after birth (NG3 1.6.12–1.6.13)." },
    { condition: "High risk of type 2 diabetes (prediabetes)", distinguishingFeatures: "Fasting glucose 6.0–6.9 mmol/L or HbA1c 39–47 mmol/mol (5.7–6.4%) (NG3 1.6.12–1.6.13)." },
    { condition: "Normal glucose", distinguishingFeatures: "Fasting glucose below 6.0 mmol/L or HbA1c below 39 mmol/mol (5.7%); still needs annual testing (NG3 1.6.12–1.6.14)." },
  ],
  criteria: [
    { criterion: "Stop treatment", threshold: "Stop glucose-lowering therapy immediately after birth for gestational diabetes (NG3 1.6.3)" },
    { criterion: "Before community transfer", threshold: "Test glucose to exclude persisting hyperglycaemia (NG3 1.6.8); MOH: glucose checks for 24 hours after vaginal birth and 48 hours after caesarean, keep 140–160 mg/dL (MOH p. 171)" },
    { criterion: "Diabetes test after birth", threshold: "NICE: fasting plasma glucose 6 to 13 weeks, or HbA1c if not possible after 13 weeks; MOH: 75-g 2-hour OGTT at 6–12 weeks (NG3 1.6.11; MOH p. 171)" },
    { criterion: "Fasting glucose result", threshold: "Below 6.0 mmol/L normal, annual test; 6.0–6.9 mmol/L high risk; 7.0 mmol/L or above likely type 2 diabetes, confirm (NG3 1.6.12)" },
    { criterion: "HbA1c result", threshold: "Below 39 mmol/mol (5.7%) normal; 39–47 mmol/mol high risk; 48 mmol/mol (6.5%) or above type 2 diabetes (NG3 1.6.13)" },
    { criterion: "Ongoing testing", threshold: "Annual HbA1c after a negative postnatal test (NG3 1.6.14)" },
  ],
  rule_in: [
    { name: "Fasting plasma glucose", target: "Woman with prior gestational diabetes whose glucose normalised after birth", condition: "Type 2 diabetes or prediabetes", finding: "6.0–6.9 mmol/L high risk; 7.0 mmol/L or above likely type 2 diabetes, confirm with a test (NG3 1.6.12).", why: "Offer 6 to 13 weeks after birth, which may coincide with the 6-week check; offer after 13 weeks if not already done (NG3 1.6.11).", normal: "Below 6.0 mmol/L (108 mg/dL)", ref: N("Recommendations 1.6.11–1.6.12") },
    { name: "HbA1c", target: "Woman after 13 weeks postpartum when fasting glucose is not possible, and for annual review", condition: "Type 2 diabetes or prediabetes", finding: "39–47 mmol/mol high risk; 48 mmol/mol or above type 2 diabetes, refer (NG3 1.6.13).", why: "Annual HbA1c after a negative postnatal test (NG3 1.6.14).", normal: "Below 39 mmol/mol (5.7%)", ref: N("Recommendations 1.6.11, 1.6.13–1.6.14") },
    { name: "75-g 2-hour oral glucose tolerance test", target: "Woman with prior gestational diabetes under Saudi MOH practice", condition: "Type 2 diabetes or impaired glucose tolerance", finding: "Abnormal result establishes diabetes or impaired glucose tolerance; use local postpartum criteria (MOH p. 171).", why: "MOH advises all women with gestational diabetes have this at 6–12 weeks postpartum; NICE uses fasting glucose instead (MOH p. 171; NG3 1.6.11).", normal: "Result interpreted by local postpartum criteria", tier: "specializedAdjunctive", ref: M("MOH Pocket Manual 2014, p. 171") },
  ],
  rule_out: [
    { name: "Blood glucose before community transfer", target: "Woman after gestational diabetes birth", condition: "Persisting hyperglycaemia", finding: "Raised glucose before transfer needs diabetes review (NG3 1.6.8).", why: "MOH checks fasting and after meals for 24 hours after vaginal birth and 48 hours after caesarean, keeping glucose 140–160 mg/dL (MOH p. 171).", normal: "Fasting glucose below 6.0 mmol/L (108 mg/dL)", ref: N("Recommendation 1.6.8; MOH Pocket Manual 2014 p. 171") },
  ],
  steps: [
    { id: "stop", title: "After the birth", timeframe: "Immediately", actions: ["Stop glucose-lowering treatment (NG3 1.6.3).", "Check glucose fasting and after meals for 24 hours after vaginal birth and 48 hours after caesarean; keep 140–160 mg/dL (MOH p. 171).", "Test glucose before transfer to community care (NG3 1.6.8)."] },
    { id: "advise", title: "Advice before discharge", timeframe: "Before discharge", actions: ["Remind the woman of the symptoms of hyperglycaemia (NG3 1.6.9).", "Explain the risk of recurrence and offer diabetes testing when planning future pregnancies (NG3 1.6.10).", "Contraception: any method is acceptable without medical contraindication (MOH p. 171)."] },
    { id: "test", title: "Diabetes test", timeframe: "6 to 13 weeks after birth", actions: ["NICE: fasting plasma glucose at 6–13 weeks, or HbA1c after 13 weeks if fasting is not possible (NG3 1.6.11).", "MOH: 75-g 2-hour OGTT at 6–12 weeks (MOH p. 171).", "Act on the result: below 6.0 mmol/L annual test; 6.0–6.9 high risk and prevention advice; 7.0 or above confirm diabetes (NG3 1.6.12). HbA1c 39–47 high risk, 48 or above refer (NG3 1.6.13)."] },
    { id: "annual", title: "Annual follow-up", timeframe: "Every 12 months", actions: ["Offer annual HbA1c after a negative postnatal test (NG3 1.6.14).", "Advise to see the GP if symptoms of diabetes develop (NG3 1.6.9).", "Refer into the diabetes prevention service if eligible; offer lifestyle advice for high-risk results (NG3 1.6.11–1.6.12)."] },
    { id: "next", title: "Next pregnancy", timeframe: "Before and early in a future pregnancy", actions: ["Offer early self-monitoring of glucose or an OGTT in the next pregnancy, with a second OGTT at 24–28 weeks if normal (NG3 1.6.15, 1.2.6).", "Women with diabetes planning pregnancy should take folic acid; NICE advises 5 mg a day until 12 weeks (NG3 1.1)."] },
  ],
  comparison: {
    title: "Saudi MOH Pocket Manual (2014) versus NICE NG3 postnatal follow-up",
    columns: ["Saudi MOH (2014)", "NICE NG3"],
    rows: [
      { parameter: "Early postnatal glucose", values: ["Fasting and after meals for 24 hours (vaginal) or 48 hours (caesarean); keep 140–160 mg/dL (p. 171)", "Test glucose before transfer to community care (1.6.8)"] },
      { parameter: "Diabetes test", values: ["75-g 2-hour OGTT at 6–12 weeks (p. 171)", "Fasting glucose 6–13 weeks, or HbA1c after 13 weeks (1.6.11)"] },
      { parameter: "Later testing", values: ["Not stated in the manual", "Annual HbA1c after a negative test (1.6.14)"] },
    ],
    note: "The MOH manual gives no cut-offs for the postpartum OGTT; use local criteria. The NICE fasting glucose and HbA1c thresholds apply to the NICE pathway.",
  },
  meds: { status: "no-drug-indicated", regimens: [], note: "No medicine is recommended in this topic. Glucose-lowering therapy for gestational diabetes is stopped immediately after birth (NICE NG3 1.6.3). Medicines for diabetes found at follow-up follow the repository's type 2 diabetes topics." },
  teach: {
    objectives: ["Stop treatment after birth and arrange the correct diabetes test at 6 to 13 weeks.", "Interpret the fasting glucose and HbA1c results and set annual follow-up."],
    keyPoints: ["Stop glucose-lowering therapy immediately after birth.", "NICE: fasting glucose 6–13 weeks; MOH: OGTT 6–12 weeks.", "Fasting 6.0–6.9 or HbA1c 39–47: high risk; 7.0 or 48 and above: diabetes.", "Annual HbA1c after a negative test."],
    pitfalls: ["Continuing metformin or insulin after birth.", "Not testing at all because glucose was normal at discharge.", "Treating the single negative test as permanent reassurance.", "Missing early testing in the next pregnancy."],
    refs: [{ ref: MOH, edition: "MOH Pocket Manual in Obstetrics & Gynaecology, 2014", locator: "pp. 170–171" }, { ref: SRC.NG3, edition: "NICE NG3 (recommendations updated 2020)", locator: "Recommendations 1.6.3 and 1.6.8–1.6.15" }],
  },
  edu: ["Explain that gestational diabetes raises the risk of type 2 diabetes later and that annual testing is needed (NG3 1.6.10, 1.6.14).", "Teach the symptoms of hyperglycaemia and to see the GP if they appear (NG3 1.6.9).", "Explain the need for early glucose testing in future pregnancies (NG3 1.6.15)."],
  life: ["Keep a healthy weight and be physically active, with support if eligible for a diabetes prevention programme (NG3 1.6.11–1.6.12).", "Follow dietary advice from the pregnancy dietitian and extend healthy eating to the family."],
  mdt: ["Primary care for the 6–13 week test and annual HbA1c (NG3 1.6.11, 1.6.14).", "Diabetes service for a confirmed diagnosis (NG3 1.6.12–1.6.13).", "Dietitian or diabetes prevention programme for high-risk results (NG3 1.6.12)."],
  discharge: ["Glucose-lowering treatment stopped and glucose checked before transfer (NG3 1.6.3, 1.6.8).", "Symptom and recurrence advice given (NG3 1.6.9–1.6.10).", "Date of the 6–13 week diabetes test booked (NG3 1.6.11)."],
  follow: "Diabetes test at 6 to 13 weeks (NICE) or 6 to 12 weeks (MOH), then annual HbA1c after a negative result, and early testing in any future pregnancy (NG3 1.6.11, 1.6.14–1.6.15; MOH p. 171).",
},
];
