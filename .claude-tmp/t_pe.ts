import { SRC, cite, reg, type Spec } from "./common.ts";
const HD = "hdp.emergency-2026-10-12-v1.json";
const N = (ed: string) => cite(SRC.NG133, ed);
const asp = reg(HD, "Aspirin", {
  indication: "Prevention of pre-eclampsia: one high-risk factor or more than one moderate-risk factor (NICE NG133 1.1.2–1.1.3)",
  patientGroup: "Pregnant women at high risk (previous hypertensive disease in pregnancy, chronic kidney disease, autoimmune disease, type 1 or 2 diabetes, chronic hypertension) or with more than one moderate-risk factor",
  dose: "75–150 mg", route: "PO", frequency: "Once daily", duration: "From 12 weeks of pregnancy until birth of the baby",
  adjustments: ["Aspirin for this indication was not UK-licensed at NG133 publication (June 2019); prescribe it and check the product information for use in pregnancy", "Local dose within 75–150 mg set by the unit protocol"],
  monitoring: ["Bleeding", "Blood pressure and urine protein at each antenatal visit", "Symptoms of pre-eclampsia"],
  sourceEdition: "NICE NG133, Recommendations 1.1.2–1.1.3 and 1.3.11",
});
export const specs: Spec[] = [
{
  key: "pe-prevention", draftTitle: "Pre-Eclampsia: Antenatal Risk Assessment and Aspirin Prophylaxis", pillar: "Safe Birth", authority: "NICE",
  scope: "Pregnant women booking for antenatal care: who is at high or moderate risk of pre-eclampsia, who should take aspirin from 12 weeks, symptoms to report, how to assess proteinuria, and when to admit. Checked against NICE NG133 recommendations 1.1, 1.2, 1.3.11, 1.4.1–1.4.4 and 1.5.2.",
  unverified: ["No Saudi obstetric hypertension guideline was opened for this version; thresholds and drug doses are NICE NG133. The repository's emergency hypertensive-disorders topic cites the Saudi MOH Pocket Manual, which was not re-opened here.", "NG133's definitions section was not used; the topic gives treatment thresholds only as stated in the recommendations.", "Aspirin dose range was reused from the repository's earlier hypertensive-disorders topic and cross-checked with NG133 1.1.2; the product label was not re-opened.", "Local aspirin dose within 75–150 mg, PLGF test availability and fullPIERS or PREP-S use in Saudi hospitals were not assessed.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "Pre-eclampsia is a hypertensive disorder of pregnancy with new hypertension and proteinuria or other organ involvement; it can progress to eclampsia, HELLP syndrome, pulmonary oedema and fetal compromise (NG133 1.5.2, 1.5.3).",
    "Risk concentrates in women with prior hypertensive disease in pregnancy, chronic kidney disease, autoimmune disease, diabetes or chronic hypertension (high risk), or more than one moderate factor such as nulliparity, age 40 or older, interval over 10 years, BMI 35 or more, family history or multi-fetal pregnancy (NG133 1.1.2–1.1.3).",
    "Low-dose aspirin from 12 weeks until birth is the only drug NG133 advises for prevention; diuretics, low molecular weight heparin, progesterone and nitric oxide donors are not used for prevention (NG133 1.1.2–1.1.4).",
    "Proteinuria must be quantified and interpreted with the clinical picture, because a positive dipstick alone does not confirm pre-eclampsia (NG133 1.2.1–1.2.3).",
  ],
  symptoms: ["Severe headache (NG133 1.1.1).", "Problems with vision such as blurring or flashing before the eyes (NG133 1.1.1).", "Severe pain just below the ribs (NG133 1.1.1).", "Vomiting (NG133 1.1.1).", "Sudden swelling of the face, hands or feet (NG133 1.1.1)."],
  signs: ["Blood pressure at every antenatal visit, with urine dipstick for protein (NG133 1.2.2).", "Sustained systolic blood pressure of 160 mmHg or higher is a reason to admit (NG133 1.5.2).", "Signs of impending eclampsia or pulmonary oedema (NG133 1.5.2)."],
  red: [
    "Severe headache, visual disturbance, severe pain below the ribs, vomiting or sudden swelling: see a healthcare professional immediately (NG133 1.1.1).",
    "Sustained systolic pressure of 160 mmHg or higher: admit for surveillance (NG133 1.5.2).",
    "New and persistent creatinine 90 micromol/L or more, ALT over 70 IU/L (or twice the upper limit of normal) or platelets under 150,000/microlitre: admit (NG133 1.5.2).",
    "Signs of impending eclampsia, impending pulmonary oedema or suspected fetal compromise: admit (NG133 1.5.2).",
  ],
  precip: ["Hypertensive disease in a previous pregnancy, chronic kidney disease, autoimmune disease, type 1 or 2 diabetes, chronic hypertension (high risk, NG133 1.1.2).", "Nulliparity, age 40 or older, pregnancy interval over 10 years, BMI 35 kg/m² or more at first visit, family history of pre-eclampsia, multi-fetal pregnancy (moderate risk, NG133 1.1.3)."],
  diffs: [
    { condition: "Chronic hypertension", distinguishingFeatures: "Pre-existing hypertension; offer aspirin 75–150 mg from 12 weeks and specialist referral (NG133 1.3.1, 1.3.11)." },
    { condition: "Gestational hypertension", distinguishingFeatures: "New hypertension in pregnancy without pre-eclampsia features; assess in secondary care (NG133 1.4.1, 1.4.3)." },
    { condition: "Pre-eclampsia", distinguishingFeatures: "Hypertension with significant proteinuria or other organ involvement; assessed by a clinician trained in hypertensive disorders of pregnancy (NG133 1.5.1–1.5.2)." },
  ],
  criteria: [
    { criterion: "High risk: advise aspirin", threshold: "Any one of: previous hypertensive disease in pregnancy, chronic kidney disease, autoimmune disease (SLE, antiphospholipid syndrome), type 1 or 2 diabetes, chronic hypertension (NG133 1.1.2)" },
    { criterion: "Moderate risk: advise aspirin", threshold: "More than one of: nulliparity, age 40 or older, interval over 10 years, BMI 35 kg/m² or more, family history of pre-eclampsia, multi-fetal pregnancy (NG133 1.1.3)" },
    { criterion: "Significant proteinuria", threshold: "Protein:creatinine ratio 30 mg/mmol or more; albumin:creatinine ratio 8 mg/mmol or more as a diagnostic threshold in hypertensive women (NG133 1.2.6–1.2.7)" },
    { criterion: "Treat gestational hypertension", threshold: "Offer pharmacological treatment if blood pressure remains above 140/90 mmHg; all women with severe hypertension; target 135/85 mmHg or less (NG133 Table 1)" },
    { criterion: "Admit with pre-eclampsia", threshold: "Sustained systolic 160 mmHg or higher; creatinine 90 micromol/L or more; ALT over 70 IU/L; platelets under 150,000/microlitre; impending eclampsia or pulmonary oedema; fetal compromise (NG133 1.5.2)" },
  ],
  rule_in: [
    { name: "Urine dipstick (automated reader) then protein:creatinine or albumin:creatinine ratio", target: "Pregnant woman with hypertension or symptoms", condition: "Significant proteinuria", finding: "Dipstick 1+ or more needs a ratio; PCR 30 mg/mmol or more, or ACR 8 mg/mmol or more, is significant (NG133 1.2.3, 1.2.6–1.2.7).", why: "Do not use a first morning void or routine 24-hour collection; interpret with a full clinical review (NG133 1.2.1, 1.2.4–1.2.5).", normal: "PCR below 30 mg/mmol; ACR below 8 mg/mmol", ref: N("Recommendations 1.2.1–1.2.7") },
    { name: "Full blood count, liver function and renal function", target: "Woman with gestational hypertension or pre-eclampsia", condition: "Organ involvement", finding: "Creatinine 90 micromol/L or more, ALT over 70 IU/L or platelets under 150,000/microlitre that is new and persistent leads to admission (NG133 1.5.2).", why: "Measure at presentation and then weekly in gestational hypertension (NG133 Table 1).", normal: "Creatinine below 90 micromol/L; ALT under 70 IU/L; platelets 150,000–450,000/microlitre", ref: N("Recommendation 1.4.3 (Table 1) and 1.5.2") },
    { name: "Placental growth factor (PLGF)-based testing", target: "Woman with suspected pre-eclampsia between 20 weeks and 36 weeks 6 days", condition: "Pre-eclampsia rule-out", finding: "Used to help rule out pre-eclampsia; follow NICE diagnostics guidance on interpretation (NG133 1.4.4).", why: "Carry out on one occasion if pre-eclampsia is suspected in gestational hypertension (NG133 Table 1).", normal: "Result interpreted by the assay-specific NICE cut-offs", tier: "specializedAdjunctive", ref: N("Recommendation 1.4.4; Table 1") },
  ],
  rule_out: [
    { name: "Fetal ultrasound assessment", target: "Woman with gestational hypertension or pre-eclampsia", condition: "Fetal growth restriction and fetal compromise", finding: "Repeat every 2–4 weeks if normal and clinically indicated; every 2 weeks if severe hypertension persists (NG133 Table 1).", why: "Offer fetal heart auscultation at every antenatal appointment; CTG only if clinically indicated (NG133 Table 1).", normal: "Normal estimated fetal weight and amniotic fluid", tier: "firstLineImaging", ref: N("Recommendation 1.4.3 (Table 1)") },
    { name: "fullPIERS or PREP-S risk prediction", target: "Woman with pre-eclampsia", condition: "Risk of adverse maternal outcome", finding: "A high-risk result guides place of care and thresholds for intervention; PREP-S is for use only up to 34 weeks (NG133 1.5.3–1.5.4).", why: "Consider using either validated model to help decide place of care, such as in utero transfer (NG133 1.5.3).", normal: "Low predicted risk of adverse outcome", tier: "specializedAdjunctive", ref: N("Recommendations 1.5.3–1.5.4") },
  ],
  steps: [
    { id: "risk", title: "Risk assessment at booking", timeframe: "At the first antenatal visit", actions: ["Record each high-risk and moderate-risk factor (NG133 1.1.2–1.1.3).", "Women with chronic hypertension: offer referral to a specialist in hypertensive disorders of pregnancy; stop ACE inhibitors or ARBs preferably within 2 working days of notification of pregnancy and offer alternatives (NG133 1.3.1, 1.3.3)."] },
    { id: "aspirin", title: "Advise aspirin", timeframe: "From 12 weeks until birth", actions: ["Advise aspirin 75–150 mg daily if one high-risk factor is present (NG133 1.1.2).", "Advise aspirin 75–150 mg daily if more than one moderate-risk factor is present (NG133 1.1.3).", "Women with chronic hypertension: offer aspirin 75–150 mg once daily from 12 weeks (NG133 1.3.11)."] },
    { id: "not-prevent", title: "What not to use for prevention", timeframe: "At counselling", actions: ["Do not use nitric oxide donors, progesterone, diuretics or low molecular weight heparin to prevent hypertensive disorders (NG133 1.1.4).", "Do not recommend magnesium, folic acid, vitamins C and E, fish oil or garlic solely for prevention, and do not advise salt restriction solely for prevention (NG133 1.1.5–1.1.6)."] },
    { id: "symptoms", title: "Teach symptoms and monitor", timeframe: "Every antenatal visit", actions: ["Advise to attend immediately for severe headache, visual disturbance, severe subcostal pain, vomiting or sudden swelling (NG133 1.1.1).", "Measure blood pressure and test urine with an automated dipstick reader in secondary care; quantify any 1+ or more with PCR or ACR (NG133 1.2.2–1.2.3)."] },
    { id: "gh", title: "If hypertension develops", timeframe: "At diagnosis", actions: ["Assess in secondary care by a clinician trained in hypertensive disorders of pregnancy (NG133 1.4.1).", "Treat if blood pressure stays above 140/90 mmHg; admit and treat all women with severe hypertension; aim for 135/85 mmHg or less (NG133 Table 1).", "Blood tests at presentation then weekly; PLGF test once if pre-eclampsia is suspected (NG133 Table 1)."] },
    { id: "admit", title: "Admission triggers in pre-eclampsia", timeframe: "Each appointment", actions: ["Offer admission for sustained systolic 160 mmHg or higher, new and persistent creatinine, ALT or platelet abnormality, impending eclampsia or pulmonary oedema, or suspected fetal compromise (NG133 1.5.2).", "Consider fullPIERS or PREP-S to guide place of care (NG133 1.5.3)."] },
  ],
  meds: { status: "source-verified", regimens: [asp], note: "NICE NG133 advises aspirin 75–150 mg daily from 12 weeks until birth for women at high risk or with more than one moderate-risk factor (1.1.2–1.1.3). Aspirin for this indication was not UK-licensed at publication in June 2019; prescribe it. Antihypertensive drug choice is covered in the repository's hypertensive-disorders emergency topic. SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Classify a woman as high risk or moderate risk and advise aspirin from 12 weeks.", "Quantify proteinuria correctly and name the admission triggers."],
    keyPoints: ["Aspirin 75–150 mg daily from 12 weeks until birth.", "High risk: any one factor; moderate risk: more than one factor.", "PCR 30 mg/mmol or ACR 8 mg/mmol is significant proteinuria.", "Sustained systolic 160 mmHg or higher: admit."],
    pitfalls: ["Starting aspirin after 12 weeks without a documented reason, or giving it to a woman with only one moderate factor.", "Using first-morning urine or a 24-hour collection to quantify protein.", "Using diuretics, LMWH or supplements for prevention.", "Continuing ACE inhibitors or ARBs after pregnancy is confirmed."],
    refs: [{ ref: SRC.NG133, edition: "NICE NG133 (recommendations updated 2019 and 2023)", locator: "Recommendations 1.1–1.2, 1.3.11, 1.4.1–1.4.4, 1.5.2" }],
  },
  edu: ["Explain pre-eclampsia symptoms and to attend immediately if they occur (NG133 1.1.1).", "Explain why aspirin is advised from 12 weeks and to take it daily until the baby is born (NG133 1.1.2–1.1.3)."],
  life: ["Give the same advice on rest, exercise and work as for healthy pregnant women (NG133 1.1.7).", "Do not restrict salt solely to prevent pre-eclampsia (NG133 1.1.6).", "Women with chronic hypertension: weight management, exercise, healthy eating and lower salt per NICE hypertension guidance (NG133 1.3.6)."],
  mdt: ["Specialist in hypertensive disorders of pregnancy for chronic hypertension (NG133 1.3.1).", "Secondary care obstetric team for any new hypertension (NG133 1.4.1).", "Diabetes in pregnancy team for women with diabetes (NG133 1.1.8)."],
  discharge: ["Risk category documented and aspirin prescribed with a written start date at 12 weeks.", "Woman can name the symptoms that need immediate attendance.", "Blood pressure and urine protein plan booked for each antenatal visit."],
  follow: "Blood pressure and urine protein at each antenatal visit; weekly bloods and PLGF test if hypertension develops; aspirin continues until birth (NG133 1.1.2, 1.2.2, Table 1).",
},
];
