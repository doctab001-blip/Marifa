from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Dengue in children (India)"
F = "section Fluid management"; P = "section Indications for platelet transfusion and packed red cells"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Infectious Diseases / Paediatric Critical Care", authority="ICMR", pillar="Urgent Care",
 scope="Dengue in children in India: case categories, warning signs, outpatient care, weight-based fluid resuscitation for warning signs and shock, haematocrit-guided decisions, blood product thresholds and discharge, built on the ICMR Dengue Fever STW (October 2019) with paracetamol dosing from the ICMR Fever in Children STW. The adult Dengue (India adaptation) topic covers adults.",
 findings=["Case categories, warning signs, investigations, outpatient care (paracetamol, avoid NSAIDs, daily PCV and platelets), crystalloid bolus 20 mL/kg over 15 minutes in shock, 10 mL/kg/hour for warning signs, the stepwise taper (10, 7, 5, 3 mL/kg/hour) stopping at 48 hours, platelet transfusion below 10,000/cumm or with bleeding, red cell and FFP indications and discharge criteria checked against the ICMR Dengue STW (October 2019).", "Paracetamol 15 mg/kg from the ICMR Fever in Children STW.", "Not clinically reviewed."],
 unverified=["The ICMR Dengue STW is not child-specific; the mL/kg regimens are used for children as written.", "Paracetamol interval and daily maximum are not given in the ICMR workflows (usual practice 4–6-hourly, no more than 60 mg/kg/day).", "The ICMR flowchart lists some rate ranges without clear sequence; the main sequence is shown."],
 summary="Dengue is a mosquito-borne flavivirus infection with yearly epidemics across India. Most children have a febrile phase of 2–7 days with fever, myalgia, rash and headache. Around defervescence, a critical phase of increased capillary permeability can cause plasma leakage, rising haematocrit, pleural effusion, ascites and shock, sometimes with bleeding and organ involvement. Warning signs (abdominal pain, persistent vomiting, fluid accumulation, mucosal bleeding, liver enlargement over 2 cm) identify children who need hospital care (ICMR STW). Careful, haematocrit-guided fluid therapy prevents both shock and fluid overload; platelet transfusion is rarely needed.",
 mechanisms=["Viral infection and immune activation increase vascular permeability.", "Plasma leakage causes haemoconcentration, effusions and hypovolaemic shock.", "Thrombocytopenia and coagulopathy cause bleeding.", "Reabsorption of leaked fluid in recovery risks fluid overload."],
 presentation={"symptoms": ["High fever 2–7 days", "Headache, retro-orbital pain, myalgia, arthralgia, rash (ICMR STW)", "Nausea, vomiting (ICMR STW)", "Abdominal pain (warning sign)"], "physicalSigns": ["Positive tourniquet test", "Liver enlargement over 2 cm (warning sign) (ICMR STW)", "Pleural effusion, ascites (ICMR STW)", "Weak rapid pulse, pulse pressure under 20 mmHg, cold clammy skin (shock) (ICMR STW)"], "redFlags": ["Any warning sign: admit (ICMR STW)", "Shock: weak rapid pulse, narrow pulse pressure, hypotension (ICMR STW)", "Severe bleeding (ICMR STW)", "Respiratory distress from fluid accumulation, impaired consciousness (ICMR STW)"], "precipitants": ["Monsoon and post-monsoon season", "Aedes breeding in stored water", "Secondary infection with a different serotype"]},
 differentials=[("Malaria", "Smear or RDT positive."), ("Chikungunya", "Prominent arthritis, less thrombocytopenia."), ("Scrub typhus", "Eschar, lymphadenopathy; IgM positive."), ("Enteric fever", "Gradual fever, relative bradycardia; blood culture.")],
 criteria=[("Dengue without warning signs (ICMR STW)", "Fever plus two of: nausea or vomiting, rash, myalgia, headache, retro-orbital pain, arthralgia, haemorrhagic manifestations, in an endemic area."), ("Dengue with warning signs (ICMR STW)", "Abdominal pain, persistent vomiting, fluid accumulation, mucosal bleeding, liver over 2 cm, or features of shock."), ("Severe dengue (ICMR STW)", "Fluid accumulation with respiratory distress, severe bleeding or impaired consciousness.")],
 ruleIn=[
  inv("laboratory", "NS1 antigen and dengue IgM", "ELISA", "Dengue", "Negative", "NS1 positive (days 1–5) or IgM positive (after day 5)", "Confirms dengue (ICMR STW).", "deng", "section Investigations"),
  inv("laboratory", "Haematocrit (PCV)", "Blood", "Plasma leakage", "Age-appropriate baseline (about 33–42% in children)", "Rising PCV", "Rising PCV guides more fluid; falling PCV with instability suggests bleeding (ICMR STW).", "deng", F),
  inv("laboratory", "Platelet count", "Blood count", "Thrombocytopenia", "150,000–450,000/cumm", "Falling; below 10,000/cumm", "Prophylactic platelets only below 10,000/cumm (ICMR STW).", "deng", P),
  inv("firstLineImaging", "Chest X-ray and abdominal ultrasound", "Imaging", "Fluid accumulation", "No effusion or ascites", "Pleural effusion, ascites, gallbladder wall oedema", "Evidence of plasma leakage (ICMR STW).", "deng", "section Investigations"),
  inv("laboratory", "Liver and kidney function, albumin", "Blood", "Organ involvement", "ALT below 40 U/L; creatinine normal for age", "Raised ALT; low albumin", "Severe dengue organ involvement (ICMR STW).", "deng", "section Investigations"),
  inv("specializedAdjunctive", "Hourly heart rate, BP, respiratory rate, urine output", "Bedside monitoring", "Shock and fluid response", "Normal for age; urine over 1 mL/kg/hour", "Tachycardia, narrow pulse pressure, low urine output", "Reassess hourly during resuscitation (ICMR STW).", "deng", F)],
 ruleOut=[inv("laboratory", "Malaria smear or RDT", "Blood", "Malaria", "Negative", "Positive", "Co-infection or alternative diagnosis.", "fevc", "section Fever without focus")],
 management=[
  step("opd", "No warning signs", "Daily review", ["Paracetamol for fever; avoid NSAIDs (ICMR STW).", "Oral fluids; daily clinical review with PCV and platelets (ICMR STW).", "Admit if any warning sign appears."]),
  step("warning", "Warning signs", "Hospital", ["Ringer's lactate or normal saline 10 mL/kg/hour (ICMR STW).", "Reassess at 1–2 hours with PCV; if improving taper 10, 7, 5 and 3 mL/kg/hour; stop by 48 hours (ICMR STW)."]),
  step("shock", "Shock", "Immediately", ["Crystalloid or colloid 20 mL/kg over 15 minutes (ICMR STW).", "Reassess HR, RR, BP, PCV hourly; if PCV rising give further fluid or colloid 10–20 mL/kg; if PCV falling with instability suspect bleeding and transfuse (ICMR STW).", "Look for and treat anaemia, acidosis and myocardial dysfunction (ICMR STW)."]),
  step("blood", "Blood products", "As indicated", ["Platelets below 10,000/cumm or prolonged shock or massive bleeding (ICMR STW).", "Packed cells for overt blood loss of 10% or more of blood volume or refractory shock (ICMR STW).", "FFP or cryoprecipitate for coagulopathy with bleeding (ICMR STW)."]),
  step("discharge", "Discharge", "When criteria met", ["No fever for 48 hours, rising platelets, stable PCV without IV fluids, observed 24 hours after stopping fluids (ICMR STW)."])],
 branches=[("Fever relief", "Any child with dengue fever."), ("Warning signs", "Dengue with warning signs, not in shock."), ("Dengue shock", "Compensated or hypotensive shock."), ("Blood products", "Severe thrombocytopenia, bleeding or coagulopathy.")],
 regimens=[
  rx("Fever relief", "Antipyretic", "Fever", "Children", "Paracetamol", "15 mg/kg per dose", "Oral", "Every 4–6 hours as needed", "During fever", "This is the paediatric dose (ICMR Fever in Children STW).", NOT_ABX, "No adjustment.", "Avoid high doses if liver involvement.", ["Temperature", "Liver tests in severe dengue"], ["Do not use NSAIDs or aspirin in dengue (ICMR STW)"], "fevc", "section Antipyretic dosing"),
  rx("Warning signs", "IV fluid", "Dengue with warning signs", "Children", "Ringer lactate", "10 mL/kg/hour, then taper to 7, 5 and 3 mL/kg/hour as PCV and vitals improve", "IV", "Continuous", "Stop by 48 hours", "This is the paediatric regimen (ICMR STW, mL/kg).", NOT_ABX, "Reassess often in kidney injury.", "Use with caution in severe liver involvement.", ["PCV, vitals hourly", "Urine output"], ["Fluid overload: respiratory distress"], "deng", F),
  rx("Dengue shock", "Fluid bolus", "Dengue shock", "Children", "Crystalloid (Ringer lactate)", "20 mL/kg over 15 minutes, repeat by PCV and vitals", "IV", "Bolus", "Until shock reverses, then taper", "This is the paediatric regimen (ICMR STW, mL/kg).", NOT_ABX, "Reassess after each bolus.", "Reassess after each bolus.", ["HR, BP, PCV hourly", "Signs of overload"], ["Fluid overload"], "deng", F, sel="one-of", pref=True),
  rx("Dengue shock", "Fluid bolus", "Dengue shock with rising PCV despite crystalloid", "Children", "Colloid", "10–20 mL/kg", "IV", "Bolus", "As needed", "This is the paediatric regimen (ICMR STW, mL/kg).", NOT_ABX, "Caution in kidney injury.", "No adjustment.", ["PCV, vitals"], ["Fluid overload"], "deng", F, sel="one-of", pref=False, use="Shock persists with rising PCV after crystalloid (ICMR STW)."),
  rx("Blood products", "Platelets", "Platelets below 10,000/cumm, prolonged shock or massive bleeding", "Children", "Platelet concentrate", "Dose per blood bank (1 unit per 10 kg typical)", "IV", "As indicated", "Single transfusion, reassess", "Weight-based; 1 unit per 10 kg (NIB guidance).", NOT_ABX, "No adjustment.", "No adjustment.", ["Platelet count, bleeding"], ["Do not transfuse for count alone above 10,000/cumm without bleeding (ICMR STW)"], "deng", P, extra_adj=("1 unit per 10 kg from NIB Good Blood Transfusion Practices.",)),
  rx("Blood products", "Red cells", "Overt blood loss of 10% or more of blood volume or refractory shock", "Children", "Packed red cells", "10 mL/kg", "IV", "As indicated", "Reassess PCV", "Paediatric volume is usual practice.", NOT_ABX, "Watch for fluid overload.", "No adjustment.", ["PCV, vitals"], ["Fluid overload"], "deng", P)],
 medNote="Fluid regimens and transfusion thresholds from the ICMR Dengue STW (2019); paracetamol from the ICMR Fever in Children STW. Avoid NSAIDs, aspirin and IM injections. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Dengue in Indian children.", "learningObjectives": ["Recognise warning signs.", "Give haematocrit-guided fluids.", "Use blood products sparingly."],
  "keyPoints": ["Warning signs: abdominal pain, vomiting, fluid accumulation, mucosal bleeding, liver over 2 cm.", "Shock: 20 mL/kg over 15 minutes, then reassess with PCV.", "Taper 10, 7, 5, 3 mL/kg/hour; stop by 48 hours.", "Platelets only below 10,000/cumm or bleeding."],
  "pitfalls": ["NSAIDs for fever.", "Prophylactic platelets for moderate thrombocytopenia.", "Continuing IV fluids into recovery (overload).", "Missing concealed bleeding when PCV falls."],
  "references": [tref("deng", "sections Symptoms, Warning signs, Investigations, Fluid management, Indications for platelet transfusion and packed red cells, Discharge criteria"), tref("fevc", "section Antipyretic dosing"), tref("nib", "section 4 (platelets)")]},
 nonClinical={"patientEducation": ["Return at once for abdominal pain, vomiting, bleeding, drowsiness or cold hands.", "Plenty of oral fluids.", "No painkillers other than paracetamol."], "lifestyleAndDiet": ["Remove stored water; use nets and repellents."], "mdtReferrals": ["Higher centre or PICU for severe dengue", "District surveillance (IDSP) notification"], "dischargeCriteria": ["No fever for 48 hours (ICMR STW)", "Rising platelets, stable PCV without IV fluids (ICMR STW)", "Good appetite and urine output, no respiratory distress (ICMR STW)"], "followUpPlan": "Daily review in the febrile and critical phases; review after discharge if symptoms recur."})
# Depth standard (2026-10-25)
T["lastReviewed"] = "2026-10-25"
T["pathophysiology"]["summary"] += " The danger window is the 24–48 hours around defervescence: a child whose fever settles may look better while plasma leaks silently, so a falling temperature is a reason to look harder, not to discharge. Infants, obese children and those with secondary infection are at higher risk of severe dengue."
T["presentation"]["symptoms"].append("Restlessness, lethargy or reduced urine output (impending shock)")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Malaria", "Fever with chills, pallor and splenomegaly in an endemic area; a positive smear or rapid diagnostic test settles it."),
 ("Chikungunya", "Prominent, often disabling polyarthritis with less thrombocytopenia and no plasma leak; chikungunya IgM or PCR settles it."),
 ("Scrub typhus", "Eschar, lymphadenopathy and raised transaminases in the monsoon; scrub typhus IgM ELISA settles it."),
 ("Enteric fever", "Gradually rising fever over a week, abdominal pain and relative bradycardia; blood culture settles it."),
 ("Leptospirosis", "Exposure to flood water, calf pain, conjunctival suffusion, jaundice and kidney injury; leptospira IgM settles it."),
 ("Bacterial sepsis with shock", "Toxic child with a focus, high white count and early shock without haemoconcentration; blood culture and procalcitonin help settle it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "discharge":
        m["actions"] = ["No fever for 48 hours, rising platelets, stable PCV without IV fluids, observed 24 hours after stopping fluids (ICMR STW).",
                        "Explain warning signs to parents and the need to return at once if abdominal pain, vomiting, bleeding or lethargy appears (ICMR STW)."]

ALG = algo("dengue-pathway", "Child with suspected dengue: fluid decisions", "manage", "deng", "sections Warning signs, Fluid management", [
 node("start", "start", "Child with fever 2–7 days and suspected dengue", [("shock", None)]),
 node("shock", "decision", "Shock: weak rapid pulse, pulse pressure under 20 mmHg, cold clammy skin or hypotension?", [("bolus", "Yes"), ("warn", "No")]),
 node("bolus", "action", "Crystalloid 20 mL/kg over 15 minutes; check PCV before and after", [("better", None)]),
 node("better", "decision", "Improving after the bolus?", [("taper", "Yes"), ("pcv", "No")]),
 node("taper", "outcome", "Reduce to 10 mL/kg/hour, then 7, 5, 3 mL/kg/hour as vitals and PCV improve; stop by 48 hours"),
 node("pcv", "decision", "PCV rising or still high?", [("colloid", "Yes"), ("bleed", "No (falling)")]),
 node("colloid", "outcome", "Repeat crystalloid or colloid 10–20 mL/kg; correct acidosis, calcium, glucose; consider inotropes"),
 node("bleed", "outcome", "Suspect concealed bleeding: packed red cells 10 mL/kg; blood products if coagulopathy"),
 node("warn", "decision", "Any warning sign (abdominal pain, persistent vomiting, fluid accumulation, mucosal bleeding, liver over 2 cm)?", [("adm", "Yes"), ("home", "No")]),
 node("adm", "outcome", "Admit: Ringer lactate 10 mL/kg/hour, reassess at 1–2 hours with PCV, then taper"),
 node("home", "outcome", "Oral fluids, paracetamol, no NSAIDs; daily review with PCV and platelets; return if warning signs")])

VIG = "Riya, a 9-year-old girl from Delhi weighing 28 kg, is brought in October on day 5 of illness. Her fever settled this morning, but she now has abdominal pain, has vomited four times and is lethargic. Pulse is 128/min, BP 100/86 mmHg, capillary refill 3 seconds and the liver is palpable 3 cm below the costal margin. Haematocrit is 46% (it was 38% two days ago) and platelets are 38,000/cumm."

EXP = [
 explain("pathophysiology", "Leak, not bleeding, is the main problem", "Why do children with dengue go into shock as the fever settles?",
  "Dengue virus infects monocytes and endothelium, and the host immune response — stronger in secondary infection with a different serotype — releases cytokines that make capillaries leaky. During the critical phase around defervescence plasma leaks into the pleural and peritoneal spaces, the haematocrit rises and circulating volume falls. Children compensate with tachycardia and vasoconstriction, so the pulse pressure narrows before the BP falls; hypotension is a late sign. Thrombocytopenia is common but bleeding is usually minor unless shock is prolonged, when acidosis and coagulopathy develop. After 24–48 hours the leak stops and fluid is reabsorbed, so continuing IV fluids causes overload."),
 explain("signs-symptoms", "Warning signs and early shock", "Which findings change management?",
  "Classify each child. Dengue without warning signs can be managed at home with daily review. Warning signs — abdominal pain or tenderness, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy or restlessness, liver enlargement over 2 cm, and a rising haematocrit with falling platelets — mean admission. Look for compensated shock: tachycardia, cool peripheries, capillary refill over 2 seconds and a pulse pressure under 20 mmHg, even with a normal systolic BP. Severe dengue includes shock or respiratory distress from fluid accumulation, severe bleeding and organ impairment such as hepatitis, encephalopathy or myocarditis."),
 explain("investigations", "Use the haematocrit to steer fluids", "What do the tests tell you?",
  "NS1 antigen confirms dengue in the first 5 days and IgM after day 5, but treatment does not wait for confirmation. A baseline haematocrit taken early in the illness is the reference point: a rise of 20% or more indicates plasma leak, while a falling haematocrit in an unstable child suggests concealed bleeding. Check haematocrit before and after each fluid bolus and every few hours during resuscitation. Platelets guide transfusion only when below 10,000/cumm or with bleeding. Chest X-ray and ultrasound show effusions and gallbladder wall oedema; liver and kidney function and albumin show organ involvement. Always test for malaria and other co-infections."),
 explain("management", "Fluid that is enough, but not too much", "How do you give fluids in dengue with warning signs and shock?",
  "For warning signs without shock give Ringer lactate or saline 10 mL/kg/hour, reassess at 1–2 hours with the haematocrit and, if improving, taper to 7, 5 and 3 mL/kg/hour, stopping by 48 hours. For shock give 20 mL/kg crystalloid over 15 minutes, then reassess heart rate, BP, perfusion and haematocrit; if the haematocrit is still high, repeat crystalloid or colloid 10–20 mL/kg; if it falls while the child is unstable, suspect bleeding and give packed red cells 10 mL/kg. Use paracetamol 15 mg/kg for fever and avoid NSAIDs, aspirin and IM injections. Give platelets only below 10,000/cumm, in prolonged shock or with massive bleeding.")]

QS = [
 bq("q1", "A 9-year-old girl on day 5 of dengue has abdominal pain, repeated vomiting and lethargy. Her fever settled this morning. Pulse 128/min, BP 100/86 mmHg, capillary refill 3 seconds. Haematocrit has risen from 38% to 46% and platelets are 38,000/cumm.", "What is the best immediate management?",
  [("Platelet transfusion", "Platelets are given only below 10,000/cumm, in prolonged shock or with major bleeding (ICMR STW)."),
   ("Oral fluids and discharge as fever has settled", "The narrow pulse pressure and rising haematocrit show compensated shock in the critical phase."),
   ("Crystalloid 20 mL/kg over 15 minutes, then reassess with haematocrit", "Correct. A pulse pressure under 20 mmHg with poor perfusion is shock; give a 20 mL/kg bolus and reassess (ICMR STW)."),
   ("Ibuprofen for abdominal pain", "NSAIDs are avoided in dengue because of bleeding and kidney risk (ICMR STW)."),
   ("Ringer lactate 3 mL/kg/hour", "This is a tapering rate, far too little for shock.")],
  "C", "Recognise compensated dengue shock.", "Narrow pulse pressure is shock even with a normal systolic BP."),
 bq("q2", "A 7-year-old boy with dengue shock received two crystalloid boluses of 20 mL/kg. He remains tachycardic with cold peripheries. His haematocrit has fallen from 48% to 36% and he has had a dark, tarry stool in the last hour with little urine since. Platelets are 22,000/cumm.", "What is the most likely problem and next step?",
  [("Ongoing plasma leak; give colloid 20 mL/kg", "A falling haematocrit in an unstable child points to bleeding, not leak."),
   ("Concealed bleeding; transfuse packed red cells 10 mL/kg", "Correct. A falling haematocrit with persistent shock suggests bleeding needing blood (ICMR STW)."),
   ("Fluid overload; give furosemide", "He is still in shock, so diuretics would worsen perfusion."),
   ("Myocarditis; stop all fluids", "Myocarditis is possible, but the haematocrit fall and melaena point to bleeding first."),
   ("Prophylactic platelets only", "Platelets alone do not replace lost red cells or restore circulation.")],
  "B", "Interpret the haematocrit during resuscitation.", "Unstable with a falling haematocrit: think bleeding and transfuse."),
 bq("q3", "A 6-year-old girl was admitted with dengue warning signs and has received IV fluids for 52 hours. Her fever has gone for 2 days, platelets are rising and she now has puffy eyelids, a respiratory rate of 40/min and new bilateral crackles. Haematocrit is 32%.", "What is the most appropriate step?",
  [("Another 20 mL/kg crystalloid bolus", "She is not in shock; more fluid would worsen overload."),
   ("Platelet transfusion", "Platelets are rising and there is no bleeding."),
   ("Start antibiotics for pneumonia and continue fluids", "The picture is reabsorption of leaked fluid, not infection."),
   ("Colloid 10 mL/kg", "Colloid adds volume to an already overloaded circulation."),
   ("Stop IV fluids and assess for fluid overload; consider a diuretic if stable", "Correct. Fluids should stop by 48 hours; in the recovery phase reabsorption causes overload (ICMR STW).")],
  "E", "Recognise fluid overload in the recovery phase.", "Stop IV fluids by 48 hours; recovery brings reabsorption.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
for r in T["medicationPlan"]["regimens"]:
    n = r["genericName"]
    if n == "Ringer lactate":
        r["dose"] = "10 mL/kg/hour for 1–2 hours; if improving taper to 7 (2–3 hours), 5 (2–4 hours) and 3 mL/kg/hour (2–4 hours); if not improving or PCV rising, 15 mL/kg/hour, then colloid 10 mL/kg/hour"
    if n == "Packed red cells":
        r["dose"] = "10 mL/kg (usual practice; ICMR gives no volume)"
        r["indication"] = "Overt blood loss of 10% or more of blood volume, refractory shock, or fluid overload needing blood rather than more fluid (ICMR STW)"
    if n == "Platelet concentrate":
        r["sourceEdition"] = r["sourceEdition"]
    if n == "Paracetamol":
        r["adjustments"][0] = "Paediatric: This is the paediatric dose (ICMR Fever in Children STW); in dengue keep to a maximum of 60 mg/kg/day to limit liver injury (usual practice)."
for m in T["clinicalManagement"]:
    if m["id"] == "warning":
        m["actions"].append("Not improving or PCV rising at reassessment: increase Ringer lactate to 15 mL/kg/hour, then colloid 10 mL/kg/hour, reassessing hourly (ICMR STW).")
    if m["id"] == "discharge":
        m["actions"][1] = "Explain warning signs to parents and the need to return at once if abdominal pain, vomiting, bleeding or lethargy appears (usual practice)."
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["adm"]["kind"] = "action"
N["adm"]["text"] = "Admit: Ringer lactate 10 mL/kg/hour, reassess at 1–2 hours with PCV"
N["adm"]["next"] = [{"to": "admbetter"}]
N["taper"]["next"] = [{"to": "over"}]; N["taper"]["kind"] = "action"
N["taper"]["text"] = "Reduce to 10 mL/kg/hour, then 7, 5, 3 mL/kg/hour as vitals and PCV improve; stop by 48 hours"
i = [n["id"] for n in A["nodes"]].index("adm") + 1
A["nodes"][i:i] = [
 {"id": "admbetter", "kind": "decision", "text": "Improving with a stable PCV?", "next": [{"to": "admtaper", "label": "Yes"}, {"to": "adm15", "label": "No"}]},
 {"id": "admtaper", "kind": "outcome", "text": "Taper 7, 5, 3 mL/kg/hour over the next hours; stop by 48 hours"},
 {"id": "adm15", "kind": "outcome", "text": "Ringer lactate 15 mL/kg/hour, then colloid 10 mL/kg/hour; reassess hourly; treat as shock if it develops"}]
j = [n["id"] for n in A["nodes"]].index("taper") + 1
A["nodes"][j:j] = [
 {"id": "over", "kind": "decision", "text": "Breathlessness, crackles, puffy eyelids or effusions in recovery (fluid overload)?", "next": [{"to": "stopfl", "label": "Yes"}, {"to": "done", "label": "No"}]},
 {"id": "stopfl", "kind": "outcome", "text": "Stop IV fluids; senior or PICU review; diuretic only if haemodynamically stable"},
 {"id": "done", "kind": "outcome", "text": "Discharge when afebrile 48 hours, platelets rising and PCV stable off fluids"}]
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("a rise of 20% or more indicates plasma leak", "a rise of 20% or more indicates plasma leak (WHO)")
    b["guidance"] = b["guidance"].replace("taper to 7, 5 and 3 mL/kg/hour, stopping by 48 hours.", "taper to 7, 5 and 3 mL/kg/hour, stopping by 48 hours; if not improving, increase to 15 mL/kg/hour and then colloid 10 mL/kg/hour.")
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q3":
        for o in q["options"]:
            if o["id"] == "E":
                o["text"] = "Stop IV fluids, monitor closely and seek senior review for a diuretic if she stays stable"

save("t52_dengue_children.json", [T])
