import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Hand hygiene saves lives",
      bullets: [
        "Hands are the most common route for spreading microorganisms between patients.",
        "Good hand hygiene is the single most effective way to prevent healthcare-associated infection.",
        "Hand hygiene compliance is audited and reported as part of CBAHI accreditation.",
        "This module covers when, how and with what to clean your hands.",
      ],
      visual: "Illustration: microorganisms transferring from hands to patient and surfaces",
      keyPoint: "Clean hands are the simplest, cheapest infection-prevention tool we have.",
    },
    {
      title: "The patient zone and the healthcare area",
      bullets: [
        "The patient zone is the patient plus their immediate surroundings: bed, rails, table, monitor and equipment in use.",
        "The healthcare area is everything outside the patient zone.",
        "Hand hygiene is needed when your hands move between the two.",
        "Organisms from the healthcare area must not reach the patient, and the patient's organisms must not leave the zone.",
      ],
      visual: "Diagram: the patient zone highlighted around a hospital bed",
    },
    {
      title: "The WHO 5 Moments for Hand Hygiene",
      bullets: [
        "1. Before touching a patient.",
        "2. Before a clean or aseptic procedure.",
        "3. After body fluid exposure risk.",
        "4. After touching a patient.",
        "5. After touching patient surroundings.",
      ],
      visual: "WHO 5 Moments poster arranged around a bedside",
      keyPoint: "Moments 1 and 2 protect the patient; moments 3, 4 and 5 protect you and the environment.",
    },
    {
      title: "Moments 1 and 2: before",
      bullets: [
        "Before touching a patient: shaking hands, helping them move, taking a pulse or blood pressure.",
        "Before a clean or aseptic procedure: inserting or accessing a line, wound care, preparing medicines, mouth care.",
        "Moment 2 applies even if you cleaned your hands moments earlier but have since touched something else.",
        "Put gloves on after hand hygiene, immediately before the procedure.",
      ],
      visual: "Photos: hand rub used before a dressing change",
    },
    {
      title: "Moments 3, 4 and 5: after",
      bullets: [
        "After body fluid exposure risk: after taking samples, emptying a catheter bag, or removing gloves.",
        "After touching a patient: at the end of an examination or care activity.",
        "After touching patient surroundings: bed rails, monitors or the bedside table, even if you did not touch the patient.",
        "When moments coincide, a single hand hygiene action covers them.",
      ],
      visual: "Photos: clinician performing hand hygiene after changing bed linen",
    },
    {
      title: "Alcohol-based hand rub",
      bullets: [
        "The preferred method for routine hand hygiene when hands are not visibly soiled.",
        "Faster, more effective against most organisms, and kinder to skin than soap and water.",
        "Apply a palmful and rub all surfaces until dry — about 20 to 30 seconds.",
        "Point-of-care dispensers make compliance easier.",
      ],
      visual: "Photo: point-of-care alcohol hand-rub dispenser at the bedside",
    },
    {
      title: "When to use soap and water",
      bullets: [
        "When hands are visibly dirty or soiled with blood or body fluids.",
        "When caring for patients with known or suspected Clostridioides difficile or norovirus.",
        "After using the toilet.",
        "A full hand wash takes about 40 to 60 seconds.",
      ],
      visual: "Photo: clinical hand-wash sink with elbow-operated taps",
      keyPoint: "Alcohol rub does not reliably kill C. difficile spores — wash with soap and water.",
    },
    {
      title: "The hand-rub technique",
      bullets: [
        "Palm to palm.",
        "Right palm over left dorsum with interlaced fingers, and vice versa.",
        "Palm to palm with fingers interlaced; backs of fingers to opposing palms.",
        "Rotational rubbing of each thumb, then fingertips in the opposite palm.",
      ],
      visual: "WHO step-by-step illustrations of the hand-rub technique",
    },
    {
      title: "Commonly missed areas",
      bullets: [
        "Thumbs, fingertips and the areas between the fingers are most often missed.",
        "The backs of the hands and the wrists are also frequently overlooked.",
        "Follow every step of the technique rather than rubbing quickly.",
        "Ultraviolet-light training boxes show missed areas clearly.",
      ],
      visual: "Heat-map illustration: areas most frequently missed during hand hygiene",
    },
    {
      title: "Bare below the elbows",
      bullets: [
        "Short sleeves or sleeves rolled up when delivering direct patient care.",
        "No wrist watches or bracelets; a plain band ring only, per hospital policy.",
        "Nails short and clean; no artificial nails, extensions or nail varnish.",
        "Cover cuts and abrasions with a waterproof dressing.",
      ],
      visual: "Illustration: compliant versus non-compliant clinical attire",
    },
    {
      title: "Gloves and hand hygiene",
      bullets: [
        "Gloves reduce but do not eliminate contamination of the hands.",
        "Clean hands before putting on gloves and immediately after removing them.",
        "Change gloves between patients and between dirty and clean tasks on the same patient.",
        "Never use hand rub on gloves or wash gloves to re-use them.",
      ],
      visual: "Diagram: glove use within the 5 Moments",
      keyPoint: "Gloves are not a substitute for hand hygiene.",
    },
    {
      title: "Skin care",
      bullets: [
        "Healthy, intact skin is essential — damaged skin harbours more organisms.",
        "Dry hands thoroughly with disposable paper towels after washing.",
        "Use the hospital-approved moisturiser regularly.",
        "Report persistent skin irritation to occupational health.",
      ],
      visual: "Photo: approved hand moisturiser at a staff station",
    },
    {
      title: "Hand hygiene audits",
      bullets: [
        "Trained observers audit compliance against the 5 Moments in each unit.",
        "Results are fed back to units and reported through the IPC committee.",
        "Audits measure opportunities taken against opportunities observed.",
        "Use results to improve — compliance is a team outcome, not only an individual one.",
      ],
      visual: "Sample chart: monthly unit hand hygiene compliance trend",
    },
    {
      title: "Patient and visitor involvement",
      bullets: [
        "Encourage patients and families to clean their hands and to ask staff if they have done so.",
        "Respond positively if a patient reminds you.",
        "Make hand rub available at the entrance to wards and patient rooms.",
        "Lead by example in front of colleagues and visitors.",
      ],
      visual: "Poster: 'It's OK to ask' patient-engagement campaign",
    },
    {
      title: "Summary",
      bullets: [
        "Use the WHO 5 Moments to know when to clean your hands.",
        "Alcohol-based hand rub for routine care; soap and water when soiled or for spore-forming organisms.",
        "Follow the full technique and stay bare below the elbows.",
        "Gloves never replace hand hygiene.",
      ],
      visual: "Summary card: when, how and with what",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "What is the single most effective measure to prevent healthcare-associated infection?", correct: "Hand hygiene", distractors: ["Wearing gloves for all care", "Prescribing prophylactic antibiotics", "Daily patient bathing"] },
    { prompt: "Which is Moment 1 of the WHO 5 Moments?", correct: "Before touching a patient", distractors: ["After touching a patient", "After touching patient surroundings", "After body fluid exposure risk"] },
    { prompt: "Wiping the bed rails of an empty bed space before the patient returns requires hand hygiene:", correct: "After touching patient surroundings", distractors: ["Only if the patient was touched", "Never, as the patient was not present", "Only if gloves were not worn"] },
    { prompt: "Inserting a urinary catheter falls under which moment?", correct: "Before a clean or aseptic procedure", distractors: ["After touching a patient", "After touching patient surroundings", "Before touching a patient only"] },
    { prompt: "Emptying a urinary catheter bag is followed by which moment?", correct: "After body fluid exposure risk", distractors: ["Before touching a patient", "Before a clean or aseptic procedure", "No hand hygiene needed if gloves were worn"] },
    { prompt: "What is the preferred method of hand hygiene when hands are not visibly soiled?", correct: "Alcohol-based hand rub", distractors: ["Soap and water", "Antiseptic wipes", "Putting on gloves"] },
    { prompt: "How long should an alcohol hand rub take?", correct: "About 20 to 30 seconds, until hands are dry", distractors: ["About 5 seconds", "About 2 minutes", "As long as it takes to reach the next patient"] },
    { prompt: "When caring for a patient with C. difficile diarrhoea, you should clean your hands with:", correct: "Soap and water", distractors: ["Alcohol-based hand rub only", "Gloves alone", "An alcohol wipe"] },
    { prompt: "How long should a full soap-and-water hand wash take?", correct: "About 40 to 60 seconds", distractors: ["About 10 seconds", "About 5 minutes", "As long as the water runs hot"] },
    { prompt: "Which areas are most commonly missed during hand hygiene?", correct: "Thumbs, fingertips and between the fingers", distractors: ["The palms", "The centre of the backs of the hands only", "The forearms"] },
    { prompt: "Which of these is compliant with 'bare below the elbows'?", correct: "Short sleeves, short clean nails and no wrist watch", distractors: ["Long sleeves buttoned at the wrist", "Artificial nails with clear varnish", "A wrist watch worn loosely"] },
    { prompt: "Why are artificial nails not permitted in clinical areas?", correct: "They harbour more microorganisms and hinder effective hand hygiene", distractors: ["They are against uniform colour rules only", "They make gloves harder to buy", "They are only a problem in operating theatres"] },
    { prompt: "Which statement about gloves is correct?", correct: "Hand hygiene is required after removing gloves", distractors: ["Gloves can be cleaned with hand rub between patients", "Gloves remove the need for hand hygiene", "One pair of gloves can be used for a whole ward round"] },
    { prompt: "When should gloves be changed during care of a single patient?", correct: "When moving from a dirty task to a clean task", distractors: ["Never during the care of one patient", "Only when they tear", "Only at the end of the shift"] },
    { prompt: "Which defines the patient zone?", correct: "The patient and their immediate surroundings, such as the bed and attached equipment", distractors: ["The whole ward", "The nurses' station", "The corridor outside the room"] },
    { prompt: "Which hand hygiene moments mainly protect the patient?", correct: "Moments 1 and 2", distractors: ["Moments 3 and 4", "Moments 4 and 5", "Moment 5 only"] },
    { prompt: "After washing your hands you should dry them with:", correct: "Disposable paper towels, drying thoroughly", distractors: ["Your uniform", "A shared cloth towel", "Air drying while walking to the patient"] },
    { prompt: "A patient asks whether you have cleaned your hands. The best response is:", correct: "Thank them and clean your hands in front of them", distractors: ["Explain that gloves make it unnecessary", "Ignore the question", "Ask them not to interfere with care"] },
    { prompt: "Hand hygiene compliance audits measure:", correct: "Hand hygiene actions taken against opportunities observed", distractors: ["The amount of hand rub purchased only", "The number of sinks on each ward", "Staff attendance at training only"] },
    { prompt: "Why should staff use the hospital-approved moisturiser?", correct: "Damaged skin carries more organisms and reduces compliance", distractors: ["It replaces the need for hand rub", "It is required only in winter", "It disinfects the hands"] },
  ],
};

export default content;
