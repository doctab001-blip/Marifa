import type { DiagnosticInputState } from "@/types/diagnosisEngine";

export type ClinicalPreset = { id: string; label: string; summary: string; input: Omit<DiagnosticInputState, "region"> };

/** Fictional teaching scenarios for testing the engine. Not patient data. */
export const clinicalPresets: ClinicalPreset[] = [
  {
    id: "acute-chest-pain",
    label: "Acute chest pain triage",
    summary: "58-year-old man, 4 days after knee surgery",
    input: {
      age: 58,
      gender: "male",
      symptoms: ["Sudden onset dyspnoea", "Pleuritic chest pain", "Haemoptysis"],
      examFindings: ["Tachycardia", "Hypoxia", "Unilateral calf swelling"],
      labInvestigations: ["Elevated D-dimer", "Troponin mildly raised", "Sinus tachycardia on ECG"],
      imagingFindings: ["Normal chest X-ray"],
    },
  },
  {
    id: "acute-abdomen",
    label: "Acute abdomen",
    summary: "24-year-old woman, 18 hours of pain",
    input: {
      age: 24,
      gender: "female",
      symptoms: ["Periumbilical pain migrating to right iliac fossa", "Anorexia", "Nausea"],
      examFindings: ["Right iliac fossa tenderness", "Rebound tenderness", "Low-grade fever"],
      labInvestigations: ["Leukocytosis", "Raised CRP", "Negative pregnancy test"],
      imagingFindings: ["Non-compressible appendix on ultrasound"],
    },
  },
  {
    id: "fever-headache",
    label: "Fever with headache",
    summary: "19-year-old student, 12 hours unwell",
    input: {
      age: 19,
      gender: "male",
      symptoms: ["Severe headache", "Fever", "Photophobia", "Vomiting"],
      examFindings: ["Neck stiffness", "Non-blanching petechial rash", "Kernig sign positive"],
      labInvestigations: ["Raised CRP", "Leukocytosis"],
      imagingFindings: ["Normal CT head"],
    },
  },
  {
    id: "prolonged-fever",
    label: "Prolonged fever",
    summary: "32-year-old woman, 10 days of fever after travel",
    input: {
      age: 32,
      gender: "female",
      symptoms: ["Prolonged fever for 10 days", "Headache", "Abdominal pain", "Constipation"],
      examFindings: ["Relative bradycardia", "Hepatosplenomegaly"],
      labInvestigations: ["Leukopenia", "Raised transaminases"],
      imagingFindings: ["Splenomegaly on ultrasound"],
    },
  },
  {
    id: "breathless-older-adult",
    label: "Breathless older adult",
    summary: "72-year-old man, 2 weeks of worsening breathlessness",
    input: {
      age: 72,
      gender: "male",
      symptoms: ["Orthopnoea", "Ankle swelling", "Breathlessness on exertion"],
      examFindings: ["Bibasal crackles", "Raised JVP"],
      labInvestigations: ["Raised NT-proBNP"],
      imagingFindings: ["Pulmonary oedema on chest X-ray"],
    },
  },
];
