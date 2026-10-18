import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const GUIDELINE_ID = "228c07ea-7ea6-47ac-9ce2-c95419b4293c";
const SOURCE_VERSION = "topic-list-draft-2026-10-13-b003";
const VERSION = "acute-cholecystitis-wses2020-moh-20261018-v1";
const DATE = "2026-10-18";

const WSES_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC7643471";
const NICE_URL = "https://www.nice.org.uk/guidance/cg188";
const MOH_IAI_URL = "https://www.moh.gov.sa:443/en/Ministry/MediaCenter/Publications/Documents/Internal-Abdominal-infection-Treatment-Protocol.pdf";
const MOH_PROPH_URL = "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Protocol-015.pdf";
const LFT_URL = "https://www.ncbi.nlm.nih.gov/books/NBK482489/";
const WBC_URL = "https://www.ncbi.nlm.nih.gov/books/NBK560882/";
const CRP_URL = "https://medlineplus.gov/lab-tests/c-reactive-protein-crp-test/";

const wsesTitle = "2020 World Society of Emergency Surgery updated guidelines for the diagnosis and treatment of acute calculus cholecystitis";
const niceTitle = "NICE CG188: Gallstone disease: diagnosis and management";
const mohIaiTitle = "Internal Abdominal infection Treatment Protocol (Saudi MOH)";
const mohProphTitle = "Antibiotics Surgical Prophylaxis (MOH Protocol-015, GDOH-INP-ASPF-091)";

const wsesLoc = (locator: string) => (/section|table/i.test(locator) ? locator : `Section ${locator.match(/\d/)?.[0] ?? ""}, ${locator}`);
const mohLoc = (locator: string) => (/^tables?\b/i.test(locator) ? locator : `section ${locator}`);
const wses = (locator: string) => ({ title: wsesTitle, edition: `WSES, World J Emerg Surg 2020, ${wsesLoc(locator)}`, url: WSES_URL });
const nice = (locator: string) => ({ title: niceTitle, edition: `NICE clinical guideline CG188, ${locator}`, url: NICE_URL });
const mohIai = (locator: string) => ({ title: mohIaiTitle, edition: `Saudi MOH, first version 2022 (no page numbers), ${mohLoc(locator)}`, url: MOH_IAI_URL });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const { data: original, error: sourceError } = await db.from("guideline_versions").select("*").eq("guideline_id", GUIDELINE_ID).eq("version", SOURCE_VERSION).single();
if (sourceError || !original) throw sourceError ?? new Error("The requested source draft was not found");

type Ref = { title: string; edition: string; url: string };
const inv = (tier: "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive", testName: string, modalityTarget: string, targetCondition: string, normalValue: string, expectedFinding: string, clinicalRationale: string, references: Ref[]) =>
  ({ tier, testName, modalityTarget, targetCondition, normalValue, expectedFinding, clinicalRationale, references });

const betaLactamAllergy = "Documented severe beta-lactam allergy (anaphylaxis, angioedema or urticaria): use the allergy alternative.";
const renalNote = "The MOH protocol gives no renal dose thresholds for biliary agents; adjust to renal function per the product label and hospital pharmacy.";
const response = "Clinical response and temperature daily; if no improvement after 4–7 days, repeat diagnostic work-up and consider non-infectious causes (MOH).";
const moh = (indication: string, patientGroup: string, genericName: string, dose: string, route: string, frequency: string, duration: string, locator: string, extra: { adjustments?: string[]; monitoring?: string[]; contraindications?: string[] } = {}) => ({
  indication, patientGroup, genericName, dose, route, frequency, duration,
  adjustments: extra.adjustments ?? [renalNote],
  monitoring: extra.monitoring ?? [response],
  contraindications: extra.contraindications ?? [betaLactamAllergy],
  sourceTitle: mohIaiTitle, sourceUrl: MOH_IAI_URL, sourceEdition: `Saudi MOH, first version 2022 (no page numbers), ${mohLoc(locator)}`,
});
const mohDuration = "Source control adequate: 4 days; with initial bacteraemia: 7 days; inadequate source control: 5–7 days. If operated within 12–24 h: no more than 24 h after surgery (MOH, Duration).";

const content = DiseaseDetailSchema.parse({
  ...original.content,
  id: GUIDELINE_ID,
  title: "Acute Cholecystitis: Admission and Surgical Pathway",
  specialty: "General Surgery / Emergency Medicine",
  authority: "Other",
  pillar: "Urgent Care",
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    checkedOn: DATE,
    status: "incomplete",
    scope: "Adults with acute calculous cholecystitis: diagnosis, bile duct stone screening, timing of cholecystectomy, drainage when unfit for surgery, and antimicrobial therapy. Sources opened: WSES 2020 (full text), NICE CG188 recommendations, Saudi MOH Internal Abdominal Infection Treatment Protocol (2022), Saudi MOH Protocol-015 (surgical prophylaxis).",
    findings: [
      "Rewritten from an empty intake shell; no earlier clinical content existed.",
      "A Saudi source was found for antimicrobial therapy and surgical prophylaxis. No Saudi guideline for the diagnosis, timing or surgical management of acute cholecystitis was found.",
      "Timing of surgery differs between WSES (7 days from admission, 10 days from symptom onset) and NICE (1 week from diagnosis); both are shown side by side.",
      "Normal values are typical adult reference ranges; laboratories differ.",
    ],
    unverifiedSections: [
      "Tokyo Guidelines 2018 diagnostic criteria and Grade I–III severity thresholds were not opened (full text behind a paywall); severity is described only through the WSES 2020 statements that cite TG13/TG18 grade 3.",
      "WSES 2020 Table 4 lists bile penetration only; it gives no antibiotic doses. Doses are from the Saudi MOH protocol alone.",
      "NICE CG188 recommendation 1.2.5 (percutaneous cholecystostomy for gallbladder empyema): the full list of conditions was not read.",
      "Serum lipase and other pancreatitis tests are not listed because no opened source gave a reference range.",
      "SFDA registration was not checked for any drug; check the SFDA register (https://sdi.sfda.gov.sa/) and hospital formulary before prescribing.",
      "No opened source gives discharge criteria or a follow-up interval after an acute admission; the text follows the oral step-down criteria in the MOH protocol and the WSES/NICE delayed-surgery statements.",
      "The StatPearls liver-chemistry page (NBK482489) title could not be loaded directly; its reference ranges were read through a page extract and are not labelled adult-only.",
      "MOH Table 2 lists ceftriaxone, cefazolin and other cephalosporins in a combination row; the partner drug was not visible in the extract. The MOH footnote says metronidazole is unnecessary for most mild to moderate biliary infections, so ceftriaxone is listed alone.",
      "Acalculous cholecystitis, paediatric and pregnancy-specific dosing are out of scope.",
    ],
    medscapeStatus: "unavailable",
    originalVersionIds: [original.id],
  },
  pathophysiology: {
    summary: "Acute calculous cholecystitis is gallbladder inflammation, usually from gallstones, with a risk of infection that can progress to sepsis.",
    keyMechanisms: [
      "Gallstones with gallbladder inflammation produce right upper quadrant pain, tenderness, fever and raised inflammatory markers (WSES 2020, statement 1.2).",
      "Biliary infection is usually caused by Gram-negative aerobes (Escherichia coli, Klebsiella pneumoniae) and anaerobes, especially Bacteroides fragilis (WSES 2020, statement 7.2).",
      "A stone can also lie in the common bile duct: in 5–15% of acute cholecystitis cases (WSES 2020, section 2), which changes imaging and drainage needs.",
      "Septic shock and advanced local inflammation make laparoscopic surgery hazardous (WSES 2020, statements 3.2 and 3.5).",
      "Gallbladder empyema is an infective complication that NICE manages with percutaneous cholecystostomy in defined circumstances (NICE CG188, 1.2.5).",
    ],
    references: [wses("section 7, statement 7.2"), nice("Recommendation 1.2.5")],
  },
  presentation: {
    symptoms: [
      "Right upper quadrant pain.",
      "Vomiting or food intolerance.",
      "Fever.",
    ],
    physicalSigns: [
      "Right upper quadrant tenderness.",
      "Positive Murphy’s sign (positive likelihood ratio 2.8; the 95% confidence interval 0.8–8.6 includes 1.0, so it does not confirm the diagnosis alone).",
    ],
    redFlags: [
      "Septic shock: avoid laparoscopic cholecystectomy; resuscitate and give broad-spectrum intravenous antibiotics within the first hour (WSES 2020, statement 3.2 and Section 7).",
      "Peritonitis: WSES describes observation only for mildly symptomatic disease (WSES 2020, section 5).",
      "Raised bilirubin, ALP or GGT, or a dilated bile duct: look for a common bile duct stone (WSES 2020, section 2; NICE CG188, 1.1.2).",
      "Severe physiological disturbance, older age or immunocompromise: treat as severe or high risk (Saudi MOH protocol, Classification).",
    ],
    precipitants: [
      "Gallstones (acute calculous cholecystitis).",
      "Previous antibiotic exposure raises the risk of extended-spectrum beta-lactamase producing organisms (WSES 2020, statement 7.2).",
      "Immunosuppression, for example transplant recipients: presume Enterococcus involvement (WSES 2020, statement 7.2).",
    ],
  },
  differentials: [
    { condition: "Common bile duct stone or cholangitis", distinguishingFeatures: "Raised bilirubin, ALP or GGT, or a dilated duct on ultrasound; stratify risk and image the duct (WSES 2020, statements 2.4–2.7)." },
    { condition: "Mirizzi syndrome", distinguishingFeatures: "Occurs in under 1% of people with gallstones and mimics a bile duct stone; most cases are found at surgery (WSES 2020, section 2)." },
    { condition: "Condition other than gallstone disease", distinguishingFeatures: "Refer for further investigation when another condition is suspected (NICE CG188, 1.1.4)." },
  ],
  diagnosticCriteria: [
    { criterion: "Diagnosis", threshold: "No single finding is sufficient. Combine history, examination, laboratory tests and imaging; the best combination is not known (WSES 2020, statements 1.1–1.2)." },
    { criterion: "Initial imaging", threshold: "Abdominal ultrasound; pooled sensitivity 81% and specificity 83% (WSES 2020, statement 1.3)." },
    { criterion: "Severity", threshold: "TG13/TG18 grade 3 carried higher mortality than grade 1: median 6.5% versus 1.3% (WSES 2020, section 5). Grade thresholds were not opened; see Evidence audit." },
    { criterion: "High-risk patient", threshold: "The CHOCOLATE trial defined high risk as an Acute Physiology and Chronic Health Evaluation (APACHE) score of 7–14; WSES states there is no single accepted definition and advises a local pathway (WSES 2020, Conclusions)." },
    { criterion: "Severe or high-risk infection", threshold: "Severe physiological disturbance, septic shock, older age or immunocompromise (Saudi MOH protocol, Classification)." },
  ],
  investigations: {
    ruleIn: [
      inv("firstLineImaging", "Abdominal ultrasound", "Gallbladder and bile ducts", "Acute calculous cholecystitis", "No gallstones; no signs of gallbladder inflammation", "Gallstones with at least one ultrasound sign of gallbladder inflammation; pooled sensitivity 81%, specificity 83%", "Preferred first imaging test; accuracy varies widely between studies, so interpret with history, examination and bloods. Also assess bile duct diameter.", [wses("statement 1.3"), nice("Recommendation 1.1.1")]),
      inv("laboratory", "White blood cell count", "Inflammatory response", "Acute calculous cholecystitis", "4,500–11,000 cells/µL (4.5–11.0 × 10⁹/L); local laboratory ranges apply", "Elevated", "Supports the diagnosis but cannot confirm or exclude it alone; trend to judge response.", [wses("statement 1.2"), { title: "Leukocytosis - StatPearls - NCBI Bookshelf", edition: "StatPearls, section Evaluation", url: WBC_URL }]),
      inv("laboratory", "C-reactive protein", "Inflammatory response", "Acute calculous cholecystitis", "0.8–1.0 mg/dL (8–10 mg/L) or lower; local laboratory ranges apply", "Elevated", "Supports the diagnosis; shows inflammation but not its cause or site.", [wses("statement 1.2"), { title: "C-Reactive Protein (CRP) Test: MedlinePlus Medical Test", edition: "MedlinePlus, page text, section on results", url: CRP_URL }]),
      inv("specializedAdjunctive", "Hepatobiliary iminodiacetic acid (HIDA) scan", "Gallbladder filling", "Acute calculous cholecystitis", "Normal gallbladder filling", "Non-filling gallbladder; sensitivity 84.2% versus 67.3% for ultrasound and 59.8% for computed tomography (CT) in one study", "Highest sensitivity and specificity of the imaging tests; use selectively because it needs resources and time.", [wses("statement 1.4")]),
      inv("advancedImaging", "Computed tomography (CT) of the abdomen", "Gallbladder and surrounding tissue", "Acute calculous cholecystitis", "No gallbladder wall or pericholecystic abnormality", "Gallbladder inflammation signs; accuracy poor in WSES, with study sensitivity 59.8% to 92% depending on the comparison", "Not a first-line test for diagnosis; use when another diagnosis is suspected or local expertise favours it.", [wses("statement 1.4"), nice("Recommendation 1.1.4")]),
    ],
    ruleOut: [
      inv("laboratory", "Total bilirubin", "Bile duct obstruction", "Common bile duct stone", "2–17 µmol/L; local laboratory ranges apply", "Raised", "Raised bilirubin with duct dilatation raises the pre-test probability of a duct stone: stratify risk (WSES 2.5) and image or clear the duct (2.6–2.8). Do not use liver tests alone to identify duct stones.", [wses("statements 2.1 and 2.4–2.8"), { title: "Liver chemistry reference ranges (StatPearls, NCBI Bookshelf NBK482489)", edition: "StatPearls, section Results, Reporting, and Critical Findings", url: LFT_URL }]),
      inv("laboratory", "Alkaline phosphatase (ALP) and gamma-glutamyl transferase (GGT)", "Bile duct obstruction", "Common bile duct stone", "ALP 30–120 IU/L; GGT 6–50 IU/L; local laboratory ranges apply", "Raised; in one study GGT above 224 IU/L had sensitivity 80.6%, specificity 75.3%, positive predictive value 50% and negative predictive value 91.4% for a duct stone", "Use with ultrasound duct diameter to place the patient in a duct-stone risk group; repeat to see whether values fall in the first days.", [wses("section 2"), { title: "Liver chemistry reference ranges (StatPearls, NCBI Bookshelf NBK482489)", edition: "StatPearls, section Results, Reporting, and Critical Findings", url: LFT_URL }]),
      inv("laboratory", "Alanine aminotransferase (ALT) and aspartate aminotransferase (AST)", "Hepatocellular injury", "Common bile duct stone", "ALT 4–36 IU/L; AST 5–30 IU/L; local laboratory ranges apply", "Raised", "Part of the liver panel required in every patient with acute cholecystitis (WSES statement 2.4); ALT also falls after duct clearance.", [wses("statement 2.4 and section 2"), { title: "Liver chemistry reference ranges (StatPearls, NCBI Bookshelf NBK482489)", edition: "StatPearls, section Results, Reporting, and Critical Findings", url: LFT_URL }]),
      inv("specializedAdjunctive", "Magnetic resonance cholangiopancreatography (MRCP)", "Bile ducts", "Common bile duct stone", "No duct stone; duct not dilated", "Duct stone or stricture", "Consider if ultrasound has not shown a duct stone but the duct is dilated or liver tests are abnormal; WSES uses it for moderate-risk patients.", [nice("Recommendation 1.1.2"), wses("statement 2.6")]),
      inv("specializedAdjunctive", "Endoscopic ultrasound (EUS)", "Bile ducts", "Common bile duct stone", "No duct stone", "Duct stone", "Consider if MRCP does not give a diagnosis; WSES also lists it for moderate-risk patients.", [nice("Recommendation 1.1.3"), wses("statement 2.6")]),
      inv("laboratory", "Blood cultures and bile or gallbladder culture", "Causative organism", "Biliary infection", "No growth", "Positive in 29–54% of bile cultures", "Take blood cultures before antimicrobials; adapt therapy to culture in complicated disease and in patients at high risk of resistance.", [mohIai("Cultures and therapy adjustments"), wses("statement 7.3")]),
    ],
  },
  clinicalManagement: [
    {
      id: "diagnose-and-start",
      title: "Diagnose, send cultures and start antimicrobials",
      timeframe: "At presentation (first hour if septic shock)",
      actions: [
        "Combine history, examination, bloods and ultrasound; do not rely on one finding (WSES 2020, statements 1.1–1.3).",
        "Take blood cultures before the first antimicrobial dose (MOH, Cultures and therapy adjustments).",
        "Start antimicrobials once intra-abdominal infection is diagnosed or likely, in the emergency department (ED) if there is no septic shock (MOH, Other relevant notes).",
        "If septic shock: broad-spectrum intravenous antibiotics with biliary penetration within the first hour, reassessed daily (WSES 2020, Section 7, citing the Surviving Sepsis Campaign).",
        "Plan source control within 24 h of diagnosis (MOH, Source control).",
      ],
    },
    {
      id: "duct-stones",
      title: "Screen for common bile duct stones",
      timeframe: "Before surgery, without delaying it",
      actions: [
        "Check ALT, AST, bilirubin, ALP and GGT and perform ultrasound in every patient (WSES 2020, statement 2.4).",
        "Stratify duct-stone risk with the modified ASGE/Maple classification (WSES 2020, statement 2.5, Table 2).",
        "Moderate risk: MRCP, EUS, intra-operative cholangiography or laparoscopic ultrasound, by local expertise (WSES 2020, statement 2.6).",
        "High risk: pre-operative ERCP, intra-operative cholangiography or laparoscopic ultrasound (WSES 2020, statement 2.7).",
        "Clear any duct stone before, during or after cholecystectomy according to local expertise (WSES 2020, statement 2.8).",
      ],
    },
    {
      id: "early-cholecystectomy",
      title: "Early laparoscopic cholecystectomy",
      timeframe: "WSES: within 7 days of admission and within 10 days of symptom onset; NICE: within 1 week of diagnosis",
      actions: [
        "Laparoscopic cholecystectomy is first-line (WSES 2020, statement 3.1); offer early surgery (NICE CG188, 1.2.4). The two timing definitions are compared below.",
        "Avoid laparoscopic cholecystectomy in septic shock or absolute anaesthetic contraindication (WSES 2020, statement 3.2).",
        "In high-risk patients, immediate laparoscopic cholecystectomy is first choice over percutaneous transhepatic gallbladder drainage (WSES 2020, statement 6.3).",
        "Laparoscopic surgery is suggested in Child–Pugh A and B cirrhosis, patients over 80 years and pregnancy (WSES 2020, statement 3.3).",
        "Use laparoscopic or open subtotal cholecystectomy if anatomy cannot be identified safely (WSES 2020, statement 3.4); convert to open surgery for severe local inflammation (statement 3.5).",
        "If early surgery is not possible, delay it beyond 6 weeks from the first presentation (WSES 2020, statement 4.2).",
        "Refer TG13 grade 3 disease to a high-volume specialised centre (WSES 2020, section 5).",
      ],
    },
    {
      id: "not-suitable-for-surgery",
      title: "Not suitable for surgery: drainage and delayed surgery",
      timeframe: "On failure of medical therapy or uncontrolled sepsis",
      actions: [
        "Offer best medical therapy with antibiotics and observation to patients who refuse surgery or are unsuitable (WSES 2020, statement 6.1).",
        "Drain the gallbladder in patients unsuitable for surgery; it converts a septic patient into a non-septic patient (WSES 2020, statement 6.4).",
        "Percutaneous transhepatic drainage is standard; endoscopic transpapillary or ultrasound-guided transmural drainage are alternatives in high-volume centres with skilled endoscopists (WSES 2020, statement 6.6). Prefer lumen-apposing metal stents for the transmural route (statement 6.8) and remove metal stents within 4 weeks (statement 6.9).",
        "For gallbladder empyema, NICE offers percutaneous cholecystostomy and advises reconsidering laparoscopic cholecystectomy once the patient is fit (NICE CG188, 1.2.5–1.2.6).",
        "Suggest delayed laparoscopic cholecystectomy after risk reduction to prevent readmission (WSES 2020, statement 6.5).",
      ],
    },
    {
      id: "antimicrobial-duration",
      title: "Antimicrobial choice, duration and step-down",
      timeframe: "From diagnosis until source control plus the durations below",
      actions: [
        "Healthcare-associated infection: hospitalised 48 h or more in the previous 90 days, long-term care in the previous 30 days, recent intravenous therapy, wound care or dialysis, recent broad-spectrum antibiotics, postoperative infection, or known resistant organism (MOH, Classification).",
        "Community-acquired mild to moderate: ceftriaxone, piperacillin-tazobactam or ertapenem. Severe, high-risk or healthcare-associated: piperacillin-tazobactam 4.5 g, meropenem or imipenem-cilastatin (MOH, Tables 1–2; doses in the medication plan).",
        "Anaerobic cover is not needed in community-acquired mild to moderate cholecystitis unless there is a biliary-enteric anastomosis or emphysematous cholecystitis (MOH, Anaerobic coverage).",
        "Do not give routine postoperative antibiotics in uncomplicated disease when cholecystectomy controls the infection (WSES 2020, statement 7.1). In complicated disease, tailor to the presumed pathogens and resistance risk (statement 7.2) and to culture results (statement 7.3).",
        "Duration: 4 days with adequate source control; 7 days if there was initial bacteraemia; 5–7 days with inadequate source control; no more than 24 h after surgery if operated within 12–24 h (MOH, Duration).",
        "Oral step-down once improving and eating (MOH, Oral step-down).",
      ],
    },
  ],
  medicationPlan: {
    status: "local-protocol-required",
    note: "Doses are adult doses from the Saudi MOH protocols only; WSES 2020 gives no doses. SFDA registration was not checked; check the SFDA register and hospital formulary before prescribing. Local antibiogram applies.",
    regimens: [
      moh("Community-acquired, mild to moderate cholecystitis", "Adults", "Ceftriaxone", "2 g", "IV", "Every 24 h", mohDuration, "Table 2"),
      moh("Community-acquired, mild to moderate cholecystitis", "Adults", "Piperacillin-tazobactam", "3.375 g", "IV", "Every 6 h", mohDuration, "Table 2"),
      moh("Community-acquired, mild to moderate cholecystitis", "Adults", "Ertapenem", "1 g", "IV", "Every 24 h", mohDuration, "Table 2"),
      moh("Severe or high-risk community-acquired, or healthcare-associated cholecystitis", "Adults", "Piperacillin-tazobactam", "4.5 g", "IV", "Every 6 h", mohDuration, "Tables 1–2"),
      moh("Severe or high-risk community-acquired, or healthcare-associated cholecystitis", "Adults", "Meropenem", "1 g", "IV", "Every 8 h", mohDuration, "Tables 1–2"),
      moh("Severe or high-risk community-acquired, or healthcare-associated cholecystitis", "Adults", "Imipenem-cilastatin", "500 mg", "IV", "Every 6 h", mohDuration, "Tables 1–2"),
      moh("Add-on anaerobic cover: biliary-enteric anastomosis, emphysematous cholecystitis, or combination with cefepime or ceftazidime", "Adults", "Metronidazole", "500 mg", "IV or oral", "Every 8 h", mohDuration, "Table 1 and Anaerobic coverage", { contraindications: ["Not needed for community-acquired mild to moderate cholecystitis without these indications (MOH footnote)."], adjustments: [renalNote] }),
      moh("Documented severe beta-lactam allergy or contraindication", "Adults", "Ciprofloxacin", "400 mg IV or 500 mg oral", "IV or oral", "Every 12 h", mohDuration, "Allergy alternatives", { contraindications: ["Use only when beta-lactams are contraindicated; the MOH protocol prefers beta-lactams over fluoroquinolones."] }),
      moh("Oral step-down after improvement and tolerating oral intake", "Adults", "Amoxicillin-clavulanic acid", "875 mg", "Oral", "Every 12 h", "Continue to the total duration above (MOH, Duration).", "Oral step-down", { adjustments: ["Adjust to renal function (MOH footnote for this agent); culture results guide the choice."] }),
      {
        indication: "Surgical prophylaxis for laparoscopic cholecystectomy (elective, high-risk laparoscopic; biliary tract)", patientGroup: "Adults", genericName: "Cefazolin", dose: "2 g (3 g if weight 120 kg or more)", route: "IV", frequency: "Single dose within 60 min before incision", duration: "Repeat every 4 h if surgery exceeds 4 h or blood loss exceeds 1,500 mL; post-operative prophylaxis under 24 h from end of surgery",
        adjustments: ["Alternative: clindamycin 900 mg IV within 60 min plus ciprofloxacin 400 mg IV within 120 min before incision (MOH Protocol-015, p. 1). Gentamicin 5 mg/kg IV once may be considered if local antibiogram shows Gram-negative surgical site infection."],
        monitoring: ["Allergy and infusion reactions."], contraindications: ["Cephalosporin allergy: use the alternative regimen."],
        sourceTitle: mohProphTitle, sourceUrl: MOH_PROPH_URL, sourceEdition: "Saudi MOH, issued 22 May 2017, updated 22 May 2021, p. 1 (biliary tract; elective high-risk laparoscopic)",
      },
    ],
  },
  guidelineComparison: {
    title: "WSES 2020 vs NICE CG188 vs Saudi MOH protocols",
    columns: ["WSES 2020", "NICE CG188", "Saudi MOH"],
    rows: [
      { parameter: "Timing of cholecystectomy", values: ["As soon as possible: within 7 days of admission and within 10 days of symptom onset (statement 4.1)", "Within 1 week of diagnosis (1.2.4)", "Not covered; source control within 24 h of diagnosis (Internal Abdominal Infection Protocol)"] },
      { parameter: "Antibiotics after surgery", values: ["None routinely in uncomplicated disease when source controlled (7.1)", "Not covered", "No more than 24 h after surgery if operated within 12–24 h"] },
      { parameter: "First imaging", values: ["Ultrasound (1.3)", "Liver function tests and ultrasound (1.1.1)", "Not covered"] },
      { parameter: "Patient unfit for surgery", values: ["Gallbladder drainage (6.4)", "Percutaneous cholecystostomy for empyema (1.2.5)", "Not covered"] },
      { parameter: "Antibiotic doses", values: ["None given (Table 4 lists bile penetration only)", "Not covered", "Doses given (Tables 1–2)"] },
    ],
    note: "Sources address different steps. The timing figures differ and are shown as stated, not merged.",
  },
  teaching: {
    scope: "Adult acute calculous cholecystitis: diagnosis, bile duct stone screen, timing of surgery, drainage and antimicrobials.",
    learningObjectives: [
      "Diagnose acute cholecystitis from a combination of findings rather than one test.",
      "Identify when to look for a common bile duct stone and which test to use.",
      "State the timing of early laparoscopic cholecystectomy and the alternatives when surgery is unsuitable.",
      "Choose antimicrobials by severity and healthcare association and set the duration from source control.",
    ],
    keyPoints: [
      "Ultrasound first; no single clinical or laboratory finding confirms or excludes the diagnosis.",
      "Early laparoscopic cholecystectomy is the aim; septic shock and absolute anaesthetic contraindication are reasons to avoid laparoscopy.",
      "Drain the gallbladder when surgery is unsuitable and the patient is septic.",
      "Antibiotic duration depends on source control: 4 days if adequate, 7 days with bacteraemia.",
    ],
    pitfalls: [
      "Relying on a positive Murphy’s sign or raised white cell count alone.",
      "Using liver tests alone to label a common bile duct stone.",
      "Continuing routine postoperative antibiotics after uncomplicated cholecystectomy.",
      "Treating the NICE (1 week from diagnosis) and WSES (7 days from admission, 10 days from onset) timing statements as identical.",
    ],
    references: [
      { title: wsesTitle, edition: "WSES, World J Emerg Surg 2020", url: WSES_URL, locator: "Sections 1–7, statements 1.1–7.3" },
      { title: niceTitle, edition: "NICE clinical guideline CG188", url: NICE_URL, locator: "Recommendations 1.1.1–1.1.4 and 1.2.3–1.2.6" },
      { title: mohIaiTitle, edition: "Saudi MOH, first version 2022", url: MOH_IAI_URL, locator: "Tables 1–2; Duration; Oral step-down; Allergy alternatives" },
      { title: mohProphTitle, edition: "Saudi MOH, issued 22 May 2017, updated 22 May 2021", url: MOH_PROPH_URL, locator: "p. 1" },
      { title: "Liver chemistry reference ranges (StatPearls, NCBI Bookshelf NBK482489)", edition: "StatPearls", url: LFT_URL, locator: "Section Results, Reporting, and Critical Findings" },
      { title: "Leukocytosis - StatPearls - NCBI Bookshelf", edition: "StatPearls", url: WBC_URL, locator: "Section Evaluation" },
      { title: "C-Reactive Protein (CRP) Test: MedlinePlus Medical Test", edition: "MedlinePlus", url: CRP_URL, locator: "Section on results" },
    ],
  },
  nonClinicalManagement: {
    patientEducation: [
      "Explain that without cholecystectomy, gallstone-related complications can recur: about 30% over 14 years in one trial of observation, versus 3% after surgery, a difference that was not statistically significant (WSES 2020, section 5).",
      "Explain the plan for surgery and its timing, or for drainage and delayed surgery if surgery is unsuitable.",
    ],
    lifestyleAndDiet: [
      "No diet or lifestyle recommendation specific to acute cholecystitis was found in the opened WSES, NICE or MOH sources; follow the local surgical pathway.",
    ],
    mdtReferrals: [
      "General or hepatobiliary surgery for cholecystectomy; high-volume specialised centre for TG13 grade 3 disease (WSES 2020, section 5).",
      "Interventional radiology or therapeutic endoscopy for gallbladder drainage or bile duct clearance.",
    ],
    dischargeCriteria: [
      "Clinically improved and tolerating an oral diet, which is the MOH condition for oral antibiotic step-down.",
      "Source controlled by cholecystectomy or drainage, with the antimicrobial plan and total duration written down.",
    ],
    followUpPlan: "If cholecystectomy was not done during the admission, arrange delayed laparoscopic cholecystectomy (WSES 2020, statements 4.2 and 6.5; NICE CG188, 1.2.6); remove metal gallbladder stents within 4 weeks (WSES 2020, statement 6.9). No opened source gives a clinic review interval.",
  },
});

const audit = auditTopicContent(content);
console.log(JSON.stringify({ score: audit.score, passed: audit.passedChecks, total: audit.totalChecks, failures: audit.failures }, null, 1));
if (!audit.meetsEightyPercent) throw new Error(`Refusing to stage below threshold: ${audit.score}%`);
if (process.argv.includes("--dry-run")) process.exit(0);
const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION).maybeSingle();
if (existingError) throw existingError;
if (existing) throw new Error(`Version already exists (${existing.id}); refusing to overwrite it.`);
const row = { id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, source_title: "WSES 2020 acute calculus cholecystitis guidelines; NICE CG188; Saudi MOH Internal Abdominal Infection Treatment Protocol and Protocol-015", issuing_organization: "WSES; NICE; Saudi Ministry of Health", source_url: WSES_URL, jurisdiction: "Saudi Arabia", last_verified_date: DATE, review_date: DATE, created_by: original.created_by, approved_by: null, approved_at: null, published_at: null, change_summary: "Authored from an empty intake shell using WSES 2020, NICE CG188 and Saudi MOH protocols; preserved the original draft. Clinical review pending." };
const { error: insertError } = await db.from("guideline_versions").insert(row);
if (insertError) throw insertError;
console.log(JSON.stringify({ staged: true, guidelineId: GUIDELINE_ID, versionId: row.id, version: VERSION, score: audit.score, status: row.status }, null, 1));
