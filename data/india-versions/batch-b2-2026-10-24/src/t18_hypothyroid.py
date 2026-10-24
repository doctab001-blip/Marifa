from h import *
TX = "section Treatment"
DX = "section Diagnosis"
TITLE = "Hypothyroidism (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Endocrinology / Internal Medicine / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Primary, central and congenital hypothyroidism in India, including newborn screening, levothyroxine dosing and special groups, built on the ICMR Hypothyroidism workflow (July 2022).",
 findings=[
  "Clinical features, Billewicz score, thyroid-stimulating hormone (TSH) and free thyroxine (FT4) interpretation, newborn screening thresholds, levothyroxine doses, titration and TSH targets checked against the ICMR Hypothyroidism STW (July 2022).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow gives no doses for hydrocortisone, myxoedema coma or pregnancy; these are from the Endocrine Society 2016 adrenal insufficiency guideline and the ATA 2014 hypothyroidism guideline.",
  "Normal TSH and FT4 ranges vary by assay; local laboratory ranges apply.",
  "Monitoring intervals (6–8 weeks after dose changes; 2 and 4 weeks in newborns), anti-TPO testing and dietary advice are general practice, not quoted from the workflow."],
 summary="Hypothyroidism is deficient thyroid hormone action. In India the commonest cause in adults is autoimmune (Hashimoto) thyroiditis; others are iodine deficiency, post-ablative or post-surgical hypothyroidism and drugs. Primary hypothyroidism shows a raised thyroid-stimulating hormone (TSH) with low free thyroxine (FT4); central hypothyroidism from pituitary or hypothalamic disease shows a low FT4 with a low or inappropriately normal TSH, so TSH cannot be used to monitor it. Lack of thyroid hormone slows metabolism, causing fatigue, weight gain, cold intolerance, constipation, bradycardia, dry skin and delayed relaxation of reflexes; severe untreated disease can cause myxoedema coma. Congenital hypothyroidism is a preventable cause of intellectual disability and is detected by newborn screening. Treatment is lifelong levothyroxine, started cautiously in older adults and people with coronary artery disease (ICMR STW).",
 mechanisms=[
  "Autoimmune destruction or iodine deficiency reduces thyroid hormone synthesis.",
  "Loss of negative feedback raises TSH in primary disease.",
  "Pituitary or hypothalamic disease lowers TSH drive in central disease.",
  "Low thyroid hormone reduces metabolic rate and cardiac output."],
 presentation={
  "symptoms": ["Fatigue, lethargy, weight gain, cold intolerance", "Constipation, dry skin, hair loss, hoarse voice", "Menstrual disturbance, infertility", "Poor feeding, prolonged jaundice and constipation in newborns"],
  "physicalSigns": ["Bradycardia", "Delayed ankle-jerk relaxation", "Goitre", "Puffy face, periorbital oedema", "Large fontanelle, macroglossia, umbilical hernia in newborns"],
  "redFlags": ["Hypothermia, altered sensorium, hypoventilation: suspected myxoedema coma — refer", "Central hypothyroidism: assess adrenal function before levothyroxine", "Newborn with abnormal screening TSH: confirm and treat without delay", "Angina on starting treatment"],
  "precipitants": ["Autoimmune thyroiditis", "Iodine deficiency", "Radioiodine or thyroid surgery", "Drugs such as amiodarone and lithium"]},
 differentials=[
  ("Subclinical hypothyroidism", "Raised TSH with normal FT4."),
  ("Non-thyroidal illness", "Abnormal tests in acute illness that settle on recovery; repeat when well."),
  ("Central hypothyroidism", "Low FT4 with low or inappropriately normal TSH; look for other pituitary deficits."),
  ("Depression", "Low mood and fatigue with normal thyroid tests."),
  ("Recovery phase of thyroiditis", "Transient raised TSH after painful or postpartum thyroiditis.")],
 criteria=[
  ("Overt primary hypothyroidism", "TSH above the reference range with FT4 below the reference range (ICMR STW)."),
  ("Central hypothyroidism", "Low FT4 with low or inappropriately normal TSH (ICMR STW)."),
  ("Newborn screening (ICMR STW)", "Screening TSH above 30 mIU/L is abnormal; confirmed congenital hypothyroidism if venous TSH above 9 mIU/L with FT4 below 0.6 ng/dL."),
  ("Billewicz score (ICMR STW)", "Clinical score of symptoms and signs; supports clinical suspicion where testing is delayed."),
  ("Treatment target", "Primary: TSH within the reference range. Central: FT4 in the upper half of the reference range (ICMR STW).")],
 ruleIn=[
  inv("laboratory", "Thyroid-stimulating hormone (TSH)", "Serum TSH", "Primary hypothyroidism", "Approximately 0.4–4.5 mIU/L", "Raised TSH", "First-line test for primary hypothyroidism (ICMR STW).", "thy", DX),
  inv("laboratory", "Free thyroxine (FT4)", "Serum FT4", "Overt versus subclinical disease; central disease", "Approximately 0.8–1.8 ng/dL", "Low FT4", "Needed to classify the disease and for central hypothyroidism (ICMR STW).", "thy", DX),
  inv("laboratory", "Newborn screening TSH", "Heel-prick or cord blood TSH", "Congenital hypothyroidism", "TSH 30 mIU/L or below on screening", "TSH above 30 mIU/L", "Abnormal screen needs venous confirmation (ICMR STW).", "thy", "section Newborn screening"),
  inv("specializedAdjunctive", "Billewicz score", "Bedside clinical score", "Clinical hypothyroidism", "Score in the euthyroid range", "Score in the hypothyroid range", "Structured clinical assessment (ICMR STW).", "thy", DX)],
 ruleOut=[
  inv("laboratory", "Morning cortisol (central hypothyroidism)", "Serum cortisol", "Coexisting adrenal insufficiency", "Normal morning cortisol for the assay", "Low cortisol", "Give hydrocortisone before levothyroxine in central disease (ICMR STW).", "thy", TX),
  inv("laboratory", "Anti-thyroid peroxidase antibodies", "Serum anti-TPO", "Autoimmune thyroiditis", "Negative", "Positive", "Supports autoimmune cause and predicts progression in subclinical disease.", "thy", DX)],
 management=[
  step("confirm", "Confirm the diagnosis", "First visit", ["TSH and FT4; classify as overt primary, subclinical or central (ICMR STW).", "In central disease assess other pituitary hormones and cortisol (ICMR STW)."]),
  step("start", "Start levothyroxine", "After confirmation", ["Healthy adults: full replacement dose by weight (see medicines).", "Older adults or coronary artery disease (CAD): low starting dose with slow increments (ICMR STW).", "Take on an empty stomach, apart from iron and calcium."]),
  step("titrate", "Titrate and monitor", "Every 6–8 weeks until stable", ["Primary: adjust to keep TSH in range; central: keep FT4 in the upper half of range (ICMR STW).", "Once stable, check TSH yearly."]),
  step("newborn", "Congenital hypothyroidism", "Immediately after confirmation", ["Start levothyroxine 10–15 mcg/kg/day as soon as confirmed (ICMR STW).", "Crush the tablet in breast milk or water; do not use soy formula at the same time."], [("Screening TSH above 30 mIU/L", ["Recall for venous TSH and FT4 (ICMR STW)."])])],
 branches=[
  ("Adult primary hypothyroidism", "Healthy adults below about 60 years without heart disease."),
  ("Older adult or coronary artery disease", "Older adults or people with CAD."),
  ("Central hypothyroidism", "Low FT4 with low or inappropriately normal TSH."),
  ("Congenital hypothyroidism", "Newborn with confirmed congenital hypothyroidism."),
  ("Myxoedema coma", "Hypothermia, altered sensorium or hypoventilation with hypothyroidism (refer to intensive care)."),
  ("Pregnancy", "Women with known hypothyroidism who become pregnant.")],
 regimens=[
  rx("Adult primary hypothyroidism", "Thyroid hormone replacement", "Overt primary hypothyroidism", "Adults", "Levothyroxine", "1.6–1.8 mcg/kg/day", "Oral", "Once daily, empty stomach", "Lifelong", "Children: dose by age and weight; congenital disease 10–15 mcg/kg/day (ICMR STW).", NOT_ABX, "No adjustment needed.", "No adjustment needed.", ["TSH 6–8 weeks after each change"], ["Untreated adrenal insufficiency"], "thy", TX),
  rx("Older adult or coronary artery disease", "Thyroid hormone replacement", "Hypothyroidism with cardiac risk", "Older adults or CAD", "Levothyroxine", "Start 12.5–25 mcg/day; increase by 12.5–25 mcg every 3–4 weeks", "Oral", "Once daily, empty stomach", "Lifelong", "Not applicable (adult group).", NOT_ABX, "No adjustment needed.", "No adjustment needed.", ["Angina, palpitations", "TSH"], ["Worsening angina: slow titration"], "thy", TX),
  rx("Central hypothyroidism", "Glucocorticoid first", "Coexisting adrenal insufficiency", "Adults with central hypothyroidism and low cortisol", "Hydrocortisone", "15–25 mg/day in 2–3 divided doses, largest dose on waking", "Oral", "Two or three times daily", "Lifelong if deficient", "Children: about 8 mg/m²/day (Endocrine Society 2016).", NOT_ABX, NS, NS, ["Symptoms of adrenal insufficiency", "Sick-day rules: double the dose with fever"], ["Avoid abrupt withdrawal"], "es16", "recommendation 3.2", extra_adj=("ICMR: treat cortisol deficiency before levothyroxine; dose from the Endocrine Society adrenal insufficiency guideline (written for primary adrenal insufficiency).",)),
  rx("Central hypothyroidism", "Thyroid hormone replacement", "Central hypothyroidism", "Adults", "Levothyroxine", "1.3 mcg/kg/day", "Oral", "Once daily, empty stomach", "Lifelong", NS, NOT_ABX, "No adjustment needed.", "No adjustment needed.", ["FT4 (not TSH)"], ["Start only after cortisol deficiency is treated"], "thy", TX),
  rx("Myxoedema coma", "Glucocorticoid first", "Possible adrenal insufficiency in myxoedema coma", "Adults", "Hydrocortisone", "100 mg, then 200 mg per 24 hours (infusion or 6-hourly)", "IV", "Bolus then continuous or 6-hourly", "Until adrenal insufficiency excluded", "Children: 50 mg/m² then 50–100 mg/m² per 24 hours (Endocrine Society 2016).", NOT_ABX, NS, NS, ["Glucose, sodium, BP"], ["Give before levothyroxine (ATA 2014 recommendation 21b)"], "es16", "recommendation 4.1"),
  rx("Myxoedema coma", "Thyroid hormone (IV)", "Myxoedema coma", "Adults (intensive care)", "Levothyroxine", "Loading 200–400 µg, then 1.6 µg/kg/day reduced to 75% while IV", "IV", "Loading dose, then once daily", "Until oral or enteral route possible", "Not covered by the cited guideline.", NOT_ABX, NS, NS, ["Heart rhythm, temperature, consciousness, free T4"], ["Lower dose for small or older patients, coronary disease or arrhythmia (ATA 2014)"], "ata14", "recommendation 21a"),
  rx("Pregnancy", "Dose increase at confirmation", "Pre-existing hypothyroidism in pregnancy", "Pregnant women already on levothyroxine", "Levothyroxine", "Two extra doses per week of the current daily dose (one extra dose twice weekly, several days apart)", "Oral", "Daily plus 2 extra doses weekly", "From confirmation of pregnancy; titrate to trimester-specific TSH", "Not applicable.", NOT_ABX, "No adjustment needed.", "No adjustment needed.", ["TSH every 4 weeks in the first half of pregnancy and again in the second half (ATA 2014)"], ["Separate from iron and calcium"], "ata14", "recommendation 6b"),
  rx("Congenital hypothyroidism", "Thyroid hormone replacement", "Congenital hypothyroidism", "Newborns", "Levothyroxine", "10–15 mcg/kg/day", "Oral (crushed tablet)", "Once daily", "Lifelong unless re-evaluation shows transient disease", "This is the paediatric dose (ICMR STW).", NOT_ABX, NS, NS, ["TSH and FT4 at 2 and 4 weeks, then regularly"], ["Do not mix with soy formula"], "thy", "section Newborn screening")],
 medNote="All doses are from the ICMR Hypothyroidism STW (July 2022). Hydrocortisone, myxoedema coma and pregnancy doses are from the Endocrine Society (2016) and ATA (2014) guidelines because the ICMR workflow gives none. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Hypothyroidism across the lifespan in India.", "learningObjectives": ["Interpret TSH and FT4 patterns.", "Dose levothyroxine by group.", "Act on newborn screening results."],
  "keyPoints": ["Adults 1.6–1.8 mcg/kg/day.", "Older or CAD: start 12.5–25 mcg.", "Central: treat cortisol first; monitor FT4.", "Newborn TSH above 30 on screening: confirm and treat 10–15 mcg/kg/day."],
  "pitfalls": ["Using TSH to monitor central disease.", "Full dose in CAD.", "Taking levothyroxine with iron or calcium.", "Delaying treatment of congenital disease."],
  "references": [tref("thy", "sections Diagnosis, Newborn screening, Treatment, Follow-up"), tref("ata14", "recommendations 6b, 21a, 21b"), tref("es16", "recommendations 3.2, 4.1")]},
 nonClinical={"patientEducation": ["Take levothyroxine daily on an empty stomach.", "Do not stop; treatment is usually lifelong.", "Tell the doctor if pregnant — the dose usually needs changing."], "lifestyleAndDiet": ["Use iodised salt.", "Separate levothyroxine from iron and calcium by 4 hours."], "mdtReferrals": ["Endocrinologist for central or congenital disease, pregnancy or myxoedema coma", "Paediatrician for congenital hypothyroidism"], "dischargeCriteria": ["Not applicable for outpatient care"], "followUpPlan": "TSH (or FT4 in central disease) 6–8 weeks after each dose change, then yearly when stable."})
save("t18_hypothyroid.json", [T])
