import type { LearningImage } from "./content/types";

/* Learning portal imagery.
   Every file is self-hosted under /public/learning (the app's Content-Security-Policy only allows
   same-origin images) and was sourced from Wikimedia Commons on 22 October 2026 under a licence that
   permits reuse: public domain, CC0, CC BY or CC BY-SA. Files were resized and converted to WebP only;
   they are not otherwise altered. Each image carries its credit, licence and source link, which the
   UI shows wherever the image appears and in the portal's image-credits panel. */

const PD = { license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/" };
const CC0 = { license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" };
const BY2 = { license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/" };
const BY3US = { license: "CC BY 3.0 US", licenseUrl: "https://creativecommons.org/licenses/by/3.0/us/" };
const BYSA3 = { license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" };
const BYSA4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };

function img(
  key: string,
  commonsFile: string,
  size: [number, number],
  licence: { license: string; licenseUrl: string },
  credit: string,
  alt: string,
  caption: string,
  position?: string,
): LearningImage {
  return {
    src: `/learning/${key}.webp`,
    width: size[0],
    height: size[1],
    alt,
    caption,
    credit,
    ...licence,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(commonsFile.replaceAll(" ", "_"))}`,
    position,
  };
}

export const IMAGES = {
  portalHero: img("portal-hero", "ТДМУ - Центр симуляційного навчання - курси для медсестер Тернопільської університетської лікарні - 18035959.jpg", [1400, 2098], BYSA4, "Mykola Vasylechko",
    "Nurses practising resuscitation on a simulation manikin during a hospital training course.",
    "Simulation-based training for hospital nurses.", "50% 45%"),

  ipcPpe: img("ipc-ppe", "Medical personnel don PPE before entering a COVID-19-positive, non-critical patient’s room. (50199060167).jpg", [1400, 1000], PD, "U.S. Navy / Petty Officer 3rd Class Jacob L. Greenberg",
    "Two clinicians in gowns, respirators, face shields and gloves preparing to enter an isolation room.",
    "Clinicians putting on PPE before entering an isolation room. Select PPE according to the task and the exposure risk.", "50% 35%"),
  ipcDonning: img("ipc-donning", "DonningCDC2020.jpg", [338, 673], PD, "U.S. Centers for Disease Control and Prevention",
    "CDC illustrated sequence for putting on a gown, mask or respirator, eye protection and gloves.",
    "CDC sequence for putting on PPE. Follow your facility’s current PPE policy."),
  ipcSharps: img("ipc-sharps", "Wall-mounted sharps container.JPG", [1400, 1050], BYSA3, "BrokenSphere / Wikimedia Commons",
    "A wall-mounted sharps container with a biohazard label.",
    "A wall-mounted sharps container. Dispose of sharps at the point of use and never fill above the line."),
  ipcNegativePressure: img("ipc-negative-pressure", "Negative Air Pressure.png", [838, 433], BYSA4, "Rrobotto",
    "Diagram of air flowing into a negative-pressure room and being exhausted out.",
    "Negative pressure: air flows into the isolation room and is exhausted safely, so airborne particles do not escape."),

  hhCleanYourHands: img("hh-clean-your-hands", "HandCleaning.JPG", [1400, 1654], BYSA3, "James Heilman, MD",
    "Hand-rub dispensers mounted under a 'Please clean your hands' sign at a hospital entrance.",
    "Hand-rub stations at a hospital entrance invite patients and visitors to clean their hands.", "50% 40%"),
  hhHandRub: img("hh-hand-rub", "Wall-mounted hand sanitizer dispenser.JPG", [1400, 1867], BYSA3, "BrokenSphere / Wikimedia Commons",
    "A wall-mounted alcohol hand-rub dispenser.",
    "Alcohol-based hand rub should be available at the point of care."),
  hhSink: img("hh-sink", "Korle Bu 3.jpg", [1400, 2104], BYSA4, "ItzAbdullahi",
    "A nurse washing her hands at a clinical hand-wash sink on a hospital ward.",
    "Use soap and water when hands are visibly soiled or after caring for a patient with suspected C. difficile or norovirus.", "50% 55%"),
  hhDemonstration: img("hh-demonstration", "Hand Washing Demonstration - Sierra Leone (17105835779).jpg", [990, 742], BY2, "CDC Global",
    "A health worker demonstrates handwashing to a group of community members outdoors.",
    "Handwashing demonstration during an infection prevention education session."),

  blsCompressions: img("bls-compressions", "KM23- Chuuk State Department of Education CPR Training (7988217).jpg", [1400, 2100], PD, "U.S. Marine Corps / Lance Cpl. Trent A. Henry",
    "A participant practises chest compressions on a CPR training manikin.",
    "Practising chest compressions on a training manikin: arms straight, shoulders over the hands.", "50% 55%"),
  blsAed: img("bls-aed", "Brayden AED Trainer carrying case (2026)-bs.jpg", [1400, 1199], BYSA4, "Minja Klarić",
    "An AED trainer case printed with the anterolateral pad positions.",
    "AED training unit. The case shows the anterolateral pad positions: right of the sternum below the clavicle, and the left mid-axillary line."),
  blsBagMask: img("bls-bag-mask", "A mannequin and a bag valve mask are used to train U.S. Marines in cardiopulmonary resuscitation (CPR) for emergency procedures at Marine Corps Air Station Beaufort, S.C., Jan. 28, 2010 100128-M-QS915-003.jpg", [800, 533], PD, "U.S. Marine Corps / Lance Cpl. Kevin Clark",
    "A resuscitation manikin next to a bag-valve-mask device.",
    "Simulation equipment for practising bag-mask ventilation."),
  blsChoking: img("bls-choking", "Abdominal thrusts against choking.jpg", [1240, 654], PD, "U.S. Army Medical Department Center and School",
    "Line drawing of abdominal thrusts being given to a standing adult, with the hand position shown.",
    "Abdominal thrusts for a choking adult: fist above the navel, sharp inward and upward thrusts."),

  fireAlarm: img("fire-alarm", "A picture of a Fire alarm Pull Station.jpg", [1400, 933], CC0, "PentiumMan123",
    "A red fire alarm manual pull station on a wall.",
    "Raise the alarm: know where the nearest manual call point is in your area.", "50% 50%"),
  fireTraining: img("fire-training", "Fire extinguisher training (9311583046).jpg", [1400, 933], BY2, "Oregon Department of Transportation",
    "Staff practising with a fire extinguisher on a controlled outdoor training fire.",
    "Hands-on extinguisher training. Pull, Aim at the base, Squeeze, Sweep."),
  fireEvacChair: img("fire-evac-chair", "Escape-Chair on stair case.jpg", [1400, 2100], BYSA4, "Joep Cuijpers",
    "A person seated in an evacuation chair being guided down a staircase.",
    "An evacuation chair lets staff move a patient who cannot walk safely down the stairs.", "50% 60%"),

  pidWristband: img("pid-wristband", "Wrist Identification Band.jpg", [1400, 1351], BYSA4, "Whoisjohngalt",
    "A printed patient identification band on a patient's wrist.",
    "Check the identification band against the request every time, using two identifiers.", "50% 50%"),
  pidWristbandApplied: img("pid-wristband-applied", "Defense.gov photo essay 090414-F-7885G-001.jpg", [1400, 931], PD, "U.S. Air Force / Airman 1st Class Danielle Grannan",
    "A healthcare worker fastening an identification band on a patient's wrist.",
    "Apply the band at registration, check it with the patient and replace it if it becomes illegible."),
  pidTransfusion: img("pid-transfusion", "SY 24 - Valkyrie Blood Transfusion (8631298).jpg", [1400, 2107], PD, "U.S. Marine Corps / Sgt. Yvonne Iwae",
    "A unit of blood hanging ready for transfusion.",
    "Every blood component needs a bedside check of the patient's identity against the unit label.", "50% 35%"),
  pidSurgicalTeam: img("pid-surgical-team", "AfS surgical team at the operating room.jpg", [1400, 933], BYSA4, "Almondbite3",
    "A surgical team in theatre gowns and masks operating.",
    "Confirm the patient, procedure and site at the team time-out before the first incision."),

  medPharmacy: img("med-pharmacy", "Hospital Pharmacy.JPG", [1400, 1050], PD, "Mattes / Wikimedia Commons",
    "Shelves of labelled medicines in a hospital pharmacy.",
    "Organised, clearly labelled storage reduces selection errors."),
  medPreparing: img("med-preparing", "Korle Bu 4.jpg", [1400, 931], BYSA4, "ItzAbdullahi",
    "Three nurses preparing medicines and supplies at a treatment trolley.",
    "Check the prescription, the medicine and the patient before administration."),
  medPump: img("med-pump", "Baxter Colleague 3 CXE 1 at Joondalup 2020.jpg", [1400, 1867], BYSA4, "Orderinchaos",
    "A multi-channel infusion pump mounted on a drip stand.",
    "Infusion pumps: program from the drug library and independently check high-alert infusions.", "50% 40%"),
  medCart: img("med-cart", "MMI medication cart.JPG", [1400, 1050], BYSA3, "BrokenSphere / Wikimedia Commons",
    "A lockable medication cart.",
    "Keep medicine trolleys locked and secured when not in use."),

  cdpPrivacy: img("cdp-privacy", "Medical-privacy.png", [265, 265], BY3US, "Hugh D’Andrade / EFF",
    "Medical privacy graphic combining a caduceus with a key.",
    "Health information is protected: share it only through authorised channels."),
  cdpRecords: img("cdp-records", "US Navy 090123-N-9760Z-004 Hospital Corpsman 2nd Class Jennifer Ross files medical records aboard the aircraft carrier USS Nimitz (CVN 68).jpg", [1400, 937], PD, "U.S. Navy / Eduardo Zaragoza",
    "A staff member filing paper medical records on shelves.",
    "Paper records must be stored securely and returned to the records area after use.", "50% 40%"),
  cdpPhone: img("cdp-phone", "Messaging on smartphone (22389367255).jpg", [1400, 933], CC0, "StockyPics",
    "A smartphone showing a messaging conversation.",
    "Personal messaging apps are not approved channels for patient information."),
  cdpShredder: img("cdp-shredder", "Paper Shredder.jpg", [960, 1280], PD, "High Plains Drifter / English Wikipedia",
    "An office paper shredder.",
    "Dispose of confidential paper through approved confidential-waste routes."),

  irTeamMeeting: img("ir-team-meeting", "Staff meeting (2).jpg", [1400, 912], PD, "Bill Branson / National Cancer Institute",
    "Staff discussing work around a meeting table.",
    "Reporting turns individual events into shared learning for the whole team.", "50% 45%"),
  irDebrief: img("ir-simulation-debrief", "ТДМУ - Центр симуляційного навчання - курси для медсестер Тернопільської університетської лікарні - 18035992.jpg", [1400, 934], BYSA4, "Mykola Vasylechko",
    "Nurses seated around a table during a structured group discussion at a training centre.",
    "Structured team discussion. Investigations look for system factors, not individuals to blame."),

  ccConversation: img("cc-conversation", "Middle-aged female doctor talking to a patient during a video consultation at home in a cozy setting.jpg", [1400, 2100], BY2, "Shixart1985",
    "A doctor talking through options with a patient during a consultation.",
    "Consent is a conversation about options, benefits and risks, not a signature.", "50% 30%"),
  ccConsentForm: img("cc-consent-form", "Clinical Trial Volunteer Signs Informed Consent Form (45116548901).jpg", [1400, 1050], BY2, "NIAID",
    "A volunteer reviewing and signing an informed consent form with a staff member.",
    "A signature records the discussion; it does not replace it."),
  ccPaediatric: img("cc-paediatric", "Turkish pediatrician listens to a childs heartbeat in Afghanistan.jpg", [1335, 1869], BY2, "ISAF Headquarters Public Affairs Office",
    "A paediatrician listening to a young child's chest with a stethoscope.",
    "Involve children in decisions at a level they can understand."),
} satisfies Record<string, LearningImage>;

type ImageKey = keyof typeof IMAGES;

/** Banner photograph for each module: shown on portal cards and at the top of the module. */
const MODULE_COVERS: Record<string, ImageKey> = {
  "infection-prevention-control": "ipcPpe",
  "hand-hygiene": "hhSink",
  "basic-life-support": "blsCompressions",
  "fire-safety": "fireAlarm",
  "patient-identification": "pidWristband",
  "medication-safety": "medPharmacy",
  "confidentiality-data-protection": "cdpRecords",
  "incident-reporting": "irTeamMeeting",
  "consent-capacity": "ccConversation",
};

/** Slide photographs, matched by slide title. A photo is only attached where it shows what the slide
 * teaches; diagram and flowchart slides keep a text-led layout rather than a decorative stock image. */
const SLIDE_IMAGES: Record<string, Record<string, ImageKey>> = {
  "infection-prevention-control": {
    "Why infection prevention matters": "ipcPpe",
    "Putting PPE on (donning)": "ipcDonning",
    "Transmission-based precautions: airborne": "ipcNegativePressure",
    "Sharps safety": "ipcSharps",
  },
  "hand-hygiene": {
    "Hand hygiene saves lives": "hhDemonstration",
    "Alcohol-based hand rub": "hhHandRub",
    "When to use soap and water": "hhSink",
    "Patient and visitor involvement": "hhCleanYourHands",
  },
  "basic-life-support": {
    "Basic Life Support: why it matters": "blsCompressions",
    "Bag-mask ventilation in hospital": "blsBagMask",
    "Early defibrillation with an AED": "blsAed",
    "The choking adult": "blsChoking",
  },
  "fire-safety": {
    "Fire safety in a hospital": "fireAlarm",
    "PASS: using an extinguisher": "fireTraining",
    "Moving patients safely": "fireEvacChair",
  },
  "patient-identification": {
    "Why patient identification matters": "pidWristband",
    "The identification wristband": "pidWristbandApplied",
    "Blood transfusion": "pidTransfusion",
    "Procedures and surgery": "pidSurgicalTeam",
  },
  "medication-safety": {
    "Medication safety": "medPharmacy",
    "Before you give any medicine": "medPreparing",
    "Infusion pumps": "medPump",
    "Safe storage and handling": "medCart",
  },
  "confidentiality-data-protection": {
    "Confidentiality and trust": "cdpPrivacy",
    "Messaging apps and personal devices": "cdpPhone",
    "Paper records": "cdpRecords",
    "Retention and disposal": "cdpShredder",
  },
  "incident-reporting": {
    "Why we report incidents": "irTeamMeeting",
    "Investigation and learning": "irDebrief",
  },
  "consent-capacity": {
    "Consent: a process, not a form": "ccConversation",
    "Children and emergencies": "ccPaediatric",
    "Withdrawal and documentation": "ccConsentForm",
  },
};

export const PORTAL_HERO = IMAGES.portalHero;

export function getModuleCover(moduleId: string): LearningImage | undefined {
  const key = MODULE_COVERS[moduleId];
  return key ? IMAGES[key] : undefined;
}

export function getLearningImage(moduleId: string, slideTitle: string): LearningImage | undefined {
  const key = SLIDE_IMAGES[moduleId]?.[slideTitle];
  return key ? IMAGES[key] : undefined;
}

/** Every image in use, for the credits panel. */
export const ALL_LEARNING_IMAGES: LearningImage[] = Object.values(IMAGES);
