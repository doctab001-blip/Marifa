from h import *
HM = "sections History and examination, Investigations, Endometrial thickness pathway, Acute heavy bleeding, Medical treatment, Surgical options, Referral"
MF = "sections 2.3, 4, 5.6, 8.6; Boxed Warning"
TITLE = "Heavy menstrual bleeding (India)"
ADOL = "Adolescents: not specified in the ICMR STW; seek gynaecology advice."
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Gynaecology / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Women with heavy menstrual bleeding (HMB) in India: assessment, anaemia and endometrial pathology work-up, control of acute heavy bleeding, medical and surgical treatment, and referral. Built on the ICMR Heavy Menstrual Bleeding workflow (December 2025), with the mefenamic acid dose from its US label.",
 findings=[
  "History, examination, pictorial blood assessment chart, investigations, 12 mm endometrial thickness cut-off, age-40 sampling pathway, cancer risk factors, acute tranexamic acid regimen, transfusion threshold, norethisterone and medroxyprogesterone regimens, levonorgestrel intrauterine system (LNG-IUS), surgical options and referral checked against the ICMR HMB STW (December 2025).",
  "Mefenamic acid dose taken from the US label (dysmenorrhoea dosing) because the ICMR STW gives none.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR STW does not define HMB or use the PALM-COEIN classification.",
  "Combined oral contraceptive, iron and non-steroidal anti-inflammatory drug (NSAID) doses are not given in the STW and are not dosed here.",
  "Gonadotrophin-releasing hormone (GnRH) analogues are not mentioned in the STW.",
  "Some flowchart branches of the STW are ambiguous; the age-40 and 12 mm pathways are summarised as read."],
 summary="Heavy menstrual bleeding is a common cause of iron-deficiency anaemia in Indian women. Causes include fibroids, polyps, adenomyosis, endometrial hyperplasia or cancer, ovulatory dysfunction, thyroid disease, bleeding disorders and intrauterine devices. Assessment aims to exclude pregnancy, measure the anaemia, find structural or endometrial pathology (ultrasound endometrial thickness and sampling by age and risk) and treat medically before surgery, especially in younger women (ICMR STW). Acute heavy bleeding with haemoglobin below 7 g/dL needs transfusion and referral.",
 mechanisms=[
  "Structural lesions (fibroids, polyps, adenomyosis) enlarge the bleeding surface and impair contraction.",
  "Anovulation leaves unopposed oestrogen, thickening the endometrium (hyperplasia risk).",
  "Increased local fibrinolysis in the endometrium; tranexamic acid blocks it.",
  "Bleeding disorders and anticoagulants impair haemostasis."],
 presentation={
  "symptoms": ["Heavy or prolonged periods; clots; flooding", "Irregular periods (ICMR STW history)", "Tiredness and breathlessness from anaemia", "Pain with bleeding"],
  "physicalSigns": ["Pallor — mild, moderate or severe (ICMR STW)", "Tachycardia, low blood pressure in acute bleeding", "Abdominal or pelvic mass (fibroid) (ICMR STW)", "Thyroid, liver or bleeding signs (ICMR STW)"],
  "redFlags": ["Haemoglobin below 7 g/dL or ongoing heavy blood loss: transfuse and refer (ICMR STW)", "Atypical hyperplasia or malignancy on sampling (ICMR STW)", "Postmenopausal bleeding (ICMR STW sampling pathway)", "No relief or recurrence despite treatment (ICMR STW)"],
  "precipitants": ["Intrauterine contraceptive device (ICMR STW history)", "Thyroid disorder (ICMR STW)", "Bleeding disorder or anticoagulants (ICMR STW)", "Obesity, polycystic ovaries, diabetes, low parity (endometrial cancer risk) (ICMR STW)"]},
 differentials=[
  ("Pregnancy-related bleeding", "Positive pregnancy test — exclude first (ICMR STW)."),
  ("Fibroids or polyps", "Mass or cavity lesion on ultrasound (ICMR STW)."),
  ("Endometrial hyperplasia or cancer", "Thick endometrium, age over 40 or risk factors; sampling (ICMR STW)."),
  ("Bleeding disorder", "Abnormal bleeding or clotting time; family history (ICMR STW)."),
  ("Hypothyroidism", "Raised thyroid-stimulating hormone (TSH) (ICMR STW).")],
 criteria=[
  ("Transfuse and refer (ICMR STW)", "Haemoglobin below 7 g/dL or acute ongoing blood loss."),
  ("Endometrial thickness (ICMR STW)", "Ultrasound cut-off 12 mm; above 12 mm or high cancer risk (low parity, obesity, polycystic ovaries, diabetes) leads to sampling."),
  ("Endometrial sampling (ICMR STW)", "Thickened endometrium, hyperplasia or atypical hyperplasia; pathways split at age 40 and for postmenopausal women."),
  ("Hysterectomy (ICMR STW)", "No relief after 3–6 months of medical treatment; conservative treatment first, especially in younger women.")],
 ruleIn=[
  inv("laboratory", "Haemoglobin and complete blood count with peripheral smear", "Blood tests", "Anaemia", "Haemoglobin 12–15 g/dL (women)", "Below 7 g/dL: transfuse and refer", "Severity of blood loss (ICMR STW).", "hmb", HM),
  inv("firstLineImaging", "Ultrasound abdomen and pelvis", "Ultrasound", "Fibroids, polyps, endometrial thickness", "Normal uterus; endometrium under 12 mm", "Fibroid, polyp, endometrium 12 mm or more", "Decides sampling pathway (ICMR STW).", "hmb", HM),
  inv("specializedAdjunctive", "Endometrial sampling with histopathology", "Biopsy or curettage", "Hyperplasia or cancer", "Benign endometrium", "Hyperplasia, atypia or malignancy", "Thick endometrium, age over 40, postmenopausal or high risk (ICMR STW).", "hmb", HM)],
 ruleOut=[
  inv("laboratory", "Urine pregnancy test", "Urine hCG", "Pregnancy", "Negative", "Positive", "Exclude pregnancy in every woman of reproductive age (ICMR STW).", "hmb", HM),
  inv("laboratory", "Thyroid-stimulating hormone (TSH)", "Blood test", "Thyroid disorder", "0.4–4.0 mIU/L", "Raised or low", "Treat thyroid disease as a cause (ICMR STW).", "hmb", HM),
  inv("laboratory", "Bleeding time, clotting time, liver and kidney function, blood group", "Blood tests", "Bleeding disorder; transfusion readiness", "Normal bleeding and clotting times", "Prolonged times; abnormal liver function", "Basic tests (ICMR STW).", "hmb", HM)],
 management=[
  step("acute", "Acute heavy bleeding", "Immediately", ["IV tranexamic acid 1 g slowly, then oral tranexamic acid (ICMR STW).", "Transfuse if haemoglobin below 7 g/dL; refer to a higher centre (ICMR STW)."]),
  step("assess", "Assess", "First visit", ["Exclude pregnancy (with consent), then speculum and pelvic examination (ICMR STW).", "Haemoglobin, smear, bleeding and clotting times, TSH, ultrasound (ICMR STW).", "Endometrial sampling by thickness, age and risk (ICMR STW)."]),
  step("medical", "Medical treatment", "3–6 months", ["Tranexamic acid during heavy days; add mefenamic acid if painful (ICMR STW).", "Cyclical norethisterone or medroxyprogesterone from day 5 for 3 weeks, 4–6 cycles; or LNG-IUS (ICMR STW).", "Combined oral contraceptives where contraception is wanted; haematinics; treat thyroid or bleeding disorders (ICMR STW).", "Counselling is an important adjunct (ICMR STW)."]),
  step("surgery", "Surgical options", "If medical treatment fails", ["Hysteroscopy-guided procedures, endometrial ablation (ICMR STW).", "Hysterectomy if no relief after 3–6 months of medical treatment (ICMR STW).", "Refer atypical hyperplasia or malignancy (ICMR STW)."])],
 branches=[
  ("Acute heavy bleeding", "Ongoing heavy bleeding needing urgent control (ICMR STW)."),
  ("Medical treatment — non-hormonal", "HMB, during bleeding days (ICMR STW)."),
  ("Medical treatment — hormonal", "HMB not controlled by non-hormonal treatment, or no obvious cause; 4–6 cycles (ICMR STW).")],
 regimens=[
  rx("Acute heavy bleeding", "IV antifibrinolytic", "Acute heavy menstrual bleeding", "Women", "Tranexamic acid (IV)", "1 g", "IV, slowly", "Single (stat) dose", "Then oral tranexamic acid", ADOL, NOT_ABX, "Reduce dose in kidney impairment; check the formulary.", NS, ["Bleeding; haemoglobin"], ["Active thromboembolism or history of thrombosis"], "hmb", HM),
  rx("Acute heavy bleeding", "Oral antifibrinolytic (continuation)", "After IV dose", "Women", "Tranexamic acid (oral)", "0.5–1 g", "Oral", "Every 6–8 hours", "5 days", ADOL, NOT_ABX, "Reduce dose in kidney impairment.", NS, ["Bleeding"], ["Thromboembolism history"], "hmb", HM),
  rx("Medical treatment — non-hormonal", "Antifibrinolytic", "HMB", "Women", "Tranexamic acid", "0.5–1 g", "Oral", "Every 6–8 hours on heavy days", "During bleeding; review after 3 cycles", ADOL, NOT_ABX, "Reduce dose in kidney impairment.", NS, ["Pictorial blood assessment chart", "Haemoglobin"], ["Thromboembolism history"], "hmb", HM),
  rx("Medical treatment — non-hormonal", "Add for painful periods", "HMB with pain", "Women", "Mefenamic acid", "500 mg first dose, then 250 mg", "Oral", "Every 6 hours from start of bleeding", "During bleeding days", "Label: established for primary dysmenorrhoea in adolescents.", NOT_ABX, "Do not use with significant kidney impairment (label 8.6).", "May need lower dose; stop if liver tests worsen (label 5.3).", ["Gastrointestinal symptoms"], ["Aspirin or NSAID allergy, asthma; peptic ulcer or bleeding; after coronary artery bypass grafting (label 4; boxed warning)"], "mef", MF),
  rx("Medical treatment — hormonal", "Progestogen or LNG-IUS", "HMB", "Women", "Norethisterone", "Up to 40 mg/day in divided doses", "Oral", "From day 5 of the cycle for 3 weeks", "4–6 cycles", ADOL, NOT_ABX, NS, "Avoid in active liver disease.", ["Bleeding pattern", "Weight, mood"], ["Pregnancy; thromboembolism; liver tumour"], "hmb", HM, sel="one-of", pref=True),
  rx("Medical treatment — hormonal", "Progestogen or LNG-IUS", "HMB", "Women", "Medroxyprogesterone acetate", "Up to 40 mg/day", "Oral", "From day 5 of the cycle for 3 weeks", "4–6 cycles", ADOL, NOT_ABX, NS, "Avoid in active liver disease.", ["Bleeding pattern"], ["Pregnancy; thromboembolism"], "hmb", HM, sel="one-of", pref=False, use="Norethisterone unavailable or not tolerated."),
  rx("Medical treatment — hormonal", "Progestogen or LNG-IUS", "HMB", "Women", "Levonorgestrel intrauterine system (LNG-IUS)", "One device per product", "Intrauterine", "Continuous", "Per product; hormonal therapy reviewed at 6 months (ICMR STW)", ADOL, NOT_ABX, "No change.", "Avoid in active liver disease.", ["Bleeding pattern; device position"], ["Pregnancy; distorted cavity; pelvic infection"], "hmb", HM, sel="one-of", pref=False, use="Long-term control or contraception wanted (ICMR STW alternative to oral progestogens).")],
 medNote="Tranexamic acid, norethisterone, medroxyprogesterone and LNG-IUS from the ICMR HMB STW (December 2025); mefenamic acid dose from its US label. Norethisterone gives the best haemostasis among progestogens (ICMR STW). Iron, combined pill and NSAID doses are not given in the STW. Not clinically reviewed.",
 teaching={"scope": "Heavy menstrual bleeding.", "learningObjectives": ["Assess HMB and anaemia.", "Know when to sample the endometrium.", "Use tranexamic acid and progestogens correctly."],
  "keyPoints": ["Exclude pregnancy first.", "Haemoglobin below 7 g/dL: transfuse and refer.", "Endometrium 12 mm or more, age over 40 or risk factors: sample.", "Medical treatment for 3–6 months before hysterectomy."],
  "pitfalls": ["Missing endometrial cancer in an obese diabetic woman over 40.", "Hysterectomy without trying medical treatment in young women.", "Tranexamic acid with a thrombosis history.", "Forgetting thyroid and bleeding disorders."],
  "references": [tref("hmb", HM), tref("mef", MF)]},
 nonClinical={"patientEducation": ["Keep a bleeding chart (pictorial blood assessment chart).", "Take iron as advised.", "Seek urgent care for fainting or soaking a pad every hour."], "lifestyleAndDiet": ["Iron-rich foods", "Weight reduction if overweight (endometrial risk)"], "mdtReferrals": ["Gynaecology for failed treatment, hyperplasia or surgery", "Haematology for bleeding disorders"], "dischargeCriteria": ["Bleeding controlled", "Haemoglobin stable or transfused", "Sampling result plan in place"], "followUpPlan": "Review after 3 cycles of medical treatment; hormonal therapy for 6 months if no obvious cause; refer if no relief or recurrence (ICMR STW)."})
save("t39_hmb.json", [T])
