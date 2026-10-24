from h import *
TITLE = "Breast cancer screening and breast-lump referral (India)"
OF_T = "Table 1, p. 7 (screening age, interval, method, provider)"
OF_S = "Section 1, pp. 6–10 (screening at sub-centre and PHC, referral, breast awareness)"
OF_A = "Annexure 1a, p. 15 (breast cancer screening algorithm and notes)"
B_S = "sections Symptoms and signs, Red flags, Triple assessment, Investigations"
B_M = "sections Staging, Management of early, locally advanced and metastatic disease, Adjuvant therapy"
TL = "Indications and Usage; section Clinical Studies (NSABP B-14, B-24); section 4 Contraindications"
LL = "sections 2.1–2.6 Dosage, 4 Contraindications, 5.1–5.2 Warnings, 8.4 Pediatric use"
AL = "sections 2.1–2.2 Dosage, 4 Contraindications, 5.2–5.3 Warnings, 8.6–8.7 Special populations"
T = topic(
 id="50f7abe0-d431-5c25-98f0-b158d78653a4", title=TITLE, specialty="General Surgery / Oncology", authority="MoHFW", pillar="Planned Care",
 scope="Women in India aged 30–65 years in population-based screening, and any woman or man with a breast symptom: clinical breast examination (CBE), what counts as a positive screen, triple assessment, referral by level of care, and the treatment pathway after diagnosis, including adjuvant endocrine therapy that primary care may continue. Built on the MoHFW Operational Framework for Management of Common Cancers (2016) and the ICMR Standard Treatment Workflow for Breast Cancer (July 2020); endocrine drug doses from US labels where ICMR gives none.",
 findings=[
  "Screening women aged 30–65 years by CBE once every 5 years at sub-centres and Health and Wellness Centres by trained ANMs, referral of a palpable lump or nipple discharge to a surgeon at the CHC or district hospital, ultrasound confirmation, mammography from 35 years where available, and core biopsy preferred over fine needle aspiration cytology checked against the MoHFW Operational Framework 2016 (Table 1 p. 7; Section 1 pp. 6–10; Annexure 1a p. 15).",
  "Symptoms and signs, red flags (do not ignore breast change; no excision biopsy for diagnosis; no biopsy before imaging), triple assessment, receptor testing, staging, treatment by stage and endocrine therapy for hormone receptor-positive disease checked against the ICMR Breast Cancer STW (July 2020).",
  "Tamoxifen 20 mg/day for 5 years, letrozole 2.5 mg daily and anastrozole 1 mg daily with their renal, hepatic and monitoring statements checked against US prescribing information (DailyMed).",
  "The framework and the STW differ on the age to add mammography; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR STW does not say whether tamoxifen or an aromatase inhibitor is preferred after menopause; tamoxifen is marked preferred because it is listed first.",
  "Chemotherapy, trastuzumab and bone-modifying agent doses are not given in the STW and are oncology-initiated; they are not listed as medicine rows.",
  "Breast cancer risk factors and male breast cancer are not detailed in the framework sections used.",
  "Ultrasound age thresholds and BI-RADS categories are not stated in the ICMR STW.",
  "Mastitis and breast abscess management is not covered by the sources used."],
 summary="Breast cancer often presents late in India. The's national programme screens women aged 30–65 years with clinical breast examination every 5 years, because mammography is not available at scale. Any lump, nipple change or skin change needs triple assessment: clinical examination, imaging (ultrasound with or without mammography) and core needle biopsy. Early detection allows breast-conserving surgery and curative treatment (MoHFW 2016; ICMR STW 2020).",
 mechanisms=[
  "Malignant epithelial cells proliferate in the ducts or lobules and invade surrounding tissue, forming a hard, irregular lump.",
  "Invasion of skin and suspensory ligaments causes dimpling, peau d'orange, nipple retraction and ulceration (ICMR STW).",
  "Lymphatic spread involves axillary then supraclavicular nodes (ICMR STW).",
  "Hormone receptor-positive tumours depend on oestrogen, which is why tamoxifen and aromatase inhibitors work."],
 presentation={
  "symptoms": ["Breast lump, often painless (ICMR STW)", "Nipple discharge, especially bloody (MoHFW Annexure 1a)", "Change in breast shape or skin (ICMR STW)", "Bone pain, breathlessness, headache or jaundice in metastatic disease (ICMR STW)"],
  "physicalSigns": ["Hard irregular lump; asymmetry (ICMR STW)", "Skin dimpling, oedema, ulcer, satellite nodules; nipple retraction (ICMR STW)", "Axillary or supraclavicular lymph nodes (ICMR STW)", "Liver enlargement, pleural effusion, ascites (metastases) (ICMR STW)"],
  "redFlags": ["Any breast or nipple-areola change: do not ignore (ICMR STW)", "Skin ulceration, chest wall fixation, fixed axillary nodes (ICMR STW)", "Supraclavicular nodes (ICMR STW)", "Bone pain, jaundice or breathlessness in a woman with breast cancer (ICMR STW)"],
  "precipitants": ["Increasing age (screening yield higher over 40) (MoHFW Section 1)", "Family history of breast cancer", "Late first pregnancy, no breastfeeding", "Obesity after menopause"]},
 differentials=[
  ("Fibroadenoma", "Young woman; smooth, mobile, well-defined lump; benign on ultrasound and biopsy."),
  ("Breast cyst", "Smooth, fluctuant lump; fluid-filled on ultrasound."),
  ("Breast abscess or mastitis", "Painful, red, warm breast, often during breastfeeding; fever."),
  ("Fibrocystic change", "Cyclical tenderness and lumpiness that varies with the menstrual cycle.")],
 criteria=[
  ("Screening (MoHFW Table 1)", "Women 30–65 years; clinical breast examination once every 5 years by trained ANM or staff nurse."),
  ("Positive screen (MoHFW Annexure 1a)", "Palpable lump; suspicious nipple discharge also goes to the surgeon."),
  ("Triple assessment (ICMR STW)", "Clinical breast examination, breast and axillary ultrasound with mammography, and core needle biopsy."),
  ("Early breast cancer (ICMR STW)", "T1–2, N0–1, M0: surgery then adjuvant therapy; no metastatic work-up up to stage 2A."),
  ("Metastatic work-up (ICMR STW)", "Stage 2B or higher: chest X-ray, abdominal ultrasound, bone scan, contrast-enhanced computed tomography (CT) of chest and abdomen.")],
 ruleIn=[
  inv("laboratory", "Clinical breast examination", "Bedside", "Palpable lump or skin/nipple change", "No lump; symmetrical breasts; no nodes", "Lump, skin or nipple change, axillary nodes", "Screening test; a positive finding is referred to a surgeon at the CHC or district hospital (MoHFW Table 1; Annexure 1a).", "ofcc", OF_T, extra=("ofcc", OF_A)),
  inv("firstLineImaging", "Breast and axillary ultrasound", "Breast and axilla", "Solid or cystic lesion; nodes", "No focal lesion; normal nodes", "Solid irregular hypoechoic lesion; abnormal nodes", "First confirmatory test at surgeon review; benign lump: closer follow-up (MoHFW Annexure 1a; ICMR STW).", "ofcc", OF_A, extra=("brstw", B_S)),
  inv("firstLineImaging", "Bilateral mammography", "Breasts", "Malignancy", "No suspicious mass or calcification", "Spiculated mass, suspicious microcalcifications", "Part of triple assessment (ICMR STW: over 30 years; MoHFW: 35 years and above if available).", "brstw", B_S, extra=("ofcc", OF_A)),
  inv("specializedAdjunctive", "Core needle biopsy with ER, PR, HER2 and Ki-67", "Histopathology", "Breast cancer type and receptor status", "Benign breast tissue", "Invasive carcinoma; receptor status", "Preferred over fine needle aspiration; do it after imaging; send to medical college or accredited laboratory (ICMR STW; MoHFW Annexure 1a).", "brstw", B_S, extra=("ofcc", OF_A))],
 ruleOut=[
  inv("specializedAdjunctive", "Fluorescence in situ hybridisation (FISH) for HER2", "Histopathology", "HER2 amplification", "Not amplified", "Amplified", "When HER2 immunohistochemistry is 2+ (equivocal) (ICMR STW).", "brstw", B_S),
  inv("advancedImaging", "Metastatic work-up: chest X-ray, abdominal ultrasound, bone scan, contrast CT chest and abdomen", "Staging", "Distant metastases", "No metastases", "Lung, liver, bone or nodal metastases", "Stage 2B and above only (ICMR STW).", "brstw", B_M),
  inv("advancedImaging", "Breast magnetic resonance imaging (MRI)", "Breasts", "Extent of disease", "No enhancing lesion", "Multifocal or occult disease", "Selected cases only (ICMR STW).", "brstw", B_S)],
 management=[
  step("screen", "Screen", "Every 5 years, 30–65 years", ["CBE at sub-centre or Health and Wellness Centre; give breast health awareness (MoHFW Table 1; Section 1).", "Positive CBE: refer to surgeon at CHC or district hospital (MoHFW Annexure 1a)."]),
  step("assess", "Triple assessment", "Within weeks of referral", ["Ultrasound, then mammography where available, then core biopsy (ICMR STW; MoHFW Annexure 1a).", "Do not do excision biopsy for diagnosis; do not biopsy before imaging (ICMR STW)."]),
  step("result", "Act on the result", "On histology", ["Benign: return to routine screening; benign lump on ultrasound: closer follow-up at the surgeon's discretion (MoHFW Annexure 1a).", "Malignant: refer to medical college or regional cancer centre; multidisciplinary team review (MoHFW Annexure 1a; ICMR STW)."]),
  step("treat", "Treatment pathway (specialist)", "After staging", ["Early disease: breast-conserving surgery or modified radical mastectomy, sentinel node biopsy or axillary dissection, then adjuvant chemotherapy, radiotherapy, trastuzumab or endocrine therapy as indicated (ICMR STW).", "Hormone receptor-positive: endocrine therapy for at least 5 years, up to 10 if high risk (ICMR STW).", "Metastatic: palliative intent; sequential single-agent therapy (ICMR STW)."])],
 branches=[
  ("Premenopausal, hormone receptor-positive", "ER and/or PR positive breast cancer before menopause (ICMR STW)."),
  ("Postmenopausal, hormone receptor-positive", "ER and/or PR positive breast cancer after menopause (ICMR STW).")],
 regimens=[
  rx("Premenopausal, hormone receptor-positive", "Endocrine therapy", "Adjuvant therapy, hormone receptor-positive", "Premenopausal women", "Tamoxifen", "20 mg", "Oral", "Once daily", "At least 5 years; up to 10 years if high risk (ICMR STW)", "Not used for breast cancer in children.", NOT_ABX, "No renal statement in the label.", "Effect of liver impairment not determined (label).", ["Abnormal vaginal bleeding (endometrial cancer)", "Leg swelling or breathlessness (thrombosis)"], ["Pregnancy; for risk reduction: history of DVT/PE or warfarin use (label)"], "tam", TL),
  rx("Postmenopausal, hormone receptor-positive", "Endocrine therapy", "Adjuvant therapy, hormone receptor-positive", "Postmenopausal women", "Tamoxifen (postmenopausal)", "20 mg", "Oral", "Once daily", "At least 5 years; up to 10 years if high risk (ICMR STW)", "Not used for breast cancer in children.", NOT_ABX, "No renal statement in the label.", "Effect of liver impairment not determined (label).", ["Abnormal vaginal bleeding", "Thrombosis symptoms"], ["History of thromboembolism (caution)"], "tam", TL, sel="one-of", pref=True),
  rx("Postmenopausal, hormone receptor-positive", "Endocrine therapy", "Adjuvant therapy, hormone receptor-positive", "Postmenopausal women", "Letrozole", "2.5 mg", "Oral", "Once daily", "About 5 years (label); up to 10 years if high risk (ICMR STW)", "Safety in children not established (label 8.4).", NOT_ABX, "No adjustment if creatinine clearance 10 mL/min or more (label 2.6).", "Severe hepatic impairment with cirrhosis: 2.5 mg every other day (label 2.5).", ["Bone mineral density", "Serum cholesterol"], ["Premenopausal status (not indicated); pregnancy"], "let", LL, sel="one-of", pref=False, use="Specialist chooses an aromatase inhibitor, for example with thrombosis risk or endometrial concerns on tamoxifen."),
  rx("Postmenopausal, hormone receptor-positive", "Endocrine therapy", "Adjuvant therapy, hormone receptor-positive", "Postmenopausal women", "Anastrozole", "1 mg", "Oral", "Once daily", "5 years (label); up to 10 years if high risk (ICMR STW)", "Not effective in paediatric indications studied (label 8.4).", NOT_ABX, "No adjustment in renal impairment (label 2.1, 8.6).", "No adjustment in mild to moderate impairment or stable cirrhosis; not studied in severe impairment (label 8.7).", ["Bone mineral density", "Serum cholesterol"], ["Premenopausal status (not indicated); pregnancy"], "ana", AL, sel="one-of", pref=False, use="Specialist chooses an aromatase inhibitor and letrozole is unavailable or not tolerated.")],
 medNote="ICMR STW: tamoxifen for premenopausal women; tamoxifen or an aromatase inhibitor after menopause, for at least 5 years and up to 10 if high risk. Doses from US labels: tamoxifen 20 mg/day, letrozole 2.5 mg daily, anastrozole 1 mg daily. Premenopausal women with metastatic disease need ovarian suppression (ICMR STW). Endocrine therapy is started by the oncology team; primary care continues it and watches for side effects. Not clinically reviewed.",
 comparison={"title": "Imaging in breast assessment: MoHFW framework vs ICMR STW", "columns": ["MoHFW Operational Framework (2016)", "ICMR Breast Cancer STW (2020)"], "rows": [
   {"parameter": "First imaging test", "values": ["Breast ultrasound at surgeon review", "Breast and axillary ultrasound with mammography"]},
   {"parameter": "Mammography", "values": ["35 years and above, if available", "Bilateral, for women over 30"]},
   {"parameter": "Biopsy", "values": ["Core biopsy preferred; fine needle cytology if core not possible; excision biopsy listed at district hospital", "Core needle biopsy preferred; no excision biopsy for diagnosis"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Breast cancer screening and early detection in Indian primary and secondary care.", "learningObjectives": ["Perform and act on clinical breast examination.", "Organise triple assessment and referral.", "Support women on adjuvant endocrine therapy."],
  "keyPoints": ["Women 30–65: clinical breast examination every 5 years.", "Any lump: ultrasound, mammography where available, core biopsy.", "Never excision biopsy for diagnosis; never biopsy before imaging.", "Hormone receptor-positive: endocrine therapy at least 5 years."],
  "pitfalls": ["Reassuring a woman with a lump without imaging and biopsy.", "Doing a lumpectomy for diagnosis.", "Missing axillary or supraclavicular nodes.", "Stopping tamoxifen early because of side effects without discussion."],
  "references": [tref("ofcc", OF_T + "; " + OF_S + "; " + OF_A), tref("brstw", B_S + "; " + B_M), tref("tam", TL), tref("let", LL), tref("ana", AL)]},
 nonClinical={"patientEducation": ["Know how your breasts normally look and feel; report any lump, skin or nipple change.", "A lump is not always cancer, but it must be checked.", "On tamoxifen: report abnormal vaginal bleeding or leg swelling."], "lifestyleAndDiet": ["Healthy weight and physical activity.", "Limit alcohol; avoid tobacco."], "mdtReferrals": ["Surgeon at CHC or district hospital for positive CBE (MoHFW)", "Medical college or regional cancer centre for confirmed cancer (MoHFW)", "Multidisciplinary tumour board (ICMR STW)"], "dischargeCriteria": ["Benign result explained and return to 5-yearly screening (MoHFW Annexure 1a)"], "followUpPlan": "Screen again in 5 years if normal; benign lump: follow-up at surgeon's discretion; cancer: oncology follow-up and endocrine therapy monitoring (MoHFW Annexure 1a; ICMR STW)."})
save("t47_breast.json", [T])
