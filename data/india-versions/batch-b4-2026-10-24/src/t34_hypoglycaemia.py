from h import *
T1 = "sections Hypoglycaemia, Prevention, Sick-day rules"
AD = "sections Classification, Treatment, Therapeutic adjustment"
TITLE = "Hypoglycaemia in people with diabetes (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Endocrinology / Emergency Medicine / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Adults and children with diabetes on insulin or sulfonylureas in India who develop low blood glucose: recognition, treatment at home and in hospital, and prevention. Built on the ICMR Type 1 Diabetes workflow (July 2022) with the American Diabetes Association (ADA) 2025 Standards of Care for hypoglycaemia levels, the 15-gram rule and medicine review. Neonatal hypoglycaemia is a separate topic.",
 findings=[
  "Threshold below 70 mg/dL, severe definition, symptoms, oral glucose, glucagon 1 mg, 25% dextrose 1–2 mL/kg, monitoring for prevention and sick-day rules checked against the ICMR Type 1 Diabetes STW (July 2022).",
  "Level 1–3 definitions, 15 g fast carbohydrate with recheck at 15 minutes, glucagon for insulin users and de-intensifying insulin or sulfonylureas taken from a summary of ADA Standards of Care 2025 section 6.",
  "The ICMR Type 2 Diabetes STW (July 2022) was opened and contains no hypoglycaemia guidance.",
  "Thiamine dose from the ICMR Alcohol Use Disorders STW.",
  "Not clinically reviewed."],
 unverified=[
  "Glucagon dose for small children is not varied by weight in the ICMR STW; check the product label.",
  "The ADA content was read from a published summary, not the full Standards of Care text.",
  "Prolonged sulfonylurea hypoglycaemia may need hours of dextrose infusion; infusion rate not given in the opened sources."],
 summary="Hypoglycaemia is the commonest acute complication of diabetes treatment, caused by insulin or sulfonylureas when food, exercise and medicine are mismatched. The brain depends on glucose, so falling levels first trigger adrenergic warning symptoms (sweating, tremor, hunger) and then neuroglycopenia (confusion, drowsiness, seizures, coma). The ICMR workflow treats glucose below 70 mg/dL; severe hypoglycaemia means the person cannot treat themselves, has seizures or is unconscious. Every episode needs a cause and a medicine review (ADA).",
 mechanisms=[
  "Excess insulin or sulfonylurea effect suppresses liver glucose output and drives uptake into muscle.",
  "Falling glucose triggers adrenaline release: sweating, tremor, palpitations, hunger.",
  "Neuroglycopenia causes confusion, behaviour change, seizures and coma.",
  "Repeated episodes blunt warning symptoms, raising the risk of severe events."],
 presentation={
  "symptoms": ["Sweating, hunger, tremor, irritability, weakness (ICMR STW)", "Drowsiness, seizures or unconsciousness in late stages (ICMR STW)", "Night sweats, nightmares or morning headache (nocturnal hypoglycaemia)"],
  "physicalSigns": ["Pallor, sweating, tachycardia", "Confusion or reduced consciousness", "Focal deficit that resolves with glucose"],
  "redFlags": ["Coma, seizures or unable to treat self: severe (ICMR STW)", "Glucose below 54 mg/dL: level 2 (ADA)", "Recurrent episodes or any severe episode: review medicines (ADA)", "Sulfonylurea-induced hypoglycaemia: may recur for hours — admit", "Hypoglycaemia in a heavy drinker or malnourished patient: give thiamine with glucose"],
  "precipitants": ["Missed or delayed meal; vomiting (ICMR sick-day rules)", "Unplanned exercise (ICMR STW)", "Insulin or sulfonylurea dose too high (ADA)", "Alcohol; kidney impairment"]},
 differentials=[
  ("Stroke or transient ischaemic attack", "Deficit persists after glucose is normal."),
  ("Seizure disorder", "Glucose normal during the event."),
  ("Alcohol intoxication", "Breath alcohol; glucose may also be low — always check."),
  ("Panic attack", "Glucose normal; symptoms do not respond to carbohydrate.")],
 criteria=[
  ("ICMR STW", "Mild or moderate: glucose below 70 mg/dL with or without symptoms. Severe: coma, seizures or unable to treat oneself."),
  ("ADA 2025 levels", "Level 1: below 70 mg/dL. Level 2: below 54 mg/dL. Level 3: severe event needing assistance."),
  ("Recheck (ADA)", "Recheck glucose 15 minutes after treatment and repeat if still low."),
  ("Medicine review (ADA)", "De-intensify insulin or sulfonylureas after recurrent moderate or any severe hypoglycaemia.")],
 ruleIn=[
  inv("laboratory", "Capillary blood glucose", "Glucometer", "Hypoglycaemia", "70–140 mg/dL (fed)", "Below 70 mg/dL; below 54 mg/dL is level 2", "Confirms and grades hypoglycaemia (ICMR STW; ADA).", "t1dm", T1, extra=("ada", AD)),
  inv("laboratory", "Repeat glucose 15 minutes after treatment", "Glucometer", "Response", "70 mg/dL or more", "Still below 70 mg/dL", "Repeat treatment if still low (ADA).", "ada", AD),
  inv("laboratory", "Glucose before meals, at bedtime and at midnight to 2 a.m.", "Self-monitoring", "Pattern and nocturnal lows", "Within individual targets", "Repeated lows at a time of day", "Identifies mismatch of food, exercise and insulin (ICMR STW).", "t1dm", T1)],
 ruleOut=[
  inv("laboratory", "Serum creatinine", "Blood test", "Kidney impairment prolonging drug action", "Creatinine 0.6–1.2 mg/dL", "Raised creatinine", "Kidney impairment prolongs insulin and sulfonylurea action; review doses.", "ada", AD),
  inv("specializedAdjunctive", "Continuous glucose monitoring review", "CGM", "Nocturnal hypoglycaemia", "No readings below 70 mg/dL", "Consistent night-time lows", "May prompt basal insulin reduction or timing change (ADA).", "ada", AD)],
 management=[
  step("oral", "Conscious and able to swallow", "Immediately", ["Give fast-acting sugar: about 15 g (ADA), for example 3 teaspoons of glucose powder or sugar (ICMR STW).", "Recheck in 15 minutes; repeat if still low (ADA).", "Once above 70 mg/dL, give a snack or the next meal."]),
  step("severe", "Severe (cannot swallow, seizure, unconscious)", "Immediately", ["Caregiver gives glucagon 1 mg subcutaneous or intramuscular (ICMR STW).", "In hospital: 25% dextrose 1–2 mL/kg IV (ICMR STW).", "Place in recovery position; nothing by mouth until awake."]),
  step("admit", "Admit or observe", "After recovery", ["Admit sulfonylurea-related or recurrent hypoglycaemia for monitoring.", "Give thiamine with glucose in heavy drinkers or the malnourished (ICMR AUD STW)."]),
  step("prevent", "Prevent recurrence", "Before discharge", ["Find the mismatch between food, exercise and insulin (ICMR STW).", "De-intensify insulin or sulfonylureas after recurrent or severe episodes (ADA).", "Prescribe glucagon for insulin users and other high-risk patients (ADA).", "Sick days: check glucose often, small meals 4–5 times a day, fluids (ICMR STW)."])],
 branches=[
  ("Conscious — oral treatment", "Glucose below 70 mg/dL, awake and able to swallow (ICMR STW)."),
  ("Severe — rescue treatment", "Unconscious, seizing or unable to swallow (ICMR STW)."),
  ("Alcohol or malnutrition", "Hypoglycaemia in a heavy drinker or malnourished patient (ICMR AUD STW).")],
 regimens=[
  rx("Conscious — oral treatment", "Fast-acting carbohydrate", "Hypoglycaemia, conscious", "Adults and children", "Glucose (oral)", "15 g (ADA); about 3 teaspoons of glucose powder or sugar (ICMR STW)", "Oral", "Repeat if glucose still below 70 mg/dL at 15 minutes", "Until glucose 70 mg/dL or more, then snack", "Children: same approach; smaller children may need less — seek paediatric advice.", NOT_ABX, "No change; recheck more often (longer drug action).", "No change.", ["Glucose at 15 minutes (ADA)"], ["Unable to swallow safely"], "t1dm", T1),
  rx("Severe — rescue treatment", "Rescue glucose", "Severe hypoglycaemia", "Adults and children", "Dextrose 25% (IV)", "1–2 mL/kg", "IV", "Single dose, repeat by glucose", "Until awake; then oral intake or infusion", "Weight-based dose applies to children (ICMR STW).", NOT_ABX, "No change.", "No change.", ["Glucose every 15 minutes until stable, then hourly"], ["Extravasation injury: use a secure cannula"], "t1dm", T1, sel="one-of", pref=True),
  rx("Severe — rescue treatment", "Rescue glucose", "Severe hypoglycaemia", "Adults and children", "Glucagon", "1 mg", "Subcutaneous or intramuscular", "Single dose", "Single dose; give oral carbohydrate when awake", "ICMR STW gives 1 mg without age adjustment; check product label for small children.", NOT_ABX, "No change.", "Less effective with depleted liver glycogen (alcohol, starvation).", ["Glucose at 15 minutes", "Vomiting"], ["Pheochromocytoma"], "t1dm", T1, sel="one-of", pref=False, use="No IV access or out of hospital (caregiver use)."),
  rx("Alcohol or malnutrition", "Vitamin", "Prevent Wernicke encephalopathy", "Adults", "Thiamine", "100 mg", "Oral (IV in hospital per local protocol)", "Once daily", "During admission", ADULT, NOT_ABX, "No change.", "No change.", ["Confusion, ataxia"], ["Give with glucose, not after"], "aud", "section Withdrawal management")],
 medNote="Oral glucose, glucagon and 25% dextrose doses are from the ICMR Type 1 Diabetes STW; the 15 g rule and recheck at 15 minutes from ADA 2025. Sulfonylurea hypoglycaemia can last many hours: admit and observe. Thiamine from the ICMR Alcohol Use Disorders STW. Not clinically reviewed.",
 teaching={"scope": "Hypoglycaemia in diabetes.", "learningObjectives": ["Recognise and grade hypoglycaemia.", "Treat conscious and unconscious patients.", "Prevent recurrence by adjusting medicines."],
  "keyPoints": ["Below 70 mg/dL: treat.", "15 g fast sugar; recheck at 15 minutes.", "Unconscious: 25% dextrose 1–2 mL/kg IV or glucagon 1 mg.", "Review insulin and sulfonylurea doses after every severe episode."],
  "pitfalls": ["Sending home a sulfonylurea overdose after one normal reading.", "Oral sugar to a drowsy patient.", "Forgetting thiamine in malnourished drinkers.", "Not checking glucose in every confused or fitting patient."],
  "references": [tref("t1dm", T1), tref("ada", AD), tref("aud", "section Withdrawal management")]},
 nonClinical={"patientEducation": ["Always carry glucose or sugar.", "Teach family to use glucagon (ICMR STW).", "Check glucose before driving and before exercise."], "lifestyleAndDiet": ["Regular meals; extra carbohydrate before unplanned exercise", "Limit alcohol; never drink on an empty stomach"], "mdtReferrals": ["Diabetes educator", "Endocrinology for recurrent or unexplained hypoglycaemia"], "dischargeCriteria": ["Glucose stable without dextrose for several hours", "Cause identified and medicines adjusted", "Patient or carer can recognise and treat hypoglycaemia"], "followUpPlan": "Review within 1–2 weeks after a severe episode; check glucose before meals, at bedtime and occasionally at midnight to 2 a.m. (ICMR STW)."})
save("t34_hypoglycaemia.json", [T])
