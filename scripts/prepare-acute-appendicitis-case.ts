import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { ClinicalPathwaySchema } from "../lib/validations/clinical-pathway";
import { validatePathway } from "../lib/pathway-validation";
import type { DiseaseTopic } from "../lib/types";

const root = resolve("outputs/case-improvements/acute-appendicitis-2026-10-11");
const basePath = resolve(root, "live-official-extraction-2026-10-11-b001.json");
const base = JSON.parse(await readFile(basePath, "utf8"));

const sources = {
  wses2025: {
    id: "89d14721-c990-4d43-bf82-81bd777b7a39",
    title: "Diagnosis and Treatment of Acute Appendicitis: 2025 Edition of the WSES Jerusalem Guidelines",
    issuer: "Other" as const,
    edition: "2025 edition; published online 28 January 2026",
    url: "https://doi.org/10.1001/jamasurg.2025.6218",
    locator: "Abstract: Findings and Conclusions; 35 recommendations across six clinical domains",
    primary_source: true,
  },
  wses2020: {
    id: "1919c9db-1113-438a-8a27-9a074856e244",
    title: "Diagnosis and treatment of acute appendicitis: 2020 update of the WSES Jerusalem guidelines",
    issuer: "Other" as const,
    edition: "2020",
    url: "https://wjes.biomedcentral.com/counter/pdf/10.1186/s13017-020-00306-3.pdf",
    locator: "Table 3; recommendations 1.1-1.14, 2.1-2.3, 3.1-3.2, 4.1, 6.1-6.4 and 7.1-7.2",
    primary_source: false,
  },
  mohSurgery: {
    id: "814b2e3f-79a1-4ed4-b0ba-f2277f349ad2",
    title: "MOH Pocket Manual in General Surgery",
    issuer: "MOH" as const,
    edition: "Public MOH edition retrieved 11 October 2026",
    url: "https://www.moh.gov.sa/Documents/MOH%20Pocket%20Manual%20in%20General%20Surgery.pdf",
    locator: "Lower GIT, page 27, Flowchart 5: Acute Appendicitis",
    primary_source: false,
  },
  mohProphylaxis: {
    id: "579048c4-20f8-448a-b027-c0f73568494e",
    title: "Saudi MOH Antibiotics Surgical Prophylaxis",
    issuer: "MOH" as const,
    edition: "Updated 22 May 2021",
    url: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Protocol-015.pdf",
    locator: "Page 1: appendectomy for uncomplicated appendicitis; page 4: prophylaxis duration",
    primary_source: false,
  },
  mohIai: {
    id: "80eaa7d3-d7bd-48c2-96d6-83aa7db183b5",
    title: "Saudi MOH Intra-Abdominal Infection Treatment Protocol",
    issuer: "MOH" as const,
    edition: "First version 2022; stated three-year update cycle",
    url: "https://www.moh.gov.sa/en/Ministry/MediaCenter/Publications/Documents/Internal-Abdominal-infection-Treatment-Protocol.pdf",
    locator: "Pages 2-5: scope, source control, tables 1-2, notes and duration of therapy",
    primary_source: false,
  },
  cefazolinLabel: {
    id: "622df988-3fac-4148-8d45-7e94f7da26ec",
    title: "Cefazolin for Injection prescribing information",
    issuer: "Other" as const,
    edition: "DailyMed label revised February 2024",
    url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d91a8d13-99a0-4d87-88dc-71cbd37922b4",
    locator: "Sections 2.4, 4.1 and 5",
    primary_source: false,
  },
  metronidazoleLabel: {
    id: "fc6d34fc-146a-4f5a-a211-ab1f74ae3e52",
    title: "Metronidazole Injection prescribing information",
    issuer: "Other" as const,
    edition: "DailyMed label revised July 2025",
    url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=843447a5-525c-48ea-860a-230db549fecb",
    locator: "Contraindications; Precautions: hepatic and renal impairment; Drug Interactions",
    primary_source: false,
  },
};

const globalEvidence = {
  sources: [sources.wses2025, sources.wses2020, sources.mohSurgery, sources.mohIai],
  selection_rationale:
    "The current WSES edition governs the international adult pathway. Saudi MOH sources supply local workflow and antimicrobial context. Detailed 2020 recommendation locators are retained where the 2025 open abstract does not expose the complete recommendation text. Conflicts are shown for clinical review rather than silently resolved.",
};

const investigationReferences = [
  { title: sources.wses2025.title, edition: sources.wses2025.edition, url: sources.wses2025.url },
  { title: sources.wses2020.title, edition: sources.wses2020.edition, url: sources.wses2020.url },
];

const prophylaxisEvidence = {
  sources: [
    { ...sources.mohProphylaxis, primary_source: true },
    sources.cefazolinLabel,
    sources.metronidazoleLabel,
  ],
  selection_rationale:
    "The Saudi MOH appendectomy prophylaxis table supplies the dose and timing. Current official labels supplement contraindications, interactions and organ-function cautions; they do not replace local formulary verification.",
};

const content = DiseaseDetailSchema.parse({
  ...base.content,
  authority: "MOH",
  status: "under_review",
  version: "clinical-completion-2026-10-11-v1",
  lastReviewed: "2026-10-11",
  clinicalScenario:
    "Nonpregnant adults with suspected or confirmed acute appendicitis in Saudi emergency and inpatient care. Paediatric, pregnant, immunocompromised and frail older patients require population-specific surgical, radiology and pharmacy review before this draft is used.",
  clinicalReviewStatus: "pending",
  evidenceAudit: undefined,
  pathophysiology: {
    summary:
      "Acute appendicitis is inflammation of the vermiform appendix. Luminal obstruction can initiate distension, bacterial overgrowth, impaired venous and lymphatic drainage, ischaemia and, in some patients, gangrene or perforation; obstruction is not demonstrated in every case. Disease is classified as uncomplicated or complicated because abscess, phlegmon, perforation or peritonitis changes the urgency, source-control plan and antibiotic duration.",
    keyMechanisms: [
      "Appendiceal luminal obstruction or primary mucosal inflammation increases intraluminal pressure and wall oedema.",
      "Impaired venous and lymphatic drainage can progress to mural ischaemia and bacterial translocation.",
      "Gangrene or perforation can produce localized abscess or phlegmon, diffuse peritonitis and sepsis.",
      "Uncomplicated and complicated appendicitis may not represent a single inevitable linear progression, so severity must be assessed clinically and with imaging or operative findings.",
    ],
    references: investigationReferences,
  },
  presentation: {
    symptoms: [
      "Acute abdominal pain, often beginning centrally and localizing to the right lower quadrant",
      "Anorexia, nausea or vomiting",
      "Pain aggravated by movement, coughing or walking",
      "Fever or constitutional upset, which may be absent early",
      "Atypical pain location or muted symptoms in older adults and immunocompromised patients",
    ],
    physicalSigns: [
      "Right lower quadrant tenderness with localized guarding or percussion/cough tenderness",
      "Rebound or involuntary rigidity when peritoneal irritation is present",
      "Fever, tachycardia, dehydration or reduced perfusion when systemic illness develops",
      "A mass or prolonged symptom history suggesting phlegmon or abscess",
      "No single symptom or sign confirms or excludes appendicitis; serial examination and structured risk assessment are required",
    ],
    redFlags: [
      "Generalized peritonitis, rigid abdomen or rapidly worsening pain",
      "Hypotension, altered mental status, oliguria, rising lactate or other features of sepsis/shock",
      "Imaging evidence of perforation, free air, abscess, phlegmon or diffuse contamination",
      "Persistent or progressive right iliac fossa pain despite initially normal or equivocal tests",
      "Pregnancy possibility, age 65 years or older, immunocompromise or severe obesity requiring population-specific assessment",
    ],
  },
  differentials: [
    { condition: "Ectopic pregnancy", distinguishingFeatures: "Pregnancy possibility, pelvic pain, vaginal bleeding, syncope or haemodynamic instability; obtain urgent pregnancy testing and gynaecology assessment." },
    { condition: "Ovarian torsion or ruptured ovarian cyst", distinguishingFeatures: "Sudden unilateral pelvic pain, adnexal tenderness or mass; pelvic ultrasonography and urgent gynaecology review may be required." },
    { condition: "Renal or ureteric colic", distinguishingFeatures: "Colicky flank-to-groin pain, haematuria and urinary tract imaging findings; pyuria or haematuria alone does not exclude appendicitis." },
    { condition: "Pyelonephritis or urinary tract infection", distinguishingFeatures: "Dysuria, frequency, flank tenderness and supportive urine culture; mild urinary abnormalities can occur with appendicitis." },
    { condition: "Gastroenteritis or terminal ileitis", distinguishingFeatures: "Diarrhoea, diffuse cramps or enteric exposure may predominate; persistent focal peritonism or progressive inflammatory markers require reassessment." },
    { condition: "Right-sided diverticulitis or colorectal malignancy", distinguishingFeatures: "CT may show diverticular or colonic pathology; consider particularly in older adults or after a periappendiceal abscess." },
    { condition: "Crohn disease", distinguishingFeatures: "Recurrent symptoms, diarrhoea, weight loss, perianal disease or ileocolonic imaging findings." },
    { condition: "Mesenteric adenitis", distinguishingFeatures: "Often follows viral illness and may show enlarged mesenteric nodes with a normal appendix on imaging." },
  ],
  investigations: {
    ruleIn: [
      {
        tier: "laboratory",
        testName: "Structured clinical risk stratification with AIR or Adult Appendicitis Score",
        modalityTarget: "Initial adult risk group and need for observation or imaging",
        targetCondition: "Suspected acute appendicitis",
        expectedFinding: "A low-risk result supports an alternative or observation pathway; intermediate risk identifies patients for active observation or imaging. A score does not independently establish the diagnosis.",
        clinicalRationale: "Use history, examination, temperature, white-cell count and inflammatory markers in a structured pathway; interpret within age, sex and comorbidity context. Urgency: at first assessment. Limitation: scores can be less reliable in older, pregnant or immunocompromised patients and must not override deterioration or peritonitis.",
        references: investigationReferences,
      },
      {
        tier: "laboratory",
        testName: "Full blood count, C-reactive protein, electrolytes and renal function",
        modalityTarget: "Inflammation, severity, dehydration and contrast/operative readiness",
        targetCondition: "Appendicitis and complications",
        expectedFinding: "Leukocytosis, neutrophilia or raised CRP can support inflammation; renal or electrolyte abnormalities identify resuscitation needs. Normal early results do not exclude appendicitis.",
        clinicalRationale: "Obtain urgently with initial assessment. The tests refine risk and treatment readiness but are nonspecific and must be interpreted with the clinical course and imaging.",
        references: investigationReferences,
      },
      {
        tier: "firstLineImaging",
        testName: "Graded-compression or point-of-care abdominal ultrasound by an experienced operator",
        modalityTarget: "Appendix visualization and secondary inflammatory signs without ionising radiation",
        targetCondition: "Suspected appendicitis after risk stratification",
        expectedFinding: "A visualized inflamed, non-compressible appendix or supportive secondary signs increases diagnostic probability; abscess or free fluid may indicate complicated disease.",
        clinicalRationale: "Use promptly when imaging is indicated and expertise is available. It can reduce CT use. A nonvisualized appendix is nondiagnostic, and accuracy is limited by operator skill, body habitus and appendix position.",
        references: investigationReferences,
      },
      {
        tier: "advancedImaging",
        testName: "Contrast-enhanced CT abdomen and pelvis using a low-dose protocol where appropriate",
        modalityTarget: "Confirm appendicitis, distinguish uncomplicated from complicated disease and identify mimics",
        targetCondition: "Intermediate-risk, persistent or equivocal adult presentation",
        expectedFinding: "Inflamed appendix and periappendiceal change support appendicitis; abscess, extraluminal gas, perforation or diffuse contamination changes source-control urgency.",
        clinicalRationale: "Arrange urgently after nondiagnostic assessment when cross-sectional imaging will change management. WSES 2020 specifically prefers low-dose contrast CT in adolescents and young adults after negative ultrasound. Limitations include radiation, contrast risk and false-negative early disease; use pregnancy-specific imaging instead when relevant.",
        references: investigationReferences,
      },
    ],
    ruleOut: [
      {
        tier: "laboratory",
        testName: "Urinalysis with culture when infection is suspected",
        modalityTarget: "Urinary infection or ureteric calculus",
        targetCondition: "Urinary mimics of right lower quadrant pain",
        expectedFinding: "A convincing urinary syndrome with supportive culture may explain symptoms; mild pyuria or haematuria does not rule out appendicitis.",
        clinicalRationale: "Obtain during initial assessment when urinary symptoms or flank pain are present. Interpret cautiously because adjacent appendiceal inflammation can cause urinary abnormalities.",
        references: investigationReferences,
      },
      {
        tier: "laboratory",
        testName: "Serum or urine beta-hCG when pregnancy is possible",
        modalityTarget: "Pregnancy status and ectopic pregnancy risk",
        targetCondition: "Pregnancy-related abdominal pain and imaging safety",
        expectedFinding: "A positive result redirects to a pregnancy-specific pathway and urgent ectopic pregnancy assessment when clinically indicated.",
        clinicalRationale: "Obtain urgently before ionising-radiation imaging when pregnancy status is uncertain. This draft does not govern pregnant patients; ultrasound followed by MRI after inconclusive ultrasound is the WSES pregnancy imaging pathway.",
        references: investigationReferences,
      },
      {
        tier: "specializedAdjunctive",
        testName: "Serial clinical examination and repeat risk assessment",
        modalityTarget: "Evolution or resolution of equivocal right iliac fossa pain",
        targetCondition: "Persistent appendicitis or an alternative diagnosis",
        expectedFinding: "Progressive focal tenderness, systemic inflammation or persistent pain prompts imaging and surgical reassessment; sustained improvement supports a monitored alternative pathway.",
        clinicalRationale: "Use active observation for stable intermediate-risk patients. Do not use observation to delay surgery in peritonitis, sepsis or clinical deterioration. Cross-sectional imaging is recommended before surgery for non-resolving pain with initially normal investigations.",
        references: investigationReferences,
      },
    ],
  },
  clinicalManagement: [
    {
      id: "immediate-assessment",
      title: "Identify instability and complicated disease",
      timeframe: "Immediately on arrival",
      actions: [
        "Assess airway, breathing, circulation, observations, perfusion, hydration and abdominal signs; obtain IV access and resuscitate when indicated.",
        "Keep the patient fasting while surgery remains possible; provide analgesia, antiemetic treatment and isotonic fluid according to clinical need and local prescribing policy.",
        "Escalate immediately to senior emergency and surgical teams for generalized peritonitis, sepsis, shock or suspected perforation; diagnostics must not delay resuscitation or source-control planning.",
      ],
      branches: [
        { condition: "Peritonitis, sepsis, shock or perforation", actions: ["Begin resuscitation and local sepsis care.", "Obtain urgent surgical source-control decision and administer infection treatment under the Saudi MOH intra-abdominal infection protocol when applicable."] },
        { condition: "Haemodynamically stable without generalized peritonitis", actions: ["Proceed to structured risk stratification, laboratory testing and selective imaging."] },
      ],
    },
    {
      id: "diagnostic-stratification",
      title: "Stratify probability and obtain decision-changing tests",
      timeframe: "During the initial emergency assessment",
      actions: [
        "Use AIR or Adult Appendicitis Score as a decision aid, not as a stand-alone positive diagnosis.",
        "Use active observation and timely imaging for intermediate-risk patients; use ultrasound first when appropriate and expertise is available.",
        "Use contrast-enhanced CT when ultrasound or assessment remains equivocal and the result will change management; select a pregnancy-specific pathway if pregnancy is possible.",
      ],
    },
    {
      id: "surgical-decision",
      title: "Confirm severity and agree the treatment branch",
      timeframe: "Urgently after diagnosis is supported",
      actions: [
        "Obtain general surgical review and classify uncomplicated versus complicated appendicitis using clinical, imaging and operative findings.",
        "Document patient population, appendicolith, abscess or phlegmon, perforation, comorbidity, anaesthetic risk and local resource constraints.",
        "Use shared decision-making when operative and nonoperative options are both reasonable, including failure, recurrence and missed-complication risk.",
      ],
      branches: [
        { condition: "Uncomplicated appendicitis and surgery selected", actions: ["Plan laparoscopic appendectomy on the next available operating list and within 24 hours of admission, minimizing delay.", "Give the verified Saudi MOH single-dose pre-incision prophylaxis regimen unless contraindicated or replaced by the local formulary pathway."] },
        { condition: "Selected uncomplicated appendicitis and antibiotic-first care considered", actions: ["Offer only with surgical oversight, reliable clinical monitoring, shared decision-making and rapid access to reassessment.", "Select the antibiotic regimen from the current local antimicrobial policy; this draft does not infer a universal nonoperative regimen."] },
        { condition: "Complicated appendicitis", actions: ["Prioritize early source control; select laparoscopic surgery or abscess/phlegmon management according to anatomy, physiologic state and local expertise.", "Use Saudi MOH intra-abdominal infection treatment categories and the current hospital antibiogram with antimicrobial stewardship review."] },
      ],
    },
    {
      id: "perioperative-antibiotics",
      title: "Use perioperative antibiotics by disease class",
      timeframe: "Before incision and after source control",
      actions: [
        "For uncomplicated appendectomy, give one broad-spectrum preoperative dose within the specified pre-incision window; do not continue postoperative antibiotics when uncomplicated disease is confirmed.",
        "For complicated disease, record adequacy of source control and review cultures, physiology and local resistance data before choosing or narrowing treatment.",
        "Do not silently merge duration recommendations: the current WSES abstract reports 2-3 postoperative days for complicated disease, while the 2022 Saudi MOH protocol states 4 days after adequate source control. A Saudi antimicrobial stewardship and surgical reviewer must select the local rule before approval.",
      ],
    },
    {
      id: "disposition-follow-up",
      title: "Discharge, pathology and follow-up",
      timeframe: "Before discharge and at the documented follow-up interval",
      actions: [
        "Confirm stable observations, oral intake, pain control, mobility, wound plan and absence of an untreated complication before discharge.",
        "Send appendectomy specimens for histopathology and review the result through the responsible surgical service.",
        "After nonoperative treatment, provide explicit deterioration and recurrence instructions and arrange surgical follow-up; after a periappendiceal abscess, use an age- and risk-appropriate neoplasm detection strategy selected by the surgical team.",
      ],
    },
  ],
  medicationPlan: {
    status: "source-verified",
    regimens: [
      {
        indication: "Surgical prophylaxis for uncomplicated appendicitis undergoing appendectomy",
        patientGroup: "Nonpregnant adults; confirm local formulary, allergy history and renal/hepatic status",
        genericName: "Cefazolin plus metronidazole",
        dose: "Cefazolin 2 g (3 g if body weight is 120 kg or more) plus metronidazole 500 mg",
        route: "Intravenous",
        frequency: "Single preoperative dose; administer within 60 minutes before incision",
        duration: "Single dose; total prophylaxis must not continue beyond 24 hours after surgery end time",
        adjustments: [
          "Do not give cefazolin after immediate hypersensitivity to cefazolin, cephalosporins, penicillins or other beta-lactams; use the Saudi MOH alternative pathway and verify it against the local formulary.",
          "Cefazolin repeated dosing requires renal adjustment below creatinine clearance 55 mL/min; the Saudi single-dose appendectomy table does not specify a reduced renal dose, so consult pharmacy if redosing or treatment is required.",
          "Metronidazole is contraindicated with nitroimidazole hypersensitivity, Cockayne syndrome, or disulfiram use within 2 weeks; avoid alcohol or propylene glycol during and for at least 3 days after treatment.",
          "Reduce metronidazole by 50% in severe hepatic impairment (Child-Pugh C); monitor for adverse effects in severe renal impairment or end-stage renal disease and account for haemodialysis removal.",
          "Pregnancy is outside this draft's governed population; use the pregnancy-specific surgical and pharmacy pathway.",
        ],
        monitoring: [
          "Verify antibiotic administration time before incision and document weight-based cefazolin selection.",
          "Monitor for immediate hypersensitivity during and after administration.",
          "Check renal and hepatic function when repeated treatment, severe organ dysfunction or complicated infection is present.",
          "If therapy continues for complicated infection, review cultures, clinical response, local antibiogram and adverse effects daily.",
        ],
        sourceTitle: sources.mohProphylaxis.title,
        sourceUrl: sources.mohProphylaxis.url,
        sourceEdition: sources.mohProphylaxis.edition,
      },
    ],
    note:
      "UNREVIEWED GOVERNED DRAFT — NOT FOR CLINICAL USE. The exact regimen above is limited to uncomplicated appendectomy prophylaxis. It is not a nonoperative or complicated-appendicitis treatment regimen. Complicated-infection drug selection and duration require the current Saudi hospital antimicrobial policy, antibiogram and stewardship review. The 2025 WSES versus 2022 Saudi MOH duration difference remains an explicit review item.",
  },
  granularPathway: ClinicalPathwaySchema.parse({
    schema_version: 1,
    evidence: globalEvidence,
    Investigations: [
      {
        id: "risk-and-laboratory-assessment",
        title: "Risk stratification and laboratory assessment",
        timeframe: "At initial emergency assessment",
        steps: [
          { test: "AIR or Adult Appendicitis Score", clinical_question: "Is the adult low, intermediate or high risk?", expected_finding: "Low risk supports rule-out/observation; intermediate risk triggers imaging or active observation.", decision_rationale: "Scores structure probability but do not independently confirm appendicitis.", timeframe: "At first assessment" },
          { test: "FBC, CRP, electrolytes and renal function", clinical_question: "Is there inflammation, dehydration, organ dysfunction or contrast risk?", expected_finding: "Inflammatory or metabolic abnormalities support severity assessment but are nonspecific.", decision_rationale: "Results guide risk, resuscitation and imaging readiness; normal early values do not exclude disease.", timeframe: "Urgently" },
        ],
        evidence: globalEvidence,
      },
      {
        id: "selective-imaging",
        title: "Selective imaging after risk stratification",
        timeframe: "Urgently when imaging will change management",
        steps: [
          { test: "Graded-compression or point-of-care ultrasound", clinical_question: "Can appendicitis or a complication be demonstrated without radiation?", expected_finding: "Inflamed non-compressible appendix or secondary inflammatory signs.", decision_rationale: "Appropriate first imaging when expertise is available; nondiagnostic visualization does not exclude disease.", timeframe: "First-line when indicated" },
          { test: "Contrast-enhanced CT using a low-dose protocol where appropriate", clinical_question: "Is appendicitis present, complicated, or mimicked by another condition?", expected_finding: "Appendiceal inflammation, perforation, abscess or an alternative diagnosis.", decision_rationale: "Use after equivocal assessment or ultrasound when the result changes care; avoid a pregnancy pathway mismatch.", timeframe: "Urgently after nondiagnostic initial assessment" },
        ],
        evidence: globalEvidence,
      },
    ],
    Treatment_Plan: [
      {
        id: "stabilize-and-escalate",
        title: "Stabilize and obtain surgical decision",
        timeframe: "Immediately",
        actions: [
          { instruction: "Resuscitate instability and escalate generalized peritonitis, sepsis, shock or suspected perforation to senior emergency and surgical teams.", timeframe: "Immediately" },
          { instruction: "Classify uncomplicated versus complicated disease and document population-specific risk before selecting treatment.", timeframe: "Urgently after diagnostic support" },
        ],
        Medicines_Doses: [],
        branches: [
          { id: "stable-assessment", condition: "Stable without generalized peritonitis", actions: [{ instruction: "Complete structured risk assessment and selective imaging.", timeframe: "During initial emergency assessment" }], Medicines_Doses: [], evidence: globalEvidence },
          { id: "unstable-source-control", condition: "Peritonitis, sepsis, shock or perforation", actions: [{ instruction: "Begin resuscitation and urgent source-control planning without waiting for routine tests.", timeframe: "Immediately" }], Medicines_Doses: [], evidence: globalEvidence },
        ],
        evidence: globalEvidence,
      },
      {
        id: "definitive-treatment",
        title: "Select definitive treatment",
        timeframe: "After severity classification",
        actions: [
          { instruction: "Use laparoscopic appendectomy as the standard operative approach where expertise and equipment are available.", timeframe: "Next available list; within 24 hours for uncomplicated disease needing surgery" },
          { instruction: "Use antibiotic-first care only in selected uncomplicated cases with surgical oversight, shared decision-making, monitoring and rapid reassessment access.", timeframe: "After imaging and surgical review" },
        ],
        Medicines_Doses: [],
        branches: [
          { id: "uncomplicated-operative", condition: "Uncomplicated appendicitis and surgery selected", actions: [{ instruction: "Plan laparoscopic appendectomy and give verified Saudi MOH prophylaxis unless contraindicated.", timeframe: "Within 24 hours; prophylaxis within 60 minutes before incision" }], Medicines_Doses: [
            {
              id: "cefazolin-metronidazole-prophylaxis",
              medicine: "Cefazolin plus metronidazole",
              indication: "Appendectomy prophylaxis for uncomplicated appendicitis",
              patient_group: "Nonpregnant adults; local formulary verification required",
              loading_dose: { kind: "exact", amount: 2, unit: "g cefazolin (3 g if weight 120 kg or more) plus 500 mg metronidazole", frequency: "Once within 60 minutes before incision", duration: "Single preoperative dose" },
              maintenance_dose: { kind: "not-indicated", reason: "Saudi MOH prophylaxis is a single-dose regimen; postoperative antibiotics are not indicated for uncomplicated appendicitis." },
              route: "Intravenous",
              contraindications: [
                "Immediate hypersensitivity to cefazolin, cephalosporins, penicillins or other beta-lactams",
                "Metronidazole or nitroimidazole hypersensitivity",
                "Cockayne syndrome",
                "Disulfiram use within the previous 2 weeks; avoid alcohol or propylene glycol during and for at least 3 days after metronidazole",
              ],
              adjustments: [
                "Use cefazolin 3 g when body weight is 120 kg or more.",
                "Repeated cefazolin dosing requires renal adjustment below creatinine clearance 55 mL/min; seek pharmacy advice because the single-dose MOH table does not specify a reduced prophylactic dose.",
                "Reduce metronidazole by 50% in severe hepatic impairment (Child-Pugh C); monitor severe renal impairment or ESRD and account for haemodialysis removal.",
                "Pregnancy is outside this draft's scope; use population-specific surgical and pharmacy review.",
              ],
              monitoring: ["Administration time relative to incision", "Immediate hypersensitivity", "Renal and hepatic function when repeat treatment or severe organ dysfunction is present", "Cultures and daily response if treatment continues for complicated infection"],
              evidence: prophylaxisEvidence,
            },
          ], evidence: globalEvidence },
          { id: "uncomplicated-nonoperative", condition: "Selected uncomplicated appendicitis and antibiotic-first care chosen", actions: [{ instruction: "Use the current local antimicrobial regimen and document failure, recurrence and reassessment plans; no universal regimen is supplied by this draft.", timeframe: "After surgical review and shared decision-making" }], Medicines_Doses: [], evidence: globalEvidence },
          { id: "complicated-disease", condition: "Perforation, abscess, phlegmon, peritonitis or sepsis", actions: [{ instruction: "Prioritize source control and choose treatment from the Saudi MOH intra-abdominal infection category and current local antibiogram.", timeframe: "Urgently; source control within 24 hours under the MOH protocol, sooner when physiology requires" }, { instruction: "Resolve the WSES 2-3 day versus Saudi MOH 4 day post-source-control duration difference before approval.", timeframe: "Before prescribing and governance approval" }], Medicines_Doses: [], evidence: globalEvidence },
        ],
        evidence: globalEvidence,
      },
    ],
  }),
  nonClinicalManagement: {
    patientEducation: [
      "Explain the working diagnosis, whether disease appears uncomplicated or complicated, and why observation, imaging, surgery or selected antibiotic-first care is being proposed.",
      "Use shared decision-making for nonoperative care and explain early failure, later recurrence and the need for immediate reassessment if symptoms worsen.",
      "Give written wound, medicine and red-flag instructions in the patient's preferred language before discharge.",
    ],
    lifestyleAndDiet: [
      "Remain fasting while surgery or urgent source control is being considered; resume diet according to the treating surgical team's postoperative plan.",
      "After discharge, increase activity gradually and follow the surgical team's wound, lifting and return-to-work advice.",
      "Do not impose long-term dietary restriction solely because of appendicitis.",
    ],
    mdtReferrals: [
      "General surgery for all confirmed or strongly suspected appendicitis",
      "Radiology for staged ultrasound, CT, MRI or image-guided abscess drainage",
      "Antimicrobial stewardship or infectious diseases for complicated infection, resistant-organism risk or unresolved duration choice",
      "Obstetrics and gynaecology for pregnancy or gynaecologic differential diagnoses",
      "Anaesthesia and critical care for physiologic instability or high perioperative risk",
    ],
    dischargeCriteria: [
      "Stable observations without untreated sepsis, peritonitis or evolving complication",
      "Pain and nausea controlled on an agreed outpatient plan",
      "Tolerating oral intake and mobilising safely when required by the treatment pathway",
      "Operation, pathology and antibiotic plans documented with responsible follow-up service",
      "Patient understands recurrence or deterioration red flags and has reliable access to urgent reassessment",
    ],
    followUpPlan:
      "Surgical follow-up must review recovery, wound concerns and histopathology after appendectomy. Nonoperative care requires a named follow-up interval and rapid-access failure plan. After complicated appendicitis with periappendiceal abscess, the surgical team must document an age- and risk-appropriate strategy to detect appendiceal or colorectal neoplasm; the exact 2025 recommendation should be checked in the full guideline during clinical review.",
  },
});

const graph: DiseaseTopic["pathway"] = {
  title: "Acute appendicitis adult emergency pathway",
  nodes: [
    { id: "start", type: "start", title: "Suspected appendicitis", detail: "Nonpregnant adult with acute right iliac fossa or compatible abdominal pain", referenceIds: [sources.wses2025.id] },
    { id: "stability", type: "assessment", title: "Assess stability and peritonitis", detail: "Resuscitate and escalate shock, sepsis, generalized peritonitis or suspected perforation", emphasis: "critical", referenceIds: [sources.wses2025.id, sources.mohIai.id] },
    { id: "risk", type: "assessment", title: "Risk stratify", detail: "AIR/AAS plus laboratory assessment; account for age, sex and comorbidity", referenceIds: [sources.wses2025.id, sources.wses2020.id] },
    { id: "imaging", type: "action", title: "Selective imaging", detail: "Ultrasound first when appropriate; CT for unresolved adult uncertainty; pregnancy-specific pathway when relevant", referenceIds: [sources.wses2020.id] },
    { id: "severity", type: "decision", title: "Uncomplicated or complicated?", detail: "Use clinical, imaging and operative findings", referenceIds: [sources.wses2025.id, sources.wses2020.id] },
    { id: "uncomplicated", type: "action", title: "Uncomplicated branch", detail: "Laparoscopic appendectomy within 24 hours or selected antibiotic-first care with shared decision-making and monitoring", referenceIds: [sources.wses2025.id, sources.wses2020.id] },
    { id: "prophylaxis", type: "action", title: "Pre-incision prophylaxis", detail: "Saudi MOH cefazolin plus metronidazole single-dose regimen after contraindication and formulary check", referenceIds: [sources.mohProphylaxis.id, sources.cefazolinLabel.id, sources.metronidazoleLabel.id] },
    { id: "complicated", type: "escalation", title: "Complicated branch", detail: "Urgent source control and local antimicrobial pathway; resolve duration conflict before prescribing", emphasis: "critical", referenceIds: [sources.wses2025.id, sources.mohIai.id] },
    { id: "followup", type: "end", title: "Disposition and follow-up", detail: "Histopathology, recurrence plan and neoplasm assessment after periappendiceal abscess", referenceIds: [sources.wses2025.id, sources.wses2020.id] },
  ],
  transitions: [
    { from: "start", to: "stability" },
    { from: "stability", to: "risk", label: "stable" },
    { from: "stability", to: "complicated", label: "unstable/peritonitis" },
    { from: "risk", to: "imaging" },
    { from: "imaging", to: "severity" },
    { from: "severity", to: "uncomplicated", label: "uncomplicated" },
    { from: "severity", to: "complicated", label: "complicated" },
    { from: "uncomplicated", to: "prophylaxis", label: "operation" },
    { from: "uncomplicated", to: "followup", label: "selected nonoperative" },
    { from: "prophylaxis", to: "followup" },
    { from: "complicated", to: "followup" },
  ],
};

const graphValidation = validatePathway(graph);
if (!graphValidation.valid) throw new Error(graphValidation.errors.join("\n"));

const payload = {
  guideline_id: content.id,
  version: content.version,
  content,
  source_title: sources.wses2025.title,
  source_url: sources.wses2025.url,
  issuing_organization: "WSES with Saudi MOH adaptation pending clinical review",
  jurisdiction: "Saudi Arabia adaptation of international guidance",
  change_summary:
    "New non-current governed review version for nonpregnant adults. Completes the six-section case, adds investigation indications and limitations, ordered branches, Saudi MOH appendectomy prophylaxis with label safety details, follow-up, exact source locators and an explicit WSES/Saudi duration conflict. No clinician approval or publication is asserted.",
};

await mkdir(root, { recursive: true });
await writeFile(resolve(root, "sources.json"), JSON.stringify(Object.values(sources), null, 2) + "\n");
await writeFile(resolve(root, "prepared.json"), JSON.stringify(payload, null, 2) + "\n");
await writeFile(resolve(root, "graph.json"), JSON.stringify(graph, null, 2) + "\n");
await writeFile(resolve(root, "validation.json"), JSON.stringify({
  diseaseSchema: "valid",
  granularPathwaySchema: "valid",
  graphValidation,
  contentSha256: createHash("sha256").update(JSON.stringify(content)).digest("hex"),
  generatedAt: new Date().toISOString(),
}, null, 2) + "\n");

console.log(`Prepared ${content.title} ${content.version}`);
console.log(`Output: ${root}`);
