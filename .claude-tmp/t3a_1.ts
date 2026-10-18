import { cite, type Ref, type Spec } from "./common.ts";
import { inv, noDrug, localDrug, reg, teachOf } from "./tier3-helpers.ts";

const ICMR: Ref = { title: "Standard Treatment Workflow (STW) for the Management of Neck Space Infection (ICMR / Department of Health Research, Government of India, October 2019)", url: "https://icmr.gov.in/icmrobject/uploads/STWs/1725952350_ent_neck_space_infection.pdf" };
const EYEEAR: Ref = { title: "Peri-Tonsillar Abscess (Quinsy) Clinical Practice Guideline CPG27.0 v2.0, Royal Victorian Eye and Ear Hospital Emergency Department (approved 2 January 2019)", url: "https://eyeandear.org.au/wp-content/uploads/2021/11/Peri-Tonsillar-Abscess-Quinsy-Clinical-Practice-Guideline.pdf" };
const CG71: Ref = { title: "NICE CG71: Familial hypercholesterolaemia: identification and management", url: "https://www.nice.org.uk/guidance/cg71/resources/familial-hypercholesterolaemia-identification-and-management-pdf-975623384005" };
const NG42: Ref = { title: "NICE NG42: Motor neurone disease: assessment and management", url: "https://nice.org.uk/guidance/ng42/resources/motor-neurone-disease-assessment-and-management-1837449470149" };
const SPCG: Ref = { title: "Scottish Palliative Care Guidelines: Symptom control in the last days of life (Right Decisions)", url: "https://rightdecisions.scot.nhs.uk/scottish-palliative-care-guidelines/end-of-life-care/care-in-the-last-days-of-life/management/symptom-control-in-the-last-days-of-life" };
const NIVW: Ref = { title: "NHS Lanarkshire: Guidance for Withdrawal of Non-invasive Respiratory Support v1.0 (approved 15 May 2024)", url: "https://www.rightdecisions.scot.nhs.uk/media/ugajgkze/withdrawal-of-non-invasive-respiratory-support.pdf" };

const icmr = (loc: string) => cite(ICMR, `ICMR Neck Space Infection STW 2019, Section ${loc}`);
const eye = (loc: string) => cite(EYEEAR, `RVEEH CPG27.0 v2.0 2019, ${loc}`);
const cg71 = (loc: string) => cite(CG71, `NICE CG71, ${loc}`);
const ng42 = (loc: string) => cite(NG42, `NICE NG42, ${loc}`);

export const specs: Spec[] = [
  {
    key: "deep-neck", draftTitle: "Deep Neck Space Infections and Quinsy: Airway Risk and Referral", pillar: "Urgent Care", authority: "Other",
    scope: "Adult deep neck space infection and peritonsillar abscess (quinsy): airway-risk recognition, imaging, drainage, antibiotics and referral, from an Indian national workflow and an Australian hospital guideline.",
    unverified: [
      "No Saudi national or NICE guideline for deep neck space infection or quinsy was opened.",
      "The ICMR workflow names antibiotic classes but gives no doses; doses come only from the Royal Victorian Eye and Ear Hospital guideline (Australian practice).",
      "The Eye and Ear guideline's dexamethasone wording is unclear, so no steroid regimen is given.",
      "Metronidazole 12-hourly is as printed in the Australian source; check the hospital formulary.",
      "SFDA registration of the listed antibiotics was not verified.",
      "No paediatric dosing is included; this topic is adult only.",
    ],
    mech: [
      "Infection from a tonsil, tooth or pharynx can spread into deep neck spaces: submandibular (Ludwig's angina), peritonsillar, parapharyngeal and retropharyngeal.",
      "Peritonsillar abscess (quinsy) is pus collecting beside the tonsil and bulges the soft palate, deviating the uvula away from the abscess.",
      "Swelling narrows the airway; spread can reach the carotid sheath space, the prevertebral space and the anterior mediastinum.",
      "Complications include mediastinitis, necrotising fasciitis, venous thrombosis and lower cranial nerve palsy.",
    ],
    symptoms: ["Fever and malaise.", "Unilateral throat or ear pain, painful and difficult swallowing, poor oral intake.", "Muffled or \"hot potato\" voice.", "Failure to respond to first-line oral antibiotics."],
    signs: ["Foul breath, trismus and asymmetrical bulging of the soft palate with the uvula pushed to the opposite side.", "Neck stiffness or torticollis.", "Tachycardia, fever and hypotension suggest systemic sepsis."],
    red: [
      "Stridor, reduced consciousness or oxygen desaturation: possible complete airway obstruction.",
      "Breathing difficulty, trismus or torticollis.",
      "Voice change: possible spread down to the larynx.",
      "Severe sore throat and difficulty swallowing with stridor and no tonsillitis: treat as acute epiglottitis until proven otherwise.",
      "Skin crepitus, discolouration or blisters (necrotising fasciitis), toxaemia, lower cranial nerve palsy, facial puffiness (venous thrombosis) or mediastinal extension.",
    ],
    precip: ["Tonsillar infection or dental source.", "Previous quinsy (recurrent episodes).", "Failure of oral antibiotics."],
    diffs: [
      { condition: "Acute epiglottitis", distinguishingFeatures: "Severe sore throat and dysphagia with stridor but no tonsillitis or pharyngitis; secure the airway first." },
      { condition: "Peritonsillar cellulitis", distinguishingFeatures: "Needle aspiration finds no pus; the quinsy is confirmed when pus is aspirated." },
      { condition: "Parapharyngeal or retropharyngeal abscess", distinguishingFeatures: "Suspect when imaging or the clinical picture does not fit simple quinsy; confirm with contrast computed tomography (CT) of the neck." },
      { condition: "Malignancy", distinguishingFeatures: "Consider in patients over 50 with a suspicious presentation; arrange specialist follow-up in 2 weeks." },
    ],
    criteria: [
      { criterion: "Airway emergency", threshold: "Stridor, reduced consciousness or desaturation (Eye and Ear p. 2)." },
      { criterion: "Imaging", threshold: "Contrast CT neck if parapharyngeal abscess is suspected, or if there is no improvement or drainage has failed (Eye and Ear pp. 3–4)." },
      { criterion: "Drainage indications (ICMR)", threshold: "Abscess formation, no response to antibiotics over 48–72 hours, deterioration over 24 hours, airway compromise, mediastinal spread, vascular complication or necrotising fasciitis." },
    ],
    rule_in: [
      inv("Bedside airway assessment", "Airway patency and respiratory effort", "Impending airway obstruction", "Stridor, drooling, muffled voice, desaturation or reduced consciousness", "Any of these needs anaesthetic or ear, nose and throat (ENT) airway control before further tests.", "No stridor, normal voice and no desaturation", icmr("Clinical Examination; Management (PHC and district hospital)"), "specializedAdjunctive"),
      inv("Fibreoptic nasoendoscopy (FNE)", "Larynx and hypopharynx", "Laryngeal extension of infection", "Laryngeal swelling or supraglottic oedema", "Voice change needs ENT assessment with FNE.", "Normal laryngeal view", eye("Red Flags, pp. 2–3"), "specializedAdjunctive"),
      inv("Contrast CT of the neck", "Neck spaces and collections", "Parapharyngeal, retropharyngeal or other deep neck abscess", "Rim-enhancing collection or phlegmon with airway narrowing", "Standard imaging in the ICMR workflow; also used when the patient is not improving or drainage fails.", "No collection; normal fat planes", icmr("Investigations (Essential)"), "advancedImaging"),
      inv("Lateral neck X-ray (if CT is unavailable)", "Prevertebral soft tissue", "Retropharyngeal abscess", "Prevertebral thickening above 7 mm at C2 or above two-thirds of the vertebral body width at C6", "Highly suggestive of retropharyngeal abscess; proceed to specialist assessment.", "Prevertebral soft tissue not above 7 mm at C2 and not above two-thirds of the vertebral body width at C6", icmr("Investigations (Essential)"), "firstLineImaging"),
      inv("Neck ultrasound", "Neck soft tissue collection", "Abscess", "Fluid collection", "Suggests abscess and guides aspiration where CT is unavailable.", "No collection", icmr("Investigations (Essential)"), "firstLineImaging"),
    ],
    rule_out: [
      inv("White cell count, blood glucose and urea", "Sepsis, diabetes and hydration", "Systemic infection", "Raised white cell count; abnormal glucose or urea", "Guides fluids and highlights diabetes and dehydration.", "Reference range of the reporting laboratory (typical adult white cell count 4–11 ×10⁹/L)", icmr("Investigations (Essential)")),
      inv("Pus Gram stain and culture", "Causative organism", "Abscess pathogens", "Organisms on Gram stain; anaerobic culture where available", "Directs antibiotic therapy; the Australian guideline suggests considering delaying antibiotics until pus is sent for culture.", "No organism and no pus", eye("Acute Management, p. 4"), "laboratory"),
      inv("Diagnostic needle aspiration", "Peritonsillar space", "Quinsy versus cellulitis", "Pus aspirated", "Confirms quinsy and localises the abscess; no pus suggests cellulitis.", "No pus aspirated", eye("Acute Management, pp. 3–4"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "airway", title: "Secure the airway first", timeframe: "Immediately", actions: [
        "Assess for stridor, reduced consciousness and desaturation.",
        "If present, involve an anaesthetist or ENT on site to secure the airway, and arrange immediate ambulance transfer to a tertiary hospital with ENT and intensive care unit (ICU) or high-dependency unit (HDU) capability (Eye and Ear p. 2).",
        "ICMR advises cautious airway assessment; intubate or consider tracheotomy if the airway is compromised, and secure the airway early in progressive disease.",
      ] },
      { id: "assess", title: "Assess for spread and image", timeframe: "First hour after the airway is safe", actions: [
        "Examine for trismus, uvular deviation, neck stiffness, crepitus, cranial nerve palsy and facial swelling.",
        "Request FNE if the voice has changed.",
        "Arrange contrast CT neck if parapharyngeal abscess is suspected, or if the patient is not improving or drainage has failed.",
        "Treat hypotension with tachycardia and fever as sepsis, with fluids.",
      ] },
      { id: "drain", title: "Drain the collection", timeframe: "Same day", actions: [
        "Needle aspiration by an experienced clinician: 21G or 18G needle about 1.5 cm deep, never pointed laterally because of the internal carotid artery.",
        "Incision and drainage: infiltrate the anterior pillar with lidocaine 2% with adrenaline 1:80,000, incise with a size 15 blade, widen with curved artery forceps.",
        "Peritonsillar abscesses are drained intraorally; other deep neck abscesses are drained externally (ICMR).",
        "Drain urgently for airway compromise, mediastinal spread, vascular complication, necrotising fasciitis, deterioration over 24 hours or no response to antibiotics over 48–72 hours.",
      ] },
      { id: "antibiotics", title: "Antibiotics and admission", timeframe: "On admission", actions: [
        "Admit for overnight intravenous antibiotics, fluids and analgesia.",
        "Adults: benzylpenicillin 1.2 g IV four times daily plus metronidazole 500 mg IV 12-hourly; if penicillin allergic, clindamycin 450 mg IV three times daily.",
        "Switch to oral after significant improvement: amoxicillin with clavulanate 875/125 mg twice daily, or clindamycin 450 mg three times daily if penicillin allergic; total course 7 days (IV plus oral).",
        "Consider delaying antibiotics until pus is sent for culture (Eye and Ear p. 4).",
      ] },
      { id: "follow-up", title: "Escalation and follow-up", timeframe: "At discharge", actions: [
        "Refer to ENT for mediastinal spread, necrotising fasciitis, venous thrombosis or lower cranial nerve palsy.",
        "First episode: general practitioner follow-up. Recurrent quinsy: head and neck clinic for elective tonsillectomy.",
        "Age over 50 with a suspicious presentation: specialist follow-up within 2 weeks.",
        "Treat the primary source (tonsil or tooth).",
      ] },
    ],
    meds: {
      status: "source-verified",
      note: "Doses are from the Royal Victorian Eye and Ear Hospital guideline (adults only). The ICMR workflow lists penicillin, an aminoglycoside and metronidazole or clindamycin without doses. SFDA registration was not verified; check hospital formulary.",
      regimens: [
        reg({ indication: "Peritonsillar abscess or deep neck infection: initial intravenous therapy", patientGroup: "Adults without penicillin allergy", genericName: "Benzylpenicillin", dose: "1.2 g", route: "IV", frequency: "Four times daily", duration: "Until significant improvement, then oral step-down; 7 days in total", adjustments: ["No renal or hepatic adjustment is given in the source; check the hospital formulary."], monitoring: ["Reassess for significant improvement before switching IV to oral."], contraindications: ["Penicillin allergy: use the clindamycin regimen."], src: EYEEAR, edition: "RVEEH CPG27.0 v2.0 2019, Acute Management, p. 4" }),
        reg({ indication: "Anaerobic cover with benzylpenicillin", patientGroup: "Adults", genericName: "Metronidazole", dose: "500 mg", route: "IV", frequency: "12-hourly (as printed in the source)", duration: "With benzylpenicillin until improvement; 7 days in total with oral step-down", adjustments: ["No renal or hepatic adjustment is given in the source; check the hospital formulary."], monitoring: ["Reassess clinically for improvement."], contraindications: ["Contraindications are not listed in the source; check product information."], src: EYEEAR, edition: "RVEEH CPG27.0 v2.0 2019, Acute Management, p. 4" }),
        reg({ indication: "Intravenous therapy in penicillin allergy", patientGroup: "Adults with penicillin allergy", genericName: "Clindamycin", dose: "450 mg IV, then 450 mg orally for step-down", route: "IV then oral", frequency: "Three times daily", duration: "7 days in total (IV plus oral)", adjustments: ["The source also suggests infectious diseases consultation in penicillin allergy."], monitoring: ["Reassess clinically for improvement before oral step-down."], contraindications: ["Contraindications are not listed in the source; check product information."], src: EYEEAR, edition: "RVEEH CPG27.0 v2.0 2019, Acute Management and Ongoing Management, p. 4" }),
        reg({ indication: "Oral step-down after improvement", patientGroup: "Adults without penicillin allergy", genericName: "Amoxicillin with clavulanate", dose: "875/125 mg", route: "Oral", frequency: "Twice daily", duration: "7 days in total (IV plus oral)", adjustments: ["No renal or hepatic adjustment is given in the source; check the hospital formulary."], monitoring: ["Clinical review for recurrence of fever, trismus or neck swelling."], contraindications: ["Penicillin allergy: use oral clindamycin 450 mg three times daily."], src: EYEEAR, edition: "RVEEH CPG27.0 v2.0 2019, Ongoing Management, p. 4" }),
      ],
    },
    comparison: {
      title: "ICMR neck space workflow versus Royal Victorian Eye and Ear Hospital quinsy guideline",
      columns: ["ICMR STW 2019 (India)", "RVEEH CPG27.0 2019 (Australia)"],
      rows: [
        { parameter: "Imaging", values: ["Contrast CT head and neck is standard; lateral neck X-ray or ultrasound if CT unavailable.", "Contrast CT neck if parapharyngeal abscess is suspected or if there is no improvement or drainage has failed."] },
        { parameter: "Antibiotics", values: ["Early IV crystalline penicillin plus aminoglycoside plus metronidazole or clindamycin; no doses stated.", "Benzylpenicillin plus metronidazole IV, or clindamycin if penicillin allergic; doses stated."] },
        { parameter: "Drainage", values: ["Peritonsillar abscess intraorally; other abscesses externally.", "Needle aspiration or incision and drainage; tonsillectomy only electively for recurrence."] },
        { parameter: "Steroids", values: ["Not addressed.", "Single IV dexamethasone mentioned; wording unclear, so not adopted here."] },
      ],
      note: "The two documents are shown side by side and not merged. Only the Australian document gives doses.",
    },
    teach: teachOf([
      { ref: ICMR, edition: "ICMR Neck Space Infection STW 2019, Investigations; Management; Referral Triggers", locator: "Investigations; Management; Referral Triggers (headings, no page numbers)" },
      { ref: EYEEAR, edition: "RVEEH CPG27.0 v2.0 2019, pp. 2–4", locator: "Red Flags p. 2; Assess p. 3; Acute Management pp. 3–4; Follow-up p. 4" },
    ], ["Recognise airway threat before any other task.", "Choose imaging and drainage according to the space involved."],
      ["Stridor, desaturation or reduced consciousness need immediate airway control.", "Contrast CT neck is the standard scan.", "Needle must never be angled laterally during aspiration."],
      ["Delaying airway control to obtain imaging.", "Treating severe sore throat with stridor and no tonsillitis as simple pharyngitis.", "Missing mediastinal spread or necrotising fasciitis."]),
    edu: ["Return urgently for drooling, difficulty breathing, voice change, neck swelling or inability to open the mouth.", "Finish the full antibiotic course (7 days in total)."],
    life: ["Maintain oral fluids and soft diet while swallowing is painful.", "Dental review if a dental source is suspected."],
    mdt: ["ENT for drainage and airway; anaesthesia for airway control; ICU or HDU for airway compromise; dental surgery if dental source; head and neck clinic for recurrent quinsy."],
    discharge: ["Significant clinical improvement and tolerating oral intake.", "Safe airway with no stridor, drooling or progressive swelling.", "Pus drained or collection excluded, and IV antibiotics stepped down to oral."],
    follow: "First quinsy: general practitioner review. Recurrent quinsy: head and neck clinic for tonsillectomy decision. Age over 50 with suspicious features: specialist review within 2 weeks.",
  },
  {
    key: "fh", draftTitle: "Familial Hypercholesterolaemia: Identification and Referral", pillar: "Chronic Care", authority: "NICE",
    scope: "Adult and child identification of familial hypercholesterolaemia (FH) in primary care, referral for DNA testing and specialist review, cascade testing, statin target and pregnancy advice, from NICE CG71.",
    unverified: [
      "The Simon Broome criteria and Dutch Lipid Clinic Network point values are in CG71 appendices that were not opened.",
      "No Saudi national FH guideline was opened.",
      "Statin dosing frequency, renal and hepatic adjustments and SFDA registration were not verified.",
      "CG71 dates from 2008 with later updates; later lipid guidance (NICE NG238) was not compared here.",
      "Paediatric statin doses are in the British National Formulary for Children and were not opened.",
    ],
    mech: [
      "FH is characterised by raised low-density lipoprotein cholesterol (LDL-C) and premature coronary heart disease (CHD), defined in CG71 as a coronary event before 60 years of age in the patient or a first-degree relative.",
      "Diagnosis combines cholesterol level, personal and family history, tendon xanthomata and DNA testing.",
      "An identified disease-causing mutation gives an unequivocal diagnosis even if LDL-C does not meet the criteria.",
      "Homozygous FH, including compound heterozygous FH, carries similarly high cardiovascular risk.",
      "Cascade testing uses DNA testing to find affected first-, second- and, where possible, third-degree relatives.",
    ],
    symptoms: ["Usually none until coronary events occur.", "Family history of premature CHD or very high cholesterol.", "Chest pain or other CHD symptoms in a person with a raised cholesterol."],
    signs: ["Tendon xanthomata; their absence does not exclude FH."],
    red: [
      "LDL-C above 13 mmol/L in an adult, or above 11 mmol/L in a child or young person: consider homozygous FH.",
      "Premature CHD symptoms in a person with suspected FH.",
      "Conception while taking a statin: stop at once and refer urgently to obstetrics for fetal assessment.",
    ],
    precip: ["Secondary causes of raised cholesterol, which must be excluded before diagnosing FH.", "A first-degree relative with premature CHD or with a confirmed FH mutation."],
    diffs: [
      { condition: "Secondary hypercholesterolaemia", distinguishingFeatures: "Exclude secondary causes before an FH diagnosis; the cholesterol falls when the cause is treated." },
      { condition: "Relative who tests negative for the family mutation", distinguishingFeatures: "Manage as the general population." },
    ],
    criteria: [
      { criterion: "Suspect FH", threshold: "Total cholesterol above 7.5 mmol/L, or personal or family history of premature CHD (Rec 1.1.1)." },
      { criterion: "Primary-care record search", threshold: "Total cholesterol above 7.5 mmol/L under age 30, or above 9.0 mmol/L at age 30 or over (Rec 1.1.2)." },
      { criterion: "Confirmation", threshold: "Two LDL-C measurements (Rec 1.1.9)." },
      { criterion: "Refer for DNA testing", threshold: "Simon Broome possible or definite FH, or Dutch Lipid Clinic Network score above 5 (Rec 1.1.6)." },
      { criterion: "Consider homozygous FH", threshold: "LDL-C above 13 mmol/L in adults or above 11 mmol/L in children and young people (Rec 1.1.8)." },
    ],
    rule_in: [
      inv("Total cholesterol", "Lipid level", "Suspected FH", "Above 7.5 mmol/L (above 9.0 mmol/L at 30 or over in a record search)", "Triggers FH assessment; offer measurement if premature CHD in the person or a first-degree relative and no level is known.", "Below the CG71 suspicion threshold of 7.5 mmol/L; local laboratory range applies", cg71("Rec 1.1.1–1.1.3")),
      inv("LDL-C (two measurements)", "LDL cholesterol", "FH confirmation and homozygous screen", "Persistently raised on two measurements; above 13 mmol/L (adult) suggests homozygous FH", "Use for confirmation and for the 50% reduction target.", "Laboratory adult reference range; CG71 gives no single normal cut-off", cg71("Rec 1.1.8–1.1.9")),
      inv("Examination for tendon xanthomata", "Tendons", "FH clinical sign", "Tendon xanthomata present", "Supports the Simon Broome or Dutch Lipid Clinic Network score; absence does not exclude FH.", "No xanthomata; absence does not exclude FH", cg71("Rec 1.1.7"), "specializedAdjunctive"),
      inv("Simon Broome or Dutch Lipid Clinic Network score", "Diagnostic scoring", "Possible or definite FH", "Simon Broome possible or definite, or Dutch Lipid Clinic Network score above 5", "Refer for DNA testing; the criteria are applied by a competent healthcare professional.", "Dutch Lipid Clinic Network score of 5 or below", cg71("Rec 1.1.5–1.1.6"), "specializedAdjunctive"),
      inv("DNA test for FH mutation", "Genetic variant", "FH diagnosis and cascade testing", "Disease-causing mutation identified", "Unequivocal diagnosis even if LDL-C is below criteria; start cascade testing.", "No disease-causing mutation", cg71("Rec 1.1.13–1.1.15; 1.2.1–1.2.2"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Directed tests for secondary causes", "Secondary hypercholesterolaemia", "Non-genetic cause of raised cholesterol", "A secondary cause identified", "FH should not be diagnosed until secondary causes are excluded.", "No secondary cause found", cg71("Rec 1.1.4")),
      inv("Fasting lipid profile at annual review", "Treatment response", "Statin effect", "LDL-C reduction of at least 50% from baseline", "If the maximum tolerated high-intensity statin plus ezetimibe does not give more than 50%, refer to an FH specialist.", "Not applicable to a healthy person; target is at least a 50% fall from untreated baseline", cg71("Rec 1.3.1.2; 1.3.1.11; 1.5.1.5")),
      inv("Baseline electrocardiogram (ECG)", "Cardiac rhythm and ischaemia", "Coexisting CHD", "Ischaemic changes or arrhythmia", "Consider a baseline ECG in adults with FH.", "Sinus rhythm without ischaemic change", cg71("Rec 1.5.1.2"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "identify", title: "Identify possible FH", timeframe: "At any primary-care contact", actions: [
        "Suspect FH in adults with total cholesterol above 7.5 mmol/L or a personal or family history of premature CHD.",
        "Search records for under-30s with total cholesterol above 7.5 mmol/L and people aged 30 or over with total cholesterol above 9.0 mmol/L.",
        "Exclude secondary causes first; do not use QRISK2 or Framingham risk tools in FH.",
      ] },
      { id: "confirm", title: "Confirm and refer", timeframe: "After two LDL-C results", actions: [
        "Confirm with two LDL-C measurements and score with Simon Broome or Dutch Lipid Clinic Network criteria.",
        "Refer for DNA testing if possible or definite FH, or Dutch Lipid Clinic Network score above 5.",
        "Refer all people with FH to an FH specialist for confirmation and to start cascade testing.",
        "CG71 defines urgent referral as as soon as possible with a maximum of 14 days.",
      ] },
      { id: "treat", title: "Start and titrate lipid-lowering treatment", timeframe: "On confirmed FH", actions: [
        "Offer a high-intensity statin with the lowest acquisition cost, aiming for at least a 50% LDL-C reduction.",
        "Increase to the maximum licensed or tolerated dose if a reduction above 50% is not reached.",
        "If maximum tolerated high-intensity statin plus ezetimibe does not give above 50%, refer to an FH specialist.",
        "Tell adults that treatment is lifelong.",
      ] },
      { id: "children", title: "Children and young people", timeframe: "At diagnosis", actions: [
        "Offer a DNA test to children aged 0–10 with one affected parent at the earliest opportunity, and again if not tested by age 10.",
        "Refer to a child- and young person-focused FH service; offer a statin by age 10 or at the earliest opportunity afterwards.",
        "Monitor growth and pubertal development.",
      ] },
      { id: "pregnancy", title: "Pregnancy and contraception", timeframe: "At first consideration of treatment, then at least annually", actions: [
        "Discuss pregnancy risks when lipid-modifying therapy is first considered and revisit at least annually.",
        "Stop lipid-modifying treatment 3 months before trying to conceive; if conception occurs on a statin, stop at once and refer urgently to obstetrics.",
        "Combined oral contraceptives are not generally contraindicated, but consider other methods because of a small possible rise in cardiovascular risk.",
        "Do not routinely measure cholesterol during pregnancy.",
      ] },
    ],
    meds: localDrug("CG71 defines high-intensity statins as atorvastatin 20 to 80 mg and rosuvastatin 10 to 40 mg and requires at least a 50% LDL-C reduction. Dosing frequency, renal and hepatic adjustment, interactions and SFDA registration were not verified; follow the product information and hospital formulary. Paediatric doses use the British National Formulary for Children (not opened)."),
    teach: teachOf([
      { ref: CG71, edition: "NICE CG71, Rec 1.1.1–1.5.1.5", locator: "Rec 1.1.1–1.1.15; 1.2.1–1.2.2; 1.3.1.1–1.3.1.27; 1.4.2.1–1.4.3.6; 1.5.1.1–1.5.1.5" },
    ], ["Apply CG71 case-finding thresholds in primary care.", "Refer for DNA testing and cascade testing."],
      ["FH is suspected at total cholesterol above 7.5 mmol/L with or without premature CHD.", "The statin goal is at least a 50% LDL-C fall.", "A negative mutation test in a relative returns them to general-population care."],
      ["Using QRISK2 or Framingham in FH.", "Diagnosing FH before secondary causes are excluded.", "Continuing a statin through conception."]),
    edu: ["Explain that FH is inherited and that treatment is lifelong.", "Advise relatives to have cascade testing through the FH service."],
    life: ["Stop smoking, healthy diet and regular physical activity; review at each annual structured review."],
    mdt: ["FH specialist service; paediatric FH service for children; obstetrics and cardiology shared care in pregnancy; family-tracing (cascade testing) team."],
    discharge: ["Not applicable as an admission topic; transfer to shared care once the specialist plan and statin target are set."],
    follow: "Structured review at least annually, covering CHD symptoms, smoking, fasting lipid profile, adherence and side effects, and cascade testing progress.",
  },
  {
    key: "mnd-eol", draftTitle: "Motor Neurone Disease: End-of-Life Anticipatory Prescribing", pillar: "Palliative Care", authority: "NICE",
    scope: "End-of-life planning and anticipatory medicines for adults with motor neurone disease (MND) using NICE NG42, with doses from the Scottish Palliative Care Guidelines last-days page and NHS Lanarkshire non-invasive ventilation withdrawal guidance.",
    unverified: [
      "NICE NG42 names the medicine classes for anticipatory prescribing but gives no doses; doses come from general last-days-of-life guidance, not MND-specific guidance.",
      "The issuing body and review date of the Scottish symptom-control page were not stated in the page text opened.",
      "The NHS Lanarkshire document states that withdrawal of ventilation in MND differs and refers to external guidance that was not opened.",
      "Renal-impairment dosing is not given in the sources opened.",
      "No Saudi MND or palliative prescribing guideline was opened; SFDA registration was not verified.",
      "Doses are for adults; specialist palliative advice is required for opioid-tolerant patients and for terminal agitation.",
    ],
    mech: [
      "Worsening respiratory impairment causes breathlessness; a raised arterial carbon dioxide level triggers urgent referral to a respiratory ventilation service.",
      "Excess saliva, thick secretions and an ineffective cough are managed separately with antimuscarinics, secretion measures and cough augmentation.",
      "Anxiety makes breathlessness worse, so a benzodiazepine can be added to an opioid.",
      "Non-invasive ventilation (NIV) can relieve symptoms but some people depend on it 24 hours a day, so stopping it needs a symptom plan.",
      "Communication, cognition or capacity may decline, so advance care planning should start early.",
    ],
    symptoms: ["Breathlessness, often worse with anxiety.", "Excess saliva or thick secretions.", "Ineffective cough.", "Distress or fear as the end of life approaches."],
    signs: ["Resting oxygen saturation at or below 92% with known lung disease, or at or below 94% without it, prompting blood gas analysis.", "Raised arterial carbon dioxide.", "Audible secretions or drooling."],
    red: [
      "Partial pressure of carbon dioxide (PaCO2) above 6 kPa: refer urgently to a respiratory ventilation service, to be seen within 1 week.",
      "A significant change in respiratory function: offer an end-of-life discussion.",
      "A person using NIV continuously who wishes to stop, or who becomes distressed when it is stopped.",
      "Symptoms not controlled with first-line anticipatory medicines: seek specialist palliative care advice.",
    ],
    precip: ["Respiratory tract infection or secretion retention (reversible causes to treat first).", "Starting gastrostomy or NIV.", "Decline in respiratory function."],
    diffs: [
      { condition: "Reversible cause of worsening breathing", distinguishingFeatures: "Treat infection and secretion problems before attributing breathlessness to disease progression." },
      { condition: "Anxiety-driven breathlessness", distinguishingFeatures: "Breathlessness is made worse by anxiety; a benzodiazepine is considered." },
      { condition: "Sialorrhoea versus thick secretions", distinguishingFeatures: "Excess saliva responds to an antimuscarinic; thick secretions need medicines review, hydration, suction, humidification or carbocisteine." },
    ],
    criteria: [
      { criterion: "Specialist palliative care referral", threshold: "Current or anticipated significant or complex needs (Rec 1.5.11)." },
      { criterion: "End-of-life discussion trigger", threshold: "Diagnosis, need for gastrostomy or NIV, or a significant change in respiratory function (Rec 1.7.1)." },
      { criterion: "Blood gas trigger", threshold: "Resting room-air oxygen saturation at or below 92% with known lung disease, or at or below 94% without (Rec 1.15.11)." },
      { criterion: "Urgent ventilation-service referral", threshold: "PaCO2 above 6 kPa, to be seen within 1 week (Rec 1.15.13)." },
    ],
    rule_in: [
      inv("Resting room-air oxygen saturation", "Oxygenation", "Respiratory failure", "At or below 92% with lung disease, or at or below 94% without", "Triggers arterial or capillary blood gas analysis.", "Typical adult saturation 95% or above; NICE trigger is 92% or below with lung disease and 94% or below without", ng42("Rec 1.15.11"), "specializedAdjunctive"),
      inv("Arterial or capillary blood gas", "PaCO2", "Hypercapnic respiratory failure", "PaCO2 above 6 kPa", "Refer urgently to a respiratory ventilation service; seen within 1 week.", "PaCO2 not above 6 kPa", ng42("Rec 1.15.11–1.15.13")),
      inv("Respiratory function tests", "Respiratory trend", "Progressive respiratory impairment", "Decline from previous results", "Usually every 2 to 3 months, adjusted to symptoms, progression and preferences.", "No decline from the person's own baseline", ng42("Rec 1.15.10"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Assessment of cough effectiveness", "Cough strength", "Ineffective cough", "Unable to cough effectively", "Offer cough augmentation such as manual assisted cough; assisted breath stacking or a mechanical cough-assist device if needed.", "Effective spontaneous cough", ng42("Rec 1.14.1–1.14.4"), "specializedAdjunctive"),
      inv("Medicines, swallowing and secretion review", "Thick secretions", "Reversible contributors", "Medicines that thicken secretions, poor posture, poor oral care or dehydration", "Review all medicines; advise on swallowing, diet, posture, oral care, suction and hydration; consider carbocisteine.", "Secretions cleared with oral care and suction", ng42("Rec 1.8.15"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "plan-early", title: "Plan before the terminal phase", timeframe: "At diagnosis and at each trigger point", actions: [
        "Offer end-of-life discussion at diagnosis, before gastrostomy or NIV, and when respiratory function changes significantly.",
        "Cover advance care planning, advance decisions to refuse treatment, do-not-attempt-cardiopulmonary-resuscitation (DNACPR) orders, lasting power of attorney and anticipatory medicines at home.",
        "Start earlier if communication, cognition or capacity is expected to fall.",
      ] },
      { id: "prepare", title: "Have anticipatory medicines and equipment ready", timeframe: "Before breathlessness or distress becomes severe", actions: [
        "Ensure prompt access to an opioid and a benzodiazepine for breathlessness, and an antimuscarinic for saliva and secretions.",
        "Ensure access to specialist palliative care, a communication aid and equipment such as syringe drivers and suction.",
        "Consider as-needed breathlessness medicines at home for people using NIV.",
      ] },
      { id: "symptoms", title: "Treat symptoms in the last days", timeframe: "As needed, with review", actions: [
        "Breathlessness, opioid-naive: morphine 2 mg SC as needed, maximum 6 doses in 24 hours; add midazolam 2–5 mg SC up to hourly for breathlessness with anxiety.",
        "Persistent breathlessness: morphine 5–10 mg SC and midazolam 5–20 mg SC over 24 hours by syringe pump.",
        "Secretions: hyoscine butylbromide 20 mg SC up to hourly (maximum 120 mg in 24 hours); second line glycopyrronium 200 micrograms SC 6–8 hourly as needed.",
        "Seek urgent advice if 3 or more doses within 4 hours give little benefit; seek advice or review if more than 6 doses are needed in 24 hours.",
      ] },
      { id: "niv", title: "If NIV is to be stopped", timeframe: "Plan before withdrawal", actions: [
        "Agree the decision with the person and, if they wish, family; involve clinicians with NIV-withdrawal expertise and check legal and ethical frameworks.",
        "Have DNACPR in place and symptoms controlled first; start a continuous subcutaneous infusion (CSCI) of an opioid and midazolam at least 2 hours before withdrawal, ideally 4–6 hours (NHS Lanarkshire).",
        "Be ready to give repeated as-needed doses before and after withdrawal.",
      ] },
    ],
    meds: {
      status: "source-verified",
      note: "NICE NG42 recommends having an opioid, a benzodiazepine and an antimuscarinic available but gives no doses. Doses below are from the Scottish Palliative Care Guidelines last-days page (general, not MND-specific). Check hospital formulary and specialist palliative advice; SFDA registration was not verified.",
      regimens: [
        reg({ indication: "Breathlessness or pain", patientGroup: "Opioid-naive adults in the last days of life", genericName: "Morphine", dose: "2 mg (persistent breathlessness: 5–10 mg over 24 hours with midazolam)", route: "SC", frequency: "As required, maximum 6 doses in 24 hours; syringe pump for persistent breathlessness", duration: "Until review", adjustments: ["For people on a regular opioid, breakthrough dose is one-sixth to one-tenth of the 24-hour opioid dose.", "Stage 4–5 chronic kidney disease: use the renal last-days guidance; no alternative doses in this source."], monitoring: ["Seek urgent advice if 3 or more doses in 4 hours give little benefit; review if more than 6 doses in 24 hours."], contraindications: ["Contraindications are not listed in the source; check product information."], src: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life, Section Pain; Breathlessness" }),
        reg({ indication: "Breathlessness with anxiety, distress or agitation", patientGroup: "Adults in the last days of life", genericName: "Midazolam", dose: "2–5 mg for intermittent symptoms; 10–20 mg over 24 hours by syringe pump for persistent distress (10 mg per 24 hours start, titrate to 60 mg under specialist advice)", route: "SC", frequency: "Up to hourly as required; plus syringe pump when persistent", duration: "Until review", adjustments: ["Titration above 20 mg per 24 hours under specialist advice."], monitoring: ["Reassess sedation, distress and breathing after each dose."], contraindications: ["Contraindications are not listed in the source; check product information."], src: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life, Section Agitation, distress or delirium; Breathlessness" }),
        reg({ indication: "Respiratory tract secretions: first line", patientGroup: "Adults in the last days of life", genericName: "Hyoscine butylbromide", dose: "20 mg", route: "SC", frequency: "Up to hourly as required", duration: "Maximum 120 mg (6 doses) in 24 hours; review", adjustments: ["Maximum 120 mg per 24 hours."], monitoring: ["Review secretions and side effects after each dose."], contraindications: ["Contraindications are not listed in the source; check product information."], src: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life, Section Respiratory tract secretions" }),
        reg({ indication: "Respiratory tract secretions: second line", patientGroup: "Adults in the last days of life", genericName: "Glycopyrronium bromide", dose: "200 micrograms", route: "SC", frequency: "6–8 hourly as required", duration: "Until review", adjustments: ["NICE NG42 favours glycopyrronium for saliva control when cognitive impairment is present."], monitoring: ["Review secretions and side effects after each dose."], contraindications: ["Contraindications are not listed in the source; check product information."], src: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life, Section Respiratory tract secretions" }),
        reg({ indication: "Persistent distress or delirium", patientGroup: "Adults in the last days of life (lower dose for frail older adults)", genericName: "Levomepromazine", dose: "2.5–5 mg (lower doses or frail); 10–25 mg for persistent distress or delirium", route: "SC", frequency: "As required, up to 2-hourly", duration: "Until review; terminal agitation dose under specialist advice", adjustments: ["Often given with midazolam under specialist advice."], monitoring: ["Reassess distress and sedation after each dose."], contraindications: ["Contraindications are not listed in the source; check product information."], src: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life, Section Agitation, distress or delirium" }),
      ],
    },
    comparison: {
      title: "As-required doses: Scottish last-days page versus NHS Lanarkshire NIV-withdrawal guidance",
      columns: ["Scottish Palliative Care Guidelines (last days of life)", "NHS Lanarkshire NIV withdrawal v1.0 2024"],
      rows: [
        { parameter: "Breathlessness or pain, opioid-naive", values: ["Morphine 2 mg SC as needed, maximum 6 doses per 24 hours.", "Morphine 2–5 mg SC or IV; opioid-naive may start CSCI of morphine 10 mg."] },
        { parameter: "Distress or anxiety", values: ["Midazolam 2–5 mg SC hourly as needed.", "Midazolam 2–5 mg SC or IV; opioid-naive may start CSCI of midazolam 10 mg."] },
        { parameter: "Secretions", values: ["Hyoscine butylbromide 20 mg SC up to hourly, maximum 120 mg per 24 hours; glycopyrronium 200 micrograms second line.", "Hyoscine butylbromide 20 mg SC; glycopyrronium not mentioned."] },
        { parameter: "Agitation", values: ["Levomepromazine 2.5–5 mg (frail) or 10–25 mg SC up to 2-hourly.", "Levomepromazine 2.5–5 mg SC."] },
      ],
      note: "Shown side by side and not merged. The Lanarkshire guidance applies to ventilation withdrawal in general and states that MND differs.",
    },
    teach: teachOf([
      { ref: NG42, edition: "NICE NG42, Rec 1.5.11; 1.7.1–1.7.8; 1.8.12–1.8.15; 1.13.1–1.13.5; 1.15.5–1.15.31", locator: "Rec 1.7.1–1.7.8; 1.8.12–1.8.15; 1.13.4–1.13.5; 1.15.13; 1.15.26–1.15.31" },
      { ref: SPCG, edition: "Scottish Palliative Care Guidelines, Symptom control in the last days of life", locator: "Pain; Breathlessness; Agitation; Respiratory tract secretions" },
      { ref: NIVW, edition: "NHS Lanarkshire NIV withdrawal v1.0, Sections 3–5", locator: "Sections 3–5" },
    ], ["Start end-of-life planning at the trigger points.", "Prescribe anticipatory medicines for breathlessness, distress and secretions."],
      ["NG42 names the medicine classes but not the doses.", "PaCO2 above 6 kPa needs ventilation-service review within 1 week.", "Start the CSCI at least 2 hours before NIV withdrawal."],
      ["Waiting until the last days to discuss end of life.", "Using general last-days doses without specialist advice in opioid-tolerant patients.", "Withdrawing NIV before symptoms are controlled."]),
    edu: ["Explain that NIV can be stopped at any time and that medicines can ease symptoms.", "Explain expected changes at the end of life to family and carers."],
    life: ["Maintain oral care, hydration, upright posture and suction to manage saliva and secretions."],
    mdt: ["MND specialist team; specialist palliative care; respiratory ventilation service; speech and language therapy for secretions and communication; community nursing for syringe drivers."],
    discharge: ["Anticipatory medicines, prescription chart and syringe-driver support in place at home.", "Advance care plan, DNACPR and lasting power of attorney documented and shared with GP and emergency services."],
    follow: "Review the plan and symptom control at least at each trigger point; respiratory function tests usually every 2 to 3 months; offer bereavement support to family and carers.",
  },
];
