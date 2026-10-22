import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Fire safety in a hospital",
      bullets: [
        "Hospitals hold many people who cannot evacuate themselves.",
        "Oxygen, flammable liquids and electrical equipment increase fire risk.",
        "Every member of staff has a role in prevention and in the response.",
        "This module covers prevention, RACE, PASS and evacuation.",
      ],
      visual: "Photo: ward corridor with fire doors, call point and extinguisher",
      keyPoint: "Smoke, not flames, causes most fire deaths.",
    },
    {
      title: "The fire triangle",
      bullets: [
        "Fire needs three elements: heat, fuel and oxygen.",
        "Remove any one element and the fire goes out.",
        "Fuel: linen, paper, alcohol-based products, furniture.",
        "Heat: electrical faults, heaters, surgical diathermy and lasers.",
      ],
      visual: "Diagram: the fire triangle with hospital examples on each side",
    },
    {
      title: "Preventing fires",
      bullets: [
        "Report damaged plugs, cables and equipment; never overload sockets.",
        "Keep corridors, exits and fire doors clear of beds, trolleys and stored items.",
        "Smoking is not permitted on hospital premises.",
        "Store flammable liquids in approved cabinets and keep combustible waste to a minimum.",
      ],
      visual: "Photos: blocked versus clear fire exit",
    },
    {
      title: "Oxygen-enriched environments",
      bullets: [
        "Oxygen makes materials ignite more easily and burn faster and hotter.",
        "Keep oxygen away from heat sources and naked flames; turn it off when not in use.",
        "Allow alcohol-based skin preparations to dry fully before diathermy or laser use.",
        "Secure oxygen cylinders upright in approved holders.",
      ],
      visual: "Photo: oxygen cylinder correctly secured in a trolley holder",
    },
    {
      title: "Know your area",
      bullets: [
        "Locate the fire alarm call points, extinguishers and fire blankets in your area.",
        "Know your exits, assembly points and the fire compartments of your ward.",
        "Know where the medical gas zone valves are and who may close them.",
        "Know the internal emergency number and how to announce Code Red.",
      ],
      visual: "Floor-plan template: marking call points, extinguishers and exits",
    },
    {
      title: "RACE: the fire response",
      bullets: [
        "R — Rescue anyone in immediate danger.",
        "A — Alarm: activate the nearest call point and call the emergency number (Code Red).",
        "C — Contain: close doors and windows to limit smoke and fire spread.",
        "E — Extinguish if small and safe, or Evacuate.",
      ],
      visual: "RACE poster",
      keyPoint: "Raise the alarm early — even for a small fire.",
    },
    {
      title: "Containment and fire doors",
      bullets: [
        "Fire doors hold back smoke and fire, creating safe compartments.",
        "Never wedge or prop fire doors open.",
        "Close patient room doors after checking the room is clear.",
        "Check doors for heat with the back of your hand before opening them.",
      ],
      visual: "Diagram: smoke compartments separated by fire doors on a ward",
    },
    {
      title: "Should you fight the fire?",
      bullets: [
        "Only if the alarm has been raised, the fire is small, and you are trained.",
        "Make sure you have a clear escape route behind you.",
        "Use the correct extinguisher for the type of fire.",
        "If in doubt, get out: close the door and evacuate.",
      ],
      visual: "Decision flowchart: fight or evacuate",
    },
    {
      title: "PASS: using an extinguisher",
      bullets: [
        "P — Pull the pin.",
        "A — Aim at the base of the fire.",
        "S — Squeeze the handle.",
        "S — Sweep from side to side.",
      ],
      visual: "Step illustrations of PASS",
      keyPoint: "Stand back about 2 to 3 metres and aim at the base, not the flames.",
    },
    {
      title: "Classes of fire and extinguishers",
      bullets: [
        "Class A — ordinary combustibles (paper, wood, linen): water or multipurpose dry powder.",
        "Class B — flammable liquids: CO2 or dry powder.",
        "Class C — energised electrical equipment: CO2 or dry powder; never water.",
        "Class K — cooking oils: wet chemical extinguisher or fire blanket.",
      ],
      visual: "Chart: extinguisher types matched to fire classes",
    },
    {
      title: "Medical gases during a fire",
      bullets: [
        "Closing a zone valve stops oxygen to every outlet in that zone.",
        "Valves are closed only by authorised staff on instruction, after patients have alternative oxygen.",
        "Prepare portable cylinders for oxygen-dependent patients.",
        "Report the valve closure to the fire response team.",
      ],
      visual: "Photo: medical gas zone valve box with labels",
    },
    {
      title: "Progressive evacuation",
      bullets: [
        "Horizontal first: move patients through fire doors to the next safe compartment on the same floor.",
        "Vertical next: move to a lower floor using the stairs if the floor is unsafe.",
        "Full building evacuation is the last resort.",
        "Do not use lifts unless directed by the fire service.",
      ],
      visual: "Diagram: horizontal then vertical evacuation routes",
    },
    {
      title: "Moving patients safely",
      bullets: [
        "Move those in immediate danger first.",
        "Use evacuation aids such as ski sheets and evacuation chairs if trained.",
        "Take patient records and essential medicines if it is safe to do so.",
        "Account for every patient, visitor and staff member at the assembly point.",
      ],
      visual: "Photo: evacuation sheet in use on a stairwell",
    },
    {
      title: "Smoke and personal safety",
      bullets: [
        "Smoke is toxic and spreads quickly; stay low where the air is cleaner.",
        "Never go back into a burning area for belongings.",
        "If your clothing catches fire: stop, drop and roll.",
        "Attend fire drills so the response becomes automatic.",
      ],
      visual: "Illustration: staying low beneath a smoke layer",
    },
    {
      title: "Summary",
      bullets: [
        "Prevent fires: safe electrics, clear exits, careful oxygen use.",
        "Respond with RACE: Rescue, Alarm, Contain, Extinguish or Evacuate.",
        "Use an extinguisher with PASS only if the fire is small and you are trained.",
        "Evacuate progressively: horizontal, then vertical, then the whole building.",
      ],
      visual: "Summary card: RACE and PASS",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "What are the three elements of the fire triangle?", correct: "Heat, fuel and oxygen", distractors: ["Heat, smoke and fuel", "Oxygen, water and fuel", "Smoke, flame and heat"] },
    { prompt: "What does the 'R' in RACE stand for?", correct: "Rescue anyone in immediate danger", distractors: ["Report to your manager", "Run to the exit", "Reset the alarm"] },
    { prompt: "What does the 'A' in RACE stand for?", correct: "Alarm: activate the call point and call the emergency number", distractors: ["Assess the size of the fire for 5 minutes", "Avoid the area", "Aim the extinguisher"] },
    { prompt: "What does 'Contain' mean in RACE?", correct: "Close doors and windows to limit fire and smoke spread", distractors: ["Put the fire out", "Move all patients to one room", "Collect all equipment from the area"] },
    { prompt: "What is the internal emergency code commonly used for fire?", correct: "Code Red", distractors: ["Code Blue", "Code Pink", "Code Black"] },
    { prompt: "What does PASS stand for?", correct: "Pull, Aim, Squeeze, Sweep", distractors: ["Push, Aim, Spray, Stop", "Pull, Alarm, Spray, Stand", "Point, Aim, Shoot, Sweep"] },
    { prompt: "Where should an extinguisher be aimed?", correct: "At the base of the fire", distractors: ["At the top of the flames", "At the smoke", "At the ceiling above the fire"] },
    { prompt: "Which extinguisher should never be used on energised electrical equipment?", correct: "Water", distractors: ["CO2", "Dry powder", "A multipurpose ABC extinguisher"] },
    { prompt: "Which is suitable for a fire in a computer or electrical panel?", correct: "CO2 extinguisher", distractors: ["Water extinguisher", "Wet chemical extinguisher", "A wet towel"] },
    { prompt: "A cooking-oil fire in the kitchen is best tackled with:", correct: "A wet chemical extinguisher or fire blanket", distractors: ["A water extinguisher", "Pouring water from a jug", "Opening the windows"] },
    { prompt: "You should only attempt to fight a fire if:", correct: "The alarm is raised, the fire is small, you are trained and have an escape route", distractors: ["You are the most senior person present", "The fire service has not arrived within 1 minute", "Patients are watching"] },
    { prompt: "Fire doors on a ward should be:", correct: "Kept closed or on approved automatic releases, never wedged open", distractors: ["Wedged open to help movement of beds", "Locked at night", "Removed if they slow down care"] },
    { prompt: "Before opening a closed door during a fire you should:", correct: "Check it for heat with the back of your hand", distractors: ["Open it quickly to look", "Kick it open", "Pour water under it"] },
    { prompt: "What is the first stage of progressive evacuation?", correct: "Horizontal evacuation to the next fire compartment on the same floor", distractors: ["Full building evacuation", "Moving everyone to the roof", "Vertical evacuation using lifts"] },
    { prompt: "During a fire, lifts should:", correct: "Not be used unless directed by the fire service", distractors: ["Be used for all patients", "Be used for staff only", "Be used for bed-bound patients first"] },
    { prompt: "Who may close a medical gas zone valve during a fire?", correct: "Authorised staff on instruction, after patients have alternative oxygen", distractors: ["Any visitor near the valve", "Anyone, as soon as the alarm sounds", "Only the patient's family"] },
    { prompt: "Why are oxygen-enriched environments dangerous?", correct: "Materials ignite more easily and burn faster and hotter", distractors: ["Oxygen puts fires out", "Oxygen only affects electrical fires", "They are not dangerous"] },
    { prompt: "Before using diathermy after an alcohol-based skin preparation, you should:", correct: "Allow the preparation to dry completely", distractors: ["Apply more preparation", "Cover it with a wet drape immediately", "Turn up the oxygen flow"] },
    { prompt: "Most deaths in fires are caused by:", correct: "Smoke inhalation", distractors: ["Direct burns", "Falling debris", "Water damage"] },
    { prompt: "When moving through smoke, you should:", correct: "Stay low where the air is cleaner", distractors: ["Stand upright and run", "Hold your breath and walk slowly", "Open every door you pass"] },
  ],
};

export default content;
