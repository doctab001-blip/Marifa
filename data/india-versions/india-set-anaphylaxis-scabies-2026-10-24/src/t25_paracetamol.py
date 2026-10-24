from hx import *
TITLE = "Paracetamol overdose (India)"
B1 = "section Box 1"; B3 = "section Box 3"; B7 = "section Box 7"; B8 = "section Box 8"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Emergency Medicine / Toxicology / Hepatology", authority="ICMR", pillar="Urgent Care",
 scope="Acute, staggered, modified-release and repeated supratherapeutic paracetamol (acetaminophen) poisoning in adults and children in India: risk assessment, activated charcoal, acetylcysteine and liver-unit referral. Built on the Australian and New Zealand paracetamol guideline (MJA 2020) with the ICMR Acute Liver Failure STW (July 2020) acetylcysteine regimen.",
 findings=[
  "Toxic thresholds (10 g or 200 mg/kg, whichever is less), repeated supratherapeutic ingestion thresholds, two-bag acetylcysteine doses and caps, charcoal 50 g, modified-release rules, children's liquid ingestion pathway, stopping criteria and liver transplant unit referral criteria checked against MJA 2020 Boxes 1–8.",
  "The three-step acetylcysteine regimen (150 mg/kg over 1 hour, 50 mg/kg over 4 hours, 100 mg/kg over 16 hours) for drug-induced acute liver failure checked against the ICMR Acute Liver Failure STW (July 2020).",
  "Not clinically reviewed."],
 unverified=[
  "No Indian paracetamol-poisoning guideline was opened; the MJA 2020 guideline is the main source, and MJA notes some nomograms swap units, so check mg/L vs μmol/L.",
  "Two-bag acetylcysteine is listed as preferred because it is the overdose-specific regimen; the ICMR three-step regimen is the Indian acute liver failure regimen. The clinician chooses by local protocol.",
  "A paediatric activated charcoal dose is not given in the opened sources.",
  "The treatment nomogram line values are not reproduced; use the nomogram in the MJA guideline."],
 summary="Paracetamol is safe at therapeutic doses (up to 60 mg/kg/day, maximum 4 g/day in adults) but overdose saturates normal conjugation, so more drug is converted to the toxic metabolite NAPQI. When hepatic glutathione is used up, NAPQI causes centrilobular liver necrosis, which may progress to acute liver failure, kidney injury and death. Early patients often have no symptoms. Acetylcysteine replenishes glutathione and is almost fully protective when started within 8 hours of ingestion; it still helps when started late or after liver injury (MJA 2020). Risk is judged from the dose ingested, the paracetamol concentration on the nomogram for single immediate-release ingestions, and ALT.",
 mechanisms=[
  "Overdose saturates glucuronidation and sulfation, so more paracetamol becomes NAPQI.",
  "NAPQI binds liver proteins once glutathione is exhausted, causing centrilobular necrosis.",
  "Acetylcysteine restores glutathione and detoxifies NAPQI.",
  "Liver failure leads to coagulopathy, hypoglycaemia, encephalopathy and kidney injury."],
 presentation={
  "symptoms": ["Often none in the first 24 hours", "Nausea, vomiting, abdominal pain", "Right upper quadrant pain at 24–72 hours", "Confusion and jaundice in liver failure"],
  "physicalSigns": ["Usually normal early", "Right upper quadrant tenderness", "Jaundice, encephalopathy, bleeding in late presentation"],
  "redFlags": ["INR above 3.0 at 48 hours or above 4.5 at any time (MJA 2020)", "Creatinine above 200 μmol/L or oliguria (MJA 2020)", "pH below 7.3 or lactate above 3 mmol/L (MJA 2020)", "Encephalopathy, hypoglycaemia, systolic BP below 80 mmHg (MJA 2020)", "Ingestion of 50 g or more, or 1 g/kg or more: seek toxicology advice (MJA 2020)"],
  "precipitants": ["Intentional self-poisoning", "Repeated excess doses for pain or fever", "Modified-release 665 mg tablets", "Children taking liquid preparations"]},
 differentials=[
  ("Viral hepatitis", "Gradual onset, viral serology positive, no ingestion history."),
  ("Other hepatotoxic drugs (anti-TB drugs, herbal products)", "Drug history; paracetamol concentration low."),
  ("Ischaemic hepatitis", "Preceding shock; very high ALT that falls quickly."),
  ("Co-ingestion causing drowsiness", "Reduced consciousness early is not caused by paracetamol alone.")],
 criteria=[
  ("Potentially toxic acute ingestion (MJA Box 1)", "10 g or more, or 200 mg/kg or more, whichever is less; doses over more than 2 hours (staggered) count as acute."),
  ("Repeated supratherapeutic ingestion (MJA Box 1)", "10 g or 200 mg/kg in 24 hours; 12 g or 300 mg/kg in 48 hours; or therapeutic doses for over 48 hours with abdominal pain, nausea or vomiting (whichever is less)."),
  ("Nomogram use (MJA Box 3)", "Only for a single immediate-release ingestion with a known time, from 4 hours after ingestion."),
  ("Children under 6 years, liquid (MJA 2020)", "Suspected ingestion above 200 mg/kg: concentration at 2 hours; below 150 mg/L needs no acetylcysteine.")],
 ruleIn=[
  inv("laboratory", "Serum paracetamol concentration", "Serum level at 4 hours or later (2 hours in children under 6 with liquid)", "Risk of hepatotoxicity", "Below the nomogram treatment line; no detectable paracetamol after therapeutic use", "On or above the nomogram line", "Treat with acetylcysteine; above double the line needs a higher second bag (MJA Box 3).", "pcm", B3),
  inv("laboratory", "Alanine aminotransferase (ALT)", "Serum ALT", "Liver injury", "Below 50 U/L", "Above 50 U/L and rising; above 1000 U/L severe", "Continue acetylcysteine if rising; above 1000 U/L seek toxicology advice (MJA Boxes 5, 8).", "pcm", B8),
  inv("laboratory", "INR", "Prothrombin time / INR", "Synthetic liver failure", "INR about 1.0", "INR 2.0 or above; above 3.0 at 48 hours", "INR below 2.0 needed to stop; above 3.0 at 48 hours or 4.5 any time: liver unit (MJA 2020).", "pcm", B8),
  inv("laboratory", "Creatinine", "Serum creatinine", "Kidney injury", "About 60–110 μmol/L (0.7–1.2 mg/dL)", "Above 200 μmol/L", "Liver transplant unit referral criterion (MJA 2020).", "pcm", "section Hepatotoxicity"),
  inv("laboratory", "Venous blood gas, lactate, glucose", "Blood gas; capillary glucose", "Metabolic failure", "pH 7.35–7.45; lactate below 2 mmol/L; glucose 4.0–7.8 mmol/L", "pH below 7.3; lactate above 3 mmol/L; hypoglycaemia", "Referral criteria for liver transplant unit (MJA 2020).", "pcm", "section Hepatotoxicity")],
 ruleOut=[
  inv("specializedAdjunctive", "Glasgow Coma Scale (GCS)", "Bedside neurological assessment", "Encephalopathy or co-ingestion", "GCS 15", "GCS below 15", "Unexplained by sedative co-ingestion: liver transplant unit referral (MJA 2020).", "pcm", "section Hepatotoxicity"),
  inv("laboratory", "Repeat paracetamol and ALT near end of infusion", "Serum level and ALT about 2 hours before infusion ends", "Need for continued acetylcysteine", "Paracetamol below 10 mg/L; ALT below 50 U/L or static", "Paracetamol 10 mg/L or above, or ALT rising", "Continue acetylcysteine at the second-bag rate (MJA Box 3).", "pcm", B3),
  inv("laboratory", "Salicylate and other co-ingestants", "Serum levels as indicated", "Co-ingestion", "Not detected", "Detected", "Changes overall management.", "pcm", "section Seeking advice")],
 management=[
  step("assess", "Risk assess", "On arrival", ["Estimate dose in mg/kg and time; classify as acute, staggered, modified-release or repeated supratherapeutic (MJA Box 1).", "Contact a poisons centre or toxicologist for 50 g or 1 g/kg or more, concentration over triple the line, ALT above 1000 U/L or IV paracetamol errors (MJA 2020)."]),
  step("decon", "Decontaminate", "Within 2 hours (4 hours for over 30 g or modified-release)", ["Activated charcoal 50 g for an awake, cooperative adult within 2 hours of a toxic dose, or 4 hours if over 30 g (MJA Box 1)."]),
  step("nac", "Start acetylcysteine", "Within 8 hours of ingestion", ["Immediate-release: treat if level on or above the nomogram line; start at once if a level cannot be obtained within 8 hours (MJA Box 3).", "Modified-release 10 g or 200 mg/kg or more: start at once and give a full course whatever the level (MJA Box 4).", "Repeated supratherapeutic: start if paracetamol above 20 mg/L or ALT above 50 U/L (MJA Box 5)."]),
  step("stop", "Stop or continue", "About 20 hours", ["Stop when ALT or AST falling, INR below 2.0 and clinically well; for modified-release or above double the line, paracetamol must also be below 10 mg/L (MJA Box 8).", "If continuing: review and test at least every 12 hours."]),
  step("liver", "Liver failure", "Any time", ["Refer to a liver transplant unit for INR above 3.0 at 48 hours or above 4.5, creatinine above 200 μmol/L, pH below 7.3, lactate above 3 mmol/L, systolic BP below 80 mmHg, hypoglycaemia or encephalopathy (MJA 2020).", "Do not give clotting factors unless bleeding (MJA 2020).", "Psychiatric assessment before discharge after self-poisoning."])],
 branches=[
  ("Acute immediate-release ingestion", "Single or staggered ingestion of immediate-release paracetamol."),
  ("Modified-release or massive ingestion", "Modified-release tablets, 30 g or 500 mg/kg or more, or level above double the nomogram line."),
  ("Repeated supratherapeutic ingestion", "Meets MJA Box 1 repeated supratherapeutic criteria.")],
 regimens=[
  rx("Acute immediate-release ingestion", "Decontamination", "Toxic dose within 2 hours (4 hours if over 30 g)", "Awake, cooperative adults", "Activated charcoal", "50 g", "Oral", "Once", "Single dose", "Paediatric dose not given in the cited sources.", NOT_ABX, "No adjustment.", "No adjustment.", ["Airway; vomiting and aspiration"], ["Reduced consciousness or unprotected airway"], "pcm", B1),
  rx("Acute immediate-release ingestion", "Antidote", "Level on or above the nomogram line, or level unavailable by 8 hours", "Adults and children", "Acetylcysteine (two-bag)", "Bag 1: 200 mg/kg (maximum 22 g) over 4 hours; bag 2: 100 mg/kg (maximum 11 g) over 16 hours", "IV infusion", "Continuous", "20 hours, then per stopping criteria", "Children under 14: dose by actual body weight (MJA Box 7).", NOT_ABX, "No adjustment.", "Give full dose; continue in liver injury.", ["Anaphylactoid reaction in the first hours", "ALT, INR and paracetamol before infusion ends"], ["Prior anaphylactoid reaction is not a contraindication: slow or pause and treat"], "pcm", B7, sel="one-of", pref=True, extra_adj=("Adults 14 years and over: actual weight rounded up to nearest 10 kg, capped at 110 kg (MJA Box 7).",)),
  rx("Acute immediate-release ingestion", "Antidote", "Level on or above the nomogram line, or level unavailable by 8 hours", "Adults", "Acetylcysteine (three-step ICMR)", "150 mg/kg over 1 hour, then 50 mg/kg over 4 hours, then 100 mg/kg over 16 hours", "IV infusion", "Continuous", "21 hours, then reassess", "Weight-based; paediatric use per the treating team.", NOT_ABX, "No adjustment.", "Give full dose in liver injury.", ["Anaphylactoid reaction, especially in the first hour", "ALT, INR"], ["Not a contraindication: slow the infusion if a reaction occurs"], "alf", "section Management at higher centre (drug-induced ALF)", sel="one-of", pref=False, use="Hospital protocol uses the standard three-step regimen (ICMR acute liver failure workflow)."),
  rx("Modified-release or massive ingestion", "Antidote", "Modified-release 10 g or 200 mg/kg or more; or 30 g or 500 mg/kg; or level above double the line", "Adults and children", "Acetylcysteine (two-bag, increased second bag)", "Bag 1: 200 mg/kg (maximum 22 g) over 4 hours; bag 2: 200 mg/kg over 16 hours", "IV infusion", "Continuous", "Full 20-hour course whatever the level; continue per stopping criteria", "Children under 14: actual body weight (MJA Box 7).", NOT_ABX, "No adjustment.", "Give full dose.", ["Pulse oximetry for first 2 hours", "Paracetamol, ALT, INR"], ["Triple the line or above: discuss even higher doses with toxicology"], "pcm", "sections Box 4 and Box 7"),
  rx("Repeated supratherapeutic ingestion", "Antidote", "Paracetamol above 20 mg/L or ALT above 50 U/L", "Adults and children", "Acetylcysteine (two-bag)", "Bag 1: 200 mg/kg (maximum 22 g) over 4 hours; bag 2: 100 mg/kg (maximum 11 g) over 16 hours", "IV infusion", "Continuous", "Repeat tests at 8 hours; stop if paracetamol below 10 mg/L and ALT below 50 U/L or static; full 20 hours if ALT above 1000 U/L", "Children: actual body weight.", NOT_ABX, "No adjustment.", "Continue in liver injury.", ["Paracetamol and ALT at 8 hours"], ["Not a contraindication: manage reactions"], "pcm", "sections Box 5 and Box 7")],
 medNote="Thresholds and the two-bag acetylcysteine regimen are from MJA 2020; the three-step regimen is from the ICMR Acute Liver Failure STW (2020). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Acetylcysteine regimens: MJA 2020 vs ICMR ALF STW", "columns": ["MJA 2020 (two-bag)", "ICMR Acute Liver Failure STW (2020)"], "rows": [
   {"parameter": "Loading", "values": ["200 mg/kg over 4 hours (maximum 22 g)", "150 mg/kg over 1 hour, then 50 mg/kg over 4 hours"]},
   {"parameter": "Maintenance", "values": ["100 mg/kg over 16 hours (maximum 11 g); 200 mg/kg if above double the line", "100 mg/kg over 16 hours"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Paracetamol poisoning in Indian emergency practice.", "learningObjectives": ["Classify the ingestion and decide on treatment.", "Give acetylcysteine correctly.", "Know when to stop and when to refer to a liver unit."],
  "keyPoints": ["Toxic: 10 g or 200 mg/kg, whichever is less.", "Start acetylcysteine if the level will not be back by 8 hours.", "Stop: ALT falling, INR below 2, well.", "INR above 3 at 48 hours: liver unit."],
  "pitfalls": ["Using the nomogram for staggered or modified-release ingestion.", "Stopping because the level is low while ALT rises.", "Mixing mg/L and μmol/L.", "Missing psychiatric assessment."],
  "references": [tref("pcm", "Boxes 1, 3, 4, 5, 7, 8; sections Hepatotoxicity, Seeking advice"), tref("alf", "sections Management at higher centre, Acute liver failure")]},
 nonClinical={"patientEducation": ["Paracetamol is in many combination medicines; check labels.", "Adults: no more than 4 g a day.", "Return for vomiting, abdominal pain or yellow eyes."], "lifestyleAndDiet": ["Avoid alcohol while recovering.", "Keep medicines locked away from children."], "mdtReferrals": ["Psychiatry after self-poisoning", "Hepatology or liver transplant unit for liver failure", "Poisons information centre (for example AIIMS National Poisons Information Centre)"], "dischargeCriteria": ["Acetylcysteine stopping criteria met (MJA Box 8)", "Psychiatric assessment done after self-poisoning"], "followUpPlan": "Recheck liver tests if symptoms recur; mental health follow-up after self-harm."})
save("t25_paracetamol.json", [T])
