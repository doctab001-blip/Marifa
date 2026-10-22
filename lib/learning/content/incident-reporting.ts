import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Why we report incidents",
      bullets: [
        "Incident reports show where systems fail so they can be made safer.",
        "Reporting is a professional duty and a CBAHI expectation.",
        "Organisations that report more often learn more and harm fewer patients.",
        "This module covers what to report, how to report and how to escalate using SBAR.",
      ],
      visual: "Graphic: the learning cycle from report to improvement",
      keyPoint: "A high reporting rate is a sign of a strong safety culture.",
    },
    {
      title: "What is an incident?",
      bullets: [
        "Any unplanned event that caused, or could have caused, harm to a patient, visitor or staff member.",
        "Includes clinical events, falls, medication errors, equipment failures and security issues.",
        "Also includes breaches of confidentiality and violence or aggression.",
        "If you are unsure whether to report, report.",
      ],
      visual: "Icon grid: common categories of incident",
    },
    {
      title: "Types of incident by outcome",
      bullets: [
        "Near miss: the event was caught before it reached the patient.",
        "No-harm incident: it reached the patient but caused no harm.",
        "Adverse event: harm resulted, graded from minor to severe.",
        "Sentinel event: an unexpected event involving death or serious harm.",
      ],
      visual: "Pyramid: near misses, no-harm incidents, adverse events, sentinel events",
    },
    {
      title: "Sentinel events",
      bullets: [
        "Examples: wrong-site surgery, unexpected death, retained foreign object, infant abduction.",
        "Require immediate escalation to senior leadership and the quality department.",
        "Reported to the regulator as required and followed by a root cause analysis.",
        "Preserve equipment, documents and evidence.",
      ],
      visual: "Flowchart: sentinel event escalation pathway",
      keyPoint: "Escalate sentinel events immediately — do not wait for the end of the shift.",
    },
    {
      title: "Immediate actions",
      bullets: [
        "Make the patient and others safe first.",
        "Provide any treatment needed and inform the responsible clinician.",
        "Inform the nurse in charge or your line manager.",
        "Keep equipment or products involved for investigation.",
      ],
      visual: "Checklist card: immediate actions after an incident",
    },
    {
      title: "When to report",
      bullets: [
        "As soon as possible after the incident is safe — ideally within your shift.",
        "Follow the timeframe set by hospital policy.",
        "Report even if someone else may have already reported.",
        "Late reports are better than no report.",
      ],
      visual: "Timeline: incident, safety actions, report submitted",
    },
    {
      title: "Writing a good report",
      bullets: [
        "Stick to facts: what happened, when, where and who was affected.",
        "Avoid opinions, blame and speculation.",
        "Record the actions taken and the outcome for the patient.",
        "Do not record the report itself in the patient's clinical notes; document the clinical facts there.",
      ],
      visual: "Side-by-side: a factual report versus a blaming report",
      keyPoint: "Describe what happened, not who was to blame.",
    },
    {
      title: "Just culture",
      bullets: [
        "Most incidents result from system weaknesses, not individual carelessness.",
        "A just culture supports staff who make honest mistakes.",
        "It distinguishes human error, at-risk behaviour and reckless behaviour.",
        "Accountability remains for reckless or deliberate unsafe acts.",
      ],
      visual: "Diagram: the just-culture decision pathway",
    },
    {
      title: "Being open with patients",
      bullets: [
        "Patients and families should be told when an incident has caused them harm.",
        "Apologise, explain what is known and what will happen next.",
        "Disclosure is led by the senior responsible clinician, as per policy.",
        "Document the conversation.",
      ],
      visual: "Illustration: an open disclosure conversation",
    },
    {
      title: "Investigation and learning",
      bullets: [
        "Incidents are reviewed to understand why they happened.",
        "Root cause analysis looks at systems, processes and human factors.",
        "Actions are agreed, tracked and checked for effectiveness.",
        "Learning is shared with teams through safety briefings and committees.",
      ],
      visual: "Fishbone diagram: contributing factors in a root cause analysis",
    },
    {
      title: "SBAR: structured escalation",
      bullets: [
        "S — Situation: what is happening now.",
        "B — Background: relevant history and context.",
        "A — Assessment: what you think the problem is.",
        "R — Recommendation: what you need and by when.",
      ],
      visual: "SBAR template card",
      keyPoint: "SBAR makes urgent concerns clear and hard to dismiss.",
    },
    {
      title: "SBAR in practice",
      bullets: [
        "Situation: 'I am calling about Mr A in bed 12; his blood pressure has dropped to 82/50.'",
        "Background: 'He is day 1 after bowel surgery and has an epidural.'",
        "Assessment: 'I am concerned he may be bleeding or septic.'",
        "Recommendation: 'Please review him within 15 minutes.'",
      ],
      visual: "Worked example: an SBAR telephone call",
    },
    {
      title: "Speaking up for safety",
      bullets: [
        "Raise concerns about unsafe practice directly, then escalate if needed.",
        "Use clear, assertive language: 'I am concerned… I need you to…'",
        "Stop the line if a patient is at immediate risk.",
        "Retaliation against staff who report in good faith is not tolerated.",
      ],
      visual: "Graphic: the escalation ladder",
    },
    {
      title: "Feedback and closing the loop",
      bullets: [
        "Reporters should receive feedback on the outcome of their report.",
        "Teams review local incident trends regularly.",
        "Changes made after incidents are communicated to staff.",
        "Seeing change encourages more reporting.",
      ],
      visual: "Chart: unit incident themes and the actions taken",
    },
    {
      title: "Summary",
      bullets: [
        "Make the patient safe, then report — including near misses.",
        "Write factual, blame-free reports promptly.",
        "Escalate sentinel events immediately.",
        "Use SBAR to communicate concerns clearly.",
      ],
      visual: "Summary card: report, escalate, learn",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "What is the main purpose of incident reporting?", correct: "To learn from events and make systems safer", distractors: ["To identify staff for punishment", "To meet a monthly quota", "To record staff performance"] },
    { prompt: "An error was noticed and stopped before reaching the patient. This is a:", correct: "Near miss", distractors: ["Sentinel event", "Adverse event with harm", "Complaint"] },
    { prompt: "A wrong medicine reached the patient but caused no harm. This is a:", correct: "No-harm incident", distractors: ["Near miss", "Sentinel event", "Not an incident"] },
    { prompt: "Which is an example of a sentinel event?", correct: "Surgery performed on the wrong site", distractors: ["A delayed meal tray", "A patient complaint about parking", "A minor bruise from a blood test"] },
    { prompt: "After an incident, your first priority is to:", correct: "Make the patient and others safe", distractors: ["Complete the incident report", "Find out who was responsible", "Inform the family"] },
    { prompt: "When should an incident be reported?", correct: "As soon as possible after it is safe, ideally within the shift", distractors: ["At the end of the month", "Only if the patient complains", "Only after the investigation"] },
    { prompt: "Should you report an incident if a colleague may already have reported it?", correct: "Yes, report what you know", distractors: ["No, one report is enough", "Only if you were directly involved", "Only if asked by a manager"] },
    { prompt: "A good incident report should be:", correct: "Factual, objective and free of blame", distractors: ["Detailed about who is at fault", "Based on assumptions about causes", "Written only after discussion with all staff"] },
    { prompt: "What should happen to equipment involved in an incident?", correct: "Keep it for investigation", distractors: ["Return it to stock", "Throw it away", "Repair it yourself"] },
    { prompt: "A just culture means:", correct: "Supporting honest mistakes while holding reckless behaviour to account", distractors: ["No one is ever held accountable", "Every error leads to disciplinary action", "Only managers can report incidents"] },
    { prompt: "Root cause analysis focuses on:", correct: "Systems, processes and contributing factors", distractors: ["Identifying one person to blame", "The financial cost only", "The patient's behaviour only"] },
    { prompt: "When harm has occurred, patients and families should:", correct: "Be told openly, with an apology and an explanation", distractors: ["Not be told unless they ask", "Be told only by the reporter", "Be told only after legal review months later"] },
    { prompt: "What does the 'S' in SBAR stand for?", correct: "Situation", distractors: ["Summary", "Safety", "Symptoms"] },
    { prompt: "What does the 'B' in SBAR stand for?", correct: "Background", distractors: ["Blood pressure", "Baseline", "Behaviour"] },
    { prompt: "What does the 'A' in SBAR stand for?", correct: "Assessment", distractors: ["Action", "Allergies", "Admission"] },
    { prompt: "What does the 'R' in SBAR stand for?", correct: "Recommendation", distractors: ["Result", "Review", "Report"] },
    { prompt: "'Please review him within 15 minutes' belongs to which part of SBAR?", correct: "Recommendation", distractors: ["Situation", "Background", "Assessment"] },
    { prompt: "Who should receive feedback after an incident report?", correct: "The reporter and the team involved", distractors: ["No one", "Only senior management", "Only the patient"] },
    { prompt: "A sentinel event occurs during the night shift. You should:", correct: "Escalate immediately to senior leadership as per policy", distractors: ["Wait for the morning meeting", "Report it at the end of the week", "Discuss it only with the patient"] },
    { prompt: "Staff who report incidents in good faith should:", correct: "Be protected from retaliation", distractors: ["Be investigated first", "Expect disciplinary action", "Remain anonymous only if they are senior"] },
  ],
};

export default content;
