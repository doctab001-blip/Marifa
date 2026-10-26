// Shared standard-resuscitation badges used in the ABCDE first step. {{NAME}} in a patch expands to the badge.
// Source for all of these: Resuscitation Council UK ABCDE approach (2021) for adults; APLS 6th edition (2016) for children.
export const MACROS = {
  O2_ADULT: "[💊 Oxygen | 15 L/min via reservoir mask | Inhaled | Continuous | Until SpO2 94–98%, then titrate to target]",
  O2_COPD: "[💊 Oxygen | 24–28% via Venturi mask | Inhaled | Continuous | Titrate to SpO2 88–92% until blood gas known]",
  O2_CHILD: "[💊 Oxygen | 10–15 L/min via reservoir mask | Inhaled | Continuous | Until SpO2 94–98%, then titrate to target]",
  FLUID_ADULT: "[💊 Sodium chloride 0.9% | 500 mL | IV bolus over 15 minutes | Reassess after each bolus; repeat if still hypoperfused | Until perfusion restored]",
  FLUID_CHILD: "[💊 Sodium chloride 0.9% | 10 mL/kg | IV or IO bolus over 10 minutes | Reassess after each bolus; repeat if still shocked | Until perfusion restored]",
  GLUC_ADULT: "[💊 Glucose 10% | 150–200 mL | IV infusion over 15 minutes | Repeat once after 10 minutes if glucose remains below 4 mmol/L | Until glucose 4 mmol/L or above]",
  GLUC_CHILD: "[💊 Glucose 10% | 2 mL/kg | IV or IO bolus | Repeat after 10 minutes if glucose remains below 3 mmol/L | Until glucose 3 mmol/L or above]",
};

export const MACRO_NOTE = "[SUPPLEMENTED - EXTERNAL] ABCDE first-step doses (oxygen, 0.9% sodium chloride bolus, 10% glucose) are standard resuscitation doses from Resuscitation Council UK ABCDE approach (2021) for adults and APLS 6th edition (2016) for children; they were not taken from this topic's cited sources.";

export function expand(text, used) {
  return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_m, name) => {
    if (!(name in MACROS)) throw new Error(`Unknown macro ${name}`);
    used?.add(name);
    return MACROS[name];
  });
}

export const LEAD = "Call for senior help early and correct each abnormality concurrently as it is found: do not wait for the full survey, investigations or a diagnosis before treating a life-threatening problem.";

// Short assessment lines (what to check). Corrections with doses go in the notes below the five letters.
export const DEFAULT_LETTERS = {
  adult: {
    A: "Airway: Check for obstruction, noisy breathing, swelling or secretions; open and protect the airway.",
    B: "Breathing: Check respiratory rate, SpO2, work of breathing and chest signs.",
    C: "Circulation: Check pulse, blood pressure, capillary refill and skin perfusion; attach a monitor and secure IV access.",
    D: "Disability: Assess responsiveness (alert, voice, pain, unresponsive), pupils and capillary glucose.",
    E: "Exposure: Expose to examine fully, check temperature, skin and abdomen; keep the patient warm.",
  },
  child: {
    A: "Airway: Check for obstruction, stridor, noisy breathing or secretions; open and protect the airway.",
    B: "Breathing: Check respiratory rate, SpO2, recession, grunting and air entry.",
    C: "Circulation: Check heart rate, capillary refill, pulse volume and blood pressure; attach a monitor and secure IV or IO access.",
    D: "Disability: Assess responsiveness (alert, voice, pain, unresponsive), pupils and capillary glucose.",
    E: "Exposure: Expose to examine fully, check temperature and skin; prevent heat loss.",
  },
};

export const DEFAULT_NOTES = {
  adult: ["If SpO2 is below 94% give {{O2_ADULT}}.", "Hypotension or poor perfusion: give {{FLUID_ADULT}}.", "Capillary glucose below 4 mmol/L: give {{GLUC_ADULT}}."],
  child: ["If SpO2 is below 94% give {{O2_CHILD}}.", "Shock: give {{FLUID_CHILD}}.", "Capillary glucose below 3 mmol/L: give {{GLUC_CHILD}}."],
};

/** Builds the ABCDE first step: five lettered checks, then call-out notes (concurrent-correction line first). */
export function buildAbcde(patch, ex) {
  const profile = patch.profile ?? "adult";
  const letters = { ...(DEFAULT_LETTERS[profile] ?? DEFAULT_LETTERS.adult), ...(patch.abcde ?? {}) };
  const notes = patch.abcdeNotes ?? DEFAULT_NOTES[profile] ?? DEFAULT_NOTES.adult;
  return {
    id: "abcde-concurrent-survey",
    title: patch.abcdeTitle ?? "Rapid ABCDE assessment and call for help",
    timeframe: patch.abcdeTime ?? "First minute",
    actions: [...["A", "B", "C", "D", "E"].map((l) => ex(letters[l])), LEAD, ...notes.map(ex), ...(patch.abcdeExtra ?? []).map(ex)],
  };
}
