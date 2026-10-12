export type RiskTone = "low" | "moderate" | "high";

type BaseQuestion = {
  id: string;
  label: string;
  help?: string;
  required?: boolean;
};

export type CalculatorOption = {
  value: string;
  label: string;
  description?: string;
  points: number;
};

export type SingleSelectQuestion = BaseQuestion & {
  type: "single-select";
  options: CalculatorOption[];
};

export type MultiSelectQuestion = BaseQuestion & {
  type: "multi-select";
  options: CalculatorOption[];
  noneLabel?: string;
};

export type CalculatorUnit = {
  value: string;
  label: string;
  canonicalMultiplier?: number;
  canonicalOffset?: number;
};

export type NumericScoreRange = {
  min?: number;
  minInclusive?: boolean;
  max?: number;
  maxInclusive?: boolean;
  points: number;
};

export type NumericQuestion = BaseQuestion & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  units: CalculatorUnit[];
  scoring: NumericScoreRange[];
};

export type CalculatorQuestion = SingleSelectQuestion | MultiSelectQuestion | NumericQuestion;

export type NumericAnswer = { value: number; unit: string };
export type CalculatorAnswer = string | string[] | NumericAnswer;
export type CalculatorAnswers = Record<string, CalculatorAnswer | undefined>;

export type ResultMatch = {
  minScore?: number;
  maxScore?: number;
  answerEquals?: Record<string, string>;
};

export type CalculatorResult = {
  id: string;
  label: string;
  tone: RiskTone;
  match: ResultMatch;
  summary: string;
  management: string[];
};

export type CalculatorEvidence = {
  formula: string[];
  validation: string;
  limitations: string[];
  sources: Array<{ label: string; detail: string; url: string }>;
};

export type ClinicalCalculatorSchema = {
  id: string;
  shortTitle: string;
  title: string;
  objective: string;
  indication: string;
  scoreLabel: string;
  questions: CalculatorQuestion[];
  results: CalculatorResult[];
  evidence: CalculatorEvidence;
};

function isInRange(value: number, range: NumericScoreRange) {
  const aboveMinimum = range.min === undefined
    || (range.minInclusive === false ? value > range.min : value >= range.min);
  const belowMaximum = range.max === undefined
    || (range.maxInclusive === true ? value <= range.max : value < range.max);
  return aboveMinimum && belowMaximum;
}

export function toCanonicalValue(value: number, unit: CalculatorUnit) {
  return value * (unit.canonicalMultiplier ?? 1) + (unit.canonicalOffset ?? 0);
}

export function fromCanonicalValue(value: number, unit: CalculatorUnit) {
  return (value - (unit.canonicalOffset ?? 0)) / (unit.canonicalMultiplier ?? 1);
}

export function questionScore(question: CalculatorQuestion, answer: CalculatorAnswer | undefined) {
  if (answer === undefined) return 0;
  if (question.type === "single-select") {
    return question.options.find((option) => option.value === answer)?.points ?? 0;
  }
  if (question.type === "multi-select") {
    if (!Array.isArray(answer)) return 0;
    return answer.reduce((total, value) => total + (question.options.find((option) => option.value === value)?.points ?? 0), 0);
  }
  if (typeof answer !== "object" || Array.isArray(answer)) return 0;
  const unit = question.units.find(({ value }) => value === answer.unit) ?? question.units[0];
  const canonicalValue = toCanonicalValue(answer.value, unit);
  return question.scoring.find((range) => isInRange(canonicalValue, range))?.points ?? 0;
}

export function calculateScore(schema: ClinicalCalculatorSchema, answers: CalculatorAnswers) {
  return schema.questions.reduce((total, question) => total + questionScore(question, answers[question.id]), 0);
}

export function isQuestionComplete(question: CalculatorQuestion, answer: CalculatorAnswer | undefined) {
  if (question.required === false) return true;
  if (question.type === "multi-select") return Array.isArray(answer);
  if (question.type === "single-select") return typeof answer === "string";
  return typeof answer === "object" && !Array.isArray(answer) && Number.isFinite(answer.value);
}

export function getCalculatorResult(schema: ClinicalCalculatorSchema, score: number, answers: CalculatorAnswers) {
  return schema.results.find(({ match }) => {
    if (match.minScore !== undefined && score < match.minScore) return false;
    if (match.maxScore !== undefined && score > match.maxScore) return false;
    return Object.entries(match.answerEquals ?? {}).every(([questionId, value]) => answers[questionId] === value);
  });
}

export const clinicalCalculators: ClinicalCalculatorSchema[] = [
  {
    id: "wells-pe",
    shortTitle: "Wells' PE",
    title: "Wells' Criteria for Pulmonary Embolism",
    objective: "Estimate the pre-test probability of pulmonary embolism in an adult with suspected PE.",
    indication: "Use only after clinical assessment has raised suspicion of PE. This score supports, but does not replace, clinical judgement or the local diagnostic pathway.",
    scoreLabel: "Wells score",
    questions: [
      {
        id: "dvt-signs",
        type: "single-select",
        label: "Clinical signs and symptoms of DVT",
        help: "Minimum of leg swelling and pain with palpation of the deep veins.",
        options: [
          { value: "no", label: "No", points: 0 },
          { value: "yes", label: "Yes", points: 3 },
        ],
      },
      {
        id: "alternative-less-likely",
        type: "single-select",
        label: "Alternative diagnosis less likely than PE",
        help: "A clinician-assessed criterion; do not infer it from the other answers.",
        options: [
          { value: "no", label: "No", points: 0 },
          { value: "yes", label: "Yes", points: 3 },
        ],
      },
      {
        id: "heart-rate",
        type: "number",
        label: "Heart rate",
        min: 0,
        max: 300,
        step: 1,
        units: [{ value: "bpm", label: "beats/min" }],
        scoring: [
          { max: 100, maxInclusive: true, points: 0 },
          { min: 100, minInclusive: false, points: 1.5 },
        ],
      },
      {
        id: "history",
        type: "multi-select",
        label: "History and associated features",
        help: "Select every feature that applies, or explicitly select none.",
        noneLabel: "None of these",
        options: [
          { value: "immobilisation-surgery", label: "Immobilisation >3 days or surgery in previous 4 weeks", points: 1.5 },
          { value: "previous-vte", label: "Previous DVT or PE", points: 1.5 },
          { value: "haemoptysis", label: "Haemoptysis", points: 1 },
          { value: "malignancy", label: "Malignancy", description: "On treatment, treated in the last 6 months, or palliative.", points: 1 },
        ],
      },
    ],
    results: [
      {
        id: "pe-unlikely",
        label: "PE unlikely",
        tone: "low",
        match: { maxScore: 4 },
        summary: "Two-level Wells classification: 4 points or less.",
        management: [
          "Obtain a D-dimer result within 4 hours if possible.",
          "If the D-dimer is positive, proceed to the imaging pathway. If it is negative, consider an alternative diagnosis.",
          "If the D-dimer result cannot be obtained within 4 hours, follow the local pathway for interim therapeutic anticoagulation while awaiting the result.",
        ],
      },
      {
        id: "pe-likely",
        label: "PE likely",
        tone: "high",
        match: { minScore: 4.5 },
        summary: "Two-level Wells classification: more than 4 points.",
        management: [
          "Arrange CTPA immediately if possible; assess V/Q imaging suitability when CTPA is unsuitable.",
          "If diagnostic imaging cannot be performed immediately, follow the local pathway for interim therapeutic anticoagulation.",
        ],
      },
    ],
    evidence: {
      formula: [
        "DVT signs +3; alternative diagnosis less likely than PE +3.",
        "Heart rate >100/min +1.5; immobilisation >3 days or surgery in the previous 4 weeks +1.5; previous DVT/PE +1.5.",
        "Haemoptysis +1; malignancy on treatment, treated in the last 6 months, or palliative +1.",
      ],
      validation: "The simplified rule was derived by Wells and colleagues in 2000. A prospective management study published in 2001 reported a 99.5% negative predictive value when a low clinical probability was combined with a negative D-dimer in the studied cohort.",
      limitations: [
        "Use in patients with suspected PE; it is not a population screening tool.",
        "The ‘alternative diagnosis’ item is subjective and requires clinician judgement.",
        "Apply local imaging, anticoagulation, pregnancy and renal-impairment protocols.",
      ],
      sources: [
        { label: "NICE NG158", detail: "Recommendations 1.1.17–1.1.21 and Table 2 (updated 2023)", url: "https://www.nice.org.uk/guidance/ng158/chapter/Recommendations" },
        { label: "Wells et al., 2000", detail: "Derivation of the simplified clinical model", url: "https://pubmed.ncbi.nlm.nih.gov/10744147/" },
        { label: "Wells et al., 2001", detail: "Prospective management study, Annals of Internal Medicine 135(2):98–107", url: "https://pubmed.ncbi.nlm.nih.gov/11453709/" },
      ],
    },
  },
  {
    id: "cha2ds2-vasc",
    shortTitle: "CHA₂DS₂-VASc",
    title: "CHA₂DS₂-VASc Stroke Risk Score",
    objective: "Estimate thromboembolic stroke risk factors in an adult with atrial fibrillation.",
    indication: "Use for people with atrial fibrillation to support stroke-prevention decisions. Assess bleeding risk, contraindications and patient preferences separately.",
    scoreLabel: "CHA₂DS₂-VASc",
    questions: [
      {
        id: "sex",
        type: "single-select",
        label: "Sex category",
        help: "The original score assigns 1 point for female sex.",
        options: [
          { value: "male", label: "Male", points: 0 },
          { value: "female", label: "Female", points: 1 },
        ],
      },
      {
        id: "age",
        type: "number",
        label: "Age",
        min: 18,
        max: 120,
        step: 1,
        units: [{ value: "years", label: "years" }],
        scoring: [
          { max: 65, points: 0 },
          { min: 65, max: 75, points: 1 },
          { min: 75, points: 2 },
        ],
      },
      {
        id: "risk-factors",
        type: "multi-select",
        label: "Clinical risk factors",
        help: "Select every documented factor that applies, or explicitly select none.",
        noneLabel: "None of these",
        options: [
          { value: "heart-failure", label: "Congestive heart failure or left ventricular dysfunction", points: 1 },
          { value: "hypertension", label: "Hypertension", points: 1 },
          { value: "diabetes", label: "Diabetes mellitus", points: 1 },
          { value: "stroke", label: "Previous stroke, TIA or systemic thromboembolism", points: 2 },
          { value: "vascular", label: "Vascular disease", description: "Previous myocardial infarction, peripheral artery disease or aortic plaque.", points: 1 },
        ],
      },
    ],
    results: [
      {
        id: "very-low-male",
        label: "Very low risk",
        tone: "low",
        match: { maxScore: 0, answerEquals: { sex: "male" } },
        summary: "CHA₂DS₂-VASc 0 in a man.",
        management: ["Do not offer anticoagulation solely for stroke prevention when there are no other risk factors."],
      },
      {
        id: "very-low-female",
        label: "Very low risk",
        tone: "low",
        match: { minScore: 1, maxScore: 1, answerEquals: { sex: "female" } },
        summary: "CHA₂DS₂-VASc 1 due to sex category alone.",
        management: ["Do not offer anticoagulation solely for stroke prevention when sex is the only risk factor and the patient is under 65."],
      },
      {
        id: "intermediate-male",
        label: "Intermediate risk",
        tone: "moderate",
        match: { minScore: 1, maxScore: 1, answerEquals: { sex: "male" } },
        summary: "CHA₂DS₂-VASc 1 in a man.",
        management: ["Consider anticoagulation with a direct-acting oral anticoagulant after assessing bleeding risk, contraindications and patient preferences."],
      },
      {
        id: "anticoagulation-threshold",
        label: "Anticoagulation indicated",
        tone: "high",
        match: { minScore: 2 },
        summary: "CHA₂DS₂-VASc 2 or above.",
        management: ["Offer anticoagulation with a direct-acting oral anticoagulant, taking bleeding risk, contraindications and patient preferences into account.", "Use a vitamin K antagonist if direct-acting oral anticoagulants are contraindicated, not tolerated or unsuitable."],
      },
    ],
    evidence: {
      formula: [
        "Congestive heart failure/LV dysfunction +1; hypertension +1; diabetes +1; vascular disease +1; female sex +1.",
        "Age 65–74 +1; age ≥75 +2. Age bands are mutually exclusive.",
        "Previous stroke, TIA or systemic thromboembolism +2. Maximum score: 9.",
      ],
      validation: "Lip and colleagues introduced and evaluated CHA₂DS₂-VASc using the Euro Heart Survey on atrial fibrillation in 2010. NICE uses it to assess stroke risk and identifies a score of 2 or more as the anticoagulation threshold, with men scoring 1 considered separately.",
      limitations: [
        "The score estimates stroke-risk factors; it does not calculate bleeding risk or choose a drug or dose.",
        "Reassess risk when age or comorbidities change and after cardioversion or ablation when recurrence remains possible.",
        "Follow local and Saudi formulary requirements before prescribing.",
      ],
      sources: [
        { label: "NICE NG196", detail: "Recommendations 1.2.3 and 1.6.1–1.6.8 (2021)", url: "https://www.nice.org.uk/guidance/ng196/chapter/Recommendations" },
        { label: "Lip et al., 2010", detail: "Original CHA₂DS₂-VASc validation, Chest 137(2):263–272", url: "https://pubmed.ncbi.nlm.nih.gov/19762550/" },
      ],
    },
  },
];
