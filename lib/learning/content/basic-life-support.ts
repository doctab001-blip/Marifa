import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Basic Life Support: why it matters",
      bullets: [
        "Survival from cardiac arrest depends on early recognition, early CPR and early defibrillation.",
        "Every minute without CPR and defibrillation reduces the chance of survival.",
        "All clinical staff must be able to start high-quality CPR without delay.",
        "This module reviews adult BLS; practical skills are signed off separately on a manikin.",
      ],
      visual: "Diagram: the chain of survival for in-hospital cardiac arrest",
      keyPoint: "Theory supports — but does not replace — your hands-on skills assessment.",
    },
    {
      title: "Scene safety and responsiveness",
      bullets: [
        "Check the area is safe for you and the patient.",
        "Tap the shoulders and shout to check for a response.",
        "If there is no response, shout for help immediately.",
        "In hospital, activate the emergency team (Code Blue) using the internal emergency number.",
      ],
      visual: "Illustration: rescuer checking responsiveness and calling for help",
    },
    {
      title: "Check breathing and pulse",
      bullets: [
        "Look for normal breathing and, if trained, check the carotid pulse at the same time.",
        "Take no more than 10 seconds.",
        "Gasping (agonal breathing) is not normal breathing — treat it as cardiac arrest.",
        "If in doubt, start CPR.",
      ],
      visual: "Photo: simultaneous breathing and carotid pulse check",
      keyPoint: "No normal breathing and no definite pulse within 10 seconds: start compressions.",
    },
    {
      title: "High-quality chest compressions",
      bullets: [
        "Hands on the centre of the chest, on the lower half of the breastbone.",
        "Rate of 100 to 120 compressions per minute.",
        "Depth of at least 5 cm but not more than 6 cm in an adult.",
        "Allow full chest recoil after each compression and do not lean on the chest.",
      ],
      visual: "Diagram: hand position, depth and recoil during adult compressions",
    },
    {
      title: "Minimise interruptions",
      bullets: [
        "Pauses in compressions reduce blood flow to the heart and brain.",
        "Keep pauses to less than 10 seconds, including for breaths and rhythm checks.",
        "Swap the person doing compressions about every 2 minutes to avoid fatigue.",
        "Plan the swap ahead and change over quickly.",
      ],
      visual: "Chart: coronary perfusion pressure falling during interruptions",
    },
    {
      title: "Ventilation",
      bullets: [
        "Without an advanced airway: 30 compressions to 2 breaths.",
        "Open the airway with head tilt–chin lift (jaw thrust if spinal injury is suspected).",
        "Give each breath over about 1 second, just enough to make the chest rise.",
        "Avoid excessive ventilation — it reduces blood return to the heart.",
      ],
      visual: "Photo: two-person bag-mask ventilation with head tilt–chin lift",
    },
    {
      title: "Bag-mask ventilation in hospital",
      bullets: [
        "Use a bag-valve-mask connected to high-flow oxygen as soon as available.",
        "A two-person technique gives a better mask seal.",
        "Use an airway adjunct if trained and indicated.",
        "Once an advanced airway is placed: continuous compressions with 1 breath every 6 seconds.",
      ],
      visual: "Photo: bag-valve-mask with oropharyngeal airway",
    },
    {
      title: "Early defibrillation with an AED",
      bullets: [
        "Use the AED or defibrillator as soon as it arrives.",
        "Switch it on and follow the voice prompts.",
        "Continue compressions while the pads are applied.",
        "Shockable rhythms (VF and pulseless VT) need a shock as early as possible.",
      ],
      visual: "Photo: AED opened next to a patient with pads ready",
      keyPoint: "Do not wait to finish a cycle of CPR before applying pads.",
    },
    {
      title: "Pad placement and shock safety",
      bullets: [
        "One pad below the right collarbone; the other on the left side of the chest, below the armpit.",
        "Remove medication patches and dry the chest if wet.",
        "Make sure nobody is touching the patient: 'Stand clear' before the shock.",
        "Resume compressions immediately after the shock — do not stop to check the pulse.",
      ],
      visual: "Diagram: anterolateral AED pad placement",
    },
    {
      title: "Team roles at a cardiac arrest",
      bullets: [
        "A team leader coordinates and assigns roles.",
        "Roles include compressions, airway, defibrillator, medicines and recording.",
        "Use closed-loop communication: repeat back instructions.",
        "Record times of arrest, shocks and medicines accurately.",
      ],
      visual: "Diagram: positions of team members around the bed",
    },
    {
      title: "Special circumstances",
      bullets: [
        "Suspected opioid overdose: follow the protocol for naloxone while maintaining CPR.",
        "Pregnancy (visible uterus): manual left uterine displacement during CPR.",
        "Drowning and hypoxic arrests: oxygenation and ventilation are especially important.",
        "Follow your hospital's resuscitation status documentation.",
      ],
      visual: "Photo: manual left uterine displacement during CPR",
    },
    {
      title: "The choking adult",
      bullets: [
        "Mild obstruction (can cough and speak): encourage coughing and stay with them.",
        "Severe obstruction (cannot speak, breathe or cough): give back blows and abdominal thrusts per current guidelines.",
        "Use chest thrusts instead of abdominal thrusts for pregnant or very obese patients.",
        "If they become unresponsive: call for help and start CPR.",
      ],
      visual: "Illustration: abdominal thrusts on a standing adult",
    },
    {
      title: "Recovery position and post-arrest care",
      bullets: [
        "If the patient breathes normally but is unresponsive, maintain the airway and monitor closely.",
        "Use the recovery position if there is no suspected spinal injury.",
        "After return of spontaneous circulation, prepare for transfer to critical care.",
        "Reassess breathing continuously.",
      ],
      visual: "Illustration: the recovery position",
    },
    {
      title: "Equipment checks and documentation",
      bullets: [
        "Resuscitation trolleys and defibrillators are checked at the frequency set by hospital policy.",
        "Report missing or faulty equipment immediately.",
        "Document the event and participate in the debrief.",
        "Report incidents related to resuscitation through the incident system.",
      ],
      visual: "Photo: resuscitation trolley with sealed drawers and check log",
    },
    {
      title: "Summary",
      bullets: [
        "Recognise arrest: no response and no normal breathing — shout for help and call the emergency team.",
        "Compressions: centre of chest, 100–120 per minute, 5–6 cm deep, full recoil.",
        "30:2 without an advanced airway; minimise pauses to under 10 seconds.",
        "Apply the AED as soon as possible and resume CPR straight after each shock.",
      ],
      visual: "Summary card: the adult BLS algorithm",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "An adult collapses in the corridor. What do you do first?", correct: "Check the scene is safe, then check for a response", distractors: ["Start rescue breaths immediately", "Run to find a doctor", "Check blood glucose"] },
    { prompt: "How long should the breathing and pulse check take?", correct: "No more than 10 seconds", distractors: ["About 30 seconds", "One full minute", "As long as needed to be certain"] },
    { prompt: "A patient is unresponsive with occasional gasping breaths. You should:", correct: "Treat it as cardiac arrest and start CPR", distractors: ["Place them in the recovery position and observe", "Wait for the gasping to stop", "Give oxygen and recheck in 5 minutes"] },
    { prompt: "What is the recommended compression rate for adults?", correct: "100 to 120 per minute", distractors: ["60 to 80 per minute", "80 to 100 per minute", "140 to 160 per minute"] },
    { prompt: "What is the recommended compression depth for an adult?", correct: "At least 5 cm but no more than 6 cm", distractors: ["2 to 3 cm", "About 4 cm", "At least 8 cm"] },
    { prompt: "Where should your hands be placed for adult compressions?", correct: "Centre of the chest, on the lower half of the breastbone", distractors: ["Upper third of the breastbone", "Over the left side of the chest", "Over the upper abdomen"] },
    { prompt: "Why is full chest recoil important?", correct: "It allows the heart to refill between compressions", distractors: ["It rests the rescuer's arms", "It prevents rib fractures entirely", "It is only important in children"] },
    { prompt: "What is the compression-to-ventilation ratio for adults without an advanced airway?", correct: "30:2", distractors: ["15:2", "5:1", "15:1"] },
    { prompt: "How long should each rescue breath last?", correct: "About 1 second, enough to make the chest rise", distractors: ["About 3 seconds", "As long and forceful as possible", "Half a second with maximum pressure"] },
    { prompt: "Once an advanced airway is in place, ventilation should be:", correct: "1 breath every 6 seconds with continuous compressions", distractors: ["2 breaths after every 30 compressions", "1 breath every 2 seconds", "Stopped completely"] },
    { prompt: "Pauses in chest compressions should be kept to:", correct: "Less than 10 seconds", distractors: ["Less than 30 seconds", "About 1 minute", "Any length during rhythm checks"] },
    { prompt: "How often should the person doing compressions be swapped?", correct: "About every 2 minutes", distractors: ["Every 10 minutes", "Only when they feel tired", "Never during the same arrest"] },
    { prompt: "When should the AED be used?", correct: "As soon as it arrives", distractors: ["After 10 minutes of CPR", "Only after the doctor arrives", "Only if the patient has a pulse"] },
    { prompt: "Which rhythms are shockable?", correct: "Ventricular fibrillation and pulseless ventricular tachycardia", distractors: ["Asystole and pulseless electrical activity", "Sinus rhythm", "Atrial fibrillation with a pulse"] },
    { prompt: "What should you do immediately after the AED delivers a shock?", correct: "Resume chest compressions straight away", distractors: ["Check the pulse for 30 seconds", "Remove the pads", "Wait for the AED to reanalyse"] },
    { prompt: "Where is the second AED pad placed in the standard anterolateral position?", correct: "Left side of the chest, below the armpit", distractors: ["Over the centre of the breastbone", "On the right upper arm", "On the abdomen"] },
    { prompt: "Excessive ventilation during CPR is harmful because it:", correct: "Reduces blood return to the heart", distractors: ["Improves oxygen delivery too much", "Speeds up the AED analysis", "Has no effect"] },
    { prompt: "A conscious adult cannot speak, cough or breathe after choking. What do you do?", correct: "Give back blows and abdominal thrusts per current guidelines", distractors: ["Encourage them to keep coughing and wait", "Start chest compressions while they are conscious", "Give them water to drink"] },
    { prompt: "A choking adult becomes unresponsive. What next?", correct: "Call for help and start CPR", distractors: ["Continue abdominal thrusts while they are lying down", "Place them in the recovery position", "Wait for them to regain consciousness"] },
    { prompt: "During CPR on a woman in late pregnancy, you should:", correct: "Perform manual left uterine displacement", distractors: ["Stop compressions to reposition her every minute", "Compress more slowly", "Avoid using the AED"] },
  ],
};

export default content;
