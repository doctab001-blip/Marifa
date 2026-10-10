export const medicalSpecialities = [
  { name: "Internal Medicine", terms: ["internal medicine", "general medicine"] },
  { name: "Cardiology", terms: ["cardiology", "cardiac"] },
  { name: "Pulmonology", terms: ["pulmonology", "respiratory", "pulmonary"] },
  { name: "Gastroenterology", terms: ["gastroenterology", "gastrointestinal"] },
  { name: "Nephrology", terms: ["nephrology", "renal"] },
  { name: "Endocrinology", terms: ["endocrinology", "diabetes"] },
  { name: "Infectious Diseases", terms: ["infectious diseases", "infection"] },
  { name: "Neurology", terms: ["neurology", "neurological"] },
  { name: "General Surgery", terms: ["general surgery"] },
  { name: "Acute Care Surgery", terms: ["acute care surgery", "trauma surgery"] },
  { name: "Obstetrics and Gynecology", terms: ["obstetrics", "gynaecology", "gynecology", "maternal-fetal"] },
  { name: "Paediatrics", terms: ["paediatric", "pediatric", "paediatrics", "pediatrics"] },
  { name: "Neonatology", terms: ["neonatology", "neonatal"] },
  { name: "Emergency Medicine", terms: ["emergency medicine", "emergency"] },
  { name: "Orthopedics and Trauma", terms: ["orthopedics", "orthopaedics", "trauma"] },
  { name: "Otolaryngology (ENT)", terms: ["otolaryngology", "ent"] },
  { name: "Ophthalmology", terms: ["ophthalmology", "ophthalmic"] },
  { name: "Dermatology", terms: ["dermatology", "dermatological"] },
  { name: "Psychiatry", terms: ["psychiatry", "psychiatric"] },
  { name: "Urology", terms: ["urology", "urological"] },
  { name: "Anaesthesiology", terms: ["anaesthesiology", "anesthesiology", "anaesthesia", "anesthesia"] },
] as const;

export function hasMedicalSpeciality(value: string, selected: string) {
  const option = medicalSpecialities.find((item) => item.name === selected);
  const haystack = value.toLocaleLowerCase();
  return Boolean(option && option.terms.some((term) => haystack.includes(term)));
}

export function inferMedicalSpecialityTags(value: string) {
  const text = value.toLocaleLowerCase();
  return medicalSpecialities
    .map(({ name, terms }) => ({ name, position: Math.min(...terms.map((term) => text.indexOf(term)).filter((position) => position >= 0)) }))
    .filter(({ position }) => Number.isFinite(position))
    .sort((a, b) => a.position - b.position)
    .map(({ name }) => name);
}
