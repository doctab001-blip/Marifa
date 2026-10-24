from h import *
TX = "section Treatment"
DX = "section Evaluation"
TL = "section 2 Dosage and Administration"
TITLE = "Hyponatraemia in adults (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Internal Medicine / Nephrology / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with hyponatraemia in India: recognition of severe symptoms, classification by volume status and urine sodium, hypertonic saline, correction limits, fluid restriction and tolvaptan, built on the ICMR Approach to Hyponatremia workflow (July 2022) and the tolvaptan US label.",
 findings=[
  "Definition, severity, evaluation steps, urine sodium interpretation, 3% saline rates for acute and chronic hyponatraemia, correction limits and fluid restriction checked against the ICMR Approach to Hyponatremia STW (July 2022).",
  "Tolvaptan dose, initiation in hospital, maximum duration, liver-disease restriction, fluid-restriction advice and overcorrection risk checked against the DailyMed tolvaptan (Samsca) label.",
  "Not clinically reviewed."],
 unverified=[
  "Paediatric hyponatraemia is outside the adult workflow.",
  "The ICMR workflow and the tolvaptan label differ on the overcorrection threshold (8–10 vs 12 mmol/L per 24 hours); both are shown."],
 summary="Hyponatraemia is a serum sodium below 135 mmol/L and is the commonest electrolyte disorder in hospital. Most cases reflect water retention relative to sodium, usually driven by non-osmotic antidiuretic hormone (ADH) release: in hypovolaemia (vomiting, diarrhoea, diuretics), in hypervolaemic states (heart failure, cirrhosis, kidney disease) and in the syndrome of inappropriate ADH (SIADH) from drugs, lung or brain disease. Low plasma tonicity moves water into cells; brain swelling causes headache, nausea, confusion, seizures and coma, worst when the fall is acute (under 48 hours). In chronic hyponatraemia the brain adapts by losing solutes, so overly rapid correction can cause osmotic demyelination syndrome (ODS). Management depends on symptoms, duration and volume status: hypertonic saline for severe symptoms, saline for hypovolaemia, fluid restriction for SIADH, and treatment of the cause, always within daily correction limits (ICMR STW).",
 mechanisms=[
  "Non-osmotic ADH release causes water retention.",
  "Hypotonicity drives water into brain cells, causing cerebral oedema.",
  "Chronic adaptation lowers brain cell solutes.",
  "Rapid correction after adaptation causes osmotic demyelination."],
 presentation={
  "symptoms": ["Nausea, headache, malaise", "Confusion, drowsiness, falls", "Seizures and coma in severe cases"],
  "physicalSigns": ["Volume status: dry mucosa and postural drop (hypovolaemic), oedema or ascites (hypervolaemic), or euvolaemia", "Reduced consciousness", "Signs of the underlying cause"],
  "redFlags": ["Seizures, coma, vomiting or severe confusion: give hypertonic saline (ICMR STW)", "Acute fall within 48 hours", "Sodium below 120 mmol/L", "Rise above the daily correction limit — risk of ODS"],
  "precipitants": ["Thiazide diuretics", "Vomiting and diarrhoea", "Heart failure, cirrhosis, kidney disease", "SIADH from drugs, pneumonia, brain injury or cancer", "Hypothyroidism and adrenal insufficiency"]},
 differentials=[
  ("Pseudohyponatraemia", "Normal serum osmolality with severe hyperlipidaemia or hyperproteinaemia."),
  ("Hypertonic hyponatraemia", "High serum osmolality from hyperglycaemia or mannitol."),
  ("Hypovolaemic hyponatraemia", "Clinical dehydration; urine sodium below 20 mmol/L if extrarenal loss (ICMR STW)."),
  ("SIADH", "Euvolaemic, concentrated urine, urine sodium above 20 mmol/L (ICMR STW)."),
  ("Adrenal insufficiency or hypothyroidism", "Exclude before diagnosing SIADH.")],
 criteria=[
  ("Hyponatraemia", "Serum sodium below 135 mmol/L."),
  ("Acute vs chronic", "Acute: documented within 48 hours; otherwise treat as chronic (ICMR STW)."),
  ("Urine sodium (ICMR STW)", "Below 20 mmol/L suggests extrarenal sodium loss or hypervolaemic state; above 20 mmol/L suggests renal loss or SIADH."),
  ("Correction limit (ICMR STW)", "Do not raise sodium by more than 8–10 mmol/L in 24 hours."),
  ("Target for severe symptoms (ICMR STW)", "Initial rise of 4–6 mmol/L.")],
 ruleIn=[
  inv("laboratory", "Serum sodium", "Serum electrolytes", "Hyponatraemia and its severity", "135–145 mmol/L", "Below 135 mmol/L", "Repeat every 2–4 hours during hypertonic saline.", "na", DX),
  inv("laboratory", "Serum osmolality", "Measured osmolality", "True hypotonic hyponatraemia", "275–295 mOsm/kg", "Below 275 mOsm/kg", "Excludes pseudo- and hypertonic hyponatraemia (ICMR STW).", "na", DX),
  inv("laboratory", "Urine osmolality", "Spot urine", "ADH activity", "Below 100 mOsm/kg with water excess", "Above 100 mOsm/kg", "Concentrated urine suggests ADH action.", "na", DX),
  inv("laboratory", "Urine sodium", "Spot urine", "Renal vs extrarenal loss; SIADH", "Depends on intake", "Below 20 or above 20 mmol/L", "Classifies the cause (ICMR STW).", "na", DX)],
 ruleOut=[
  inv("laboratory", "Glucose, lipids and protein", "Serum", "Pseudo- and hypertonic hyponatraemia", "Normal", "Severe hyperglycaemia or hyperlipidaemia", "Excludes non-hypotonic causes.", "na", DX),
  inv("specializedAdjunctive", "Thyroid-stimulating hormone and morning cortisol", "Serum", "Hypothyroidism and adrenal insufficiency", "Normal for the assay", "High TSH or low cortisol", "Must be excluded before diagnosing SIADH.", "na", DX)],
 management=[
  step("severe", "Severe symptoms", "Immediately", ["3% saline at 1–2 mL/kg/hour in acute hyponatraemia, aiming for a rise of 4–6 mmol/L (ICMR STW).", "Chronic hyponatraemia with symptoms: 3% saline 0.5–1 mL/kg/hour (ICMR STW).", "Check sodium every 2–4 hours; stop hypertonic saline when symptoms settle."]),
  step("classify", "Classify the cause", "After stabilisation", ["Serum and urine osmolality, urine sodium and volume status (ICMR STW).", "Exclude hypothyroidism and adrenal insufficiency."]),
  step("treat", "Treat by volume status", "Hours to days", ["Hypovolaemic: 0.9% saline (ICMR STW).", "SIADH: fluid restriction 500–1000 mL/day (ICMR STW); treat or stop the cause.", "Hypervolaemic: treat the heart, liver or kidney disease; restrict fluid."]),
  step("limit", "Respect the correction limit", "Throughout", ["Do not exceed 8–10 mmol/L rise in 24 hours (ICMR STW).", "If overcorrecting, seek specialist advice to slow or reverse the rise."], [("Rise above the limit", ["Stop saline or tolvaptan and seek specialist advice."])])],
 branches=[
  ("Severe symptoms — acute", "Seizures, coma or severe confusion with onset within 48 hours."),
  ("Severe symptoms — chronic", "Severe symptoms with onset over 48 hours or unknown."),
  ("Hypovolaemic", "Clinical volume depletion."),
  ("SIADH", "Euvolaemic hyponatraemia with SIADH criteria.")],
 regimens=[
  rx("Severe symptoms — acute", "Hypertonic saline", "Severe symptomatic acute hyponatraemia", "Adults", "Sodium chloride 3%", "1–2 mL/kg/hour", "IV", "Continuous infusion", "Until symptoms settle or a 4–6 mmol/L rise", NS, NOT_ABX, "Monitor fluid overload.", "Monitor fluid overload.", ["Sodium every 2–4 hours", "Neurological state"], ["Do not exceed 8–10 mmol/L in 24 hours"], "na", TX),
  rx("Severe symptoms — chronic", "Hypertonic saline", "Severe symptomatic chronic hyponatraemia", "Adults", "Sodium chloride 3%", "0.5–1 mL/kg/hour", "IV", "Continuous infusion", "Until symptoms settle", NS, NOT_ABX, "Monitor fluid overload.", "Monitor fluid overload.", ["Sodium every 2–4 hours"], ["Do not exceed 8–10 mmol/L in 24 hours"], "na", TX),
  rx("Hypovolaemic", "Isotonic saline", "Hypovolaemic hyponatraemia", "Adults", "Sodium chloride 0.9%", "Volume guided by clinical status", "IV", "Continuous infusion", "Until euvolaemic", NS, NOT_ABX, "Monitor fluid overload.", "Monitor fluid overload.", ["Sodium, urine output"], ["Correction limit applies; urine output rise may signal rapid correction"], "na", TX),
  rx("SIADH", "SIADH treatment", "SIADH", "Adults", "Fluid restriction", "500–1000 mL/day", "Oral", "Daily", "Until cause resolved", NS, NOT_ABX, NS, NS, ["Sodium, weight"], ["Not for hypovolaemic hyponatraemia"], "na", TX, sel="one-of", pref=True),
  rx("SIADH", "SIADH treatment", "SIADH not responding to fluid restriction", "Adults in hospital", "Tolvaptan", "15 mg, then 30 mg; maximum 60 mg", "Oral", "Once daily", "Maximum 30 days", "Not established in children (label).", NOT_ABX, NS, "Avoid in underlying liver disease, including cirrhosis (label).", ["Sodium closely in hospital at initiation and re-initiation", "Liver tests"], ["Start only in hospital (label)", "Do not fluid-restrict in the first 24 hours (label)", "Rise above 12 mmol/L in 24 hours risks ODS (label)"], "tolv", TL, sel="one-of", pref=False, use="Fluid restriction fails or is not tolerated, after specialist review.")],
 medNote="Hypertonic and isotonic saline, fluid restriction and correction limits are from the ICMR Approach to Hyponatremia STW (July 2022); tolvaptan detail is from the US label (DailyMed). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Overcorrection limits: ICMR STW vs tolvaptan label", "columns": ["ICMR STW (2022)", "Tolvaptan label (DailyMed)"], "rows": [
   {"parameter": "Maximum rise", "values": ["8–10 mmol/L in 24 hours", "Above 12 mmol/L in 24 hours risks ODS"]},
   {"parameter": "Fluid restriction", "values": ["500–1000 mL/day for SIADH", "Avoid in the first 24 hours of tolvaptan"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult hyponatraemia in India.", "learningObjectives": ["Recognise severe symptoms and give 3% saline.", "Classify by volume status and urine sodium.", "Stay within correction limits."],
  "keyPoints": ["Acute severe: 3% saline 1–2 mL/kg/hour, target +4–6.", "Chronic: 0.5–1 mL/kg/hour.", "Limit 8–10 mmol/L per 24 hours.", "Tolvaptan only in hospital, up to 30 days."],
  "pitfalls": ["Overcorrection causing ODS.", "Saline in SIADH.", "Missing hypothyroidism or adrenal insufficiency.", "Fluid restriction with tolvaptan in the first 24 hours."],
  "references": [tref("na", "sections Evaluation, Treatment"), tref("tolv", "sections 2 Dosage and Administration, Boxed Warning")]},
 nonClinical={"patientEducation": ["Follow the fluid limit if advised.", "Report confusion, headache or vomiting.", "Review diuretics and other causative drugs."], "lifestyleAndDiet": ["Avoid excessive water intake when on fluid restriction."], "mdtReferrals": ["Nephrologist or endocrinologist for recurrent or unexplained hyponatraemia"], "dischargeCriteria": ["Sodium stable and rising within limits", "Symptoms resolved", "Cause identified and plan in place"], "followUpPlan": "Recheck sodium within a week of discharge and after any change to causative drugs."})
save("t19_hyponatraemia.json", [T])
