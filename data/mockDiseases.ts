export type ApprovalStatus = "Approved" | "Draft";

export type ModelOfCarePillar =
  | "urgent-care"
  | "chronic-care"
  | "keep-well"
  | "planned-care"
  | "safe-birth"
  | "palliative-care";

export type PathwayBranch = {
  condition: string;
  outcome: string;
};

export type PathwayStep = {
  id: string;
  title: string;
  subtitle: string;
  actions: string[];
  branches?: PathwayBranch[];
};

export type ClinicalPathway = {
  title: string;
  description: string;
  steps: PathwayStep[];
};

export type MockDisease = {
  id: string;
  title: string;
  shortTitle: string;
  aliases: string[];
  summary: string;
  pillar: ModelOfCarePillar;
  sourceAuthority: "Saudi Ministry of Health" | "Saudi Health Council";
  version: string;
  lastReviewed: string;
  updatedAt: string;
  approvalStatus: ApprovalStatus;
  redFlags: string[];
  pathway?: ClinicalPathway;
  sourceNote?: string;
};

export type CarePillar = {
  id: ModelOfCarePillar;
  title: string;
  description: string;
  icon: "siren" | "heart-pulse" | "shield-check" | "calendar-check" | "baby" | "heart-handshake";
};

export const carePillars: CarePillar[] = [
  { id: "urgent-care", title: "Urgent Care", description: "Time-critical assessment, stabilisation and escalation pathways.", icon: "siren" },
  { id: "chronic-care", title: "Chronic Care", description: "Long-term condition management and coordinated follow-up.", icon: "heart-pulse" },
  { id: "keep-well", title: "Keep Well", description: "Prevention, screening, immunisation and health promotion.", icon: "shield-check" },
  { id: "planned-care", title: "Planned Care", description: "Elective pathways, preparation and recovery standards.", icon: "calendar-check" },
  { id: "safe-birth", title: "Safe Birth", description: "Antenatal, intrapartum and postnatal care pathways.", icon: "baby" },
  { id: "palliative-care", title: "Palliative Care", description: "Comfort, shared decisions and end-of-life support.", icon: "heart-handshake" },
];

export const adultDkaHhsPathway: ClinicalPathway = {
  title: "Adult DKA/HHS Protocol",
  description: "A structured UI demonstration of assessment, treatment and decision branches.",
  steps: [
    {
      id: "recognise",
      title: "Recognise and assess",
      subtitle: "Confirm the presentation and assess immediate stability.",
      actions: [
        "Record airway, breathing, circulation, neurological status and fluid balance.",
        "Obtain bedside glucose and ketones, venous blood gas, electrolytes, urea and creatinine.",
        "Look for a precipitating cause and request senior review early.",
      ],
    },
    {
      id: "potassium",
      title: "Check potassium before insulin",
      subtitle: "Use the current potassium result to choose the safe next action.",
      actions: ["Start cardiac monitoring when clinically indicated.", "Repeat potassium according to the locally approved monitoring schedule."],
      branches: [
        { condition: "If K+ < 3.3 mmol/L", outcome: "Hold insulin and replace potassium with urgent senior oversight." },
        { condition: "If K+ is 3.3–5.2 mmol/L", outcome: "Add potassium to fluids according to the approved local protocol." },
        { condition: "If K+ > 5.2 mmol/L", outcome: "Do not add potassium initially; monitor closely and reassess." },
      ],
    },
    {
      id: "fluids",
      title: "Begin fluid replacement",
      subtitle: "Restore circulating volume while accounting for individual risk.",
      actions: [
        "Use isotonic crystalloid as directed by the approved local protocol.",
        "Adjust the rate for haemodynamic status, age, renal impairment and heart failure risk.",
        "Document input, output and clinical response.",
      ],
    },
    {
      id: "insulin",
      title: "Start fixed-rate insulin",
      subtitle: "Only after potassium and fluid priorities have been addressed.",
      actions: [
        "Use the locally approved weight-based infusion dose and independent medication check.",
        "Continue background basal insulin when specified by local policy.",
        "Do not use this UI demonstration to calculate or prescribe a dose.",
      ],
    },
    {
      id: "monitor",
      title: "Monitor response and resolve",
      subtitle: "Trend biochemical and clinical recovery; escalate unexpected change.",
      actions: [
        "Repeat glucose, ketones, electrolytes and acid-base assessment at locally approved intervals.",
        "Review fluid balance, neurological status and treatment complications.",
        "Transition only when resolution criteria are met and a safe ongoing plan is documented.",
      ],
      branches: [
        { condition: "If targets are improving", outcome: "Continue the pathway and planned monitoring." },
        { condition: "If targets are not improving", outcome: "Reassess diagnosis, delivery systems and precipitating factors; escalate care." },
      ],
    },
  ],
};

export const mockDiseases: MockDisease[] = [
  {
    id: "adult-dka-hhs",
    title: "Adult Diabetic Ketoacidosis & Hyperosmolar Hyperglycaemic State",
    shortTitle: "Adult DKA/HHS",
    aliases: ["DKA", "HHS", "diabetic ketoacidosis", "hyperosmolar state"],
    summary: "Recognition, early stabilisation, electrolyte decisions and monitored resolution.",
    pillar: "urgent-care",
    sourceAuthority: "Saudi Ministry of Health",
    version: "2.4",
    lastReviewed: "02 October 2026",
    updatedAt: "2026-10-02",
    approvalStatus: "Approved",
    redFlags: [
      "Haemodynamic instability, reduced consciousness or rapidly worsening observations.",
      "Severe potassium abnormality, significant cardiac or renal comorbidity, or suspected cerebral oedema.",
      "Failure to improve despite initial treatment or uncertainty about DKA/HHS overlap.",
    ],
    pathway: adultDkaHhsPathway,
  },
  {
    id: "sepsis-adult",
    title: "Adult Sepsis Recognition and Escalation",
    shortTitle: "Adult Sepsis",
    aliases: ["sepsis", "septic shock", "infection"],
    summary: "Early recognition, severity assessment and time-critical escalation.",
    pillar: "urgent-care",
    sourceAuthority: "Saudi Health Council",
    version: "1.8",
    lastReviewed: "28 September 2026",
    updatedAt: "2026-09-28",
    approvalStatus: "Approved",
    redFlags: ["Suspected infection with shock, altered mental status or rapidly worsening observations."],
  },
  {
    id: "adult-asthma",
    title: "Adult Asthma Long-Term Management",
    shortTitle: "Adult Asthma",
    aliases: ["asthma", "wheeze", "airway disease"],
    summary: "Assessment, stepped care, inhaler review and planned follow-up.",
    pillar: "chronic-care",
    sourceAuthority: "Saudi Ministry of Health",
    version: "3.1",
    lastReviewed: "22 September 2026",
    updatedAt: "2026-09-22",
    approvalStatus: "Approved",
    redFlags: ["Severe breathlessness, exhaustion, cyanosis or reduced conscious level requires urgent escalation."],
  },
  {
    id: "type-2-diabetes",
    title: "Type 2 Diabetes Integrated Care",
    shortTitle: "Type 2 Diabetes",
    aliases: ["T2DM", "diabetes", "glycaemic care"],
    summary: "Risk review, treatment planning and complication surveillance.",
    pillar: "chronic-care",
    sourceAuthority: "Saudi Health Council",
    version: "2.0",
    lastReviewed: "18 September 2026",
    updatedAt: "2026-09-18",
    approvalStatus: "Draft",
    redFlags: ["Acute metabolic decompensation or serious hypoglycaemia requires urgent assessment."],
  },
  {
    id: "adult-immunisation",
    title: "Adult Immunisation Schedule",
    shortTitle: "Adult Immunisation",
    aliases: ["vaccination", "vaccines", "immunization"],
    summary: "Eligibility, schedule review and shared preventive-care decisions.",
    pillar: "keep-well",
    sourceAuthority: "Saudi Ministry of Health",
    version: "2026.2",
    lastReviewed: "15 September 2026",
    updatedAt: "2026-09-15",
    approvalStatus: "Approved",
    redFlags: ["Suspected anaphylaxis after vaccination requires immediate emergency management."],
  },
  {
    id: "colorectal-screening",
    title: "Colorectal Cancer Screening",
    shortTitle: "Colorectal Screening",
    aliases: ["bowel screening", "FIT", "colorectal cancer"],
    summary: "Risk-based eligibility, testing and referral workflow.",
    pillar: "keep-well",
    sourceAuthority: "Saudi Health Council",
    version: "1.3",
    lastReviewed: "10 September 2026",
    updatedAt: "2026-09-10",
    approvalStatus: "Draft",
    redFlags: ["Alarm symptoms should enter the appropriate diagnostic pathway rather than routine screening."],
  },
  {
    id: "preoperative-assessment",
    title: "Adult Pre-operative Assessment",
    shortTitle: "Pre-operative Assessment",
    aliases: ["pre-op", "surgical assessment", "elective surgery"],
    summary: "Readiness assessment, medication review and peri-operative planning.",
    pillar: "planned-care",
    sourceAuthority: "Saudi Health Council",
    version: "1.6",
    lastReviewed: "07 September 2026",
    updatedAt: "2026-09-07",
    approvalStatus: "Approved",
    redFlags: ["Unstable acute illness or decompensated comorbidity requires senior review before planned surgery."],
  },
  {
    id: "antenatal-hypertension",
    title: "Hypertension in Pregnancy",
    shortTitle: "Hypertension in Pregnancy",
    aliases: ["pre-eclampsia", "preeclampsia", "gestational hypertension"],
    summary: "Recognition, maternal-fetal assessment and escalation planning.",
    pillar: "safe-birth",
    sourceAuthority: "Saudi Ministry of Health",
    version: "2.2",
    lastReviewed: "01 September 2026",
    updatedAt: "2026-09-01",
    approvalStatus: "Approved",
    redFlags: ["Severe hypertension, neurological symptoms, epigastric pain or fetal concern requires urgent obstetric review."],
  },
  {
    id: "last-days-of-life",
    title: "Care in the Last Days of Life",
    shortTitle: "Last Days of Life",
    aliases: ["end of life", "terminal care", "comfort care"],
    summary: "Recognition, comfort priorities and communication with patients and families.",
    pillar: "palliative-care",
    sourceAuthority: "Saudi Health Council",
    version: "1.1",
    lastReviewed: "26 August 2026",
    updatedAt: "2026-08-26",
    approvalStatus: "Draft",
    redFlags: ["Uncontrolled distress or an unexpected clinical change requires prompt senior reassessment."],
  },
];

export const recentlyUpdatedProtocols = [...mockDiseases]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 4);

export function getMockDisease(id: string) {
  return mockDiseases.find((disease) => disease.id === id);
}
