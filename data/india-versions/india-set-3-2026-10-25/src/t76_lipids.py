from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Dyslipidaemia and cardiovascular risk (India)"
T1 = "Table 1"; T2 = "Table 2"; T3 = "Table 3"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Cardiology / Internal Medicine / Endocrinology / Primary Care", authority="Other", pillar="Chronic Care",
 scope="Lipid testing, cardiovascular risk categories, LDL-cholesterol and non-HDL targets, statins, ezetimibe, PCSK9 inhibitors, inclisiran and management of hypertriglyceridaemia in Indian adults, built on the Cardiological Society of India (CSI) clinical practice guidelines for dyslipidaemia (2024).",
 findings=["Risk categories (low, moderate, high, very high, extremely high), LDL-C targets (below 100, 100, 70 and 55 mg/dL) and non-HDL targets (below 130, 130, 100, 85 mg/dL), triglyceride below 150 and Lp(a) below 50 mg/dL, statin intensity doses (atorvastatin 40–80 mg high, 10–20 mg moderate; rosuvastatin 20–40 mg high, 5–10 mg moderate), ezetimibe 10 mg with statin early after acute coronary syndrome (ACS), non-statin therapy if LDL-C not below 55 mg/dL at 4 weeks, evolocumab 140 mg every 2 weeks or 420 mg monthly, inclisiran 284 mg at day 1, day 90 then 6-monthly, fenofibrate 145 mg for triglycerides above 500 mg/dL, icosapent ethyl 2 g twice daily, non-fasting lipid testing, lipid profile by age 18 and Lp(a) once checked against the CSI dyslipidaemia guideline executive summary (Indian Heart J 2024).", "Not clinically reviewed."],
 unverified=["The extremely high-risk group has no numeric target in Table 1 of the executive summary; it is treated as at least the very high-risk target here.", "The CSI summary notes South Asians may respond to lower statin doses; no specific dose reduction is given.", "Bempedoic acid is named without a dose."],
 summary="Indians develop coronary artery disease about a decade earlier than many other populations, with atherogenic dyslipidaemia (high triglycerides, low HDL, small dense LDL) and high Lp(a). The CSI guideline asks for a lipid profile in everyone by 18 years (non-fasting is acceptable), Lp(a) once in a lifetime, risk categorisation by risk factors and established disease, and LDL-C targets that fall as risk rises — down to below 55 mg/dL in very high-risk patients. High-intensity statins are the foundation; ezetimibe, then PCSK9 inhibitors or inclisiran, are added when targets are not met. Very high triglycerides (above 500 mg/dL) are treated to prevent pancreatitis.",
 mechanisms=["LDL particles enter the artery wall and drive atherosclerosis; lowering LDL reduces events in proportion.", "Statins inhibit HMG-CoA reductase; ezetimibe blocks intestinal cholesterol absorption; PCSK9 inhibitors increase LDL receptor recycling.", "Lp(a) is inherited and independently causes coronary disease.", "Very high triglycerides cause acute pancreatitis."],
 presentation={"symptoms": ["Usually none", "Premature coronary disease in patient or family"], "physicalSigns": ["Xanthomas, xanthelasma, corneal arcus (familial hypercholesterolaemia)", "Eruptive xanthomas (very high triglycerides)"], "redFlags": ["LDL-C 190 mg/dL or more or tendon xanthomas: suspect familial hypercholesterolaemia", "Triglycerides above 500 mg/dL: pancreatitis risk (CSI)", "Muscle pain with dark urine on statin: check CK", "Premature coronary disease in family: cascade testing (CSI)"], "precipitants": ["Diabetes, obesity, alcohol", "Hypothyroidism, nephrotic syndrome", "Drugs (steroids, antiretrovirals)"]},
 differentials=[("Secondary dyslipidaemia", "Hypothyroidism, nephrotic syndrome, cholestasis, uncontrolled diabetes."), ("Familial hypercholesterolaemia", "Very high LDL, xanthomas, family history."), ("Familial chylomicronaemia", "Triglycerides above 1000 mg/dL from childhood.")],
 criteria=[("Moderate risk (CSI)", "One risk factor: tobacco, hypertension, diabetes or premature family history."), ("High risk (CSI)", "Two or more risk factors, CKD, diabetes over 10 years, or heterozygous FH."), ("Very high risk (CSI)", "Clinical ASCVD, diabetes over 20 years, FH with ASCVD, or over 50% stenosis in 2 coronary vessels."), ("LDL-C targets (CSI Table 1)", "Low and moderate below 100; high below 70; very high below 55 mg/dL.")],
 ruleIn=[
  inv("laboratory", "Lipid profile (total cholesterol, LDL-C, HDL-C, non-HDL-C, triglycerides)", "Blood (non-fasting acceptable)", "Dyslipidaemia and target", "LDL-C below 100 mg/dL; TG below 150 mg/dL", "Above risk-specific target", "By age 18 and for risk estimation (CSI).", "csi23", "sections 3, 9.2"),
  inv("laboratory", "Lipoprotein(a)", "Blood", "Inherited risk", "Below 50 mg/dL", "50 mg/dL (about 125 nmol/L) or more", "At least once in a lifetime (CSI).", "csi23", "section 10.2"),
  inv("laboratory", "TSH, fasting glucose or HbA1c, creatinine, liver tests, urine protein", "Blood and urine", "Secondary causes and baseline", "Within reference range", "Hypothyroidism, diabetes, nephrotic syndrome", "Before treatment.", "csi23", "section 4"),
  inv("laboratory", "Repeat lipid profile on treatment", "Blood", "Response", "At target", "Above target", "LDL-C at 4 weeks after ACS (CSI).", "csi23", "section 5"),
  inv("specializedAdjunctive", "Risk factor assessment", "History and examination", "Risk category", "No risk factors", "Two or more factors or ASCVD", "Figure 2 categories (CSI).", "csi23", "section 4, Figure 2")],
 ruleOut=[inv("laboratory", "Creatine kinase (CK) if muscle symptoms", "Blood", "Statin myopathy", "Normal", "More than 4 times upper limit", "Symptom-guided.", "csi23", "section 5")],
 management=[
  step("assess", "Assess risk", "First visit", ["Lipid profile, Lp(a) once, risk factors; place in a CSI category (CSI Figure 2)."]),
  step("lifestyle", "Lifestyle", "All", ["Diet (CSI Table 4), exercise, stop tobacco, limit alcohol, weight control."]),
  step("statin", "Statin", "From diagnosis in high and very high risk", ["High-intensity statin for high and very high risk (CSI Table 2).", "After ACS: add ezetimibe at the start (CSI)."]),
  step("add", "Intensify", "4–12 weeks", ["Not at target: add ezetimibe; then PCSK9 inhibitor or inclisiran in very high risk (CSI)."]),
  step("tg", "Triglycerides", "If raised", ["Above 500 mg/dL: fenofibrate to prevent pancreatitis (CSI).", "Raised despite statin in ASCVD or diabetes over 40 years: consider icosapent ethyl (CSI)."])],
 branches=[("Statin", "Above LDL-C target or high or very high risk."), ("Add-on LDL lowering", "LDL-C above target on maximally tolerated statin."), ("Hypertriglyceridaemia", "Triglycerides above 500 mg/dL, or raised despite statin in ASCVD or diabetes.")],
 regimens=[
  rx("Statin", "Statin", "LDL lowering", "Adults", "Atorvastatin", "High intensity 40–80 mg; moderate 10–20 mg", "Oral", "Once daily", "Long term", ADULT, NOT_ABX, "No adjustment.", "Avoid in active liver disease or unexplained raised transaminases.", ["Lipids at 4–12 weeks; liver tests; CK if symptoms"], ["Active liver disease", "Pregnancy"], "csi23", T2, sel="one-of", pref=True),
  rx("Statin", "Statin", "LDL lowering", "Adults", "Rosuvastatin", "High intensity 20–40 mg; moderate 5–10 mg", "Oral", "Once daily", "Long term", ADULT, NOT_ABX, "Start 5 mg and do not exceed 10 mg if creatinine clearance below 30 mL/min.", "Avoid in active liver disease.", ["Lipids; CK if symptoms"], ["Active liver disease", "Pregnancy"], "csi23", T2, sel="one-of", pref=False, use="Atorvastatin not tolerated or greater LDL lowering needed."),
  rx("Add-on LDL lowering", "Cholesterol absorption inhibitor", "LDL-C above target on statin; from start after ACS", "Adults", "Ezetimibe", "10 mg", "Oral", "Once daily", "Long term", ADULT, NOT_ABX, "No adjustment.", "Avoid in moderate or severe hepatic impairment.", ["Lipids"], ["Active liver disease with statin"], "csi23", T3),
  rx("Add-on LDL lowering", "PCSK9 pathway therapy", "Very high risk, LDL-C above target on statin and ezetimibe", "Adults", "Evolocumab", "140 mg every 2 weeks or 420 mg monthly", "SC", "Every 2 weeks or monthly", "Long term", ADULT, NOT_ABX, "No adjustment.", "No adjustment in mild to moderate impairment.", ["Lipids"], ["Hypersensitivity"], "csi23", "section 5.4, Table 3", sel="one-of", pref=True),
  rx("Add-on LDL lowering", "PCSK9 pathway therapy", "Very high risk, LDL-C above target on statin and ezetimibe", "Adults", "Inclisiran", "284 mg on day 1, day 90, then every 6 months", "SC", "Twice yearly after loading", "Long term", ADULT, NOT_ABX, "No adjustment.", "Caution in severe hepatic impairment.", ["Lipids"], ["Hypersensitivity"], "csi23", T3, sel="one-of", pref=False, use="Twice-yearly dosing preferred for adherence."),
  rx("Hypertriglyceridaemia", "Triglyceride lowering", "Triglycerides above 500 mg/dL", "Adults", "Fenofibrate", "145 mg", "Oral", "Once daily", "Long term; review", ADULT, NOT_ABX, "Avoid in severe renal impairment.", "Avoid in hepatic disease or gallbladder disease.", ["Triglycerides, creatinine, liver tests"], ["Severe renal or hepatic disease"], "csi23", "section 6, Table 3", sel="one-of", pref=True),
  rx("Hypertriglyceridaemia", "Triglyceride lowering", "Triglycerides raised despite statin with ASCVD or diabetes over 40 years", "Adults", "Icosapent ethyl", "2 g", "Oral", "Twice daily", "Long term", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Atrial fibrillation, bleeding"], ["Fish allergy"], "csi23", "section 6, Table 3", sel="one-of", pref=False, use="Cardiovascular risk reduction rather than pancreatitis prevention.")],
 medNote="All targets and doses from the CSI dyslipidaemia guideline executive summary (2024). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "LDL-C targets by risk (CSI)", "columns": ["LDL-C (mg/dL)", "Non-HDL-C (mg/dL)"], "rows": [{"parameter": "Low or moderate", "values": ["Below 100", "Below 130"]}, {"parameter": "High", "values": ["Below 70", "Below 100"]}, {"parameter": "Very high", "values": ["Below 55", "Below 85"]}], "note": "CSI Table 1."},
 teaching={"scope": "Lipid management in Indian adults.", "learningObjectives": ["Categorise cardiovascular risk.", "Choose statin intensity and add-on therapy.", "Manage very high triglycerides."],
  "keyPoints": ["Lipid profile by 18; Lp(a) once.", "Very high risk: LDL-C below 55 mg/dL.", "High-intensity statin plus ezetimibe early after ACS.", "Triglycerides above 500: fenofibrate."],
  "pitfalls": ["Under-dosing statins.", "Ignoring Lp(a) and family history.", "Fibrates for mild triglyceride rise.", "Stopping statins for mild aches without checking CK."],
  "references": [tref("csi23", "sections 3–6, 9–10; Tables 1–3; Figure 2")]},
 nonClinical={"patientEducation": ["Statins are lifelong; report muscle pain with dark urine.", "Diet: less refined carbohydrate and fried food; more vegetables and pulses."], "lifestyleAndDiet": ["Regular exercise, weight loss, stop tobacco, limit alcohol."], "mdtReferrals": ["Cardiology for very high risk or FH", "Dietitian", "Lipid clinic for familial disorders"], "dischargeCriteria": ["Outpatient care"], "followUpPlan": "Lipids 4–12 weeks after starting or changing treatment, then yearly (CSI)."})
T["pathophysiology"]["summary"] += " Because risk is cumulative, the earlier and lower LDL-C is brought down, the larger the benefit; the CSI therefore asks for a first lipid profile by age 18 and cascade testing in families with premature disease."
T["presentation"]["symptoms"] += ["Exertional chest pain or claudication in established atherosclerosis", "Abdominal pain (pancreatitis) with very high triglycerides"]
T["presentation"]["physicalSigns"] += ["Tendon xanthomas on the Achilles tendon or knuckles (familial hypercholesterolaemia)", "Signs of secondary causes: obesity, acanthosis, hypothyroid features, oedema"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Secondary dyslipidaemia", "Hypothyroidism, nephrotic syndrome, cholestasis, uncontrolled diabetes or drugs; TSH, urine protein, liver tests and HbA1c settle it before starting lifelong treatment."),
 ("Heterozygous familial hypercholesterolaemia", "Very high LDL-C, tendon xanthomas and premature coronary disease in relatives; family screening and genetic testing settle it (CSI)."),
 ("Familial chylomicronaemia", "Triglycerides above 1000 mg/dL from childhood with recurrent pancreatitis; specialist lipid testing settles it."),
 ("Raised lipoprotein(a)", "Premature disease despite normal LDL-C; a single Lp(a) measurement above 50 mg/dL settles it (CSI)."),
 ("Laboratory artefact from non-fasting or lipaemic sample", "Isolated triglyceride rise after a heavy meal; a repeat sample settles it, though non-fasting testing is acceptable for risk estimation (CSI)."),
 ("Statin-associated muscle symptoms versus other myopathy", "Aches with normal CK versus weakness with raised CK or hypothyroidism; CK and TSH settle it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "assess":
        m["actions"] = ["Lipid profile (non-fasting acceptable), Lp(a) once, and screen for secondary causes (CSI).", "Place the person in a CSI risk category and set the LDL-C and non-HDL-C targets (CSI Figure 2, Table 1)."]
    if m["id"] == "lifestyle":
        m["actions"] = ["Diet with fewer refined carbohydrates and fried foods and more vegetables, pulses and whole grains (CSI Table 4).", "Regular exercise, weight control, stop tobacco in all forms, limit alcohol."]
    if m["id"] == "add":
        m["actions"] = ["Not at target on maximally tolerated statin: add ezetimibe 10 mg (CSI).", "Very high risk still above target: PCSK9 inhibitor or inclisiran (CSI)."]
T["clinicalManagement"].insert(5, step("monitor", "Monitor and support adherence", "4–12 weeks, then yearly", ["Repeat lipids 4–12 weeks after starting or changing treatment, then yearly (CSI).", "Muscle symptoms: check CK and TSH; retry a lower dose or another statin rather than stopping lipid lowering."]))
T["teaching"]["learningObjectives"].append("Recognise familial hypercholesterolaemia and raised Lp(a) and arrange family testing.")
T["teaching"]["keyPoints"].append("Measure Lp(a) once in every adult (CSI).")
T["teaching"]["pitfalls"].append("Treating triglycerides with fibrates while ignoring LDL-C.")

ALG = algo("lipid-pathway", "Lipid management by CSI risk category", "manage", "csi23", "sections 4–6, Figure 2, Tables 1–3", [
 node("start", "start", "Adult with a lipid profile", [("sec", None)], "Exclude secondary causes first."),
 node("sec", "decision", "Clinical ASCVD, diabetes over 20 years, or FH with ASCVD?", [("vh", "Yes (very high)"), ("high", "No")]),
 node("vh", "action", "High-intensity statin (atorvastatin 40–80 or rosuvastatin 20–40); target LDL-C below 55 mg/dL", [("vhcheck", None)]),
 node("vhcheck", "decision", "LDL-C below 55 mg/dL at 4–12 weeks?", [("vhok", "Yes"), ("vhadd", "No")]),
 node("vhok", "outcome", "Continue; lipids yearly", None),
 node("vhadd", "outcome", "Add ezetimibe 10 mg; then PCSK9 inhibitor or inclisiran if still above target", None),
 node("high", "decision", "Two or more risk factors, CKD, diabetes over 10 years or heterozygous FH?", [("hi", "Yes (high)"), ("mod", "No")]),
 node("hi", "outcome", "Statin to LDL-C below 70 mg/dL; add ezetimibe if not at target", None),
 node("mod", "decision", "One risk factor (tobacco, hypertension, diabetes, premature family history)?", [("modyes", "Yes (moderate)"), ("low", "No (low)")]),
 node("modyes", "outcome", "Lifestyle, then statin if LDL-C stays at or above 100 mg/dL", None),
 node("low", "outcome", "Lifestyle; LDL-C target below 100 mg/dL; recheck periodically", None)])

VIG = "Mr P, a 44-year-old software engineer from Bengaluru, comes for a health check. His father had a heart attack at 48. He does not smoke, BP is 128/82 mmHg and HbA1c 5.6%. Total cholesterol is 312 mg/dL, LDL-C 228 mg/dL, HDL-C 42 mg/dL and triglycerides 140 mg/dL. You notice thickened Achilles tendons. He asks whether diet alone will fix it."

EXP = [
 explain("pathophysiology", "Why LDL-C is the main target", "Why do guidelines focus on LDL-C and set lower targets for higher risk?",
  "Atherosclerosis begins when apolipoprotein B-containing particles, mainly LDL, enter the arterial wall and are retained and oxidised, attracting macrophages that form foam cells and plaques. The amount of plaque reflects both the LDL-C level and how long the artery has been exposed, so a person with familial hypercholesterolaemia carries a decade's extra exposure by middle age. Trials of statins, ezetimibe and PCSK9 inhibitors all show that lowering LDL-C reduces events in proportion to the fall, without a clear lower threshold — hence the targets fall from below 100 to below 55 mg/dL as risk rises. Indians often have atherogenic dyslipidaemia with high triglycerides and low HDL-C, and about one in four South Asians has a raised Lp(a), which is inherited and not lowered by lifestyle."),
 explain("signs-symptoms", "Spotting the high-risk patient", "Who needs more than a routine check?",
  "Most people with dyslipidaemia have no symptoms, so the diagnosis is made by testing and by recognising risk. Ask about premature coronary disease in first-degree relatives (men under 55, women under 60), smoking or tobacco chewing, hypertension and diabetes and its duration. Examine for tendon xanthomas, xanthelasma and corneal arcus at a young age, which suggest familial hypercholesterolaemia, and for eruptive xanthomas with very high triglycerides. Look for secondary causes — hypothyroidism, nephrotic syndrome, cholestasis, poorly controlled diabetes and drugs such as steroids — because treating them can correct the lipids."),
 explain("investigations", "What to measure and when", "Which tests does the CSI recommend?",
  "A standard lipid profile (total cholesterol, LDL-C, HDL-C, non-HDL-C and triglycerides) can be taken non-fasting for risk estimation and treatment decisions. Everyone should have a profile by age 18, and Lp(a) should be measured at least once in a lifetime; a value above 50 mg/dL marks extra inherited risk. Check TSH, glucose or HbA1c, creatinine, liver tests and urine protein to exclude secondary causes before starting lifelong treatment. After starting or changing therapy, repeat the lipids at 4–12 weeks to confirm the target is met, then yearly. Check CK and TSH if muscle symptoms appear. Cascade testing of relatives is advised in familial hypercholesterolaemia and premature coronary disease."),
 explain("management", "Statins first, then add-ons", "How do you reach the target?",
  "Lifestyle change matters for everyone but rarely reaches targets alone in high-risk patients. The CSI places people in risk categories and sets LDL-C targets of below 100, 70 or 55 mg/dL. High and very high-risk patients start a high-intensity statin — atorvastatin 40–80 mg or rosuvastatin 20–40 mg — and South Asians may respond well to lower doses. After an acute coronary syndrome, ezetimibe is added from the start. If the target is not met at 4–12 weeks, add ezetimibe 10 mg, then a PCSK9 inhibitor or inclisiran in very high-risk patients. Triglycerides above 500 mg/dL need fenofibrate to prevent pancreatitis; for persistently raised triglycerides in ASCVD or diabetes, icosapent ethyl reduces events. Statin side effects are usually manageable with a dose or drug change rather than stopping.")]

QS = [
 bq("q1", "A 44-year-old man has LDL-C 228 mg/dL, thickened Achilles tendons and a father with myocardial infarction at 48. He does not smoke, is not diabetic and has normal BP. TSH and urine protein are normal. He has no symptoms of coronary disease.", "What is the most appropriate management?",
  [("Diet alone for 6 months, then recheck", "Familial hypercholesterolaemia rarely responds adequately to diet; delay prolongs exposure."),
   ("Fenofibrate 145 mg daily", "Fibrates lower triglycerides; his problem is very high LDL-C."),
   ("High-intensity statin with family screening, adding ezetimibe if LDL-C stays above 70 mg/dL", "Correct. Heterozygous FH is a high-risk category (CSI): LDL-C target below 70 mg/dL, with cascade testing of relatives."),
   ("Icosapent ethyl 2 g twice daily", "Icosapent ethyl is for raised triglycerides in ASCVD or diabetes."),
   ("No treatment because he has no symptoms", "Risk is driven by lifetime LDL exposure, not symptoms.")],
  "C", "Recognise familial hypercholesterolaemia and treat to a high-risk target.", "Tendon xanthomas + LDL-C above 190 mg/dL: think FH; statin, target below 70, screen family."),
 bq("q2", "A 58-year-old woman had an NSTEMI treated with a stent 6 weeks ago and has taken atorvastatin 80 mg daily with good adherence since discharge. She has hypertension and no diabetes. Her LDL-C today is 82 mg/dL, HDL-C 38 mg/dL and triglycerides 160 mg/dL, and she has no muscle symptoms.", "What is the best next step?",
  [("Continue the same treatment", "She is very high risk with LDL-C above the target of 55 mg/dL (CSI)."),
   ("Add ezetimibe 10 mg daily", "Correct. Very high risk needs LDL-C below 55 mg/dL; after ACS, ezetimibe is added to the statin, and a non-statin is advised if not at target at 4 weeks (CSI)."),
   ("Switch to rosuvastatin 5 mg", "This is a moderate-intensity dose and would raise LDL-C."),
   ("Add fenofibrate", "Triglycerides are only mildly raised; fibrates have no role at 150–499 mg/dL (CSI)."),
   ("Stop the statin and start evolocumab alone", "PCSK9 inhibitors are added to, not substituted for, maximally tolerated statin therapy.")],
  "B", "Intensify lipid lowering after acute coronary syndrome.", "Very high risk: LDL-C below 55 mg/dL; add ezetimibe early."),
 bq("q3", "A 40-year-old man with type 2 diabetes and heavy alcohol use presents with epigastric pain radiating to the back. Serum lipase is three times normal and fasting triglycerides are 1450 mg/dL. LDL-C cannot be calculated. He is not on any lipid-lowering drug.", "Which long-term lipid treatment is most important after he recovers?",
  [("Atorvastatin 10 mg only", "Statins alone do not adequately lower triglycerides of this level."),
   ("Icosapent ethyl alone", "Icosapent ethyl reduces cardiovascular events but is not the main drug to prevent pancreatitis at triglycerides above 500 mg/dL."),
   ("Observation only", "Triglycerides above 500 mg/dL carry a high pancreatitis risk and need treatment (CSI)."),
   ("Fenofibrate 145 mg daily, alcohol abstinence and glucose control", "Correct. Fasting triglycerides above 500 mg/dL are the clearest indication for fenofibrate to prevent pancreatitis (CSI), with control of secondary causes."),
   ("Ezetimibe 10 mg", "Ezetimibe mainly lowers LDL-C and does little for triglycerides of this level.")],
  "D", "Prevent pancreatitis in severe hypertriglyceridaemia.", "Triglycerides above 500 mg/dL: fenofibrate plus correction of alcohol and glucose.")]

T = deepen(T, [ALG], VIG, EXP, QS)

for r in T["medicationPlan"]["regimens"]:
    if r.get("step") == "PCSK9 pathway therapy": r["step"] = "Further non-statin therapy"
T["evidenceAudit"]["unverifiedSections"] = [u for u in T["evidenceAudit"]["unverifiedSections"] if not u.startswith("Bempedoic acid")]
T["evidenceAudit"]["findings"].insert(1, "Bempedoic acid 180 mg once daily with maximally tolerated statin, no adjustment at eGFR 30 or above or in Child-Pugh A or B, and hyperuricaemia and tendon warnings checked against the Drugs.com dosage monograph (US label).")
T["medicationPlan"]["regimens"].append(rx("Add-on LDL lowering", "Further non-statin therapy", "LDL-C above target on maximally tolerated statin, or statin intolerance", "Adults", "Bempedoic acid", "180 mg", "Oral", "Once daily", "Long term", ADULT, NOT_ABX, "No adjustment if eGFR 30 or above; caution below 30 (label).", "No adjustment in Child-Pugh A or B (label).", ["Lipids at 8–12 weeks; uric acid as indicated"], ["Gout or hyperuricaemia (caution)", "History of tendon rupture (caution)"], "bempa", "section Usual adult dose", sel="one-of", pref=False, use="PCSK9 inhibitor or inclisiran unaffordable or unavailable, or statin intolerance.", extra_adj=("Named by the CSI guideline as a non-statin option after ACS if LDL-C is not below 55 mg/dL at 4 weeks.",)))
T["teaching"]["references"].append(tref("bempa", "sections Dose, Renal and hepatic impairment"))

# Reviewer fixes (independent check, 25 Oct 2026)
CSI = "Indian Heart J 2024;76 Suppl 1:S6-S19"
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [("The CSI summary notes South Asians may respond to lower statin doses (section 5.1); the US label suggests starting rosuvastatin at 5 mg in Asian patients." if u.startswith("The CSI summary notes South Asians") else u) for u in EA["unverifiedSections"]]
EA["unverifiedSections"].insert(0, "CSI gives no routine adult interval for repeat lipid testing and no CK threshold (section 5.1 advises against routine muscle and liver enzyme monitoring); the 4–12 week recheck and yearly review shown are general practice.")
R = T["medicationPlan"]["regimens"]
for r in R:
    n = r["genericName"]
    if n == "Atorvastatin":
        r["dose"] = "High intensity 40–80 mg; moderate 10–20 mg; low 5 mg"
        r["monitoring"] = ["Lipids on treatment (4 weeks after ACS, CSI 4.1); CK and liver tests only if symptoms (CSI 5.1)"]
        r["contraindications"] = list(r["contraindications"]) + ["South Asians may respond to lower doses and be more prone to adverse effects (CSI 5.1)"]
    if n == "Rosuvastatin":
        r["adjustments"] = [a if not a.startswith("CKD:") else "CKD: Creatinine clearance below 30 mL/min (not on dialysis): start 5 mg, maximum 10 mg (US label, Drugs.com)." for a in r["adjustments"]]
        r["adjustments"].append("Asian patients: consider starting 5 mg; increased exposure (US label); CSI notes South Asians are hyper-responders (CSI 5.1).")
    if n == "Evolocumab":
        r["indication"] = "High or very high risk with LDL-C above target on maximally tolerated statin and ezetimibe (CSI 5.4)"
        r["dose"] = "140 mg every 2 weeks (ASCVD, heterozygous FH); 420 mg monthly (homozygous FH, CSI Table 3)"
        r["sourceEdition"] = f"{CSI}, section 5.4, Table 3"
    if n == "Inclisiran":
        r["indication"] = "High or very high risk with LDL-C above target on maximally tolerated statin and ezetimibe (CSI 5.4)"
    if n == "Fenofibrate":
        r["adjustments"] = [a if not a.startswith("CKD:") else "CKD: Mild to moderate impairment: start at 48 mg and increase only after checking renal function; severe impairment: contraindicated (US label, Drugs.com)." for a in r["adjustments"]]
        r["monitoring"] = list(r.get("monitoring", [])) + ["Liver tests (stop if ALT or AST above 3 times upper limit, label); creatinine"]
    if n == "Icosapent ethyl":
        r["indication"] = "Triglycerides still raised after lifestyle measures and diabetes control, in ASCVD or diabetes aged 40 or older, on a statin (CSI 6)"
        r["contraindications"] = ["Hypersensitivity", "Caution in fish or shellfish allergy"]
        r["adjustments"] = [a if not a.startswith("CLD:") else "CLD: No dose adjustment; monitor ALT and AST in hepatic impairment." for a in r["adjustments"]]
    if n == "Bempedoic acid":
        r["sourceTitle"], r["sourceUrl"] = S["csi23"][0], S["csi23"][1]
        r["sourceEdition"] = f"{CSI}, section 4.1, Table 3"
        r["adjustments"] = [a for a in r["adjustments"] if not a.startswith("Named by the CSI")]
        r["adjustments"] = [a if not a.startswith("CLD:") else "CLD: No adjustment in Child-Pugh A or B; not studied in severe impairment (label)." for a in r["adjustments"]]
        r["contraindications"] = list(r["contraindications"]) + ["Avoid simvastatin above 20 mg or pravastatin above 40 mg (myopathy risk, label)"]
R.insert(2, rx("Statin", "Statin", "LDL lowering (moderate or low intensity)", "Adults", "Pitavastatin", "Moderate intensity 2–4 mg; low 1 mg", "Oral", "Once daily", "Long term",
  ADULT, NOT_ABX, "Reduce dose in moderate to severe renal impairment.", "Avoid in active liver disease.", ["Lipids; CK if symptoms"], ["Active liver disease", "Pregnancy"], "csi23", "Table 2", sel="one-of", pref=False, use="Moderate-intensity statin wanted, or other statins not tolerated."))
assert "csi23" in S
for c in T["diagnosticCriteria"]:
    if c["criterion"].startswith("Very high risk"):
        c["threshold"] = "Clinical ASCVD (coronary or other vascular beds), diabetes over 20 years, heterozygous FH with ASCVD, or a lesion over 50% in 2 coronary vessels on imaging."
T["diagnosticCriteria"].insert(3, {"criterion": "Extremely high risk (CSI section 4)", "threshold": "Recurrent vascular events, or ASCVD with a genetic dyslipidaemia (FH or high Lp(a)); no separate numeric target in Table 1 — use at least the very high-risk target."})
T["diagnosticCriteria"].append({"criterion": "Other targets for all groups (CSI Table 1)", "threshold": "HDL-C above 40 mg/dL (men) and 50 mg/dL (women); triglycerides below 150 mg/dL; Lp(a) below 50 mg/dL."})
T["diagnosticCriteria"].append({"criterion": "Severe hypercholesterolaemia (CSI section 9.2)", "threshold": "LDL-C 190 mg/dL or more on repeat testing: start a statin."})
inv = T["investigations"]["ruleIn"] + T["investigations"]["ruleOut"]
for r in inv:
    if r["testName"].startswith("TSH"):
        r["clinicalRationale"] = "Before treatment, to find secondary causes (general practice)."
        r["references"][0]["edition"] = f"{CSI}, section 4 (risk assessment)"
    if r["testName"].startswith("Repeat lipid"):
        r["references"][0]["edition"] = f"{CSI}, section 4.1"
    if r["testName"].startswith("Creatine kinase"):
        r["expectedFinding"] = "Raised CK with muscle symptoms (no CSI threshold)"
        r["clinicalRationale"] = "Symptom-guided only; CSI advises against routine monitoring (section 5.1)."
        r["references"][0]["edition"] = f"{CSI}, section 5.1"
for m in T["clinicalManagement"]:
    if m["id"] == "statin":
        m["actions"] = ["High-intensity statin for high and very high risk (CSI Table 2).", "After ACS: add ezetimibe at the start; LDL-C below 55 mg/dL as early as possible (CSI 4.1).", "LDL-C 190 mg/dL or more on repeat testing: start a statin even without other risk factors (CSI 9.2)."]
    if m["id"] == "add":
        m["actions"] = ["Not at target on maximally tolerated statin: add ezetimibe 10 mg (CSI).", "High or very high risk still above target: PCSK9 inhibitor or inclisiran, used mainly in very high risk (CSI 5.4).", "After ACS, LDL-C not below 55 mg/dL at 4 weeks: add bempedoic acid, a PCSK9 inhibitor or inclisiran (CSI 4.1)."]
    if m["id"] == "tg":
        m["actions"] = ["Above 500 mg/dL: fenofibrate to prevent pancreatitis (CSI).", "Still raised after lifestyle and diabetes control in ASCVD or diabetes aged 40 or older: consider icosapent ethyl (CSI 6)."]
    if m["id"] == "monitor":
        m["actions"] = ["Repeat lipids 4 weeks after ACS (CSI 4.1); otherwise 4–12 weeks after starting or changing treatment, then yearly (general practice).", "Muscle symptoms: check CK and TSH; retry a lower dose or another statin rather than stopping lipid lowering."]
T["nonClinicalManagement"]["followUpPlan"] = "Lipids 4 weeks after ACS (CSI 4.1); otherwise 4–12 weeks after starting or changing treatment, then yearly (general practice)."
A = T["algorithms"][0]
nodes = {n["id"]: n for n in A["nodes"]}
nodes["sec"]["text"] = "Clinical ASCVD (any vascular bed), diabetes over 20 years, FH with ASCVD, or over 50% lesion in 2 coronary vessels?"
nodes["vh"]["next"] = [{"to": "acs"}]
nodes["vhcheck"]["text"] = "LDL-C below 55 mg/dL at recheck (4 weeks after ACS)?"
nodes["hi"]["text"] = "High-intensity statin; LDL-C below 70 mg/dL; add ezetimibe if not at target"
nodes["mod"]["next"] = [{"to": "modyes", "label": "Yes (moderate)"}, {"to": "ldl190", "label": "No"}]
A["nodes"] = [n for n in A["nodes"] if n["id"] != "low"]
idx = [n["id"] for n in A["nodes"]].index("vh") + 1
A["nodes"][idx:idx] = [
 {"id": "acs", "kind": "decision", "text": "Acute coronary syndrome?", "next": [{"to": "acsez", "label": "Yes"}, {"to": "vhcheck", "label": "No"}]},
 {"id": "acsez", "kind": "outcome", "text": "Add ezetimibe from the start; if LDL-C not below 55 mg/dL at 4 weeks add bempedoic acid, a PCSK9 inhibitor or inclisiran"}]
A["nodes"] += [
 {"id": "ldl190", "kind": "decision", "text": "LDL-C 190 mg/dL or more on repeat testing?", "next": [{"to": "st190", "label": "Yes"}, {"to": "low", "label": "No (low)"}]},
 {"id": "st190", "kind": "outcome", "text": "Start a statin; assess for familial hypercholesterolaemia"},
 {"id": "low", "kind": "outcome", "text": "Lifestyle; LDL-C target below 100 mg/dL; recheck periodically"}]
A["source"]["locator"] = "sections 4, 4.1, 5.4, 6, 9.2, Figure 2, Tables 1–3"
for q in T["teaching"]["boardQuestions"]:
    for o in q["options"]:
        if q["id"] == "q2" and o["id"] == "B":
            o["explanation"] = "Correct. Very high risk needs LDL-C below 55 mg/dL and after ACS ezetimibe is added to the statin. Ezetimibe alone may not give the 33% further fall needed, so recheck at 4 weeks and add bempedoic acid, a PCSK9 inhibitor or inclisiran if not at target (CSI 4.1)."
        if q["id"] == "q3" and o["id"] == "A":
            o["explanation"] = "Statins alone do not adequately lower triglycerides of this level, although as a man with diabetes aged 40 he also qualifies for a statin once triglycerides fall."
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("diabetes over 40 years", "diabetes aged 40 or older")

save("t76_lipids.json", [T])
