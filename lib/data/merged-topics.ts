/**
 * Duplicate catalogue topics merged into one canonical topic (12 Oct 2026; extended 1 Nov 2026).
 * The duplicate rows and their full version history stay in the database untouched;
 * they are only hidden from the public directory and the Drafts queue, and redirected to the canonical page.
 * Key = duplicate guideline id, value = canonical guideline id. The canonical topic is the best version.
 */
export const mergedTopics: Readonly<Record<string, string>> = {
  // Acute Coronary Syndrome Assessment and Escalation Pathway → Acute Coronary Syndrome (existing 12 Oct merge)
  "a14c7e92-5b31-4d68-9f20-6c83e1b7a405": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e103",
  // Sepsis → Sepsis and Septic Shock (existing 12 Oct merge)
  "a1010000-0000-4000-8000-000000000002": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e102",
  // Type 2 Diabetes Mellitus Longitudinal Care Pathway → Type 2 Diabetes Mellitus Longitudinal Care (existing 12 Oct merge)
  "b25d8f03-6c42-4e79-a130-7d94f2c8b516": "3f198bb7-8829-4e91-b35c-e46ad1e07eb5",
  // Acute Severe Asthma Exacerbation → Acute Severe Asthma Exacerbation (Adult) (reversed 1 Nov: the adult record carries the Saudi-depth version)
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e101": "a1010000-0000-4000-8000-000000000001",
  // Acute Severe Asthma in Adults → Acute Severe Asthma Exacerbation (Adult) (19 Oct outline)
  "14483a4a-1452-41ee-806b-19d63ee3899e": "a1010000-0000-4000-8000-000000000001",
  // Acute Coronary Syndrome (STEMI and NSTEMI) → Acute Coronary Syndrome (19 Oct outline)
  "a6631778-7cc3-44e7-92f1-6ac7371de6ac": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e103",
  // Sepsis in Adults → Sepsis and Septic Shock (19 Oct outline)
  "c3db772d-1235-4004-8507-6820fe3b412f": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e102",
  // Neutropenic Sepsis → Neutropenic Sepsis: One-Hour Door-to-Antibiotic Protocol (19 Oct outline)
  "dfc9e5ef-105d-42ff-ac3a-c1334dccfeb0": "18df6754-5d66-4ad0-a411-290d87ddbd56",
  // Acute Exacerbation of COPD → Acute Exacerbation of COPD (19 Oct outline)
  "5cd35dbc-8064-436c-a3e0-f355ea9d9dc7": "05481a2b-c95c-440a-a4d0-0c520e8129a4",
  // Acute Heart Failure and Pulmonary Oedema → Acute Heart Failure and Pulmonary Oedema (19 Oct outline)
  "287f3df6-b19b-4304-b69f-fcad07db7a55": "336de333-f235-46c4-aa57-2ea4a6e017d5",
  // Acute Kidney Injury (AKI) → Acute Kidney Injury (19 Oct outline)
  "1e217d32-0bec-4aa2-9f27-506f0b3945e2": "cb0f8932-f4c5-4a6a-9d44-d320713a366b",
  // Acute Stroke and Thrombolysis Pathway → Acute Ischemic Stroke (19 Oct outline)
  "dbe49636-0808-4fe1-8e4f-7c6d2d3e7777": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e105",
  // Acute Upper Gastrointestinal Bleeding (Including Variceal) → Acute Upper Gastrointestinal Bleeding (19 Oct outline)
  "449f62c9-4a54-46f7-848c-b52a5fe32199": "6fccc942-c6f3-4ef7-94cf-26fd23edfd27",
  // Adult Cardiac Arrest (Advanced Life Support) → Cardiac Arrest (19 Oct outline)
  "c11771d3-ff50-420f-8095-d8d0c8b558d2": "9c2bdfee-ee19-4b0e-9d47-d44467542a0d",
  // Anaphylaxis → Acute Anaphylaxis (19 Oct outline)
  "d590fa4f-e391-49c4-be0b-90d6453a5da1": "a1010000-0000-4000-8000-000000000005",
  // Diabetic Ketoacidosis (DKA) in Adults → Diabetic Ketoacidosis (19 Oct outline)
  "bbf33f47-4dcd-46fa-9635-eda11c403c6f": "625f0d83-3863-47f9-a64e-55c0355f3240",
  // Hyperosmolar Hyperglycaemic State (HHS) → Hyperosmolar Hyperglycaemic State (19 Oct outline)
  "fa7955e6-5267-4970-b26f-b25698fc269b": "c21a33c2-d701-4435-8ba7-e8f75db067fa",
  // Hypoglycaemia in Adults → Severe Hypoglycaemia (19 Oct outline)
  "05f4d24c-6464-4f14-8965-f95ac195a230": "8091cd18-2256-40b7-8c6d-7557ac5e2fdf",
  // Major Trauma: Primary Survey and Resuscitation → Major Trauma: ED Primary Survey and Massive Haemorrhage Protocol (19 Oct outline)
  "35e076fa-fd60-4a21-85dc-c29f5f9621aa": "8308b72f-3d4e-4632-8f98-24fc08841f57",
  // Pulmonary Embolism → Deep-Vein Thrombosis and Pulmonary Embolism (19 Oct outline)
  "e5ec5a14-a0bb-4006-bba9-ce88451d9682": "a1010000-0000-4000-8000-000000000003",
  // Status Epilepticus → Status Epilepticus and Acute Seizures: ED Stabilisation (19 Oct outline)
  "5c3ebd25-493f-4ae7-875c-5f2e89aceecc": "bdc4cb8d-5417-4a77-99c8-6c48d8f79897",
  // Symptomatic Bradycardia → Symptomatic Bradycardia (19 Oct outline)
  "a9605936-2417-47ca-be14-4aeda0028885": "b04002c0-c9b2-4971-88f3-7a82e9279376",
  // Suspected Bacterial Meningitis → Suspected Meningitis and Encephalitis: ED Investigation and Treatment Pathway (19 Oct outline)
  "9752928c-1806-444a-8c8e-ab1788ea0647": "989c9784-f4f3-4b7b-b124-638e0abf0929",
  // Ectopic Pregnancy → Suspected Ectopic Pregnancy: ED Pathway (19 Oct outline)
  "5a53860f-178e-40af-a776-4baa030b8be5": "300add03-1e43-491f-bdb9-59c7f934611a",
  // Severe Pre-eclampsia and Eclampsia → Severe Pre-Eclampsia and Eclampsia: Emergency Management (19 Oct outline; its 1 Nov content moved to the canonical topic)
  "9d37974f-5254-4295-b494-76d27a83724f": "6428a5ea-5d0f-4466-bba6-4b51c263d8db",
  // Acute Asthma Exacerbation in Children: ED Pathway → Acute Asthma Exacerbation in Children: Inhaler Technique and Oral Steroid Discharge Plan (18 Oct pathway; same condition and setting as the Saudi-depth topic)
  "b7094a86-5aa2-4e91-856f-0ea66a94c988": "502aed05-1d2f-4401-85a2-3b7fd34c8645",
  // Obesity and Weight-Related Health → Obesity in Adults: Primary Care Weight Management Pathway (same scope; canonical has fewer gaps)
  "96362735-4fed-4dc9-9c7b-3a8d10d1cfbd": "7e5c9fca-7397-44ce-a56e-ba34f4dc0a00",
  // Dyslipidaemia and Atherosclerotic Risk → Dyslipidaemia: Statin Initiation and Lipid Targets (same scope; canonical has more content and fewer gaps)
  "65fce08b-a289-44bd-9c91-79b2243f824c": "6b2d4096-1149-4fdc-ae0f-dbb5d42bda93",
  // Post-PCI Community Secondary Prevention → Post-Myocardial Infarction Community Secondary Prevention and Cardiac Rehabilitation (post-PCI is covered by post-MI secondary prevention)
  "b9fb2b29-d6e6-4672-b8b8-39cfd0f69774": "0c416416-2a78-4f23-b9eb-efeca7659ab1",
  // Hypertension in Adults [Adapted from NICE] → Hypertension: Primary Care Titration and Target Review (same scope; canonical has more content)
  "a1020000-0000-4000-8000-000000000002": "83ef740c-07f6-4689-be0a-5d4c06a4a259",
  // Gestational Diabetes Identification and Management Pathway → Gestational Diabetes: Antenatal Glucose Management and Delivery Planning (GDM pathway duplicates GDM screening (7916baee) and antenatal management)
  "e58a1236-9f75-4ca4-a398-0e27b5c1f849": "70f676c7-80dd-4ffc-a283-b54be839d68d",
};

export function canonicalTopicId(id: string): string | undefined {
  return Object.hasOwn(mergedTopics, id) ? mergedTopics[id] : undefined;
}
