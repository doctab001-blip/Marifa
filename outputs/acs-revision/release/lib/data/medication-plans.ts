import type { DiseaseDetail } from "@/lib/validations/disease";

type Regimen = NonNullable<DiseaseDetail["medicationPlan"]>["regimens"][number];
type MedicationPlan = NonNullable<DiseaseDetail["medicationPlan"]>;

const plans: Record<string, MedicationPlan> = {
  "b25d8f03-6c42-4e79-a130-7d94f2c8b516": {
    status: "local-protocol-required",
    note: "The linked Saudi Diabetes Clinical Practice Guideline supports patient-centred medicine selection and escalation, but the current adult type 2 diabetes record does not contain a verified starting dose and schedule for a named drug. Add the exact regimen only after matching it to current Saudi guidance, SFDA product information, renal function, comorbidities, and the hospital formulary.",
    regimens: [],
  },
  "c36e9014-7d53-4a82-b641-8e05a3c9d627": {
    status: "local-protocol-required",
    note: "This record covers screening and confirmation. Its linked MOH primary-care form is an older reference and is not a current prescribing protocol. Add named agents and exact doses only from an approved, current Saudi treatment pathway and the local formulary.",
    regimens: [],
  },
  "d47f0125-8e64-4b93-8c72-9f16a4d0e738": {
    status: "no-drug-indicated",
    note: "This is an elective pre-operative assessment pathway and does not define routine drug treatment. Antimicrobial prophylaxis, venous-thromboembolism prophylaxis, anticoagulant interruption, and peri-operative diabetes medicines require the current procedure-specific hospital protocol and patient-specific review.",
    regimens: [],
  },
  "e58a1236-9f75-4ca4-a398-0e27b5c1f849": {
    status: "local-protocol-required",
    note: "The linked MOH public guidance states that insulin may be used when lifestyle measures are insufficient but does not give an insulin product, dose, route schedule, or titration algorithm. Add the exact pregnancy regimen from the current hospital obstetric-diabetes protocol before presenting a dose.",
    regimens: [],
  },
  "f69b2347-a086-4db5-b509-1f38c6d2a950": {
    status: "source-verified",
    note: "Saudi National Cancer Centre guidance; adult advanced-cancer symptom care only. Individualise to opioid exposure, renal/hepatic function, frailty, goals of care, and the local controlled-medicines formulary.",
    regimens: [
      {
        indication: "Persistent dyspnoea in an opioid-naive adult with advanced cancer (regular oral regimen)",
        patientGroup: "Adults with advanced cancer and PPS 100–10%; opioid-naive",
        genericName: "Morphine immediate release",
        dose: "5 mg",
        route: "By mouth",
        frequency: "Every 4 hours regularly; breakthrough dose 2.5 mg every 2 hours as needed",
        duration: "Continue while indicated; reassess response and adverse effects frequently",
        adjustments: ["If oral administration is not available or reliable, the guideline gives a separate subcutaneous regimen; do not convert routes milligram-for-milligram.", "For patients already taking opioids, use the guideline's opioid-tolerant titration pathway rather than this starting regimen."],
        monitoring: ["Reassess dyspnoea, level of alertness, respiratory status, and breakthrough use.", "Monitor for opioid toxicity and adverse effects; use the local opioid-safety and bowel-care protocol."],
        sourceTitle: "Saudi Palliative Care National Clinical Guideline for Oncology",
        sourceUrl: "https://shc.gov.sa/ar/Centers/NCC/Activities/Documents/Palliative%20Care%20Guidelines%202019.pdf",
        sourceEdition: "2019, adult cancer dyspnoea pathway",
      },
      {
        indication: "Persistent dyspnoea when oral route is unavailable or unreliable",
        patientGroup: "Adults with advanced cancer and PPS 100–10%; opioid-naive",
        genericName: "Morphine",
        dose: "3 mg regularly; breakthrough dose 2 mg",
        route: "Subcutaneous",
        frequency: "Regularly every 4 hours; breakthrough every 1 hour as needed",
        duration: "Continue while indicated; reassess response and adverse effects frequently",
        adjustments: ["This is a distinct subcutaneous regimen; do not substitute oral doses without a clinician-led conversion.", "For patients already taking opioids, follow the guideline's opioid-tolerant titration pathway."],
        monitoring: ["Reassess dyspnoea, level of alertness, respiratory status, and breakthrough use.", "Monitor for opioid toxicity and adverse effects; use the local opioid-safety and bowel-care protocol."],
        sourceTitle: "Saudi Palliative Care National Clinical Guideline for Oncology",
        sourceUrl: "https://shc.gov.sa/ar/Centers/NCC/Activities/Documents/Palliative%20Care%20Guidelines%202019.pdf",
        sourceEdition: "2019, adult cancer dyspnoea pathway",
      },
      {
        indication: "Cancer pain in an opioid-naive adult when an immediate-release opioid is selected",
        patientGroup: "Adults with cancer pain; opioid-naive",
        genericName: "Morphine immediate release",
        dose: "5 mg regularly; rescue dose 2.5 mg or 5 mg",
        route: "By mouth",
        frequency: "Regularly every 4 hours; rescue every 1 hour as needed",
        duration: "Titrate under the palliative-care pathway to symptom relief and tolerability",
        adjustments: ["The guideline advises clinician-led titration and an alternative approach for patients already taking opioids.", "Check organ function, concurrent sedatives, prior opioid exposure, and local controlled-medicines requirements."],
        monitoring: ["Review pain and rescue-dose use, alertness, respiratory status, and adverse effects.", "Use the local opioid-safety and bowel-care protocol."],
        sourceTitle: "Saudi Palliative Care National Clinical Guideline for Oncology",
        sourceUrl: "https://shc.gov.sa/ar/Centers/NCC/Activities/Documents/Palliative%20Care%20Guidelines%202019.pdf",
        sourceEdition: "2019, adult cancer pain pathway",
      },
    ],
  },
};

export function getMedicationPlan(id: string): MedicationPlan | undefined {
  return plans[id];
}

export type MedicationRegimen = Regimen;
