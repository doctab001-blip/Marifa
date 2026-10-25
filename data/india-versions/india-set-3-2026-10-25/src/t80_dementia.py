from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Dementia (India)"
DR = "section Drugs and doses"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Neurology / Psychiatry / Geriatrics / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Recognition, work-up and long-term care of dementia in older adults in India at PHC, district and tertiary level: when to suspect, excluding delirium and depression, reversible causes, investigations, cholinesterase inhibitors and memantine, behavioural symptoms, caregiver support and referral, built on the ICMR Dementia STW (October 2019).",
 findings=["Suspicion criteria, behavioural features, delirium and depression as alternatives, reversible causes (hypothyroidism, B12 deficiency, subdural haematoma, depression, normal pressure hydrocephalus, chronic meningitis), investigations by level, red flags (fever, rapid progression, seizures, head injury, alcoholism and falls), donepezil 5 mg then 10 mg, rivastigmine 1.5 mg twice daily titrated monthly to 6 mg twice daily, memantine 5 mg twice daily then 10 mg twice daily, galantamine 8 mg twice daily if others not tolerated, escitalopram 10 mg for depression, non-drug management of behaviour first, caregiver education and referral levels checked against the ICMR Dementia STW (October 2019).", "Not clinically reviewed."],
 unverified=["The STW gives no screening tool cut-offs (MMSE or HMSE); none are shown.", "Antipsychotic doses for severe behavioural symptoms are not given in the STW and are not included.", "Galantamine titration is incomplete in the STW."],
 summary="Dementia affects millions of older Indians, most undiagnosed, and is often dismissed as normal ageing. It is a progressive decline in memory and at least one other cognitive domain severe enough to affect daily function. The ICMR workflow asks primary care doctors to suspect it from the history given by a close caregiver, to rule out delirium and depression, to look for treatable causes (thyroid, B12, syphilis, HIV, subdural haematoma, normal pressure hydrocephalus), and to start a cholinesterase inhibitor for Alzheimer or mixed dementia, adding memantine in moderate to severe disease. Behavioural symptoms are managed first without drugs. Caregiver education, support and planning for palliative care are core.",
 mechanisms=["Alzheimer disease: amyloid plaques and tau tangles with loss of cholinergic neurons.", "Vascular dementia: multiple infarcts or small vessel disease; common in India with hypertension and diabetes.", "Cholinesterase inhibitors increase acetylcholine; memantine blocks excess glutamate (NMDA) activity.", "Delirium on top of dementia accelerates decline."],
 presentation={"symptoms": ["Forgetfulness, repeating questions, getting lost (ICMR STW)", "Difficulty with previously learned tasks (ICMR STW)", "Apathy, aggression, sleep disturbance, hallucinations (ICMR STW)"], "physicalSigns": ["Impaired recall and orientation", "Focal signs or gait disturbance (vascular, NPH)", "Signs of hypothyroidism or B12 deficiency"], "redFlags": ["Fever (ICMR STW)", "Rapid progression (ICMR STW)", "Seizures (ICMR STW)", "Recent head injury; alcoholism and falls (subdural haematoma) (ICMR STW)"], "precipitants": ["Age, hypertension, diabetes, stroke", "Alcohol", "Head injury", "Hearing and vision loss"]},
 differentials=[("Delirium", "Acute, fluctuating attention (ICMR STW)."), ("Depression (pseudodementia)", "Low mood; poor effort on testing (ICMR STW)."), ("Mild cognitive impairment", "Function preserved."), ("Reversible causes", "Hypothyroidism, B12 deficiency, subdural haematoma, NPH, neurosyphilis.")],
 criteria=[("Suspect dementia (ICMR STW)", "Decline in more than one cognitive domain or in function, from baseline."), ("Probable Alzheimer disease (ICMR STW)", "Typical age, gradual progression, no focal signs."), ("Memantine (ICMR STW)", "Moderate to severe dementia.")],
 ruleIn=[
  inv("specializedAdjunctive", "History from a close caregiver and cognitive examination", "Bedside", "Dementia", "No decline", "Decline in memory and other domains with functional loss", "Diagnosis rests on history (ICMR STW).", "dem", "section Screening"),
  inv("laboratory", "Thyroid function, vitamin B12, VDRL, blood count, biochemistry, liver tests, lipids, vitamin D", "Blood", "Reversible causes and risk factors", "Within reference range", "Hypothyroidism, low B12, reactive VDRL", "At PHC (ICMR STW).", "dem", "section Investigations"),
  inv("advancedImaging", "Computed tomography (CT) or magnetic resonance imaging (MRI) brain", "Neuroimaging", "Subdural haematoma, tumour, NPH, infarcts", "Age-appropriate atrophy only", "Subdural, tumour, ventriculomegaly, infarcts", "District level (ICMR STW).", "dem", "section Investigations"),
  inv("laboratory", "HIV test after counselling", "Blood", "HIV-associated neurocognitive disorder", "Non-reactive", "Reactive", "When suspicion is high (ICMR STW).", "dem", "section Investigations"),
  inv("specializedAdjunctive", "Neuropsychological testing", "Formal testing", "Pattern and severity", "Normal", "Domain-specific deficits", "Tertiary centre (ICMR STW).", "dem", "section Investigations")],
 ruleOut=[inv("specializedAdjunctive", "Depression screen", "History", "Depression", "No depressive symptoms", "Depressive symptoms: treat (escitalopram 10 mg)", "Depression mimics or coexists (ICMR STW).", "dem", "section When to suspect")],
 management=[
  step("suspect", "Suspect and assess", "First visits", ["History from caregiver; exclude delirium and depression (ICMR STW).", "Treat vascular risk factors and vision or hearing deficits (ICMR STW)."]),
  step("investigate", "Investigate", "First month", ["Blood tests at PHC; neuroimaging at district level (ICMR STW).", "Red flags: refer urgently (ICMR STW)."]),
  step("treat", "Treat", "From diagnosis", ["Donepezil; rivastigmine or galantamine if not tolerated (ICMR STW).", "Memantine for moderate to severe dementia (ICMR STW).", "Escitalopram 10 mg for depression (ICMR STW)."]),
  step("behav", "Behavioural symptoms", "Ongoing", ["Find triggers (pain, infection, constipation); non-drug measures first; avoid antipsychotics unless necessary (ICMR STW)."]),
  step("support", "Support", "Long term", ["Educate caregivers; support programmes; assess palliative needs (ICMR STW)."])],
 branches=[("Cholinesterase inhibitor", "Alzheimer, vascular or mixed dementia."), ("Moderate to severe dementia", "Moderate to severe stage."), ("Depression in dementia", "Depressive symptoms.")],
 regimens=[
  rx("Cholinesterase inhibitor", "Cholinesterase inhibitor", "Dementia", "Older adults", "Donepezil", "5 mg for 1 month, then 10 mg", "Oral", "Once daily after breakfast", "Long term; review benefit", ADULT, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Pulse (bradycardia), nausea, sleep"], ["Sick sinus syndrome, heart block, active peptic ulcer"], "dem", DR, sel="one-of", pref=True),
  rx("Cholinesterase inhibitor", "Cholinesterase inhibitor", "Dementia", "Older adults", "Rivastigmine", "1.5 mg twice daily for 1 month, then 3 mg, 4.5 mg, then 6 mg twice daily (monthly steps)", "Oral", "Twice daily after meals", "Long term", ADULT, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Weight, nausea, pulse"], ["Heart block, bradycardia"], "dem", DR, sel="one-of", pref=False, use="Donepezil not tolerated (ICMR STW)."),
  rx("Cholinesterase inhibitor", "Cholinesterase inhibitor", "Dementia", "Older adults", "Galantamine", "8 mg", "Oral", "Twice daily", "Long term", ADULT, NOT_ABX, "Avoid in severe renal impairment.", "Avoid in severe liver impairment.", ["Pulse, nausea"], ["Heart block"], "dem", DR, sel="one-of", pref=False, use="Other cholinesterase inhibitors not tolerated (ICMR STW)."),
  rx("Moderate to severe dementia", "NMDA antagonist", "Moderate to severe dementia", "Older adults", "Memantine", "5 mg twice daily for 1 month, then 10 mg twice daily", "Oral", "Twice daily", "Long term", ADULT, NOT_ABX, "Reduce dose in severe renal impairment.", "No adjustment.", ["Dizziness, confusion"], ["Severe renal impairment (dose reduction)"], "dem", DR),
  rx("Depression in dementia", "SSRI", "Depression with dementia", "Older adults", "Escitalopram", "10 mg", "Oral", "Once daily", "At least 6–12 months", ADULT, NOT_ABX, "Caution in severe renal impairment.", "Maximum 10 mg in hepatic impairment.", ["Sodium (hyponatraemia), falls, QT"], ["Prolonged QT"], "dem", DR)],
 medNote="All doses from the ICMR Dementia STW (October 2019). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Dementia in Indian primary and district care.", "learningObjectives": ["Suspect dementia from the caregiver history.", "Exclude reversible causes.", "Start and titrate dementia medicines."],
  "keyPoints": ["Rule out delirium and depression.", "Check thyroid, B12, VDRL; image if red flags.", "Donepezil 5 mg then 10 mg after breakfast.", "Memantine for moderate to severe disease."],
  "pitfalls": ["Calling it normal ageing.", "Missing subdural haematoma in a person who falls.", "Antipsychotics as first response to agitation.", "Ignoring caregiver strain."],
  "references": [tref("dem", "sections When to suspect, Reversible causes, Investigations, Red flags, Drugs and doses, Caregiver support, Referral")]},
 nonClinical={"patientEducation": ["Caregivers: routine, orientation cues, safety at home, wandering precautions.", "Plan finances and decisions early while the person can take part."], "lifestyleAndDiet": ["Physical activity, social engagement, control BP and diabetes, hearing aids and glasses."], "mdtReferrals": ["District psychiatrist or neurologist (ICMR STW)", "Caregiver support groups", "Palliative care in advanced disease (ICMR STW)"], "dischargeCriteria": ["Outpatient care"], "followUpPlan": "Monthly during titration, then every 3–6 months; review function, behaviour, caregiver burden and side effects (ICMR STW)."})
# Depth standard (2026-10-25)
U = T["evidenceAudit"]["unverifiedSections"]
T["evidenceAudit"]["unverifiedSections"] = [u for u in U if not u.startswith("Antipsychotic doses")]
T["evidenceAudit"]["unverifiedSections"].insert(1, "The ICMR STW gives no antipsychotic dose; risperidone is taken from the UK summary of product characteristics (licensed only for short-term aggression in moderate to severe Alzheimer dementia).")
T["evidenceAudit"]["findings"].append("Risperidone SmPC 4.1–4.4: 0.25 mg twice daily, increase by 0.25 mg twice daily no more often than every other day; optimum 0.5 mg twice daily, up to 1 mg twice daily; no longer than 6 weeks; halve doses in renal or hepatic impairment; increased mortality and about 3-fold cerebrovascular risk in elderly people with dementia; not for dementias other than Alzheimer.")
P = T["medicationPlan"]
P["branches"].append({"label": "Severe aggression in Alzheimer dementia", "entryCriteria": "Persistent aggression with risk of harm despite non-drug measures and treatment of triggers."})
P["note"] = P["note"].replace("All doses from the ICMR Dementia STW (October 2019).", "Doses from the ICMR Dementia STW (October 2019); risperidone from the UK summary of product characteristics.")
P["regimens"].append(rx("Severe aggression in Alzheimer dementia", "Antipsychotic (short term)", "Persistent aggression with risk of harm, unresponsive to non-drug measures", "Adults with moderate to severe Alzheimer dementia", "Risperidone",
 "0.25 mg twice daily; increase by 0.25 mg twice daily no more often than every other day; usual 0.5 mg twice daily, maximum 1 mg twice daily", "Oral", "Twice daily", "No longer than 6 weeks",
 "Adult topic; paediatric use is outside the scope of the cited sources.", "Not an antibiotic; penicillin allergy does not change this medicine.", "Halve starting and later doses and titrate more slowly (SmPC 4.2).", "Halve starting and later doses and titrate more slowly (SmPC 4.2).",
 ["Sedation, falls, parkinsonism, stroke symptoms; review at least every 2 weeks and stop by 6 weeks"],
 ["Dementia other than Alzheimer (vascular, Lewy body); Parkinson disease (worsens); increased mortality and stroke risk in elderly people with dementia; caution with furosemide"], "rispsmpc", "sections 4.1, 4.2 and 4.4"))
T["pathophysiology"]["summary"] += " Alzheimer disease is the commonest type, followed by vascular and mixed dementia; the diagnosis is clinical and supported, not made, by tests."
T["presentation"]["symptoms"].append("Word-finding difficulty, misplacing objects and trouble with money or medicines")
T["presentation"]["physicalSigns"].append("Parkinsonism, fluctuating alertness or visual hallucinations (Lewy body dementia)")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Delirium", "Acute onset over hours to days with fluctuating attention and often a medical cause; a 4AT or CAM assessment settles it (ICMR STW)."),
 ("Depression (pseudodementia)", "Low mood, poor effort and 'don't know' answers on testing; improvement with antidepressant treatment settles it (ICMR STW)."),
 ("Mild cognitive impairment", "Cognitive decline on testing with daily function preserved; caregiver history of independent function settles it."),
 ("Hypothyroidism or vitamin B12 deficiency", "Slowness, weight gain or neuropathy with cognitive decline; TSH and B12 levels settle it (ICMR STW)."),
 ("Chronic subdural haematoma or normal pressure hydrocephalus", "Falls, headache or gait apraxia with urinary incontinence; CT or MRI of the brain settles it (ICMR STW)."),
 ("Neurosyphilis or HIV-associated neurocognitive disorder", "Younger onset or risk factors, rapid course; serum VDRL or TPHA and HIV tests settle it (ICMR STW).")]]
for m in T["clinicalManagement"]:
    if m["id"] == "behav":
        m["actions"] = ["Find triggers (pain, infection, constipation, sleep, hearing loss); non-drug measures first (ICMR STW).",
                        "Avoid antipsychotics unless there is severe distress or risk of harm; in Alzheimer dementia, risperidone 0.25 mg twice daily for no more than 6 weeks (ICMR STW; SmPC)."]
    if m["id"] == "support":
        m["actions"] = ["Educate caregivers; refer to support programmes; screen the caregiver for burden and depression (ICMR STW).",
                        "Plan ahead: driving, finances, advance care planning and palliative care needs (ICMR STW)."]
T["teaching"]["references"].append(tref("rispsmpc", "sections 4.1, 4.2 and 4.4"))

ALG = algo("dementia-pathway", "Suspected dementia: assess and treat", "manage", "dem", "sections When to suspect, Reversible causes, Investigations, Red flags, Drugs and doses", [
 node("start", "start", "Memory or cognitive decline reported by patient or caregiver", [("acute", None)]),
 node("acute", "decision", "Acute onset or fluctuating attention?", [("delir", "Yes"), ("redf", "No")]),
 node("delir", "outcome", "Treat as delirium; find and treat the cause", None),
 node("redf", "decision", "Red flags: fever, rapid progression, seizures, head injury, focal signs?", [("urg", "Yes"), ("work", "No")]),
 node("urg", "outcome", "Urgent referral and neuroimaging", None),
 node("work", "action", "Screen for depression; TSH, B12, glucose, VDRL, HIV; neuroimaging at district level", [("rev", None)]),
 node("rev", "decision", "Reversible cause found?", [("treat", "Yes"), ("type", "No")]),
 node("treat", "outcome", "Treat the cause and reassess cognition", None),
 node("type", "action", "Alzheimer, vascular or mixed dementia: donepezil (or rivastigmine, galantamine)", [("sev", None)]),
 node("sev", "decision", "Moderate to severe?", [("mem", "Yes"), ("sup", "No")]),
 node("mem", "outcome", "Add memantine; caregiver support; non-drug care of behaviour", None),
 node("sup", "outcome", "Continue; caregiver support; review every 3–6 months", None)])

VIG = "Mr K, a 74-year-old retired railway clerk from Lucknow, is brought by his daughter, who says that over 2 years he has repeated questions, got lost returning from the market and stopped managing his pension. He now shouts at his wife in the evenings and once pushed her. He has hypertension and diabetes. There is no fever, no recent fall and no sudden change."

EXP = [
 explain("pathophysiology", "Neurodegeneration and vascular injury", "What causes the decline, and why do the drugs help only a little?",
  "In Alzheimer disease, amyloid plaques and tau tangles cause loss of neurons and synapses, starting in the hippocampus and spreading to temporal and parietal cortex; this explains early memory loss and later language and visuospatial problems. Loss of cholinergic neurons in the basal forebrain reduces acetylcholine, which is why cholinesterase inhibitors give modest symptomatic benefit without changing the course. Glutamate excitotoxicity underlies the use of memantine. Vascular dementia results from strokes and small-vessel disease, often with stepwise decline and gait problems, and hypertension and diabetes are key modifiable risks in India. Mixed pathology is common in older people."),
 explain("signs-symptoms", "History from the caregiver", "How do you recognise dementia and its subtype?",
  "Dementia is diagnosed when decline in memory and at least one other domain — language, attention, executive function or visuospatial skill — affects daily function. The history from a close caregiver is more reliable than the patient's own account. Ask how it began and progressed: gradual memory loss suggests Alzheimer disease, stepwise decline with focal signs suggests vascular dementia, early hallucinations and parkinsonism suggest Lewy body disease, and early personality change suggests frontotemporal dementia. Always look for delirium (acute, fluctuating) and depression, and for red flags such as fever, rapid progression, seizures or head injury that need urgent referral."),
 explain("investigations", "Look for the reversible", "Which tests matter?",
  "Basic tests at primary care look for treatable contributors: blood count, glucose, renal and liver function, electrolytes, TSH, vitamin B12, VDRL and HIV. These rarely reverse dementia but often make it worse when present. A cognitive screening test such as the Hindi Mental State Examination (HMSE) documents a baseline. Neuroimaging (CT or MRI) at district level excludes subdural haematoma, tumours and normal pressure hydrocephalus and shows vascular disease. A rapid course or young onset needs specialist assessment for rarer causes."),
 explain("management", "Drugs, behaviour and the caregiver", "How do you manage dementia step by step?",
  "Start donepezil 5 mg once daily for a month, then 10 mg, in Alzheimer, vascular or mixed dementia; use rivastigmine or galantamine if it is not tolerated. Add memantine 5 mg twice daily, rising to 10 mg twice daily, in moderate to severe disease. Treat depression with escitalopram 10 mg. Manage behavioural symptoms first by finding triggers — pain, constipation, infection, poor sleep — and with non-drug measures. If aggression in Alzheimer dementia persists with risk of harm, risperidone 0.25 mg twice daily (usually 0.5 mg twice daily, maximum 1 mg twice daily) may be used for no more than 6 weeks, accepting the increased stroke and mortality risk; avoid it in Lewy body and vascular dementia. Support and educate the caregiver.")]

QS = [
 bq("q1", "A 74-year-old man has 2 years of gradual memory decline, getting lost and inability to manage his money, reported by his daughter. He has hypertension and diabetes. Examination is non-focal. He is alert and attentive. TSH, B12, VDRL and HIV are normal, and CT shows mild atrophy.", "What is the most appropriate treatment?",
  [("Risperidone 1 mg twice daily", "Antipsychotics are not treatment for cognitive decline and carry stroke and mortality risk."),
   ("Escitalopram 10 mg once daily", "There are no depressive symptoms described, so an antidepressant is not indicated."),
   ("Memantine 10 mg twice daily alone", "Memantine is added for moderate to severe disease and is titrated from 5 mg twice daily."),
   ("No treatment; dementia is normal ageing", "Dementia is not normal ageing and treatment and caregiver support are indicated."),
   ("Donepezil 5 mg once daily, increasing to 10 mg after 1 month", "Correct. A cholinesterase inhibitor is first-line for Alzheimer or mixed dementia (ICMR STW).")],
  "E", "Start a cholinesterase inhibitor in Alzheimer or mixed dementia.", "Donepezil 5 mg, then 10 mg after a month."),
 bq("q2", "A 79-year-old woman with dementia became confused and agitated over 2 days, sleeping in the day and shouting at night. Her family says she was at her baseline last week. She has a temperature of 37.9 °C and dark, offensive urine. She has been constipated for 5 days.", "What is the best next step?",
  [("Increase donepezil to 15 mg", "The maximum dose is 10 mg, and the change is acute, not progression."),
   ("Treat as delirium: look for and treat infection and constipation", "Correct. Acute, fluctuating change in a person with dementia is delirium until proven otherwise (ICMR STW)."),
   ("Start risperidone 0.5 mg twice daily", "Antipsychotics are not first-line and the trigger has not been addressed."),
   ("Refer for MRI as an outpatient", "This misses an acute medical cause that needs treatment now."),
   ("Diagnose rapid progression of dementia", "Two days of change with fever suggests delirium, not progression.")],
  "B", "Recognise delirium superimposed on dementia.", "Sudden change in dementia: think delirium and look for triggers."),
 bq("q3", "A 76-year-old man with moderate Alzheimer dementia has hit his wife repeatedly over 3 weeks despite pain relief, treatment of constipation, a structured routine and caregiver training. He has no parkinsonism or hallucinations. Creatinine and liver tests are normal. His wife is frightened and asks for help.", "Which treatment is most appropriate?",
  [("Risperidone 0.25 mg twice daily, titrated slowly, for no more than 6 weeks", "Correct. Risperidone is licensed short term for persistent aggression in Alzheimer dementia after non-drug measures fail (SmPC 4.1–4.2)."),
   ("Haloperidol 5 mg twice daily long term", "High-dose, long-term typical antipsychotics cause severe parkinsonism and falls."),
   ("Lorazepam 2 mg three times daily", "Regular benzodiazepines worsen confusion, sedation and falls in dementia."),
   ("Risperidone 2 mg twice daily indefinitely", "This exceeds the 1 mg twice daily maximum and the 6-week limit (SmPC 4.2)."),
   ("Stop donepezil", "Stopping the cholinesterase inhibitor does not treat aggression and may worsen cognition.")],
  "A", "Use antipsychotics only short term and at low dose in Alzheimer aggression.", "Risperidone: 0.25 mg twice daily start, maximum 1 mg twice daily, 6 weeks.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [("Galantamine titration is incomplete in the STW (8 mg twice daily); the full titration and renal and hepatic limits are from the US label (Drugs.com)." if u.startswith("Galantamine titration") else u) for u in EA["unverifiedSections"]]
P = T["medicationPlan"]
P["branches"][0]["entryCriteria"] = "Alzheimer or mixed dementia (the STW lists these medicines for Alzheimer dementia)."
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
for r in P["regimens"]:
    n = r["genericName"]
    if n in ("Donepezil", "Rivastigmine", "Galantamine"):
        r["indication"] = "Alzheimer or mixed dementia"
        r["contraindications"] = ["Cautions: " + "; ".join(r["contraindications"]) + " (general pharmacology)"]
    if n == "Galantamine":
        r["dose"] = "Immediate release: 4 mg twice daily for 4 weeks, then 8 mg twice daily (ICMR STW dose), then 12 mg twice daily if needed; maximum 24 mg/day"
        r["sourceEdition"] = r["sourceEdition"] + "; titration from the US label (Drugs.com)"
        setadj(r, "CKD:", "CKD: Creatinine clearance 9–59 mL/min maximum 16 mg/day; below 9 not recommended (label, Drugs.com).")
        setadj(r, "CLD:", "CLD: Moderate impairment maximum 16 mg/day; severe impairment not recommended (label, Drugs.com).")
    if n == "Memantine":
        setadj(r, "CKD:", "CKD: Creatinine clearance 30–80 mL/min no adjustment; 5–29 mL/min 5 mg twice daily (label, Drugs.com).")
        setadj(r, "CLD:", "CLD: Mild to moderate no adjustment; severe impairment use with caution (label, Drugs.com).")
        r["contraindications"] = ["Hypersensitivity; caution in epilepsy (general pharmacology)"]
    if n == "Escitalopram":
        r["duration"] = "Review response; continue if helpful (duration not stated in the STW)"
        setadj(r, "CLD:", "CLD: Hepatic impairment 10 mg once daily (label, Drugs.com).")
        r["adjustments"].append("Older people: 10 mg once daily is the recommended dose (label, Drugs.com).")
    if n == "Risperidone":
        r["contraindications"] = ["Contraindication: hypersensitivity (SmPC 4.3)", "Cautions (SmPC 4.4): not for dementias other than Alzheimer (vascular, Lewy body); Parkinson disease may worsen; increased mortality and about 3-fold cerebrovascular risk in elderly people with dementia; caution with furosemide"]
        r["adjustments"].append("Use 0.5 mg tablets or oral solution to give 0.25 mg doses (SmPC footnote).")
T["diagnosticCriteria"][0]["threshold"] = "Decline in more than one cognitive domain along with functional decline, from baseline (ICMR STW)."
T["differentials"][0]["distinguishingFeatures"] = "Acute onset over hours to days with fluctuating attention and often a medical cause; a 4AT or CAM assessment settles it (general practice)."
T["differentials"][5]["distinguishingFeatures"] = "Younger onset or risk factors, rapid course; serum VDRL or TPHA then CSF testing, and HIV testing after counselling, settle it."
for m in T["clinicalManagement"]:
    if m["id"] == "support":
        m["actions"] = ["Educate caregivers and enrol patient and caregiver in an ongoing support programme (ICMR STW); screen the caregiver for burden and depression (general practice).",
                        "Assess palliative care needs (ICMR STW); plan ahead for driving, finances and advance care (general practice)."]
    if m["id"] == "investigate":
        m["actions"] = ["Blood tests at PHC (blood count, biochemistry, liver, lipids, thyroid, VDRL, B12, vitamin D); neuroimaging and HIV testing after counselling at district level (ICMR STW).", "Red flags or no response to adequate dose and duration of medicines: refer (ICMR STW)."]
T["nonClinicalManagement"]["followUpPlan"] = "Follow up and monitor for side effects, red flags and danger signs (ICMR STW); monthly during titration, then every 3–6 months (general practice)."
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("in Alzheimer, vascular or mixed dementia", "in Alzheimer or mixed dementia")
    b["guidance"] = b["guidance"].replace("A cognitive screening test such as the Hindi Mental State Examination (HMSE) documents a baseline.", "A brief cognitive screening test documents a baseline for later comparison; the STW names no specific tool, so use one validated in the patient's language.")
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q3":
        q["vignette"] = q["vignette"].replace("He has no parkinsonism", "He takes donepezil 10 mg daily and has no parkinsonism")
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["delir"]["text"] = "Treat as delirium; find and treat the cause; reassess cognition once delirium resolves"
N["work"]["text"] = "Screen for depression (escitalopram 10 mg if depressed); PHC bloods incl. TSH, B12, VDRL; neuroimaging and HIV (after counselling) at district level"
N["rev"]["next"] = [{"to": "treat", "label": "Yes"}, {"to": "type", "label": "No"}]
N["type"]["kind"] = "decision"; N["type"]["text"] = "Alzheimer or mixed dementia?"
N["type"]["next"] = [{"to": "chei", "label": "Yes"}, {"to": "oth", "label": "No"}]
N["sup"]["text"] = "Continue; caregiver support; review every 3–6 months; refer if no response to adequate dose and duration"
i = [n["id"] for n in A["nodes"]].index("type") + 1
A["nodes"][i:i] = [
 {"id": "chei", "kind": "action", "text": "Donepezil 5 mg then 10 mg (or rivastigmine, galantamine)", "next": [{"to": "sev"}]},
 {"id": "oth", "kind": "outcome", "text": "Vascular: treat vascular risk factors; Lewy body or frontotemporal features: specialist referral, avoid antipsychotics"}]
ALG2 = algo("dementia-behaviour", "Agitation or aggression in dementia", "ongoing", "dem", "section Behavioural symptoms (agitation)", [
 node("bstart", "start", "New agitation, aggression or distress in a person with dementia", [("trig", None)]),
 node("trig", "action", "Look for triggers: pain, constipation, infection, retention, sleep, hearing or vision loss, new drugs; non-drug measures", [("persist", None)]),
 node("persist", "decision", "Severe distress or risk of harm persisting despite this?", [("alz", "Yes"), ("nd", "No")]),
 node("nd", "outcome", "Continue non-drug care; support the caregiver; review"),
 node("alz", "decision", "Alzheimer dementia without parkinsonism or Lewy body features?", [("risp", "Yes"), ("avoid", "No")]),
 node("risp", "outcome", "Risperidone 0.25 mg twice daily, usual 0.5 mg twice daily, maximum 1 mg twice daily, for no more than 6 weeks (SmPC)"),
 node("avoid", "outcome", "Avoid antipsychotics; specialist advice")])
T["algorithms"].append(ALG2)

save("t80_dementia.json", [T])
