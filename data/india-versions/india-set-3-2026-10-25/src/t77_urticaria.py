from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Urticaria and angioedema (India)"
TR = "section Treatment"; AN = "section Anaphylaxis"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Dermatology / Allergy / Internal Medicine / Emergency Medicine", authority="ICMR", pillar="Chronic Care",
 scope="Acute and chronic urticaria and angioedema in adults and children in India: recognition, airway emergencies and anaphylaxis, limited investigations, stepwise antihistamine treatment, add-on therapy and referral, built on the ICMR Urticaria and Angioedema STW (July 2022).",
 findings=["Chronic urticaria over 6 weeks, wheals resolve within 24 hours and angioedema within 72 hours, spontaneous and inducible types, C4 and C1-inhibitor testing for angioedema without wheals, limited role of tests, second-generation antihistamines (cetirizine 10 mg, levocetirizine 5 mg, loratadine 10 mg, fexofenadine 180 mg), up to fourfold dose after 2 weeks, add-on cyclosporine 3–5 mg/kg, montelukast 10 mg or omalizumab 300 mg every 4 weeks after 2–4 more weeks, prednisolone 0.3–0.5 mg/kg for up to 10 days, adrenaline 0.2–0.5 mg IM (children 0.01 mg/kg, maximum 0.3 mg) every 5–15 minutes, avoid NSAIDs and ACE inhibitors when drug-induced, and referral criteria checked against the ICMR Urticaria STW (July 2022).", "Not clinically reviewed."],
 unverified=["Paediatric antihistamine doses are not given in the STW and are not included.", "Use in pregnancy is not covered in the STW.", "Bradykinin-mediated angioedema from ACE inhibitors is not classified separately in the STW; antihistamines may not work in it."],
 summary="Urticaria (hives) is itchy wheals that come and go within 24 hours; angioedema is deeper swelling of lips, eyelids, tongue or genitals lasting up to 3 days. Acute urticaria is usually triggered by infection, drugs (NSAIDs, antibiotics) or food. Chronic urticaria lasting over 6 weeks is usually spontaneous, sometimes inducible by pressure, cold, heat or sun, and rarely needs tests. Treatment is a daily non-sedating antihistamine, increased up to four times the standard dose, then add-on therapy in tertiary care. Throat swelling, breathing difficulty or shock means anaphylaxis: IM adrenaline first. Angioedema without wheals raises the possibility of hereditary angioedema or ACE-inhibitor angioedema.",
 mechanisms=["Mast cell degranulation releases histamine, causing wheals and itch.", "Chronic spontaneous urticaria is often autoimmune (antibodies against IgE or its receptor).", "Hereditary and ACE-inhibitor angioedema are bradykinin-mediated and do not respond to antihistamines.", "Second-generation antihistamines block H1 receptors with little sedation."],
 presentation={"symptoms": ["Itchy wheals", "Swelling of lips, eyes, tongue or throat", "Breathlessness, choking (emergency)"], "physicalSigns": ["Raised wheals with surrounding flare, resolving within 24 hours (ICMR STW)", "Non-pitting swelling (angioedema)", "Dermographism"], "redFlags": ["Laryngeal symptoms, choking or dyspnoea: emergency (ICMR STW)", "Shock or wheeze: anaphylaxis (ICMR STW)", "Lesions over 24–48 hours with bruising: urticarial vasculitis, refer (ICMR STW)", "Angioedema without wheals: hereditary or ACE-inhibitor angioedema"], "precipitants": ["NSAIDs, antibiotics, ACE inhibitors (ICMR STW)", "Infections", "Foods", "Pressure, cold, heat, sun, exercise"]},
 differentials=[("Urticarial vasculitis", "Lesions over 24 hours, bruising; biopsy."), ("Insect bites", "Grouped papules with a punctum."), ("Contact dermatitis", "Eczematous, at contact site."), ("Hereditary angioedema", "Recurrent angioedema without wheals; low C4.")],
 criteria=[("Chronic urticaria (ICMR STW)", "More than 6 weeks."), ("Wheals vs angioedema (ICMR STW)", "Wheals resolve in 1–24 hours; angioedema up to 72 hours."), ("Step-up (ICMR STW)", "Fourfold antihistamine after 2 weeks; add-on after a further 2–4 weeks.")],
 ruleIn=[
  inv("specializedAdjunctive", "Clinical history and examination", "Bedside", "Type and triggers", "Not applicable", "Wheals and or angioedema; trigger identified", "Diagnosis is clinical (ICMR STW).", "urt", "section Investigations"),
  inv("specializedAdjunctive", "Dermographism and physical challenge tests", "Bedside", "Inducible urticaria", "Negative", "Wheal after stroking, cold or pressure", "Suspected inducible urticaria (ICMR STW).", "urt", "section Classification"),
  inv("laboratory", "C4 and C1-inhibitor level and function", "Blood", "Hereditary angioedema", "Normal", "Low C4 and C1-inhibitor", "Angioedema without wheals (ICMR STW).", "urt", "section Investigations"),
  inv("laboratory", "Skin biopsy", "Punch biopsy", "Urticarial vasculitis or other diagnosis", "Urticaria features", "Vasculitis", "If other diagnoses suspected (ICMR STW).", "urt", "section Investigations"),
  inv("laboratory", "Blood count, renal and liver tests before immunosuppression", "Blood", "Safety of cyclosporine", "Within reference range", "Abnormal", "Before third-line therapy (ICMR STW).", "urt", "section Investigations")],
 ruleOut=[inv("laboratory", "Thyroid function and anti-TPO", "Blood", "Associated thyroid autoimmunity", "Normal", "Abnormal", "Limited utility (ICMR STW).", "urt", "section Investigations")],
 management=[
  step("emerg", "Emergency", "Immediately", ["Airway compromise, choking, wheeze or shock: IM adrenaline; refer after stabilisation (ICMR STW; see Anaphylaxis topic).", "Severe urticaria with respiratory distress: airway; injectable hydrocortisone and pheniramine may be needed (ICMR STW)."]),
  step("first", "First line", "Weeks 0–2", ["Daily second-generation antihistamine; avoid triggers and NSAIDs if drug-induced (ICMR STW)."]),
  step("second", "Second line", "After 2 weeks", ["Increase antihistamine up to fourfold (ICMR STW)."]),
  step("third", "Third line", "After a further 2–4 weeks", ["Tertiary care: add cyclosporine, montelukast or omalizumab (ICMR STW).", "Short prednisolone course only for uncontrolled disease (ICMR STW)."]),
  step("refer", "Refer", "When needed", ["Uncontrolled on fourfold dose, unusual lesions, angioedema not responding or with choking, tests unavailable (ICMR STW)."])],
 branches=[("Antihistamine", "Acute or chronic urticaria."), ("Add-on therapy", "Uncontrolled after fourfold antihistamine (tertiary care)."), ("Short steroid course", "Severe uncontrolled flare."), ("Anaphylaxis", "Urticaria or angioedema with airway, breathing or circulation compromise.")],
 regimens=[
  rx("Antihistamine", "Second-generation antihistamine", "Urticaria", "Adults", "Cetirizine", "10 mg; up to 40 mg after 2 weeks", "Oral", "Once daily (up to fourfold)", "Until controlled; taper", "Paediatric doses not in the STW.", NOT_ABX, "Halve the dose in moderate to severe renal impairment.", "No adjustment.", ["Sedation at higher doses"], ["Severe renal failure at high dose"], "urt", TR, sel="one-of", pref=True),
  rx("Antihistamine", "Second-generation antihistamine", "Urticaria", "Adults", "Levocetirizine", "5 mg; up to 20 mg after 2 weeks", "Oral", "Once daily (up to fourfold)", "Until controlled", "Paediatric doses not in the STW.", NOT_ABX, "Reduce in renal impairment.", "No adjustment.", ["Sedation"], ["End-stage renal disease"], "urt", TR, sel="one-of", pref=False, use="Cetirizine causes sedation or poor response."),
  rx("Antihistamine", "Second-generation antihistamine", "Urticaria", "Adults", "Fexofenadine", "180 mg; up to 720 mg after 2 weeks", "Oral", "Once daily (up to fourfold)", "Until controlled", "Paediatric doses not in the STW.", NOT_ABX, "No adjustment usually.", "No adjustment.", ["Response"], ["Hypersensitivity"], "urt", TR, sel="one-of", pref=False, use="Least sedating option needed (drivers, students)."),
  rx("Antihistamine", "Second-generation antihistamine", "Urticaria", "Adults", "Loratadine", "10 mg; up to 40 mg after 2 weeks", "Oral", "Once daily (up to fourfold)", "Until controlled", "Paediatric doses not in the STW.", NOT_ABX, "No adjustment.", "Reduce dose in severe liver impairment.", ["Response"], ["Hypersensitivity"], "urt", TR, sel="one-of", pref=False, use="Other options unavailable."),
  rx("Add-on therapy", "Add-on", "Uncontrolled chronic urticaria", "Adults", "Omalizumab", "300 mg", "SC", "Every 4 weeks", "Review at 3–6 months", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Anaphylaxis after injection (observe)"], ["Hypersensitivity"], "urt", TR, sel="one-of", pref=True),
  rx("Add-on therapy", "Add-on", "Uncontrolled chronic urticaria", "Adults", "Ciclosporin (cyclosporine A)", "3–5 mg/kg/day", "Oral", "In 2 divided doses", "Short courses; specialist review", ADULT, NOT_ABX, "Avoid in renal impairment (nephrotoxic).", "Caution in liver disease.", ["BP, creatinine"], ["Uncontrolled hypertension, renal impairment, malignancy"], "urt", TR, sel="one-of", pref=False, use="Omalizumab not affordable or available."),
  rx("Add-on therapy", "Add-on", "Uncontrolled chronic urticaria", "Adults", "Montelukast", "10 mg", "Oral", "At bedtime", "Trial 4 weeks", ADULT, NOT_ABX, "No adjustment.", "No adjustment.", ["Mood and sleep changes"], ["Neuropsychiatric history"], "urt", TR, sel="one-of", pref=False, use="NSAID-exacerbated or mild uncontrolled disease."),
  rx("Short steroid course", "Corticosteroid", "Severe uncontrolled flare", "Adults and children", "Prednisolone", "0.3–0.5 mg/kg/day", "Oral", "Once daily", "Maximum 10 days", "Same per-kg dose (ICMR STW).", NOT_ABX, "No adjustment.", "No adjustment.", ["Glucose, BP"], ["Long-term use"], "urt", TR),
  rx("Anaphylaxis", "Adrenaline", "Anaphylaxis", "Adults and children", "Adrenaline (epinephrine) 1 mg/mL", "Adults 0.2–0.5 mg", "IM", "Repeat every 5–15 minutes as needed", "Until improved", "Children 0.01 mg/kg, maximum 0.3 mg (ICMR STW).", NOT_ABX, "No adjustment.", "No adjustment.", ["BP, pulse, SpO2"], ["None in anaphylaxis"], "urt", AN)],
 medNote="All doses from the ICMR Urticaria and Angioedema STW (July 2022). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Urticaria and angioedema in Indian practice.", "learningObjectives": ["Recognise airway emergencies.", "Use the antihistamine ladder.", "Know when to suspect hereditary angioedema."],
  "keyPoints": ["Non-sedating antihistamine daily; up to fourfold after 2 weeks.", "Avoid long-term sedating antihistamines and steroids.", "Choking or shock: IM adrenaline.", "Angioedema without wheals: check C4."],
  "pitfalls": ["Long-term steroids.", "Sedating antihistamines for chronic use.", "Missing ACE-inhibitor angioedema.", "Many unnecessary tests."],
  "references": [tref("urt", "sections Classification, Red flags, Investigations, Treatment, Referral")]},
 nonClinical={"patientEducation": ["Take antihistamine daily, not only when itching.", "Avoid painkillers like ibuprofen if they trigger hives.", "Seek emergency care for throat swelling or breathlessness."], "lifestyleAndDiet": ["Avoid known triggers; food elimination only if a clear link."], "mdtReferrals": ["Dermatology or allergy for refractory disease (ICMR STW)"], "dischargeCriteria": ["Airway safe; symptoms controlled (emergency cases)"], "followUpPlan": "Review at 2 weeks and 4–6 weeks while stepping up; taper once controlled (ICMR STW)."})
# Depth standard (2026-10-25)
T["evidenceAudit"]["unverifiedSections"] = [u for u in T["evidenceAudit"]["unverifiedSections"] if not u.startswith("Paediatric antihistamine doses")]
T["evidenceAudit"]["unverifiedSections"].insert(0, "Paediatric cetirizine doses are from the US label (Drugs.com) because the ICMR STW gives none; updosing in children is not covered.")
T["evidenceAudit"]["findings"].insert(1, "Cetirizine children: 6 months–2 years 2.5 mg once or twice daily (maximum 5 mg/day); 2–5 years 2.5 mg twice daily or 5 mg once daily (maximum 5 mg/day); 6 years and over 5–10 mg once daily (label, Drugs.com).")
for r in T["medicationPlan"]["regimens"]:
    if r["genericName"] == "Cetirizine":
        r["adjustments"] = ["Paediatric: 6 months–2 years 2.5 mg once or twice daily (maximum 5 mg/day); 2–5 years 2.5 mg twice daily or 5 mg once daily (maximum 5 mg/day); 6 years and over 5–10 mg once daily (label)."] + [a for a in r["adjustments"] if not a.startswith("Paediatric:")]
T["pathophysiology"]["summary"] += " In India, chronic spontaneous urticaria is common in young women, and long courses of oral steroids and sedating antihistamines bought over the counter are frequent and harmful."
T["presentation"]["symptoms"] += ["Burning or pain with deep swelling (angioedema)", "Symptoms worse at night or with heat, pressure or exercise (inducible)"]
T["presentation"]["physicalSigns"] += ["Wheals that fade within 24 hours, leaving normal skin (ICMR STW)", "Stridor, wheeze or hypotension (anaphylaxis)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Urticarial vasculitis", "Lesions last more than 24–48 hours, burn rather than itch and leave bruising; skin biopsy settles it (ICMR STW)."),
 ("Insect bite reactions (papular urticaria)", "Grouped itchy papules with a central punctum on exposed skin; history and distribution settle it."),
 ("Contact dermatitis", "Eczematous, scaly rash limited to the contact site and lasting days; history and patch testing settle it."),
 ("Hereditary angioedema", "Recurrent angioedema without wheals, abdominal attacks and family history; low C4 and C1-inhibitor settle it (ICMR STW)."),
 ("ACE-inhibitor angioedema", "Angioedema of lips or tongue without wheals in a patient on an ACE inhibitor; history settles it and antihistamines often fail — stop the drug."),
 ("Anaphylaxis", "Urticaria with breathing difficulty, hypotension or gastrointestinal symptoms after a trigger; clinical diagnosis — give IM adrenaline at once.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "first":
        m["actions"] = ["Daily second-generation antihistamine (cetirizine 10 mg, levocetirizine 5 mg, loratadine 10 mg or fexofenadine 180 mg) (ICMR STW).", "Identify and avoid triggers; stop NSAIDs or ACE inhibitors if they are implicated (ICMR STW)."]
    if m["id"] == "second":
        m["actions"] = ["Still symptomatic after 2 weeks: increase the same antihistamine up to fourfold (ICMR STW).", "Review adherence and triggers before stepping up."]
    if m["id"] == "refer":
        m["actions"] = ["Refer if uncontrolled on a fourfold dose, lesions last over 24–48 hours with bruising, or angioedema does not respond (ICMR STW).", "Refer angioedema without wheals for C4 and C1-inhibitor testing (ICMR STW)."]
T["teaching"]["learningObjectives"].append("Dose antihistamines safely in children.")
T["teaching"]["references"].append(tref("cetd", "section Urticaria (adult and paediatric dosing)"))

ALG = algo("urticaria-pathway", "Wheals or angioedema: stepwise management", "manage", "urt", "sections Red flags, Treatment, Referral", [
 node("start", "start", "Patient with wheals and/or angioedema", [("airway", None)]),
 node("airway", "decision", "Breathing difficulty, throat swelling, hypotension or collapse?", [("adr", "Yes"), ("wheal", "No")]),
 node("adr", "outcome", "Anaphylaxis: IM adrenaline 0.5 mg (child 0.01 mg/kg, maximum 0.3 mg), airway, refer after stabilisation", None),
 node("wheal", "decision", "Angioedema without wheals?", [("hae", "Yes"), ("ah", "No")]),
 node("hae", "outcome", "Check drugs (ACE inhibitor) and C4 and C1-inhibitor; refer", None),
 node("ah", "action", "Non-sedating antihistamine daily; avoid triggers", [("two", None)]),
 node("two", "decision", "Controlled after 2 weeks?", [("taper", "Yes"), ("updose", "No")]),
 node("taper", "outcome", "Continue, then taper once controlled", None),
 node("updose", "action", "Increase up to fourfold", [("four", None)]),
 node("four", "decision", "Controlled after a further 2–4 weeks?", [("taper2", "Yes"), ("tert", "No")]),
 node("taper2", "outcome", "Continue, then taper once controlled", None),
 node("tert", "outcome", "Tertiary care: add omalizumab, ciclosporin or montelukast", None)])

VIG = "Ms F, a 29-year-old bank clerk from Hyderabad, has had itchy red wheals on her trunk and arms almost daily for 4 months. Each wheal fades within a few hours without a mark, and twice her lips have swollen overnight. She has taken prednisolone courses from a local clinic 'whenever it is bad' and chlorphenamine at night, which makes her drowsy at work. She has no breathing difficulty and takes no regular medicines."

EXP = [
 explain("pathophysiology", "Mast cells, histamine and why antihistamines are updosed", "Why does chronic urticaria respond to higher antihistamine doses?",
  "Wheals and angioedema are caused by mast cell degranulation in the skin, releasing histamine and other mediators that make vessels leak. In chronic spontaneous urticaria the trigger is often autoimmune — antibodies against IgE or its receptor activate mast cells repeatedly — rather than an allergy to a food or drug, so extensive allergy testing rarely helps. Second-generation antihistamines block H1 receptors without much sedation, and because the mast cell drive is persistent, higher doses (up to four times the standard) control symptoms in many patients who do not respond to standard doses. Bradykinin-mediated angioedema — hereditary or due to ACE inhibitors — involves a different pathway, which is why antihistamines and steroids do not work for it."),
 explain("signs-symptoms", "Recognise the emergency and the mimics", "Which features change management?",
  "First decide whether this is anaphylaxis: wheals with breathing difficulty, throat tightness, hypotension, collapse or gastrointestinal symptoms need IM adrenaline at once. Then decide the type: acute urticaria (under 6 weeks) is often triggered by infection, drugs or food; chronic urticaria lasts more than 6 weeks and is usually spontaneous, sometimes inducible by pressure, cold, heat, sun or exercise. Individual wheals should last under 24 hours and leave normal skin. Lesions that last longer, burn, or leave bruising suggest urticarial vasculitis and need a biopsy. Angioedema without wheals points to an ACE inhibitor or hereditary angioedema."),
 explain("investigations", "Why fewer tests are better", "What should you test for?",
  "In most patients the diagnosis is clinical and no tests are needed. Investigations are guided by history and examination: a skin biopsy when lesions persist beyond 24–48 hours or bruise, C4 and C1-inhibitor levels when angioedema occurs without wheals, and infection testing only when the history suggests it. Blood tests are needed before immunosuppressive treatment such as ciclosporin. Thyroid tests, autologous serum skin tests and skin-prick or IgE tests have limited value. Explaining this to patients avoids expensive and unhelpful testing and redirects attention to effective treatment."),
 explain("management", "The antihistamine ladder", "How do you treat chronic urticaria step by step?",
  "Start a once-daily non-sedating antihistamine — cetirizine 10 mg, levocetirizine 5 mg, loratadine 10 mg or fexofenadine 180 mg — and take it every day, not only when itching. If symptoms persist after 2 weeks, increase the dose up to fourfold. If still uncontrolled after a further 2–4 weeks, specialist care adds omalizumab 300 mg every 4 weeks, ciclosporin 3–5 mg/kg or montelukast 10 mg. Avoid long-term sedating antihistamines and repeated oral steroids; a short prednisolone course (0.3–0.5 mg/kg for up to 10 days) is only for severe flares. Children receive weight- and age-appropriate cetirizine doses. Anaphylaxis is treated with IM adrenaline 0.2–0.5 mg in adults or 0.01 mg/kg (maximum 0.3 mg) in children, repeated every 5–15 minutes as needed.")]

QS = [
 bq("q1", "A 29-year-old woman has had near-daily itchy wheals for 4 months, each fading within hours without marks, with two episodes of lip swelling. She uses repeated prednisolone courses and night-time chlorphenamine, which makes her drowsy. She has no breathing difficulty and no other medicines.", "What is the best next step?",
  [("Continue prednisolone courses as needed", "Repeated oral steroids are avoided; short courses are only for severe flares (ICMR STW)."),
   ("Extended food allergy test panel", "Allergy tests have limited value in chronic spontaneous urticaria (ICMR STW)."),
   ("Daily non-sedating antihistamine such as cetirizine 10 mg, increasing up to fourfold after 2 weeks if needed", "Correct. This is first- and second-line treatment for chronic urticaria (ICMR STW)."),
   ("Omalizumab 300 mg now", "Omalizumab is third-line in tertiary care after antihistamine updosing fails."),
   ("Increase chlorphenamine to three times daily", "Long-term first-generation antihistamines are avoided because of sedation (ICMR STW).")],
  "C", "Use the antihistamine ladder in chronic urticaria.", "Non-sedating antihistamine daily, then up to fourfold; avoid steroids and sedating antihistamines."),
 bq("q2", "A 58-year-old man on ramipril for 3 years presents with marked swelling of the lips and tongue for 6 hours. He has no wheals or itch. He is breathing comfortably with SpO2 98% and BP 142/88 mmHg. Antihistamine and hydrocortisone given 2 hours ago made no difference.", "What is the most likely cause and key action?",
  [("Chronic spontaneous urticaria; increase antihistamine fourfold", "There are no wheals, and antihistamines have failed; this pattern suggests bradykinin-mediated angioedema."),
   ("ACE-inhibitor angioedema; stop ramipril permanently and monitor the airway", "Correct. Angioedema without wheals in a patient on an ACE inhibitor, unresponsive to antihistamines, is typical; ACE inhibitors are drugs to avoid (ICMR STW)."),
   ("Contact dermatitis; topical steroid", "Contact dermatitis is eczematous and does not cause tongue swelling."),
   ("Food allergy; skin-prick testing", "Allergic angioedema usually comes with wheals or itch and responds to antihistamines."),
   ("Insect bite; reassurance", "Bites do not cause this pattern of lip and tongue swelling.")],
  "B", "Recognise ACE-inhibitor angioedema.", "Angioedema without wheals: think ACE inhibitor or hereditary angioedema; antihistamines often fail."),
 bq("q3", "A 4-year-old boy weighing 16 kg has had itchy wheals for 3 days after a viral fever. He is otherwise well, with no swelling of the lips or breathing difficulty. His mother asks for something that will not make him sleepy.", "What is the most appropriate treatment?",
  [("Cetirizine 10 mg twice daily", "This exceeds the 5 mg/day maximum for a child aged 2–5 years (label)."),
   ("Prednisolone 2 mg/kg for 2 weeks", "Steroids are not first-line and the dose and duration are excessive (ICMR STW)."),
   ("Chlorphenamine every 4 hours", "Sedating antihistamines are avoided for regular use (ICMR STW)."),
   ("IM adrenaline", "There are no features of anaphylaxis, so adrenaline is not indicated here."),
   ("Cetirizine 2.5 mg twice daily or 5 mg once daily", "Correct. For 2–5 years the label dose is 2.5 mg twice daily or 5 mg once daily, maximum 5 mg/day.")],
  "E", "Dose a non-sedating antihistamine correctly in a young child.", "Child 2–5 years: cetirizine 5 mg/day maximum.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"].insert(1, "Renal and paediatric doses of levocetirizine, fexofenadine and loratadine are from the US labels (Drugs.com); the STW gives none. Ciclosporin dosing frequency, follow-up intervals and add-on trial durations are general practice.")
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
for r in T["medicationPlan"]["regimens"]:
    n = r["genericName"]
    if n == "Cetirizine":
        setadj(r, "CKD:", "CKD: Halve the dose in moderate to severe renal impairment; avoid fourfold updosing without specialist advice (general pharmacology).")
        setadj(r, "CLD:", "CLD: Label dosing data not available; use the standard dose with caution (Drugs.com).")
        r["contraindications"] = ["Hypersensitivity to cetirizine or hydroxyzine (label)"]
    if n == "Levocetirizine":
        setadj(r, "Paediatric:", "Paediatric: 6 months–5 years 1.25 mg once daily; 6–11 years 2.5 mg once daily; 12 years and over 5 mg; contraindicated in children under 12 with renal impairment (label, Drugs.com).")
        setadj(r, "CKD:", "CKD: Creatinine clearance 50–80 mL/min 2.5 mg daily; 30–50 2.5 mg every other day; 10–30 2.5 mg twice weekly; below 10 contraindicated; do not updose (label, Drugs.com).")
    if n == "Fexofenadine":
        setadj(r, "Paediatric:", "Paediatric: 6 months–2 years 15 mg twice daily; 2–11 years 30 mg twice daily; 12 years and over 180 mg once daily (label, Drugs.com).")
        setadj(r, "CKD:", "CKD: Reduced renal function: adults 60 mg once daily, children 2–11 years 30 mg once daily (label, Drugs.com); do not updose without specialist advice.")
        setadj(r, "CLD:", "CLD: Label data not available (Drugs.com).")
    if n == "Loratadine":
        r["dose"] = "10 mg"; r["frequency"] = "Once daily"
        r["useWhen"] = "Other options unavailable; the STW names cetirizine, levocetirizine or fexofenadine for fourfold updosing."
        setadj(r, "Paediatric:", "Paediatric: 2–5 years 5 mg once daily; 6 years and over 10 mg once daily (label, Drugs.com).")
        setadj(r, "CKD:", "CKD: Dose adjustment may be needed but no specific guidance; use with caution (label, Drugs.com).")
        setadj(r, "CLD:", "CLD: Dose adjustment may be needed but no specific guidance; use with caution (label, Drugs.com).")
    if n == "Omalizumab":
        setadj(r, "Paediatric:", "Paediatric: Licensed for chronic spontaneous urticaria from 12 years at the adult dose; specialist use (general pharmacology).")
        r["duration"] = "Specialist review of response (interval not stated in the STW)"
    if n.startswith("Ciclosporin"):
        r["frequency"] = "Daily, usually in 2 divided doses (general pharmacology; the STW gives the dose only)"
        setadj(r, "Paediatric:", "Paediatric: Specialist use only; the STW gives no paediatric guidance.")
    if n == "Montelukast":
        r["duration"] = "Specialist review of response (not stated in the STW)"
        r["contraindications"] = ["Hypersensitivity; caution: neuropsychiatric effects (warning)"]
        setadj(r, "Paediatric:", "Paediatric: Specialist use; the STW gives no paediatric guidance.")
    if n == "Prednisolone":
        setadj(r, "Paediatric:", "Paediatric: The STW gives a per-kg dose (0.3–0.5 mg/kg) without separate paediatric guidance; use the same per-kg dose for the shortest course.")
        r["indication"] = "Severe flare, or after angioedema with airway symptoms to cover a biphasic response (ICMR STW)"
T["presentation"]["precipitants"][0] = "Drugs such as NSAIDs, paracetamol and ACE inhibitors (ICMR STW)"
T["pathophysiology"]["summary"] = T["pathophysiology"]["summary"].replace("drugs (NSAIDs, antibiotics)", "drugs (NSAIDs, paracetamol, ACE inhibitors)")
for r in T["investigations"]["ruleIn"] + T["investigations"]["ruleOut"]:
    if r["testName"].startswith("Dermographism"):
        r["clinicalRationale"] = "Suspected inducible urticaria; the STW lists the inducible subtypes (testing is general practice)."
d0 = T["differentials"][0]
d0["distinguishingFeatures"] = "Lesions last more than 24–48 hours, burn rather than itch and leave bruising; refer (ICMR STW), and skin biopsy confirms it."
for m in T["clinicalManagement"]:
    if m["id"] == "emerg":
        m["actions"] = ["Airway compromise, choking, wheeze or shock: IM adrenaline 0.2–0.5 mg (child 0.01 mg/kg, maximum 0.3 mg), repeat every 5–15 minutes; refer after stabilisation (ICMR STW; see Anaphylaxis topic).",
                        "After angioedema with airway symptoms, oral prednisolone may be started to cover a biphasic response (ICMR STW); observe before discharge."]
    if m["id"] == "first":
        m["actions"][1] = "Identify and avoid triggers; stop NSAIDs, paracetamol or ACE inhibitors if they are implicated (ICMR STW)."
    if m["id"] == "refer":
        m["actions"][0] = "Refer if uncontrolled on a fourfold dose of cetirizine, levocetirizine or fexofenadine, lesions last over 24–48 hours with bruising, or angioedema does not respond (ICMR STW)."
T["nonClinicalManagement"]["followUpPlan"] = "Review at 2 weeks and again 2–4 weeks after each step-up; taper once controlled (general practice; the STW gives no schedule)."
T["teaching"]["keyPoints"] = [("Angioedema without wheals: stop any ACE inhibitor, then check C4 and C1-inhibitor." if k.startswith("Angioedema without wheals") else k) for k in T["teaching"]["keyPoints"]]
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["adr"]["text"] = "Anaphylaxis: IM adrenaline 0.2–0.5 mg (child 0.01 mg/kg, maximum 0.3 mg), repeat every 5–15 minutes; airway; observe for biphasic reaction; refer after stabilisation"
N["hae"]["text"] = "Stop any ACE inhibitor permanently; antihistamines, steroids and adrenaline may fail in bradykinin angioedema; early airway help if the airway is involved; C4 and C1-inhibitor; refer"
N["wheal"]["next"] = [{"to": "hae", "label": "Yes"}, {"to": "dur", "label": "No"}]
i = [n["id"] for n in A["nodes"]].index("hae") + 1
A["nodes"][i:i] = [
 {"id": "dur", "kind": "decision", "text": "Individual wheals last over 24–48 hours, burn or leave bruising?", "next": [{"to": "vasc", "label": "Yes"}, {"to": "ah", "label": "No"}]},
 {"id": "vasc", "kind": "outcome", "text": "Possible urticarial vasculitis: refer for skin biopsy"}]
for k in ("levod", "fexod", "lorad"):
    T["teaching"]["references"].append(tref(k, "section Urticaria; Renal dose adjustments"))

save("t77_urticaria.json", [T])
