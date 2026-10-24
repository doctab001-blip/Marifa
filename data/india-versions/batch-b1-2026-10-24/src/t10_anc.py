from h import *
NA = "Not applicable: antenatal care."
TITLE = "Antenatal care for normal pregnancy (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Obstetrics / Primary Care", authority="ICMR", pillar="Safe Birth",
 scope="Antenatal care of women with a normal pregnancy in Indian public and private facilities, built on the ICMR Antenatal Management of Normal Pregnancy workflow (December 2025): visit schedule, tests, supplements, immunisation, danger signs and high-risk referral.",
 findings=[
  "First, second, third and fourth visit history, examination, actions, investigations, supplements, Td schedule, iron sucrose limits, birth preparedness, counselling, danger signs, high-risk criteria and fundal height table checked against the ICMR STW (December 2025).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow states folic acid and IFA tablets without tablet strengths; strengths follow the national programme supply and must be confirmed.",
  "GDM testing details are in the separate GDM topic (MoHFW 2018).",
  "Normal values are typical pregnancy values; local laboratory ranges apply."],
 summary="Antenatal care aims to keep mother and baby healthy, detect complications early and plan a safe institutional birth. Pregnancy raises plasma volume more than red-cell mass, increases iron and folate needs, and shifts metabolism towards insulin resistance; in India anaemia, hypertensive disorders, gestational diabetes and infections remain leading causes of maternal and perinatal harm. The ICMR workflow sets out at least four contacts — the first ideally in the first trimester, then the second trimester, 28–34 weeks and 36–40 weeks — with defined history, examination, tests, supplements (folic acid, iron-folic acid, calcium with vitamin D, deworming), tetanus-diphtheria (Td) immunisation, counselling on danger signs and birth preparedness, and referral of high-risk pregnancies to a district hospital or medical college (ICMR STW 2025).",
 mechanisms=[
  "Plasma volume expansion and higher iron demand cause anaemia if stores are low.",
  "Placental hormones increase insulin resistance in later pregnancy.",
  "Abnormal placentation underlies pre-eclampsia and growth restriction.",
  "Folate deficiency around conception raises neural tube defect risk."],
 presentation={
  "symptoms": ["Missed period; nausea and vomiting", "Quickening and fetal movements from mid-pregnancy", "Excessive vomiting or vaginal bleeding need assessment (ICMR STW)"],
  "physicalSigns": ["Weight and BMI; pallor; pedal oedema (ICMR STW)", "Blood pressure, pulse, respiratory rate, temperature", "Fundal height matching gestational age", "Fetal heart sounds"],
  "redFlags": ["Vaginal bleeding: examine per abdomen and speculum and refer to CHC or higher (ICMR STW)", "Severe headache, blurred vision or convulsions (ICMR STW)", "Reduced or absent fetal movements after 28 weeks (ICMR STW)", "Leaking fluid, fever, breathlessness at rest, reduced urine or burning micturition, generalised itching (ICMR STW)", "Haemoglobin below 7 g/dL: refer (ICMR STW)"],
  "precipitants": ["Age above 35 or below 19 years; parity above 4 (ICMR STW)", "BMI below 18.5 or above 30 kg/m² (ICMR STW)", "Previous caesarean, PPH or obstetric complication (ICMR STW)", "Medical illness: diabetes, hypertension, heart disease, TB, epilepsy (ICMR STW)"]},
 differentials=[
  ("Ectopic pregnancy", "Early pregnancy with pain or bleeding; refer urgently."),
  ("Hyperemesis gravidarum", "Persistent vomiting with dehydration (danger sign, ICMR STW)."),
  ("Pre-eclampsia", "BP above 140/90 mmHg on two readings 6 hours apart with or without proteinuria (ICMR STW high-risk)."),
  ("Fundal height–dates discrepancy", "More than 4 weeks: wrong dates, growth restriction, multiple pregnancy or polyhydramnios (ICMR STW).")],
 criteria=[
  ("High-risk pregnancy (ICMR STW)", "Medical illness, previous caesarean, past obstetric complication or congenital malformation, past PPH, age above 35 or below 19, parity above 4, BMI below 18.5 or above 30, haemoglobin below 7 g/dL, BP above 140/90 mmHg twice 6 hours apart, APH, fundal height discrepancy above 4 weeks, GDM or overt diabetes, multiple pregnancy, malpresentation at term, previous uterine surgery."),
  ("Iron dosing threshold (ICMR STW)", "One IFA tablet daily if haemoglobin above 11 g%; two daily if below 11 g%."),
  ("Parenteral iron (ICMR STW)", "Non-adherent or haemoglobin below 9 g/dL in the third trimester: iron sucrose; haemoglobin below 7 g/dL: refer."),
  ("Fundal height (ICMR STW)", "24 weeks at the umbilicus; 36 weeks at the xiphisternum; 12 weeks just palpable above the symphysis.")],
 ruleIn=[
  inv("laboratory", "Haemoglobin", "Complete blood count", "Anaemia", "11 g/dL or above in pregnancy", "Below 11 g/dL (two IFA daily); below 9 (iron sucrose); below 7 (refer)", "Essential at every visit (ICMR STW).", "anc", "sections First visit and Third and fourth visits"),
  inv("laboratory", "Urine routine and albumin", "Urine microscopy and dipstick", "Infection, pre-eclampsia", "No protein; no pus cells", "Proteinuria or pyuria", "Essential at the first visit; urine albumin at later visits (ICMR STW).", "anc", "sections First and second visits"),
  inv("laboratory", "ABO and Rh grouping", "Blood group", "Rh-negative mother", "Not applicable — classification test", "Rh negative", "Essential at the first visit (ICMR STW).", "anc", "section First visit"),
  inv("laboratory", "VDRL/RPR, HIV and HBsAg", "Serology", "Syphilis, HIV, hepatitis B", "Non-reactive", "Reactive", "Desirable at the first visit; counsel on HIV testing (ICMR STW).", "anc", "section First visit"),
  inv("laboratory", "DIPSI glucose test", "75 g single-step test", "Gestational diabetes", "2-hour glucose below 140 mg/dL", "2-hour glucose ≥140 mg/dL", "First visit, then after 24 weeks at least 4 weeks after the first test (ICMR STW).", "anc", "sections First and second visits"),
  inv("firstLineImaging", "Level II ultrasound", "Anomaly scan", "Gross congenital malformation", "No structural anomaly", "Structural anomaly", "Desirable at 18–20 weeks (ICMR STW).", "anc", "section Second visit")],
 ruleOut=[
  inv("laboratory", "Blood pressure (sitting)", "Sphygmomanometer", "Hypertensive disorders", "Below 140/90 mmHg", "≥140/90 mmHg on two occasions 6 hours apart", "High-risk criterion; refer (ICMR STW).", "anc", "sections Second visit and High-risk criteria"),
  inv("laboratory", "TSH (high-risk women)", "Thyroid stimulating hormone", "Hypothyroidism", "Trimester-specific laboratory reference", "Raised TSH", "For bad obstetric history, goitre, obesity or iodine-deficient areas (ICMR STW).", "anc", "section First visit")],
 management=[
  step("visit-1", "First visit", "Preferably first trimester", ["History: LMP and EDD, parity, complaints, medical and family history, consanguinity, tobacco and alcohol (ICMR STW).", "Examination: height, weight, BMI, pallor, oedema, vital signs, thyroid, breasts, chest, heart, abdomen; speculum and vaginal examination (ICMR STW).", "Register: Mother and Child Protection card, RCH portal entry and number; give the Safe Motherhood booklet (ICMR STW).", "Start folic acid; give the first Td dose (or a single booster if a first dose was given within 3 years) (ICMR STW)."]),
  step("visit-2", "Second visit", "Second trimester", ["Ask about quickening, fetal movements and adherence; check weight, pallor, oedema, BP, fundal height and fetal heart (ICMR STW).", "Start IFA and calcium with vitamin D (never taken together); single albendazole 400 mg; second Td dose at least 4 weeks after the first (ICMR STW).", "Refer if haemoglobin does not rise after 4 weeks of oral iron (ICMR STW).", "Discuss birth preparedness (ICMR STW)."]),
  step("visits-3-4", "Third and fourth visits", "28–34 weeks and 36–40 weeks", ["Record gestation, fetal heart, abdominal girth and symphysio-fundal height (ICMR STW).", "Continue IFA and calcium; iron sucrose if non-adherent or haemoglobin below 9 g/dL; refer if below 7 g/dL (ICMR STW).", "Refer for fundal height–dates discrepancy or any danger sign (ICMR STW)."]),
  step("counsel", "Counselling and birth preparedness", "Every visit", ["Next visit timing by risk; rest, balanced diet and exercise; HIV testing; danger signs; institutional delivery; exclusive breastfeeding for 6 months; postpartum contraception (ICMR STW).", "Plan the delivery facility, birth companion, emergency transport with a phone number and blood donors (ICMR STW)."], [("High-risk pregnancy", ["Antenatal care and delivery at a district hospital or medical college (ICMR STW)."])])],
 branches=[
  ("Routine supplements", "All pregnant women."),
  ("Td immunisation", "All pregnant women."),
  ("Anaemia in the third trimester", "Haemoglobin below 9 g/dL or non-adherent to oral iron at 28–40 weeks.")],
 regimens=[
  rx("Routine supplements", "Folic acid", "Prevent neural tube defects", "All pregnant women from the first visit", "Folic acid", "One tablet (strength per national supply; not stated in the ICMR STW)", "Oral", "Once daily", "From the first visit until IFA starts", NA, NOT_ABX, NS, NS, ["Adherence"], ["None specific in the cited source"], "anc", "section First visit actions"),
  rx("Routine supplements", "Iron-folic acid", "Prevent and treat anaemia", "Pregnant women from the second trimester", "Iron-folic acid (IFA) tablet", "One tablet if haemoglobin above 11 g%; two tablets if below 11 g%", "Oral, with water or lemon juice", "Daily", "Through pregnancy", NA, NOT_ABX, NS, NS, ["Haemoglobin; refer if no rise after 4 weeks"], ["Do not take with calcium (ICMR STW)"], "anc", "section Second visit actions"),
  rx("Routine supplements", "Calcium", "Calcium supplementation", "Pregnant women from the second trimester", "Calcium carbonate with vitamin D", "Calcium carbonate 500 mg with vitamin D 250 units", "Oral, with meals", "Twice daily", "Through pregnancy", NA, NOT_ABX, NS, NS, ["Adherence"], ["Do not take with IFA (ICMR STW)"], "anc", "section Second visit actions"),
  rx("Routine supplements", "Deworming", "Soil-transmitted helminths", "Pregnant women in the second trimester", "Albendazole", "400 mg", "Oral", "Single dose", "Once", NA, NOT_ABX, NS, NS, ["None"], ["First trimester (given in the second trimester per ICMR STW)"], "anc", "section Second visit actions"),
  rx("Td immunisation", "Vaccine", "Prevent maternal and neonatal tetanus and diphtheria", "Pregnant women", "Tetanus-diphtheria (Td) vaccine", "First dose at the first visit; second dose at least 4 weeks later; single booster if a first dose was given within the last 3 years", "IM", "Two doses or one booster", "This pregnancy", NA, NOT_ABX, NS, NS, ["Record on the MCP card"], ["Severe allergy to a previous dose"], "anc", "sections First and second visit actions"),
  rx("Anaemia in the third trimester", "Parenteral iron", "Haemoglobin below 9 g/dL or non-adherence", "Pregnant women at 28–40 weeks", "Iron sucrose", "Not more than 200 mg per dose", "IV", "Not more than 3 times a week", "Until the calculated deficit is replaced", NA, NOT_ABX, NS, NS, ["Haemoglobin", "Observe for reactions during infusion"], ["Haemoglobin below 7 g/dL: refer instead (ICMR STW)"], "anc", "section Third and fourth visit actions")],
 medNote="Doses and schedules are from the ICMR Antenatal Management of Normal Pregnancy STW (December 2025). Tablet strengths for folic acid and IFA follow the national programme supply. India-only topic; no Saudi topic is affected. Not clinically reviewed.",
 teaching={"scope": "Routine antenatal care in India.", "learningObjectives": ["Run each antenatal visit to the ICMR schedule.", "Prescribe supplements and Td correctly.", "Identify danger signs and high-risk pregnancy for referral."],
  "keyPoints": ["Two IFA tablets daily if haemoglobin is below 11 g%.", "Never give calcium and IFA together.", "Iron sucrose no more than 200 mg per dose, 3 times a week.", "Refer haemoglobin below 7 g/dL."],
  "pitfalls": ["Missing danger signs at routine visits.", "Giving calcium with iron.", "Not registering on the RCH portal.", "Delivering high-risk women at a facility without specialist care."],
  "references": [tref("anc", "sections First visit, Second visit, Third and fourth visits, Birth preparedness, Counselling, Danger signs, High-risk criteria, Fundal height table")]},
 nonClinical={"patientEducation": ["Know the danger signs and go to a facility at once (ICMR STW).", "Plan birth: facility, companion, transport, blood donors (ICMR STW).", "Exclusive breastfeeding for 6 months (ICMR STW)."], "lifestyleAndDiet": ["Rest, balanced diet and exercise (ICMR STW).", "Take IFA with water or lemon juice, not with calcium (ICMR STW).", "Avoid tobacco and alcohol."], "mdtReferrals": ["CHC or higher for bleeding (ICMR STW)", "District hospital or medical college for high-risk pregnancy (ICMR STW)"], "dischargeCriteria": ["Not applicable to outpatient visits; each visit ends with the next appointment and danger-sign counselling"], "followUpPlan": "At least four antenatal contacts: first trimester, second trimester, 28–34 weeks and 36–40 weeks, with more visits by risk (ICMR STW)."})
save("t10_anc.json", [T])
