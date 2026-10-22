import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Why infection prevention matters",
      bullets: [
        "Healthcare-associated infections (HAIs) prolong stays, increase antimicrobial resistance and cost lives.",
        "Most HAIs are preventable with consistent, everyday practice by every member of staff.",
        "CBAHI accreditation requires an active hospital-wide infection prevention and control programme.",
        "By the end of this module you will apply standard and transmission-based precautions safely.",
      ],
      visual: "Infographic: common HAIs — CLABSI, CAUTI, VAP and surgical site infection",
      keyPoint: "Infection prevention is every staff member's responsibility, not only the IPC team's.",
    },
    {
      title: "The chain of infection",
      bullets: [
        "Six links: infectious agent, reservoir, portal of exit, mode of transmission, portal of entry, susceptible host.",
        "Breaking any single link stops transmission.",
        "Hand hygiene and cleaning break the mode of transmission; vaccination protects the susceptible host.",
        "Invasive devices such as lines and catheters create new portals of entry.",
      ],
      visual: "Diagram: the six-link chain of infection as a circular chain",
    },
    {
      title: "Standard precautions",
      bullets: [
        "Apply to every patient, every time, whether or not infection is known or suspected.",
        "Hand hygiene, PPE based on risk, respiratory hygiene and cough etiquette.",
        "Safe injection practice, sharps safety and safe handling of linen and waste.",
        "Environmental cleaning, decontamination of equipment and appropriate patient placement.",
      ],
      visual: "Checklist graphic: the elements of standard precautions",
      keyPoint: "Treat all blood and body fluids as potentially infectious.",
    },
    {
      title: "Personal protective equipment: choosing by risk",
      bullets: [
        "Select PPE according to the task and the expected exposure, not the diagnosis alone.",
        "Gloves for contact with blood, body fluids, mucous membranes or non-intact skin.",
        "Gown or apron when clothing may be contaminated; eye protection where splashes or sprays are likely.",
        "Gloves never replace hand hygiene: clean hands before putting on and after removing them.",
      ],
      visual: "Matrix: clinical tasks matched to the PPE they require",
    },
    {
      title: "Putting PPE on (donning)",
      bullets: [
        "Perform hand hygiene first.",
        "Gown, then mask or respirator, then goggles or face shield, then gloves.",
        "Gloves are pulled over the gown cuffs.",
        "Fit-check an N95 respirator every time it is put on.",
      ],
      visual: "Step sequence photos: donning gown, respirator, eye protection and gloves",
    },
    {
      title: "Taking PPE off (doffing)",
      bullets: [
        "Doffing is the highest-risk moment for self-contamination — go slowly.",
        "Remove gloves first, then eye protection, then gown, then mask or respirator.",
        "Handle only the clean parts (ties, ear loops, inside surfaces).",
        "Perform hand hygiene immediately after removing all PPE, and whenever hands become contaminated.",
      ],
      visual: "Step sequence photos: safe removal of PPE with hand hygiene at the end",
      keyPoint: "The front of the mask and gown are contaminated — never touch them.",
    },
    {
      title: "Transmission-based precautions: contact",
      bullets: [
        "Used in addition to standard precautions for organisms spread by direct or indirect contact.",
        "Examples: MRSA, VRE, carbapenem-resistant organisms, Clostridioides difficile, scabies.",
        "Gown and gloves on entering the room; dedicated or single-use equipment where possible.",
        "Single room or cohorting as directed by the IPC team; signage on the door.",
      ],
      visual: "Door signage example: contact precautions",
    },
    {
      title: "Transmission-based precautions: droplet",
      bullets: [
        "For organisms spread by large respiratory droplets over short distances.",
        "Examples: influenza, pertussis, invasive meningococcal disease, mumps.",
        "Surgical mask when working close to the patient; single room where possible.",
        "Patient wears a surgical mask when transported outside the room.",
      ],
      visual: "Diagram: droplet spread distance from a coughing patient",
    },
    {
      title: "Transmission-based precautions: airborne",
      bullets: [
        "For organisms carried on small particles that remain suspended in air.",
        "Examples: pulmonary tuberculosis, measles, chickenpox (varicella).",
        "Airborne infection isolation room (negative pressure) with the door kept closed.",
        "Fit-tested N95 (or higher) respirator for all staff entering the room.",
      ],
      visual: "Floor plan: negative-pressure isolation room with anteroom",
      keyPoint: "A surgical mask does not protect the wearer against airborne organisms.",
    },
    {
      title: "Respiratory pathogens of concern: MERS-CoV",
      bullets: [
        "MERS-CoV remains a priority pathogen in Saudi Arabia.",
        "Screen patients with acute respiratory illness at triage using the current MOH case definition.",
        "Isolate suspected cases promptly and notify the IPC team.",
        "Follow current MOH guidance on precautions, including respirators for aerosol-generating procedures.",
      ],
      visual: "Flowchart: respiratory triage, isolation and notification pathway",
    },
    {
      title: "Sharps safety",
      bullets: [
        "Never re-sheath or recap a used needle by hand.",
        "Dispose of sharps at the point of use, by the person who used them.",
        "Close sharps containers when they reach the fill line (about three-quarters full).",
        "Use safety-engineered devices where they are available.",
      ],
      visual: "Photo: correctly assembled sharps container with the fill line marked",
    },
    {
      title: "If you have a sharps or splash injury",
      bullets: [
        "Wash the wound with soap and running water; do not scrub or suck it.",
        "Rinse splashes to the eyes, nose or mouth with plenty of water.",
        "Report immediately to your supervisor and occupational health — post-exposure treatment is time-critical.",
        "Complete an incident report and follow up for testing as advised.",
      ],
      visual: "First-aid card: immediate steps after a needlestick injury",
      keyPoint: "Report straight away: HIV post-exposure prophylaxis works best when started within hours.",
    },
    {
      title: "Environmental cleaning and equipment",
      bullets: [
        "Clean shared equipment between every patient with an approved product.",
        "Follow the contact time on the disinfectant label for it to work.",
        "Terminal cleaning after discharge or transfer of patients on precautions.",
        "Manage blood and body fluid spills promptly with the approved spill kit.",
      ],
      visual: "Photo series: cleaning a patient monitor and bed rails between patients",
    },
    {
      title: "Healthcare waste and linen",
      bullets: [
        "Segregate waste at the point of generation into the correct colour-coded stream.",
        "Infectious waste must never go into general waste.",
        "Place soiled linen in the designated bags without shaking it or holding it against your uniform.",
        "Do not overfill bags; seal and label them according to hospital policy.",
      ],
      visual: "Chart: hospital waste streams and their colour-coded containers",
    },
    {
      title: "Summary and your responsibilities",
      bullets: [
        "Apply standard precautions to every patient, every time.",
        "Add contact, droplet or airborne precautions according to the route of transmission.",
        "Don and doff PPE in the correct order and perform hand hygiene throughout.",
        "Report exposures, outbreaks and breaches promptly — speaking up protects patients and colleagues.",
      ],
      visual: "Summary card: the key IPC behaviours on one page",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "Standard precautions should be applied to:", correct: "Every patient, regardless of known or suspected infection", distractors: ["Only patients with a confirmed infection", "Only patients in isolation rooms", "Only patients undergoing invasive procedures"] },
    { prompt: "Which link in the chain of infection does hand hygiene mainly break?", correct: "Mode of transmission", distractors: ["Infectious agent", "Susceptible host", "Reservoir"] },
    { prompt: "What is the correct order for putting on PPE?", correct: "Gown, mask or respirator, eye protection, gloves", distractors: ["Gloves, gown, mask, eye protection", "Mask, gloves, gown, eye protection", "Eye protection, gloves, mask, gown"] },
    { prompt: "When removing PPE, which item is usually taken off first?", correct: "Gloves", distractors: ["Mask or respirator", "Eye protection", "Gown"] },
    { prompt: "Which statement about gloves is correct?", correct: "Hand hygiene is still needed before putting on and after removing gloves", distractors: ["Gloves replace the need for hand hygiene", "The same gloves can be used between two patients if they look clean", "Gloves are required for all patient contact, including taking a pulse on intact skin"] },
    { prompt: "A patient has confirmed pulmonary tuberculosis. Which precautions are needed?", correct: "Airborne precautions with a negative-pressure room and N95 respirator", distractors: ["Contact precautions with gown and gloves only", "Droplet precautions with a surgical mask", "Standard precautions only"] },
    { prompt: "Which organism requires contact precautions?", correct: "Clostridioides difficile", distractors: ["Measles", "Influenza", "Pulmonary tuberculosis"] },
    { prompt: "Influenza is primarily managed with which transmission-based precautions?", correct: "Droplet precautions", distractors: ["Airborne precautions only", "Contact precautions only", "No precautions beyond hand hygiene"] },
    { prompt: "Why is a surgical mask not enough when entering an airborne isolation room?", correct: "It does not filter small airborne particles or seal to the face", distractors: ["It is too expensive to use", "It blocks the patient's view of staff", "It is only for use by patients"] },
    { prompt: "What should you do with a used needle?", correct: "Dispose of it immediately in a sharps container at the point of use", distractors: ["Recap it carefully with two hands before disposal", "Place it on the tray to dispose of later", "Bend it to prevent re-use, then discard it"] },
    { prompt: "When should a sharps container be closed and replaced?", correct: "When it reaches the fill line, about three-quarters full", distractors: ["Only when it is completely full", "At the end of every week regardless of level", "When the lid no longer closes"] },
    { prompt: "Immediately after a needlestick injury you should:", correct: "Wash with soap and running water and report it immediately", distractors: ["Scrub the wound with a brush and alcohol", "Finish your shift and report it the next day", "Suck the wound to remove contamination"] },
    { prompt: "Why must sharps and splash exposures be reported straight away?", correct: "Post-exposure prophylaxis is most effective when started early", distractors: ["So the staff member can be disciplined", "Reporting is only needed for statistical purposes", "To arrange replacement of the sharps container"] },
    { prompt: "For a disinfectant wipe to work effectively, you must:", correct: "Leave the surface wet for the contact time on the label", distractors: ["Wipe the surface dry immediately", "Dilute it with water first", "Use it only on visibly dirty surfaces"] },
    { prompt: "Shared patient equipment such as a blood pressure cuff should be cleaned:", correct: "Between every patient", distractors: ["Once a day", "Only when visibly soiled", "Only after use on isolated patients"] },
    { prompt: "Where should clinical waste be segregated?", correct: "At the point where it is generated", distractors: ["At the central waste store", "By the housekeeping team at the end of the day", "It does not need to be segregated"] },
    { prompt: "How should soiled linen be handled?", correct: "Place it directly in the designated bag without shaking it", distractors: ["Shake it out to remove debris before bagging", "Carry it against your uniform to the sluice", "Leave it on the floor for collection"] },
    { prompt: "A patient with acute respiratory symptoms presents at triage. What is the first priority?", correct: "Screen against the MOH case definition and isolate promptly if suspected", distractors: ["Send the patient to the general waiting area", "Wait for laboratory results before any precautions", "Discharge with advice to return if symptoms worsen"] },
    { prompt: "Which of these is an example of a portal of entry created by healthcare?", correct: "A central venous catheter", distractors: ["A patient's intact skin", "A hand-rub dispenser", "A closed sharps container"] },
    { prompt: "During PPE removal, which part of the mask should you touch?", correct: "Only the ties or ear loops", distractors: ["The front of the mask", "Any part, as long as you are wearing gloves", "The inside surface first"] },
  ],
};

export default content;
