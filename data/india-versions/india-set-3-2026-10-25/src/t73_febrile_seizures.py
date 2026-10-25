from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Febrile seizures (India)"
TI = "section Therapeutic interventions"; PR = "section Prophylactic AEDs"
CH = "This is the paediatric dose (IAP)."
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Paediatric Neurology / Emergency Medicine", authority="Other", pillar="Urgent Care",
 scope="Febrile seizures in children aged 6–60 months in India: definitions, excluding meningitis, investigations, treatment of a seizure lasting more than 5 minutes, admission, intermittent and continuous prophylaxis, antipyretics and parent counselling, built on the IAP Tamil Nadu State Chapter COPP module on febrile seizures (2017).",
 findings=["Definitions (simple, complex, febrile status above 30 minutes), recurrence risk factors, lumbar puncture indications (under 6 months; 6–12 months if Hib or pneumococcal vaccination incomplete; meningitis signs; prior antibiotics), limited role of EEG and imaging, acute benzodiazepine doses (diazepam 0.3–0.5 mg/kg IV, lorazepam 0.1 mg/kg, midazolam 0.2 mg/kg, rectal diazepam 0.5 mg/kg), admission criteria, no benefit of antipyretics on recurrence, intermittent clobazam 0.3 mg/kg 12-hourly or diazepam 0.33 mg/kg 8-hourly for 24 hours from fever onset, continuous valproate 20–30 mg/kg/day or phenobarbitone 3–5 mg/kg/day for 2 years or to age 6, checked against the IAP COPP module (2017).", "Not clinically reviewed."],
 unverified=["The source is a state-chapter IAP teaching module, not a national IAP guideline.", "Paracetamol dose for comfort is not given in the module; the 15 mg/kg dose is from the Fever in Children (India) topic sources.", "Buccal or intranasal midazolam is named without a dose."],
 summary="Febrile seizures are the commonest seizures in childhood, affecting children aged 6 months to 5 years with fever but no brain infection or metabolic cause. Most are simple — generalised, under 15 minutes and not repeated within 24 hours — and carry an excellent prognosis with only about 1% later epilepsy risk. The key clinical task is to exclude meningitis, especially in infants and under-immunised children. Seizures over 5 minutes are treated with a benzodiazepine. Antipyretics do not prevent recurrence. Intermittent clobazam during fevers is reserved for frequent or complex seizures, and continuous drugs are rarely needed. Calm, clear counselling of parents is central.",
 mechanisms=["The immature brain has a lower seizure threshold with rapid temperature rise.", "Genetic predisposition: family history is a major risk factor.", "Viral infections (including roseola and influenza) are common triggers.", "Febrile seizures mark predisposition rather than cause epilepsy."],
 presentation={"symptoms": ["Fever with a generalised tonic-clonic seizure", "Drowsiness afterwards"], "physicalSigns": ["Fever source (ear, throat, chest)", "Neck stiffness or bulging fontanelle (meningitis)", "Focal deficit after seizure"], "redFlags": ["Age under 6 months (LP standard) (IAP)", "Meningeal signs, persistent drowsiness, petechial rash", "Seizure over 5 minutes: treat as status (IAP)", "Focal or repeated seizures (complex) (IAP)"], "precipitants": ["Viral infections", "Rapid rise in temperature", "Post-vaccination fever"]},
 differentials=[("Meningitis or encephalitis", "Neck stiffness, altered sensorium; CSF abnormal."), ("Rigors", "Shivering without loss of consciousness."), ("Febrile syncope", "Pallor and limpness without jerks."), ("Epilepsy triggered by fever", "Afebrile seizures as well."), ("Electrolyte disturbance", "Diarrhoea, abnormal sodium or calcium.")],
 criteria=[("Febrile seizure (IAP)", "Seizure with fever, age 6–60 months, no intracranial infection, metabolic cause or prior afebrile seizure."), ("Simple (IAP)", "Generalised, under 15 minutes, no recurrence in 24 hours."), ("Complex (IAP)", "Focal, 15–30 minutes, or recurrence within 24 hours."), ("Febrile status epilepticus (IAP)", "Over 30 minutes.")],
 ruleIn=[
  inv("specializedAdjunctive", "Clinical examination for fever source and meningism", "Bedside", "Cause of fever; meningitis", "Focus such as otitis; no meningism", "Neck stiffness, bulging fontanelle", "Every child (IAP).", "iapfs", "section Laboratory investigations"),
  inv("laboratory", "Cerebrospinal fluid examination", "Lumbar puncture", "Meningitis", "Cells under 5/mm³", "Pleocytosis, low glucose", "Under 6 months; 6–12 months if Hib or pneumococcal vaccination incomplete; meningeal signs; prior antibiotics (IAP).", "iapfs", "section Laboratory investigations"),
  inv("laboratory", "Blood glucose, electrolytes, calcium, blood count, urinalysis", "Blood and urine", "Metabolic cause; fever source", "Within reference range", "Hypoglycaemia, hyponatraemia, UTI", "Only if source unclear or diagnosis uncertain (IAP).", "iapfs", "section Laboratory investigations"),
  inv("specializedAdjunctive", "Electroencephalogram (EEG)", "EEG", "Epilepsy risk; non-convulsive status", "Normal", "Epileptiform activity", "Not for simple seizures; consider in recurrent complex seizures or developmental delay (IAP).", "iapfs", "section Laboratory investigations"),
  inv("advancedImaging", "Magnetic resonance imaging (MRI) brain", "MRI", "Structural lesion", "Normal", "Lesion", "Recurrent complex seizures with prolonged post-ictal deficit (IAP).", "iapfs", "section Laboratory investigations")],
 ruleOut=[inv("advancedImaging", "Computed tomography (CT) head", "CT", "Acute bleed or structural lesion", "Normal", "Bleed or mass", "Only if acute bleed or structural lesion suspected (IAP).", "iapfs", "section Laboratory investigations")],
 management=[
  step("during", "During the seizure", "Immediately", ["Protect airway; lateral position; prevent injury; IV access (IAP)."]),
  step("five", "Seizure over 5 minutes", "At 5 minutes", ["IV diazepam, lorazepam or midazolam; rectal diazepam or buccal or intranasal midazolam without IV access (IAP).", "Over 30 minutes: status epilepticus pathway (IAP)."]),
  step("admit", "Admit or discharge", "After seizure", ["Admit complex seizures, CNS infection signs, need for LP, or no reliable family support (IAP).", "First simple seizure over 18 months, stable, parents educated: home (IAP)."]),
  step("prevent", "Prevention", "Selected children", ["Antipyretics do not prevent recurrence; use for comfort (IAP).", "Intermittent clobazam for frequent or complex seizures or poor access to care (IAP).", "Continuous prophylaxis rarely (IAP)."]),
  step("counsel", "Counsel parents", "Before discharge", ["Benign nature, about 30% recurrence, low epilepsy risk; first aid; when to seek care (IAP)."])],
 branches=[("Seizure over 5 minutes", "Febrile seizure still going after 5 minutes."), ("Intermittent prophylaxis", "Frequent (3 in 6 months or 4 in a year) or complex seizures, poor access to care."), ("Continuous prophylaxis", "Failure of intermittent therapy, recurrent complex seizures or other listed indications.")],
 regimens=[
  rx("Seizure over 5 minutes", "Benzodiazepine", "Febrile seizure over 5 minutes", "Children 6–60 months", "Midazolam", "0.2 mg/kg", "IV, IM, buccal or intranasal", "Once; may repeat per status protocol", "Single dose", CH, NOT_ABX, "No adjustment for single dose.", "No adjustment for single dose.", ["Breathing, SpO2"], ["Respiratory depression"], "iapfs", TI, sel="one-of", pref=True),
  rx("Seizure over 5 minutes", "Benzodiazepine", "Febrile seizure over 5 minutes", "Children 6–60 months", "Diazepam", "0.3–0.5 mg/kg IV; rectal 0.5 mg/kg", "IV or rectal", "Once; may repeat per status protocol", "Single dose", CH, NOT_ABX, "No adjustment for single dose.", "No adjustment for single dose.", ["Breathing, SpO2"], ["Respiratory depression"], "iapfs", TI, sel="one-of", pref=False, use="Midazolam unavailable; rectal route at home."),
  rx("Seizure over 5 minutes", "Benzodiazepine", "Febrile seizure over 5 minutes", "Children 6–60 months", "Lorazepam", "0.1 mg/kg", "IV", "Once", "Single dose", CH, NOT_ABX, "No adjustment.", "No adjustment.", ["Breathing"], ["Respiratory depression"], "iapfs", TI, sel="one-of", pref=False, use="IV access and lorazepam available."),
  rx("Intermittent prophylaxis", "Benzodiazepine", "Frequent or complex febrile seizures", "Children 6–60 months", "Clobazam", "0.3 mg/kg", "Oral", "Every 12 hours from fever onset", "24 hours from fever onset", CH, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Sedation, ataxia"], ["Not for simple seizures with reliable parents (IAP)"], "iapfs", PR, sel="one-of", pref=True),
  rx("Intermittent prophylaxis", "Benzodiazepine", "Frequent or complex febrile seizures", "Children 6–60 months", "Diazepam (oral)", "0.33 mg/kg", "Oral", "Every 8 hours from fever onset", "24 hours from fever onset", CH, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Sedation, ataxia"], ["Respiratory disease"], "iapfs", PR, sel="one-of", pref=False, use="Clobazam unavailable."),
  rx("Continuous prophylaxis", "Antiseizure medicine", "Indications for continuous prophylaxis", "Children 6–60 months", "Sodium valproate", "20–30 mg/kg/day in 2–3 doses", "Oral", "2–3 times daily", "At least 2 years or until age 6", CH, NOT_ABX, "No adjustment.", "Avoid in liver disease (hepatotoxicity).", ["Liver function, platelets"], ["Children under 2 years with metabolic disease (hepatotoxicity risk)"], "iapfs", PR, sel="one-of", pref=True),
  rx("Continuous prophylaxis", "Antiseizure medicine", "Indications for continuous prophylaxis", "Children 6–60 months", "Phenobarbitone", "3–5 mg/kg/day in 1–2 doses", "Oral", "Once or twice daily", "At least 2 years or until age 6", CH, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Behaviour, attention, cognition"], ["Behavioural problems"], "iapfs", PR, sel="one-of", pref=False, use="Valproate unsuitable.")],
 medNote="All doses from the IAP Tamil Nadu COPP module on febrile seizures (2017). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Febrile seizures in Indian paediatric practice.", "learningObjectives": ["Classify simple and complex febrile seizures.", "Know when to do a lumbar puncture.", "Use prophylaxis selectively."],
  "keyPoints": ["Age 6–60 months, fever, no CNS infection.", "Treat seizures over 5 minutes with a benzodiazepine.", "Antipyretics do not prevent recurrence.", "Clobazam 0.3 mg/kg 12-hourly for 24 hours for selected children."],
  "pitfalls": ["Missing meningitis in infants.", "Routine EEG or CT after simple seizures.", "Continuous drugs for simple seizures.", "Frightened parents without counselling."],
  "references": [tref("iapfs", "sections Definitions, Investigations, Therapeutic interventions, Admission, Prophylactic AEDs, Antipyretics, Family education")]},
 nonClinical={"patientEducation": ["During a seizure: place on side, do not put anything in the mouth, time it.", "Call for help if over 5 minutes.", "Fever control is for comfort, not prevention."], "lifestyleAndDiet": ["Normal activities; complete immunisation."], "mdtReferrals": ["Paediatric neurology for complex or recurrent seizures"], "dischargeCriteria": ["Back to baseline, fever source treated, parents counselled (IAP)"], "followUpPlan": "Review with the family paediatrician; neurology follow-up if complex features (IAP)."})
CH = "This is the paediatric dose (IAP)."
T["evidenceAudit"]["unverifiedSections"] = [u for u in T["evidenceAudit"]["unverifiedSections"] if not u.startswith("Paracetamol dose")]
T["evidenceAudit"]["unverifiedSections"].insert(1, "Paracetamol for comfort is dosed from the Gloucestershire children's analgesia guideline because the IAP module gives no dose.")
T["evidenceAudit"]["findings"].insert(1, "Paracetamol 15 mg/kg (oral loading 20 mg/kg), maximum 90 mg/kg/day oral and 60 mg/kg/day IV (10–50 kg), checked against the Gloucestershire children's analgesia guideline (2020).")
T["pathophysiology"]["summary"] += " Recurrence occurs in about 30%, and is most likely when the first seizure happens before 1 year of age, with a short fever-to-seizure interval, at a low temperature, or with a family history."
T["presentation"]["symptoms"] += ["Fever for less than 24 hours before the seizure (a major recurrence risk factor) (IAP)", "Brief post-ictal sleepiness with return to normal within an hour"]
T["presentation"]["physicalSigns"] += ["Temperature at presentation (a lower temperature at seizure onset predicts recurrence) (IAP)", "Petechial or purpuric rash (meningococcal disease)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Meningitis or encephalitis", "Neck stiffness, bulging fontanelle, persistent drowsiness or prolonged post-ictal state; lumbar puncture and CSF analysis settle it (IAP)."),
 ("Rigors", "Shivering and chattering with preserved consciousness and no post-ictal phase; observation of the episode settles it."),
 ("Febrile syncope", "Pallor and limpness with brief jerks after standing or a vasovagal trigger, rapid recovery; history and normal examination settle it."),
 ("Epilepsy triggered by fever", "Previous afebrile seizures, focal features or developmental delay; EEG and neurology review settle it (IAP)."),
 ("Electrolyte disturbance or hypoglycaemia", "Diarrhoea, vomiting or poor intake with abnormal sodium, calcium or glucose; blood tests settle it (IAP)."),
 ("Dravet syndrome or other genetic epilepsy", "Prolonged, focal or very frequent febrile seizures starting before 1 year; neurology review and genetic testing settle it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "during":
        m["actions"] = ["Protect the airway; turn the child on the side with head extended; prevent injury (IAP).", "Time the seizure; secure IV access and check glucose if it continues (IAP)."]
    if m["id"] == "counsel":
        m["actions"] = ["Explain the benign nature, the about 30% recurrence risk and the low epilepsy risk (IAP).", "Teach first aid and when to give rescue medicine or seek care; explain that fever medicine is for comfort only (IAP)."]
T["clinicalManagement"].insert(3, step("fever", "Treat the fever source", "Same visit", ["Find and treat the cause of fever (otitis, pneumonia, urinary infection, viral illness).", "Paracetamol for comfort at 15 mg/kg; it does not prevent recurrence (IAP; Gloucestershire guideline)."]))
T["medicationPlan"]["branches"].append({"label": "Comfort during fever", "entryCriteria": "Febrile child who is uncomfortable."})
T["medicationPlan"]["regimens"].append(rx("Comfort during fever", "Antipyretic analgesic", "Discomfort from fever", "Children", "Paracetamol", "15 mg/kg (oral loading dose 20 mg/kg)", "Oral or IV", "Every 4–6 hours", "As needed", "Maximum 90 mg/kg/day oral or 60 mg/kg/day IV (10–50 kg), not above 4 g/day; under 3 months maximum 60 mg/kg/day (Gloucestershire guideline).", NOT_ABX, "No adjustment usually.", "Reduce in liver disease.", ["Total daily dose"], ["Severe liver disease"], "glosan", "section Paracetamol", extra_adj=("Antipyretics do not reduce seizure recurrence (IAP).",)))
T["teaching"]["learningObjectives"].append("Advise families on recurrence risk, first aid and the limited role of antipyretics.")
T["teaching"]["keyPoints"].append("About 30% recur; simple febrile seizures carry about a 1% epilepsy risk (IAP).")
T["teaching"]["references"].append(tref("glosan", "section Paracetamol"))

ALG = algo("febrile-seizure-pathway", "Child with a fever and a seizure", "manage", "iapfs", "sections Therapeutic interventions, Laboratory investigations, Hospital admission, Prophylactic AEDs", [
 node("start", "start", "Child 6–60 months with fever and a seizure", [("ongoing", None)], "Protect the airway, side position, time the seizure."),
 node("ongoing", "decision", "Seizure lasting more than 5 minutes?", [("benzo", "Yes"), ("stopped", "No")]),
 node("benzo", "action", "Midazolam 0.2 mg/kg, or diazepam IV 0.3–0.5 mg/kg or rectal 0.5 mg/kg, or lorazepam 0.1 mg/kg", [("status", None)]),
 node("status", "outcome", "Still seizing at 30 minutes: status epilepticus pathway (Status epilepticus in children topic)", None),
 node("stopped", "decision", "Signs of meningitis, under 6 months, or 6–12 months with incomplete Hib or pneumococcal vaccines?", [("lp", "Yes"), ("type", "No")]),
 node("lp", "outcome", "Admit; lumbar puncture and treat as possible meningitis", None),
 node("type", "decision", "Simple febrile seizure? (generalised, under 15 minutes, no recurrence in 24 hours)", [("simple", "Yes"), ("complex", "No")]),
 node("simple", "decision", "Over 18 months, stable, reliable family?", [("home", "Yes"), ("obs", "No")]),
 node("home", "outcome", "Treat fever source; counsel; home with first-aid advice", None),
 node("obs", "outcome", "Admit for observation; treat fever source; counsel", None),
 node("complex", "outcome", "Admit; investigate as indicated; consider intermittent clobazam; neurology if recurrent", None)])

VIG = "Ananya, a 20-month-old girl from Lucknow, is brought to the emergency department after a 3-minute generalised jerking episode at home with a temperature of 39.4°C. She had a runny nose and cough for a day. On arrival she is drowsy but rousable, and 40 minutes later she is playing. She has completed all scheduled vaccines. Her father had febrile seizures as a child. Her mother asks whether this is epilepsy and whether to give fever medicine every few hours to stop another one."

EXP = [
 explain("pathophysiology", "Why young children have febrile seizures", "What makes a 6–60 month old prone to seizures with fever?",
  "The developing brain has a lower seizure threshold, and a rapid rise in temperature during a viral illness can trigger a generalised seizure in a child who is genetically predisposed — a family history in a first-degree relative is one of the strongest risk factors. Febrile seizures are a marker of this age-limited susceptibility; they do not damage the brain and do not cause epilepsy. That is why antiseizure drugs, although they reduce recurrence, do not change the long-term outlook. The real clinical danger lies not in the seizure but in what may be causing the fever: bacterial meningitis can present with a seizure, especially in infants whose signs are subtle and in children who are not fully immunised."),
 explain("signs-symptoms", "Simple versus complex, and the meningitis question", "Which features change your management?",
  "A simple febrile seizure is generalised, lasts under 15 minutes and does not recur within 24 hours; about 70–75% are simple. A complex seizure is focal, lasts 15–30 minutes or recurs within 24 hours; beyond 30 minutes it is febrile status epilepticus. The examination after the seizure focuses on the fever source and on signs of central nervous system infection: neck stiffness, a bulging fontanelle, a petechial rash, persistent drowsiness or a post-ictal deficit. Recurrence risk rises with age under 1 year at the first seizure, fever of less than 24 hours, a lower temperature at onset and a first-degree family history; with none of these the risk is under 15%, and with three or more it exceeds 60%."),
 explain("investigations", "Less is more", "Which tests are needed after a febrile seizure?",
  "For most children, the only investigation needed is to find the source of fever. Lumbar puncture is standard under 6 months, should be considered at 6–12 months when Hib or pneumococcal vaccination is incomplete or unknown, and is indicated at any age with meningeal signs or when antibiotics have already been given and could mask meningitis. Blood tests (count, culture, glucose, electrolytes, calcium) and urinalysis are for when the fever source is unclear or the diagnosis uncertain. EEG has little value after a simple or first complex seizure, and neuroimaging is not routine; MRI is reserved for recurrent complex seizures with a prolonged post-ictal deficit, and CT only for suspected bleeding or a structural lesion."),
 explain("management", "Rescue, reassurance and selective prophylaxis", "When do children need drugs?",
  "A seizure lasting more than 5 minutes is treated with a benzodiazepine: midazolam 0.2 mg/kg, IV diazepam 0.3–0.5 mg/kg or lorazepam 0.1 mg/kg, or rectal diazepam 0.5 mg/kg when there is no IV access. Most children need no regular medicine. Antipyretics such as paracetamol make the child comfortable but do not prevent recurrence, so parents should not wake a child to give them. Intermittent oral clobazam 0.3 mg/kg every 12 hours for 24 hours from the start of a fever is reserved for frequent or complex seizures or families far from care. Continuous valproate or phenobarbitone is rarely needed. The most important intervention is calm, clear counselling: what to do during a seizure, when to call for help, and that the outlook is excellent.")]

QS = [
 bq("q1", "A 20-month-old girl had a 3-minute generalised seizure with a temperature of 39.4°C and coryza. She is fully immunised, and 40 minutes later she is alert and playing with a normal examination apart from a red throat. Her father had febrile seizures. The family lives 2 km from the hospital.", "What is the most appropriate management?",
  [("Lumbar puncture before discharge", "Lumbar puncture is not needed in a fully immunised child over 12 months who has returned to normal with no meningeal signs (IAP)."),
   ("EEG and MRI brain as an outpatient", "Routine EEG and imaging have no value after a simple febrile seizure (IAP)."),
   ("Start daily sodium valproate", "Continuous prophylaxis is not indicated for a simple febrile seizure (IAP)."),
   ("Treat the fever source, counsel the parents and discharge with first-aid advice", "Correct. A first simple febrile seizure over 18 months in a stable child with a reliable family does not need admission (IAP)."),
   ("Paracetamol every 4 hours around the clock to prevent recurrence", "Antipyretics do not reduce recurrence (IAP); they are for comfort only.")],
  "D", "Manage a first simple febrile seizure without unnecessary tests or drugs.", "Simple febrile seizure, normal child, reliable family: treat the cause, counsel, discharge."),
 bq("q2", "A 9-month-old boy has a 6-minute generalised seizure with fever of 38.8°C. He has received only his birth vaccines. After the seizure he remains irritable and drowsy for 2 hours, and the anterior fontanelle feels full. Glucose is 92 mg/dL.", "What is the most important next step?",
  [("Reassure and discharge after the fever settles", "Persistent drowsiness, a full fontanelle and incomplete immunisation make meningitis likely."),
   ("Admit, perform a lumbar puncture and treat for possible meningitis", "Correct. Under 12 months with incomplete Hib and pneumococcal vaccination and signs of meningitis, lumbar puncture is indicated (IAP)."),
   ("Start intermittent clobazam", "Prophylaxis does not address the possibility of bacterial meningitis."),
   ("Order an EEG", "EEG does not diagnose meningitis and is not urgent here."),
   ("Give rectal diazepam to take home", "The priority is diagnosis of a possible central nervous system infection.")],
  "B", "Recognise when a febrile seizure may be meningitis.", "Under 12 months, incompletely immunised or meningeal signs: lumbar puncture."),
 bq("q3", "A 3-year-old boy has had four febrile seizures in the past 8 months, two of them lasting about 20 minutes. Development and neurological examination are normal and there have been no afebrile seizures. The family lives 3 hours from the nearest hospital, recognise fever easily, and are very anxious about the next episode.", "Which approach is most appropriate?",
  [("Continuous phenobarbitone 3–5 mg/kg/day until age 6", "Continuous drugs carry behavioural and cognitive side effects; intermittent prophylaxis is tried first (IAP)."),
   ("No treatment and reassurance only", "Frequent and prolonged seizures with poor access to care are indications for prophylaxis (IAP)."),
   ("Oral clobazam 0.3 mg/kg every 12 hours for 24 hours from the start of each fever, with rescue medicine at home", "Correct. Intermittent clobazam is preferred for frequent or complex febrile seizures and poor access to care (IAP)."),
   ("Paracetamol at the first sign of fever", "Paracetamol eases discomfort, but antipyretics do not prevent recurrence (IAP)."),
   ("Carbamazepine daily", "Carbamazepine and phenytoin are not effective for febrile seizures (IAP).")],
  "C", "Choose prophylaxis for frequent or complex febrile seizures.", "Intermittent clobazam during fevers; continuous drugs only when intermittent therapy fails.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [("Buccal or intranasal midazolam dose and maximum benzodiazepine doses are taken from the IAP Standard Treatment Guidelines on status epilepticus (2022), because the COPP module names these routes without a dose." if u.startswith("Buccal or intranasal") else u) for u in EA["unverifiedSections"]]
P = T["medicationPlan"]; R = P["regimens"]
P["note"] = P["note"].replace("All doses from the IAP Tamil Nadu COPP module on febrile seizures (2017).", "Doses from the IAP Tamil Nadu COPP module on febrile seizures (2017); buccal or intranasal midazolam and maximum doses from the IAP status epilepticus guideline (2022); paracetamol from the Gloucestershire guideline.")
P["branches"][1]["entryCriteria"] = "Frequent seizures (3 or more in 6 months or 4 or more in a year), previous complex seizure, poor access to care, or febrile seizures with risk factors (IAP)."
for r in R:
    n = r["genericName"]
    if n == "Midazolam":
        r["dose"] = "0.2 mg/kg (maximum 5 mg)"
        r["route"] = "IV (IM if no access)"
        r["frequency"] = "Once; repeat once after 5–10 minutes if still seizing"
        r["adjustments"][0] = "Paediatric: This is the paediatric dose (IAP COPP); maximum 5 mg per dose (IAP STG 2022)."
    if n == "Diazepam":
        r["dose"] = "IV 0.3–0.5 mg/kg (maximum 10 mg); rectal 0.5 mg/kg"
        r["frequency"] = "Once; repeat once after 5–10 minutes if still seizing"
        r["adjustments"][0] = "Paediatric: This is the paediatric dose (IAP COPP); IV maximum 10 mg per dose (IAP STG 2022)."
    if n == "Lorazepam":
        r["dose"] = "0.1 mg/kg (maximum 4 mg)"
        r["frequency"] = "Once; repeat once after 5–10 minutes if still seizing"
        r["adjustments"][0] = "Paediatric: This is the paediatric dose (IAP COPP); maximum 4 mg per dose (IAP STG 2022)."
    if n == "Diazepam (oral)":
        r["contraindications"] = ["Respiratory depression (general pharmacology)"]
    if n == "Sodium valproate":
        r["duration"] = "At least 2 years or until age 6, whichever is earlier (IAP)"
        r["contraindications"] = ["Suspected metabolic or mitochondrial disease, especially under 2 years (hepatotoxicity; general pharmacology)"]
    if n == "Phenobarbitone":
        r["duration"] = "At least 2 years or until age 6, whichever is earlier (IAP)"
    if n == "Paracetamol":
        r["dose"] = "Oral 15 mg/kg (oral loading dose 20 mg/kg); IV 10 mg/kg up to 10 kg, 15 mg/kg from 10–50 kg"
        r["adjustments"][0] = "Paediatric: Maximum oral 90 mg/kg/day; IV up to 10 kg maximum 30 mg/kg/day, 10–50 kg maximum 60 mg/kg/day; not above 4 g/day; under 3 months oral maximum 60 mg/kg/day (Gloucestershire guideline)."
R.insert(1, rx("Seizure over 5 minutes", "Benzodiazepine", "Febrile seizure over 5 minutes without IV access", "Children", "Midazolam (buccal, intranasal)", "0.1–0.2 mg/kg (nasal spray 2 puffs per 5 kg)", "Buccal or intranasal", "Once; may repeat once", "Single dose",
  "This is the paediatric dose (IAP STG 2022).", NOT_ABX, "No adjustment for a single dose.", "No adjustment for a single dose.", ["Breathing, oxygen saturation"], ["Respiratory depression"], "iapse", "section Prehospital management", sel="one-of", pref=False, use="No IV access, including at home."))
R.insert(6, rx("Intermittent prophylaxis", "Benzodiazepine", "Indications for intermittent prophylaxis", "Children", "Diazepam (rectal)", "0.4 mg/kg/dose", "Rectal", "At fever onset; repeat once if fever persists beyond 8 hours", "Up to 24 hours from fever onset",
  "This is the paediatric dose (IAP).", NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Sedation, breathing"], ["Respiratory depression (general pharmacology)"], "iapfs", "section Prophylactic AEDs", sel="one-of", pref=False, use="Oral medicine not possible."))
for m in T["clinicalManagement"]:
    if m["id"] == "five":
        m["actions"] = ["IV midazolam 0.2 mg/kg (maximum 5 mg), diazepam 0.3–0.5 mg/kg (maximum 10 mg) or lorazepam 0.1 mg/kg (maximum 4 mg); without IV access, rectal diazepam 0.5 mg/kg or buccal or intranasal midazolam 0.1–0.2 mg/kg (IAP; IAP STG 2022).",
                        "Still seizing 5–10 minutes after the first dose: repeat once, then second-line drugs on the status epilepticus pathway (IAP STG 2022; see Status epilepticus in children)."]
    if m["id"] == "admit":
        m["actions"] = ["Admit complex seizures and any child with signs of CNS infection or needing a lumbar puncture (IAP).", "First simple seizure over 18 months, stable, parents educated: home; IAP lists lack of reliable family support as a possible reason to admit (IAP)."]
    if m["id"] == "prevent":
        m["actions"][1] = "Intermittent clobazam (or oral or rectal diazepam) for frequent seizures, a previous complex seizure, poor access to care or seizures with risk factors (IAP)."
A = T["algorithms"][0]
nodes = {n["id"]: n for n in A["nodes"]}
nodes["benzo"]["text"] = "Midazolam 0.2 mg/kg IV (maximum 5 mg) or buccal/intranasal 0.1–0.2 mg/kg, or diazepam IV 0.3–0.5 mg/kg (maximum 10 mg) or rectal 0.5 mg/kg, or lorazepam 0.1 mg/kg (maximum 4 mg)"
nodes["benzo"]["next"] = [{"to": "resp"}]
nodes["status"]["text"] = "Repeat the benzodiazepine once; then second-line drugs on the status epilepticus pathway (Status epilepticus in children topic)"
nodes["obs"]["text"] = "Under 18 months or family support uncertain: observe; admit if CNS infection is suspected; treat fever source; counsel"
i = [n["id"] for n in A["nodes"]].index("benzo") + 1
A["nodes"][i:i] = [
 {"id": "resp", "kind": "decision", "text": "Seizure stopped within 5–10 minutes of the first dose?", "next": [{"to": "postb", "label": "Yes"}, {"to": "status", "label": "No"}]},
 {"id": "postb", "kind": "outcome", "text": "Admit (prolonged seizure); look for meningitis and need for lumbar puncture; treat fever source"}]
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q3":
        q["vignette"] = "A 3-year-old boy has had three febrile seizures in the past 5 months, each generalised and lasting 2–4 minutes. Development and neurological examination are normal, there is no family history of epilepsy and there have been no afebrile seizures. The family lives 3 hours from the nearest hospital, recognise fever easily, and are very anxious about the next episode."
        for o in q["options"]:
            if o["id"] == "B": o["explanation"] = "Frequent seizures (3 or more in 6 months) with poor access to care are indications for intermittent prophylaxis (IAP)."
            if o["id"] == "C": o["explanation"] = "Correct. Intermittent clobazam is used for frequent febrile seizures and poor access to care (IAP)."
            if o["id"] == "A": o["explanation"] = "Continuous drugs carry behavioural and cognitive side effects and are kept for failed intermittent therapy or recurrent complex seizures (IAP)."
        q["educationalObjective"] = "Choose prophylaxis for frequent febrile seizures."
T["teaching"]["references"].append(tref("iapse", "section Prehospital management, First-line (benzodiazepines)"))

save("t73_febrile_seizures.json", [T])
