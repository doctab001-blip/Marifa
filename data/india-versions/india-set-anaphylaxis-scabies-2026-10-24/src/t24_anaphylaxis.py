from hx import *
TITLE = "Anaphylaxis (India)"
ALG = "section Anaphylaxis algorithm (ABCDE)"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Emergency Medicine / Allergy / Paediatrics", authority="MoHFW", pillar="Urgent Care",
 scope="Recognition and emergency treatment of anaphylaxis in adults and children in Indian hospitals and clinics: intramuscular adrenaline, airway, fluids, refractory anaphylaxis, observation, discharge and allergy referral, using the World Allergy Organization (WAO) Anaphylaxis Guidance 2020 and the Resuscitation Council UK (RCUK) 2021 guideline because no Indian national anaphylaxis guideline was found.",
 findings=[
  "Definition, two clinical criteria and IM adrenaline doses (0.01 mg/kg, maximum 0.5 mg; 0.15 mg for 1–5 years; 0.3 mg for 6–12 years; 0.5 mg for teenagers and adults) checked against WAO 2020.",
  "Anterolateral thigh site, repeat after 5 minutes, refractory pathway after two IM doses, fluid bolus 500–1000 mL in adults and 10 mL/kg in children, positioning, antihistamines as third-line and no routine corticosteroids checked against RCUK 2021 and its algorithm.",
  "Not clinically reviewed."],
 unverified=[
  "No Indian national anaphylaxis guideline was found; this topic uses WAO 2020 and RCUK 2021.",
  "IV adrenaline infusion rates for refractory anaphylaxis are not given in the opened sources; use only with specialist (anaesthesia or intensive care unit (ICU)) support.",
  "Glucagon dose for patients on beta-blockers, salbutamol and antihistamine doses are not given in the opened sources and are not dosed here.",
  "Mast cell tryptase timing, its reference value (about 11.4 ng/mL, assay dependent) and observation duration were not in the opened extracts; follow local protocol."],
 summary="Anaphylaxis is a serious systemic hypersensitivity reaction that is usually rapid in onset and may cause death (WAO 2020). Mast-cell and basophil mediators cause vasodilatation, capillary leak, bronchospasm and upper-airway oedema. Common triggers in India are drugs (antibiotics, NSAIDs, contrast), insect stings and foods. Intramuscular adrenaline into the anterolateral thigh is the first and most important treatment; there is no absolute contraindication to it (WAO 2020). Antihistamines and corticosteroids do not treat airway, breathing or circulation problems and must never delay adrenaline (RCUK 2021).",
 mechanisms=[
  "IgE-mediated or direct mast-cell activation releases histamine, tryptase and leukotrienes.",
  "Vasodilatation and capillary leak cause distributive shock.",
  "Bronchial smooth-muscle contraction and laryngeal oedema obstruct the airway.",
  "Adrenaline reverses these through alpha and beta receptors."],
 presentation={
  "symptoms": ["Sudden itch, flushing, urticaria or angioedema", "Throat tightness, hoarse voice, stridor", "Wheeze, breathlessness", "Dizziness, collapse", "Abdominal cramps, vomiting"],
  "physicalSigns": ["Urticaria and angioedema (absent in some cases)", "Stridor or wheeze", "SpO2 below 94% (RCUK algorithm)", "Hypotension, tachycardia", "Reduced consciousness"],
  "redFlags": ["Airway swelling, stridor or hoarse voice", "Breathing difficulty or SpO2 below 94%", "Hypotension or shock", "No improvement after two IM adrenaline doses: refractory anaphylaxis (RCUK 2021)"],
  "precipitants": ["Antibiotics (beta-lactams), NSAIDs, contrast media, anaesthetic drugs", "Insect stings", "Foods such as peanut, tree nuts, shellfish", "Cofactors: exercise, alcohol, infection"]},
 differentials=[
  ("Vasovagal syncope", "Bradycardia, pallor, rapid recovery lying flat; no rash or wheeze."),
  ("Acute asthma", "Wheeze without skin signs or hypotension."),
  ("Isolated urticaria or angioedema", "Skin only; no airway, breathing or circulation problem."),
  ("Panic attack", "Hyperventilation; normal BP and SpO2.")],
 criteria=[
  ("WAO criterion 1", "Acute onset (minutes to hours) of skin and/or mucosal involvement plus involvement of at least one other organ system (respiratory, circulation or gastrointestinal)."),
  ("WAO criterion 2", "Acute hypotension, bronchospasm or laryngeal involvement after exposure to a known or highly probable allergen, even without skin signs."),
  ("Refractory anaphylaxis (RCUK 2021)", "Respiratory or cardiovascular problems persisting after two doses of IM adrenaline.")],
 ruleIn=[
  inv("specializedAdjunctive", "Pulse oximetry", "SpO2", "Respiratory involvement", "94–100% on air", "Below 94% (RCUK algorithm)", "Breathing problem: give high-flow oxygen and IM adrenaline.", "rcukalg", ALG),
  inv("specializedAdjunctive", "Blood pressure", "Non-invasive BP", "Circulatory involvement", "Systolic 90–140 mmHg (adults)", "Hypotension", "Hypotension after exposure meets WAO criterion 2; give fluids.", "wao20", "section Diagnostic criteria"),
  inv("specializedAdjunctive", "Heart rate and cardiac monitoring", "Continuous electrocardiogram (ECG) monitor", "Shock, arrhythmia, adrenaline effects", "Sinus rhythm 60–100/min", "Tachycardia; arrhythmia", "Apply monitoring as soon as possible (RCUK algorithm).", "rcukalg", ALG),
  inv("specializedAdjunctive", "Airway assessment", "Clinical: voice, stridor, swelling", "Upper-airway oedema", "Normal voice, no stridor", "Hoarse voice, stridor, tongue or lip swelling", "Airway problem: IM adrenaline and early senior airway help (RCUK algorithm).", "rcukalg", ALG),
  inv("laboratory", "Mast cell tryptase", "Serum tryptase", "Confirmation of anaphylaxis", "Below about 11.4 ng/mL (assay dependent)", "Raised above baseline", "Supports the diagnosis for allergy-clinic review; never delays treatment.", "rcuk21", "section Key recommendations")],
 ruleOut=[
  inv("laboratory", "Capillary glucose", "Bedside glucose", "Hypoglycaemia mimicking collapse", "4.0–7.8 mmol/L (72–140 mg/dL)", "Below 4.0 mmol/L", "Excludes a common mimic in collapsed patients.", "rcukalg", ALG)],
 management=[
  step("recognise", "Recognise and call for help", "First minute", ["Use WAO criteria; if in doubt, give IM adrenaline (RCUK 2021).", "Remove the trigger (stop infusion, remove sting).", "Lie flat; sit up if breathing is easier; left side if pregnant; avoid sudden standing (RCUK 2021)."]),
  step("adrenaline", "IM adrenaline", "Immediately", ["Adrenaline 1 mg/mL into the anterolateral mid-thigh (dose by age, see medicines).", "Repeat after 5 minutes if no improvement (RCUK 2021).", "High-flow oxygen; monitoring: SpO2, ECG, BP."]),
  step("fluids", "Circulation", "With the first adrenaline dose", ["Hypotension or shock: IV crystalloid bolus 500–1000 mL in adults, 10 mL/kg in children (RCUK algorithm).", "Give fluids early in refractory anaphylaxis (RCUK 2021)."]),
  step("refractory", "Refractory anaphylaxis", "After two IM doses", ["Seek expert help early; IV adrenaline infusion only in a specialist setting by skilled clinicians (RCUK 2021).", "Continue IM adrenaline every 5 minutes until an infusion is running.", "Patients on beta-blockers may need glucagon: discuss with a specialist."], [("Cardiac arrest", ["Start cardiopulmonary resuscitation (CPR) and follow advanced life support."])]),
  step("after", "After stabilisation", "Hours", ["Non-sedating oral antihistamine for persistent skin symptoms; corticosteroids are not routine (RCUK 2021).", "Observe before discharge per local protocol.", "Refer every patient to an allergy clinic (RCUK 2021)."])],
 branches=[
  ("Initial treatment (all ages)", "Suspected anaphylaxis with an airway, breathing or circulation problem."),
  ("Hypotension or shock", "Anaphylaxis with hypotension, shock or refractory anaphylaxis.")],
 regimens=[
  rx("Initial treatment (all ages)", "First-line", "Anaphylaxis", "Adults and children", "Adrenaline (epinephrine) 1 mg/mL", "0.01 mg/kg, maximum 0.5 mg; adults and children over 12 years 0.5 mg (0.5 mL)", "IM, anterolateral mid-thigh", "Repeat every 5 minutes if no improvement", "Until improvement; refractory after 2 doses", "Children 6–12 years 0.3 mg (0.3 mL); 6 months–6 years 0.15 mg (0.15 mL); under 6 months 0.1–0.15 mg (RCUK algorithm); WAO: 1–5 years 0.15 mg, infants under 10 kg 0.01 mL/kg.", NOT_ABX, "No adjustment; give full dose.", "No adjustment; give full dose.", ["SpO2, ECG, BP every few minutes"], ["No absolute contraindication in anaphylaxis (WAO 2020)", "Never give undiluted 1 mg/mL IV"], "wao20", "section Epinephrine dosing", extra_adj=("Repeat interval and age-band doses: RCUK 2021 algorithm.",)),
  rx("Initial treatment (all ages)", "Oxygen", "Breathing or circulation problem", "Adults and children", "Oxygen", "High-flow oxygen", "Face mask with reservoir", "Continuous", "Until stable", "Same in children.", NOT_ABX, "No adjustment.", "No adjustment.", ["SpO2"], ["None in anaphylaxis"], "rcukalg", ALG),
  rx("Hypotension or shock", "Fluid resuscitation", "Hypotension or shock", "Adults and children", "Crystalloid (0.9% sodium chloride)", "Adults 500–1000 mL bolus", "IV", "Bolus, repeat as needed", "Until BP restored", "Children 10 mL/kg bolus (RCUK algorithm).", NOT_ABX, "Reassess after each bolus in kidney failure.", "Reassess after each bolus in liver disease with ascites.", ["BP, heart rate, lung crackles"], ["Watch for fluid overload in heart failure"], "rcukalg", ALG)],
 medNote="Doses are from WAO 2020 and the RCUK 2021 algorithm; no Indian national anaphylaxis guideline was found. Antihistamines and steroids are not first-line and are not dosed here. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "IM adrenaline doses: WAO 2020 vs RCUK 2021", "columns": ["WAO 2020", "RCUK 2021 algorithm"], "rows": [
   {"parameter": "Adults and teenagers", "values": ["0.5 mg", "0.5 mg (adult and child over 12 years)"]},
   {"parameter": "Children", "values": ["6–12 years 0.3 mg; 1–5 years 0.15 mg; infants under 10 kg 0.01 mL/kg", "6–12 years 0.3 mg; 6 months–6 years 0.15 mg; under 6 months 0.1–0.15 mg"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Anaphylaxis in Indian emergency and ward practice.", "learningObjectives": ["Recognise anaphylaxis with WAO criteria.", "Give IM adrenaline in the right dose and site.", "Know when it is refractory."],
  "keyPoints": ["If in doubt, give IM adrenaline.", "0.5 mg adult, 0.3 mg 6–12 years, 0.15 mg under 6 years.", "Repeat every 5 minutes.", "Two doses and still unwell: refractory, call expert help."],
  "pitfalls": ["Giving antihistamine or steroid first.", "Standing the patient up.", "Subcutaneous or deltoid injection.", "Discharge without allergy referral."],
  "references": [tref("wao20", "sections Definition, Diagnostic criteria, Epinephrine dosing"), tref("rcuk21", "section Key recommendations"), tref("rcukalg", "section Anaphylaxis algorithm (ABCDE)")]},
 nonClinical={"patientEducation": ["Know and avoid the trigger.", "Carry the emergency plan; use an adrenaline auto-injector if prescribed.", "Call for help after using it."], "lifestyleAndDiet": ["Read food labels for the allergen.", "Tell every doctor about drug allergy."], "mdtReferrals": ["Allergy clinic for every patient (RCUK 2021)", "Anaesthesia or ICU for refractory anaphylaxis"], "dischargeCriteria": ["Symptoms resolved and observed per local protocol", "Trigger identified or allergy referral made", "Action plan and, unless drug-induced, adrenaline auto-injector with training (RCUK 2021)"], "followUpPlan": "Allergy clinic review to confirm the trigger."})
save("t24_anaphylaxis.json", [T])
