from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Acute asthma in children (India)"
IT = "section Initial treatment"; BG = "pp. 2–5 (IV doses, nebulised doses, severity, discharge)"
PD = "This is the paediatric dose."
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Paediatric Pulmonology / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Acute asthma attacks in children aged 1 year and over in India: severity, oxygen, salbutamol by spacer or nebuliser, ipratropium, oral prednisolone, IV magnesium and second-line IV treatment, admission and discharge, using BTS/SIGN 158 (2019) and a SIGN 158-referenced hospital protocol because no Indian paediatric acute asthma guideline with doses could be opened. The adult Acute severe asthma (India) topic covers adults.",
 findings=["Oxygen to SpO2 94–98%, salbutamol pMDI and spacer 1 puff every 30–60 seconds up to 10 puffs, nebulised salbutamol 2.5–5 mg every 20–30 minutes for SpO2 below 92%, ipratropium 250 micrograms, prednisolone by age (10 mg under 2, 20 mg 2–5 years, 30–40 mg over 5 years) for up to 3 days, IV hydrocortisone 4 mg/kg, nebulised magnesium 150 mg, no routine antibiotics checked against SIGN 158 (Right Decision Service).", "IV magnesium 40 mg/kg (maximum 2 g), IV salbutamol 15 micrograms/kg, aminophylline 5 mg/kg then infusion, severity bands and discharge criteria checked against the NHS Borders SIGN 158-referenced protocol (2020).", "Not clinically reviewed."],
 unverified=["No Indian paediatric acute asthma guideline with doses was opened; IAP-endorsed Indian articles name the same drugs without doses.", "IV magnesium infusion duration is not stated in the opened protocol (usually over 20 minutes).", "Heart and respiratory rate thresholds by age are not in the opened sources."],
 summary="Acute asthma is a common cause of paediatric emergency visits in India, often triggered by viral infections, smoke from biomass fuels, dust and seasonal changes. Airway inflammation, bronchospasm and mucus narrow the airways, causing wheeze, breathlessness and hypoxaemia; a silent chest and exhaustion signal a life-threatening attack. Early inhaled salbutamol, ideally by metered-dose inhaler and spacer, and early oral steroid reduce admissions. Severe attacks need oxygen, nebulised salbutamol with ipratropium, and IV magnesium or other second-line drugs if there is no response (SIGN 158).",
 mechanisms=["Allergen, viral or irritant triggers cause airway inflammation and smooth-muscle contraction.", "Narrowed airways cause air trapping and ventilation-perfusion mismatch.", "Fatigue and rising PaCO2 signal impending respiratory failure.", "Beta-2 agonists relax airway smooth muscle; steroids reduce inflammation."],
 presentation={"symptoms": ["Cough, wheeze, breathlessness", "Difficulty speaking or feeding", "Chest tightness"], "physicalSigns": ["Wheeze, prolonged expiration", "Accessory muscle use, retractions", "SpO2 below 94% (moderate) or below 92% (severe)", "Silent chest or markedly reduced air entry (severe)"], "redFlags": ["SpO2 below 92% in air (BGH/SIGN 158)", "Silent chest, cyanosis, poor respiratory effort, exhaustion (BGH/SIGN 158)", "Confusion, drowsiness, coma (BGH/SIGN 158)", "Rising PaCO2 above 6 kPa (BGH/SIGN 158)"], "precipitants": ["Viral respiratory infections", "Smoke from biomass fuel or tobacco", "Allergens, dust, cold air", "Poor adherence to preventer inhaler"]},
 differentials=[("Bronchiolitis", "Infant under 1 year, crackles, poor response to bronchodilator."), ("Pneumonia", "Fever, focal crackles, consolidation."), ("Foreign body aspiration", "Sudden onset, unilateral wheeze."), ("Croup", "Barking cough, inspiratory stridor.")],
 criteria=[("Mild (BGH/SIGN 158)", "SpO2 above 94%; PEF above 80% predicted; not distressed."), ("Moderate (BGH/SIGN 158)", "SpO2 91–95%; PEF 50–80%; distressed with obvious accessory muscle use."), ("Severe (BGH/SIGN 158)", "SpO2 below 92%; PEF below 50%; marked distress, silent chest, pulsus paradoxus.")],
 ruleIn=[
  inv("specializedAdjunctive", "Pulse oximetry", "SpO2 in air", "Severity", "94–100%", "Below 92%: severe", "Oxygen to 94–98% (SIGN 158).", "bgh", BG),
  inv("specializedAdjunctive", "Peak expiratory flow (age 5 and over)", "PEF meter", "Severity", "Above 80% predicted or best", "50–80% moderate; below 50% severe", "Severity and discharge threshold above 75% (BGH/SIGN 158).", "bgh", BG),
  inv("specializedAdjunctive", "Clinical assessment: work of breathing, air entry, speech", "Bedside", "Severity", "Talks normally, no retractions", "Marked retraction, silent chest, unable to talk", "Silent chest is life-threatening (BGH/SIGN 158).", "bgh", BG),
  inv("laboratory", "Blood gas (severe or not improving)", "Capillary or arterial gas", "Respiratory failure", "PaCO2 4.5–6.0 kPa", "PaCO2 above 6 kPa", "Rising PaCO2 is a danger sign (BGH/SIGN 158).", "bgh", BG),
  inv("firstLineImaging", "Chest X-ray (selected)", "Chest radiograph", "Pneumothorax, consolidation", "Hyperinflation only", "Pneumothorax, collapse, consolidation", "Only if severe, not responding or focal signs.", "sign158", IT)],
 ruleOut=[inv("laboratory", "Serum potassium (on repeated salbutamol)", "Blood", "Hypokalaemia", "3.5–5.0 mmol/L", "Low", "Repeated beta-2 agonist lowers potassium.", "bgh", BG)],
 management=[
  step("start", "Start treatment", "First 20 minutes", ["Oxygen to SpO2 94–98% if below 94% (SIGN 158).", "Salbutamol by pMDI and spacer, 1 puff every 30–60 seconds up to 10 puffs; nebulise if SpO2 below 92% (SIGN 158).", "Give oral prednisolone early (SIGN 158)."]),
  step("severe", "Severe or not responding", "20–60 minutes", ["Repeat salbutamol every 20–30 minutes; add ipratropium 250 micrograms (SIGN 158).", "Consider nebulised magnesium 150 mg with each dose in the first hour if SpO2 below 92% (SIGN 158).", "IV magnesium if still not responding (BGH/SIGN 158)."]),
  step("second", "Second-line IV", "After 1–2 hours", ["IV salbutamol or aminophylline under senior and PICU input (BGH/SIGN 158)."]),
  step("discharge", "Discharge", "When stable", ["Stable on 3–4-hourly bronchodilator, PEF above 75%, SpO2 above 94% in air (BGH/SIGN 158).", "Personalised action plan; review within 48 hours (BGH/SIGN 158)."])],
 branches=[("Initial treatment", "Child 1 year and over with an acute asthma attack."), ("Severe asthma: add-on", "SpO2 below 92% or poor response to initial bronchodilator."), ("Second-line IV", "Severe asthma not responding to inhaled treatment.")],
 regimens=[
  rx("Initial treatment", "Bronchodilator", "Mild to moderate attack", "Children 2 years and over", "Salbutamol (pMDI with spacer)", "1 puff (100 mcg) every 30–60 seconds up to 10 puffs", "Inhaled via spacer (face mask under 3 years)", "Repeat every 20–30 minutes as needed", "Until improved, then 3–4-hourly", PD + " Under 2 years with poor response: consider another diagnosis (SIGN 158).", NOT_ABX, "No adjustment.", "No adjustment.", ["SpO2, heart rate, work of breathing"], ["Tachycardia, tremor"], "sign158", IT, sel="one-of", pref=True),
  rx("Initial treatment", "Bronchodilator", "Severe attack (SpO2 below 92%)", "Children", "Salbutamol (nebulised)", "Under 5 years 2.5 mg; 5 years and over 5 mg", "Nebulised, oxygen-driven", "Every 20–30 minutes", "Until improved", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["SpO2, heart rate, potassium"], ["Tachycardia"], "bgh", BG, sel="one-of", pref=False, use="SpO2 below 92% or unable to use spacer (SIGN 158)."),
  rx("Initial treatment", "Oral corticosteroid", "Any acute attack", "Children", "Prednisolone", "Under 2 years 10 mg; 2–5 years 20 mg; over 5 years 30–40 mg (2 mg/kg up to 60 mg if on maintenance steroid tablets)", "Oral", "Once daily", "Up to 3 days", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Vomiting: repeat dose"], ["Varicella exposure (caution)"], "sign158", IT, extra_adj=("IV hydrocortisone 4 mg/kg 4-hourly (2–12 years) if oral not retained (SIGN 158; BGH).",)),
  rx("Severe asthma: add-on", "Anticholinergic", "Severe attack or poor response", "Children", "Ipratropium bromide", "250 micrograms (125 micrograms under 1 year; 500 micrograms 12 years and over)", "Nebulised with salbutamol", "Every 20–30 minutes for first hours, then 4–6-hourly", "First 24 hours", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Response"], ["Glaucoma (avoid mask leak into eyes)"], "sign158", IT),
  rx("Severe asthma: add-on", "Magnesium", "Severe attack not responding", "Children", "Magnesium sulfate (IV)", "40 mg/kg (maximum 2 g)", "IV infusion", "Once", "Single dose", PD, NOT_ABX, "Caution in renal impairment.", "No adjustment.", ["BP, reflexes"], ["Hypotension"], "bgh", BG, extra_adj=("Nebulised option: 150 mg with each salbutamol and ipratropium dose in the first hour if SpO2 below 92% (SIGN 158).",)),
  rx("Second-line IV", "IV bronchodilator", "Severe asthma unresponsive to inhaled therapy", "Children", "Salbutamol (IV)", "Over 2 years 15 micrograms/kg over 10 minutes (5 micrograms/kg if 1 month–2 years); infusion 60–300 micrograms/kg/hour", "IV", "Bolus, then infusion", "Until improved", PD + " Infusions above 120 micrograms/kg/hour in PICU (BGH).", NOT_ABX, "No adjustment.", "No adjustment.", ["Heart rate, potassium, lactate"], ["Tachyarrhythmia"], "bgh", BG, sel="one-of", pref=True),
  rx("Second-line IV", "IV bronchodilator", "Severe asthma unresponsive to inhaled therapy", "Children", "Aminophylline", "5 mg/kg (maximum 500 mg) over at least 20 minutes, then 1 mg/kg/hour (1 month–12 years)", "IV", "Loading, then infusion", "Until improved", PD + " Omit loading if on theophylline (BGH).", NOT_ABX, "No adjustment.", "Reduce infusion in liver disease (level-guided).", ["Theophylline level, heart rhythm"], ["Already on theophylline (omit loading)", "Arrhythmia"], "bgh", BG, sel="one-of", pref=False, use="IV salbutamol unavailable or not effective.")],
 medNote="Doses are from BTS/SIGN 158 (2019) and the SIGN 158-referenced NHS Borders protocol (2020). Antibiotics are not routinely given. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Acute asthma in Indian children.", "learningObjectives": ["Grade severity with SpO2 and PEF.", "Give salbutamol by spacer correctly.", "Escalate severe asthma."],
  "keyPoints": ["Spacer: 1 puff every 30–60 seconds, up to 10 puffs.", "Prednisolone early: 10, 20 or 30–40 mg by age.", "SpO2 below 92%: nebulise with ipratropium.", "IV magnesium 40 mg/kg (maximum 2 g) if not responding."],
  "pitfalls": ["Nebuliser when spacer would work.", "Delaying steroids.", "Routine antibiotics.", "Discharge without an action plan."],
  "references": [tref("sign158", "section Initial treatment of acute asthma in children"), tref("bgh", "pp. 2–5")]},
 nonClinical={"patientEducation": ["Spacer technique and written action plan.", "Use preventer inhaler daily as prescribed.", "Return if reliever needed more than 4-hourly."], "lifestyleAndDiet": ["Avoid smoke from tobacco and biomass fuels.", "Influenza vaccination."], "mdtReferrals": ["PICU for life-threatening asthma", "Paediatric pulmonologist for frequent attacks"], "dischargeCriteria": ["Stable on 3–4-hourly bronchodilator (BGH)", "PEF above 75% predicted or best; SpO2 above 94% in air (BGH)"], "followUpPlan": "Review within 48 hours of discharge (BGH/SIGN 158)."})
# Depth standard (2026-10-25)
T["lastReviewed"] = "2026-10-25"
T["pathophysiology"]["summary"] += " Children with frequent attacks often have under-treated persistent asthma, poor inhaler technique or no preventer, so every acute visit is a chance to check technique, start or step up an inhaled steroid, and reduce smoke exposure at home."
T["presentation"]["symptoms"].append("Night-time or exercise-induced cough and wheeze before the attack (poor control)")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Bronchiolitis", "Infant under 1 year with coryza, crackles and wheeze and poor bronchodilator response; clinical diagnosis by age and course."),
 ("Pneumonia", "Fever, focal crackles or bronchial breathing and tachypnoea out of proportion to wheeze; chest X-ray consolidation settles it."),
 ("Foreign body aspiration", "Sudden choking onset, unilateral wheeze or reduced air entry; chest X-ray air trapping and bronchoscopy settle it."),
 ("Croup", "Barking cough and inspiratory stridor rather than expiratory wheeze; clinical diagnosis responds to steroid."),
 ("Anaphylaxis", "Wheeze with urticaria, angioedema or hypotension after a trigger; clinical diagnosis — give IM adrenaline."),
 ("Pneumothorax", "Sudden worsening with unilateral reduced breath sounds and hyper-resonance during an attack; chest X-ray settles it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "second":
        m["actions"] = ["IV salbutamol or aminophylline under senior and PICU input (BGH/SIGN 158).", "Rising PaCO2, exhaustion or falling consciousness: call anaesthesia and PICU for airway support (BGH/SIGN 158)."]
T["clinicalManagement"].insert(4, step("prevent", "Prevent the next attack", "Before discharge", [
 "Check inhaler and spacer technique; start or step up an inhaled corticosteroid preventer if attacks are frequent (SIGN 158).",
 "Advise avoiding tobacco and biomass smoke; give a written action plan and review within 48 hours (BGH/SIGN 158)."]))

ALG = algo("asthma-children-pathway", "Acute asthma in children: grade and escalate", "manage", "sign158", "section Initial treatment of acute asthma in children", [
 node("start", "start", "Child with acute wheeze and breathlessness", [("grade", None)]),
 node("grade", "decision", "Life-threatening or severe: SpO2 below 92%, silent chest, exhaustion, confusion, PEF below 50%?", [("sev", "Yes"), ("mod", "No")]),
 node("sev", "action", "Oxygen to 94–98%; nebulised salbutamol with ipratropium every 20–30 minutes; prednisolone; consider nebulised magnesium", [("resp", None)]),
 node("resp", "decision", "Responding within the first hour?", [("ward", "Yes"), ("ivmg", "No")]),
 node("ward", "outcome", "Admit; space salbutamol as tolerated; continue prednisolone"),
 node("ivmg", "action", "IV magnesium 40 mg/kg (maximum 2 g)", [("resp2", None)]),
 node("resp2", "decision", "Still not responding or rising PaCO2?", [("picu", "Yes"), ("ward2", "No")]),
 node("picu", "outcome", "Senior and PICU: IV salbutamol or aminophylline; prepare for airway support"),
 node("ward2", "outcome", "Admit; close monitoring and potassium checks"),
 node("mod", "action", "Salbutamol by spacer, 1 puff every 30–60 seconds up to 10 puffs; prednisolone", [("better", None)]),
 node("better", "decision", "Improved and stable on 3–4-hourly salbutamol?", [("home", "Yes"), ("sev2", "No")]),
 node("home", "outcome", "Discharge with action plan, preventer review and follow-up in 48 hours"),
 node("sev2", "outcome", "Treat as severe: nebulised salbutamol with ipratropium; admit")])

VIG = "Meera, a 7-year-old girl from Lucknow weighing 22 kg, is brought in November with 2 days of cough and increasing wheeze after a cold. She lives in a household that cooks with wood. She can speak only a few words at a time, uses her neck muscles to breathe and has an SpO2 of 90% in air. Respiratory rate is 40/min, pulse 140/min, and peak flow is 40% of predicted. She uses a salbutamol inhaler without a spacer."

EXP = [
 explain("pathophysiology", "Inflammation, spasm and air trapping", "Why does an acute attack become dangerous?",
  "Viral infection, smoke or allergen exposure triggers airway inflammation with mucosal oedema, mucus plugging and smooth-muscle contraction. Narrowed airways close early in expiration, trapping air and flattening the diaphragm, which increases the work of breathing. Uneven ventilation causes hypoxaemia. Early in an attack the child hyperventilates and PaCO2 falls; a normal or rising PaCO2 means fatigue and impending respiratory failure. A silent chest means so little air moves that wheeze cannot be heard. Beta-2 agonists relax smooth muscle within minutes, anticholinergics add bronchodilation in severe attacks, and steroids reduce inflammation over hours."),
 explain("signs-symptoms", "Grade the attack in seconds", "Which signs define a severe or life-threatening attack?",
  "Assess speech, work of breathing, air entry, SpO2, heart and respiratory rate, and peak flow in children aged 5 and over. A moderate attack has SpO2 of 92% or more, PEF 50–80% and the child can talk. A severe attack has SpO2 below 92%, PEF below 50%, inability to complete sentences or feed, and marked accessory muscle use. Life-threatening features are a silent chest, cyanosis, poor respiratory effort, exhaustion, confusion or drowsiness, and hypotension. Consider other diagnoses in infants under 2 years with poor response, and look for pneumothorax if a child suddenly worsens."),
 explain("investigations", "Few tests, used wisely", "When are tests useful in acute asthma?",
  "Pulse oximetry guides oxygen and severity, and peak flow in children aged 5 and over measures response and the discharge threshold of 75% or more. Most children need no blood tests or X-ray. Take a blood gas when the attack is severe or not improving: a PaCO2 above 6 kPa is a danger sign. A chest X-ray is reserved for severe or non-responding asthma, focal signs or suspected pneumothorax, collapse or consolidation. Check potassium when salbutamol is given repeatedly or intravenously, because beta-2 agonists drive potassium into cells."),
 explain("management", "Bronchodilate early, add steroid, escalate on time", "How do you treat acute asthma step by step?",
  "Give oxygen to keep SpO2 94–98%. For mild to moderate attacks give salbutamol by metered-dose inhaler and spacer, 1 puff every 30–60 seconds up to 10 puffs, repeated every 20–30 minutes; a spacer works as well as a nebuliser. Nebulise salbutamol (2.5 mg under 5 years, 5 mg from 5 years) with ipratropium 250 micrograms when SpO2 is below 92%. Give prednisolone early: 10 mg under 2 years, 20 mg at 2–5 years, 30–40 mg over 5 years, for up to 3 days. If there is no response, give IV magnesium 40 mg/kg (maximum 2 g), then IV salbutamol or aminophylline with PICU input.")]

QS = [
 bq("q1", "A 7-year-old girl has an asthma attack after a cold. She can say only a few words, SpO2 is 90% in air, respiratory rate 40/min and peak flow 40% of predicted. She has not yet had any treatment in the emergency department.", "What is the best initial treatment?",
  [("Oral salbutamol syrup", "Oral salbutamol acts slowly and is not used for acute attacks."),
   ("Oxygen, nebulised salbutamol 5 mg with ipratropium 250 micrograms, and oral prednisolone 30–40 mg", "Correct. SpO2 below 92% and PEF below 50% mean a severe attack needing oxygen, nebulised bronchodilators and early steroid (SIGN 158)."),
   ("IV aminophylline first", "Aminophylline is second-line after inhaled therapy and magnesium fail."),
   ("Amoxicillin for the cold", "Antibiotics are not routinely given in acute asthma."),
   ("Chest X-ray before treatment", "Treatment must not wait; X-ray is only for selected children.")],
  "B", "Treat a severe attack promptly.", "SpO2 below 92%: oxygen, nebulised salbutamol plus ipratropium, prednisolone."),
 bq("q2", "A 5-year-old boy with a severe asthma attack has received three nebulised salbutamol and ipratropium doses and oral prednisolone over an hour. He is still working hard to breathe with SpO2 91% on oxygen and poor air entry. He weighs 18 kg and is alert.", "What is the next step?",
  [("Another dose of prednisolone", "He has already received steroid, and a second dose adds no immediate effect."),
   ("Discharge with an inhaler", "He is still severely unwell and needs escalation."),
   ("Sedation to reduce distress", "Sedatives can depress breathing and are dangerous in acute asthma."),
   ("IV magnesium sulfate 40 mg/kg (720 mg) over 20 minutes", "Correct. IV magnesium is the next step when severe asthma does not respond to inhaled therapy (BGH/SIGN 158)."),
   ("Routine antibiotics", "There is no sign of bacterial infection and antibiotics will not relieve bronchospasm.")],
  "D", "Escalate when inhaled therapy fails.", "No response after an hour: IV magnesium 40 mg/kg."),
 bq("q3", "A 9-year-old girl has had three emergency visits for asthma this year. Today's attack has settled with salbutamol by spacer and prednisolone. Her peak flow is now 85% of predicted and SpO2 97% in air. She uses only a salbutamol inhaler without a spacer, and her family cooks with wood indoors.", "What is the most important addition to her discharge plan?",
  [("A nebuliser for home use", "A spacer works as well as a nebuliser and is cheaper and quicker."),
   ("Long-term oral prednisolone", "Long-term oral steroids are not appropriate for this level of asthma."),
   ("Inhaled corticosteroid preventer with a spacer, smoke reduction and a written action plan", "Correct. Frequent attacks indicate a need for preventer therapy, good technique and trigger reduction (SIGN 158)."),
   ("Antibiotics for 5 days", "Antibiotics treat bacterial infection and do not prevent asthma attacks."),
   ("Avoid all exercise", "Exercise should be encouraged once asthma is controlled.")],
  "C", "Prevent future attacks at discharge.", "Every attack is a chance to start a preventer and fix technique.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
for r in T["medicationPlan"]["regimens"]:
    n = r["genericName"]
    if n == "Aminophylline":
        r["dose"] = "5 mg/kg (maximum 500 mg) over at least 20 minutes, then 1 mg/kg/hour (1 month–12 years) or 500–700 micrograms/kg/hour (over 12 years)"
    if n == "Prednisolone":
        r["adjustments"] = [a if not a.startswith("IV hydrocortisone") else "IV hydrocortisone if oral not retained: 4 mg/kg 4-hourly (2–12 years), 100 mg 6-hourly (over 12 years) (SIGN 158; BGH)." for a in r["adjustments"]]
    if n == "Salbutamol (IV)":
        r["dose"] = "Over 2 years 15 micrograms/kg over 10 minutes (1 month–2 years 5 micrograms/kg over 5 minutes); infusion 60–300 micrograms/kg/hour"
    if n.startswith("Salbutamol (pMDI"):
        r["patientGroup"] = "Children 1 year and over (under 2 with poor response: consider another diagnosis, SIGN 158)"
    if n == "Ipratropium bromide":
        r["duration"] = "Every 20–30 minutes in the first hours, then 4–6-hourly (BGH)"
T["presentation"]["physicalSigns"] = [("SpO2 below 92% in air (severe, SIGN 158); give oxygen if below 94%" if s.startswith("SpO2 below 94%") else s) for s in T["presentation"]["physicalSigns"]]
T["presentation"]["redFlags"] = [f.replace("(BGH/SIGN 158)", "(SIGN 158)") for f in T["presentation"]["redFlags"]]
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("A moderate attack has SpO2 of 92% or more, PEF 50–80% and the child can talk.", "A moderate attack has SpO2 of 92% or more (BGH bands moderate as 91–95%, which overlap), PEF 50–80% and the child can talk.")
for m in T["clinicalManagement"]:
    if m["id"] == "prevent":
        m["actions"][0] = "Check inhaler and spacer technique; start or step up an inhaled corticosteroid preventer if attacks are frequent (SIGN 158, discharge and follow-up; see the Asthma: long-term care topic for preventer doses)."
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q3":
        for o in q["options"]:
            if o["id"] == "C": o["explanation"] = "Correct. Frequent attacks indicate a need for preventer therapy, good technique and trigger reduction (SIGN 158, discharge and follow-up)."
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["start"]["next"] = [{"to": "lt"}]
N["grade"]["text"] = "Severe: SpO2 below 92%, PEF below 50%, cannot complete sentences, marked accessory muscle use?"
N["mod"]["text"] = "Oxygen if SpO2 below 94%; salbutamol by spacer, 1 puff every 30–60 seconds up to 10 puffs; prednisolone"
A["nodes"].insert(1, {"id": "lt", "kind": "decision", "text": "Life-threatening: silent chest, cyanosis, poor effort, exhaustion, confusion or hypotension?", "next": [{"to": "ltout", "label": "Yes"}, {"to": "grade", "label": "No"}]})
A["nodes"].insert(2, {"id": "ltout", "kind": "outcome", "text": "Senior and PICU now: oxygen, back-to-back nebulised salbutamol with ipratropium, prednisolone or IV hydrocortisone, early IV magnesium 40 mg/kg, consider IV salbutamol"})

save("t55_asthma_children.json", [T])
