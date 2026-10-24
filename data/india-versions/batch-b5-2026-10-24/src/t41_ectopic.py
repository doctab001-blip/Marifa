from h import *
TITLE = "Ectopic pregnancy (India)"
N_DX = "recommendations 1.3.1–1.3.4, 1.4.1–1.4.32"
N_MX = "recommendations 1.6.3–1.6.19"
N_AD = "recommendations 1.7.1–1.7.3"
CAC_EX = "Chapter 4, pp. 30–31 (pelvic examination, uterine size table, role of ultrasound)"
CAC_SH = "Chapter 6, p. 50 (shock management table)"
OM = "pp. 7–9 (medical management criteria, methotrexate regimen, day 4 and day 7 human chorionic gonadotrophin follow-up)"
T = topic(
 id="2e78b8df-51bb-5597-92c9-9397d6783562", title=TITLE, specialty="Obstetrics & Gynaecology", authority="MoHFW", pillar="Urgent Care",
 scope="Women of reproductive age with a positive pregnancy test and pain or bleeding: recognising ectopic pregnancy, resuscitating rupture, and choosing expectant, medical (methotrexate) or surgical management. India has no dedicated national ectopic pregnancy guideline; clinical assessment and shock care follow the MoHFW safe abortion care (CAC) training and service delivery guidelines 2023, and thresholds and management criteria follow NICE NG126, with the methotrexate dose from the Oman Ministry of Health guideline (2021).",
 findings=[
  "Ectopic warning signs on examination (cervical motion tenderness, fornix tenderness, uterus smaller than dates), the role of ultrasound with quantitative beta human chorionic gonadotrophin (beta-hCG), and shock resuscitation checked against MoHFW CAC guidelines 2023, Chapters 4 and 6.",
  "Symptoms, signs, transvaginal ultrasound findings, 48-hour hCG interpretation, criteria for expectant, methotrexate and surgical management, salpingectomy versus salpingotomy, follow-up and anti-D rules checked against NICE NG126 recommendations 1.3–1.7.",
  "Single-dose methotrexate 50 mg/m² intramuscular, baseline tests, the day 4 to day 7 15% fall rule, second dose and post-treatment advice checked against the Oman Ministry of Health ectopic pregnancy guideline (2021), pp. 7–9.",
  "NICE and the Oman guideline use different hCG and size cut-offs for methotrexate; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "No Indian national ectopic pregnancy guideline could be opened; management thresholds are from NICE NG126 and the methotrexate dose from the Oman Ministry of Health guideline.",
  "NICE NG126 does not state a methotrexate dose; the 50 mg/m² dose is from the Oman guideline.",
  "Advice to avoid folic acid, alcohol and sun exposure after methotrexate is from the Oman guideline only.",
  "Analgesia doses and blood transfusion thresholds are not given in the cited sources; follow local protocols.",
  "Caesarean scar, cervical, interstitial and heterotopic pregnancy need specialist management not detailed here."],
 summary="An ectopic pregnancy implants outside the uterine cavity, usually in the fallopian tube. It cannot continue and can rupture, causing life-threatening intra-abdominal bleeding. Suspect it in any woman of reproductive age with a positive pregnancy test and abdominal pain, bleeding or collapse. Diagnosis combines transvaginal ultrasound with serial serum human chorionic gonadotrophin (hCG). Stable women with small, unruptured ectopics can be managed expectantly or with methotrexate; rupture, pain, a fetal heartbeat or high hCG need surgery (NICE NG126).",
 mechanisms=[
  "Tubal damage (infection, surgery, previous ectopic) delays transport of the embryo, which implants in the tube.",
  "The growing trophoblast erodes the thin tubal wall; rupture causes haemoperitoneum and shock.",
  "Blood irritating the diaphragm causes shoulder-tip pain; pelvic blood causes rectal pressure.",
  "Methotrexate stops trophoblast proliferation; success depends on low hCG and small mass size."],
 presentation={
  "symptoms": ["Abdominal or pelvic pain (NICE 1.3.3)", "Missed period or amenorrhoea (NICE 1.3.3)", "Vaginal bleeding with or without clots (NICE 1.3.3)", "Dizziness, fainting; shoulder-tip pain; rectal pressure or pain on defecation (NICE 1.3.3)"],
  "physicalSigns": ["Pelvic, adnexal or abdominal tenderness (NICE 1.3.4)", "Cervical motion tenderness; fullness or tenderness in the fornices (CAC 2023 p. 30)", "Uterus smaller than expected for dates (CAC 2023 p. 31)", "Pallor, tachycardia over 100/min, hypotension under 100/60 mmHg (NICE 1.3.4)"],
  "redFlags": ["Haemodynamic instability or collapse: immediate emergency referral (NICE 1.3.1)", "Signs of shock: pulse 110/min or more, systolic under 90 mmHg, rapid breathing, confusion (CAC 2023 p. 50)", "Peritonism, rebound tenderness or abdominal distension (NICE 1.3.4)", "Moderate to large free fluid on ultrasound (NICE 1.4.20)", "Increasing pain after methotrexate (Oman p. 9)"],
  "precipitants": ["Previous ectopic pregnancy or tubal surgery", "Pelvic inflammatory disease", "Pregnancy with an intrauterine device in place", "Assisted conception"]},
 differentials=[
  ("Miscarriage (threatened, incomplete or complete)", "Intrauterine pregnancy or retained products on ultrasound; uterus size matches or tissue at the os (NICE 1.4)."),
  ("Pregnancy of unknown location", "Positive test with no pregnancy seen on ultrasound; needs serial hCG 48 hours apart (NICE 1.4.26)."),
  ("Ruptured corpus luteum cyst", "Intrauterine pregnancy or negative hCG; cyst on ovary rather than a separate adnexal mass."),
  ("Pelvic inflammatory disease", "Fever, discharge, bilateral tenderness, negative pregnancy test (CAC 2023 p. 30)."),
  ("Appendicitis or ovarian torsion", "Pain pattern and ultrasound findings; pregnancy test may be negative.")],
 criteria=[
  ("Suggestive ultrasound (NICE 1.4.17)", "Adnexal mass moving separately from the ovary containing a yolk sac and/or fetal pole."),
  ("High probability ultrasound (NICE 1.4.18)", "Adnexal mass moving separately from the ovary with an empty sac, or a complex inhomogeneous adnexal mass."),
  ("48-hour hCG change in pregnancy of unknown location (NICE 1.4.29–1.4.31)", "Rise over 63%: likely intrauterine; fall over 50%: unlikely to continue; anything in between: review within 24 hours."),
  ("Surgery first line (NICE 1.6.9)", "Significant pain, or adnexal mass 35 mm or more, or fetal heartbeat visible, or hCG 5,000 IU/L or more."),
  ("Methotrexate offered (NICE 1.6.8)", "No significant pain, unruptured tubal ectopic under 35 mm with no heartbeat, hCG under 1,500 IU/L, no intrauterine pregnancy, able to return.")],
 ruleIn=[
  inv("laboratory", "Urine pregnancy test", "Bedside", "Pregnancy", "Negative", "Positive", "Positive test with pain or bleeding: think ectopic (CAC 2023 laboratory investigations).", "cac", "Chapter 4, p. 31 (laboratory investigations)"),
  inv("firstLineImaging", "Transvaginal ultrasound", "Pelvis", "Ectopic pregnancy", "Intrauterine gestational sac; normal adnexa", "Empty uterus with adnexal mass separate from the ovary; free fluid", "Locates the pregnancy; free fluid suggests haemoperitoneum (NICE 1.4.17–1.4.20).", "nice", N_DX, extra=("cac", CAC_EX)),
  inv("laboratory", "Serum beta-hCG, repeated after 48 hours", "Blood", "Trophoblast activity", "Under 5 IU/L when not pregnant", "Suboptimal rise or plateau; level guides management", "Do not use to locate the pregnancy; use to plan treatment and follow-up (NICE 1.4.24–1.4.31).", "nice", N_DX),
  inv("laboratory", "Haemoglobin", "Blood count", "Blood loss", "Female 12–15 g/dL", "Low after rupture", "Baseline before surgery or methotrexate (CAC 2023 laboratory investigations).", "cac", "Chapter 4, p. 31 (laboratory investigations)")],
 ruleOut=[
  inv("laboratory", "Blood group and Rh type", "Blood", "Rh-negative mother", "Rh positive (most women)", "Rh negative", "Rh-negative women having surgery need anti-D (NICE 1.7.1; CAC 2023).", "nice", N_AD),
  inv("laboratory", "Liver and kidney function, full blood count", "Blood", "Methotrexate eligibility", "Creatinine 0.5–1.1 mg/dL; ALT under 35 U/L; platelets 150–400 ×10⁹/L", "Abnormal results or platelets under 100 ×10⁹/L exclude methotrexate", "Required on day 0 before methotrexate (Oman p. 8–9).", "oman", OM)],
 management=[
  step("resus", "Resuscitate if unstable", "Immediately", ["Open airway, oxygen 6–8 L/min, two large-bore cannulas (CAC 2023 p. 50).", "Ringer lactate or normal saline 1 litre over 15–20 minutes; cross-match and transfuse as needed (CAC 2023 p. 50).", "Unstable: emergency surgery by the quickest route to stop bleeding; do not wait for scans (NICE 1.3.1)."]),
  step("diagnose", "Confirm the diagnosis", "Within hours", ["Transvaginal ultrasound by trained staff; serum hCG at baseline and 48 hours if pregnancy location is unknown (NICE 1.4).", "Blood group and Rh, haemoglobin, renal and liver function (NICE 1.7; Oman p. 9)."]),
  step("choose", "Choose management", "Same day", ["Surgery if significant pain, mass 35 mm or more, fetal heartbeat, or hCG 5,000 IU/L or more (NICE 1.6.9).", "Methotrexate if criteria in NICE 1.6.8 are met; offer a choice of methotrexate or surgery when hCG is 1,500 to under 5,000 IU/L (NICE 1.6.10).", "Expectant management if stable, pain-free, mass under 35 mm, no heartbeat and hCG 1,000 IU/L or less (NICE 1.6.3)."],
       branches=[("Surgery", ["Laparoscopy where possible (NICE 1.6.12).", "Salpingectomy unless the other tube is damaged; then consider salpingotomy (NICE 1.6.15–1.6.17)."]), ("Methotrexate", ["Single intramuscular dose; hCG on days 4 and 7 (Oman p. 9; NICE 1.6.11).", "Fall under 15% between day 4 and day 7: second dose or surgery (Oman p. 9)."])]),
  step("follow", "Follow-up", "Until hCG negative", ["After methotrexate: hCG weekly until negative (NICE 1.6.11).", "After salpingotomy: hCG at 7 days then weekly; after salpingectomy: urine pregnancy test at 3 weeks (NICE 1.6.18–1.6.19).", "Expectant: hCG on days 2, 4 and 7, then weekly until under 20 IU/L (NICE 1.6.5)."])],
 branches=[
  ("Medical management", "Stable, unruptured tubal ectopic meeting methotrexate criteria (NICE 1.6.8; Oman p. 7–8)."),
  ("Surgical management", "Rhesus-negative woman having surgery for ectopic pregnancy (NICE 1.7.1).")],
 regimens=[
  rx("Medical management", "Methotrexate", "Unruptured tubal ectopic pregnancy", "Adults", "Methotrexate", "50 mg/m² body surface area", "Intramuscular", "Single dose; repeat once if hCG falls less than 15% between day 4 and day 7", "Single dose (second dose if needed)", "Not applicable; adult obstetric dose.", NOT_ABX, "Do not use in renal disease; check creatinine first (Oman p. 8).", "Do not use in liver disease; check liver function first (Oman p. 8).", ["Serum hCG on days 4 and 7, then weekly until negative", "Pain: increasing pain needs urgent review"], ["Haemodynamic instability, fetal heartbeat, hCG over 5,000 IU/L, mass over 4 cm, platelets under 100 ×10⁹/L, breastfeeding, active infection (Oman p. 8)"], "oman", OM),
  rx("Surgical management", "Rhesus prophylaxis", "Rh-negative woman having surgery for ectopic pregnancy", "Adults", "Anti-D immunoglobulin", "250 IU (50 micrograms)", "Intramuscular", "Single dose", "Single dose", "Not applicable; adult obstetric dose.", NOT_ABX, NS, NS, ["Document dose and batch"], ["Not needed after medical management alone or for pregnancy of unknown location (NICE 1.7.2)"], "nice", N_AD)],
 medNote="Methotrexate 50 mg/m² single dose from the Oman Ministry of Health guideline (2021); eligibility from NICE NG126 1.6.8 and Oman. Anti-D 250 IU (50 micrograms) only for Rh-negative women having surgery (NICE 1.7.1; the MoHFW CAC guideline uses the same 50 microgram dose after abortion procedures). Not clinically reviewed.",
 comparison={"title": "Methotrexate eligibility: NICE vs Oman Ministry of Health", "columns": ["NICE NG126 (2019, updated 2023)", "Oman MoH guideline (2021)"], "rows": [
   {"parameter": "hCG ceiling", "values": ["Offer under 1,500 IU/L; choice with surgery from 1,500 to under 5,000 IU/L", "Under 5,000 IU/L"]},
   {"parameter": "Mass size", "values": ["Under 35 mm", "Under 4 cm"]},
   {"parameter": "Dose", "values": ["Not stated", "50 mg/m² intramuscular (1 mg/kg in selected cases)"]},
   {"parameter": "Anti-D after medical management", "values": ["Not needed", "Not prescribed"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Ectopic pregnancy in the emergency and gynaecology setting.", "learningObjectives": ["Suspect ectopic pregnancy in any woman with a positive test and pain or bleeding.", "Resuscitate rupture and get to theatre fast.", "Choose expectant, medical or surgical management by agreed criteria."],
  "keyPoints": ["Positive pregnancy test plus pain or bleeding: ectopic until proven otherwise.", "Shock: resuscitate and operate; do not wait for scans.", "Surgery if pain, mass 35 mm or more, heartbeat or hCG 5,000 IU/L or more.", "Methotrexate needs reliable follow-up with hCG on days 4 and 7."],
  "pitfalls": ["Dismissing shoulder-tip pain or diarrhoea in early pregnancy.", "Using a single hCG level to decide where the pregnancy is.", "Giving methotrexate before an intrauterine pregnancy is excluded.", "Forgetting anti-D for Rh-negative women having surgery."],
  "references": [tref("nice", N_DX + ", " + N_MX + ", " + N_AD), tref("cac", CAC_EX + "; " + CAC_SH), tref("oman", OM)]},
 nonClinical={"patientEducation": ["Return immediately for worse pain, fainting or heavy bleeding.", "After methotrexate: avoid alcohol, folic acid supplements and sun exposure during treatment; avoid pregnancy for at least 3 months (Oman p. 9).", "Future pregnancies need an early scan."], "lifestyleAndDiet": ["Avoid sexual intercourse during methotrexate treatment (Oman p. 9).", "Contraception counselling before discharge."], "mdtReferrals": ["Gynaecology for all suspected ectopic pregnancies", "Anaesthesia and blood bank for unstable patients"], "dischargeCriteria": ["Haemodynamically stable with pain controlled", "Follow-up hCG plan arranged"], "followUpPlan": "hCG on days 4 and 7 after methotrexate and then weekly until negative; urine pregnancy test 3 weeks after salpingectomy (NICE 1.6.11, 1.6.19)."})
save("t41_ectopic.json", [T])
