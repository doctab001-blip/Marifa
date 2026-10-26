from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Fever in children: approach (India)"
IA = "section Initial assessment"; FW = "section Fever without focus"; DS = "section Danger signs and urgent management"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Primary Care / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Approach to fever in children in India (beyond the neonatal period): definition, danger signs, assessment, investigations by fever duration and focus, antipyretics, first doses for life-threatening infection, admission, referral and discharge, built on the ICMR Fever in Children STW (October 2019).",
 findings=["Fever definition (rectal 38.0°C or more; axillary above 37.5°C), assessment, danger signs, no tests for a well child with fever under 72 hours, essential and desirable tests for fever over 72 hours and over 7 days, clinical clues by feature, paracetamol 15 mg/kg, no empiric anti-TB treatment except suspected TB meningitis, referral and discharge criteria checked against the ICMR Fever in Children STW (October 2019).", "First-dose ceftriaxone and artesunate doses from the ICMR AES in Children STW.", "Not clinically reviewed."],
 unverified=["The ICMR workflow gives no paracetamol interval or maximum; 4–6-hourly with no more than 4 doses a day is usual practice.", "Ibuprofen is not mentioned in the workflow and is not dosed here; avoid in dengue.", "The workflow does not split approach by age (under 3 months, 3–36 months); young infants who look toxic are treated as urgent."],
 summary="Fever is the commonest reason children are brought to doctors in India. Most fevers are viral and self-limiting, but serious bacterial infections, malaria, dengue, enteric fever, scrub typhus, urinary infection and tuberculosis must not be missed. The ICMR approach is to assess how sick the child looks, look for a focus, treat danger signs at once, and use investigations only when they will change management: none for a well child with fever under 72 hours; blood count, smear and platelets after 72 hours; and a wider work-up for fever over 7 days (ICMR STW). Paracetamol treats discomfort; it does not treat the cause.",
 mechanisms=["Pyrogenic cytokines (IL-1, IL-6, TNF) reset the hypothalamic set point.", "Infection is the usual trigger; inflammatory and malignant causes are less common.", "Young infants have immature immunity and localise infection poorly.", "Prolonged fever suggests TB, enteric fever, abscess, autoimmune disease or malignancy."],
 presentation={"symptoms": ["Raised temperature", "Irritability, poor feeding", "Localising symptoms: cough, dysuria, diarrhoea, headache, joint pain"], "physicalSigns": ["Temperature: rectal 38.0°C or more, axillary above 37.5°C (ICMR STW)", "Tachycardia, tachypnoea, prolonged capillary filling time", "Rash, lymphadenopathy, hepatosplenomegaly", "Neck stiffness, bulging fontanelle"], "redFlags": ["Toxic appearance, lethargy, irritability or inconsolability (ICMR STW)", "Inability to feed, dehydration (ICMR STW)", "Severe malnutrition (ICMR STW)", "Fever over 14 days without a diagnosis (ICMR STW)", "Rash with shock or organ dysfunction: meningococcaemia (ICMR STW)"], "precipitants": ["Viral infections, recent vaccination within 24 hours (ICMR STW)", "Seasonal vector-borne illness", "Similar illness in family or neighbourhood (ICMR STW)"]},
 differentials=[("Malaria", "Smear or RDT positive."), ("Dengue", "NS1 or IgM positive, low platelets."), ("Enteric fever", "Fever over 7 days; blood culture; Widal after 7 days (ICMR STW)."), ("Urinary tract infection", "Urine microscopy and culture."), ("Kawasaki disease", "Strawberry tongue, peeling, lymphadenopathy, conjunctival injection (ICMR STW).")],
 criteria=[("Fever (ICMR STW)", "Rectal 38.0°C or more, or axillary above 37.5°C."), ("Fever without focus under 72 hours, well child (ICMR STW)", "No investigations."), ("Fever without focus over 72 hours (ICMR STW)", "Blood count, peripheral smear for malaria and morphology, platelets."), ("Fever over 7 days (ICMR STW)", "Add Widal, TB, HIV, autoimmune tests and imaging as guided.")],
 ruleIn=[
  inv("specializedAdjunctive", "Vital signs and appearance", "Temperature, HR, RR, BP, capillary filling time", "Severity", "Normal for age; looks well; CFT under 3 seconds", "Toxic appearance, tachycardia, prolonged CFT", "Danger signs need urgent management (ICMR STW).", "fevc", IA),
  inv("laboratory", "Blood count with differential and platelets", "Blood", "Infection type", "WBC 5,000–15,000/µL (age-dependent); platelets 150,000–450,000/µL", "Leucocytosis, leucopenia or thrombocytopenia", "Essential for fever over 72 hours (ICMR STW).", "fevc", FW),
  inv("laboratory", "Peripheral smear and malaria RDT", "Blood", "Malaria", "No parasites", "Plasmodium seen or RDT positive", "Essential or desirable for fever over 72 hours (ICMR STW).", "fevc", FW),
  inv("laboratory", "Dengue NS1 and IgM", "Serum", "Dengue", "Negative", "Positive", "Desirable for fever over 72 hours (ICMR STW).", "fevc", FW),
  inv("laboratory", "Urine microscopy and culture (clean catch)", "Urine", "Urinary tract infection", "No pyuria; no growth", "Pyuria; significant growth", "Consider in fever without focus (ICMR STW).", "fevc", FW),
  inv("laboratory", "Blood culture", "Blood", "Bacteraemia, enteric fever", "No growth", "Growth", "Desirable for fever over 72 hours (ICMR STW).", "fevc", FW),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Pneumonia", "Clear lungs", "Consolidation", "Consider in fever without focus (ICMR STW).", "fevc", FW)],
 ruleOut=[inv("laboratory", "CRP or procalcitonin", "Serum", "Bacterial infection", "CRP below 10 mg/L", "Raised", "Optional (ICMR STW).", "fevc", FW)],
 management=[
  step("assess", "Assess", "First contact", ["Vital signs, appearance, history including vaccination in last 24 hours and contacts (ICMR STW).", "Full examination for a focus (ICMR STW)."]),
  step("urgent", "Danger signs", "Immediately", ["Lower temperature with paracetamol and tepid sponging (ICMR STW).", "Manage life-threatening problems (airway, shock, seizures) (ICMR STW).", "First antibiotic dose for suspected meningitis, severe pneumonia or severe malnutrition; antimalarial if malaria suspected (ICMR STW)."]),
  step("tests", "Investigate by duration", "Day 3 and day 7", ["Well child, fever under 72 hours: no tests (ICMR STW).", "Over 72 hours: blood count, smear, platelets; add RDT, NS1/IgM, blood and urine culture as indicated (ICMR STW).", "Over 7 days: add Widal, TB tests (Mantoux, Xpert), HIV, autoimmune tests and imaging (ICMR STW).", "Do not start empiric anti-TB treatment except for suspected TB meningitis (ICMR STW)."]),
  step("dispo", "Admit or refer", "As needed", ["Admit for ongoing care needs; refer to tertiary care for intensive care unit (ICU) needs, complex multi-system disease or complications (ICMR STW)."])],
 branches=[("Symptom relief", "Any febrile child who is uncomfortable."), ("First dose for life-threatening infection", "Danger signs with suspected meningitis, severe pneumonia, sepsis or severe malaria, before or during referral.")],
 regimens=[
  rx("Symptom relief", "Antipyretic", "Fever with discomfort", "Children", "Paracetamol", "15 mg/kg per dose", "Oral, rectal or IV", "Every 4–6 hours as needed", "During fever", "This is the paediatric dose (ICMR STW).", NOT_ABX, "No adjustment.", "Avoid in liver failure.", ["Temperature, comfort"], ["Do not exceed 4 doses in 24 hours"], "fevc", "section Antipyretic dosing"),
  rx("First dose for life-threatening infection", "First antibiotic dose", "Suspected meningitis, severe pneumonia or sepsis", "Children", "Ceftriaxone", "100 mg/kg/day in 2 divided doses (first dose 50 mg/kg)", "IV", "Every 12 hours", "First dose, then per diagnosis", "This is the paediatric dose (ICMR AES STW).", "Avoid after an immediate (anaphylactic) penicillin reaction.", "No adjustment alone.", "No adjustment alone.", ["Response, cultures"], ["Neonates with jaundice; calcium infusions in neonates"], "aes", "section Step III (empiric treatment)"),
  rx("First dose for life-threatening infection", "Antimalarial", "Suspected severe malaria", "Children", "Artesunate", "3 mg/kg (under 20 kg) or 2.4 mg/kg (20 kg or more)", "IV or IM", "At 0, 12 and 24 hours, then daily", "Until oral treatment possible", "This is the paediatric dose (ICMR AES STW).", NOT_ABX, "No adjustment.", "No adjustment.", ["Smear, Hb"], ["Do not give by infusion"], "aes", "section Step III (empiric treatment)")],
 medNote="Antipyretic dose from the ICMR Fever in Children STW; first-dose antimicrobials from the ICMR AES in Children STW. Specific infections: see their own topics. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Fever in Indian children.", "learningObjectives": ["Spot danger signs.", "Order tests only when they change management.", "Treat discomfort, not the number."],
  "keyPoints": ["Well child, fever under 72 hours: no tests.", "Over 72 hours: blood count, smear, platelets.", "Paracetamol 15 mg/kg.", "No empiric anti-TB treatment except TB meningitis."],
  "pitfalls": ["Antibiotics for viral fever.", "Missing Kawasaki disease.", "NSAIDs in suspected dengue.", "Widal in the first week."],
  "references": [tref("fevc", "sections Fever definition, Initial assessment, Danger signs, Fever without focus, Investigations by duration, Fever with specific features, Antipyretic dosing, Admission, Discharge"), tref("aes", "section Step III (empiric treatment)")]},
 nonClinical={"patientEducation": ["Give plenty of fluids; light clothing.", "Return for drowsiness, breathing difficulty, rash, poor feeding or fits.", "Fever above 3 days needs review."], "lifestyleAndDiet": ["Continue breastfeeding and normal diet."], "mdtReferrals": ["Tertiary paediatrics for ICU needs or complex disease (ICMR STW)"], "dischargeCriteria": ["Afebrile over 48 hours or settling (ICMR STW)", "Feeding well; symptoms resolving (ICMR STW)", "Planned IV antibiotics completed (ICMR STW)"], "followUpPlan": "Review at 48–72 hours if fever persists; sooner for any danger sign."})
# Depth standard (2026-10-25)
T["lastReviewed"] = "2026-10-25"
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [u for u in EA["unverifiedSections"] if not (u.startswith("The ICMR workflow gives no paracetamol interval") or u.startswith("Ibuprofen is not mentioned"))]
EA["unverifiedSections"].insert(0, "The ICMR workflow gives no paracetamol interval or maximum and does not mention ibuprofen; both are taken from the Gloucestershire children's analgesia guideline (2020).")
P = T["medicationPlan"]
for r in P["regimens"]:
    if r["genericName"] == "Paracetamol":
        r["adjustments"][0] = "Paediatric: Over 3 months: 15 mg/kg every 4–6 hours, maximum 4 doses and 90 mg/kg/day, not above 4 g/day; under 3 months maximum 60 mg/kg/day (Gloucestershire guideline); dose by weight (ICMR STW)."
        r["selection"] = "one-of"; r["preferred"] = True; r["step"] = "Antipyretic"
P["regimens"].insert(1, rx("Symptom relief", "Antipyretic", "Fever with discomfort when paracetamol is insufficient", "Children over 3 months", "Ibuprofen", "5–10 mg/kg (1–4 years 100 mg)", "Oral", "Every 6–8 hours", "During fever",
  "Children 3 months and over: maximum 30 mg/kg/day, not above 2400 mg (Gloucestershire guideline); not for neonates.", NOT_ABX, "Avoid in kidney injury or dehydration (caution in renal impairment, guideline).", "Avoid in severe liver disease.", ["Hydration, urine output"], ["Suspected dengue (bleeding risk); caution with asthma and low platelets (guideline)"], "glosan", "section Ibuprofen", sel="one-of", pref=False, use="Paracetamol not enough for comfort, and dengue is not suspected."))
T["pathophysiology"]["summary"] += " Infants under 3 months and children with severe malnutrition may not mount a fever or localise infection, so their threshold for investigation and admission is lower."
T["presentation"]["symptoms"].append("Rash, joint pain or bleeding (dengue, chikungunya, meningococcaemia)")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Malaria", "Fever with chills, pallor and splenomegaly in an endemic area; a positive smear or rapid diagnostic test settles it."),
 ("Dengue", "High fever, myalgia, rash, falling platelets and rising haematocrit; NS1 in the first 5 days or IgM later settles it."),
 ("Enteric fever", "Stepwise fever over 7 days with abdominal symptoms; blood culture settles it, Widal only after 7 days (ICMR STW)."),
 ("Urinary tract infection", "Fever without focus in infants or with dysuria; clean-catch urine microscopy and culture settles it."),
 ("Kawasaki disease", "Fever over 5 days with strawberry tongue, conjunctival injection, rash, peeling and lymphadenopathy (ICMR STW); echocardiography assesses the coronaries."),
 ("Scrub typhus", "Eschar, lymphadenopathy, hepatosplenomegaly and thrombocytopenia in the monsoon; scrub typhus IgM ELISA settles it."),
 ("Tuberculosis", "Fever over 2 weeks with weight loss, cough or contact history; chest X-ray, Mantoux and Xpert settle it (ICMR STW).")]]
for m in T["clinicalManagement"]:
    if m["id"] == "dispo":
        m["actions"] = ["Admit for ongoing care needs; refer to tertiary care for intensive care unit (ICU) needs, complex multi-system disease or complications (ICMR STW).",
                        "Discharge a well child with clear return advice: inability to feed, lethargy, breathing difficulty, rash, bleeding or fever beyond 3 days (ICMR STW)."]
T["clinicalManagement"].insert(1, step("comfort", "Comfort and fluids", "From first contact", [
 "Paracetamol 15 mg/kg for discomfort, not to reach a number; extra fluids and light clothing (ICMR STW).",
 "Avoid NSAIDs when dengue is possible; ibuprofen only for discomfort after paracetamol in a child over 3 months (Gloucestershire guideline)."]))
T["teaching"]["references"].append(tref("glosan", "sections Paracetamol, Ibuprofen"))

ALG = algo("fever-children-pathway", "Child with fever: assess, test, treat", "manage", "fevc", "sections Initial assessment, Danger signs, Fever without focus, Investigations by duration", [
 node("start", "start", "Child with fever (rectal 38.0 °C or more, axillary above 37.5 °C)", [("toxic", None)]),
 node("toxic", "decision", "Danger signs: toxic, lethargic, unable to feed, dehydrated, severe malnutrition, rash with shock?", [("urg", "Yes"), ("focus", "No")]),
 node("urg", "outcome", "Treat airway, shock and seizures; first dose ceftriaxone (and artesunate if malaria likely); admit"),
 node("focus", "decision", "Focus found on history and examination?", [("treatf", "Yes"), ("dur", "No")]),
 node("treatf", "outcome", "Treat the focus (see its topic); paracetamol for comfort"),
 node("dur", "decision", "Duration of fever?", [("none", "Under 72 hours"), ("cbc", "72 hours to 7 days"), ("wide", "Over 7 days")]),
 node("none", "outcome", "Well child: no tests; paracetamol; review if fever persists or new signs appear"),
 node("cbc", "outcome", "Blood count, smear, platelets; add RDT, NS1/IgM, urine and blood culture as indicated"),
 node("wide", "outcome", "Add Widal (after 7 days), Mantoux, Xpert, HIV, autoimmune tests and imaging; refer if fever over 14 days undiagnosed")])

VIG = "Kabir, an 18-month-old boy from Patna, has had fever for 4 days. He is drinking but less playful, has no cough, diarrhoea or rash, and was fully vaccinated last month. Temperature is 39.2 °C axillary, pulse 150/min, respiratory rate 32/min and capillary refill under 2 seconds. Examination shows no focus. His mother has given him paracetamol syrup every 2 hours to keep the temperature down."

EXP = [
 explain("pathophysiology", "Fever is a response, not the disease", "Why treat the child rather than the thermometer?",
  "Infection triggers macrophages to release interleukin-1, interleukin-6 and tumour necrosis factor, which raise prostaglandin E2 in the hypothalamus and reset the temperature set point upwards. Fever itself is rarely harmful and may help host defence; the height of the fever correlates poorly with the seriousness of the cause. What matters is the cause and the child's physiology: tachycardia, poor perfusion and lethargy signal sepsis. Young infants and malnourished children localise infection poorly, so serious bacterial infection can present with fever alone. Prolonged fever points away from common viral infection towards enteric fever, tuberculosis, abscess, Kawasaki disease, autoimmune disease or malignancy."),
 explain("signs-symptoms", "Look at the child first", "Which features separate a sick child from a well one?",
  "Start with appearance, behaviour, colour, hydration and vital signs. Toxic appearance, lethargy or inconsolable irritability, inability to feed, dehydration, severe malnutrition, and a rash with shock or organ dysfunction are danger signs that need immediate treatment. Then search for a focus: ear, throat, chest, abdomen, urine, joints, skin and meninges. Ask about duration, contacts and season, recent travel, vaccination in the past 24 hours, and similar illness in the household. Fever beyond 5 days with conjunctival injection, red lips, rash and swollen hands suggests Kawasaki disease; an eschar suggests scrub typhus."),
 explain("investigations", "Test by duration, not by habit", "When should a child with fever have tests?",
  "A well child with fever under 72 hours and no focus needs no investigations. After 72 hours, a blood count with differential and platelets and a peripheral smear for malaria are essential, with a rapid malaria test, dengue NS1 and IgM, blood culture and urine culture as indicated. Fever over 7 days needs a wider search: Widal only after the first week, Mantoux and Xpert for tuberculosis, HIV, autoimmune tests and imaging guided by findings. A clean-catch urine sample is essential in young children with fever without focus. CRP or procalcitonin are optional and do not replace clinical assessment."),
 explain("management", "Treat danger, the cause and the discomfort", "How do you manage a febrile child step by step?",
  "Manage airway, breathing, circulation and seizures first. For suspected meningitis, severe pneumonia or sepsis give a first dose of ceftriaxone 50 mg/kg (100 mg/kg/day), and artesunate if severe malaria is possible, before referral. For the well child, give paracetamol 15 mg/kg every 4–6 hours, no more than 4 doses a day, to relieve discomfort rather than to normalise temperature; ibuprofen 5–10 mg/kg is an option after 3 months when dengue is not suspected. Do not give antibiotics for viral fever or start empiric anti-tuberculosis treatment except for suspected TB meningitis. Teach parents the warning signs and when to return.")]

QS = [
 bq("q1", "An 18-month-old boy has fever for 4 days, no focus on examination and is drinking well. Temperature is 39.2 °C, pulse 150/min and capillary refill under 2 seconds. He is alert between fever spikes. His mother has been giving paracetamol every 2 hours and asks for an injection to bring the fever down.", "What is the most appropriate next step?",
  [("IM ceftriaxone and discharge", "Antibiotics are not given for fever without focus in a well child without danger signs."),
   ("Blood count, smear, platelets and urine culture; correct the paracetamol to every 4–6 hours, maximum 4 doses a day", "Correct. Fever over 72 hours without focus needs these tests, and paracetamol every 2 hours risks overdose (ICMR STW; guideline)."),
   ("No tests; reassure", "No tests is advice only for fever under 72 hours (ICMR STW)."),
   ("Widal test", "Widal is not useful in the first week (ICMR STW)."),
   ("Start empiric anti-tuberculosis treatment", "Empiric anti-TB treatment is only for suspected TB meningitis (ICMR STW).")],
  "B", "Investigate fever without focus by duration.", "Over 72 hours: blood count, smear, platelets; dose paracetamol safely."),
 bq("q2", "A 3-year-old girl has had fever for 6 days. She has red cracked lips, bilateral non-purulent conjunctival injection, a polymorphous rash, swollen red hands and a 2 cm cervical lymph node. Malaria and dengue tests are negative. Platelets are 520,000/µL and CRP is raised.", "What is the most likely diagnosis?",
  [("Measles", "Measles has cough, coryza and Koplik spots, and the rash spreads from the face."),
   ("Scarlet fever", "Scarlet fever follows a streptococcal throat infection with a sandpaper rash, not this pattern."),
   ("Dengue", "Dengue tests are negative and dengue lowers, rather than raises, the platelets."),
   ("Kawasaki disease", "Correct. Fever over 5 days with conjunctival injection, lip changes, rash, extremity changes and lymphadenopathy suggests Kawasaki disease (ICMR STW)."),
   ("Viral fever", "Viral fever does not explain this cluster of mucocutaneous signs.")],
  "D", "Recognise Kawasaki disease in prolonged fever.", "Prolonged fever with mucocutaneous signs: think Kawasaki disease."),
 bq("q3", "A 10-month-old infant weighing 8 kg is brought with fever for 1 day. He is lethargic, will not breastfeed, has a capillary refill of 4 seconds and a non-blanching rash on the legs. Pulse is 180/min. The nearest tertiary hospital is 2 hours away.", "What should be done first?",
  [("Paracetamol and review tomorrow", "This child has danger signs and needs urgent treatment."),
   ("Blood count and wait for results", "Investigations must not delay treatment in a toxic child."),
   ("Fluid bolus and IV ceftriaxone 400 mg (50 mg/kg) before referral", "Correct. Shock with a non-blanching rash suggests meningococcaemia; treat shock and give a first dose of ceftriaxone, then refer (ICMR STW)."),
   ("Ibuprofen for the fever", "Antipyretics lower temperature but do not treat shock or sepsis."),
   ("Oral amoxicillin", "Oral antibiotics are inadequate for suspected meningococcal sepsis.")],
  "C", "Act on danger signs in febrile infants.", "Toxic child with rash and shock: treat shock, give ceftriaxone, refer.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
P = T["medicationPlan"]
P["branches"].append({"label": "Shock", "entryCriteria": "Toxic child with poor perfusion or hypotension."})
for r in P["regimens"]:
    n = r["genericName"]
    if n == "Paracetamol":
        r["route"] = "Oral"
        r["dose"] = "15 mg/kg per dose (oral loading dose 20 mg/kg, Gloucestershire guideline)"
        r["adjustments"][0] = "Paediatric: Over 3 months: 15 mg/kg every 4–6 hours, maximum 4 doses and 90 mg/kg/day, not above 4 g/day; under 3 months maximum 60 mg/kg/day (Gloucestershire guideline)."
    if n == "Ibuprofen":
        r["patientGroup"] = "Children over 12 months (main table; quick reference doses from 1–3 months)"
        r["dose"] = "5–10 mg/kg (1–4 years 100 mg)"
        r["frequency"] = "Three times daily or 6-hourly"
        r["adjustments"][0] = "Paediatric: Maximum 30 mg/kg/day, not above 2400 mg; the guideline's main table does not recommend it under 12 months, while its quick reference doses 5 mg/kg from 1–3 months (Gloucestershire guideline)."
        r["contraindications"] = ["Suspected dengue (bleeding and kidney risk; ICMR guidance on avoiding NSAIDs)", "Caution with asthma, renal impairment and low platelets (guideline)"]
    if n == "Ceftriaxone":
        r["dose"] = "50 mg/kg (maximum 2 g) as the first dose; meningitis 100 mg/kg/day in 2 divided doses (ICMR AES STW)"
        r["adjustments"] = [a if not a.startswith("Penicillin allergy:") else "Penicillin allergy: Avoid after an immediate (anaphylactic) penicillin reaction; seek specialist advice on an alternative." for a in r["adjustments"]]
        r["sourceEdition"] = r["sourceEdition"] + "; the first-dose and maximum are usual practice (the Fever STW gives no dose)"
    if n == "Artesunate":
        r["dose"] = "3 mg/kg (20 kg or under) or 2.4 mg/kg (over 20 kg)"
        r["duration"] = "Then once daily parenteral or oral for 3–7 days (ICMR AES STW)"
P["regimens"].insert(1, rx("Symptom relief", "IV antipyretic", "Fever with discomfort when oral route not possible", "Children", "Paracetamol (IV)", "Up to 10 kg: 10 mg/kg; 10–50 kg: 15 mg/kg; over 50 kg: 1 g", "IV", "Every 4–6 hours", "During fever",
  "Up to 10 kg maximum 30 mg/kg/day; 10–50 kg maximum 60 mg/kg/day; over 50 kg maximum 4 g/day (Gloucestershire guideline).", NOT_ABX, "No adjustment.", "Avoid in liver failure.", ["Temperature, liver tests if prolonged"], ["Severe liver disease"], "glosan", "section Paracetamol (IV)"))
P["regimens"].append(rx("Shock", "Fluid bolus", "Shock or circulatory failure", "Children", "Normal saline 0.9%", "20 mL/kg", "IV", "Bolus over 15–20 minutes; reassess after each", "Repeat by response",
  "This is the paediatric dose (ICMR AES STW).", NOT_ABX, "Reassess for overload after each bolus.", "Reassess for overload after each bolus.", ["Heart rate, capillary refill, BP, liver size, crackles"], ["Signs of fluid overload or severe malnutrition (use smaller volumes)"], "aes", "section Step I"))
for m in T["clinicalManagement"]:
    if m["id"] == "dispo":
        m["actions"][1] = "Discharge a well child with clear return advice: inability to feed, lethargy, breathing difficulty, rash, bleeding or fever beyond 3 days (usual practice)."
    if m["id"] == "comfort":
        m["actions"][0] = "Paracetamol 15 mg/kg by any route and/or hydrotherapy for discomfort, not to reach a number (ICMR STW)."
    if m["id"] == "urgent":
        m["actions"].append("Shock: normal saline 20 mL/kg IV and reassess (ICMR AES STW).")
for d in T["differentials"]:
    if d["condition"] == "Kawasaki disease":
        d["distinguishingFeatures"] = "Prolonged fever with strawberry tongue, conjunctival injection, rash, peeling and lymphadenopathy (ICMR STW); echocardiography assesses the coronaries (see the Kawasaki disease topic for IVIG and aspirin)."
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("A clean-catch urine sample is essential in young children with fever without focus.", "A clean-catch urine sample is desirable in children with fever without focus, especially infants.")
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q1":
        for o in q["options"]:
            if o["id"] == "B":
                o["text"] = "Blood count, smear and platelets (urine culture desirable); correct the paracetamol to every 4–6 hours, maximum 4 doses a day"
                o["explanation"] = "Correct. Fever over 72 hours without focus needs blood count, smear and platelets, with urine culture desirable; paracetamol every 2 hours risks overdose (ICMR STW; guideline)."
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["toxic"]["next"] = [{"to": "urg", "label": "Yes"}, {"to": "young", "label": "No"}]
i = [n["id"] for n in A["nodes"]].index("urg") + 1
A["nodes"][i:i] = [
 {"id": "young", "kind": "decision", "text": "Neonate or young infant under 3 months?", "next": [{"to": "infant", "label": "Yes"}, {"to": "focus", "label": "No"}]},
 {"id": "infant", "kind": "outcome", "text": "Low threshold: full sepsis work-up (blood count, blood and urine culture, consider LP), admit and give first-dose antibiotics if unwell"}]
N["urg"]["text"] = "Treat airway, shock (saline 20 mL/kg) and seizures; first dose ceftriaxone 50 mg/kg (artesunate if malaria likely); admit"

save("t53_fever_children.json", [T])
