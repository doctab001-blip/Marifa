from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Varicella (chickenpox) and herpes zoster (India)"
VT = "section Varicella treatment"; ZT = "section Herpes zoster treatment"; PH = "section Analgesia and post-herpetic neuralgia"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Dermatology / Infectious Diseases / Paediatrics / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Chickenpox and shingles in adults and children in India: diagnosis, complications and red flags, oral and IV acyclovir, valacyclovir, pain and post-herpetic neuralgia, pregnancy, eye involvement, isolation and referral, built on the ICMR Varicella and Herpes Zoster STW (July 2022).",
 findings=["Clinical diagnosis, optional Tzanck or PCR, complications and red flags, acyclovir 800 mg five times daily for 5–7 days (adults and children over 40 kg) or 20 mg/kg/dose (maximum 800 mg) four times daily for 7 days (under 40 kg), IV acyclovir 10 mg/kg 8-hourly for complicated, haemorrhagic, immunosuppressed or neonatal varicella, valacyclovir 1 g three times daily, zoster treatment within 72 hours for 7 days, pregabalin 150–600 mg/day, gabapentin 300–1800 mg/day, amitriptyline 10–25 mg, nortriptyline 10–75 mg, carbamazepine 200 mg, avoid aspirin, ophthalmicus referral and pregnancy guidance checked against the ICMR Varicella and Herpes Zoster STW (July 2022).", "Not clinically reviewed."],
 unverified=["Isolation duration is not specified in the STW (usually until all lesions crust).", "Varicella vaccine and post-exposure immunoglobulin are not covered in the STW.", "Famciclovir is not mentioned in the STW."],
 summary="Chickenpox (varicella) is a highly contagious childhood infection that is more severe in adults, pregnant women, newborns and the immunocompromised. Shingles (herpes zoster) is reactivation of the same virus in a dermatome, commonest in older and immunosuppressed people, and its main long-term problem is post-herpetic neuralgia. Diagnosis is clinical. Oral acyclovir started early (within 24 hours of rash for varicella, 72 hours for zoster) shortens illness; IV acyclovir is for complicated disease. Eye involvement (lesions on the forehead or nose tip) needs urgent ophthalmology. Avoid aspirin in children.",
 mechanisms=["Primary infection spreads by droplets and vesicle fluid; incubation 10–21 days.", "Virus becomes latent in sensory ganglia; waning immunity allows reactivation as zoster.", "Acyclovir inhibits viral DNA polymerase after activation by viral thymidine kinase.", "Nerve damage causes post-herpetic neuralgia."],
 presentation={"symptoms": ["Fever, malaise, itchy rash (varicella)", "Burning dermatomal pain then rash (zoster)"], "physicalSigns": ["Vesicles on red base in crops at different stages (dew drop on a rose petal) (ICMR STW)", "Grouped vesicles in one dermatome (ICMR STW)", "Lesions on forehead or nose tip (ophthalmicus) (ICMR STW)"], "redFlags": ["Breathlessness or chest pain (pneumonia) (ICMR STW)", "Neck stiffness or confusion (encephalitis) (ICMR STW)", "Haemorrhagic or necrotic lesions; multi-dermatomal or disseminated zoster (ICMR STW)", "Haemodynamic instability (ICMR STW)", "Pregnancy, newborn or immunosuppression"], "precipitants": ["Contact with chickenpox or shingles", "Older age, HIV, cancer, steroids (zoster)"]},
 differentials=[("Hand, foot and mouth disease", "Lesions on palms, soles and mouth."), ("Impetigo", "Honey-crusted lesions."), ("Herpes simplex", "Localised, recurrent, not dermatomal."), ("Insect bite reactions", "Papules with punctum."), ("Disseminated infection in HIV", "Test for HIV in recurrent or severe zoster.")],
 criteria=[("Varicella (ICMR STW)", "Fever with generalised vesicles in different stages."), ("Herpes zoster (ICMR STW)", "Grouped vesicles in a dermatome with pain."), ("IV acyclovir (ICMR STW)", "Systemic complications, haemorrhagic varicella, immunosuppression, neonatal varicella, disseminated zoster.")],
 ruleIn=[
  inv("specializedAdjunctive", "Clinical diagnosis", "Bedside", "Varicella or zoster", "Not applicable", "Typical vesicular rash", "Usually sufficient (ICMR STW).", "vzv", "section Diagnosis"),
  inv("laboratory", "Tzanck smear or PCR of vesicle fluid", "Swab", "Confirmation", "Negative", "Multinucleated giant cells; VZV DNA", "Optional (ICMR STW).", "vzv", "section Diagnosis"),
  inv("firstLineImaging", "Chest X-ray", "Radiograph", "Varicella pneumonia", "Clear", "Nodular infiltrates", "Breathlessness or chest pain.", "vzv", "section Complications"),
  inv("laboratory", "Liver tests, renal function, blood count", "Blood", "Hepatitis, dosing for IV acyclovir", "Within reference range", "Raised transaminases, low platelets", "Complicated disease.", "vzv", "section Complications"),
  inv("laboratory", "HIV test", "Blood", "Immunosuppression", "Non-reactive", "Reactive", "Recurrent, multi-dermatomal or young-adult zoster.", "vzv", "section Complications")],
 ruleOut=[inv("laboratory", "Cerebrospinal fluid examination", "Lumbar puncture", "Encephalitis or meningitis", "Normal", "Lymphocytic pleocytosis", "Neck stiffness or confusion.", "vzv", "section Complications")],
 management=[
  step("assess", "Assess", "First visit", ["Look for red flags, pregnancy, immunosuppression and eye involvement (ICMR STW)."]),
  step("vari", "Varicella", "Within 24 hours of rash", ["Oral acyclovir; IV acyclovir for complications (ICMR STW).", "Paracetamol for fever; antihistamine; daily bath; avoid aspirin (ICMR STW).", "Isolate from high-risk contacts (ICMR STW)."]),
  step("zos", "Herpes zoster", "Within 72 hours", ["Acyclovir or valacyclovir for 7 days; later if new lesions, ophthalmicus or Ramsay Hunt (ICMR STW).", "NSAIDs for pain; add pregabalin, gabapentin or a tricyclic if uncontrolled (ICMR STW)."]),
  step("refer", "Refer", "Urgent", ["Eye involvement: ophthalmology (ICMR STW).", "Complications, immunosuppression, haemorrhagic varicella, failure of oral acyclovir, neonatal varicella (ICMR STW)."])],
 branches=[("Antiviral", "Varicella or herpes zoster."), ("Complicated or immunosuppressed", "IV treatment criteria."), ("Neuropathic pain", "Zoster pain not controlled by NSAIDs or post-herpetic neuralgia.")],
 regimens=[
  rx("Antiviral", "Antiviral", "Varicella or zoster", "Adults and children over 40 kg", "Acyclovir", "800 mg", "Oral", "Five times daily", "Varicella 5–7 days; zoster 7 days", "Children under 40 kg: 20 mg/kg/dose (maximum 800 mg) four times daily for 7 days (ICMR STW).", NOT_ABX, "Reduce dose in renal impairment; keep well hydrated.", "No adjustment.", ["Hydration, creatinine"], ["Hypersensitivity"], "vzv", VT, sel="one-of", pref=True),
  rx("Antiviral", "Antiviral", "Varicella or zoster", "Adults", "Valacyclovir", "1 g", "Oral", "Three times daily", "7 days", ADULT, NOT_ABX, "Reduce dose in renal impairment.", "No adjustment.", ["Creatinine"], ["Hypersensitivity"], "vzv", ZT, sel="one-of", pref=False, use="Five-times-daily dosing not practical."),
  rx("Complicated or immunosuppressed", "Antiviral", "Complicated, haemorrhagic, immunosuppressed or neonatal varicella; disseminated zoster", "Adults and children", "Acyclovir (intravenous)", "10 mg/kg/dose (higher doses may be needed)", "IV", "Every 8 hours", "Until improved, then oral to complete course", "Same per-kg dose in children and neonates (ICMR STW).", NOT_ABX, "Reduce dose and interval in renal impairment; hydrate (crystal nephropathy).", "No adjustment.", ["Creatinine daily, hydration"], ["Hypersensitivity"], "vzv", VT),
  rx("Neuropathic pain", "Neuropathic analgesic", "Uncontrolled zoster pain or post-herpetic neuralgia", "Adults", "Pregabalin", "Start 150 mg at bedtime; 150–600 mg/day", "Oral", "Once to twice daily", "Weeks to months; taper", ADULT, NOT_ABX, "Reduce dose in renal impairment.", "No adjustment.", ["Dizziness, sedation, oedema"], ["Hypersensitivity"], "vzv", PH, sel="one-of", pref=True),
  rx("Neuropathic pain", "Neuropathic analgesic", "Uncontrolled zoster pain or post-herpetic neuralgia", "Adults", "Gabapentin", "Start 300 mg/day; up to 1800 mg/day", "Oral", "Three times daily", "Weeks to months; taper", ADULT, NOT_ABX, "Reduce dose in renal impairment.", "No adjustment.", ["Sedation, dizziness"], ["Hypersensitivity"], "vzv", PH, sel="one-of", pref=False, use="Pregabalin unavailable (more adverse effects, ICMR STW)."),
  rx("Neuropathic pain", "Neuropathic analgesic", "Uncontrolled zoster pain or post-herpetic neuralgia", "Adults", "Amitriptyline", "10–25 mg", "Oral", "At bedtime", "Weeks to months", ADULT, NOT_ABX, "No adjustment.", "Caution in liver disease.", ["Anticholinergic effects, electrocardiogram (ECG) in heart disease"], ["Recent myocardial infarction, arrhythmia, glaucoma, urinary retention"], "vzv", PH, sel="one-of", pref=False, use="Poor sleep with pain; gabapentinoids not tolerated.")],
 medNote="All doses from the ICMR Varicella and Herpes Zoster STW (July 2022). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Varicella and zoster in Indian practice.", "learningObjectives": ["Recognise complications and high-risk groups.", "Start antivirals early.", "Manage post-herpetic neuralgia."],
  "keyPoints": ["Acyclovir 800 mg five times daily.", "Varicella: start within 24 hours; zoster within 72 hours.", "IV acyclovir 10 mg/kg 8-hourly for complicated disease.", "No aspirin in children."],
  "pitfalls": ["Missing ophthalmic zoster.", "Late antivirals in pregnancy or immunosuppression.", "Not testing for HIV.", "Under-treating pain."],
  "references": [tref("vzv", "sections Diagnosis, Complications, Varicella treatment, Herpes zoster treatment, Analgesia, Pregnancy, Referral")]},
 nonClinical={"patientEducation": ["Stay away from pregnant women, newborns and immunocompromised people until lesions crust.", "Do not scratch; keep nails short."], "lifestyleAndDiet": ["Fluids; soft diet if mouth ulcers."], "mdtReferrals": ["Ophthalmology for eye involvement (ICMR STW)", "Obstetrics for varicella in pregnancy", "Pain clinic for persistent neuralgia"], "dischargeCriteria": ["Afebrile, no complications, oral treatment tolerated"], "followUpPlan": "Review in 3–5 days for complications; pain review for zoster at 2–4 weeks."})
# Depth standard (2026-10-25)
U = T["evidenceAudit"]["unverifiedSections"]
T["evidenceAudit"]["unverifiedSections"] = [("Varicella vaccine is not covered in the ICMR STW and is not shown; post-exposure varicella zoster immune globulin (VarIg) is taken from NACI (Canada) and may be hard to obtain in India." if u.startswith("Varicella vaccine") else u) for u in U]
T["evidenceAudit"]["findings"].append("NACI 2016: VarIg 125 IU per 10 kg IM (minimum 125 IU, maximum 625 IU), as soon as possible and within 96 hours of exposure; may be given up to 10 days. For susceptible immunocompromised people, susceptible pregnant women and newborns whose mother develops varicella from 5 days before to 48 hours after delivery.")
P = T["medicationPlan"]
P["branches"].append({"label": "Post-exposure prophylaxis", "entryCriteria": "Significant exposure in a susceptible high-risk person (immunocompromised, pregnant, newborn)."})
P["note"] = P["note"].replace("All doses from the ICMR Varicella and Herpes Zoster STW (July 2022).", "Treatment doses from the ICMR Varicella and Herpes Zoster STW (July 2022); VarIg from NACI (Canada, 2016).")
P["regimens"].append(rx("Post-exposure prophylaxis", "Immunoglobulin", "Susceptible high-risk contact after significant exposure", "Immunocompromised, pregnant women, newborns", "Varicella zoster immune globulin (VarIg)",
 "125 IU per 10 kg (minimum 125 IU, maximum 625 IU)", "IM", "Single dose, as soon as possible and within 96 hours (up to 10 days)", "Single dose",
 "Same per-kg dose; newborns of mothers with varicella from 5 days before to 48 hours after delivery receive 125 IU (NACI).", "Not an antibiotic; penicillin allergy does not change this medicine.", "No adjustment.", "No adjustment.",
 ["Watch for varicella for 28 days (VarIg can prolong incubation)"], ["Severe reaction to immune globulin; IgA deficiency with anti-IgA antibodies"], "naci", "section Recommendations (dose and timing)"))
T["pathophysiology"]["summary"] += " Susceptible high-risk contacts — pregnant women, newborns and the immunocompromised — need post-exposure immune globulin, and patients remain infectious until all lesions have crusted. Varicella pneumonia, encephalitis and secondary bacterial infection are the main causes of death."
T["presentation"]["symptoms"] += ["Prodrome of fever and headache 1–2 days before the rash (adults)", "Eye pain, red eye or blurred vision (zoster ophthalmicus)"]
T["presentation"]["physicalSigns"].append("Facial palsy with vesicles in the ear canal (Ramsay Hunt syndrome)")
T["presentation"]["precipitants"].append("Pregnancy, newborn of a mother with peripartum varicella, no prior chickenpox or vaccination")
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Hand, foot and mouth disease", "Small oval vesicles on palms, soles and mouth in young children, not in crops on the trunk; clinical diagnosis."),
 ("Impetigo", "Honey-coloured crusts around nose and mouth without crops of vesicles; Gram stain or culture settles it."),
 ("Herpes simplex", "Grouped vesicles that recur at the same site, not following a dermatome; viral PCR of a vesicle settles it."),
 ("Insect bite reactions", "Itchy papules with a central punctum on exposed skin, no fever or crops; history settles it."),
 ("Disseminated infection in HIV", "Recurrent, multidermatomal or severe zoster in a young adult; HIV testing settles it (ICMR STW)."),
 ("Mpox", "Deep lesions all at the same stage, often on palms, soles or genitals, with tender lymph nodes; PCR of lesion fluid settles it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "assess":
        m["actions"] = ["Look for red flags, pregnancy, immunosuppression and eye involvement (ICMR STW).", "Ask about high-risk contacts at home (pregnant, newborn, immunosuppressed) who may need VarIg (NACI)."]
T["clinicalManagement"].insert(3, step("pep", "Protect exposed contacts", "Within 96 hours of exposure", [
 "Susceptible immunocompromised people, pregnant women and eligible newborns: VarIg 125 IU per 10 kg IM, maximum 625 IU (NACI).",
 "Give within 96 hours if possible, and up to 10 days after exposure; observe for 28 days (NACI)."]))
T["teaching"]["references"].append(tref("naci", "section Recommendations"))

ALG = algo("vzv-pathway", "Vesicular rash: varicella or zoster", "manage", "vzv", "sections Red flags, Varicella treatment, Herpes zoster treatment, Referral", [
 node("start", "start", "Vesicular rash: crops all over (varicella) or one dermatome (zoster)", [("red", None)]),
 node("red", "decision", "Pneumonia, encephalitis, haemorrhagic lesions, dissemination, or immunosuppressed?", [("iv", "Yes"), ("eye", "No")]),
 node("iv", "outcome", "Admit: IV acyclovir 10 mg/kg every 8 hours; refer", None),
 node("eye", "decision", "Lesions on forehead or nose tip, or eye symptoms?", [("oph", "Yes"), ("type", "No")]),
 node("oph", "outcome", "Oral antiviral and urgent ophthalmology", None),
 node("type", "decision", "Varicella or zoster?", [("var", "Varicella"), ("zos", "Zoster")]),
 node("var", "action", "Oral acyclovir within 24 hours of rash; paracetamol, no aspirin; isolate", [("contact", None)]),
 node("contact", "outcome", "High-risk susceptible contacts: VarIg within 96 hours", None),
 node("zos", "action", "Acyclovir or valacyclovir for 7 days (within 72 hours)", [("pain", None)]),
 node("pain", "outcome", "NSAID; add pregabalin, gabapentin or amitriptyline for neuropathic pain", None)])

VIG = "Mrs S, a 26-year-old schoolteacher from Pune who is 20 weeks pregnant, phones because her 5-year-old son developed an itchy blistering rash yesterday. She does not remember having chickenpox and has not been vaccinated. She feels well. Her son has fever and crops of vesicles on his trunk, some already crusting. Her elderly father, who lives with them, is on chemotherapy for lymphoma."

EXP = [
 explain("pathophysiology", "Primary infection, latency and reactivation", "Why does the same virus cause two diseases?",
  "Varicella zoster virus enters through the respiratory tract, replicates in lymphoid tissue and spreads in the blood to the skin, producing crops of vesicles at different stages. It is infectious from about 2 days before the rash until all lesions crust. The virus then becomes latent in sensory ganglia. When cell-mediated immunity falls — with age, HIV, cancer or steroids — it reactivates and travels down one sensory nerve, causing dermatomal pain followed by vesicles (zoster). Nerve inflammation explains post-herpetic neuralgia. Severe disease in adults, pregnancy and immunosuppression reflects the importance of T-cell immunity in controlling the virus."),
 explain("signs-symptoms", "Spot the complications early", "Which features change management?",
  "In varicella, look for breathlessness or chest pain (pneumonia, especially in adults, smokers and pregnant women), confusion or ataxia (encephalitis, cerebellitis), haemorrhagic lesions and secondary bacterial infection. In zoster, lesions on the forehead, nose tip or eye suggest ophthalmic involvement (Hutchinson's sign) and need urgent ophthalmology; facial palsy with ear vesicles is Ramsay Hunt syndrome. Zoster in more than one dermatome, dissemination, or recurrent zoster in a young adult should prompt HIV testing. Ask every patient about pregnant, newborn and immunosuppressed contacts."),
 explain("investigations", "Clinical diagnosis, tests for doubt", "When do you test?",
  "Most varicella and zoster are diagnosed clinically. Testing is useful when the rash is atypical, in immunosuppressed patients, or in pregnancy: vesicle fluid PCR is the most sensitive test. Varicella IgG serology confirms immunity in an exposed pregnant woman or immunocompromised contact with uncertain history, but should not delay VarIg beyond the window. A chest X-ray assesses suspected pneumonia, and lumbar puncture suspected encephalitis. HIV testing is advised in recurrent or severe zoster. Renal function guides acyclovir dosing in older adults and those receiving IV treatment."),
 explain("management", "Antivirals, analgesia and protecting contacts", "How do you treat and protect?",
  "Start oral acyclovir 800 mg five times daily for 7 days in adults within 24 hours of varicella rash (children under 40 kg 20 mg/kg four times daily, maximum 800 mg). For zoster, acyclovir 800 mg five times daily or valacyclovir 1 g three times daily for 7 days, ideally within 72 hours, or later if new lesions or eye involvement. Complicated or immunosuppressed patients need IV acyclovir 10 mg/kg every 8 hours with hydration. Treat pain with an NSAID and add pregabalin, gabapentin or amitriptyline for neuropathic pain. Avoid aspirin in children. Susceptible high-risk contacts receive VarIg 125 IU per 10 kg IM, maximum 625 IU, within 96 hours.")]

QS = [
 bq("q1", "A 26-year-old woman who is 20 weeks pregnant was exposed yesterday to her son's chickenpox. She has no history of chickenpox or vaccination, is well, and her varicella IgG is negative. VarIg is available at the district hospital, which is 40 minutes away. She asks whether she needs any treatment now.", "What is the most appropriate management?",
  [("Live varicella vaccine now", "Live vaccines are contraindicated in pregnancy, so this is unsafe."),
   ("Reassure; treat only if a rash develops", "A susceptible pregnant woman is high risk and should receive prophylaxis (NACI)."),
   ("Oral acyclovir 800 mg five times daily for 7 days now", "Antiviral treatment is started when rash appears; VarIg is the post-exposure option shown."),
   ("VarIg 125 IU per 10 kg IM, maximum 625 IU, as soon as possible", "Correct. Susceptible pregnant women should receive VarIg within 96 hours, and it can be given up to 10 days (NACI)."),
   ("Termination of pregnancy", "Exposure alone is not an indication; congenital varicella risk is low.")],
  "D", "Protect a susceptible pregnant contact.", "Susceptible pregnant contact: VarIg within 96 hours (up to 10 days)."),
 bq("q2", "A 68-year-old man has had burning pain over his right forehead for 3 days and now has vesicles on the forehead and the tip of his nose. His right eye is red and watering. He has diabetes and creatinine is normal.", "What is the most appropriate next step?",
  [("Oral acyclovir 800 mg five times daily and urgent ophthalmology review", "Correct. Nose-tip lesions suggest ophthalmic involvement, so antiviral treatment and urgent eye review are needed (ICMR STW)."),
   ("Topical acyclovir cream only", "Topical treatment does not prevent eye complications from zoster ophthalmicus."),
   ("Pregabalin alone for pain", "Analgesia is needed but does not treat the virus or protect the eye."),
   ("Observe as rash started more than 72 hours ago", "Treatment is given later than 72 hours when the eye is involved (ICMR STW)."),
   ("Oral prednisolone alone", "Steroids alone without antivirals are not recommended in zoster.")],
  "A", "Recognise and treat zoster ophthalmicus.", "Nose-tip vesicles: think eye involvement and refer urgently."),
 bq("q3", "A 30-year-old man has had chickenpox for 3 days. Today he is breathless, with SpO2 89% on air, respiratory rate 30/min and bilateral crackles. Chest X-ray shows diffuse nodular shadows. He smokes 15 cigarettes a day and weighs 70 kg.", "What is the best treatment?",
  [("Oral acyclovir 800 mg five times daily at home", "Pneumonia is a complication needing admission and IV treatment."),
   ("Oral valacyclovir 1 g three times daily", "Oral treatment is inadequate for life-threatening varicella pneumonia."),
   ("Admit; IV acyclovir 10 mg/kg (700 mg) every 8 hours with oxygen", "Correct. Varicella pneumonia needs IV acyclovir 10 mg/kg every 8 hours and supportive care (ICMR STW)."),
   ("VarIg 625 IU IM", "VarIg is prophylaxis for exposed contacts, not treatment of established disease."),
   ("Aspirin and fluids", "Aspirin is avoided in varicella and fluids alone do not treat the infection.")],
  "C", "Treat complicated varicella with IV acyclovir.", "Varicella pneumonia: admit and give IV acyclovir.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [u for u in EA["unverifiedSections"] if not u.startswith("Varicella vaccine")]
EA["unverifiedSections"].insert(1, "Post-exposure antiviral prophylaxis is from UKHSA (2023) and VarIg details from CDC (2013) and NACI (2016), because the ICMR STW only says VarIg may be considered when vaccination is contraindicated; VarIg may be hard to obtain in India. Renal doses are from the US labels (Drugs.com).")
EA["findings"] = [f for f in EA["findings"] if not f.startswith("NACI 2016")]
EA["findings"] += ["NACI 2016: VarIg 125 IU per 10 kg, maximum 625 IU, ideally within 96 hours and up to 10 days. CDC 2013: IM; minimum 62.5 IU at 2 kg or less and 125 IU at 2.1–10 kg; observe for 28 days; contraindicated after severe reaction to immune globulin or IgA deficiency with anti-IgA antibodies.",
 "UKHSA 2023: oral aciclovir 800 mg four times daily (children 10 mg/kg, maximum 800 mg) or valaciclovir 1 g three times daily (children 20 mg/kg, maximum 1 g) from day 7 to day 14 after exposure is first choice for susceptible pregnant and immunosuppressed contacts; VZIG for neonates exposed within a week of delivery or when antivirals are unsuitable."]
P = T["medicationPlan"]; R = P["regimens"]
P["note"] = "Treatment doses from the ICMR Varicella and Herpes Zoster STW (July 2022); post-exposure antivirals from UKHSA (2023); VarIg from NACI (2016) and CDC (2013); renal doses from US labels. India-only topic; the Saudi topic is unchanged. Not clinically reviewed."
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
for r in R:
    n = r["genericName"]
    if n == "Acyclovir":
        r["indication"] = "Varicella in infants, children over 12, adults, pregnant women and the immunosuppressed (ICMR STW); zoster"
        setadj(r, "Paediatric:", "Paediatric: Varicella, children under 40 kg: 20 mg/kg/dose (maximum 800 mg) four times daily for 7 days (ICMR STW); healthy children aged 1–12 are not routinely treated (ICMR STW). No paediatric zoster dose in the STW.")
        setadj(r, "CKD:", "CKD: 800 mg five-times-daily regimen: creatinine clearance 10–25 mL/min 800 mg every 8 hours; below 10, 800 mg every 12 hours (label, Drugs.com); keep well hydrated.")
    if n == "Valacyclovir":
        setadj(r, "Paediatric:", "Paediatric: Varicella, 2 to under 18 years: 20 mg/kg three times daily for 5 days, maximum 1 g per dose (label, Drugs.com).")
        setadj(r, "CKD:", "CKD: Zoster dose: creatinine clearance 30–49 mL/min 1 g every 12 hours; 10–29, 1 g every 24 hours; below 10, 500 mg every 24 hours (label, Drugs.com).")
    if n == "Acyclovir (intravenous)":
        setadj(r, "Paediatric:", "Paediatric: Immunocompromised children: under 1 year 10 mg/kg, 1 year and over 500 mg/m² every 8 hours for 7–10 days (label, Drugs.com); neonatal varicella may need a higher dose (ICMR STW), not above 20 mg/kg every 8 hours (label maximum).")
        setadj(r, "CKD:", "CKD: Creatinine clearance 25–50 mL/min full dose every 12 hours; 10–25 every 24 hours; below 10, half dose every 24 hours (label, Drugs.com); hydrate to avoid crystal nephropathy.")
        r["indication"] = "Complicated, haemorrhagic, immunosuppressed or neonatal varicella (ICMR STW); multisegmental or disseminated zoster (ICMR STW gives no separate dose)"
    if n == "Pregabalin":
        setadj(r, "CKD:", "CKD: Creatinine clearance 30–60 mL/min 75–300 mg/day; 15–30, 25–150 mg/day; below 15, 25–75 mg/day (label, Drugs.com).")
    if n == "Gabapentin":
        setadj(r, "CKD:", "CKD: Creatinine clearance 30–59 mL/min 400–1400 mg/day; 15–29, 200–700 mg/day; below 15, 100–300 mg/day, in 3 divided doses (label, Drugs.com).")
    if n.startswith("Varicella zoster immune globulin"):
        r["dose"] = "125 IU per 10 kg, maximum 625 IU (minimum 62.5 IU at 2 kg or less, 125 IU at 2.1–10 kg)"
        r["frequency"] = "Single IM dose, as soon as possible, ideally within 96 hours and up to 10 days after exposure"
        r["indication"] = "Neonates exposed within a week of delivery; susceptible pregnant or immunosuppressed contacts who cannot take antivirals"
        r["sourceEdition"] = "NACI, July 2016, section Recommendations; CDC MMWR 2013;62(28) for route, minimum dose, observation and contraindications"
        r["selection"] = "one-of"; r["preferred"] = False
        r["useWhen"] = "Neonate exposed within a week of delivery, or oral antivirals unsuitable (UKHSA)."
        r["branch"] = "Post-exposure prophylaxis"; r["step"] = "Post-exposure prophylaxis"
        setadj(r, "Paediatric:", "Paediatric: Same per-kg dose with the minimums above (CDC); eligible newborns include those whose mothers have varicella around delivery and hospitalised preterm infants (CDC).")
        r["monitoring"] = ["Observe for varicella for 28 days after exposure; VarIg can prolong incubation (CDC)"]
        r["contraindications"] = ["Severe reaction to human immune globulin; IgA deficiency with anti-IgA antibodies (CDC)"]
pep_adj = dict(pen=NOT_ABX, cld="No adjustment.")
R.append(rx("Post-exposure prophylaxis", "Post-exposure prophylaxis", "Susceptible pregnant or immunosuppressed contact, or infant over 4 weeks", "Adults and children", "Acyclovir (post-exposure)", "800 mg (children 10 mg/kg, maximum 800 mg)", "Oral", "Four times daily", "Day 7 to day 14 after exposure",
  "Infants over 4 weeks to 17 years: 10 mg/kg four times daily (maximum 800 mg) (UKHSA).", NOT_ABX, "Reduce dose in renal impairment as for treatment (label).", "No adjustment.", ["Watch for varicella; treat if rash develops"], ["Hypersensitivity"], "ukhsavz", "section C1, Table 1", sel="one-of", pref=True))
R.append(rx("Post-exposure prophylaxis", "Post-exposure prophylaxis", "Susceptible pregnant or immunosuppressed contact", "Adults and children", "Valacyclovir (post-exposure)", "1 g (children 20 mg/kg, maximum 1 g)", "Oral", "Three times daily", "Day 7 to day 14 after exposure",
  "Children: 20 mg/kg three times daily, maximum 1 g per dose (UKHSA).", NOT_ABX, "Reduce dose in renal impairment (label).", "No adjustment.", ["Watch for varicella; treat if rash develops"], ["Hypersensitivity"], "ukhsavz", "sections C1, D2, Table 1", sel="one-of", pref=False, use="Fewer daily doses preferred (UKHSA)."))
R.append(rx("Neuropathic pain", "Neuropathic analgesic", "Uncontrolled zoster pain or post-herpetic neuralgia", "Adults", "Nortriptyline", "Start 10–25 mg/day; increase gradually to 30–75 mg/day", "Oral", "Divided doses or at bedtime", "Weeks to months",
  ADULT, NOT_ABX, "No adjustment.", "Caution in liver disease (general pharmacology).", ["Sedation, postural hypotension, anticholinergic effects; ECG in cardiac disease"], ["Recent myocardial infarction, arrhythmia"], "vzv", "section Analgesia and post-herpetic neuralgia", sel="one-of", pref=False, use="Amitriptyline not tolerated (fewer anticholinergic effects)."))
R.append(rx("Neuropathic pain", "Neuropathic analgesic", "Uncontrolled zoster pain or post-herpetic neuralgia", "Adults", "Carbamazepine", "Start 200 mg", "Oral", "At bedtime", "Weeks to months",
  ADULT, NOT_ABX, "Caution in renal impairment (general pharmacology).", "Avoid in severe liver disease (general pharmacology).", ["Blood count, sodium, liver tests; rash"], ["AV block, bone marrow depression; HLA-B*1502 risk of severe skin reactions in some Asian groups (general pharmacology)"], "vzv", "section Analgesia and post-herpetic neuralgia", sel="one-of", pref=False, use="Lancinating pain not controlled by other options."))
R.append(rx("Prevention", "Vaccine", "Prevention of varicella in susceptible people", "Children and adults", "Varicella vaccine (live)", "One dose per scheduled visit", "SC (per product)", "Under 13 years: 12–15 months and 4–6 years; 13 years and over: 2 doses some weeks apart", "2 doses",
  "Under 13 years: 12–15 months and 4–6 years (ICMR STW).", NOT_ABX, "No adjustment.", "No adjustment.", ["Mild fever or rash after vaccination"], ["Pregnancy; severe immunosuppression (live vaccine)"], "vzv", "section Prevention"))
P["branches"].append({"label": "Prevention", "entryCriteria": "Susceptible child or adult without contraindication to a live vaccine."})
for b in P["branches"]:
    if b["label"] == "Post-exposure prophylaxis":
        b["entryCriteria"] = "Significant exposure in a susceptible high-risk person (pregnant, immunosuppressed, newborn)."
T["differentials"][4]["distinguishingFeatures"] = "Recurrent, multidermatomal or severe zoster in a young adult; HIV testing settles it (general practice)."
for r in T["investigations"]["ruleIn"] + T["investigations"]["ruleOut"]:
    if r["testName"] == "HIV test":
        r["clinicalRationale"] = "Recurrent, multidermatomal or young-adult zoster (general practice; the STW asks about HIV in the history)."
    if r["testName"].startswith("Cerebrospinal"):
        r["clinicalRationale"] = "Neck stiffness or confusion, after brain imaging (the STW lists brain imaging; CSF is general practice)."
for m in T["clinicalManagement"]:
    if m["id"] == "vari":
        m["actions"][0] = "Oral acyclovir within 24 hours of rash for infants, children over 12, adults, pregnant women and the immunosuppressed; IV acyclovir for complications (ICMR STW). Healthy children aged 1–12 get symptomatic care."
        m["actions"].append("Pregnancy: treat with acyclovir and refer; infection in the first 20 weeks may cause congenital varicella syndrome, and perinatal maternal varicella may cause neonatal varicella (ICMR STW).")
    if m["id"] == "pep":
        m["actions"] = ["Susceptible pregnant or immunosuppressed contacts: oral aciclovir 800 mg four times daily (or valaciclovir 1 g three times daily) from day 7 to day 14 after exposure (UKHSA).",
                        "Neonates exposed within a week of delivery, or when antivirals are unsuitable: VarIg 125 IU per 10 kg IM, maximum 625 IU, as soon as possible and within 10 days; observe for 28 days (NACI; CDC).",
                        "Prevention: live varicella vaccine at 12–15 months and 4–6 years, 2 doses for those 13 and over; zoster vaccine may be offered over 50 years (ICMR STW)."]
        m["timeframe"] = "From exposure"
    if m["id"] == "refer":
        m["actions"] = ["Eye involvement: ophthalmology; ear lesions or facial weakness (Ramsay Hunt): ENT (ICMR STW).",
                        "Complications, immunosuppression, haemorrhagic varicella, failure of oral acyclovir, neonatal varicella, multidermatomal or disseminated zoster, post-herpetic neuralgia (ICMR STW)."]
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["red"]["text"] = "Pneumonia, encephalitis, haemorrhagic lesions, dissemination, immunosuppression, pregnancy or a newborn?"
N["iv"]["text"] = "Admit and refer: IV acyclovir 10 mg/kg every 8 hours for complicated, immunosuppressed or neonatal disease; oral acyclovir in uncomplicated pregnancy"
N["eye"]["text"] = "Lesions on forehead or nose tip, eye symptoms, or lesions in the ear with facial weakness?"
N["oph"]["text"] = "Oral antiviral and urgent ophthalmology or ENT review"
N["var"]["text"] = "Infant, over 12 years or adult: oral acyclovir within 24 hours; healthy child 1–12: symptomatic care; paracetamol, no aspirin; isolate"
N["contact"]["text"] = "Susceptible pregnant or immunosuppressed contacts: antivirals from day 7 to 14 (UKHSA); exposed newborns: VarIg"
G = T["teaching"]["guidedApproach"]
for b in G:
    b["guidance"] = b["guidance"].replace("Start oral acyclovir 800 mg five times daily for 7 days in adults within 24 hours of varicella rash", "Start oral acyclovir 800 mg five times daily for 5–7 days in adults, adolescents, pregnant women and the immunosuppressed within 24 hours of varicella rash")
    b["guidance"] = b["guidance"].replace("Susceptible high-risk contacts receive VarIg 125 IU per 10 kg IM, maximum 625 IU, within 96 hours.", "Susceptible pregnant or immunosuppressed contacts receive oral aciclovir or valaciclovir from day 7 to 14 after exposure, and exposed newborns VarIg 125 IU per 10 kg IM.")
T["teaching"]["vignette"]["text"] = T["teaching"]["vignette"]["text"].replace("some already crusting", "with new crops still appearing")
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q1":
        q["vignette"] = "A 26-year-old woman who is 20 weeks pregnant was exposed yesterday to her son's chickenpox at home. She has no history of chickenpox or vaccination, is well, and her varicella IgG is negative. Her kidney function is normal and she has no other illness. She asks whether she needs any treatment."
        q["options"] = [
         {"id": "A", "text": "Live varicella vaccine now", "explanation": "Live vaccines are contraindicated in pregnancy, so this is unsafe."},
         {"id": "B", "text": "Reassure; treat only if a rash develops", "explanation": "A susceptible pregnant woman is high risk and should be offered prophylaxis (UKHSA)."},
         {"id": "C", "text": "Oral aciclovir 800 mg five times daily starting today for 7 days", "explanation": "Prophylactic antivirals are given from day 7 to day 14 after exposure, not straight away (UKHSA)."},
         {"id": "D", "text": "Oral aciclovir 800 mg four times daily from day 7 to day 14 after exposure", "explanation": "Correct. Antivirals are now first choice for susceptible pregnant contacts; VarIg is for those who cannot take them (UKHSA)."},
         {"id": "E", "text": "Termination of pregnancy", "explanation": "Exposure alone is not an indication; congenital varicella risk is low."}]
        q["educationalObjective"] = "Protect a susceptible pregnant contact."
        q["keyPoint"] = "Susceptible pregnant contact: oral antiviral from day 7 to 14; VarIg if antivirals unsuitable."
    if q["id"] == "q2":
        for o in q["options"]:
            if o["id"] == "D":
                o["text"] = "Give an antiviral only if new lesions appear"
                o["explanation"] = "Eye involvement needs antiviral treatment now, whether or not new lesions appear (ICMR STW)."
T["teaching"]["references"] += [tref("ukhsavz", "section C1, Table 1, section D2"), tref("cdcvzig", "section Recommendations")]

save("t78_vzv.json", [T])
