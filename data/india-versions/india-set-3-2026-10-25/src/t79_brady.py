from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Bradyarrhythmia and heart block (India)"
AT = "section Acute treatment"; BR = "section Drug treatment"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Cardiology / Emergency Medicine / Internal Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Symptomatic bradycardia and heart block in adults in India: recognition of instability, reversible causes (drugs, hyperkalaemia, hypothyroidism), investigations, emergency drugs and pacing, temporary and permanent pacemaker indications and referral, built on the ICMR Bradyarrhythmia STW (January 2025) with drug doses from the Resuscitation Council UK adult bradycardia algorithm (2021).",
 findings=["Bradycardia below 50/min with symptoms, sinus pauses over 3 seconds, instability (systolic BP below 90 mmHg, impaired consciousness, chest pain, syncope), reversible causes (beta-blockers, calcium channel blockers, digoxin, clonidine, lithium; potassium above 6 mEq/L; renal dysfunction; hypothyroidism; sleep apnoea), investigations, hyperkalaemia treatment with calcium gluconate 10% 10 mL over 10 minutes, dopamine or isoprenaline pending temporary pacing, and temporary and permanent pacemaker indications checked against the ICMR Bradyarrhythmia STW (January 2025).", "Adverse features, risk of asystole, atropine 500 micrograms IV repeated to 3 mg, isoprenaline 5 micrograms/min, adrenaline 2–10 micrograms/min, glucagon for beta-blocker or calcium channel blocker overdose, and transcutaneous pacing checked against the RCUK adult bradycardia algorithm (2021).", "Not clinically reviewed."],
 unverified=["The ICMR STW gives no atropine or adrenaline doses; these are from RCUK.", "Dopamine and glucagon doses are not given in either opened source.", "AV block degrees are not defined in the STW; standard definitions are used."],
 summary="Bradyarrhythmias range from harmless sinus bradycardia in athletes to complete heart block causing syncope, heart failure or death. In India, common causes are degenerative conduction disease in older people, drugs (beta-blockers, calcium channel blockers, digoxin), hyperkalaemia in kidney disease, hypothyroidism and inferior myocardial infarction. The ICMR workflow asks clinicians to identify symptomatic bradycardia below 50/min, look for instability, withhold offending drugs, treat hyperkalaemia, and arrange temporary pacing when needed, then permanent pacing for persistent high-grade block or symptomatic sinus node disease. Atropine is the first drug; isoprenaline or adrenaline infusions and transcutaneous pacing bridge to transvenous pacing.",
 mechanisms=["Sinus node dysfunction: failure of impulse generation (pauses, slow rates).", "AV block: failure of conduction from atria to ventricles; Mobitz II and complete block are infranodal and unstable.", "Atropine blocks vagal tone and works for nodal but not infranodal block.", "Beta-agonists (isoprenaline, adrenaline) increase rate and conduction."],
 presentation={"symptoms": ["Syncope, presyncope, dizziness (ICMR STW)", "Fatigue, drowsiness (ICMR STW)", "Breathlessness or chest pain on exertion (ICMR STW)"], "physicalSigns": ["Pulse below 50/min (ICMR STW)", "Cannon a waves, variable first heart sound (complete heart block)", "Hypotension"], "redFlags": ["Systolic BP below 90 mmHg, impaired consciousness, ongoing chest pain, recurrent syncope (ICMR STW)", "Complete heart block, pauses over 3 seconds (ICMR STW)", "Recent asystole, Mobitz II, complete block with broad QRS: high asystole risk (RCUK)", "Headache with neurological deficit: suspect intracranial event (ICMR STW)"], "precipitants": ["Beta-blockers, calcium channel blockers, digoxin, clonidine, lithium (ICMR STW)", "Hyperkalaemia, renal dysfunction (ICMR STW)", "Hypothyroidism, sleep apnoea (ICMR STW)", "Inferior myocardial infarction"]},
 differentials=[("Athletic sinus bradycardia", "Asymptomatic, rises with exercise."), ("Vasovagal syncope", "Transient bradycardia with a trigger."), ("Raised intracranial pressure", "Bradycardia with hypertension and headache."), ("Hypothermia", "Low core temperature.")],
 criteria=[("Bradycardia (ICMR STW)", "Heart rate below 50/min with symptoms."), ("Instability (ICMR STW; RCUK)", "Shock or systolic below 90 mmHg, syncope, myocardial ischaemia, heart failure, impaired consciousness."), ("Permanent pacing (ICMR STW)", "Complete, advanced or Mobitz II block; symptomatic sinus pauses over 3 seconds or awake rate below 40/min.")],
 ruleIn=[
  inv("specializedAdjunctive", "12-lead electrocardiogram (ECG)", "ECG", "Rhythm and block type", "Sinus rhythm 60–100/min", "Complete heart block, Mobitz II, pauses over 3 seconds", "At PHC level (ICMR STW).", "brady", "section Investigations"),
  inv("laboratory", "Potassium, urea, creatinine, glucose", "Blood", "Hyperkalaemia, renal cause", "Potassium 3.5–5.0 mEq/L", "Potassium above 6 mEq/L", "All patients (ICMR STW).", "brady", "section Investigations"),
  inv("laboratory", "Thyroid-stimulating hormone (TSH)", "Blood", "Hypothyroidism", "0.4–4.0 mIU/L", "Raised", "All patients (ICMR STW).", "brady", "section Investigations"),
  inv("firstLineImaging", "Transthoracic echocardiography", "Echo", "Structural disease, LV function", "Normal LV function", "Reduced ejection fraction (guides pacing mode)", "After stabilisation (ICMR STW).", "brady", "section Investigations"),
  inv("specializedAdjunctive", "Ambulatory ECG (Holter) or loop recorder", "Monitoring", "Intermittent block or pauses", "No pauses", "Pauses correlating with symptoms", "Intermittent symptoms (ICMR STW).", "brady", "section Investigations"),
  inv("laboratory", "Troponin and digoxin level (if relevant)", "Blood", "Infarction, digoxin toxicity", "Negative; therapeutic", "Raised", "Chest pain or digoxin use.", "brady", "section Reversible causes")],
 ruleOut=[inv("advancedImaging", "Cardiac magnetic resonance imaging (MRI)", "MRI", "Infiltrative disease (sarcoid, amyloid)", "Normal", "Infiltration", "Young patients or suspected infiltration (ICMR STW).", "brady", "section Investigations")],
 management=[
  step("assess", "Assess", "Immediately", ["ABCDE; monitor; IV access; 12-lead ECG (RCUK; ICMR STW).", "Look for adverse features and asystole risk (RCUK)."]),
  step("reverse", "Reverse causes", "Immediately", ["Withhold beta-blockers, calcium channel blockers, digoxin (ICMR STW).", "Hyperkalaemia: calcium gluconate, insulin-glucose, bicarbonate (ICMR STW; see Hyperkalaemia topic)."]),
  step("drugs", "Drugs", "If adverse features", ["Atropine 500 micrograms IV, repeat to 3 mg (RCUK).", "No response or asystole risk: isoprenaline or adrenaline infusion, or transcutaneous pacing (RCUK).", "Beta-blocker or calcium channel blocker overdose: consider glucagon (RCUK)."]),
  step("pace", "Pacing", "Urgent", ["Temporary transvenous pacing for unstable AV block or sinus node disease (ICMR STW).", "Permanent pacemaker per ICMR indications; refer to cardiology (ICMR STW)."])],
 branches=[("Unstable bradycardia", "Bradycardia with adverse features."), ("Refractory bradycardia", "No response to atropine or high asystole risk, pending pacing."), ("Bradycardia with hyperkalaemia", "Potassium above 6 mEq/L or hyperkalaemic ECG changes.")],
 regimens=[
  rx("Unstable bradycardia", "Antimuscarinic", "Bradycardia with adverse features", "Adults", "Atropine", "500 micrograms", "IV", "Repeat every 3–5 minutes", "Maximum 3 mg total", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Heart rate, BP, rhythm"], ["Often ineffective in infranodal block or heart transplant"], "rcukbr", BR),
  rx("Refractory bradycardia", "Beta-agonist infusion", "Atropine-resistant bradycardia pending pacing", "Adults", "Isoprenaline", "5 micrograms/min", "IV infusion", "Continuous; titrate to rate", "Until pacing", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Rhythm, BP"], ["Myocardial ischaemia (caution)"], "rcukbr", BR, sel="one-of", pref=True, extra_adj=("Named by the ICMR STW as a bridge to temporary pacing.",)),
  rx("Refractory bradycardia", "Beta-agonist infusion", "Atropine-resistant bradycardia pending pacing", "Adults", "Adrenaline (epinephrine)", "2–10 micrograms/min", "IV infusion", "Continuous; titrate", "Until pacing", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Rhythm, BP"], ["Tachyarrhythmia"], "rcukbr", BR, sel="one-of", pref=False, use="Isoprenaline unavailable."),
  rx("Bradycardia with hyperkalaemia", "Calcium", "Bradycardia with hyperkalaemia", "Adults", "Calcium gluconate 10%", "10 mL", "IV", "Over 10 minutes; repeat if ECG changes persist", "As needed", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["ECG monitoring"], ["Digoxin toxicity (caution)"], "brady", AT)],
 medNote="Hyperkalaemia step and pacing indications from the ICMR Bradyarrhythmia STW (January 2025); atropine, isoprenaline and adrenaline doses from RCUK 2021. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Symptomatic bradycardia in Indian emergency and cardiology care.", "learningObjectives": ["Recognise unstable bradycardia.", "Find reversible causes.", "Know drug and pacing steps."],
  "keyPoints": ["Atropine 500 micrograms, up to 3 mg.", "Withhold rate-slowing drugs; check potassium and TSH.", "Isoprenaline 5 micrograms/min or adrenaline 2–10 micrograms/min pending pacing.", "Complete heart block: pacemaker."],
  "pitfalls": ["Missing hyperkalaemia.", "Relying on atropine in infranodal block.", "Delaying pacing.", "Not stopping beta-blockers."],
  "references": [tref("brady", "sections Definitions, Red flags, Reversible causes, Investigations, Acute treatment, Pacemaker indications"), tref("rcukbr", "section Drug treatment")]},
 nonClinical={"patientEducation": ["Carry pacemaker card; device checks; avoid strong magnets.", "Report dizziness or fainting."], "lifestyleAndDiet": ["Avoid potassium supplements in kidney disease unless prescribed."], "mdtReferrals": ["Cardiology / electrophysiology for pacing (ICMR STW)", "Nephrology for renal causes"], "dischargeCriteria": ["Stable rhythm or paced; cause addressed"], "followUpPlan": "Pacemaker clinic at 1–3 months then yearly; review medicines."})
# Depth standard (2026-10-25)
U = T["evidenceAudit"]["unverifiedSections"]
T["evidenceAudit"]["unverifiedSections"] = [u for u in U if not u.startswith("Dopamine and glucagon doses")]
T["evidenceAudit"]["unverifiedSections"].insert(1, "Dopamine dose is from the AHA 2020 adult bradycardia algorithm and glucagon dose from the Québec poison centre antidote monograph, because neither the ICMR STW nor RCUK gives them. AHA uses atropine 1 mg (RCUK 500 micrograms); the RCUK dose is shown with the AHA dose in the comparison.")
T["evidenceAudit"]["findings"] += ["AHA 2020: atropine 1 mg IV every 3–5 minutes, maximum 3 mg; dopamine 5–20 micrograms/kg/min; adrenaline 2–10 micrograms/min; transcutaneous pacing if drugs fail.",
 "Québec antidote monograph: glucagon 5 mg IV over 3–5 minutes, may repeat once (maximum 10 mg), then 5–10 mg/h; adjunctive to fluids, vasopressors and high-dose insulin."]
R = T["medicationPlan"]["regimens"]
T["medicationPlan"]["branches"].append({"label": "Drug-induced bradycardia", "entryCriteria": "Beta-blocker toxicity with bradycardia or hypotension despite fluids and atropine."})
T["medicationPlan"]["note"] = T["medicationPlan"]["note"].replace("from RCUK 2021.", "from RCUK 2021; dopamine from AHA 2020; glucagon from the Québec antidote monograph.")
R.append(rx("Refractory bradycardia", "Beta-agonist infusion", "Bradycardia unresponsive to atropine", "Adults", "Dopamine", "5–20 micrograms/kg/min", "IV infusion", "Continuous; titrate to rate and BP", "Until pacing or cause reversed",
  ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Heart rate, BP, rhythm, infusion site"], ["Tachyarrhythmias; extravasation causes tissue necrosis (use a large or central vein)"], "ahabrady", "section Persistent bradyarrhythmia (dopamine infusion)", sel="one-of", pref=False, use="Isoprenaline or adrenaline unavailable."))
R.append(rx("Drug-induced bradycardia", "Antidote", "Beta-blocker toxicity with bradycardia or hypotension", "Adults", "Glucagon", "5 mg over 3–5 minutes; may repeat once after 5–10 minutes (maximum 10 mg); then 5–10 mg/h", "IV", "Bolus then continuous infusion", "Until haemodynamically stable",
  ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Heart rate, BP, blood glucose, airway (vomiting)"], ["Phaeochromocytoma; adjunct only, after fluids, vasopressors and high-dose insulin"], "glucqc", "section Adult dose", sel="all"))
for r in R:
    if r["genericName"] == "Atropine":
        r["contraindications"] = list(r["contraindications"]) + ["AHA 2020 uses 1 mg every 3–5 minutes (maximum 3 mg)"]
T["pathophysiology"]["summary"] += " Bradycardia matters when it causes low output: the key bedside question is whether the patient is unstable, not the absolute rate, and the second is whether the escape rhythm is likely to fail."
T["presentation"]["symptoms"].append("Confusion or seizure-like jerks during prolonged pauses (Stokes–Adams attack)")
T["presentation"]["physicalSigns"].append("Cool peripheries, raised jugular venous pressure or crackles (low output, heart failure)")
T["presentation"]["precipitants"].append("Cardiac surgery, transcatheter aortic valve implantation, infiltrative disease and Lyme or rheumatic carditis")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Athletic sinus bradycardia", "Young fit person, asymptomatic, rate rises normally with exercise; ECG shows sinus rhythm without block."),
 ("Vasovagal syncope", "Transient bradycardia with a trigger (standing, pain, fear) and prodrome; ECG between episodes is normal."),
 ("Raised intracranial pressure", "Bradycardia with hypertension, headache and reduced consciousness (Cushing response); urgent computed tomography (CT) of the head settles it."),
 ("Hypothermia", "Low core temperature with J (Osborn) waves on ECG; low-reading thermometer settles it — rewarm before pacing."),
 ("Drug toxicity (beta-blocker, calcium channel blocker, digoxin)", "History of overdose or new drug, often with hypotension; digoxin level and potassium settle it."),
 ("Hyperkalaemia", "Bradycardia with peaked T waves or broad QRS in kidney disease; serum potassium settles it — treat before pacing.")]]
T["clinicalManagement"].append(step("after", "After stabilisation", "Hours to days", [
 "Monitor on telemetry until the cause is reversed or a pacemaker is placed (ICMR STW).",
 "Review all rate-slowing drugs before discharge; check thyroid function and electrolytes (ICMR STW)."]))
T["teaching"]["references"].append(tref("ahabrady", "section Persistent bradyarrhythmia"))
T["teaching"]["references"].append(tref("glucqc", "section Adult dose"))

ALG = algo("bradycardia-pathway", "Symptomatic bradycardia: assess and treat", "manage", "brady", "sections Red flags, Acute treatment, Pacemaker indications", [
 node("start", "start", "Heart rate below 50/min with symptoms", [("abcde", None)]),
 node("abcde", "action", "ABCDE, monitor, IV access, 12-lead ECG, potassium and glucose", [("unstable", None)]),
 node("unstable", "decision", "Shock, syncope, ischaemia, heart failure or reduced consciousness?", [("atr", "Yes"), ("risk", "No")]),
 node("atr", "action", "Atropine 500 micrograms IV (AHA 1 mg), repeat to 3 mg; treat hyperkalaemia or drug toxicity", [("resp", None)]),
 node("resp", "decision", "Satisfactory response?", [("risk2", "Yes"), ("inf", "No")]),
 node("inf", "outcome", "Isoprenaline, adrenaline or dopamine infusion, or transcutaneous pacing; urgent transvenous pacing", None),
 node("risk2", "decision", "Asystole risk: recent asystole, Mobitz II, complete block with broad QRS, pause over 3 s?", [("tvp", "Yes"), ("obs", "No")]),
 node("tvp", "outcome", "Arrange transvenous pacing; cardiology referral", None),
 node("obs", "outcome", "Observe; reverse causes", None),
 node("risk", "decision", "Asystole risk features present?", [("tvp2", "Yes"), ("cause", "No")]),
 node("tvp2", "outcome", "Monitor closely; cardiology for pacing", None),
 node("cause", "outcome", "Stop rate-slowing drugs, check thyroid and potassium; review permanent pacing indications", None)])

VIG = "Mr R, a 72-year-old retired farmer from Nagpur, is brought to the emergency department after fainting twice at home. He takes metoprolol 50 mg twice daily and amlodipine for hypertension, and has diabetic kidney disease. His pulse is 34/min and regular, BP 84/50 mmHg, and he is drowsy but rousable. The ECG shows complete heart block with a broad QRS escape rhythm."

EXP = [
 explain("pathophysiology", "Where the conduction fails and why it matters", "How does the level of block predict risk?",
  "The sinus node sets the rate and the AV node and His–Purkinje system conduct it. Sinus node disease and AV nodal block (first degree, Mobitz I) often reflect vagal tone, drugs or ischaemia of the inferior wall, and the escape rhythm from the AV junction is narrow and reasonably fast, so the risk of asystole is lower. Block below the AV node (Mobitz II, complete block with a broad QRS) relies on a slow, unreliable ventricular escape, which can fail suddenly, so these patients need pacing even when they look stable. Hyperkalaemia, beta-blockers, calcium channel blockers and digoxin depress both the node and conduction, and in older Indian patients with kidney disease these often combine."),
 explain("signs-symptoms", "Unstable versus stable", "Which features decide the urgency?",
  "The rate alone does not decide treatment. Look for adverse features: shock or systolic BP below 90 mmHg, syncope, myocardial ischaemia, heart failure and impaired consciousness. Any of these makes the patient unstable and needs immediate treatment. Then look for asystole risk: recent asystole, Mobitz II, complete block with a broad QRS, or ventricular pauses over 3 seconds. A patient with neither may only need the cause treated and observation. Remember Cushing's response — bradycardia with hypertension and reduced consciousness points to raised intracranial pressure and needs a CT of the head, not atropine."),
 explain("investigations", "The ECG and the reversible causes", "What do you check first?",
  "A 12-lead ECG identifies the rhythm and level of block and may show inferior ST elevation, peaked T waves of hyperkalaemia or digoxin effect. Send potassium, creatinine, glucose, troponin and thyroid function; a digoxin level when relevant. Review every medicine including eye drops (timolol). Echocardiography assesses structural disease. A Holter monitor captures intermittent block in a stable patient with symptoms. Treating hyperkalaemia or stopping a beta-blocker may make pacing unnecessary, which is why the causes are checked before a permanent pacemaker is planned."),
 explain("management", "Drugs as a bridge to pacing", "How do you treat unstable bradycardia step by step?",
  "Give atropine 500 micrograms IV (RCUK; AHA uses 1 mg), repeating every 3–5 minutes to a maximum of 3 mg. Atropine works on the AV node and often fails in infranodal block or after heart transplant. If there is no response, start an isoprenaline infusion at 5 micrograms/min, an adrenaline infusion at 2–10 micrograms/min or a dopamine infusion at 5–20 micrograms/kg/min, or begin transcutaneous pacing with analgesia and sedation. Treat hyperkalaemia with 10 mL 10% calcium gluconate. In beta-blocker toxicity, glucagon 5 mg IV can be added after fluids and vasopressors. All of these are a bridge to transvenous pacing and then a permanent pacemaker when block persists.")]

QS = [
 bq("q1", "A 72-year-old man on metoprolol and amlodipine with diabetic kidney disease faints twice. His pulse is 34/min, BP 84/50 mmHg, and he is drowsy. The ECG shows complete heart block with a broad QRS escape rhythm. Potassium is 5.2 mmol/L. IV access is in place.", "What is the most appropriate immediate step?",
  [("Observe on telemetry overnight", "He is unstable with shock and reduced consciousness, so waiting is unsafe."),
   ("Atropine 500 micrograms IV while preparing an infusion or pacing", "Correct. Atropine is first, but broad-complex complete block often fails to respond, so prepare pacing (RCUK; ICMR STW)."),
   ("Start metoprolol at a lower dose", "Rate-slowing drugs should be withheld in symptomatic bradycardia (ICMR STW)."),
   ("Insulin–glucose for hyperkalaemia alone", "Potassium is only mildly raised and does not explain shock with complete block."),
   ("Arrange an outpatient Holter", "Holter monitoring is for intermittent symptoms in a stable patient.")],
  "B", "Treat unstable bradycardia promptly and plan pacing for infranodal block.", "Unstable plus broad-complex block: atropine, then infusion or pacing."),
 bq("q2", "A 24-year-old marathon runner has a pulse of 42/min at a pre-employment check. He has no symptoms, BP is 118/70 mmHg, and he has never fainted. The ECG shows sinus bradycardia with no block, and his rate rises to 110/min on climbing stairs.", "What is the best management?",
  [("Atropine 500 micrograms IV", "Atropine is for symptomatic bradycardia with adverse features, which he does not have."),
   ("Refer for permanent pacing", "There are no pacing indications without symptoms or high-grade block (ICMR STW)."),
   ("Admit for transcutaneous pacing", "There is no instability or asystole risk, so pacing is not indicated."),
   ("Reassure; no treatment needed", "Correct. Asymptomatic sinus bradycardia with a normal chronotropic response in an athlete is physiological."),
   ("Start isoprenaline infusion", "Infusions are a bridge for unstable patients who fail atropine.")],
  "D", "Recognise physiological bradycardia.", "Treat the patient, not the rate: asymptomatic athletes need no treatment."),
 bq("q3", "A 48-year-old woman took 30 tablets of propranolol 40 mg 2 hours ago. Her pulse is 38/min and BP 70/40 mmHg despite 2 L of fluid and atropine 3 mg. An adrenaline infusion has been started and high-dose insulin is being prepared. She weighs 60 kg.", "Which additional antidote and dose is appropriate?",
  [("Naloxone 0.4 mg IV", "Naloxone reverses opioids and has no effect on beta-blockade."),
   ("Flumazenil 0.2 mg IV", "Flumazenil reverses benzodiazepines only and can precipitate seizures."),
   ("Glucagon 5 mg IV over 3–5 minutes, then an infusion of 5–10 mg/h", "Correct. Glucagon is an adjunct in beta-blocker toxicity, repeated once to 10 mg, then infused (Québec antidote monograph)."),
   ("Digoxin-specific antibody fragments", "These are for digoxin toxicity, not beta-blocker overdose."),
   ("Further atropine 3 mg", "The maximum atropine dose of 3 mg has already been given (RCUK).")],
  "C", "Use glucagon as an adjunct in beta-blocker toxicity.", "Beta-blocker overdose: fluids, vasopressors, high-dose insulin, glucagon, then pacing.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"].insert(2, "RCUK also names aminophylline and glycopyrrolate for specific situations, and toxin-specific antidotes (high-dose insulin, IV calcium for calcium channel blockers, digoxin-specific antibody fragments) are needed in poisoning; these are managed with a poison centre and are covered in the poisoning topics rather than dosed here.")
for r in T["investigations"]["ruleIn"] + T["investigations"]["ruleOut"]:
    if r["testName"].startswith("Troponin"):
        r["clinicalRationale"] = "Chest pain or digoxin use (general practice; the STW lists digoxin as a cause)."
    if r["testName"].startswith("Cardiac magnetic"):
        r["clinicalRationale"] = "Suspected infiltrative disease (ICMR STW)."
for r in T["medicationPlan"]["regimens"]:
    n = r["genericName"]
    if n == "Atropine":
        r["frequency"] = "Repeat to a maximum of 3 mg (RCUK); AHA repeats every 3–5 minutes"
        r["contraindications"] = ["Often ineffective in infranodal block or heart transplant: go to infusion or pacing"]
        r["adjustments"].append("AHA 2020 uses 1 mg IV every 3–5 minutes, maximum 3 mg.")
    if n.startswith("Calcium gluconate"):
        r["frequency"] = "Over 10 minutes; may be repeated if ECG changes persist (general practice)"
    if n == "Glucagon":
        r["contraindications"] = ["Adjunct to fluids, vasopressors and high-dose insulin, not a replacement (Québec antidote monograph)", "Phaeochromocytoma (general pharmacology)"]
T["diagnosticCriteria"][1]["criterion"] = "Instability (RCUK; ICMR STW lists hypotension and impaired consciousness)"
T["presentation"]["redFlags"][3] = "Headache with or without neurological deficit: suspect an intracranial event (ICMR STW)"
for m in T["clinicalManagement"]:
    if m["id"] == "after":
        m["actions"][0] = "Monitor on telemetry until the cause is reversed or a pacemaker is placed (general practice)."
    if m["id"] == "reverse":
        m["actions"].append("Overdose of beta-blockers, calcium channel blockers or digoxin: discuss with a poison centre for specific antidotes (see the poisoning topics).")
for q in T["teaching"]["boardQuestions"]:
    q["vignette"] = q["vignette"].replace("5.2 mmol/L", "5.2 mEq/L")
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["abcde"]["next"] = [{"to": "mimic"}]
N["atr"]["text"] = "Atropine 500 micrograms IV (AHA 1 mg), repeat to 3 mg; in infranodal block or heart transplant go straight to infusion or pacing; treat hyperkalaemia or drug toxicity"
N["tvp2"]["text"] = "Asystole risk: arrange transvenous pacing; keep atropine, an infusion or transcutaneous pacing ready meanwhile"
i = [n["id"] for n in A["nodes"]].index("abcde") + 1
A["nodes"][i:i] = [
 {"id": "mimic", "kind": "decision", "text": "Hypertension with reduced consciousness (raised intracranial pressure) or low core temperature?", "next": [{"to": "mim", "label": "Yes"}, {"to": "unstable", "label": "No"}]},
 {"id": "mim", "kind": "outcome", "text": "Treat the cause: urgent CT of the head, or rewarming for hypothermia; atropine and pacing are not the first step"}]

save("t79_brady.json", [T])
