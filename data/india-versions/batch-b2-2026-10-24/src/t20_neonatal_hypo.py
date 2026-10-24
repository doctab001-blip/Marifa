from h import *
L = "section Management"
SC = "section Screening"
PAED = "This is a neonatal dose (ICMR STW)."
TITLE = "Neonatal hypoglycaemia (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Neonatology / Paediatrics", authority="ICMR", pillar="Safe Birth",
 scope="Newborns at risk of or with hypoglycaemia in India: screening groups and schedule, operational threshold, feeding, IV dextrose, glucose infusion rate titration, weaning and refractory hypoglycaemia, built on the ICMR Neonatal Hypoglycemia workflow (July 2020).",
 findings=[
  "At-risk groups, screening schedule, operational threshold of 45 mg/dL, feeding and recheck, dextrose bolus, glucose infusion rate (GIR) start, increments, maximum and weaning, and refractory hypoglycaemia drugs checked against the ICMR Neonatal Hypoglycemia STW (July 2020).",
  "Not clinically reviewed."],
 unverified=[
  "The glucagon dose in the ICMR workflow text could not be confirmed; glucagon doses are from the Liggins Institute (Auckland) neonatal hypoglycaemia guideline.",
  "Normal glucose values are typical neonatal values; meter accuracy below 40 mg/dL is poor, so confirm with a laboratory sample."],
 summary="Neonatal hypoglycaemia is a low blood glucose in the newborn, the commonest metabolic problem in neonatal care. After birth the placental glucose supply stops and the baby depends on glycogen breakdown, gluconeogenesis and early feeds. Babies with limited stores (preterm, small for gestational age, intrauterine growth restriction), increased insulin (infants of diabetic mothers, large for gestational age) or high demand (sepsis, asphyxia, hypothermia) are at risk. Many are asymptomatic; symptoms include jitteriness, poor feeding, lethargy, hypotonia, apnoea, cyanosis and seizures. Untreated it can cause permanent brain injury. The ICMR workflow uses an operational threshold of 45 mg/dL for intervention, early breastfeeding for asymptomatic babies and IV dextrose by glucose infusion rate (GIR) for symptomatic or very low values (ICMR STW).",
 mechanisms=[
  "Loss of placental glucose supply at birth.",
  "Low glycogen stores in preterm and growth-restricted babies.",
  "Hyperinsulinism in infants of diabetic mothers.",
  "Increased glucose use in sepsis, asphyxia and hypothermia."],
 presentation={
  "symptoms": ["Often asymptomatic", "Poor feeding, lethargy", "Jitteriness, irritability"],
  "physicalSigns": ["Hypotonia, weak cry", "Apnoea, cyanosis, tachypnoea", "Hypothermia", "Seizures"],
  "redFlags": ["Seizures or apnoea", "Blood glucose below 20 mg/dL (ICMR STW)", "Needing GIR above 12 mg/kg/min (refractory) (ICMR STW)", "Persistent hypoglycaemia beyond the first days of life"],
  "precipitants": ["Preterm birth", "Small or large for gestational age", "Infant of a diabetic mother", "Sepsis, asphyxia, hypothermia", "Delayed feeding"]},
 differentials=[
  ("Neonatal sepsis", "Temperature instability, poor perfusion; may coexist."),
  ("Hypocalcaemia", "Jitteriness or seizures with normal glucose."),
  ("Hypoxic-ischaemic encephalopathy", "History of asphyxia, encephalopathy."),
  ("Inborn errors of metabolism", "Persistent hypoglycaemia, acidosis, hepatomegaly."),
  ("Congenital hyperinsulinism", "High GIR need; glucose below threshold with detectable insulin.")],
 criteria=[
  ("Operational threshold (ICMR STW)", "Blood glucose below 45 mg/dL needs intervention."),
  ("Screening groups (ICMR STW)", "Preterm, small or large for gestational age, infants of diabetic mothers, and sick newborns."),
  ("Symptomatic or severe (ICMR STW)", "Symptoms, or blood glucose below 20 mg/dL: IV dextrose."),
  ("Refractory hypoglycaemia (ICMR STW)", "Hypoglycaemia despite GIR of 12 mg/kg/min.")],
 ruleIn=[
  inv("laboratory", "Bedside blood glucose", "Glucometer, heel prick", "Hypoglycaemia", "45 mg/dL or above", "Below 45 mg/dL", "Screen at-risk babies on the ICMR schedule (ICMR STW).", "nhypo", SC),
  inv("laboratory", "Laboratory plasma glucose", "Venous sample", "Confirmation", "45 mg/dL or above", "Below 45 mg/dL", "Confirms low meter readings; do not delay treatment.", "nhypo", SC),
  inv("specializedAdjunctive", "Glucose infusion rate (GIR) calculation", "Bedside calculation", "Severity", "Below 8 mg/kg/min", "Above 12 mg/kg/min needed", "High GIR need defines refractory disease (ICMR STW).", "nhypo", L)],
 ruleOut=[
  inv("laboratory", "Critical sample during hypoglycaemia (refractory cases)", "Insulin, cortisol, growth hormone, ketones", "Hyperinsulinism or endocrine cause", "Insulin suppressed; ketones present", "Detectable insulin; low ketones", "Identifies the cause of refractory hypoglycaemia (ICMR STW).", "nhypo", L),
  inv("laboratory", "Sepsis screen", "Blood count, C-reactive protein, blood culture", "Neonatal sepsis", "Normal", "Abnormal", "Sepsis is a common cause and coexists.", "nhypo", L)],
 management=[
  step("screen", "Screen at-risk babies", "From birth", ["Check glucose in at-risk groups on the ICMR schedule in the first days of life (ICMR STW).", "Start breastfeeding within the first hour and keep the baby warm."]),
  step("asymptomatic", "Asymptomatic, glucose 20–44 mg/dL", "Immediately", ["Feed (breast milk) and recheck glucose at 1 hour (ICMR STW).", "If still below 45 mg/dL, start IV dextrose (ICMR STW)."]),
  step("symptomatic", "Symptomatic or glucose below 20 mg/dL", "Immediately", ["10% dextrose 2 mL/kg IV bolus, then infusion at GIR 6 mg/kg/min (ICMR STW).", "Recheck glucose in 30–60 minutes; increase GIR by 2 mg/kg/min up to 12 mg/kg/min (ICMR STW)."]),
  step("wean", "Wean", "After 24 hours stable", ["When glucose is stable above 45 mg/dL, reduce GIR gradually while increasing feeds (ICMR STW)."]),
  step("refractory", "Refractory hypoglycaemia", "GIR above 12 mg/kg/min", ["Send a critical sample and refer to a neonatal unit; add hydrocortisone, then diazoxide or octreotide (ICMR STW)."], [("Persistent hyperinsulinism", ["Specialist neonatal or endocrine care."])])],
 branches=[
  ("Symptomatic or glucose below 20 mg/dL", "Symptoms or very low glucose."),
  ("Refractory hypoglycaemia", "Hypoglycaemia despite GIR 12 mg/kg/min."),
  ("IV access delayed", "Hypoglycaemia needing IV dextrose when IV access cannot be established promptly.")],
 regimens=[
  rx("Symptomatic or glucose below 20 mg/dL", "Dextrose bolus", "Symptomatic hypoglycaemia", "Newborns", "Dextrose 10%", "2 mL/kg", "IV", "Once, over a few minutes", "Single bolus", PAED, NOT_ABX, NS, NS, ["Glucose in 30–60 minutes"], ["Avoid concentrated dextrose bolus"], "nhypo", L),
  rx("Symptomatic or glucose below 20 mg/dL", "Dextrose infusion", "Maintenance of glucose", "Newborns", "Dextrose 10% infusion", "GIR 6 mg/kg/min; increase by 2 mg/kg/min to maximum 12 mg/kg/min", "IV", "Continuous", "Until stable, then wean", PAED, NOT_ABX, NS, NS, ["Glucose every 1–3 hours until stable", "Fluid volume"], ["Peripheral concentration limits for dextrose"], "nhypo", L),
  rx("Refractory hypoglycaemia", "Refractory treatment", "Refractory hypoglycaemia", "Newborns", "Hydrocortisone", "5 mg/kg/day", "IV or oral", "In 2 divided doses", "Until glucose stable", PAED, NOT_ABX, NS, NS, ["Glucose", "Blood pressure"], ["Send critical sample first"], "nhypo", L, sel="one-of", pref=True),
  rx("Refractory hypoglycaemia", "Refractory treatment", "Hyperinsulinism", "Newborns", "Diazoxide", "10–25 mg/kg/day", "Oral", "In 3 divided doses", "As directed by specialist", PAED, NOT_ABX, NS, NS, ["Fluid retention, glucose"], ["Fluid overload, heart failure"], "nhypo", L, sel="one-of", pref=False, use="Hyperinsulinism suspected, under specialist care."),
  rx("Refractory hypoglycaemia", "Refractory treatment", "Hyperinsulinism", "Newborns", "Octreotide", "2–10 µg/kg/day", "Subcutaneous or IV", "In divided doses", "As directed by specialist", PAED, NOT_ABX, NS, NS, ["Glucose", "Feeding tolerance"], ["Necrotising enterocolitis risk"], "nhypo", L, sel="one-of", pref=False, use="Diazoxide ineffective or unsuitable, under specialist care."),
  rx("Refractory hypoglycaemia", "Refractory treatment", "Refractory hypoglycaemia", "Newborns", "Glucagon (infusion)", "5–20 µg/kg/hour", "IV infusion", "Continuous", "As directed by specialist", PAED, NOT_ABX, NS, NS, ["Glucose", "Sodium, platelets"], ["Not effective with depleted glycogen (small or preterm babies)"], "nzhypo", "section Treatment, Question 26", sel="one-of", pref=False, use="Refractory hypoglycaemia while the cause is investigated, under specialist care."),
  rx("IV access delayed", "Bridge until IV access", "Hypoglycaemia needing IV glucose", "Newborns", "Glucagon", "200 µg/kg (0.2 mg/kg)", "IM", "Once; may repeat after about 1 hour if IV access still difficult", "Until IV access established", PAED, NOT_ABX, NS, NS, ["Glucose 30–60 minutes after"], ["Response may be smaller with a second dose"], "nzhypo", "section Treatment, Question 26")],
 medNote="All doses are from the ICMR Neonatal Hypoglycemia STW (July 2020). Glucagon doses are from the Liggins Institute neonatal hypoglycaemia guideline (Question 26) because the ICMR dose could not be confirmed. India-only topic. Not clinically reviewed.",
 teaching={"scope": "Neonatal hypoglycaemia in India.", "learningObjectives": ["Screen at-risk newborns.", "Act on the 45 mg/dL threshold.", "Calculate and titrate GIR."],
  "keyPoints": ["Threshold 45 mg/dL.", "Asymptomatic: feed and recheck at 1 hour.", "Symptomatic or below 20: 2 mL/kg 10% dextrose, then GIR 6.", "Maximum GIR 12; above that is refractory."],
  "pitfalls": ["Relying on glucometer readings below 40 mg/dL.", "Delaying feeds.", "Concentrated dextrose boluses.", "Stopping the infusion abruptly."],
  "references": [tref("nhypo", "sections Screening, Management"), tref("nzhypo", "section Treatment, Question 26")]},
 nonClinical={"patientEducation": ["Early and frequent breastfeeding.", "Keep the baby warm (skin-to-skin).", "Watch for poor feeding or lethargy at home."], "lifestyleAndDiet": ["Exclusive breastfeeding."], "mdtReferrals": ["Neonatal unit for refractory hypoglycaemia", "Paediatric endocrinologist for hyperinsulinism"], "dischargeCriteria": ["Normal glucose on full enteral feeds without IV support", "Feeding well", "Cause identified for persistent hypoglycaemia"], "followUpPlan": "Neurodevelopmental follow-up for babies with symptomatic or prolonged hypoglycaemia."})
save("t20_neonatal_hypo.json", [T])
