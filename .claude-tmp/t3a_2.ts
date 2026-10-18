import { cite, type Ref, type Spec } from "./common.ts";
import { inv, localDrug, reg, teachOf } from "./tier3-helpers.ts";

const EAPC: Ref = { title: "European Association for Palliative Care (EAPC) recommended framework for the use of sedation in palliative care (Cherny and Radbruch, Palliative Medicine 2009)", url: "https://journals.sagepub.com/doi/reader/10.1177/0269216309107024" };
const CG192: Ref = { title: "NICE CG192: Antenatal and postnatal mental health: clinical management and service guidance", url: "https://www.nice.org.uk/guidance/cg192/resources/antenatal-and-postnatal-mental-health-clinical-management-and-service-guidance-35109869806789" };
const STATP: Ref = { title: "StatPearls: Ovarian Cyst (Mobeen and Apostol, updated 5 June 2023)", url: "https://www.ncbi.nlm.nih.gov/sites/books/NBK560541/" };
const ACR: Ref = { title: "ACR Appropriateness Criteria: Acute Pelvic Pain in the Reproductive Age Group (2023)", url: "https://acsearch.acr.org/docs/69503/Narrative" };
const DUPUIS: Ref = { title: "Dupuis and Kim: Ultrasonography of adnexal causes of acute pelvic pain in pre-menopausal non-pregnant women (Ultrasonography 2015;34(4):258-267)", url: "https://synapse.koreamed.org/articles/1516090966" };
const KIM: Ref = { title: "Kim et al: Successful conservative management of ruptured ovarian cysts with hemoperitoneum in healthy women (PLoS ONE 2014;9(3):e91171), single-centre retrospective study", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3946718/" };

const eapc = (loc: string) => cite(EAPC, `EAPC sedation framework 2009, Section ${loc}`);
const cg192 = (loc: string) => cite(CG192, `NICE CG192, ${loc}`);
const sp = (loc: string) => cite(STATP, `StatPearls Ovarian Cyst 2023, Section ${loc}`);
const acr = (loc: string) => cite(ACR, `ACR Appropriateness Criteria Acute Pelvic Pain 2023, Section ${loc}`);
const dup = (loc: string) => cite(DUPUIS, `Dupuis and Kim 2015, Section ${loc}`);

export const specs: Spec[] = [
  {
    key: "pal-sedation", draftTitle: "Palliative Sedation: Proportionate Sedation for Refractory Symptoms", pillar: "Palliative Care", authority: "Other",
    scope: "Adult palliative sedation for refractory symptoms in advanced terminal illness: indications, pre-sedation assessment, consent, drug selection and monitoring, using the EAPC 2009 framework.",
    unverified: [
      "Only the 2009 EAPC framework was opened; the revised EAPC framework (Delphi study) and NICE NG31 sedation advice were not opened.",
      "No Saudi guideline, Saudi legal position or religious ruling on palliative sedation was opened; local law and the hospital ethics policy apply.",
      "The EAPC framework covers pentobarbital, not phenobarbital; pentobarbital availability in Saudi Arabia and SFDA registration of all drugs were not verified.",
      "Doses are as printed in EAPC Appendix 2 and have not been compared with a current national formulary.",
      "The framework gives no renal or hepatic dose adjustments.",
    ],
    mech: [
      "Palliative sedation is the monitored use of medicines to induce decreased or absent awareness in order to relieve intractable suffering.",
      "A symptom is refractory when no other palliation is available within an acceptable time frame or without unacceptable adverse effects.",
      "The usual refractory symptoms are agitated delirium, dyspnoea, pain and convulsions.",
      "Catastrophic events such as massive haemorrhage, asphyxiation, severe terminal dyspnoea or an overwhelming pain crisis may need emergency sedation.",
      "Continuous deep sedation is reserved for the very terminal stage, with prognosis of hours or days at most.",
    ],
    symptoms: ["Agitated delirium.", "Severe dyspnoea.", "Uncontrolled pain.", "Convulsions.", "Intolerable physical distress that has not responded to other treatment."],
    signs: ["Marked restlessness or distress despite routine symptom control.", "Visible respiratory distress, bleeding or seizure activity in emergencies."],
    red: [
      "Massive haemorrhage, asphyxiation, severe terminal dyspnoea or an overwhelming pain crisis: treat as a medical emergency.",
      "A treatable cause has not been excluded (sepsis, reversible metabolic event, medicine toxicity, pleural effusion, pericardial tamponade, ureteric or upper airway obstruction, gastrointestinal obstruction, active bleeding, urinary retention or raised intracranial pressure).",
      "Uncertain decision-making capacity or no agreed proxy.",
      "Refractory psychological or existential distress alone: no consensus; use only the respite-sedation approach.",
    ],
    precip: ["Advanced terminal illness with prognosis of hours to days.", "Reversible contributors such as infection, metabolic disturbance or medicine toxicity.", "Psychosocial, spiritual and environmental distress."],
    diffs: [
      { condition: "Treatable cause of distress", distinguishingFeatures: "A specific cause from the exclusion list is found; treat that cause before declaring the symptom refractory." },
      { condition: "Refractory psychological or existential distress", distinguishingFeatures: "No consensus on sedation; consider only in advanced terminal illness after repeated assessment, a multidisciplinary case conference and respite sedation for 6–24 hours first." },
      { condition: "Medicine-induced agitation or opioid toxicity", distinguishingFeatures: "Signs of overdose: reduce the opioid gradually rather than stopping it abruptly." },
    ],
    criteria: [
      { criterion: "Refractory symptom", threshold: "No other palliation available within an acceptable time frame or without unacceptable adverse effects." },
      { criterion: "Prognosis for continuous deep sedation", threshold: "Hours or days at most." },
      { criterion: "Decision-making capacity", threshold: "Patient can express a will, understand the relevant information and understand the implications of the choice." },
      { criterion: "Monitoring", threshold: "Assess at least every 20 minutes until adequate sedation, then at least three times daily." },
    ],
    rule_in: [
      inv("Senior palliative care evaluation", "Symptom refractoriness", "Refractory symptom", "No further option within an acceptable time frame", "Required before sedation; a trainee's assessment must be corroborated by a senior or palliative care team.", "Symptom controlled with routine treatment", eapc("Pre-sedation assessment and criteria"), "specializedAdjunctive"),
      inv("Prognosis estimate", "Time to death", "Hours to days", "Minutes to hours, hours to days, days to weeks or longer", "Continuous deep sedation is for hours or days; longer prognosis favours intermittent or respite sedation.", "Not applicable; prognosis is documented in the record", eapc("Pre-sedation assessment and criteria"), "specializedAdjunctive"),
      inv("Decision-making capacity assessment", "Capacity", "Capacity to consent", "Able to express a will and understand the information and implications", "If capacity is doubtful, seek a psychiatric opinion; if absent, use a legally recognised proxy.", "Capacity present", eapc("Decision-making and consent"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Bedside review and directed tests for treatable causes", "Reversible causes", "Sepsis, metabolic event, medicine toxicity, obstruction, bleeding, retention, raised intracranial pressure", "A reversible cause identified", "Treat the cause before or alongside sedation.", "No reversible cause identified", eapc("Pre-sedation assessment and criteria"), "laboratory"),
      inv("Richmond Agitation-Sedation Scale (RASS)", "Level of sedation", "Depth of sedation", "Target score set by the team within a scale of −5 to +4", "Use the lowest level that relieves suffering and record each titration.", "0 is the alert and calm reference point on the −5 to +4 scale", eapc("Dose titration, monitoring and care"), "specializedAdjunctive"),
      inv("Pain in lowered consciousness (CCPOT) score", "Pain behaviour", "Pain during reduced consciousness", "Higher scores (scale 0–8) indicate pain", "Distinguish pain behaviour from agitation when the patient cannot report symptoms.", "Score of 0", eapc("Dose titration, monitoring and care"), "specializedAdjunctive"),
      inv("Heart rate, blood pressure and oxygen saturation", "Cardiorespiratory status", "Adverse effects in short-term or light sedation", "Hypotension, bradycardia or desaturation", "Monitor in short-term or light sedation; in imminent death monitor only comfort-related signs and respiratory rate for distress.", "Stable observations for the patient; no numeric range in the framework", eapc("Dose titration, monitoring and care"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "emergency", title: "Recognise refractory distress", timeframe: "Immediately", actions: ["Treat extreme distress as a medical emergency and evaluate urgently.", "Catastrophic events (massive haemorrhage, asphyxiation) may justify immediate deep sedation as first line."] },
      { id: "assess", title: "Assess", timeframe: "Before sedation unless emergency", actions: ["Experienced palliative care clinician evaluates; exclude treatable causes; review psychosocial, spiritual and environmental contributors.", "Estimate prognosis and assess decision-making capacity.", "Seek expert consultation if unsure that all options were tried.", "Record the rationale, aims, planned depth and duration."] },
      { id: "decide", title: "Decide and consent", timeframe: "Same day", actions: ["Discuss the cause, treatments tried, aims, depth, monitoring, expected effects and risks (paradoxical agitation, inadequate relief, possible hastened death).", "Include family with the patient's permission; if capacity is absent and no advance directive exists, obtain the view of a legally recognised proxy, who states what the patient would have wanted.", "Use the lowest effective level: try intermittent or mild sedation first; continuous deep sedation first line only if suffering is intense and refractory, death is expected within hours or days, the patient explicitly wishes it, or there is a catastrophic event."] },
      { id: "titrate", title: "Start and titrate", timeframe: "Start with physician and nurse together", actions: ["Assess at least every 20 minutes until adequate sedation, then at least three times daily.", "Titrate gradually to the lowest dose that relieves suffering and document each change.", "In imminent death monitor comfort and respiratory rate; downward titration is generally not recommended."] },
      { id: "care", title: "Ongoing care", timeframe: "Throughout sedation", actions: ["Decide artificial hydration and nutrition separately from sedation, on the patient's wishes and comfort.", "Continue symptom-relieving medicines (generally continue opioids; reduce gradually if overdose signs appear).", "Keep dignified care: communication, oral, eye and skin care; support family and staff."] },
    ],
    meds: {
      status: "source-verified",
      note: "Doses are from EAPC 2009 Appendix 2 and are for adults under specialist palliative care. Midazolam and levomepromazine are the usual choices; propofol and pentobarbital are specialist options. Opioids are not appropriate sedatives. SFDA registration was not verified; check hospital formulary.",
      regimens: [
        reg({ indication: "Palliative sedation for refractory symptoms (most commonly used)", patientGroup: "Adults with advanced terminal illness", genericName: "Midazolam", dose: "Start 0.5–1 mg per hour or 1–5 mg as needed; usual effective dose 1–20 mg per hour", route: "IV or SC", frequency: "Continuous infusion or as needed", duration: "Until sedation goal is reached and for as long as needed", adjustments: ["Titrate to the lowest effective dose; the source gives no renal or hepatic adjustment."], monitoring: ["Assess every 20 minutes until adequate sedation, then at least three times daily; RASS or comfort-based observation."], contraindications: ["Paradoxical agitation can occur; flumazenil reverses benzodiazepine respiratory depression in life-threatening respite sedation."], src: EAPC, edition: "EAPC sedation framework 2009, Appendix 2" }),
        reg({ indication: "Sedation for agitated delirium", patientGroup: "Adults with advanced terminal illness", genericName: "Levomepromazine", dose: "Stat 12.5–25 mg then 50–75 mg continuous infusion; usual 12.5 or 25 mg every 8 hours plus 1-hourly as needed, or up to 300 mg per day by infusion", route: "Oral, IV, SC or IM", frequency: "Every 8 hours or continuous infusion", duration: "As needed", adjustments: ["Titrate to effect; the source gives no renal or hepatic adjustment."], monitoring: ["Assess every 20 minutes until adequate sedation, then at least three times daily."], contraindications: ["Contraindications are not listed in the source; check product information."], src: EAPC, edition: "EAPC sedation framework 2009, Appendix 2" }),
        reg({ indication: "Sedation in extreme tolerance to benzodiazepines and opioids (specialist)", patientGroup: "Adults under anaesthetic or specialist palliative supervision", genericName: "Propofol", dose: "Start 0.5 mg/kg per hour; usual 1–4 mg/kg per hour", route: "IV infusion", frequency: "Continuous", duration: "As needed; change infusion tubing and discard unused drug every 12 hours", adjustments: ["Specialist-only option; no renal or hepatic adjustment is given in the source."], monitoring: ["Assess every 20 minutes until adequate sedation, then at least three times daily."], contraindications: ["Contraindications are not listed in the source; check product information."], src: EAPC, edition: "EAPC sedation framework 2009, Appendix 2" }),
        reg({ indication: "Sedation when benzodiazepine and opioid tolerance is extreme (specialist)", patientGroup: "Adults under specialist supervision", genericName: "Pentobarbital", dose: "Loading 2–3 mg/kg slow IV push, no faster than 50 mg per minute; infusion 1–2 mg/kg per hour then titrate", route: "IV", frequency: "Loading then continuous infusion", duration: "As needed", adjustments: ["No analgesic effect; the source gives no renal or hepatic adjustment."], monitoring: ["Assess every 20 minutes until adequate sedation, then at least three times daily."], contraindications: ["Contraindications are not listed in the source; availability in Saudi Arabia is unverified."], src: EAPC, edition: "EAPC sedation framework 2009, Appendix 2" }),
      ],
    },
    teach: teachOf([
      { ref: EAPC, edition: "EAPC sedation framework 2009, Appendices 1–2; Recommendations 1–10", locator: "Pre-sedation assessment; Decision-making and consent; Appendix 2 drug doses; Recommendations 1–10" },
    ], ["Distinguish refractory from treatable symptoms.", "Apply proportionate, lowest-effective sedation with consent and monitoring."],
      ["Exclude treatable causes first.", "Assess at least every 20 minutes until sedated, then at least three times daily.", "Hydration and nutrition are a separate decision."],
      ["Using opioids as sedatives.", "Reducing sedation for gradual respiratory decline in imminent death.", "Sedating for psychological distress without multidisciplinary review."]),
    edu: ["Explain to patient (where capable) and family the aims, expected effects, risks and continued comfort care.", "Explain that sedation treats suffering and that artificial hydration or nutrition is decided separately."],
    life: ["Continue dignified care: oral, eye and skin care and a calm environment."],
    mdt: ["Specialist palliative care team; ethics advice where uncertain; psychiatry if capacity is doubtful; chaplaincy or spiritual care; nursing team for monitoring."],
    discharge: ["Not applicable as a discharge topic; document the plan, the proxy involvement and the family discussion, and continue care in the current setting."],
    follow: "Document each dose change and response; revisit goals with family and team; offer bereavement support and care for staff.",
  },
  {
    key: "pp-psychosis", draftTitle: "Postpartum Psychosis: Emergency Assessment and Mother and Baby Unit Admission", pillar: "Safe Birth", authority: "NICE",
    scope: "Recognition of postpartum psychosis, immediate specialist assessment, mother and baby unit admission and medicine safety around breastfeeding, from NICE CG192.",
    unverified: [
      "The last 14,035 characters of the CG192 text were not read.",
      "No Saudi guideline on perinatal psychosis was opened; availability of mother and baby units in Saudi Arabia was not verified.",
      "CG192 gives no doses; drug choice is for the perinatal psychiatrist.",
      "Recommendations 1.8.22–1.8.23 (ECT, rapid tranquillisation) appear under pregnancy and are not applied to the postnatal period here.",
      "EPDS, PHQ-9 and GAD-7 cut-off scores are not given in CG192.",
      "SFDA registration was not verified.",
    ],
    mech: [
      "Postpartum psychosis affects 1 to 2 in 1,000 women who have given birth and can become very severe extremely quickly.",
      "It is often accompanied by manic or depressive symptoms.",
      "Women with bipolar I disorder are at particular risk, but it can occur with no psychiatric history.",
      "Bipolar disorder shows a higher relapse rate and first presentation in the postnatal period, mostly in the first few weeks.",
      "Past or present severe mental illness, or a first-degree relative with severe perinatal mental illness, raises risk in the first 2 weeks.",
    ],
    symptoms: ["Sudden onset of manic, psychotic or severe depressive symptoms in the first weeks after childbirth."],
    signs: ["Rapid worsening of mental state over hours to days.", "Mania or depressive features recorded at assessment."],
    red: [
      "Sudden-onset symptoms in the first 2 weeks after childbirth, especially with past or present severe mental illness or a first-degree relative with severe perinatal mental illness.",
      "Need for inpatient mental health care within 12 months of childbirth: mother and baby unit admission is the norm.",
      "Taking lithium, valproate or carbamazepine, or clozapine while breastfeeding.",
    ],
    precip: ["Childbirth.", "Bipolar disorder, particularly bipolar I.", "Previous severe mental illness or severe perinatal illness in a first-degree relative.", "Stopping lithium in pregnancy, which raises relapse risk."],
    diffs: [
      { condition: "Relapse of bipolar disorder after childbirth", distinguishingFeatures: "Known bipolar disorder, especially after stopping lithium; same emergency pathway." },
      { condition: "Postnatal depression or anxiety", distinguishingFeatures: "Monitored with validated tools (EPDS, PHQ-9, GAD-7); psychosis or mania needs urgent specialist assessment." },
    ],
    criteria: [
      { criterion: "Immediate assessment", threshold: "Within 4 hours of referral for sudden-onset symptoms (Rec 1.5.12)." },
      { criterion: "Heightened vigilance", threshold: "First 2 weeks after childbirth with past or present severe mental illness or family history (Rec 1.5.11)." },
      { criterion: "Inpatient admission", threshold: "Specialist mother and baby unit within 12 months of childbirth unless specific reasons not to (Rec 1.10.1)." },
    ],
    rule_in: [
      inv("Specialist perinatal mental health assessment", "Mental state and risk", "Postpartum psychosis", "Mania, psychosis or severe depression", "Refer to secondary mental health service, preferably specialist perinatal, for immediate assessment within 4 hours of referral.", "No psychotic or manic symptoms", cg192("Rec 1.5.11–1.5.12"), "specializedAdjunctive"),
      inv("Validated screening tools (EPDS, PHQ-9, GAD-7)", "Mood and anxiety", "Postnatal depression and anxiety", "Elevated scores", "Use for regular monitoring; they do not replace urgent specialist assessment when psychosis is suspected.", "Score below the published cut-off of the tool used; CG192 gives no cut-off", cg192("Rec 1.4.8–1.4.9"), "specializedAdjunctive"),
      inv("Medical stability check before medication review", "Physical state", "Fitness for psychotropic changes", "Medically unstable", "Review, adjust, start or restart psychotropic medicines once medically stable.", "Medically stable", cg192("Rec 1.9.1"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Serum lithium level (if taking lithium)", "Lithium concentration", "Toxicity or relapse risk", "Level outside the specialist's target range", "Monitor more often in pregnancy and postnatally; in pregnancy check every 4 weeks then weekly from week 36 and 12 hours after the last dose in labour.", "Within the specialist-set therapeutic range; CG192 gives no numeric range", cg192("Rec 1.4.34; 1.4.37"), "laboratory"),
      inv("Neonatal assessment after psychotropic exposure", "Infant status", "Neonatal adverse effects", "Delayed-onset adverse effects", "Carry out a full neonatal assessment and monitor the baby while the mother takes psychotropic medicine during breastfeeding.", "No adverse effects in the infant", cg192("Rec 1.9.2; 1.9.11"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "recognise", title: "Recognise and refer", timeframe: "Immediately", actions: ["Be alert in the first 2 weeks after childbirth, particularly with past or present severe mental illness or a first-degree relative with severe perinatal mental illness.", "For sudden-onset symptoms, refer to a secondary mental health service, preferably specialist perinatal, for immediate assessment within 4 hours of referral."] },
      { id: "admit", title: "Admit to a mother and baby unit", timeframe: "On the specialist's assessment", actions: ["A woman needing inpatient mental health care within 12 months of childbirth should normally be admitted to a specialist mother and baby unit unless there are specific reasons not to.", "Units usually have 6 to 12 beds and work closely with community services."] },
      { id: "medicines", title: "Choose medicines with a perinatal psychiatrist", timeframe: "Once medically stable", actions: ["Review, adjust, start or restart psychotropic medicines once medically stable.", "Encourage breastfeeding unless taking carbamazepine, clozapine or lithium; support her choice of feeding method.", "Do not offer valproate to women planning pregnancy, pregnant or considering breastfeeding.", "Do not offer depot antipsychotics to women considering breastfeeding unless she responds well to a depot and has a history of non-adherence to oral medicine."] },
      { id: "infant", title: "Protect the infant", timeframe: "While on psychotropic medicine", actions: ["Monitor the baby for adverse effects of maternal psychotropic medicine during breastfeeding.", "Carry out a full neonatal assessment after exposure in pregnancy.", "Lithium may reach toxic levels in breast milk: monitor levels more frequently."] },
    ],
    meds: localDrug("CG192 sets no doses. Antipsychotic and lithium choice and dosing are decided by the perinatal psychiatrist with breastfeeding, infant monitoring and lithium level checks. Valproate must not be offered in pregnancy planning, pregnancy or breastfeeding. SFDA registration was not verified; check hospital formulary."),
    teach: teachOf([
      { ref: CG192, edition: "NICE CG192, Rec 1.4.6–1.4.37; 1.5.11–1.5.12; 1.9.1–1.9.11; 1.10.1–1.10.5", locator: "Rec 1.5.11–1.5.12; 1.9.1; 1.9.8–1.9.11; 1.10.1–1.10.5" },
    ], ["Recognise postpartum psychosis risk and presentation.", "Arrange specialist assessment within 4 hours and mother and baby unit admission."],
      ["Immediate assessment within 4 hours of referral.", "Admit to a mother and baby unit within 12 months of childbirth.", "Valproate is not offered to women who may breastfeed or conceive."],
      ["Treating sudden-onset symptoms as routine postnatal low mood.", "Separating mother and baby by default when a mother and baby unit is available.", "Missing lithium accumulation in breast milk."]),
    edu: ["Explain to the woman and family that postpartum psychosis is a medical emergency that responds to treatment.", "Explain infant monitoring if breastfeeding on medicine."],
    life: ["Protect sleep and a safe, supervised environment with the baby."],
    mdt: ["Specialist perinatal mental health team; mother and baby unit; obstetrics; neonatology or paediatrics; health visitor or primary care."],
    discharge: ["Stable mental state agreed by the perinatal team.", "Medication plan, feeding plan and relapse-warning plan agreed with the woman and family.", "Community perinatal follow-up arranged."],
    follow: "Regular monitoring of symptoms through pregnancy and the postnatal period, especially the first few weeks after childbirth; review of psychotropic medicine and infant monitoring by the perinatal team.",
  },
  {
    key: "ovarian-cyst", draftTitle: "Ruptured Ovarian Cyst and Acute Adnexal Pain: ED Assessment", pillar: "Urgent Care", authority: "Other",
    scope: "Premenopausal adult with acute adnexal pain in the emergency department (ED): pregnancy test first, ultrasound, ruptured or haemorrhagic cyst versus torsion, haemodynamic triage and surgical referral.",
    unverified: [
      "No national or specialty-society management guideline for ruptured ovarian cyst was opened; sources are a StatPearls review, an ACR imaging document, an ultrasound review and one single-centre retrospective study.",
      "No Saudi guideline was opened.",
      "None of the sources gives analgesic doses or a transfusion threshold.",
      "The conservative-versus-surgery criteria and risk factors come from one retrospective study (78 women) and need validation.",
      "The ACR 2023 narrative sections were empty in the opened page; only variant ratings were read.",
      "SFDA registration is not applicable because no medicine is prescribed here.",
    ],
    mech: [
      "Functional follicular and corpus luteum cysts can bleed or rupture; corpus luteum cysts are more likely to haemorrhage.",
      "Rupture releases complex or echogenic free fluid; occasionally significant haemoperitoneum tracks into the upper abdomen.",
      "Significant blood loss can cause haemodynamic instability.",
      "Ovarian torsion is a separate gynaecological emergency and normal Doppler flow does not exclude it.",
      "A positive pregnancy test changes the pathway toward ectopic pregnancy.",
    ],
    symptoms: ["Unilateral lower abdominal pain, sudden and sharp.", "Nausea and vomiting.", "Irregular menses or abnormal vaginal bleeding.", "Pain after strenuous activity or intercourse."],
    signs: ["Lower abdominal tenderness.", "Tachycardia, hypotension or low diastolic pressure with significant bleeding."],
    red: [
      "Haemodynamic instability.",
      "Suspected torsion.",
      "Positive pregnancy test.",
      "Severe or persistent pain despite analgesia, falling haemoglobin or increasing haemoperitoneum on repeat imaging.",
      "Cyst over 10 cm, complex multilocular mass, solid components, thick septations, ascites or increased Doppler vascularity: suspect a neoplasm.",
    ],
    precip: ["Strenuous activity or intercourse.", "Rapid growth or haemorrhage of a functional cyst.", "Corpus luteum cysts (more likely to haemorrhage)."],
    diffs: [
      { condition: "Ectopic pregnancy", distinguishingFeatures: "Positive β-human chorionic gonadotrophin (β-hCG); a ruptured haemorrhagic cyst was found at laparoscopy for suspected ectopic in one reported case." },
      { condition: "Ovarian torsion", distinguishingFeatures: "Doppler flow can be normal (27% of left and 61% of right torsion cases); suspicion alone is a surgical indication." },
      { condition: "Pelvic inflammatory disease or urinary tract infection or stone", distinguishingFeatures: "Endocervical swabs and urinalysis." },
      { condition: "Non-gynaecological cause", distinguishingFeatures: "ACR variants 3–4 favour abdominal and pelvic ultrasound; computed tomography (CT) may be appropriate when β-hCG is negative." },
    ],
    criteria: [
      { criterion: "Surgery (single-centre institutional practice)", threshold: "Unstable vital signs, significant haemoglobin fall or increasing haemoperitoneum, or severe persistent pain despite analgesia." },
      { criterion: "Risk factors for surgery in one retrospective study", threshold: "Diastolic pressure 70 mmHg or lower and total pelvic fluid depth 5.6 cm or more; surgery rate 6.5% with neither, 15.8% with one, 77.8% with both." },
      { criterion: "Unilocular cyst", threshold: "Under 10 cm is usually benign; serial transvaginal ultrasound if asymptomatic." },
    ],
    rule_in: [
      inv("Urine or serum β-hCG", "Pregnancy status", "Ectopic pregnancy", "Positive", "Test first in every premenopausal patient; a positive result changes the imaging pathway.", "Negative", sp("Evaluation"), "laboratory"),
      inv("Transvaginal ultrasound", "Ovary and pelvic fluid", "Ruptured or haemorrhagic cyst", "Complex cyst with lace-like reticulation or retracting clot; complex echogenic free fluid", "First-line imaging; also assesses size, septations, solid components and free fluid.", "Dominant follicle up to about 2.5–3.0 cm and no complex free fluid", dup("Functional and Hemorrhagic Ovarian Cysts; Figs. 5–6"), "firstLineImaging"),
      inv("Colour Doppler of the adnexa", "Ovarian blood flow", "Torsion", "Reduced or absent flow supports torsion", "Normal flow does not exclude torsion.", "Arterial and venous flow present (does not exclude torsion)", sp("Evaluation"), "firstLineImaging"),
      inv("Haemoglobin and haematocrit", "Blood loss", "Haemorrhage", "Low or falling on repeat testing", "In one study the 4-hour haemoglobin fall averaged 1.6 g/dL (surgery group) and 1.2 g/dL (conservative group); repeat during observation.", "Typical adult woman 12–15 g/dL; laboratory range applies", sp("Evaluation"), "laboratory"),
    ],
    rule_out: [
      inv("Urinalysis and endocervical swabs", "Infection or stone", "Urinary tract infection, stone or pelvic inflammatory disease", "Positive urinalysis or swab", "Excludes common alternative causes.", "Negative urinalysis and swabs", sp("Evaluation"), "laboratory"),
      inv("CT abdomen and pelvis with intravenous contrast", "Free fluid and non-gynaecological cause", "Haemoperitoneum or alternative cause", "Fluid above 30 Hounsfield units suggests haemoperitoneum", "Not for initial evaluation per StatPearls; ACR rates it may be appropriate when β-hCG is negative.", "No free fluid", acr("Variants 2 and 4"), "advancedImaging"),
      inv("Magnetic resonance imaging (MRI) of the pelvis", "Adnexal characterisation", "Equivocal ultrasound", "Characterises haemorrhagic content", "ACR: usually not appropriate when β-hCG is positive; may be appropriate when negative.", "Normal ovaries", acr("Variants 1 and 2"), "advancedImaging"),
      inv("CA-125", "Tumour marker", "Ovarian malignancy", "Raised, especially in postmenopausal women", "Most useful with ultrasound in postmenopausal women.", "Below 35 U/mL", sp("Evaluation"), "laboratory"),
    ],
    steps: [
      { id: "stabilise", title: "Triage and stabilise", timeframe: "Immediately", actions: ["Check vital signs; significant blood loss can cause haemodynamic instability.", "If unstable, arrange urgent gynaecology or surgical review; laparotomy is usually preferred in unstable patients."] },
      { id: "pregnancy", title: "Pregnancy test first", timeframe: "On arrival", actions: ["Do a urine or serum β-hCG in every premenopausal patient before imaging choices.", "If positive, follow the ectopic pregnancy pathway; ultrasound (duplex Doppler adnexa, transabdominal, transvaginal) is usually appropriate and MRI and CT are usually not."] },
      { id: "image", title: "Image", timeframe: "First hours", actions: ["Transvaginal ultrasound first with Doppler; look for lace-like reticulation, retracting clot and echogenic free fluid.", "Add haemoglobin; urinalysis and endocervical swabs for alternative causes.", "Do not use normal Doppler flow to exclude torsion."] },
      { id: "dispose", title: "Choose conservative care or surgery", timeframe: "After imaging and first haemoglobin", actions: ["Stable with mild-to-moderate symptoms: manage expectantly with observation of vital signs and haemoglobin, and repeat imaging if bleeding is suspected.", "Surgery (all operations were laparoscopic in the cited study; laparotomy is usually preferred if the patient is unstable) for unstable vital signs, significant haemoglobin fall or increasing haemoperitoneum, severe or persistent pain despite analgesics, suspected torsion or suspected malignancy.", "Significant blood loss may need admission, surgical evacuation and transfusion."] },
      { id: "follow-up", title: "Follow-up", timeframe: "At discharge", actions: ["Asymptomatic unilocular cyst under 10 cm: serial transvaginal ultrasound; persistence after several cycles needs further workup.", "Endometrioma: ultrasound 6 to 12 weeks after the first scan; refer cysts with malignant features."] },
    ],
    meds: localDrug("None of the sources opened gives analgesic doses or a transfusion threshold. Follow the emergency department analgesia protocol and the hospital major-haemorrhage and blood transfusion policy."),
    comparison: {
      title: "Role of CT and MRI in acute adnexal pain",
      columns: ["StatPearls Ovarian Cyst 2023", "ACR Appropriateness Criteria 2023"],
      rows: [
        { parameter: "Initial imaging", values: ["Transvaginal ultrasound first line; MRI or CT not recommended for initial evaluation.", "Ultrasound usually appropriate in all variants."] },
        { parameter: "CT when β-hCG negative", values: ["Not recommended initially.", "CT abdomen and pelvis with contrast may be appropriate (gynaecological) or usually appropriate (non-gynaecological suspicion)."] },
        { parameter: "MRI", values: ["Not recommended initially.", "Pelvic MRI may be appropriate when β-hCG is negative; usually not appropriate when positive."] },
      ],
      note: "Shown side by side and not merged; the pregnancy test decides which applies.",
    },
    teach: teachOf([
      { ref: STATP, edition: "StatPearls Ovarian Cyst 2023, Evaluation; Treatment and Management; Red Flags", locator: "Evaluation; Treatment and Management; Red Flags" },
      { ref: ACR, edition: "ACR Appropriateness Criteria Acute Pelvic Pain 2023, Variants 1–4", locator: "Variants 1–4" },
      { ref: DUPUIS, edition: "Dupuis and Kim 2015, Functional and Hemorrhagic Ovarian Cysts; Figs. 5–6", locator: "Functional and Hemorrhagic Ovarian Cysts; Figs. 5–6" },
      { ref: KIM, edition: "Kim et al 2014, Results; Table 3", locator: "Results; Table 3" },
    ], ["Order pregnancy test before imaging.", "Triage between conservative care and surgery using haemodynamics, haemoglobin and imaging."],
      ["Pregnancy test is the first test.", "Normal Doppler does not exclude torsion.", "Most stable ruptured cysts are managed expectantly."],
      ["Excluding torsion on normal flow.", "Discharging without a repeat haemoglobin after rupture with free fluid.", "Over-relying on one retrospective study's thresholds."]),
    edu: ["Return for worsening pain, faintness, heavy bleeding or fever.", "Explain that most functional cysts resolve on their own."],
    life: ["Avoid strenuous activity and intercourse until pain settles, as advised by the treating team."],
    mdt: ["Gynaecology; general surgery if non-gynaecological cause; radiology; gynaecological oncology for cysts with malignant features."],
    discharge: ["Haemodynamically stable with stable haemoglobin on repeat testing.", "Pain controlled on oral analgesia.", "Safety-net advice and follow-up imaging booked where needed."],
    follow: "Repeat ultrasound for persistent or complex cysts (endometrioma at 6 to 12 weeks, dermoid yearly); gynaecology review for any red-flag feature.",
  },
];
