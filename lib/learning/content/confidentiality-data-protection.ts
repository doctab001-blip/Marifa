import type { ModuleContent } from "./types";

const content: ModuleContent = {
  slides: [
    {
      title: "Confidentiality and trust",
      bullets: [
        "Patients share sensitive information because they trust us to protect it.",
        "Breaches harm patients, damage trust and can carry legal penalties.",
        "Every member of staff with access to patient information has a duty of confidentiality.",
        "This module covers your legal and professional obligations.",
      ],
      visual: "Illustration: patient information protected by a secure lock",
      keyPoint: "Confidentiality continues after the patient is discharged — and after death.",
    },
    {
      title: "The Saudi Personal Data Protection Law (PDPL)",
      bullets: [
        "The PDPL governs how personal data is collected, used, shared and stored in the Kingdom.",
        "It is supervised by the Saudi Data & AI Authority (SDAIA).",
        "Health data is classed as sensitive data and needs extra protection.",
        "Breaches can lead to significant fines and other penalties.",
      ],
      visual: "Graphic: PDPL principles at a glance",
    },
    {
      title: "Patients' rights over their data",
      bullets: [
        "The right to be informed about how their data is used.",
        "The right to access their personal data.",
        "The right to request correction of inaccurate data.",
        "The right to request destruction of data that is no longer needed, subject to legal retention rules.",
      ],
      visual: "Icons: the data-subject rights",
    },
    {
      title: "Need to know and minimum necessary",
      bullets: [
        "Access a record only when you have a legitimate role in that patient's care or work.",
        "Use and share only the minimum information needed for the purpose.",
        "Curiosity is never a reason to open a record.",
        "Access is logged and audited.",
      ],
      visual: "Diagram: role-based access to the health record",
      keyPoint: "Every record you open leaves a trace in the audit log.",
    },
    {
      title: "Your own and your family's records",
      bullets: [
        "Do not use your work access to view your own record or those of family, friends or colleagues.",
        "Use the hospital's formal route for requesting access to records.",
        "Inappropriate access is a disciplinary matter, even if nothing is shared.",
        "Report it if you are asked to look up a record without a legitimate reason.",
      ],
      visual: "Illustration: staff member declining to look up a relative's record",
    },
    {
      title: "Conversations and the clinical environment",
      bullets: [
        "Discuss patients in private areas, not in lifts, corridors or cafeterias.",
        "Keep voices low at the bedside and draw curtains where appropriate.",
        "Keep patient boards limited to the information policy allows.",
        "Confirm the caller's identity before sharing information by phone.",
      ],
      visual: "Photo: private discussion room versus a busy corridor",
    },
    {
      title: "Messaging apps and personal devices",
      bullets: [
        "Do not share patient information on personal messaging apps or social media.",
        "Do not photograph patients or records on personal devices.",
        "Use only hospital-approved secure systems for clinical communication.",
        "Removing identifiers does not make social-media posts safe — patients can still be recognised.",
      ],
      visual: "Graphic: approved versus prohibited channels for patient information",
      keyPoint: "If it is not an approved system, patient data does not go into it.",
    },
    {
      title: "Passwords and workstations",
      bullets: [
        "Never share your login or use someone else's.",
        "Lock your screen whenever you step away.",
        "Use strong passphrases and change them if you suspect compromise.",
        "Log out of shared workstations at the end of each session.",
      ],
      visual: "Photo: locked workstation screen",
    },
    {
      title: "Phishing and cyber security",
      bullets: [
        "Be wary of unexpected emails asking you to click links, open attachments or enter credentials.",
        "Check the sender's address and look for urgency or unusual requests.",
        "Report suspected phishing to IT security — do not forward it to colleagues.",
        "Do not connect unknown USB devices to hospital computers.",
      ],
      visual: "Annotated example of a phishing email",
    },
    {
      title: "Paper records",
      bullets: [
        "Keep paper records out of public view and never leave them unattended.",
        "Use the clean-desk approach at the end of each shift.",
        "Dispose of confidential paper in confidential waste or shredders only.",
        "Do not take patient records home.",
      ],
      visual: "Photo: confidential waste bin",
    },
    {
      title: "Sharing information appropriately",
      bullets: [
        "Share information with others involved in the patient's care when needed.",
        "Disclosure to others normally needs the patient's consent or a legal basis.",
        "Legal bases include statutory reporting such as notifiable diseases.",
        "If unsure, seek advice from your manager or the data protection lead before sharing.",
      ],
      visual: "Flowchart: may I share this information?",
    },
    {
      title: "Family members and visitors",
      bullets: [
        "Check what the patient has agreed to share with family.",
        "Do not assume a relative is entitled to information.",
        "Follow hospital policy for patients who lack capacity and for minors.",
        "Be careful with information given at the bedside in front of visitors.",
      ],
      visual: "Illustration: confirming the patient's wishes before speaking to family",
    },
    {
      title: "Data breaches",
      bullets: [
        "A breach is any loss, unauthorised access, disclosure or alteration of personal data.",
        "Examples: emails to the wrong recipient, lost devices, inappropriate access.",
        "Report suspected breaches immediately through the incident system and to the data protection lead.",
        "The hospital must notify the regulator within strict legal deadlines, so speed matters.",
      ],
      visual: "Timeline: from breach discovery to notification",
      keyPoint: "Report a suspected breach straight away — do not try to fix it quietly.",
    },
    {
      title: "Retention and disposal",
      bullets: [
        "Records are kept for the periods set by law and hospital policy.",
        "Electronic data is deleted or destroyed securely when no longer required.",
        "Devices are wiped by IT before disposal or reuse.",
        "Never keep personal copies of patient data.",
      ],
      visual: "Graphic: the records life cycle",
    },
    {
      title: "Summary",
      bullets: [
        "Access only what you need for your role.",
        "Use only approved systems; never personal apps or devices.",
        "Protect logins, screens and paper records.",
        "Report suspected breaches immediately.",
      ],
      visual: "Summary card: confidentiality in daily practice",
      keyPoint: "Next: a 20-question assessment. You need 16 correct answers (80%) to pass.",
    },
  ],
  questions: [
    { prompt: "Which law governs personal data protection in Saudi Arabia?", correct: "The Personal Data Protection Law (PDPL)", distractors: ["The EU GDPR only", "The Labour Law", "The Commercial Registration Law"] },
    { prompt: "Which authority supervises the PDPL?", correct: "The Saudi Data & AI Authority (SDAIA)", distractors: ["The Saudi Food and Drug Authority", "The Ministry of Commerce", "The Civil Defense Directorate"] },
    { prompt: "Under the PDPL, health data is classed as:", correct: "Sensitive data", distractors: ["Public data", "Non-personal data", "Marketing data"] },
    { prompt: "When may you access a patient's record?", correct: "When you have a legitimate role in their care or work", distractors: ["Whenever you are curious", "When the patient is a celebrity", "When a friend asks you to check"] },
    { prompt: "You want to see your own test results. You should:", correct: "Use the hospital's formal access route, not your work login", distractors: ["Look them up during your shift", "Ask a colleague to look them up", "Print them from any workstation"] },
    { prompt: "A colleague asks you to share a patient photo on a personal messaging group. You should:", correct: "Decline and use only approved secure systems", distractors: ["Share it if the face is hidden", "Share it with the patient's name removed", "Share it only with doctors"] },
    { prompt: "Removing a patient's name from a social-media post:", correct: "Does not make it safe — the patient may still be identifiable", distractors: ["Makes it fully anonymous", "Is enough if the post is private", "Is only needed for photos"] },
    { prompt: "What should you do when you step away from your workstation?", correct: "Lock the screen", distractors: ["Leave it open for colleagues", "Turn off the monitor only", "Nothing if you return within 10 minutes"] },
    { prompt: "Can you share your system login with a trusted colleague?", correct: "No, never", distractors: ["Yes, if they forgot theirs", "Yes, during busy shifts", "Yes, if your manager agrees verbally"] },
    { prompt: "An email asks you to urgently confirm your password via a link. You should:", correct: "Not click, and report it to IT security", distractors: ["Click the link to check", "Reply with your password", "Forward it to all colleagues as a warning"] },
    { prompt: "How should confidential paper be disposed of?", correct: "In confidential waste or a shredder", distractors: ["In the general waste bin", "In the recycling bin", "Taken home for disposal"] },
    { prompt: "Where should you discuss a patient's care with colleagues?", correct: "In a private area where you cannot be overheard", distractors: ["In the lift", "In the cafeteria", "In the waiting room"] },
    { prompt: "A caller says they are a patient's brother and asks about the diagnosis. You should:", correct: "Verify identity and check the patient's consent before sharing", distractors: ["Tell them, as family are always entitled", "Give a brief summary only", "Hang up without explanation"] },
    { prompt: "Which is a legal basis for sharing information without consent?", correct: "Statutory reporting of a notifiable disease", distractors: ["A request from a journalist", "A request from an employer", "Curiosity of another staff member"] },
    { prompt: "You email a discharge summary to the wrong recipient. What do you do?", correct: "Report it immediately as a suspected data breach", distractors: ["Send a second email asking them to delete it and say nothing", "Wait to see if anyone complains", "Delete it from your sent items"] },
    { prompt: "Why must suspected breaches be reported quickly?", correct: "The hospital must notify the regulator within strict legal deadlines", distractors: ["They expire after a week", "Reporting is optional", "So the staff member can be identified for punishment"] },
    { prompt: "Which is a data subject right under the PDPL?", correct: "The right to access their personal data", distractors: ["The right to access other patients' data", "The right to edit their record directly", "The right to view staff audit logs"] },
    { prompt: "The 'minimum necessary' principle means:", correct: "Using or sharing only the information needed for the purpose", distractors: ["Sharing the full record every time", "Collecting as much data as possible", "Using only paper records"] },
    { prompt: "An unknown USB stick is found in the ward. You should:", correct: "Hand it to IT security without plugging it in", distractors: ["Plug it in to find the owner", "Keep it for personal use", "Throw it in general waste"] },
    { prompt: "Inappropriate access to a record, even without sharing it, is:", correct: "A breach of confidentiality and a disciplinary matter", distractors: ["Acceptable if nothing is shared", "Acceptable for senior staff", "Only a problem if the patient complains"] },
  ],
};

export default content;
