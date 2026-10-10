import type { Competency, DemoUser, DiseaseTopic } from "@/lib/types";

export const demoUser: DemoUser = {
  id: "usr_demo_tabassum",
  name: "Dr. Tabassum",
  initials: "DT",
  role: "Specialist",
  specialty: "General Medicine",
  organizationId: "org_nour_demo",
  organizationName: "Nour Medical Centre — Demo"
};

export const governanceUser: DemoUser = {
  id: "usr_demo_sarah",
  name: "Dr Sarah Alqahtani",
  initials: "SA",
  role: "Clinical Governance Lead",
  specialty: "Clinical Governance",
  organizationId: "org_nour_demo",
  organizationName: "Nour Medical Centre — Demo"
};

export const diseases: DiseaseTopic[] = [
  {
    id: "dis_copd",
    slug: "copd-exacerbation",
    name: "Acute exacerbation of COPD",
    arabicName: "التفاقم الحاد لمرض الانسداد الرئوي المزمن",
    abbreviations: ["COPD", "AECOPD"],
    synonyms: ["acute COPD exacerbation", "chronic obstructive pulmonary disease flare"],
    symptoms: ["shortness of breath", "dyspnoea", "cough", "wheeze"],
    specialty: "Respiratory medicine",
    summary: "A structured demonstration pathway for recognising deterioration, assessing severity and escalating care.",
    updatedAt: "2026-09-28",
    demoOnly: true,
    source: {
      id: "src_copd_demo",
      title: "Illustrative COPD Pathway — Product Demonstration",
      issuingOrganization: "Marifa Demonstration Team",
      sourceType: "educational",
      jurisdiction: "Demonstration only — not jurisdictional guidance",
      publicationDate: "2026-09-20",
      lastVerifiedDate: "2026-09-28",
      reviewDate: "2026-12-20",
      version: "0.3-demo",
      status: "draft",
      localAdaptationStatus: "illustrative"
    },
    sections: [
      { title: "Clinical use warning", content: "This record demonstrates Marifa's information structure. It is not a clinical protocol and must not be used to make treatment decisions.", tone: "critical" },
      { title: "Overview", content: "This illustrative page shows how concise guidance, source metadata and local approval status can be presented together." },
      { title: "Initial assessment", content: "Assess immediate clinical stability and use the hospital's currently approved assessment process. No thresholds or treatment instructions are supplied in this demo." },
      { title: "Escalation", content: "Escalate without delay when urgent clinical concerns are present, following the hospital's approved emergency and senior-review procedures.", tone: "warning" },
      { title: "Local pathway", content: "No hospital-approved COPD protocol has been connected to this demonstration workspace." }
    ],
    pathway: {
      title: "Illustrative acute respiratory presentation pathway",
      nodes: [
        { id: "start", type: "start", title: "Presentation recognised", detail: "Begin the hospital-approved assessment process.", referenceIds: ["src_copd_demo"] },
        { id: "assess", type: "assessment", title: "Assess immediate stability", detail: "Use locally approved observations and escalation criteria. Demo content intentionally omits clinical thresholds.", emphasis: "warning", referenceIds: ["src_copd_demo"] },
        { id: "decision", type: "decision", title: "Urgent concern?", detail: "Apply the hospital's approved emergency criteria.", referenceIds: ["src_copd_demo"] },
        { id: "escalate", type: "escalation", title: "Escalate immediately", detail: "Activate the locally approved emergency response and senior review route.", emphasis: "critical", referenceIds: ["src_copd_demo"] },
        { id: "routine", type: "action", title: "Continue approved assessment", detail: "Open the verified local protocol when available. This demo provides no treatment recommendation.", referenceIds: ["src_copd_demo"] },
        { id: "end", type: "end", title: "Document and reassess", detail: "Follow local documentation and reassessment policy.", referenceIds: ["src_copd_demo"] }
      ],
      transitions: [
        { from: "start", to: "assess" },
        { from: "assess", to: "decision" },
        { from: "decision", to: "escalate", label: "Yes" },
        { from: "decision", to: "routine", label: "No" },
        { from: "escalate", to: "end" },
        { from: "routine", to: "end" }
      ]
    }
  },
  {
    id: "dis_sepsis",
    slug: "sepsis-recognition",
    name: "Sepsis recognition",
    arabicName: "التعرف على الإنتان",
    abbreviations: ["sepsis"],
    synonyms: ["suspected sepsis", "infection with deterioration"],
    symptoms: ["fever", "confusion", "deterioration"],
    specialty: "Emergency medicine",
    summary: "Illustrative rapid-access record showing source precedence and emergency escalation presentation.",
    updatedAt: "2026-09-24",
    demoOnly: true,
    source: {
      id: "src_sepsis_demo",
      title: "Illustrative Sepsis Recognition Record",
      issuingOrganization: "Marifa Demonstration Team",
      sourceType: "educational",
      jurisdiction: "Demonstration only",
      publicationDate: "2026-09-20",
      lastVerifiedDate: "2026-09-24",
      reviewDate: "2026-12-20",
      version: "0.2-demo",
      status: "draft",
      localAdaptationStatus: "illustrative"
    },
    sections: [
      { title: "Clinical use warning", content: "Illustrative content only. It contains no diagnostic thresholds, timings, medicines or treatment algorithm.", tone: "critical" },
      { title: "Overview", content: "A product demonstration of a time-sensitive pathway record with prominent escalation and provenance." },
      { title: "Local pathway", content: "A verified local sepsis pathway has not been uploaded to this demo organization." }
    ],
    pathway: {
      title: "Illustrative deterioration escalation flow",
      nodes: [
        { id: "start", type: "start", title: "Concern identified", detail: "Start the hospital's approved urgent assessment process.", referenceIds: ["src_sepsis_demo"] },
        { id: "escalate", type: "escalation", title: "Seek urgent senior support", detail: "Use the current local emergency response process.", emphasis: "critical", referenceIds: ["src_sepsis_demo"] },
        { id: "end", type: "end", title: "Continue local pathway", detail: "This demo does not provide clinical instructions.", referenceIds: ["src_sepsis_demo"] }
      ],
      transitions: [{ from: "start", to: "escalate" }, { from: "escalate", to: "end" }]
    }
  },
  {
    id: "dis_aki",
    slug: "acute-kidney-injury",
    name: "Acute kidney injury",
    arabicName: "إصابة الكلى الحادة",
    abbreviations: ["AKI"],
    synonyms: ["acute renal injury", "acute renal impairment"],
    symptoms: ["reduced urine output", "deteriorating renal function"],
    specialty: "Nephrology",
    summary: "Demonstration topic awaiting a verified local pathway and clinical owner review.",
    updatedAt: "2026-09-18",
    demoOnly: true,
    source: {
      id: "src_aki_demo",
      title: "Illustrative AKI Topic Shell",
      issuingOrganization: "Marifa Demonstration Team",
      sourceType: "educational",
      jurisdiction: "Demonstration only",
      publicationDate: "2026-09-18",
      lastVerifiedDate: "2026-09-18",
      reviewDate: "2026-12-18",
      version: "0.1-demo",
      status: "draft",
      localAdaptationStatus: "illustrative"
    },
    sections: [{ title: "Clinical use warning", content: "Topic shell only. No clinical advice is provided.", tone: "critical" }],
    pathway: {
      title: "No verified pathway connected",
      nodes: [{ id: "start", type: "start", title: "Pathway unavailable", detail: "Ask the local clinical governance team for the current approved source.", referenceIds: ["src_aki_demo"] }],
      transitions: []
    }
  }
];

export const competencies: Competency[] = [
  { id: "cmp_ipc", title: "Infection prevention & control", category: "Hospital mandatory", status: "completed", progress: 100, dueDate: "2027-05-12", assessmentType: "Knowledge assessment", practicalSignoffRequired: false },
  { id: "cmp_bls", title: "Basic life support", category: "Emergency readiness", status: "in_progress", progress: 65, dueDate: "2026-10-20", assessmentType: "Learning + practical sign-off", practicalSignoffRequired: true },
  { id: "cmp_med", title: "Medication safety", category: "Hospital mandatory", status: "pending_signoff", progress: 90, dueDate: "2026-10-16", assessmentType: "Scenario assessment + supervisor sign-off", practicalSignoffRequired: true },
  { id: "cmp_incident", title: "Incident reporting", category: "Clinical governance", status: "overdue", progress: 20, dueDate: "2026-10-02", assessmentType: "Policy acknowledgement", practicalSignoffRequired: false }
];

export const announcements = [
  { id: "ann_1", label: "Clinical update", title: "Medication safety policy enters review next week", date: "09 Oct 2026" },
  { id: "ann_2", label: "Governance", title: "Quarterly audit evidence window now open", date: "07 Oct 2026" }
];
