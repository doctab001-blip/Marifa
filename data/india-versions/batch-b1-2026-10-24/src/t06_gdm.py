from h import *
NA = "Not applicable: maternal medicine in pregnancy."
T = topic(
 id="a1cb9bb7-6fef-545e-868a-a06fb99e2c3d",
 title="Gestational diabetes (India)",
 specialty="Obstetrics / Endocrinology", authority="MoHFW", pillar="Safe Birth",
 scope="Pregnant women in India screened and treated for gestational diabetes mellitus (GDM) under the MoHFW national technical and operational guidelines (2018), including newborn hypoglycaemia care and postpartum follow-up.",
 findings=[
  "Universal testing schedule, single-step 75 g test and threshold, medical nutrition therapy, targets, insulin starting and titration, metformin position, referral criteria, fetal surveillance, timing of delivery, intrapartum glucose control, neonatal care and postpartum testing checked against the MoHFW GDM guidelines (sections 3–12).",
  "Metformin renal and hepatic cautions checked against the US label.",
  "Not clinically reviewed."],
 unverified=[
  "The guideline document read was truncated after section 12.5; annexes were not reviewed.",
  "Metformin renal thresholds come from the US label, not the MoHFW guideline.",
  "Normal glucose ranges in non-pregnant adults are typical values; pregnancy targets are from the MoHFW guideline."],
 summary="Gestational diabetes mellitus (GDM) is hyperglycaemia first recognised in pregnancy. Placental hormones (human placental lactogen, progesterone, cortisol) cause rising insulin resistance through the second and third trimesters; women whose beta cells cannot compensate develop hyperglycaemia. Maternal glucose crosses the placenta but insulin does not, so fetal hyperinsulinaemia causes macrosomia, shoulder dystocia, polyhydramnios and neonatal hypoglycaemia, and raises the risk of pre-eclampsia and stillbirth. South Asian women have a high risk, so India tests every pregnant woman with a single-step 75 g oral glucose load irrespective of the last meal, with a 2-hour plasma glucose of 140 mg/dL or more defining GDM (MoHFW 2018). Women with GDM carry a long-term risk of type 2 diabetes and need lifelong screening.",
 mechanisms=[
  "Placental hormones increase insulin resistance after mid-pregnancy.",
  "Inadequate beta-cell compensation causes maternal hyperglycaemia.",
  "Fetal hyperinsulinaemia causes macrosomia and neonatal hypoglycaemia.",
  "Underlying insulin resistance persists, raising later type 2 diabetes risk."],
 presentation={
  "symptoms": ["Usually none; detected by universal testing (MoHFW)", "Polyuria or thirst if severe"],
  "physicalSigns": ["Fundal height larger than dates", "Polyhydramnios", "Raised blood pressure or proteinuria (associated pre-eclampsia)"],
  "redFlags": ["Vomiting and unable to eat (MoHFW referral criterion)", "Fasting glucose above 200 mg/dL, or above 150 mg/dL fasting or 250 mg/dL post-meal despite treatment (MoHFW)", "2-hour post-meal glucose above 200 mg/dL at any time (MoHFW)", "More than one hypoglycaemic episode in a day, or insulin above 20 units/day (MoHFW)", "Fewer than 10 fetal movements in 2 hours after a meal (MoHFW)"],
  "precipitants": ["Obesity", "Family history of diabetes", "Previous GDM or large baby", "South Asian ethnicity (universal testing in India)"]},
 differentials=[
  ("Overt (pre-existing) diabetes", "Hyperglycaemia early in pregnancy; postpartum OGTT stays diabetic (fasting ≥126 or 2-hour ≥200 mg/dL)."),
  ("Large-for-dates from other causes", "Wrong dates, twins or polyhydramnios without hyperglycaemia."),
  ("Glycosuria of pregnancy", "Urine glucose with normal plasma glucose.")],
 criteria=[
  ("Diagnosis (MoHFW)", "2-hour plasma glucose ≥140 mg/dL after 75 g oral glucose, fasting or non-fasting."),
  ("Testing schedule (MoHFW)", "First antenatal contact; if negative, repeat at 24–28 weeks and at least 4 weeks later; women first seen after 28 weeks are tested once."),
  ("Targets (MoHFW)", "2-hour post-meal below 120 mg/dL; fasting below 95 mg/dL during insulin titration."),
  ("Postpartum OGTT at 6 weeks (MoHFW)", "Fasting ≥126 mg/dL = diabetes; 2-hour below 140 normal, 140–199 impaired glucose tolerance, ≥200 diabetes."),
  ("Neonatal hypoglycaemia (MoHFW)", "Below 45 mg/dL, or below 54 mg/dL in growth-restricted babies.")],
 ruleIn=[
  inv("laboratory", "75 g oral glucose test (DIPSI single step)", "2-hour plasma-calibrated glucometer reading", "GDM", "2-hour value below 140 mg/dL", "2-hour value ≥140 mg/dL", "Diagnoses GDM; repeat next day if vomiting within 30 minutes (MoHFW).", "gdm", "sections 3 and 4.5, pp. 3–5"),
  inv("laboratory", "Self or clinic glucose monitoring", "Fasting and 2-hour post-meal capillary glucose", "Glycaemic control", "Fasting below 95 mg/dL; 2-hour below 120 mg/dL (pregnancy targets)", "Above target after 2 weeks of nutrition therapy", "Triggers insulin or metformin (MoHFW).", "gdm", "section 4.7, p. 6 and flowchart p. 13"),
  inv("firstLineImaging", "Growth ultrasound", "Fetal biometry and amniotic fluid", "Macrosomia, growth restriction, polyhydramnios", "Growth on centile; normal liquor", "Estimated weight above 4 kg, growth restriction or polyhydramnios", "Scan at 28–30 and 34–36 weeks (MoHFW).", "gdm", "section Fetal surveillance, p. 16"),
  inv("firstLineImaging", "Anomaly ultrasound", "Level II scan", "Fetal anomalies", "No structural anomaly", "Structural anomaly", "At 18–20 weeks if GDM was diagnosed before 20 weeks (MoHFW).", "gdm", "section Fetal surveillance, p. 16"),
  inv("laboratory", "Postpartum 75 g OGTT", "Fasting and 2-hour plasma glucose", "Persistent diabetes or impaired tolerance", "Fasting below 126 mg/dL; 2-hour below 140 mg/dL", "Fasting ≥126 or 2-hour ≥200 mg/dL (diabetes); 2-hour 140–199 (IGT)", "At 6 weeks postpartum; link abnormal results to the NCD programme (MoHFW).", "gdm", "section Postpartum follow-up, p. 22")],
 ruleOut=[
  inv("laboratory", "Blood pressure and urine protein", "Sphygmomanometer and dipstick", "Pre-eclampsia", "BP below 140/90 mmHg; no proteinuria", "Hypertension or proteinuria", "Monitor in GDM (MoHFW).", "gdm", "section Fetal surveillance, p. 17"),
  inv("laboratory", "Neonatal capillary glucose", "Heel-prick glucometer", "Neonatal hypoglycaemia", "45 mg/dL or above", "Below 45 mg/dL (below 54 in growth-restricted babies)", "Within 1 hour of birth, then before feeds every 4 hours until 4 stable readings (MoHFW).", "gdm", "section Neonatal care, pp. 18–19")],
 management=[
  step("test", "Universal testing", "First antenatal visit and 24–28 weeks", ["Test every pregnant woman with 75 g glucose in about 300 mL water drunk within 5–10 minutes, fasting or not (MoHFW).", "Read the 2-hour value on a plasma-calibrated glucometer (MoHFW)."]),
  step("mnt", "Medical nutrition therapy", "First 2 weeks after diagnosis", ["Start nutrition therapy and 30 minutes of daily walking (MoHFW).", "Three small meals and 2–3 snacks with complex carbohydrates; about 350 kcal/day extra in the second and third trimesters; avoid severe calorie restriction (MoHFW).", "Recheck 2-hour post-meal glucose after 2 weeks; if below 120 mg/dL continue and check at least monthly (MoHFW)."]),
  step("medical", "Insulin or metformin", "If post-meal glucose stays ≥120 mg/dL", ["Insulin is first line and can start at any gestation (MoHFW).", "Metformin only after 20 weeks if nutrition therapy fails (MoHFW).", "Check fasting and 2-hour glucose every third day and titrate in 2-unit steps (MoHFW).", "Refer if insulin exceeds 20 units/day or metformin 2 g/day, or any referral criterion is met (MoHFW)."]),
  step("delivery", "Surveillance and delivery", "Third trimester and labour", ["Teach daily fetal movement counting: 10 movements in 2 hours after a meal lying on the side (MoHFW).", "Well-controlled GDM: deliver in a facility; induce at or after 39 weeks if not in labour (MoHFW).", "Uncontrolled GDM: refer at 34–36 weeks to a CEmOC centre (MoHFW).", "Vaginal birth preferred; consider caesarean at 39 weeks if estimated fetal weight is above 4 kg (MoHFW)."], [("Labour or induction", ["Withhold the morning insulin or metformin; glucose every 2 hours; normal saline 100 mL/hour with insulin added by glucose level (MoHFW)."])]),
  step("postpartum", "After birth", "Birth to 6 weeks and lifelong", ["Breastfeed early; check the baby's glucose within 1 hour (MoHFW).", "75 g OGTT at 6 weeks postpartum; if normal, annual screening and lifestyle advice at the NCD clinic (MoHFW)."])],
 branches=[
  ("Antenatal medical treatment", "Post-meal glucose ≥120 mg/dL after 2 weeks of nutrition therapy."),
  ("Threatened preterm birth", "Delivery needed between 24 and 34 weeks."),
  ("Intrapartum", "Women with GDM on the day of labour or induction."),
  ("Maternal hypoglycaemia", "Maternal glucose below 70 mg/dL."),
  ("Neonatal hypoglycaemia", "Baby of a mother with GDM with glucose below 20 mg/dL or symptomatic.")],
 regimens=[
  rx("Antenatal medical treatment", "Glucose-lowering drug", "GDM not controlled by nutrition therapy", "Pregnant women, any gestation", "Human premix insulin 30/70", "4 units (2-hour glucose 120–160), 6 units (160–200) or 8 units (above 200 mg/dL); adjust by 2 units every third day", "SC", "Once daily, 30 minutes before breakfast; add a pre-dinner dose if fasting stays high", "Until delivery; refer above 20 units/day", NA, NOT_ABX, NS, NS, ["Fasting and 2-hour glucose every third day", "Hypoglycaemia symptoms"], ["Hypoglycaemia: keep glucose or sugar at home (MoHFW)"], "gdm", "section Insulin, pp. 11–13", sel="one-of", pref=True),
  rx("Antenatal medical treatment", "Glucose-lowering drug", "GDM not controlled by nutrition therapy", "Pregnant women after 20 weeks", "Metformin", "500 mg twice daily, up to 2 g/day", "Oral", "Twice daily with meals", "Until delivery; add insulin if control is inadequate at maximum dose", NA, NOT_ABX, "Contraindicated if eGFR below 30; starting not recommended at eGFR 30–45 (label).", "Not recommended in hepatic impairment (label section 8.7).", ["Glucose", "Gastrointestinal side effects"], ["Before 20 weeks (MoHFW)", "Lactic acidosis risk factors: renal or hepatic impairment, hypoxia (label)"], "gdm", "section Metformin, pp. 11–12", sel="one-of", pref=False, use="After 20 weeks when nutrition therapy fails and oral treatment is chosen (MoHFW).", extra_adj=("Renal and hepatic advice from the metformin label (DailyMed), sections 4, 5.1 and 8.7.",)),
  rx("Threatened preterm birth", "Antenatal corticosteroid", "Fetal lung maturity", "Women with GDM needing delivery at 24–34 weeks", "Dexamethasone", "6 mg", "IM", "Every 12 hours", "2 days (4 doses)", NA, NOT_ABX, NS, NS, ["Glucose closely for 72 hours (MoHFW)"], ["Expect a rise in glucose; adjust insulin"], "gdm", "section Fetal surveillance, p. 17"),
  rx("Intrapartum", "IV fluid with insulin", "Glucose control in labour", "Women with GDM in labour or induction", "Sodium chloride 0.9% with regular insulin", "100 mL/hour; regular insulin in each 500 mL: 0 units (glucose 90–120), 4 units (120–140), 6 units (140–180), 8 units (above 180 mg/dL)", "IV", "Continuous; adjust to 2-hourly glucose", "Until delivery", NA, NOT_ABX, NS, NS, ["Capillary glucose every 2 hours (MoHFW)"], ["Hypoglycaemia"], "gdm", "section Intrapartum care, p. 18"),
  rx("Maternal hypoglycaemia", "Oral glucose", "Maternal glucose below 70 mg/dL", "Conscious pregnant women", "Glucose (oral)", "15–20 g, then food after 15 minutes", "Oral", "Once; repeat if still low", "Single episode", NA, NOT_ABX, NS, NS, ["Recheck glucose after 15 minutes"], ["Unconscious: needs IV treatment and referral"], "gdm", "section Hypoglycaemia, p. 16"),
  rx("Neonatal hypoglycaemia", "IV dextrose", "Neonatal glucose below 20 mg/dL", "Newborns of mothers with GDM", "Dextrose 10%", "2 mL/kg bolus, then 100 mL/kg/day", "IV", "Bolus then continuous", "Until glucose stable; refer if still below 20 mg/dL after 30 minutes or seizures", "This is the neonatal regimen (MoHFW).", NOT_ABX, NS, NS, ["Glucose 30 minutes after bolus, then before feeds"], ["Treat milder hypoglycaemia with breastfeeding first (MoHFW)"], "gdm", "section Neonatal hypoglycaemia, p. 20")],
 medNote="Doses are from the MoHFW GDM technical and operational guidelines (2018); metformin renal and hepatic advice is from the US label. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "GDM in Indian antenatal care.", "learningObjectives": ["Test every pregnant woman with the 75 g single-step test.", "Start nutrition therapy, then insulin with a simple titration rule.", "Plan delivery, newborn glucose checks and postpartum testing."],
  "keyPoints": ["2-hour glucose ≥140 mg/dL after 75 g glucose, fasting or not.", "Target 2-hour post-meal below 120 mg/dL.", "Insulin first line; metformin only after 20 weeks.", "75 g OGTT at 6 weeks postpartum."],
  "pitfalls": ["Testing only 'high-risk' women.", "Delaying insulin beyond 2 weeks of failed nutrition therapy.", "Forgetting the baby's glucose check.", "No postpartum OGTT."],
  "references": [tref("gdm", "sections 3, 4.4–4.7, 4.11, Insulin and metformin pp. 11–14, Referral p. 15, Fetal surveillance pp. 16–17, Delivery pp. 17–18, Neonatal care pp. 18–21, Postpartum p. 22"), tref("met", "sections 4, 5.1, 8.7")]},
 nonClinical={"patientEducation": ["Count fetal movements daily after a meal (MoHFW).", "Store insulin at 4–8°C, never frozen; open vials last one month (MoHFW).", "Treat low sugar with glucose, then eat (MoHFW)."], "lifestyleAndDiet": ["Three small meals and 2–3 snacks; complex carbohydrates (MoHFW).", "30 minutes of walking daily (MoHFW)."], "mdtReferrals": ["Obstetrician or gynaecologist for antenatal care (MoHFW)", "Physician for insulin above 20 units/day", "NCD clinic after delivery (MoHFW)"], "dischargeCriteria": ["Mother's glucose normal after delivery", "Baby has 4 stable glucose readings (MoHFW)", "Postpartum OGTT booked at 6 weeks"], "followUpPlan": "75 g OGTT at 6 weeks postpartum; annual diabetes screening if normal; link to the NCD programme if impaired or diabetic (MoHFW)."})
save("t06_gdm.json", [T])
