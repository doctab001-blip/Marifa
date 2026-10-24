from h import *
TITLE = "Miscarriage and post-abortion complications (India)"
C_INC = "Chapter 6, p. 51 (incomplete abortion and infection/sepsis tables)"
C_HAEM = "Chapter 6, p. 49 (haemorrhage table)"
C_SH = "Chapter 6, p. 50 (shock table)"
C_DIS = "Chapter 6, p. 47 (before discharge)"
C_MMA = "Chapter 7, pp. 60–61 (adjunct medications; incomplete abortion during medical method)"
C_EX = "Chapter 4, pp. 30–32 (examination, uterine size table, laboratory investigations, medical conditions)"
C_VA = "Chapter 6, p. 38 (vacuum aspiration indications and contraindications)"
N_M = "recommendations 1.5.1–1.5.14"
N_AD = "recommendations 1.7.1–1.7.3"
NT_SA = "section 6.3 Septic abortion, p. 41"
T = topic(
 id="3dad4e15-24cd-5a35-b9c7-30d254a66c50", title=TITLE, specialty="Obstetrics & Gynaecology", authority="MoHFW", pillar="Safe Birth",
 scope="Women with bleeding or pain in early pregnancy (under 12–14 weeks) and women with complications after spontaneous or induced abortion in India: threatened, incomplete and missed miscarriage, haemorrhage, shock, and septic abortion. Built on the MoHFW CAC training and service delivery guidelines (2023) and the NCDC-ICMR National Treatment Guidelines (2025) for septic abortion antibiotics, with NICE NG126 for missed and threatened miscarriage regimens the Indian guideline does not cover.",
 findings=[
  "Examination, uterine size interpretation, laboratory tests, vacuum aspiration indications, incomplete abortion (misoprostol 400 micrograms sublingual or 600 micrograms oral, or vacuum aspiration), haemorrhage (misoprostol, uterine massage, oxytocin 10 units in 500 mL), shock resuscitation, post-abortion infection, anti-D 50 micrograms for Rh-negative women and discharge advice checked against MoHFW CAC guidelines 2023, Chapters 4, 6 and 7.",
  "Septic abortion antibiotics (ampicillin, gentamicin and metronidazole; amoxicillin-clavulanate; clindamycin with gentamicin; piperacillin-tazobactam or meropenem with organ dysfunction) checked against NCDC-ICMR National Treatment Guidelines 2025, section 6.3.",
  "Missed miscarriage (mifepristone 200 mg then misoprostol 800 micrograms), threatened miscarriage progesterone, expectant management and anti-D rules checked against NICE NG126 recommendations 1.5 and 1.7.",
  "CAC and NICE differ on when anti-D is needed; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "The MoHFW CAC guideline does not give a regimen for missed miscarriage or threatened miscarriage; these are from NICE NG126 (off-label use of mifepristone and misoprostol in the UK).",
  "Septic abortion durations (7–10 days) are from NCDC-ICMR NTG; switching to oral therapy is not specified.",
  "Paediatric (adolescent) doses are not separately given; adolescents receive adult obstetric doses in the cited sources.",
  "Gentamicin dosing in kidney impairment and monitoring of levels are not specified in NTG; follow the hospital protocol.",
  "Second-trimester pregnancy loss is outside this topic."],
 summary="Miscarriage is loss of a pregnancy before viability; most early losses are due to chromosomal abnormalities. Retained products of conception cause continued bleeding and are the main route to infection. Post-abortion complications — haemorrhage, incomplete evacuation, uterine perforation and sepsis — remain an important cause of maternal death in India. Management depends on the woman's stability, the type of miscarriage and the presence of infection (CAC 2023).",
 mechanisms=[
  "Failure of the early pregnancy leads to separation of the gestational sac and bleeding from the placental bed.",
  "Products left in the uterus stop it contracting, causing continued bleeding.",
  "Retained tissue and breaks in asepsis allow ascending infection; sepsis can follow within 24–48 hours (NTG section 6.3).",
  "Uterine instrumentation can cause perforation or cervical injury."],
 presentation={
  "symptoms": ["Vaginal bleeding in early pregnancy, with or without passage of tissue", "Lower abdominal cramps", "Fever, chills, foul-smelling discharge after an abortion (CAC 2023 p. 51)", "Dizziness or fainting from blood loss"],
  "physicalSigns": ["Open cervical os with tissue at the os (incomplete)", "Uterus smaller than dates (CAC 2023 p. 31)", "Pallor, fast weak pulse 110/min or more, systolic under 90 mmHg (CAC 2023 p. 50)", "Rebound tenderness, distended abdomen (infection or perforation) (CAC 2023 p. 51)"],
  "redFlags": ["Shock: pulse 110/min or more, systolic under 90 mmHg, respiration 30/min or more, confusion (CAC 2023 p. 50)", "Heavy bright red bleeding soaking pads (CAC 2023 p. 49)", "Fever with foul discharge and abdominal pain: septic abortion (NTG section 6.3)", "Severe pain, rigidity or shoulder pain after a procedure: perforation (CAC 2023 p. 49)", "Persistent pain unrelieved by analgesia: exclude ectopic pregnancy (CAC 2023 p. 60)"],
  "precipitants": ["Unsafe abortion by untrained providers", "Retained products after medical or surgical abortion", "Chromosomal abnormality (sporadic miscarriage)", "Maternal infection or uncontrolled diabetes"]},
 differentials=[
  ("Ectopic pregnancy", "Empty uterus with adnexal mass or free fluid; cervical motion tenderness (CAC 2023 p. 30)."),
  ("Molar pregnancy", "Uterus larger than dates, soft (CAC 2023 p. 31); very high hCG; snowstorm appearance on ultrasound."),
  ("Threatened miscarriage", "Closed os, live intrauterine pregnancy on ultrasound (NICE 1.5)."),
  ("Cervical lesion bleeding", "Erosion or growth that bleeds on touch on speculum examination (CAC 2023 p. 30).")],
 criteria=[
  ("Incomplete abortion (CAC 2023 p. 51)", "Excessive or prolonged bleeding, pallor, pain or fever with retained products of conception."),
  ("Septic abortion (NTG section 6.3)", "Fever, vaginal discharge and pelvic or abdominal pain after abortion; with organ dysfunction, peritonitis or severe pain = sepsis."),
  ("Missed miscarriage (NICE 1.4.5–1.4.11)", "No heartbeat with crown–rump length 7 mm or more, or mean sac diameter 25 mm or more with no fetal pole, confirmed by second opinion or repeat scan after 7 days.")],
 ruleIn=[
  inv("firstLineImaging", "Pelvic ultrasound", "Pelvis", "Retained products; viability", "Intrauterine pregnancy with heartbeat, or empty uterus after complete miscarriage", "Retained products, no heartbeat, or no intrauterine sac", "Confirms type of miscarriage; excludes ectopic; not mandatory where unavailable (CAC 2023 pp. 31, 57).", "cac", C_EX, extra=("nice", N_M)),
  inv("laboratory", "Haemoglobin", "Blood count", "Blood loss", "Female 12–15 g/dL", "Low; under 7 g/dL needs a higher centre (CAC 2023 p. 32)", "Plan transfusion and level of care (CAC 2023 p. 32).", "cac", C_EX),
  inv("laboratory", "Blood group and Rh type", "Blood", "Rh-negative mother", "Rh positive (most women)", "Rh negative", "Rh-negative women need anti-D after evacuation (CAC 2023 p. 47).", "cac", C_DIS),
  inv("laboratory", "Blood and cervical cultures", "Microbiology", "Septic abortion", "No growth", "Growth of pathogens", "Take before antibiotics to guide therapy (NTG section 6.3).", "ntg", NT_SA)],
 ruleOut=[
  inv("laboratory", "Urine pregnancy test", "Bedside", "Pregnancy status", "Negative", "Positive", "Confirms pregnancy; a positive test after an abortion with pain needs review for continuation or ectopic (CAC 2023 p. 31).", "cac", C_EX),
  inv("laboratory", "Serum creatinine and urine output", "Blood and bedside", "Organ dysfunction in sepsis", "Creatinine 0.5–1.1 mg/dL; urine over 0.5 mL/kg/h", "Rising creatinine, low urine output", "Organ dysfunction moves the patient to the sepsis regimen (NTG section 6.3).", "ntg", NT_SA)],
 management=[
  step("stabilise", "Stabilise", "Immediately", ["Shock: open airway, oxygen 6–8 L/min, Ringer lactate 1 litre in 15–20 minutes through a 16–18 gauge cannula, keep warm, intravenous antibiotics, transfuse if needed (CAC 2023 p. 50).", "Evacuate retained products if suspected once resuscitation starts (CAC 2023 p. 50)."]),
  step("bleeding", "Control bleeding", "First hour", ["Misoprostol and uterine massage for uterine bleeding (CAC 2023 p. 49).", "Continuing bleeding: oxytocin 10 units in 500 mL Ringer lactate or normal saline at 40–60 drops/min (CAC 2023 p. 49).", "Cervical tear: pressure, then absorbable suture (CAC 2023 p. 49)."]),
  step("evacuate", "Treat retained products", "Same day", ["Incomplete abortion: misoprostol or vacuum aspiration up to 12 weeks under antibiotic cover (CAC 2023 pp. 38, 51).", "Missed miscarriage: expectant for 7–14 days, or mifepristone then misoprostol, or vacuum aspiration (NICE 1.5.4, 1.5.11)."]),
  step("sepsis", "Septic abortion", "Within 1 hour of recognition", ["Blood and cervical cultures, then intravenous antibiotics (NTG section 6.3).", "Evacuate retained products; it is crucial for response (NTG section 6.3). Take care: an infected uterus perforates more easily (CAC 2023 p. 51)."]),
  step("discharge", "Before discharge", "Before leaving", ["Anti-D for Rh-negative women; iron-folic acid for 3 months; contraception counselling (CAC 2023 p. 47).", "Follow-up in 1–2 weeks (CAC 2023 p. 47)."])],
 branches=[
  ("Incomplete abortion", "Bleeding with retained products under 12 weeks, haemodynamically stable (CAC 2023 p. 51)."),
  ("Missed miscarriage", "Non-viable intrauterine pregnancy with sac still in the uterus, woman chooses medical management (NICE 1.5.11)."),
  ("Threatened miscarriage", "Bleeding with a scan-confirmed intrauterine pregnancy and a previous miscarriage (NICE 1.5.2)."),
  ("Post-abortion haemorrhage", "Continued bleeding from the uterine cavity after misoprostol and massage (CAC 2023 p. 49)."),
  ("Septic abortion without organ dysfunction", "Fever, discharge, pelvic pain after abortion, no organ dysfunction (NTG section 6.3)."),
  ("Septic abortion with organ dysfunction", "Peritonitis, severe pain, bleeding or organ dysfunction (NTG section 6.3)."),
  ("Supportive care", "All women after miscarriage or abortion procedures (CAC 2023 p. 47).")],
 regimens=[
  rx("Incomplete abortion", "Uterotonic", "Incomplete abortion", "Adults", "Misoprostol", "400 micrograms sublingual or 600 micrograms oral", "Sublingual or oral", "Single dose; one further dose may be given if ultrasound shows retained products (CAC 2023 p. 61)", "Single dose", "Adolescents: same dose (CAC 2023).", NOT_ABX, NS, NS, ["Bleeding; return in 1 week to confirm completion (CAC 2023 p. 61)"], ["Unstable patient: resuscitate and evacuate instead", "Suspected ectopic pregnancy"], "cac", C_INC),
  rx("Missed miscarriage", "Priming", "Missed miscarriage", "Adults", "Mifepristone", "200 mg", "Oral", "Once, 48 hours before misoprostol", "Single dose", "Adolescents: same dose (NICE).", NOT_ABX, NS, NS, ["Bleeding within 48 hours of misoprostol"], ["Suspected ectopic pregnancy; chronic adrenal failure"], "nice", N_M),
  rx("Missed miscarriage", "Uterotonic", "Missed miscarriage after mifepristone", "Adults", "Misoprostol (missed miscarriage dose)", "800 micrograms", "Vaginal, oral or sublingual", "Once, 48 hours after mifepristone", "Single dose", "Adolescents: same dose (NICE).", NOT_ABX, NS, NS, ["Contact team if no bleeding within 48 hours; urine pregnancy test at 3 weeks"], ["Suspected ectopic pregnancy"], "nice", N_M),
  rx("Threatened miscarriage", "Progestogen", "Threatened miscarriage with previous miscarriage", "Adults", "Micronised progesterone", "400 mg", "Vaginal", "Twice daily", "Until 16 completed weeks if heartbeat confirmed", "Adolescents: same dose (NICE).", NOT_ABX, NS, NS, ["Scan to confirm heartbeat"], ["No intrauterine pregnancy confirmed on scan"], "nice", N_M),
  rx("Post-abortion haemorrhage", "Uterotonic infusion", "Bleeding from uterine cavity despite misoprostol and massage", "Adults", "Oxytocin", "10 units in 500 mL Ringer lactate or normal saline", "Intravenous infusion", "40–60 drops per minute", "Until bleeding controlled", "Adolescents: same dose (CAC 2023).", NOT_ABX, NS, NS, ["Bleeding, pulse, blood pressure"], ["Water overload with large volumes"], "cac", C_HAEM),
  rx("Septic abortion without organ dysfunction", "Antibiotic", "Septic abortion", "Adults", "Ampicillin + gentamicin + metronidazole", "Ampicillin 2 g every 6 h; gentamicin 5 mg/kg daily; metronidazole 500 mg every 8 h", "Intravenous", "As stated per drug", "7–10 days", "Adolescents: weight-based gentamicin as stated (NTG).", "Penicillin allergy: use clindamycin with gentamicin.", "Gentamicin: reduce dose or extend interval in kidney impairment; monitor levels.", NS, ["Temperature, white cells, creatinine; culture results"], ["Penicillin allergy (ampicillin)"], "ntg", NT_SA, sel="one-of", pref=True),
  rx("Septic abortion without organ dysfunction", "Antibiotic", "Septic abortion", "Adults", "Amoxicillin-clavulanic acid", "1.2 g", "Intravenous", "Every 8 hours", "7–10 days", "Adolescents: adult dose (NTG).", "Do not use in penicillin allergy.", NS, "Caution: cholestatic jaundice reported with clavulanate.", ["Temperature; culture results"], ["Penicillin allergy"], "ntg", NT_SA, sel="one-of", pref=False, use="Single-agent option when aminoglycoside is unsuitable."),
  rx("Septic abortion without organ dysfunction", "Antibiotic", "Septic abortion", "Adults", "Clindamycin + gentamicin", "Clindamycin 600 mg every 8 h; gentamicin 5 mg/kg daily", "Intravenous", "As stated per drug", "7–10 days", "Adolescents: weight-based gentamicin as stated (NTG).", "Penicillin-allergy option (NTG).", "Gentamicin: reduce dose or extend interval in kidney impairment; monitor levels.", NS, ["Diarrhoea (C. difficile); creatinine"], ["Previous C. difficile colitis"], "ntg", NT_SA, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Septic abortion with organ dysfunction", "Antibiotic", "Septic abortion with sepsis", "Adults", "Piperacillin-tazobactam", "4.5 g", "Intravenous", "Every 6 hours", "7–10 days", "Adolescents: adult dose (NTG).", "Do not use in penicillin allergy; use meropenem only if allergy is not severe, otherwise seek microbiology advice.", "Reduce dose when creatinine clearance is low; check the formulary.", NS, ["Lactate, blood pressure, urine output; culture results"], ["Penicillin allergy"], "ntg", NT_SA, sel="one-of", pref=True),
  rx("Septic abortion with organ dysfunction", "Antibiotic", "Septic abortion with sepsis", "Adults", "Meropenem", "1 g", "Intravenous", "Every 8 hours", "7–10 days", "Adolescents: adult dose (NTG).", "Carbapenem; low cross-reactivity, avoid after anaphylaxis to penicillin unless specialist advice.", "Reduce dose when creatinine clearance is low; check the formulary.", NS, ["Lactate, blood pressure, urine output; culture results"], ["Carbapenem allergy"], "ntg", NT_SA, sel="one-of", pref=False, use="Piperacillin-tazobactam unavailable or local resistance pattern favours a carbapenem."),
  rx("Supportive care", "Analgesia", "Pain after miscarriage or abortion", "Adults", "Ibuprofen", "400 mg", "Oral", "As needed", "While cramping", "Adolescents: same dose (CAC 2023).", NOT_ABX, "Avoid in kidney impairment.", NS, ["Pain not settling: evaluate for ectopic, infection or incomplete abortion (CAC 2023 p. 60)"], ["Peptic ulcer; asthma worsened by NSAIDs"], "cac", C_MMA),
  rx("Supportive care", "Rhesus prophylaxis", "Rh-negative woman after evacuation", "Adults", "Anti-D immunoglobulin", "50 micrograms (250 IU)", "Intramuscular", "Single dose", "Single dose", "Adolescents: same dose (CAC 2023).", NOT_ABX, NS, NS, ["Document dose"], ["Rh-positive woman"], "cac", C_DIS)],
 medNote="Indian sources first: misoprostol, oxytocin, anti-D and ibuprofen from MoHFW CAC 2023; septic abortion antibiotics from NCDC-ICMR NTG 2025 section 6.3. Missed and threatened miscarriage regimens from NICE NG126 because the CAC guideline does not cover them. Evacuation of retained products is the key to source control. Not clinically reviewed.",
 comparison={"title": "Anti-D after miscarriage: MoHFW CAC vs NICE", "columns": ["MoHFW CAC guidelines (2023)", "NICE NG126 (2019, updated 2023)"], "rows": [
   {"parameter": "Who receives it", "values": ["Rh-negative women after vacuum aspiration and on day 1 of medical abortion, if available", "Rh-negative women having surgical management only"]},
   {"parameter": "Medical management alone", "values": ["Given (day 1 of medical method)", "Not given"]},
   {"parameter": "Dose", "values": ["50 micrograms", "250 IU (50 micrograms)"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Early pregnancy loss and abortion complications.", "learningObjectives": ["Classify miscarriage and choose management.", "Resuscitate haemorrhage and shock.", "Treat septic abortion with antibiotics and evacuation."],
  "keyPoints": ["Shock after abortion: fluids, antibiotics, evacuate.", "Incomplete abortion: misoprostol 400 micrograms sublingual or vacuum aspiration.", "Septic abortion: cultures, antibiotics within the hour, remove retained products.", "Anti-D for Rh-negative women after evacuation."],
  "pitfalls": ["Missing an ectopic pregnancy in a woman with pain after medical abortion.", "Treating septic abortion with antibiotics alone without evacuating the uterus.", "Rough evacuation of an infected uterus (perforation risk).", "Forgetting contraception and iron after the episode."],
  "references": [tref("cac", C_EX + "; " + C_VA + "; " + C_DIS + "; " + C_HAEM + "; " + C_SH + "; " + C_INC + "; " + C_MMA), tref("ntg", NT_SA), tref("nice", N_M + ", " + N_AD)]},
 nonClinical={"patientEducation": ["Some bleeding and cramps are normal; heavy bleeding, fever, severe pain or vomiting need urgent review (CAC 2023 p. 47).", "A period usually returns in 3–6 weeks; pregnancy can occur before then (CAC 2023 p. 47).", "Miscarriage is common and usually not caused by anything the woman did."], "lifestyleAndDiet": ["Normal diet the same day; restrict activity for 3 days; avoid douching; avoid intercourse for a week or until bleeding stops (CAC 2023 p. 47).", "Iron-folic acid tablets for at least 3 months (CAC 2023 p. 47)."], "mdtReferrals": ["Higher centre with blood transfusion for haemoglobin under 7 g/dL, perforation or sepsis (CAC 2023 pp. 32, 49)", "Counselling and family planning services"], "dischargeCriteria": ["Vital signs normal (CAC 2023 p. 47)", "Bleeding settling and pain controlled", "Contraception counselling done"], "followUpPlan": "Review in 1–2 weeks (CAC 2023 p. 47); urine pregnancy test at 3 weeks after medical management of miscarriage (NICE 1.5)."})
save("t42_miscarriage.json", [T])
