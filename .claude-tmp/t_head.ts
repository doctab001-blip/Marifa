import { SRC, cite, type Spec } from "./common.ts";
const N = (loc: string) => cite(SRC.NG232, `NICE NG232 (updated 2023), ${loc}`);
const txa = {
  indication: "Head injury with GCS 12 or less and no suspected active extracranial bleeding (NICE NG232 1.3.17)",
  patientGroup: "Adults 16 and over (children under 16: 15–30 mg/kg, maximum 2 g)",
  genericName: "Tranexamic acid", dose: "2 g", route: "IV bolus", frequency: "Single dose",
  duration: "One bolus, given as soon as possible within 2 hours of injury and before imaging",
  adjustments: ["Consider rather than routinely give; off-label use at March 2023 (NG232 1.3.17)", "Suspected or confirmed extracranial bleeding: follow the major trauma guideline haemostatic agent recommendations instead (NG232 1.3.18)"],
  monitoring: ["GCS, pupils, limb movements, respiratory rate, heart rate, blood pressure, temperature and oxygen saturation (NG232 1.9.10)", "CT head result"],
  contraindications: ["Suspected or confirmed active extracranial bleeding: separate major trauma pathway (NG232 1.3.17–1.3.18)", "Hypersensitivity to tranexamic acid (check the product label)"],
  sourceTitle: SRC.NG232.title, sourceUrl: SRC.NG232.url, sourceEdition: "NICE NG232, Recommendation 1.3.17",
};
export const specs: Spec[] = [
{
  key: "head-injury-adult", draftTitle: "Minor Head Injury in Adults: Observation and CT Head Rules", pillar: "Urgent Care", authority: "NICE",
  scope: "Adults (16 and over) presenting to a community service or emergency department with a head injury: when to send to hospital, who needs a CT head scan and how fast, observation, admission and discharge criteria. Checked against NICE NG232 recommendations 1.2.2, 1.3.17–1.3.19, 1.4.2–1.4.16, 1.5.1–1.5.14, 1.9.1–1.9.16 and 1.10.1–1.10.14.",
  unverified: ["No Saudi head injury guideline was opened for this version; every threshold is NICE NG232. NG232 does not use the Canadian CT Head Rule, so the CT criteria here are NICE's, not that rule's.", "NG232 criteria for children under 16 are summarised only where they differ and are not the focus of this adult topic.", "Tranexamic acid dose and timing come from NG232 1.3.17; the product label was not opened, so label contraindications are not verified.", "Availability of CT within 1 hour, neurosurgical transfer pathways and the head injury proforma in Saudi hospitals were not assessed.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "A head injury can cause an acute clinically important traumatic brain injury such as intracranial haemorrhage, which CT head imaging is the investigation of choice to detect (NG232 1.5.1).",
    "Risk is highest with reduced consciousness, a suspected skull fracture, seizure, focal deficit or repeated vomiting, which trigger a CT within 1 hour (NG232 1.5.8).",
    "Older age, a bleeding or clotting disorder, a dangerous mechanism or long retrograde amnesia add risk when there has been loss of consciousness or amnesia, so imaging is done within 8 hours (NG232 1.5.9).",
    "Deterioration can be delayed, so observation, supervised discharge and written advice protect those not imaged or with a normal scan (NG232 1.9.11, 1.10.5, 1.10.9).",
  ],
  symptoms: ["Loss of consciousness or amnesia since the injury (NG232 1.5.9).", "Vomiting, headache or confusion.", "Seizure since the injury (NG232 1.5.8).", "New weakness, numbness, speech or visual disturbance (NG232 1.5.8)."],
  signs: ["Glasgow Coma Scale score on arrival and at 2 hours after injury (NG232 1.5.8).", "Signs of basal skull fracture: haemotympanum, panda eyes, cerebrospinal fluid leak from ear or nose, Battle's sign (NG232 1.5.8).", "Suspected open or depressed skull fracture, focal neurological deficit, more than one episode of vomiting (NG232 1.5.8)."],
  red: [
    "Unconsciousness or lack of full consciousness, focal deficit, suspected complex skull fracture or penetrating injury, seizure or a high-energy injury: emergency ambulance to the emergency department (NG232 1.2.2).",
    "GCS 12 or less on assessment, GCS below 15 at 2 hours, suspected open or depressed skull fracture, basal skull fracture sign, seizure, focal deficit or more than 1 vomit: CT head within 1 hour (NG232 1.5.8).",
    "Neurological deterioration on observation: agitation, a sustained 1-point GCS drop for at least 30 minutes, severe or increasing headache, persistent vomiting or new focal signs: urgent reassessment and consider immediate CT (NG232 1.9.13, 1.9.15).",
    "Do not assume a lowered conscious level is intoxication until an important brain injury has been excluded (NG232 1.4.2).",
  ],
  precip: ["Age 65 or over (NG232 1.5.9).", "Bleeding or clotting disorder, or anticoagulant or antiplatelet treatment excluding aspirin monotherapy (NG232 1.5.9, 1.5.13).", "Dangerous mechanism: pedestrian or cyclist struck by a vehicle, ejection from a vehicle, fall above 1 m or 5 stairs (NG232 1.5.9).", "Intoxication or other injuries that obscure assessment (NG232 1.4.2, 1.9.1)."],
  diffs: [
    { condition: "Intoxication", distinguishingFeatures: "Only assume reduced consciousness is intoxication after important traumatic brain injury is excluded (NG232 1.4.2)." },
    { condition: "Concussion without structural injury", distinguishingFeatures: "Symptoms with normal imaging or no indication for early imaging; follow the admission and discharge criteria and refer persistent post-concussion problems (NG232 1.9.1, 1.10.14)." },
    { condition: "Cervical spine injury", distinguishingFeatures: "Assess alongside head injury using the NICE criteria for cervical spine imaging; keep spine precautions (NG232 1.4.8)." },
    { condition: "Non-accidental or safeguarding concern", distinguishingFeatures: "Consider abuse or neglect as a cause; involve a safeguarding-trained clinician (NG232 1.4.12–1.4.13)." },
  ],
  criteria: [
    { criterion: "CT head within 1 hour (age 16 and over)", threshold: "Any of: GCS 12 or less; GCS below 15 at 2 hours; suspected open or depressed skull fracture; basal skull fracture sign; post-traumatic seizure; focal neurological deficit; more than 1 episode of vomiting (NG232 1.5.8)" },
    { criterion: "CT head within 8 hours (age 16 and over)", threshold: "Loss of consciousness or amnesia plus any of: age 65 or over; bleeding or clotting disorder; dangerous mechanism; more than 30 minutes retrograde amnesia. Within the hour if presenting more than 8 hours after injury (NG232 1.5.9)" },
    { criterion: "Anticoagulant or antiplatelet treatment", threshold: "No other CT indication but on anticoagulant or antiplatelet drugs (excluding aspirin monotherapy): consider CT within 8 hours (NG232 1.5.13)" },
    { criterion: "Admit", threshold: "New clinically important imaging abnormality; GCS not back to 15 or baseline after imaging; CT indicated but unavailable or not tolerated; worrying symptoms; other sources of concern (NG232 1.9.1)" },
    { criterion: "Discharge", threshold: "GCS 15 or baseline, no other factor needing admission, and a suitable person at home to supervise (NG232 1.10.2, 1.10.4–1.10.5)" },
    { criterion: "Discuss with a neurosurgeon regardless of imaging", threshold: "GCS 8 or less after resuscitation; confusion persisting over 4 hours; GCS deterioration; progressive focal signs; seizure without full recovery; suspected penetrating injury; CSF leak (NG232 1.4.16)" },
  ],
  rule_in: [
    { name: "CT head scan", target: "Adult meeting a CT criterion", condition: "Acute clinically important traumatic brain injury", finding: "New intracranial haemorrhage or other clinically important abnormality leads to admission and neurosurgical discussion for surgically significant lesions (NG232 1.4.15, 1.9.1).", why: "First-choice investigation; do within 1 hour for high-risk features and within 8 hours for the loss of consciousness or amnesia group; provisional report within 1 hour (NG232 1.5.1, 1.5.8–1.5.9, 1.5.14).", normal: "No acute intracranial haemorrhage, contusion or skull fracture", tier: "firstLineImaging", ref: N("Recommendations 1.5.1, 1.5.8–1.5.9 and 1.5.14") },
    { name: "Glasgow Coma Scale and neurological observations", target: "Every adult with a head injury", condition: "Level of consciousness and deterioration", finding: "GCS below 15 on initial assessment or 2 hours after injury triggers CT; a GCS of 12 or less triggers CT within 1 hour (NG232 1.5.8).", why: "Minimum documented observations: GCS, pupils, limb movements, respiratory rate, heart rate, blood pressure, temperature and oxygen saturation (NG232 1.9.10).", normal: "GCS 15 (or pre-injury baseline), equal reactive pupils, normal limb movement", tier: "specializedAdjunctive", ref: N("Recommendations 1.5.8 and 1.9.10") },
  ],
  rule_out: [
    { name: "Clotting screen or review of anticoagulant history", target: "Adult on anticoagulant or antiplatelet treatment with head injury", condition: "Coagulopathy increasing bleed risk", finding: "Bleeding or clotting disorder is a risk factor for CT within 8 hours (NG232 1.5.9, 1.5.13).", why: "Reversal of vitamin K antagonists and DOACs follows NICE blood transfusion and MHRA advice if haemorrhage is found (NG232 1.5.13).", normal: "No anticoagulant effect on the coagulation screen", tier: "specializedAdjunctive", ref: N("Recommendations 1.5.9 and 1.5.13") },
    { name: "Repeat CT or MRI brain", target: "Normal CT but GCS not 15 after 24 hours of observation", condition: "Missed or evolving injury", finding: "Consider a further CT or MRI and discuss with radiology (NG232 1.9.16).", why: "MRI is not the primary investigation after head injury (NG232 1.5.2).", normal: "No new abnormality", tier: "advancedImaging", ref: N("Recommendations 1.5.2 and 1.9.16") },
  ],
  steps: [
    { id: "community", title: "Community and remote advice", timeframe: "At first contact", actions: ["Emergency ambulance to the emergency department for unconsciousness, focal deficit, suspected complex skull fracture or penetrating injury, seizure or high-energy injury (NG232 1.2.2).", "Do not refer for neuroimaging by direct access from the community (NG232 1.3.19)."] },
    { id: "assess", title: "Assess in the emergency department", timeframe: "Within 15 minutes of arrival", actions: ["Stabilise airway, breathing and circulation first (NG232 1.4.1).", "A trained member of staff assesses within 15 minutes and decides high or low risk (NG232 1.4.7).", "Treat impaired consciousness (GCS below 15) as urgent and do not blame intoxication until brain injury is excluded (NG232 1.4.2, 1.4.4)."] },
    { id: "ct", title: "Decide on CT", timeframe: "Within 1 hour or 8 hours of the injury", actions: ["Apply the 1-hour and 8-hour CT criteria (NG232 1.5.8–1.5.9).", "Consider CT within 8 hours for anticoagulant or antiplatelet users with no other indication (NG232 1.5.13).", "Arrange transfer if CT is not available (NG232 1.5.5)."] },
    { id: "txa", title: "Tranexamic acid", timeframe: "As soon as possible within 2 hours of injury", actions: ["Consider 2 g IV for GCS 12 or less without suspected extracranial bleeding, before imaging (NG232 1.3.17).", "Extracranial bleeding: major trauma guideline (NG232 1.3.18)."] },
    { id: "observe", title: "Observe", timeframe: "Half-hourly until GCS 15; then half-hourly for 2 hours, hourly for 4 hours, then 2-hourly", actions: ["Record GCS, pupils, limb movement, respiratory rate, heart rate, blood pressure, temperature and oxygen saturation (NG232 1.9.10–1.9.11).", "Revert to half-hourly observations if the person deteriorates later (NG232 1.9.12).", "Urgently reassess for agitation, a sustained GCS drop, severe headache or persistent vomiting, or new focal signs; consider immediate CT (NG232 1.9.13, 1.9.15)."] },
    { id: "decide", title: "Admit or discharge", timeframe: "After imaging or when CT is not indicated", actions: ["Admit using the NG232 1.9.1 criteria.", "Discharge only with GCS 15 or baseline, no other reason to admit and someone suitable to supervise; people with no carer need a supervision plan (NG232 1.10.1–1.10.5).", "Discuss with a neurosurgeon for the NG232 1.4.16 features regardless of imaging."] },
  ],
  meds: { status: "source-verified", regimens: [txa], note: "NICE NG232 advises that tranexamic acid 2 g IV be considered for head injury with GCS 12 or less and no suspected active extracranial bleeding (1.3.17); this was off-label in March 2023. NG232 recommends effective pain management to prevent a rise in intracranial pressure and gives no analgesic doses (1.3.11, 1.4.11). SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Apply the NICE 1-hour and 8-hour CT head criteria for adults.", "Set observation frequency and decide on admission or safe discharge."],
    keyPoints: ["CT within 1 hour: GCS 12 or less, GCS below 15 at 2 hours, skull fracture signs, seizure, focal deficit, more than 1 vomit.", "CT within 8 hours: loss of consciousness or amnesia plus age 65+, clotting disorder, dangerous mechanism or over 30 minutes retrograde amnesia.", "Observe half-hourly until GCS 15, then follow the half-hourly, hourly and 2-hourly schedule.", "Discharge only to supervised care, with written advice."],
    pitfalls: ["Assuming intoxication explains a low GCS.", "Referring for direct-access CT from the community.", "Missing the anticoagulant or antiplatelet group.", "Sending someone home alone or without written advice."],
    refs: [{ ref: SRC.NG232, edition: "NICE NG232 (updated 2023)", locator: "Recommendations 1.2.2, 1.3.17–1.3.19, 1.4.2–1.4.16, 1.5.1–1.5.14, 1.9.1–1.9.16, 1.10.1–1.10.14" }],
  },
  edu: ["Give verbal and printed advice to the person and the carer on discharge, including when to return (NG232 1.10.8–1.10.9).", "Explain that some people appear to recover quickly but may have delayed difficulties and who to contact (NG232 1.10.9, 1.10.11)."],
  life: ["A responsible adult stays with the person for the first 24 hours after injury (NG232 1.10.9).", "Advice on return to school, work, sport and driving is included in the printed advice (NG232 1.10.9).", "Offer alcohol or drug advice if intoxicated at presentation (NG232 1.10.10)."],
  mdt: ["Neurosurgery for the NG232 1.4.16 features and for surgically significant imaging findings (NG232 1.4.15–1.4.16).", "Safeguarding-trained clinician in the initial assessment (NG232 1.4.13).", "Brain injury specialist or neurorehabilitation team for persisting problems (NG232 1.10.14).", "Falls assessment or safeguarding referral to investigate the cause (NG232 1.10.13)."],
  discharge: ["GCS 15 or pre-injury baseline (NG232 1.10.4).", "No other reason for admission and a suitable person at home to supervise (NG232 1.10.2, 1.10.5).", "Verbal and printed advice given to the person and carer (NG232 1.10.8)."],
  follow: "Write to the GP within 48 hours of discharge with the history and examination; refer persisting problems to a clinician trained in traumatic brain injury (NG232 1.10.12, 1.10.14).",
},
];
