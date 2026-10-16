import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";

/**
 * Public catalogue families. A family changes only how related, approved topics
 * are presented; each guideline and every version remain independent records.
 *
 * A family is activated only when its explicit canonical topic is present. This
 * prevents a specialist pathway from being hidden when its overview topic has
 * not yet been approved or imported.
 */
type TopicFamilyDefinition = {
  id: string;
  title: string;
  canonicalTitles: readonly string[];
  memberTitles: readonly string[];
};

const definitions: readonly TopicFamilyDefinition[] = [
  { id: "copd", title: "Chronic Obstructive Pulmonary Disease", canonicalTitles: ["Chronic Obstructive Pulmonary Disease"], memberTitles: ["Chronic Obstructive Pulmonary Disease", "Acute Exacerbation of COPD", "Advanced COPD Supportive Care"] },
  { id: "asthma", title: "Asthma", canonicalTitles: ["Asthma"], memberTitles: ["Asthma", "Acute Severe Asthma Exacerbation", "Acute Severe Asthma Exacerbation (Adult)", "Acute Asthma Exacerbation in Children: ED Pathway", "Acute Asthma Exacerbation in Children: Inhaler Technique and Oral Steroid Discharge Plan"] },
  { id: "heart-failure", title: "Heart Failure", canonicalTitles: ["Heart Failure"], memberTitles: ["Heart Failure", "Acute Heart Failure and Pulmonary Oedema", "Acute Heart Failure Exacerbation in the Community: Diuretic Titration and Admission Triggers", "Advanced Heart Failure Supportive Care"] },
  { id: "chronic-kidney-disease", title: "Chronic Kidney Disease", canonicalTitles: ["Chronic Kidney Disease"], memberTitles: ["Chronic Kidney Disease", "Diabetic Kidney Disease: ACR Screening and Management", "Conservative Kidney Care Planning", "Kidney Failure Planning and Dialysis Access"] },
  { id: "type-1-diabetes", title: "Type 1 Diabetes", canonicalTitles: ["Type 1 Diabetes in Adults: Newly Diagnosed Pathway"], memberTitles: ["Type 1 Diabetes in Adults: Newly Diagnosed Pathway", "Type 1 Diabetes in Adults: Annual Review and Sick-Day Rules"] },
  { id: "type-2-diabetes", title: "Type 2 Diabetes Mellitus", canonicalTitles: ["Type 2 Diabetes Mellitus Longitudinal Care", "Type 2 Diabetes Mellitus Longitudinal Care Pathway"], memberTitles: ["Type 2 Diabetes Mellitus Longitudinal Care", "Type 2 Diabetes Mellitus Longitudinal Care Pathway", "Type 2 Diabetes: New Diagnosis and Initial Treatment", "Type 2 Diabetes: Treatment Intensification and Add-On Therapy", "Diabetes Screening in At-Risk Adults", "Diabetic Foot: Risk Stratification and Ulcer Referral", "Diabetic Retinopathy Screening"] },
  { id: "gestational-diabetes", title: "Gestational Diabetes", canonicalTitles: ["Gestational Diabetes Identification and Management Pathway", "Gestational Diabetes: Screening and Diagnosis"], memberTitles: ["Gestational Diabetes Identification and Management Pathway", "Gestational Diabetes: Screening and Diagnosis", "Gestational Diabetes: Antenatal Glucose Management and Delivery Planning", "Gestational Diabetes: Postnatal Follow-Up for Type 2 Diabetes Risk"] },
  { id: "hypertension", title: "Hypertension", canonicalTitles: ["Hypertension in Adults [Adapted from NICE]", "Adult Essential Hypertension Screening and Confirmation"], memberTitles: ["Hypertension in Adults [Adapted from NICE]", "Adult Essential Hypertension Screening and Confirmation", "Hypertension: Primary Care Titration and Target Review", "Resistant Hypertension and Secondary Causes: Referral Triggers"] },
  { id: "coronary-artery-disease", title: "Coronary Artery Disease", canonicalTitles: ["Ischaemic Heart Disease"], memberTitles: ["Ischaemic Heart Disease", "Stable Angina", "Stable Chest Pain", "Stable Coronary Artery Disease: Medical Management and Referral Triggers", "Elective Coronary Revascularisation Review", "Post-Myocardial Infarction Community Secondary Prevention and Cardiac Rehabilitation", "Post-PCI Community Secondary Prevention"] },
  { id: "acute-coronary-syndrome", title: "Acute Coronary Syndrome", canonicalTitles: ["Acute Coronary Syndrome"], memberTitles: ["Acute Coronary Syndrome", "Acute Coronary Syndrome Assessment and Escalation Pathway", "ST-Elevation Myocardial Infarction", "Non-ST-Elevation Myocardial Infarction", "Unstable Angina"] },
  { id: "obesity", title: "Obesity", canonicalTitles: ["Obesity and Weight-Related Health"], memberTitles: ["Obesity and Weight-Related Health", "Obesity in Adults: Primary Care Weight Management Pathway", "Obesity in Adults: Pharmacotherapy and Bariatric Referral Criteria", "Childhood and Adolescent Obesity Screening", "Metabolic and Bariatric Surgery Evaluation", "Bariatric Surgery: Post-Operative Monitoring and Supplementation"] },
  { id: "gout", title: "Gout and Hyperuricaemia", canonicalTitles: ["Gout and Hyperuricaemia: Flare Management"], memberTitles: ["Gout and Hyperuricaemia: Flare Management", "Gout: Long-Term Urate-Lowering Therapy Titration"] },
  { id: "irritable-bowel-syndrome", title: "Irritable Bowel Syndrome", canonicalTitles: ["Irritable Bowel Syndrome: Primary Care Diagnosis and Red-Flag Exclusion"], memberTitles: ["Irritable Bowel Syndrome: Primary Care Diagnosis and Red-Flag Exclusion", "Irritable Bowel Syndrome: Dietary and Medical Management Ladder"] },
  { id: "coeliac-disease", title: "Coeliac Disease", canonicalTitles: ["Coeliac Disease: Serology Testing Pathway"], memberTitles: ["Coeliac Disease: Serology Testing Pathway", "Coeliac Disease: Lifelong Dietary Management and Follow-Up"] },
  { id: "polycystic-ovary-syndrome", title: "Polycystic Ovary Syndrome", canonicalTitles: ["Polycystic Ovary Syndrome: Diagnosis and Metabolic Screening"], memberTitles: ["Polycystic Ovary Syndrome: Diagnosis and Metabolic Screening", "Polycystic Ovary Syndrome: Cycle, Symptom and Fertility Management"] },
  { id: "miscarriage", title: "Miscarriage", canonicalTitles: ["Miscarriage: Diagnosis and Early Pregnancy Unit Assessment"], memberTitles: ["Miscarriage: Diagnosis and Early Pregnancy Unit Assessment", "Miscarriage: Expectant, Medical and Surgical Management"] },
  { id: "twin-pregnancy", title: "Twin Pregnancy", canonicalTitles: ["Twin Pregnancy: Antenatal Surveillance"], memberTitles: ["Twin Pregnancy: Antenatal Surveillance", "Twin Pregnancy: Timing and Mode of Birth"] },
  { id: "vaginal-birth-after-caesarean", title: "Vaginal Birth After Caesarean", canonicalTitles: ["Vaginal Birth After Caesarean: Antenatal Counselling"], memberTitles: ["Vaginal Birth After Caesarean: Antenatal Counselling", "Vaginal Birth After Caesarean: Intrapartum Care"] },
  { id: "perineal-tear", title: "Perineal Tear", canonicalTitles: ["Perineal Tear: Assessment and Repair"], memberTitles: ["Perineal Tear: Assessment and Repair", "Perineal Tear: Postpartum Care and Follow-Up"] },
  { id: "carpal-tunnel-syndrome", title: "Carpal Tunnel Syndrome", canonicalTitles: ["Carpal Tunnel Syndrome: Splinting and Injection in Primary Care"], memberTitles: ["Carpal Tunnel Syndrome: Splinting and Injection in Primary Care", "Carpal Tunnel Syndrome: Surgical Release Criteria and Post-Operative Care"] },
  { id: "breast-cancer", title: "Breast Cancer", canonicalTitles: ["Breast Cancer Management"], memberTitles: ["Breast Cancer Management", "Breast Cancer Screening Discussion"] },
  { id: "colorectal-cancer", title: "Colorectal Cancer", canonicalTitles: ["Colorectal Cancer Diagnosis and Treatment Planning"], memberTitles: ["Colorectal Cancer Diagnosis and Treatment Planning", "Colorectal Cancer Screening"] },
  { id: "prostate-cancer", title: "Prostate Cancer", canonicalTitles: ["Prostate Cancer Diagnosis and Treatment Planning"], memberTitles: ["Prostate Cancer Diagnosis and Treatment Planning", "Prostate Cancer Screening: PSA Discussion and Risk Assessment", "Prostate Cancer Survivorship: Community PSA Monitoring and Side-Effect Management"] },
  { id: "dementia", title: "Dementia", canonicalTitles: ["Suspected Dementia: Memory Assessment and Referral"], memberTitles: ["Suspected Dementia: Memory Assessment and Referral", "Dementia After Diagnosis: Cognitive Support and Care Planning", "Advanced Dementia and Comfort-Focused Care"] },
  { id: "parkinsons-disease", title: "Parkinson's Disease", canonicalTitles: ["Suspected Parkinson's Disease: Recognition and Referral"], memberTitles: ["Suspected Parkinson's Disease: Recognition and Referral", "Parkinson's Disease: Medication Timing and Complication Review"] },
];

export type TopicFamily = TopicFamilyDefinition;

export function getTopicFamily(title: string): TopicFamily | undefined {
  return definitions.find((family) => family.memberTitles.includes(title));
}

export function getFamilyCanonicalTopic(family: TopicFamily, topics: readonly DiseaseGuidelineSummary[]): DiseaseGuidelineSummary | undefined {
  return family.canonicalTitles.map((title) => topics.find((topic) => topic.title === title)).find((topic): topic is DiseaseGuidelineSummary => Boolean(topic));
}

export function getFamilyTopics(family: TopicFamily, topics: readonly DiseaseGuidelineSummary[]): DiseaseGuidelineSummary[] {
  return family.memberTitles.flatMap((title) => topics.filter((topic) => topic.title === title));
}

/** Replaces eligible child cards with their single canonical disease card. */
export function collapseTopicFamilies(topics: readonly DiseaseGuidelineSummary[]): DiseaseGuidelineSummary[] {
  const result: DiseaseGuidelineSummary[] = [];
  const emittedFamilies = new Set<string>();
  for (const topic of topics) {
    const family = getTopicFamily(topic.title);
    if (!family) {
      result.push(topic);
      continue;
    }
    const canonical = getFamilyCanonicalTopic(family, topics);
    if (!canonical) {
      result.push(topic);
      continue;
    }
    if (emittedFamilies.has(family.id)) continue;
    if (topic.id === canonical.id) {
      result.push(canonical);
      emittedFamilies.add(family.id);
    }
  }
  return result;
}
