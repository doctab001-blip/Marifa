import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Medication safety",
      bullets: [
        "Medication errors are among the most common preventable causes of patient harm.",
        "Errors can happen at prescribing, transcribing, dispensing, administration or monitoring.",
        "Safe systems and consistent checks catch errors before they reach the patient.",
        "This module covers safe practice, high-alert medicines and reporting.",
      ],
      visual: "Diagram: the medication-use process and where errors occur",
      keyPoint: "Most medication errors are system errors — checks are your safety net.",
    },
    {
      title: "The rights of medication administration",
      bullets: [
        "Right patient, right medicine, right dose.",
        "Right route, right time.",
        "Right reason and right documentation.",
        "Right response: monitor the effect and any adverse reaction.",
      ],
      visual: "Graphic: the rights of medication administration",
    },
    {
      title: "Before you give any medicine",
      bullets: [
        "Identify the patient with two identifiers.",
        "Check allergies and the allergy status on the record.",
        "Check the prescription is complete, legible and appropriate.",
        "Check the expiry date and the integrity of the product.",
      ],
      visual: "Photo: nurse checking a prescription against the patient wristband",
    },
    {
      title: "High-alert medicines",
      bullets: [
        "Medicines that carry a higher risk of significant harm when used in error.",
        "Examples: insulin, anticoagulants, opioids, concentrated electrolytes, chemotherapy, neuromuscular blockers.",
        "Additional safeguards: restricted storage, standard concentrations and independent double checks.",
        "Know your hospital's high-alert medicines list.",
      ],
      visual: "Photo: high-alert medicine labels and segregated storage",
      keyPoint: "Errors with high-alert medicines are not more common — but they are more harmful.",
    },
    {
      title: "Concentrated electrolytes",
      bullets: [
        "Concentrated potassium chloride and similar products are removed from general ward stock.",
        "They are stored only in authorised areas such as pharmacy and critical care, per policy.",
        "Use premixed, ready-to-use solutions wherever possible.",
        "Never give concentrated potassium as an undiluted injection.",
      ],
      visual: "Photo: premixed potassium infusion bags versus concentrated ampoules",
    },
    {
      title: "Independent double checks",
      bullets: [
        "A second qualified person checks independently, not just by watching.",
        "Each person separately checks the patient, the medicine, the dose calculation and the pump setting.",
        "Used for high-alert medicines and paediatric dose calculations, as policy requires.",
        "Both checks are documented.",
      ],
      visual: "Illustration: two nurses performing an independent double check",
    },
    {
      title: "Look-alike, sound-alike medicines",
      bullets: [
        "Medicines with similar names or packaging are easily confused.",
        "Tall Man lettering highlights differences, e.g. hydrOXYzine and hydrALAZINE.",
        "Store look-alike medicines apart and use alert labels.",
        "Read the label three times: when selecting, preparing and before giving.",
      ],
      visual: "Example: Tall Man lettering on look-alike labels",
    },
    {
      title: "Error-prone abbreviations",
      bullets: [
        "Write 'units' in full — 'U' can be read as 0 or 4.",
        "Never use a trailing zero: write 1 mg, not 1.0 mg.",
        "Always use a leading zero: write 0.5 mg, not .5 mg.",
        "Use only the hospital-approved abbreviations list.",
      ],
      visual: "Table: do-not-use abbreviations and their safe alternatives",
      keyPoint: "A trailing zero can turn 1 mg into a tenfold overdose.",
    },
    {
      title: "Verbal and telephone orders",
      bullets: [
        "Limit verbal orders to emergencies or situations defined by policy.",
        "Write the order down and read it back to the prescriber in full.",
        "Spell out drug names and state numbers digit by digit, e.g. 'one five' for 15.",
        "The prescriber signs the order within the time set by policy.",
      ],
      visual: "Illustration: read-back of a telephone order",
    },
    {
      title: "Infusion pumps",
      bullets: [
        "Use smart pumps with the drug library where available.",
        "Check the medicine, concentration, rate and line at the start and at every handover.",
        "Trace the line from the bag to the patient before connecting.",
        "Do not override pump alerts without rechecking.",
      ],
      visual: "Photo: smart infusion pump with drug library screen",
    },
    {
      title: "Allergies and adverse reactions",
      bullets: [
        "Record allergies with the type of reaction, not just the drug name.",
        "Check allergy status before prescribing, dispensing and giving.",
        "Recognise anaphylaxis early and follow the emergency protocol.",
        "Report suspected adverse drug reactions as per hospital and national pharmacovigilance policy.",
      ],
      visual: "Example: complete allergy entry in the record",
    },
    {
      title: "Medicine reconciliation",
      bullets: [
        "Obtain an accurate list of the patient's current medicines on admission.",
        "Compare it with new orders and resolve differences.",
        "Repeat at transfer and at discharge.",
        "Involve the patient, family and pharmacist.",
      ],
      visual: "Flowchart: reconciliation at admission, transfer and discharge",
    },
    {
      title: "Safe storage and handling",
      bullets: [
        "Store medicines in locked areas with controlled access.",
        "Monitor refrigerator temperatures and act on excursions.",
        "Controlled drugs follow special storage, recording and disposal rules.",
        "Label every prepared syringe and infusion that leaves your hands.",
      ],
      visual: "Photo: locked medicine cabinet and fridge temperature log",
    },
    {
      title: "Reporting errors and near misses",
      bullets: [
        "Make the patient safe first and inform the responsible doctor.",
        "Report all errors and near misses, including those that cause no harm.",
        "Reports are used to improve systems, in a just culture.",
        "Be open with patients when an error has reached them.",
      ],
      visual: "Graphic: from incident report to system improvement",
      keyPoint: "Near misses are free lessons — report them.",
    },
    {
      title: "Summary",
      bullets: [
        "Follow the rights of administration and check allergies every time.",
        "Apply extra safeguards and independent double checks for high-alert medicines.",
        "Avoid error-prone abbreviations; read back verbal orders.",
        "Report every error and near miss.",
      ],
      visual: "Summary card: medication safety essentials",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "Which is one of the rights of medication administration?", correct: "Right route", distractors: ["Right ward", "Right nurse", "Right brand only"] },
    { prompt: "Before giving a medicine, you must first:", correct: "Identify the patient with two identifiers and check allergies", distractors: ["Ask a colleague to give it for you", "Check only the bed number", "Give it and then check the chart"] },
    { prompt: "Which is an example of a high-alert medicine?", correct: "Insulin", distractors: ["Paracetamol tablets", "Simple linctus", "Oral rehydration salts"] },
    { prompt: "Why are some medicines classed as high-alert?", correct: "Errors with them are more likely to cause significant harm", distractors: ["They are always more expensive", "They are prescribed more often", "They are only given by doctors"] },
    { prompt: "Where should concentrated potassium chloride be stored?", correct: "Only in authorised areas, removed from general ward stock", distractors: ["On every ward next to saline", "In the patient's bedside locker", "In the staff room fridge"] },
    { prompt: "What makes a double check 'independent'?", correct: "Each person separately checks the patient, medicine, calculation and pump setting", distractors: ["The second person watches the first", "The second person signs without checking", "The same person checks twice"] },
    { prompt: "What is the purpose of Tall Man lettering?", correct: "To highlight differences between look-alike names", distractors: ["To mark expensive medicines", "To show the dose", "To indicate the route"] },
    { prompt: "How should 'units' be written on a prescription?", correct: "In full as 'units'", distractors: ["As 'U'", "As 'IU' in all cases", "As 'u.'"] },
    { prompt: "Which way of writing a dose is correct?", correct: "0.5 mg", distractors: [".5 mg", "0.50 mg", "1/2 mg"] },
    { prompt: "Why should trailing zeros (e.g. 1.0 mg) be avoided?", correct: "The decimal point may be missed, causing a tenfold overdose", distractors: ["They take longer to write", "Pharmacy cannot read them", "They are only a problem for tablets"] },
    { prompt: "When taking a telephone order you should:", correct: "Write it down and read it back in full to the prescriber", distractors: ["Remember it and write it later", "Ask a colleague to listen", "Accept it without repeating to save time"] },
    { prompt: "How should the dose '15' be confirmed in a read-back?", correct: "Digit by digit, as 'one five'", distractors: ["As 'fifty'", "By spelling the drug only", "It does not need confirming"] },
    { prompt: "A smart pump alerts that the rate is above the drug library limit. You should:", correct: "Stop and recheck the order, calculation and programming", distractors: ["Override it to avoid delay", "Turn the pump off and on", "Switch to a pump without a drug library"] },
    { prompt: "When should medicine reconciliation take place?", correct: "On admission, at transfer and at discharge", distractors: ["Only at discharge", "Only if the patient asks", "Only for patients over 65"] },
    { prompt: "How should an allergy be recorded?", correct: "The medicine and the type of reaction", distractors: ["The medicine name only", "A tick in the 'allergies' box only", "Verbally at handover only"] },
    { prompt: "You discover you gave a dose to the wrong patient. What is your first action?", correct: "Assess and make the patient safe, then inform the doctor", distractors: ["Complete the incident report first", "Wait to see if a reaction occurs", "Say nothing if the patient seems well"] },
    { prompt: "Should near misses be reported?", correct: "Yes — they help identify system weaknesses", distractors: ["No, because no harm occurred", "Only if a manager saw it", "Only if it happens twice"] },
    { prompt: "A prepared syringe for an infusion should be:", correct: "Labelled immediately with the medicine, dose and patient", distractors: ["Left unlabelled if given straight away", "Labelled at the end of the shift", "Labelled only if it is a controlled drug"] },
    { prompt: "Concentrated potassium chloride should be given:", correct: "Never as an undiluted injection; use premixed solutions", distractors: ["As a rapid IV push", "As an undiluted IV bolus over 1 minute", "Intramuscularly"] },
    { prompt: "When should you read the medicine label?", correct: "When selecting, when preparing and before giving", distractors: ["Only when selecting", "Only if the packaging looks different", "Only at the end of the round"] },
  ],
};

export default content;
