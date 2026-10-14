import { SRC, cite, reg, type Spec } from "./common.ts";
const G = "gdm.emergency-2026-10-12-v1.json";
const MOH = { title: "MOH Pocket Manual in Obstetrics & Gynaecology, Saudi Ministry of Health", url: "https://www.moh.gov.sa/Documents/MOH%20Pocket%20Manual%20in%20Obstetrics%20and%20Gynaecology.pdf" };
const N = (ed: string) => cite(SRC.NG3, ed);
const M = (ed: string) => cite(MOH, ed);
const met = reg(G, "Metformin", { indication: "Gestational diabetes not at target after 1–2 weeks of diet and exercise (NICE NG3 1.2.19)", sourceEdition: "NICE NG3, Recommendations 1.2.19–1.2.21 (indication); dose from the FDA label as accessed 12 Oct 2026, Section 2" });
const gly = reg(G, "Glyburide", { indication: "Alternative to insulin for glycaemic control in gestational diabetes (Saudi MOH)", sourceEdition: "MOH Pocket Manual 2014, p. 167 (non-insulin therapy); dose from the FDA label as accessed 12 Oct 2026, Section 2" });
const ins = reg(G, "Insulin (rapid", { sourceEdition: "MOH Pocket Manual 2014, p. 167 (insulin therapy); NICE NG3 Recommendations 1.2.20–1.2.22 for when to start" });
export const specs: Spec[] = [
{
  key: "gdm-screening", draftTitle: "Gestational Diabetes: Screening and Diagnosis", pillar: "Safe Birth", authority: "MOH",
  scope: "Pregnant women at booking and at 24–32 weeks: who to test, which test and cut-offs for gestational diabetes in Saudi MOH practice and NICE NG3, glucose targets, first treatment steps and postnatal testing. Checked against the Saudi MOH Pocket Manual in Obstetrics & Gynaecology (2014), pp. 162–163 and 166–167, and NICE NG3 recommendations 1.2.1–1.2.23 and 1.3.5–1.3.6.",
  unverified: ["The MOH manual is a 2014 document; whether a newer Saudi national gestational diabetes guideline replaced it was not checked.", "The MOH screening page gives the glucose tolerance test window as 24–32 weeks, while the diagnostic page uses 24–28 weeks; both are shown and local protocol should decide.", "Metformin and glyburide doses were reused from the repository's earlier gestational diabetes topic (FDA label) and were not re-opened on 14 Oct 2026; NICE NG3 gives no dose.", "Insulin doses are the MOH total-daily-dose figures; NICE NG3 gives no dose and individual titration is specialist work.", "The MOH manual's postnatal testing advice (a 6–12 week OGTT in the repository's earlier topic) was not re-opened; postnatal steps here follow NICE NG3 only.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "Pregnancy raises insulin resistance; when pancreatic insulin response cannot compensate, glucose rises and gestational diabetes develops (summarised from NG3 1.2.1 and the MOH overview, p. 166).",
    "Uncontrolled glucose raises the risk of macrosomia, shoulder dystocia, birth trauma, induction or caesarean section, neonatal hypoglycaemia and perinatal death (NG3 1.2.1, 1.2.10).",
    "Risk factors identified at booking are BMI 30 kg/m² or more, previous macrosomic baby of 4.5 kg or more, previous gestational diabetes, a first-degree relative with diabetes, and an ethnicity with a high prevalence of diabetes (NG3 1.2.2).",
    "Overt diabetes in early pregnancy needs to be separated from gestational diabetes: MOH uses fasting glucose above 126 mg/dL, random above 200 mg/dL or HbA1c above 6.5% before 13 weeks (MOH p. 166).",
  ],
  symptoms: ["Usually none; most women are found by screening (NG3 1.2.2, MOH p. 162).", "Glycosuria of 2+ or above once, or 1+ or above on two or more occasions at routine testing prompts further testing (NG3 1.2.4)."],
  signs: ["BMI at booking and previous obstetric history for macrosomia (NG3 1.2.2).", "Fundal height or scan suggesting a large baby or polyhydramnios in later pregnancy (NG3 1.2.23)."],
  red: [
    "Fasting plasma glucose 7.0 mmol/L or above at diagnosis: start insulin immediately, with or without metformin, and begin diet and exercise changes (NG3 1.2.22).",
    "Fasting glucose 6.0–6.9 mmol/L with macrosomia or hydramnios: consider immediate insulin (NG3 1.2.23).",
    "Overt diabetes values at booking (fasting above 126 mg/dL, random above 200 mg/dL, HbA1c above 6.5%): manage as pre-existing diabetes (MOH p. 166).",
    "Review at the joint diabetes and antenatal clinic within 1 week of diagnosis (NG3 1.2.9).",
  ],
  precip: ["BMI 30 kg/m² or more (NG3 1.2.2).", "Previous macrosomic baby of 4.5 kg or more, or previous gestational diabetes (NG3 1.2.2).", "First-degree relative with diabetes or an ethnicity with a high prevalence of diabetes (NG3 1.2.2)."],
  diffs: [
    { condition: "Overt (pre-existing) diabetes", distinguishingFeatures: "MOH before 13 weeks: fasting above 126, random above 200 mg/dL or HbA1c above 6.5%; OGTT 2-hour above 200 mg/dL (MOH pp. 166–167)." },
    { condition: "Gestational diabetes", distinguishingFeatures: "MOH OGTT: fasting 92–125, 1-hour above 180 or 2-hour 153–199 mg/dL, any one value; NICE: fasting 5.6 or 2-hour 7.8 mmol/L or above (MOH p. 167; NG3 1.2.8)." },
    { condition: "Glycosuria from a lowered renal threshold", distinguishingFeatures: "Glycosuria alone does not diagnose; test with an OGTT (NG3 1.2.4)." },
  ],
  criteria: [
    { criterion: "Saudi MOH booking test (before 13 weeks)", threshold: "Gestational diabetes: fasting 95–125 mg/dL; overt diabetes: fasting above 126, random above 200 mg/dL or HbA1c above 6.5% (MOH p. 166)" },
    { criterion: "Saudi MOH screening", threshold: "Non-fasting 50-g 1-hour glucose challenge for all women; below 7.8 mmol/L repeat at 24–28 weeks; above 7.8 mmol/L do a glucose tolerance test (MOH pp. 162–163)" },
    { criterion: "Saudi MOH diagnosis (75-g OGTT, 24–28 weeks)", threshold: "Fasting 92–125, 1-hour above 180 or 2-hour 153–199 mg/dL; one or more abnormal values establishes the diagnosis (MOH p. 167)" },
    { criterion: "NICE NG3 testing", threshold: "75-g 2-hour OGTT for women with a risk factor: at 24–28 weeks, or after booking and again at 24–28 weeks if previous gestational diabetes (NG3 1.2.5–1.2.7)" },
    { criterion: "NICE NG3 diagnosis", threshold: "Fasting plasma glucose 5.6 mmol/L or above, or 2-hour plasma glucose 7.8 mmol/L or above (NG3 1.2.8)" },
    { criterion: "Glucose targets", threshold: "MOH: before meals below 95, 1 hour below 140, 2 hours below 120 mg/dL; NICE: fasting 5.3, 1 hour 7.8 or 2 hours 6.4 mmol/L (MOH pp. 166–167; NG3 1.3.5)" },
  ],
  rule_in: [
    { name: "75-g 2-hour oral glucose tolerance test (OGTT)", target: "Pregnant woman with a risk factor, or after a positive screen", condition: "Gestational diabetes", finding: "MOH: fasting 92–125, 1-hour above 180 or 2-hour 153–199 mg/dL; NICE: fasting 5.6 mmol/L or above or 2-hour 7.8 mmol/L or above (MOH p. 167; NG3 1.2.8).", why: "Fast overnight; offer at 24–28 weeks, or early after booking and again at 24–28 weeks if gestational diabetes in a previous pregnancy (NG3 1.2.5–1.2.7).", normal: "MOH: fasting below 92, 1-hour below 180, 2-hour below 153 mg/dL; NICE: fasting below 5.6 and 2-hour below 7.8 mmol/L", ref: M("MOH Pocket Manual 2014, pp. 166–167") },
    { name: "50-g 1-hour glucose challenge test (non-fasting)", target: "All pregnant women under MOH practice", condition: "Gestational diabetes screening", finding: "Above 7.8 mmol/L (140 mg/dL) leads to an OGTT; below 7.8 mmol/L is repeated at 24–28 weeks (MOH pp. 162–163).", why: "NICE does not use a glucose challenge test to assess risk (NG3 1.2.3), so this is a Saudi MOH step shown for local use.", normal: "Below 7.8 mmol/L (140 mg/dL)", ref: M("MOH Pocket Manual 2014, pp. 162–163") },
    { name: "Booking fasting glucose, random glucose and HbA1c", target: "Women at the first perinatal visit before 13 weeks", condition: "Overt diabetes versus early gestational diabetes", finding: "Fasting 95–125 mg/dL suggests gestational diabetes; fasting above 126, random above 200 mg/dL or HbA1c above 6.5% suggests overt diabetes (MOH p. 166).", why: "Separates women who need diabetes care from the start; NICE advises these tests are not used to assess risk of developing gestational diabetes (NG3 1.2.3).", normal: "Fasting below 95 mg/dL; HbA1c below 6.5%", ref: M("MOH Pocket Manual 2014, p. 166") },
  ],
  rule_out: [
    { name: "Reagent-strip urine glucose", target: "Pregnant woman at routine antenatal visits", condition: "Glycosuria prompting testing", finding: "2+ or above on one occasion, or 1+ or above on two or more occasions: consider further testing (NG3 1.2.4).", why: "Urinalysis alone must not be used to assess risk of gestational diabetes (NG3 1.2.3).", normal: "Negative", ref: N("Recommendations 1.2.3–1.2.4") },
    { name: "Capillary glucose self-monitoring", target: "Woman diagnosed with gestational diabetes", condition: "Glycaemic control", finding: "MOH: before meals below 95, 1 hour below 140, 2 hours below 120 mg/dL; NICE: fasting 5.3, 1 hour 7.8, 2 hours 6.4 mmol/L (MOH pp. 166–167; NG3 1.3.5).", why: "Teach self-monitoring at diagnosis and use targets to decide when to add metformin or insulin (NG3 1.2.11, 1.2.19–1.2.21).", normal: "Meet the targets without problematic hypoglycaemia", tier: "specializedAdjunctive", ref: N("Recommendations 1.2.11, 1.2.12 and 1.3.5") },
  ],
  steps: [
    { id: "risk", title: "Assess risk and choose the pathway", timeframe: "At the booking visit", actions: ["Record BMI, prior macrosomia, prior gestational diabetes, family history and ethnicity (NG3 1.2.2).", "Saudi MOH practice: test fasting and random glucose and HbA1c before 13 weeks and give a 50-g glucose challenge test to all women (MOH pp. 162–163, 166).", "Do not use fasting glucose, random glucose, HbA1c, challenge test or urinalysis to assess risk when following NICE (NG3 1.2.3)."] },
    { id: "test", title: "Test and diagnose", timeframe: "24–28 weeks, or early if previous gestational diabetes", actions: ["Do a 75-g 2-hour OGTT after an overnight fast (NG3 1.2.5, MOH p. 167).", "Previous gestational diabetes: offer early self-monitoring or an OGTT soon after booking, and a second OGTT at 24–28 weeks if the first is normal (NG3 1.2.6).", "Diagnose using the local criteria shown in the comparison table; one abnormal MOH value is enough (MOH p. 167)."] },
    { id: "start", title: "First week after diagnosis", timeframe: "Within 1 week", actions: ["Review at the joint diabetes and antenatal clinic within 1 week and tell the primary care team (NG3 1.2.9).", "Explain implications, teach self-monitoring, refer to a dietitian and advise exercise such as a 30-minute walk after a meal (NG3 1.2.10–1.2.11, 1.2.16–1.2.17; MOH p. 167)."] },
    { id: "treat", title: "Choose first treatment by fasting glucose", timeframe: "At diagnosis and at 1–2 weeks", actions: ["Fasting below 7.0 mmol/L: trial of diet and exercise (NG3 1.2.18).", "Targets not met in 1–2 weeks: offer metformin; insulin if metformin is not suitable or targets are still not met (NG3 1.2.19–1.2.21).", "Fasting 7.0 mmol/L or above: immediate insulin with or without metformin (NG3 1.2.22).", "Fasting 6.0–6.9 mmol/L with macrosomia or hydramnios: consider immediate insulin (NG3 1.2.23).", "MOH practice: glyburide is a suitable alternative to insulin (MOH p. 167)."] },
    { id: "post", title: "Postnatal", timeframe: "After birth", actions: ["Stop glucose-lowering treatment immediately after birth (NG3 1.6.3).", "Test glucose to exclude persisting hyperglycaemia before transfer to community care and remind the woman of hyperglycaemia symptoms (NG3 1.6.8–1.6.9).", "Fasting plasma glucose 6 to 13 weeks after birth (HbA1c if that is not possible): below 6.0 mmol/L needs an annual test, 6.0–6.9 mmol/L is high risk of type 2 diabetes, 7.0 mmol/L or above needs a confirmatory test (NG3 1.6.11–1.6.12).", "Offer annual HbA1c after a negative postnatal test and early self-monitoring or OGTT in future pregnancies (NG3 1.6.14–1.6.15)."] },
  ],
  comparison: {
    title: "Saudi MOH Pocket Manual (2014) versus NICE NG3 (2015, updated 2020)",
    columns: ["Saudi MOH (2014)", "NICE NG3"],
    rows: [
      { parameter: "Who is tested", values: ["All women: 50-g non-fasting challenge, then OGTT if above 7.8 mmol/L (pp. 162–163)", "Women with a risk factor only (1.2.2, 1.2.5)"] },
      { parameter: "Early pregnancy test", values: ["Fasting, random glucose and HbA1c before 13 weeks (p. 166)", "Not used to assess risk (1.2.3); early OGTT only if previous gestational diabetes (1.2.6)"] },
      { parameter: "OGTT diagnostic values", values: ["Fasting 92, 1-hour 180, 2-hour 153 mg/dL; any one value (p. 167)", "Fasting 5.6 or 2-hour 7.8 mmol/L (1.2.8)"] },
      { parameter: "Glucose targets", values: ["Before meals below 95; 1 hour below 140; 2 hours below 120 mg/dL (pp. 166–167)", "Fasting 5.3; 1 hour 7.8; 2 hours 6.4 mmol/L (1.3.5)"] },
      { parameter: "First drug after diet and exercise", values: ["Insulin; glyburide as an alternative (p. 167)", "Metformin, then insulin (1.2.19–1.2.21)"] },
    ],
    note: "The two guidelines disagree on cut-offs and who is tested; follow the local protocol. 92 mg/dL is about 5.1 mmol/L, 153 mg/dL about 8.5 mmol/L and 180 mg/dL about 10.0 mmol/L, so the MOH fasting and 2-hour cut-offs are lower than NICE's and will label more women.",
  },
  meds: { status: "source-verified", regimens: [met, gly, ins], note: "NICE NG3 sets when to add metformin or insulin but gives no doses (1.2.19–1.2.22). Metformin and glyburide doses are from the FDA label as reused from the repository's earlier topic; insulin doses are the MOH total daily dose per kilogram by trimester (p. 167). Metformin crosses the placenta; discuss this with the woman. SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Choose and time the correct glucose test and state the diagnostic cut-offs under local practice.", "Match first treatment to the fasting glucose at diagnosis."],
    keyPoints: ["MOH: any one abnormal value of fasting 92, 1-hour 180 or 2-hour 153 mg/dL diagnoses; NICE: fasting 5.6 or 2-hour 7.8 mmol/L.", "Review within 1 week; dietitian for all.", "Fasting 7.0 mmol/L or above: start insulin at once.", "Stop treatment after birth and test again."],
    pitfalls: ["Mixing mg/dL and mmol/L cut-offs between the two guidelines.", "Relying on urine glucose or HbA1c to rule gestational diabetes out.", "Missing the early OGTT for a woman with previous gestational diabetes.", "Continuing metformin or insulin after delivery."],
    refs: [{ ref: MOH, edition: "MOH Pocket Manual in Obstetrics & Gynaecology, 2014", locator: "pp. 162–163 and 166–167" }, { ref: SRC.NG3, edition: "NICE NG3 (recommendations updated 2020)", locator: "Recommendations 1.2.1–1.2.23 and 1.3.5–1.3.6" }],
  },
  edu: ["Explain that most women with gestational diabetes need tablets or insulin as well as diet and exercise, and that control lowers risk of birth complications (NG3 1.2.1, 1.2.10).", "Teach how to check capillary glucose and what targets to aim for (NG3 1.2.11, 1.3.5)."],
  life: ["Meet a dietitian and follow the advised diet (NG3 1.2.16; MOH p. 167).", "Walk about 30 minutes after a meal or exercise regularly (NG3 1.2.17; MOH p. 166)."],
  mdt: ["Joint diabetes and antenatal clinic within 1 week (NG3 1.2.9).", "Dietitian for every woman with gestational diabetes (NG3 1.2.16).", "Primary care team informed of the diagnosis (NG3 1.2.9)."],
  discharge: ["Postnatal glucose test done and glucose-lowering treatment stopped (NG3 1.6.3, 1.6.8).", "Woman understands symptoms of hyperglycaemia and recurrence risk (NG3 1.6.9–1.6.10).", "Fasting glucose booked at 6 to 13 weeks and annual HbA1c after a negative test (NG3 1.6.11, 1.6.14)."],
  follow: "Joint clinic review within 1 week of diagnosis; monitor glucose against targets with review at 1–2 weeks for treatment escalation; postnatal glucose test before community transfer and annual HbA1c after a negative test (NG3 1.2.9, 1.2.19, 1.6).",
},
];
