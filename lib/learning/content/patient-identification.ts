import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Why patient identification matters",
      bullets: [
        "Misidentification causes wrong-patient medicines, transfusions, procedures and results.",
        "Errors happen most often during busy periods, handovers and transfers.",
        "Correct patient identification is a CBAHI Essential Safety Requirement.",
        "This module covers how and when to identify every patient correctly.",
      ],
      visual: "Infographic: where identification errors happen along the patient journey",
      keyPoint: "Every patient, every time, at every point of care.",
    },
    {
      title: "The two-identifier rule",
      bullets: [
        "Use at least two patient identifiers before any care, treatment or service.",
        "Approved identifiers are typically the full name and the medical record number (or date of birth), per hospital policy.",
        "Room or bed number is never an identifier.",
        "The identifiers must match the wristband, the request and the patient's record.",
      ],
      visual: "Photo: wristband showing full name, MRN and date of birth",
    },
    {
      title: "Ask, don't tell",
      bullets: [
        "Ask the patient to state their full name and date of birth.",
        "Do not ask 'Are you Mr Ahmed?' — patients may say yes to a wrong name.",
        "Compare their answer with the wristband and the document in your hand.",
        "Use a qualified interpreter when there is a language barrier.",
      ],
      visual: "Illustration: open-question identity check at the bedside",
      keyPoint: "Use open questions, never closed yes/no questions.",
    },
    {
      title: "When identification is required",
      bullets: [
        "Before giving any medicine, blood or blood product.",
        "Before taking blood or other specimens, and when labelling them.",
        "Before procedures, imaging and radiotherapy.",
        "Before diet delivery, transfers, handover and release of information.",
      ],
      visual: "Checklist graphic: moments that require a two-identifier check",
    },
    {
      title: "The identification wristband",
      bullets: [
        "Applied at registration or admission and worn throughout the stay.",
        "Must be legible, accurate and securely attached.",
        "If it is missing, damaged or wrong, replace it before continuing care.",
        "Allergy and alert bands follow hospital colour-coding policy.",
      ],
      visual: "Photo: correct wristband application on the wrist",
    },
    {
      title: "Specimen labelling",
      bullets: [
        "Label specimens at the bedside, in the presence of the patient.",
        "Never pre-label tubes before collection.",
        "Collect from one patient at a time.",
        "Unlabelled or mislabelled specimens are rejected and must be recollected.",
      ],
      visual: "Photo: labelling a blood tube at the bedside",
      keyPoint: "One patient, one set of labels, at the bedside.",
    },
    {
      title: "Blood transfusion",
      bullets: [
        "Positive patient identification is essential at sample collection and at administration.",
        "Check the patient's identifiers against the blood component label and the compatibility record.",
        "Two qualified staff perform the bedside check, or as hospital policy specifies.",
        "Stop and do not transfuse if there is any discrepancy.",
      ],
      visual: "Photo: two-person bedside check of a blood component",
    },
    {
      title: "Unconscious or unidentified patients",
      bullets: [
        "Use a temporary unique identifier as set out in hospital policy.",
        "Apply a wristband with the temporary identifier immediately.",
        "Link records carefully once the patient's identity is confirmed.",
        "Never guess or borrow another patient's details.",
      ],
      visual: "Flowchart: temporary identification for an unknown emergency patient",
    },
    {
      title: "Patients with similar names",
      bullets: [
        "Similar or identical names on the same unit are a known risk.",
        "Use name-alert stickers or system alerts as per policy.",
        "Avoid placing patients with similar names in adjacent beds where possible.",
        "Always rely on two identifiers, never on the name alone.",
      ],
      visual: "Example: name-alert flag on a patient board",
    },
    {
      title: "Newborns and paediatrics",
      bullets: [
        "Newborns receive identification bands at birth, before leaving the delivery room.",
        "Mother and baby bands are matched at every transfer and before discharge.",
        "Parents or guardians confirm identity for young children.",
        "Never rely on cot cards alone.",
      ],
      visual: "Photo: matching mother and newborn identification bands",
    },
    {
      title: "Procedures and surgery",
      bullets: [
        "Identity is confirmed at booking, pre-procedure and in the procedure room.",
        "The surgical safety checklist includes identity, procedure and site.",
        "Site marking is done by the responsible clinician with the patient involved.",
        "The time-out is performed with the whole team before starting.",
      ],
      visual: "Photo: surgical team performing a time-out",
    },
    {
      title: "Electronic records and orders",
      bullets: [
        "Confirm you have the correct patient open before ordering, documenting or reviewing results.",
        "Close one patient record before opening another.",
        "Scan barcodes where available but still check visually.",
        "Report wrong-patient entries immediately so they can be corrected.",
      ],
      visual: "Screenshot mock-up: patient banner in the electronic health record",
    },
    {
      title: "Handover and transfer",
      bullets: [
        "Identify the patient using two identifiers at every handover.",
        "Transfer documentation must carry the same identifiers as the wristband.",
        "The receiving unit confirms identity on arrival.",
        "Use a structured handover format such as SBAR.",
      ],
      visual: "Illustration: structured bedside handover",
    },
    {
      title: "When something doesn't match",
      bullets: [
        "Stop: do not proceed with care until the discrepancy is resolved.",
        "Recheck with the patient, the wristband and the records.",
        "Escalate to the nurse in charge if it cannot be resolved.",
        "Report identification errors and near misses through the incident system.",
      ],
      visual: "Stop sign graphic: 'If in doubt, don't proceed'",
      keyPoint: "A discrepancy is a stop sign, not a formality.",
    },
    {
      title: "Summary",
      bullets: [
        "Use at least two identifiers — never the room or bed number.",
        "Ask open questions and check against the wristband and the record.",
        "Label specimens at the bedside and check blood at the bedside.",
        "Stop and escalate any discrepancy, then report it.",
      ],
      visual: "Summary card: the patient identification checklist",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "How many patient identifiers must be used before care?", correct: "At least two", distractors: ["One", "Two only for surgery", "Three for every task"] },
    { prompt: "Which of these is NOT an acceptable patient identifier?", correct: "Room or bed number", distractors: ["Full name", "Medical record number", "Date of birth"] },
    { prompt: "What is the best way to confirm a patient's identity?", correct: "Ask the patient to state their full name and date of birth", distractors: ["Ask 'Are you Mr Ahmed?'", "Check the name on the bed board", "Ask the patient in the next bed"] },
    { prompt: "Why should closed questions be avoided when identifying a patient?", correct: "Patients may agree to an incorrect name", distractors: ["They take longer to answer", "They are impolite in all cultures", "They are only allowed for children"] },
    { prompt: "When should a specimen tube be labelled?", correct: "At the bedside, in the presence of the patient, after collection", distractors: ["Before going to the bedside", "At the nursing station after the round", "In the laboratory"] },
    { prompt: "A patient's wristband is missing. What do you do?", correct: "Replace it after confirming identity, before continuing care", distractors: ["Continue care and replace it at discharge", "Use the bed number until it is replaced", "Write the name on the patient's hand"] },
    { prompt: "Patient identification is required before:", correct: "Medicines, specimens, procedures and transfusion", distractors: ["Only before surgery", "Only on admission", "Only when the patient is unconscious"] },
    { prompt: "An unconscious patient arrives with no identification. What should be used?", correct: "A temporary unique identifier as per hospital policy", distractors: ["The details of a patient with a similar description", "The bed number only", "No identification until they wake up"] },
    { prompt: "The identifiers on a blood component do not match the wristband. You should:", correct: "Stop and not transfuse until it is resolved", distractors: ["Transfuse if the blood group matches", "Transfuse and report later", "Change the wristband to match"] },
    { prompt: "Two patients with the same surname are on your unit. The best practice is to:", correct: "Use name alerts and always rely on two identifiers", distractors: ["Use first names only", "Rely on bed numbers", "Ignore it if they have different diagnoses"] },
    { prompt: "When is a newborn's identification band applied?", correct: "At birth, before leaving the delivery room", distractors: ["On arrival at the nursery", "On discharge", "Only if the mother requests it"] },
    { prompt: "What should be matched before a newborn is discharged?", correct: "The mother's and baby's identification bands", distractors: ["The cot card only", "The baby's weight", "The discharge time"] },
    { prompt: "Before ordering a test in the electronic record, you should:", correct: "Confirm the correct patient's record is open", distractors: ["Open several records at once to save time", "Use the last patient you looked at", "Check only the bed number"] },
    { prompt: "When should identity be confirmed during handover?", correct: "At every handover, using two identifiers", distractors: ["Only on the first day of admission", "Only if the patient is new to you", "Never — the previous nurse has already checked"] },
    { prompt: "Pre-labelling blood tubes before collection is:", correct: "Not allowed because it risks wrong-patient specimens", distractors: ["Good practice to save time", "Allowed if done by the same nurse", "Allowed for routine bloods only"] },
    { prompt: "Who should mark the surgical site?", correct: "The responsible clinician, involving the patient", distractors: ["The porter", "Any nurse on the ward", "The patient alone"] },
    { prompt: "What should you do if a patient's details on the request form do not match the wristband?", correct: "Stop, recheck, escalate if unresolved and report it", distractors: ["Use the request form details", "Use the wristband details and proceed", "Cross out the mismatched details"] },
    { prompt: "Patient identification is part of which CBAHI requirement set?", correct: "The Essential Safety Requirements", distractors: ["Optional quality indicators", "Facility parking standards", "Catering standards"] },
    { prompt: "For a patient who does not speak your language, you should:", correct: "Use a qualified interpreter to confirm identity", distractors: ["Rely on the bed number", "Skip the identity check", "Ask any visitor to answer for them"] },
    { prompt: "Identification errors and near misses should be:", correct: "Reported through the incident reporting system", distractors: ["Ignored if no harm occurred", "Corrected without telling anyone", "Reported only if the patient complains"] },
  ],
};

export default content;
