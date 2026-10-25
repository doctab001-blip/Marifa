from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Delirium in adults (India)"
PH = "section Pharmacological treatment"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Internal Medicine / Geriatrics / Psychiatry / Critical Care", authority="NICE", pillar="Urgent Care",
 scope="Prevention, recognition and treatment of delirium in adults in Indian hospitals and long-term care: risk factors, the 4AT and CAM-intensive care unit (ICU), multicomponent prevention, finding and treating causes, de-escalation and short-term drug treatment, using NICE CG103 (2010, updated 2023) and SIGN 157, because no Indian national delirium guideline could be opened.",
 findings=["Risk factors (age 65 or over, cognitive impairment or dementia, hip fracture, severe illness), daily observation, 4AT (CAM-ICU or ICDSC in critical care), multicomponent prevention within 24 hours, treat causes, de-escalation first, short-term haloperidol usually 1 week or less at the lowest dose, caution in Parkinson disease and Lewy body dementia checked against NICE CG103.", "Haloperidol 0.5–1 mg oral or 0.5 mg IM (maximum 2 mg in 24 hours), risperidone 0.25 mg (maximum 1 mg), lorazepam 0.5–1 mg (maximum 2 mg) when antipsychotics are contraindicated, review every 24 hours checked against SIGN 157.", "Not clinically reviewed."],
 unverified=["Alcohol withdrawal delirium is covered in the Alcohol withdrawal (India) topic.", "Baseline ECG before haloperidol is from an NHS prescribing tip citing MHRA, not from NICE or SIGN.", "Midazolam IM is listed by SIGN but not included, to limit sedation risk on general wards."],
 summary="Delirium is an acute, fluctuating disturbance of attention and awareness caused by a medical illness, drug or withdrawal. It affects many older inpatients and most ventilated patients, is often missed (especially the quiet, hypoactive form), and increases death, length of stay and later dementia. Prevention works: a familiar team, orientation, hydration, mobility, sleep, sensory aids, pain control and medicine review. When delirium develops, the priority is to find and treat the cause — infection, dehydration, drugs, retention, constipation, hypoxia, hypoglycaemia, electrolyte disturbance. Drugs are only for severe distress or risk, after de-escalation fails, at the lowest dose for the shortest time.",
 mechanisms=["Acute brain dysfunction from inflammation, hypoperfusion, neurotransmitter imbalance (low acetylcholine, excess dopamine).", "Vulnerable brains (dementia, old age) decompensate with small insults.", "Anticholinergic and sedative drugs commonly precipitate delirium.", "Antipsychotics reduce agitation but not duration and carry stroke and arrhythmia risk."],
 presentation={"symptoms": ["Acute confusion, fluctuating through the day", "Hallucinations, fear, agitation", "Sleepiness and withdrawal (hypoactive)"], "physicalSigns": ["Inattention (cannot do months backwards)", "Disorientation", "Signs of the cause (fever, dehydration, retention)"], "redFlags": ["Hypoactive delirium is easily missed (NICE 1.3)", "Hypoxia, hypoglycaemia, sepsis: treat urgently", "Parkinson disease or Lewy body dementia: avoid antipsychotics (NICE; SIGN)", "Head injury or new focal signs"], "precipitants": ["Infection (urinary, chest)", "Drugs (opioids, benzodiazepines, anticholinergics) and withdrawal", "Dehydration, electrolyte disturbance", "Urinary retention, constipation, pain", "Surgery, hip fracture"]},
 differentials=[("Dementia", "Gradual, attention preserved early; can coexist — treat delirium first (NICE 1.6)."), ("Depression", "Low mood; attention intact."), ("Psychosis", "Clear consciousness; earlier psychiatric history."), ("Non-convulsive status epilepticus", "EEG.")],
 criteria=[("At risk (NICE 1.2)", "Age 65 or over, cognitive impairment or dementia, hip fracture, severe illness."), ("Assessment (NICE 1.6)", "4AT on general wards; CAM-ICU or ICDSC in critical care."), ("Drug use (NICE 1.7)", "Only after de-escalation fails; short term, usually 1 week or less.")],
 ruleIn=[
  inv("specializedAdjunctive", "4AT", "Bedside tool", "Delirium", "Score 0", "Score 4 or more: possible delirium", "When indicators present (NICE 1.6).", "cg103", "recommendation 1.6"),
  inv("specializedAdjunctive", "CAM-ICU or ICDSC", "Bedside tool in critical care", "Delirium in ICU", "Negative", "Positive", "Critical care and recovery (NICE 1.6).", "cg103", "recommendation 1.6"),
  inv("laboratory", "Blood glucose, electrolytes (sodium, calcium), urea, creatinine, liver tests, blood count", "Blood", "Metabolic and infective causes", "Within reference range", "Hyponatraemia, hypercalcaemia, uraemia, raised white cells", "Find the cause (NICE 1.7).", "cg103", "recommendation 1.7"),
  inv("laboratory", "Urine and blood cultures; chest X-ray", "Microbiology; radiograph", "Infection", "No growth; clear chest", "Infection source", "If infection suspected.", "cg103", "recommendation 1.7"),
  inv("specializedAdjunctive", "Medication review", "Drug chart", "Drug cause", "No deliriogenic drugs", "Anticholinergics, opioids, benzodiazepines", "Part of prevention and treatment (NICE 1.4).", "cg103", "recommendation 1.4"),
  inv("specializedAdjunctive", "Electrocardiogram (ECG) before haloperidol", "12-lead ECG", "QTc", "QTc under 450 ms (men), 470 ms (women)", "Prolonged QTc", "Haloperidol contraindicated with QTc prolongation (SIGN).", "sign157", PH)],
 ruleOut=[inv("advancedImaging", "Computed tomography (CT) head", "CT", "Stroke, bleed, subdural", "Normal", "Acute lesion", "Head injury, focal signs, anticoagulation or unexplained cause.", "cg103", "recommendation 1.7")],
 management=[
  step("prevent", "Prevent", "Within 24 hours of admission", ["Familiar team; avoid ward moves (NICE 1.4.1).", "Orientation, hydration, mobility, pain control, sensory aids, sleep, medicine review (NICE 1.4)."]),
  step("detect", "Detect", "Daily", ["Observe daily for changes; 4AT if changes (NICE 1.5, 1.6).", "Look for hypoactive delirium (NICE 1.3)."]),
  step("treat", "Treat the cause", "Immediately", ["Identify and manage causes; reorient and reassure (NICE 1.7).", "Involve family."]),
  step("distress", "Severe distress or risk", "If de-escalation fails", ["Verbal and non-verbal de-escalation first (NICE 1.7).", "Haloperidol at the lowest dose, usually 1 week or less; review every 24 hours (NICE; SIGN).", "Avoid antipsychotics in Parkinson disease or Lewy body dementia; use lorazepam (SIGN)."]),
  step("inform", "Information", "Throughout", ["Explain to family that delirium is common and usually temporary (NICE 1.8)."])],
 branches=[("Severe distress or risk", "Delirium with distress or risk after de-escalation fails."), ("Antipsychotic contraindicated", "Parkinson disease, Lewy body dementia or prolonged QTc.")],
 regimens=[
  rx("Severe distress or risk", "Antipsychotic", "Delirium with severe distress or risk", "Adults", "Haloperidol", "Oral 0.5–1 mg or IM 0.5 mg; maximum 2 mg in 24 hours", "Oral or IM", "As needed; review every 24 hours", "Usually 1 week or less (NICE)", ADULT, NOT_ABX, "Use lower doses in renal impairment.", "Use lower doses in hepatic impairment.", ["ECG (QTc), extrapyramidal effects, falls"], ["Parkinson disease, Lewy body dementia, prolonged QTc (SIGN; NICE)"], "sign157", PH, sel="one-of", pref=True),
  rx("Severe distress or risk", "Antipsychotic", "Delirium with severe distress or risk", "Adults", "Risperidone", "0.25 mg; maximum 1 mg in 24 hours", "Oral", "Once daily or as needed", "Shortest possible", ADULT, NOT_ABX, "Lower dose in renal impairment.", "Lower dose in hepatic impairment.", ["Extrapyramidal effects, BP"], ["Parkinson disease, Lewy body dementia"], "sign157", PH, sel="one-of", pref=False, use="Haloperidol unsuitable (QTc concern) and antipsychotic still needed."),
  rx("Antipsychotic contraindicated", "Benzodiazepine", "Delirium where antipsychotics are contraindicated", "Adults", "Lorazepam", "0.5–1 mg; maximum 2 mg in 24 hours", "Oral", "As needed", "Shortest possible", ADULT, NOT_ABX, "No adjustment.", "Preferred benzodiazepine in liver disease; still use lowest dose.", ["Sedation, respiratory rate, falls"], ["Respiratory failure"], "sign157", PH)],
 medNote="Drug doses from SIGN 157; indications and limits from NICE CG103. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Delirium in Indian hospital wards and ICUs.", "learningObjectives": ["Identify patients at risk.", "Screen with the 4AT.", "Treat causes; use drugs sparingly."],
  "keyPoints": ["Think delirium in every older inpatient.", "4AT on wards; CAM-ICU in ICU.", "Treat the cause first.", "Haloperidol 0.5–1 mg, maximum 2 mg/day, short term."],
  "pitfalls": ["Missing hypoactive delirium.", "Sedating without finding the cause.", "Antipsychotics in Parkinson disease.", "Physical restraint instead of de-escalation."],
  "references": [tref("cg103", "recommendations 1.1–1.8"), tref("sign157", "section Pharmacological treatment")]},
 nonClinical={"patientEducation": ["Families: bring glasses, hearing aids, familiar objects; visit and reorient."], "lifestyleAndDiet": ["Fluids, nutrition, mobility, normal sleep-wake cycle."], "mdtReferrals": ["Geriatrics or psychiatry for persistent delirium", "Physiotherapy", "Memory clinic after recovery"], "dischargeCriteria": ["Cause treated; cognition at or near baseline"], "followUpPlan": "Check cognition after discharge; persistent impairment needs dementia assessment (NICE)."})
T["pathophysiology"]["summary"] += " In India, common precipitants in older inpatients include urinary and chest infection, dehydration, hyponatraemia, constipation, urinary retention, and drugs such as anticholinergics, opioids and benzodiazepines bought over the counter."
T["presentation"]["symptoms"] += ["Day–night reversal and poor sleep", "Family notice 'he is not himself' or new forgetfulness"]
T["presentation"]["physicalSigns"] += ["Fluctuating level of alertness during the examination", "Asterixis or tremor (metabolic causes), or a palpable bladder (retention)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Dementia", "Gradual onset over months with attention preserved early; the 4AT and an informant history of recent change settle it — the two can coexist, and delirium is managed first (NICE 1.6)."),
 ("Depression", "Low mood, slowed thinking but intact attention and no fluctuation in alertness; the 4AT and a mood assessment settle it."),
 ("Primary psychosis", "Clear consciousness, intact attention and a past psychiatric history; normal 4AT attention items and no medical cause settle it."),
 ("Non-convulsive status epilepticus", "Fluctuating confusion with subtle twitching or a history of seizures; an EEG settles it."),
 ("Alcohol or benzodiazepine withdrawal", "Tremor, sweating, tachycardia and hallucinations 1–3 days after stopping; history and withdrawal scoring settle it (see Alcohol withdrawal topic)."),
 ("Stroke or subdural haematoma", "Focal signs, a fall or anticoagulation; CT head settles it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "inform":
        m["actions"] = ["Explain to the person and family that delirium is common, usually temporary, and what to watch for (NICE 1.8).", "Make the information fit the person's language, culture and cognition; document the diagnosis for primary care (NICE 1.6, 1.8)."]
T["clinicalManagement"].insert(3, step("causes", "Common causes to check", "Within hours", ["Check pain, hydration, constipation, urinary retention, hypoxia and new or stopped drugs (NICE 1.4; SIGN).", "Bloods for glucose, sodium, calcium, renal and liver function and infection; cultures and chest X-ray if infection suspected (NICE 1.7)."]))
T["teaching"]["learningObjectives"].append("Systematically search for the medical cause of delirium.")
T["teaching"]["keyPoints"].append("Look for pain, retention, constipation, hypoxia, infection, drugs and electrolytes in every patient.")
T["teaching"]["pitfalls"].append("Using benzodiazepines for agitation outside alcohol withdrawal or antipsychotic contraindication.")

ALG = algo("delirium-pathway", "Acute confusion in an older inpatient", "confirm", "cg103", "recommendations 1.3–1.7 (drug doses from SIGN 157)", [
 node("start", "start", "Recent change in cognition, alertness or behaviour", [("fourat", None)]),
 node("fourat", "decision", "4AT score 4 or more (CAM-ICU or ICDSC in ICU)?", [("del", "Yes"), ("other", "No")]),
 node("other", "outcome", "Delirium unlikely; consider cognitive impairment, depression or another cause; reassess daily", None),
 node("del", "action", "Delirium likely: look for causes — infection, drugs, retention, constipation, pain, hypoxia, sodium, glucose", [("risk", None)]),
 node("risk", "decision", "Severe distress or risk to self or others?", [("deesc", "Yes"), ("support", "No")]),
 node("support", "outcome", "Treat the cause; reorientation, family, sleep, hydration, mobility; no sedatives", None),
 node("deesc", "action", "Verbal and non-verbal de-escalation", [("works", None)]),
 node("works", "decision", "De-escalation effective?", [("support2", "Yes"), ("pd", "No")]),
 node("support2", "outcome", "Continue non-drug care and treat the cause", None),
 node("pd", "decision", "Parkinson disease, Lewy body dementia or prolonged QTc?", [("loraz", "Yes"), ("halo", "No")]),
 node("loraz", "outcome", "Lorazepam 0.5–1 mg (maximum 2 mg in 24 hours); review every 24 hours", None),
 node("halo", "outcome", "Haloperidol 0.5–1 mg oral (maximum 2 mg in 24 hours), usually 1 week or less; ECG; review every 24 hours", None)])

VIG = "Mr K, an 82-year-old retired schoolteacher from Kolkata with mild memory problems, was admitted 2 days ago with a hip fracture after a fall. Last night he pulled out his cannula, shouted that the nurses were poisoning him and tried to climb out of bed. This morning he is drowsy and cannot say the months backwards. He has not opened his bowels for 4 days, has a palpable bladder, and is receiving tramadol and nightly diphenhydramine for sleep."

EXP = [
 explain("pathophysiology", "Why the vulnerable brain fails", "Why do some patients become delirious with a minor insult?",
  "Delirium is acute brain failure. It results from an interaction between vulnerability — older age, dementia, frailty, sensory impairment, severe illness — and precipitating insults such as infection, surgery, dehydration, electrolyte disturbance, pain, urinary retention, constipation and drugs. The more vulnerable the brain, the smaller the insult needed: a patient with dementia may become delirious from constipation alone. Inflammation, reduced cerebral perfusion and an imbalance between cholinergic and dopaminergic activity are thought to underlie it, which is why anticholinergic drugs (including many sleeping tablets and antihistamines) are such common culprits. Delirium increases the risk of death, longer hospital stay and later dementia, so prevention and early detection matter."),
 explain("signs-symptoms", "Recognising the quiet and the noisy forms", "How do you spot delirium on a busy ward?",
  "The core features are an acute onset, a fluctuating course and inattention, with disorganised thinking or an altered level of consciousness. Hyperactive delirium — agitation, hallucinations, pulling out lines — is easy to see. Hypoactive delirium, with drowsiness, withdrawal and reduced intake, is common in older people and is often missed or mislabelled as depression or tiredness. Ask the family whether this is a change from normal: an informant history is the single most useful piece of information. Observe everyone at risk at least daily for changes in cognition, perception, physical function and behaviour, and use the 4AT when a change is noticed."),
 explain("investigations", "Finding the cause", "What should the work-up include?",
  "Delirium is a symptom of something else, so the work-up is a search for the cause. Start at the bedside: check pain, look for a full bladder and constipation, measure oxygen saturation and glucose, and review the drug chart for new, increased or stopped medicines, especially anticholinergics, opioids, benzodiazepines and steroids. Blood tests should include sodium, calcium, urea, creatinine, liver function and a blood count, with cultures and a chest X-ray if infection is suspected. CT of the head is for focal signs, a fall, anticoagulation or no other explanation. An EEG helps when non-convulsive status epilepticus is possible. An ECG is needed before haloperidol to check the QTc interval."),
 explain("management", "Treat the cause, protect the patient", "When and how should drugs be used?",
  "The treatment of delirium is the treatment of its cause, combined with good supportive care: a familiar team, reorientation with clocks and family, glasses and hearing aids, hydration and nutrition, mobilisation, bowel and bladder care, pain control and sleep. Drugs do not treat delirium. They are used only for severe distress or risk to the patient or others when verbal and non-verbal de-escalation has failed. Haloperidol 0.5–1 mg orally (maximum 2 mg in 24 hours) is the usual choice, for a week or less, reviewed every 24 hours, with an ECG. In Parkinson disease or Lewy body dementia, antipsychotics can cause severe rigidity, so lorazepam 0.5–1 mg is used instead. Stop or reduce deliriogenic drugs, and remember that sedation can mask deterioration.")]

QS = [
 bq("q1", "An 82-year-old man two days after a hip fracture is agitated at night, pulled out his cannula and is drowsy in the morning. He cannot recite the months backwards. He has not opened his bowels for 4 days, has a palpable bladder and receives tramadol and nightly diphenhydramine.", "What is the most appropriate first step?",
  [("Start haloperidol 2 mg three times daily", "Drugs are not first-line; the dose also exceeds the 2 mg daily maximum (SIGN)."),
   ("Treat the causes: catheterise the bladder, relieve constipation, stop diphenhydramine and review analgesia", "Correct. Urinary retention, constipation, an anticholinergic and opioid exposure are likely precipitants (NICE 1.4, 1.7)."),
   ("Start donepezil for dementia", "This is delirium, an acute change; cholinesterase inhibitors do not treat it."),
   ("Diazepam at night to improve sleep", "Benzodiazepines worsen delirium except in withdrawal or when antipsychotics are contraindicated."),
   ("Transfer to a psychiatric ward", "Delirium is a medical emergency managed on a medical or orthopaedic ward.")],
  "B", "Treat the precipitants of delirium before considering drugs.", "Find and treat the cause: retention, constipation, drugs, pain, infection, hypoxia."),
 bq("q2", "A 76-year-old woman with Parkinson disease for 8 years is admitted with pneumonia and on the second night becomes very agitated and frightened, trying to hit staff and climb over the bed rails despite calm reassurance and her daughter staying with her. Her QTc is normal, oxygen saturation is 95% and she is on levodopa three times daily.", "Which drug is most appropriate if one is needed?",
  [("Haloperidol 1 mg orally", "Antipsychotics must not be used in Parkinson disease because of severe extrapyramidal reactions (SIGN; NICE)."),
   ("Risperidone 0.25 mg", "Risperidone is also an antipsychotic and should be avoided with parkinsonism (SIGN)."),
   ("Lorazepam 0.5–1 mg orally, maximum 2 mg in 24 hours", "Correct. When antipsychotics are contraindicated, SIGN lists lorazepam at the lowest effective dose."),
   ("Stop levodopa", "Stopping levodopa abruptly worsens rigidity and can cause a dangerous withdrawal syndrome."),
   ("Physical restraint overnight", "Restraint increases harm and distress; de-escalation and safe drug choice come first.")],
  "C", "Choose a safe drug when antipsychotics are contraindicated.", "Parkinson disease or Lewy body dementia: avoid antipsychotics; lorazepam if a drug is essential."),
 bq("q3", "A 70-year-old man on day 3 after abdominal surgery is quiet, eats little and sleeps most of the day. The nurses think he is 'just tired'. His daughter says he is not recognising her properly and was alert before surgery. His 4AT score is 6.", "What is the most likely diagnosis?",
  [("Postoperative depression", "Depression does not cause fluctuating attention or a positive 4AT."),
   ("Normal postoperative fatigue", "Fatigue does not impair recognition or produce a 4AT score of 6."),
   ("New-onset dementia", "Dementia develops over months; this is an acute change after surgery."),
   ("Primary psychosis", "Psychosis occurs with clear consciousness and intact attention."),
   ("Hypoactive delirium", "Correct. Drowsiness, reduced intake and inattention with an acute change and a 4AT of 4 or more indicate hypoactive delirium (NICE 1.3, 1.6).")],
  "E", "Recognise hypoactive delirium.", "Quiet, drowsy and new inattention = hypoactive delirium; use the 4AT.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
for r in T["investigations"]["ruleIn"]:
    if r["testName"].startswith("Electrocardiogram"):
        r["normalValue"] = "QTc under 450 ms (men), 470 ms (women) (general reference values, not from SIGN)"
        r["clinicalRationale"] = "SIGN: haloperidol is contra-indicated in combination with QTc-prolonging drugs, making its use unlicensed; check the QTc first."
    if "(NICE 1.7)" in r["clinicalRationale"]:
        r["clinicalRationale"] = "Find the cause; NICE 1.7 asks to identify and manage causes but does not list tests (general practice)."
    if r["clinicalRationale"] == "If infection suspected.":
        r["clinicalRationale"] = "If infection is suspected (general practice)."
for r in T["medicationPlan"]["regimens"]:
    n = r["genericName"]
    if n == "Haloperidol":
        r["contraindications"] = ["SIGN: do not use in Parkinson disease or Lewy body dementia; NICE: use with caution", "Contra-indicated with QTc-prolonging drugs (SIGN)", "Younger patients may need higher doses (SIGN)"]
    if n == "Risperidone":
        r["useWhen"] = "An atypical alternative at low dose when haloperidol is not tolerated (SIGN example); it also prolongs the QTc, so prolonged QTc is lorazepam territory."
    if n == "Lorazepam":
        r["adjustments"] = [a if not a.startswith("CLD:") else "CLD: Preferred benzodiazepine in liver disease, but can precipitate hepatic encephalopathy; use the lowest dose." for a in r["adjustments"]]
        r["contraindications"] = ["Severe respiratory insufficiency or respiratory failure", "Sleep apnoea", "Myasthenia gravis"]
for m in T["clinicalManagement"]:
    if m["id"] == "prevent":
        m["actions"] = ["Familiar team; avoid ward moves (NICE 1.4).", "Orientation, hydration, mobility, pain control, sensory aids, sleep, medicine review (NICE 1.4).", "Remove urinary catheters early; in intensive care, review sedation daily."]
    if m["id"] == "causes":
        m["actions"] += ["Check bedside glucose before any sedative.", "Malnourished or alcohol-using patients with suspected Wernicke encephalopathy: parenteral thiamine before glucose; thiamine dosing is given in the Alcohol withdrawal topic."]
    if m["id"] == "distress":
        m["actions"] = ["Verbal and non-verbal de-escalation first (NICE 1.7).", "Haloperidol at the lowest dose (oral 0.5–1 mg or IM 0.5 mg, maximum 2 mg in 24 hours), usually 1 week or less; review every 24 hours (NICE; SIGN).", "Parkinson disease or Lewy body dementia: SIGN says do not use antipsychotics and NICE advises caution; use lorazepam (SIGN). Give levodopa on time and never miss doses."]
    if m["id"] == "inform":
        m["actions"].append("Assess capacity for each decision and document it; follow the Mental Healthcare Act 2017 if restraint or admission against the person's wishes is considered.")
for n in T["algorithms"][0]["nodes"]:
    if n["id"] == "halo":
        n["text"] = "Haloperidol 0.5–1 mg oral or 0.5 mg IM (maximum 2 mg in 24 hours), usually 1 week or less; ECG; review every 24 hours"
g = T["teaching"]["guidedApproach"]
for b in g:
    b["guidance"] = b["guidance"].replace("Haloperidol 0.5–1 mg orally (maximum 2 mg in 24 hours)", "Haloperidol 0.5–1 mg orally or 0.5 mg IM (maximum 2 mg in 24 hours; younger patients may need more, SIGN)")
for q in T["teaching"]["boardQuestions"]:
    for o in q["options"]:
        o["explanation"] = o["explanation"].replace("Antipsychotics must not be used in Parkinson disease because of severe extrapyramidal reactions (SIGN; NICE).", "SIGN says do not use antipsychotics in Parkinson disease (NICE advises caution) because of severe extrapyramidal reactions.")

save("t75_delirium.json", [T])
