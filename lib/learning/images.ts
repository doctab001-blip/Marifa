import type { LearningImage } from "./content/types";

/** Reuse terms verified on each Commons file page, 22 October 2026.
 * Images are displayed intact; source links provide the full-resolution original.
 */
function commons(file: string, src: string, alt: string, caption: string, credit: string, license: string, licenseUrl: string): LearningImage {
  return { src, alt, caption, credit, license, licenseUrl, sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` };
}

const publicDomain = "https://creativecommons.org/publicdomain/mark/1.0/";
const by2 = "https://creativecommons.org/licenses/by/2.0/";

export const LEARNING_IMAGES: Record<string, LearningImage> = {
  "infection-prevention-control": commons(
    "DonningCDC2020.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/DonningCDC2020.jpg",
    "CDC illustrated sequence for putting on a gown, mask or respirator, eye protection and gloves.",
    "CDC illustration of putting on personal protective equipment. Follow your facility’s current PPE policy for the task and exposure risk.",
    "CDC", "Public domain", publicDomain,
  ),
  "hand-hygiene": commons(
    "Hand Washing Demonstration - Sierra Leone (17105835779).jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/71/Hand_Washing_Demonstration_-_Sierra_Leone_%2817105835779%29.jpg",
    "A healthcare professional demonstrates handwashing to community members in Sierra Leone.",
    "Handwashing demonstration during an infection prevention education session in Sierra Leone.",
    "CDC Global", "CC BY 2.0", by2,
  ),
  "basic-life-support": commons(
    "A mannequin and a bag valve mask are used to train U.S. Marines in cardiopulmonary resuscitation (CPR) for emergency procedures at Marine Corps Air Station Beaufort, S.C., Jan. 28, 2010 100128-M-QS915-003.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/A_mannequin_and_a_bag_valve_mask_are_used_to_train_U.S._Marines_in_cardiopulmonary_resuscitation_%28CPR%29_for_emergency_procedures_at_Marine_Corps_Air_Station_Beaufort%2C_S.C.%2C_Jan._28%2C_2010_100128-M-QS915-003.jpg",
    "A resuscitation manikin and bag-mask device used during CPR training.",
    "Simulation equipment for practising resuscitation and bag-mask ventilation; this photograph is not a technique checklist.",
    "Lance Cpl. Kevin Clark / U.S. Marine Corps", "Public domain", publicDomain,
  ),
  "fire-safety": commons(
    "Hospital extinguisher.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Hospital_extinguisher.jpg/500px-Hospital_extinguisher.jpg",
    "A fire extinguisher installed in a hospital.",
    "Locate the firefighting equipment in your clinical area and follow the hospital fire response procedure.",
    "Bamjos", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/",
  ),
  "patient-identification": commons(
    "Defense.gov photo essay 090414-F-7885G-001.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Defense.gov_photo_essay_090414-F-7885G-001.jpg/960px-Defense.gov_photo_essay_090414-F-7885G-001.jpg",
    "A healthcare worker gives a patient an identification wristband at a medical site in Haiti.",
    "Patient wristband use in a medical service. Always complete the two-identifier check required by your local policy.",
    "Airman 1st Class Danielle Grannan / U.S. Air Force", "Public domain", publicDomain,
  ),
  "medication-safety": commons(
    "MMI medication cart.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/MMI_medication_cart.JPG/960px-MMI_medication_cart.JPG",
    "A medication cart used in a nursing facility.",
    "Medication storage and administration equipment. Secure medicines and apply local storage and checking requirements.",
    "© BrokenSphere / Wikimedia Commons", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0/",
  ),
  "confidentiality-data-protection": commons(
    "Medical-privacy.png",
    "https://upload.wikimedia.org/wikipedia/commons/2/2d/Medical-privacy.png",
    "Medical privacy graphic combining a medical symbol with a key.",
    "Protect access to health information and share it only through authorised channels.",
    "Hugh D’Andrade / EFF-Graphics", "CC BY 3.0 US", "https://creativecommons.org/licenses/by/3.0/us/",
  ),
  "incident-reporting": commons(
    "Staff meeting (2).jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Staff_meeting_%282%29.jpg/960px-Staff_meeting_%282%29.jpg",
    "Cancer Information Service staff discussing work around a meeting table.",
    "Team discussion illustrates collaborative learning. The people pictured are not shown taking part in an incident investigation.",
    "Bill Branson / National Cancer Institute", "Public domain", publicDomain,
  ),
  "consent-capacity": commons(
    "Clinical Trial Volunteer Signs Informed Consent Form (45116548901).jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/Clinical_Trial_Volunteer_Signs_Informed_Consent_Form_%2845116548901%29.jpg",
    "A clinical trial volunteer reviews and signs an informed consent form.",
    "Documenting informed consent in a clinical trial. A signature records the discussion; it does not replace it.",
    "NIAID", "CC BY 2.0", by2,
  ),
};

/** Only attach photographs where they illustrate the actual slide, rather than
 * reusing one picture throughout a deck or calling a photo a clinical diagram.
 */
const RELATED_SLIDES: Record<string, string[]> = {
  "infection-prevention-control": ["Personal protective equipment: choosing by risk", "Putting PPE on (donning)"],
  "hand-hygiene": ["When to use soap and water", "Patient and visitor involvement"],
  "basic-life-support": ["Bag-mask ventilation in hospital"],
  "fire-safety": ["Know your area", "Should you fight the fire?", "Classes of fire and extinguishers"],
  "patient-identification": ["The identification wristband"],
  "medication-safety": ["Safe storage and handling"],
  "confidentiality-data-protection": ["Need to know and minimum necessary"],
  "incident-reporting": ["Investigation and learning", "Feedback and closing the loop"],
  "consent-capacity": ["Withdrawal and documentation"],
};

export function getLearningImage(moduleId: string, slideTitle: string, slideIndex: number): LearningImage | undefined {
  return slideIndex === 0 || RELATED_SLIDES[moduleId]?.includes(slideTitle) ? LEARNING_IMAGES[moduleId] : undefined;
}
