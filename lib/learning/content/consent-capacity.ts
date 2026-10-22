import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Consent: a process, not a form",
      bullets: [
        "Consent respects the patient's right to decide what happens to their body.",
        "Valid consent is a conversation; the signed form is only the record of it.",
        "Treating without valid consent can be unlawful and is a breach of professional standards.",
        "This module covers valid consent, capacity and documentation.",
      ],
      visual: "Illustration: clinician and patient in a shared decision-making conversation",
      keyPoint: "A signature without understanding is not valid consent.",
    },
    {
      title: "The legal and policy framework",
      bullets: [
        "Saudi law requires consent from the patient, or their legal representative if they lack capacity, before treatment.",
        "Emergencies that threaten life or limb are a recognised exception.",
        "CBAHI standards require informed consent processes and documentation.",
        "Your hospital consent policy sets out the local rules — know where to find it.",
      ],
      visual: "Graphic: the consent framework — law, CBAHI standards and hospital policy",
    },
    {
      title: "The three elements of valid consent",
      bullets: [
        "Informed: the patient has the information they need.",
        "Voluntary: given freely, without pressure or coercion.",
        "Capacity: the patient can make this particular decision.",
        "If any element is missing, consent is not valid.",
      ],
      visual: "Diagram: three overlapping circles — informed, voluntary, capacity",
    },
    {
      title: "What information must be shared",
      bullets: [
        "The diagnosis and the nature and purpose of the proposed treatment.",
        "The expected benefits and the significant or material risks.",
        "Reasonable alternatives, including no treatment.",
        "Who will perform it, and what to expect afterwards.",
      ],
      visual: "Checklist: the information discussed during consent",
    },
    {
      title: "Material risks",
      bullets: [
        "Share risks a reasonable person in the patient's position would consider significant.",
        "Also share risks this particular patient would find important.",
        "Include serious risks even if they are rare.",
        "Answer questions honestly and check understanding.",
      ],
      visual: "Illustration: explaining risks with a visual aid",
    },
    {
      title: "Checking understanding",
      bullets: [
        "Use plain language and avoid jargon.",
        "Use the teach-back method: ask the patient to explain in their own words.",
        "Use a professional interpreter when needed rather than relying on family members.",
        "Give written information where available.",
      ],
      visual: "Photo: teach-back conversation with an interpreter present",
      keyPoint: "Ask the patient to explain it back — then you know they understood.",
    },
    {
      title: "Voluntariness",
      bullets: [
        "Patients must be free to decide without pressure from staff or family.",
        "Allow time to think, wherever the clinical situation permits.",
        "Do not seek consent when the patient is sedated, in pain or on the way to theatre, if avoidable.",
        "Respect the patient's right to change their mind.",
      ],
      visual: "Illustration: allowing time for a decision",
    },
    {
      title: "Types of consent",
      bullets: [
        "Implied: for example, holding out an arm for a blood pressure check.",
        "Verbal: for minor examinations and procedures, documented in the notes.",
        "Written: for surgery, anaesthesia, blood transfusion and higher-risk procedures, per policy.",
        "The type needed depends on the risk and on hospital policy.",
      ],
      visual: "Table: examples of implied, verbal and written consent",
    },
    {
      title: "Who should obtain consent",
      bullets: [
        "Ideally the clinician who will perform the procedure.",
        "A delegate must be suitably trained and know the procedure and its risks.",
        "The person taking consent must be able to answer the patient's questions.",
        "Consent is confirmed again on the day of the procedure.",
      ],
      visual: "Photo: surgeon confirming consent on the day of surgery",
    },
    {
      title: "Assessing capacity",
      bullets: [
        "Capacity is presumed unless there is reason to doubt it.",
        "It is decision-specific and time-specific.",
        "A patient has capacity if they can understand, retain and weigh the information, and communicate a decision.",
        "Support the patient to decide before concluding they lack capacity.",
      ],
      visual: "Flowchart: the four-part capacity test",
      keyPoint: "Capacity is about this decision, at this time — not a diagnosis.",
    },
    {
      title: "Unwise decisions",
      bullets: [
        "A decision you disagree with is not, by itself, evidence of lacking capacity.",
        "Explore the patient's reasons and values.",
        "Make sure they have all the information and understand the consequences.",
        "Document the discussion and the patient's decision.",
      ],
      visual: "Illustration: respecting a patient's informed refusal",
    },
    {
      title: "When the patient lacks capacity",
      bullets: [
        "Follow hospital policy and Saudi regulations on who may consent on their behalf.",
        "Involve the legal representative or guardian.",
        "Act in the patient's best interests and consider their known wishes.",
        "Reassess capacity if it may return, for example after delirium resolves.",
      ],
      visual: "Flowchart: decision-making for a patient without capacity",
    },
    {
      title: "Children and emergencies",
      bullets: [
        "For minors, consent is given by the parent or legal guardian as per policy and regulations.",
        "Involve the child in decisions according to their age and maturity.",
        "In a life- or limb-threatening emergency, give necessary treatment if consent cannot be obtained.",
        "Document the emergency and the reasons for acting.",
      ],
      visual: "Illustration: involving a child in the conversation",
    },
    {
      title: "Withdrawal and documentation",
      bullets: [
        "Patients may withdraw consent at any time, even during a procedure where safe to stop.",
        "Document what was discussed: risks, benefits, alternatives and the patient's questions.",
        "Record the use of an interpreter and any information leaflets given.",
        "Complete the consent form fully and legibly.",
      ],
      visual: "Example: a fully completed consent form",
    },
    {
      title: "Summary",
      bullets: [
        "Valid consent is informed, voluntary and given by a person with capacity.",
        "Discuss benefits, material risks and alternatives, and check understanding.",
        "Presume capacity; assess it for the specific decision when in doubt.",
        "Document the conversation, not just the signature.",
      ],
      visual: "Summary card: the essentials of consent and capacity",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "What are the three elements of valid consent?", correct: "Informed, voluntary and given by a person with capacity", distractors: ["Signed, witnessed and dated", "Verbal, written and recorded", "Requested, approved and filed"] },
    { prompt: "A signed consent form on its own:", correct: "Is only a record; it does not prove valid consent", distractors: ["Always proves valid consent", "Replaces the need for discussion", "Is valid even if the patient did not understand"] },
    { prompt: "Which information must be discussed when seeking consent?", correct: "Benefits, material risks and reasonable alternatives, including no treatment", distractors: ["Only the benefits", "Only the most common minor risks", "Only the cost of the procedure"] },
    { prompt: "Which risks should be disclosed?", correct: "Risks a reasonable person, or this patient, would consider significant — including serious rare risks", distractors: ["Only risks above 10%", "No risks, to avoid worrying the patient", "Only risks the family asks about"] },
    { prompt: "What is the teach-back method?", correct: "Asking the patient to explain the information in their own words", distractors: ["Reading the form aloud twice", "Asking the family to explain it", "Teaching the patient to sign"] },
    { prompt: "For a patient who speaks a different language, the best practice is to:", correct: "Use a professional interpreter", distractors: ["Rely on a young family member", "Use gestures only", "Proceed if they nod"] },
    { prompt: "Holding out an arm for a blood pressure check is an example of:", correct: "Implied consent", distractors: ["Written consent", "No consent", "Emergency consent"] },
    { prompt: "Which usually requires written consent?", correct: "Surgery under general anaesthesia", distractors: ["Taking a temperature", "Listening to the chest", "Measuring blood pressure"] },
    { prompt: "Who should ideally obtain consent for a procedure?", correct: "The clinician who will perform it", distractors: ["Any staff member available", "The ward clerk", "The patient's relative"] },
    { prompt: "Capacity is:", correct: "Presumed unless there is reason to doubt it", distractors: ["Assumed absent in all elderly patients", "Assumed absent after any diagnosis of illness", "Only present if the patient agrees with the doctor"] },
    { prompt: "Capacity assessment is:", correct: "Specific to the decision and the time it is made", distractors: ["A permanent label once assessed", "Based on the patient's diagnosis alone", "Only done by psychiatrists"] },
    { prompt: "Which is part of the test of capacity?", correct: "Being able to weigh up the information to reach a decision", distractors: ["Agreeing with the treatment plan", "Being able to read and write", "Having a university education"] },
    { prompt: "A patient with capacity refuses a recommended treatment. You should:", correct: "Respect the decision after ensuring it is informed, and document it", distractors: ["Treat anyway because it is in their interest", "Declare them as lacking capacity", "Ask the family to sign instead"] },
    { prompt: "Before concluding a patient lacks capacity, you should:", correct: "Take all practical steps to support them to decide", distractors: ["Ask them a single question", "Rely on the previous admission's assessment", "Assume they lack capacity if they are anxious"] },
    { prompt: "A patient lacks capacity due to temporary delirium and the procedure is not urgent. You should:", correct: "Consider delaying and reassess capacity when the delirium resolves", distractors: ["Proceed without any consent", "Ask any staff member to consent", "Cancel all future treatment"] },
    { prompt: "In a life-threatening emergency where consent cannot be obtained:", correct: "Necessary treatment can be given and the reasons documented", distractors: ["No treatment can be given", "The patient must be discharged", "A court order is always required first"] },
    { prompt: "For a minor, consent is normally given by:", correct: "The parent or legal guardian, as per policy and regulations", distractors: ["Any adult accompanying them", "The nurse in charge", "The minor alone in all cases"] },
    { prompt: "Can a patient withdraw consent after signing the form?", correct: "Yes, at any time", distractors: ["No, the form is binding", "Only with the surgeon's permission", "Only before admission"] },
    { prompt: "When should consent ideally not be sought?", correct: "When the patient is sedated or on the way to theatre", distractors: ["In an outpatient clinic", "With an interpreter present", "When the patient has had time to think"] },
    { prompt: "What should be documented in the consent process?", correct: "The discussion, including risks, benefits, alternatives and questions asked", distractors: ["Only the signature", "Only the date", "Nothing, if the form is signed"] },
  ],
};

export default content;
