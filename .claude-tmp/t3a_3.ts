import { cite, type Ref, type Spec } from "./common.ts";
import { inv, noDrug, localDrug, reg, teachOf } from "./tier3-helpers.ts";

const NG133: Ref = { title: "NICE NG133: Hypertension in pregnancy: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng133/chapter/Recommendations" };
const UIA: Ref = { title: "Hull and Rucklidge: Management of severe pre-eclampsia and eclampsia, Update in Anaesthesia (educational article citing RCOG Guideline 10a; year not stated in the text opened)", url: "https://e-safe-anaesthesia.org/e_library/13/Management_of_severe_pre-eclampsia_and_eclampsia_Update_2009.pdf" };
const SDG: Ref = { title: "NHS Lanarkshire (Wishaw General Hospital Women's Services): Guideline for the Management of Shoulder Dystocia (updated March 2022)", url: "https://rightdecisions.scot.nhs.uk/media/2085/shoulder-dystocia-march-2022.pdf" };
const NG217: Ref = { title: "NICE NG217: Epilepsies in children, young people and adults: Treating status epilepticus", url: "https://www.nice.org.uk/guidance/NG217/chapter/7-Treating-status-epilepticus" };
const AES: Ref = { title: "Glauser et al: Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults, American Epilepsy Society (Epilepsy Curr 2016;16(1):48-61)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4749120/" };
const NCS: Ref = { title: "Brophy et al: Guidelines for the Evaluation and Management of Status Epilepticus, Neurocritical Care Society (Neurocrit Care 2012)", url: "https://www.neurocriticalcare.org/Portals/0/Docs/Resources/SE_Guidelines_NCS_0412.pdf" };
const SHL: Ref = { title: "Chandrasekhar et al: Clinical Practice Guideline: Sudden Hearing Loss (Update), AAO-HNSF (Otolaryngol Head Neck Surg 2019;161(1S):S1-S45)", url: "https://www.rcot.org/2021/pdf/Clinical%20Practice%20Guideline%20Sudden%20Hearing%20Loss%20(Update).pdf" };

const ng133 = (loc: string) => cite(NG133, `NICE NG133, ${loc}`);
const uia = (loc: string) => cite(UIA, `Update in Anaesthesia severe pre-eclampsia article, ${loc}`);
const sdg = (loc: string) => cite(SDG, `NHS Lanarkshire shoulder dystocia guideline 2022, ${loc}`);
const ng217 = (loc: string) => cite(NG217, `NICE NG217, ${loc}`);
const aes = (loc: string) => cite(AES, `AES status epilepticus guideline 2016, ${loc}`);
const ncs = (loc: string) => cite(NCS, `NCS status epilepticus guideline 2012, ${loc}`);
const shl = (loc: string) => cite(SHL, `AAO-HNSF Sudden Hearing Loss guideline 2019, ${loc}`);

export const specs: Spec[] = [
  {
    key: "severe-pe", draftTitle: "Severe Pre-Eclampsia and Eclampsia: Emergency Management", pillar: "Safe Birth", authority: "NICE",
    scope: "Severe hypertension, severe pre-eclampsia and eclampsia in pregnancy: blood pressure control, magnesium sulfate, fluids, monitoring and timing of birth, from NICE NG133 with doses from an educational article that cites RCOG guidance.",
    unverified: [
      "NICE NG133 gives no doses for labetalol, nifedipine or hydralazine; the doses used are from a single educational article (Update in Anaesthesia) that cites the 2006 RCOG guideline, and the article's publication year is not stated.",
      "The RCOG Green-top Guideline 10(A) itself, a Saudi Ministry of Health protocol and the Saudi Society of Obstetrics guidance were not opened.",
      "Nifedipine and methyldopa dosing was not found in any opened source.",
      "The calcium gluconate antidote dose for magnesium toxicity was not found in the sources opened.",
      "NG133 Recommendation 1.5.17 was cut off in the text opened.",
      "SFDA registration of magnesium sulfate, labetalol, nifedipine and hydralazine was not verified.",
    ],
    mech: [
      "Pre-eclampsia occurs after 20 weeks' gestation with hypertension and proteinuria; severe features include severe headache, visual disturbance, epigastric pain, raised liver enzymes (ALT above 70 IU/L) and platelets below 100 ×10⁹/L.",
      "Severe hypertension (160/110 mmHg or higher) needs admission and immediate treatment in critical care.",
      "Eclampsia is a seizure in pre-eclampsia; magnesium sulfate is given, and diazepam or phenytoin are not used instead.",
      "Haemolysis, elevated liver enzymes and low platelets (HELLP) syndrome is a severe variant.",
      "Excess fluid is harmful, so maintenance fluids are restricted.",
    ],
    symptoms: ["Severe headache.", "Visual disturbance or scotomata.", "Epigastric or right upper quadrant pain, vomiting.", "Convulsion (eclampsia)."],
    signs: ["Blood pressure 160/110 mmHg or higher.", "Clonus, papilloedema, liver tenderness.", "Proteinuria."],
    red: [
      "Convulsion or recent convulsion.",
      "Blood pressure 160/110 mmHg or higher.",
      "Alanine aminotransferase (ALT) above 70 IU/L, platelets below 150 ×10⁹/L (below 100 ×10⁹/L is severe) or creatinine 90 µmol/L or higher.",
      "Oxygen saturation below 90%.",
      "Blood pressure uncontrolled despite three classes of antihypertensive.",
    ],
    precip: ["Pregnancy beyond 20 weeks.", "Preterm pre-eclampsia.", "Postnatal period (blood pressure may rise again around 24 hours after delivery)."],
    diffs: [
      { condition: "HELLP syndrome", distinguishingFeatures: "Haemolysis, raised liver enzymes and platelets below 100 ×10⁹/L; do not give dexamethasone or betamethasone to treat HELLP syndrome." },
      { condition: "Intracranial event after a convulsion", distinguishingFeatures: "Slow to wake or focal signs: check pupils and obtain computed tomography (CT) of the head." },
      { condition: "Gestational hypertension without severe features", distinguishingFeatures: "Blood pressure below 160/110 mmHg and normal bloods; manage as hypertension." },
    ],
    criteria: [
      { criterion: "Severe hypertension", threshold: "160/110 mmHg or higher: admit; measure every 15 to 30 minutes until below 160/110 mmHg (Tables 1–2)." },
      { criterion: "Magnesium sulfate", threshold: "Severe hypertension or severe pre-eclampsia with a current or previous eclamptic fit; consider if birth planned within 24 hours or severe features (Rec 1.8.1–1.8.3)." },
      { criterion: "Planned early birth", threshold: "Unable to control blood pressure with 3 or more antihypertensive classes, or oxygen saturation below 90% (Rec 1.5.7)." },
      { criterion: "Birth at term", threshold: "From 37 weeks initiate birth within 24 to 48 hours (Table 3)." },
    ],
    rule_in: [
      inv("Blood pressure", "Severity of hypertension", "Severe hypertension", "160/110 mmHg or higher", "Admit and treat; remeasure every 15 to 30 minutes until below 160/110 mmHg.", "Below 140/90 mmHg", ng133("Rec 1.3.8; 1.5.5; Tables 1–2"), "specializedAdjunctive"),
      inv("Urine dipstick protein", "Proteinuria", "Pre-eclampsia", "1+ or more (1+ equals 0.3 g/L)", "Proteinuria supports pre-eclampsia; severity guided by clinical and blood findings.", "Negative", uia("p. 51"), "laboratory"),
      inv("Platelet count", "Haematological involvement", "HELLP or thrombocytopenia", "Below 150 ×10⁹/L (below 100 ×10⁹/L is a severe feature)", "Concern threshold in NG133; repeat as in the monitoring table.", "150 ×10⁹/L or higher; laboratory range applies", ng133("Rec 1.5.2; Table 2"), "laboratory"),
      inv("Alanine aminotransferase (ALT)", "Liver injury", "HELLP or hepatic involvement", "Above 70 IU/L", "Concern threshold; monitor twice weekly with mild-to-moderate and three times weekly with severe hypertension.", "70 IU/L or lower; laboratory range applies", ng133("Rec 1.5.2; Table 2"), "laboratory"),
      inv("Creatinine", "Renal function", "Renal involvement", "90 µmol/L or higher", "Concern threshold; limit fluids and monitor urine output.", "Below 90 µmol/L; laboratory range applies", ng133("Rec 1.5.2; Table 2"), "laboratory"),
    ],
    rule_out: [
      inv("Cardiotocography (CTG)", "Fetal heart rate", "Fetal compromise", "Abnormal trace", "Carry out at diagnosis; repeat for change in fetal movement, vaginal bleeding, abdominal pain or maternal deterioration.", "Normal trace", ng133("Rec 1.6.5; 1.6.7–1.6.8"), "specializedAdjunctive"),
      inv("Fetal ultrasound with amniotic fluid and umbilical artery Doppler", "Fetal growth and placental flow", "Fetal growth restriction", "Restricted growth, low fluid or abnormal Doppler", "At diagnosis if managing conservatively; repeat every 2 weeks.", "Growth, fluid and Doppler within normal limits", ng133("Rec 1.6.6; 1.6.9"), "firstLineImaging"),
      inv("Pulse oximetry", "Oxygenation", "Pulmonary oedema", "Oxygen saturation below 90%", "A threshold for planned early birth.", "95% or higher is typical; NG133 early-birth threshold is below 90%", ng133("Rec 1.5.7"), "specializedAdjunctive"),
      inv("Magnesium monitoring: reflexes, respiratory rate, urine output", "Magnesium toxicity", "Toxicity", "Absent reflexes, depressed respiration or low urine output", "Check reflexes before each dose and respiratory rate regularly; urine output aim above 100 mL over 4 hours in the source example.", "Reflexes present, normal respiratory rate", uia("pp. 51–52"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "immediate", title: "Immediate treatment", timeframe: "First 15–60 minutes", actions: [
        "Admit; measure blood pressure every 15 to 30 minutes until below 160/110 mmHg.",
        "Treat severe hypertension immediately in critical care with labetalol (oral or IV), oral nifedipine or IV hydralazine; target 135/85 mmHg or less in NG133.",
        "Give IV magnesium sulfate for severe hypertension or severe pre-eclampsia with a current or previous eclamptic fit; consider it if birth is planned within 24 hours or severe features appear.",
        "Do not use diazepam, phenytoin or other anticonvulsants instead of magnesium sulfate.",
      ] },
      { id: "magnesium", title: "Magnesium sulfate regimen", timeframe: "Loading, then 24 hours", actions: [
        "NG133: 4 g IV over 5 to 15 minutes, then 1 g per hour for 24 hours; after a fit continue 24 hours after the last fit; recurrent fit: further 2 g to 4 g IV over 5 to 15 minutes.",
        "Check reflexes and respiratory rate regularly and monitor urine output.",
        "Consider neonatal calcium and magnesium monitoring if use is prolonged or repeated beyond 5 to 7 days.",
      ] },
      { id: "fluids-bloods", title: "Fluids and monitoring", timeframe: "Ongoing", actions: [
        "Limit maintenance fluids to 80 mL per hour unless other fluid losses; avoid volume expansion unless hydralazine is the antihypertensive, when up to 500 mL crystalloid may be considered with the first dose.",
        "Blood tests (platelets, ALT, creatinine) twice weekly with mild-to-moderate hypertension and three times weekly with severe hypertension.",
        "CTG at diagnosis; fetal growth, amniotic fluid and Doppler at diagnosis and every 2 weeks when managing conservatively.",
        "If early birth within 7 days is likely, offer antenatal corticosteroids; do not use them to treat HELLP syndrome.",
      ] },
      { id: "birth", title: "Timing of birth", timeframe: "Senior obstetric decision", actions: [
        "Planned early birth if blood pressure cannot be controlled with 3 or more classes of antihypertensive, or oxygen saturation falls below 90%.",
        "At 37 weeks or later, initiate birth within 24 to 48 hours.",
        "In labour, measure blood pressure hourly, or every 15 to 30 minutes until below 160/110 mmHg in severe hypertension; do not preload with IV fluids before epidural.",
      ] },
      { id: "postnatal", title: "Postnatal care", timeframe: "After birth", actions: [
        "Blood pressure at least four times daily as an inpatient; start treatment if 150/100 mmHg or higher.",
        "Check platelets, transaminases and creatinine at 48 to 72 hours; repeat until normal if abnormal.",
        "Transfer to community care when symptom-free, blood pressure 150/100 mmHg or lower with or without treatment, and blood results stable or improving.",
      ] },
    ],
    meds: {
      status: "source-verified",
      note: "Magnesium sulfate dosing is from NICE NG133 Rec 1.8.4. Labetalol and hydralazine doses are from the Update in Anaesthesia article only because NG133 gives none. Nifedipine and methyldopa doses were not found. SFDA registration was not verified; check hospital formulary.",
      regimens: [
        reg({ indication: "Prevention and treatment of eclamptic fits in severe hypertension or severe pre-eclampsia", patientGroup: "Pregnant or postpartum women in critical care", genericName: "Magnesium sulfate", dose: "Loading 4 g over 5 to 15 minutes, then 1 g per hour; recurrent fit 2 g to 4 g over 5 to 15 minutes", route: "IV", frequency: "Loading dose then continuous infusion", duration: "24 hours; after a fit, 24 hours after the last fit", adjustments: ["Consider neonatal calcium and magnesium monitoring if use is prolonged or repeated beyond 5 to 7 days (MHRA warning)."], monitoring: ["Reflexes before each dose and respiratory rate regularly; urine output."], contraindications: ["Contraindications are not listed in the source; check product information."], src: NG133, edition: "NICE NG133 Rec 1.8.1–1.8.5" }),
        reg({ indication: "Severe hypertension", patientGroup: "Pregnant women with severe pre-eclampsia", genericName: "Labetalol", dose: "Bolus 25 mg over at least 1 minute, repeat every 15 minutes to a maximum of 200 mg; infusion 4 mg/mL starting at 20 mg per hour, doubling every 30 minutes to a maximum of 160 mg per hour", route: "IV", frequency: "Bolus repeat then infusion", duration: "Until blood pressure controlled", adjustments: ["Maximum bolus total 200 mg; infusion maximum 160 mg per hour."], monitoring: ["Blood pressure every 15 to 30 minutes until below 160/110 mmHg; the article titrates to diastolic 90–100 mmHg."], contraindications: ["Contraindications are not listed in the source; check product information."], src: UIA, edition: "Update in Anaesthesia severe pre-eclampsia article, p. 52" }),
        reg({ indication: "Severe hypertension when labetalol is unsuitable", patientGroup: "Pregnant women with severe pre-eclampsia", genericName: "Hydralazine", dose: "Bolus 5 mg over 15 minutes, repeat 5 mg if diastolic stays above 100 mmHg after 20 minutes; infusion start 5 mg per hour, usual 2–3 mg per hour, maximum 18 mg per hour", route: "IV", frequency: "Bolus then infusion", duration: "Until blood pressure controlled", adjustments: ["Reduce for significant side effects or maternal heart rate above 130 beats per minute.", "NG133: consider up to 500 mL crystalloid before or with the first dose."], monitoring: ["Targets in the article: diastolic 90–100 mmHg and systolic 140–150 mmHg; NG133 target 135/85 mmHg or less."], contraindications: ["Contraindications are not listed in the source; check product information."], src: UIA, edition: "Update in Anaesthesia severe pre-eclampsia article, p. 52" }),
      ],
    },
    comparison: {
      title: "NICE NG133 versus the Update in Anaesthesia article (citing RCOG 10a)",
      columns: ["NICE NG133", "Update in Anaesthesia article"],
      rows: [
        { parameter: "Magnesium sulfate loading", values: ["4 g IV over 5 to 15 minutes.", "4 g IV over 20 minutes plus 2.5 g IM into each buttock (9 g in total)."] },
        { parameter: "Magnesium sulfate recurrent fit", values: ["Further 2 g to 4 g IV over 5 to 15 minutes.", "2 g IV over 2 minutes, or second loading dose or infusion 1.5–2 g per hour."] },
        { parameter: "Blood pressure target", values: ["135/85 mmHg or less.", "Diastolic 90–100 mmHg."] },
        { parameter: "Maintenance fluids", values: ["80 mL per hour.", "Example 85 mL per hour."] },
      ],
      note: "Shown side by side and not merged. NG133 is the primary source; check the local protocol.",
    },
    teach: teachOf([
      { ref: NG133, edition: "NICE NG133, Rec 1.5.5–1.8.12; Tables 1–3", locator: "Rec 1.5.5–1.5.24; 1.6.5–1.6.9; 1.7.3–1.7.6; 1.8.1–1.8.12; Tables 1–3" },
      { ref: UIA, edition: "Update in Anaesthesia article, pp. 50–54", locator: "pp. 50–54" },
    ], ["Control severe hypertension and prevent fits in the first hour.", "Time birth and monitor mother and fetus."],
      ["Severe hypertension is 160/110 mmHg or higher.", "Use magnesium sulfate, not diazepam or phenytoin, for eclampsia.", "Maintenance fluids are restricted to 80 mL per hour."],
      ["Delaying treatment of severe hypertension.", "Fluid overload.", "Missing postpartum blood pressure rises."]),
    edu: ["Explain warning symptoms: severe headache, visual disturbance, epigastric pain.", "Explain the need for postnatal blood pressure checks and treatment."],
    life: ["Rest and stepwise return to activity after discharge as advised by the obstetric team."],
    mdt: ["Obstetrics; obstetric anaesthesia; critical care; neonatology; midwifery; postnatal community team."],
    discharge: ["Symptom-free with blood pressure 150/100 mmHg or lower with or without treatment.", "Stable or improving platelets, ALT and creatinine.", "Postnatal blood pressure plan and follow-up arranged."],
    follow: "Blood pressure at least once between days 3 and 5 and on alternate days until normal if abnormal; platelets, transaminases and creatinine at 48 to 72 hours, repeated until normal if abnormal.",
  },
  {
    key: "shoulder-dystocia", draftTitle: "Shoulder Dystocia: Emergency Manoeuvres and Neonatal Assessment", pillar: "Safe Birth", authority: "Other",
    scope: "Emergency manoeuvres, team call, documentation and neonatal and maternal consequences of shoulder dystocia, from the NHS Lanarkshire (Wishaw General Hospital) guideline 2022.",
    unverified: [
      "The RCOG Green-top Guideline 42 and any Saudi obstetric guideline were not opened.",
      "The opened guideline contains no dedicated neonatal resuscitation protocol and no debrief section; neonatal assessment beyond call-out, cord gases, Apgar score and brachial plexus injury awareness is not specified.",
      "No fixed time limit for individual manoeuvres is given.",
      "The Scottish emergency call number (2222) is local; use the Saudi hospital's obstetric emergency call.",
      "Postpartum haemorrhage drug doses are not given; use the local haemorrhage protocol.",
    ],
    mech: [
      "The anterior shoulder (less often the posterior) catches on the maternal symphysis pubis or sacral promontory after the head is delivered.",
      "Reported incidence is 0.58% to 0.70%; by birth weight it is 0.3% under 4000 g, 4.7% for 4000–4500 g and 9.4% above 4500 g.",
      "Cord pH falls about 0.04 units per minute after the head is delivered, so about 0.28 units over 7 minutes; resuscitation becomes harder below pH 7.",
      "Risk of significant hypoxic injury is small when the head-to-body interval is under 5 minutes in a previously well fetus.",
      "Brachial plexus injury is the main neonatal complication (about 1 in 2300 UK births permanent); Erb's palsy is the most common type.",
    ],
    symptoms: ["Cephalic delivery in which the shoulders do not deliver after gentle downward traction."],
    signs: ["Shoulders fail to deliver with routine axial traction after the head.", "Need for additional obstetric manoeuvres."],
    red: [
      "Head-to-body interval approaching or above 5 minutes.",
      "Failed first-line manoeuvres.",
      "Excessive traction on the fetal head, fundal pressure or downward traction.",
      "Postpartum haemorrhage after delivery (uterine atony in about 11%) and third- or fourth-degree tear (3.8%).",
    ],
    precip: ["Fetal macrosomia, maternal obesity, diabetes, increased maternal age, previous shoulder dystocia.", "Prolonged first or second stage, assisted vaginal delivery, post-term pregnancy.", "Risk factors have low predictive value and are not independent."],
    diffs: [
      { condition: "Anterior shoulder impaction", distinguishingFeatures: "Commonest form; shoulder caught on the symphysis pubis." },
      { condition: "Posterior shoulder impaction", distinguishingFeatures: "Less often the posterior shoulder catches on the sacral promontory." },
    ],
    criteria: [
      { criterion: "Definition", threshold: "Cephalic delivery requiring additional obstetric manoeuvres to release the shoulders after gentle downward traction fails." },
      { criterion: "Timing risk", threshold: "Significant hypoxic injury risk is small when the head-to-body interval is under 5 minutes; cord pH falls about 0.04 per minute." },
    ],
    rule_in: [
      inv("Head-to-body interval", "Time from head to body delivery", "Hypoxic risk", "Interval approaching or above 5 minutes", "Record time of head and body delivery; cord pH falls about 0.04 per minute.", "Under 5 minutes with a well fetus", sdg("p. 2"), "specializedAdjunctive"),
      inv("Paired umbilical cord blood gases", "Fetal acid-base status", "Acidaemia", "Falling pH; resuscitation harder below pH 7", "Take after birth and record.", "Above pH 7 (source threshold); typical term arterial range about 7.2–7.3", sdg("pp. 2, 6"), "laboratory"),
      inv("Apgar score", "Neonatal condition", "Birth asphyxia", "Low score", "Record with the paired cord gases.", "Score 7–10 is typical", sdg("p. 6"), "specializedAdjunctive"),
      inv("Neonatal examination for brachial plexus injury", "Upper limb movement", "Erb's or Klumpke's palsy", "Reduced arm movement", "Erb's palsy recovers in up to 90% by 12 months; Klumpke's about 40%; refer for follow-up.", "Symmetrical arm movement", sdg("pp. 2–3"), "specializedAdjunctive"),
      inv("Maternal blood loss and perineal examination", "Maternal trauma", "Postpartum haemorrhage and third- or fourth-degree tear", "Heavy bleeding or sphincter injury", "Anticipate haemorrhage and repair trauma.", "Blood loss within local normal limits", sdg("pp. 2, 6"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Documentation proforma check", "Record completeness", "Medicolegal and safety record", "Missing times or manoeuvres", "Complete the shoulder dystocia proforma with staff present, manoeuvres in sequence with times, Apgar score, cord gases and parental explanation.", "All items recorded", sdg("p. 6; checklist p. 7"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "call", title: "Call for help and stop pushing", timeframe: "Immediately", actions: [
        "Use the hospital's obstetric and neonatal emergency call.",
        "Summon additional midwives, an obstetrician, a senior neonatologist, a neonatal midwife or nurse and an anaesthetist.",
        "Appoint a leader and one timekeeper; discourage maternal pushing.",
      ] },
      { id: "first-line", title: "First-line manoeuvres", timeframe: "Within the first minutes", actions: [
        "McRoberts' manoeuvre: flat supine, buttocks at the bed end, thighs flexed onto the abdomen.",
        "Suprapubic pressure: continuous from the back of the anterior shoulder; try a rocking motion if continuous pressure fails.",
        "Routine axial traction only.",
        "Consider episiotomy at any stage; check a whole hand can enter the sacral hollow.",
      ] },
      { id: "second-line", title: "Internal and positional manoeuvres", timeframe: "If first-line fails", actions: [
        "Posterior arm delivery: hand into the sacral hollow, rotate to an oblique position, sweep the posterior arm across the chest.",
        "Roll the woman onto all fours if mobile; internal manoeuvres can be done in this position.",
        "Repeat earlier steps if needed.",
      ] },
      { id: "last-resort", title: "Last resort", timeframe: "When all else fails", actions: ["Cleidotomy (clavicle fracture), Zavanelli manoeuvre (cephalic replacement and caesarean section) or symphysiotomy.", "Never use excessive force or traction on the head, fundal pressure or downward traction."] },
      { id: "after", title: "After delivery", timeframe: "Immediately after", actions: [
        "Neonatal team assessment; take paired cord gases and record the Apgar score.",
        "Anticipate postpartum haemorrhage; assess and repair maternal trauma.",
        "Complete the proforma; explain events to the parents; submit the incident report.",
      ] },
    ],
    meds: noDrug("No medicine is prescribed in the opened guideline for shoulder dystocia itself. Use the local postpartum haemorrhage protocol if bleeding occurs."),
    teach: teachOf([
      { ref: SDG, edition: "NHS Lanarkshire shoulder dystocia guideline 2022, pp. 1–7", locator: "pp. 1–7; checklist p. 7" },
    ], ["Perform manoeuvres in a structured order.", "Document and debrief; anticipate neonatal and maternal complications."],
      ["Head-to-body interval under 5 minutes keeps hypoxic injury risk small.", "Fundal pressure and downward traction are inappropriate.", "Postpartum haemorrhage follows in about 11%."],
      ["Excessive traction on the head.", "Delay in calling the full team.", "Incomplete documentation."]),
    edu: ["Explain to parents what happened, the manoeuvres used and any risk of arm weakness.", "Explain follow-up for the baby and the mother."],
    life: ["Postnatal care as for any traumatic delivery, with perineal care advice."],
    mdt: ["Obstetrics; midwifery; neonatology; anaesthesia; physiotherapy or paediatric follow-up for brachial plexus injury; risk management."],
    discharge: ["Mother and baby stable; baby examined by neonatal team; documentation complete and parents informed."],
    follow: "Postnatal review for perineal trauma; paediatric follow-up for any brachial plexus injury; risk review of the event.",
  },
  {
    key: "status-epilepticus", draftTitle: "Status Epilepticus and Acute Seizures: ED Stabilisation", pillar: "Urgent Care", authority: "NICE",
    scope: "Adult convulsive status epilepticus in the emergency department (ED): airway and glucose, benzodiazepine, second-line and refractory therapy, using NICE NG217, the American Epilepsy Society guideline and the Neurocritical Care Society guideline.",
    unverified: [
      "NICE NG217 section 7 gives timing and drug order but no doses; doses come from the Neurocritical Care Society 2012 and American Epilepsy Society 2016 guidelines.",
      "The Saudi adapted guideline for paediatric convulsive status epilepticus was found but is paediatric and was not used; no Saudi adult guideline was opened.",
      "Pregnancy-specific advice was not found in the opened NG217 section; for eclampsia use the pre-eclampsia pathway.",
      "Thiamine and dextrose doses are not given in the opened sources.",
      "SFDA registration of fosphenytoin, levetiracetam IV, valproate IV and lacosamide was not verified.",
      "Non-convulsive status epilepticus management was not covered in the opened sources.",
    ],
    mech: [
      "Convulsive status epilepticus is seizure activity lasting 5 minutes or more (NG217).",
      "Airway, gas exchange, glucose and blood pressure need active management from the first minutes (NCS Table 5).",
      "A benzodiazepine is first-line treatment and is repeated once if the seizure continues (NG217, AES).",
      "Refractory status epilepticus persists after first- and second-line therapy and needs anaesthetic control under continuous electroencephalogram (EEG) monitoring.",
    ],
    symptoms: ["Tonic-clonic movements lasting 5 minutes or more.", "Repeated seizures without recovery between them."],
    signs: ["Altered consciousness, cyanosis, tongue injury.", "Hypoglycaemia, hypoxia or hypotension on first check."],
    red: [
      "Seizure lasting 5 minutes or more.",
      "No response to two benzodiazepine doses.",
      "Airway or gas exchange compromise, systolic blood pressure below 90 mmHg or mean arterial pressure below 70 mmHg.",
      "Suspected meningitis, encephalitis or raised intracranial pressure.",
      "Pregnancy: treat as eclampsia with magnesium sulfate.",
    ],
    precip: ["Known epilepsy with missed medicine.", "Hypoglycaemia or metabolic disturbance.", "Infection, stroke, tumour, trauma.", "Alcohol or drug withdrawal or toxicity."],
    diffs: [
      { condition: "Hypoglycaemia", distinguishingFeatures: "Fingerstick glucose at 0–2 minutes; give thiamine before dextrose." },
      { condition: "Non-convulsive status epilepticus", distinguishingFeatures: "Altered mental state without convulsion; continuous EEG within 1 hour of suspicion." },
      { condition: "Eclampsia", distinguishingFeatures: "Pregnancy with severe hypertension; use magnesium sulfate." },
    ],
    criteria: [
      { criterion: "Convulsive status epilepticus", threshold: "Seizures lasting 5 minutes or more (NG217)." },
      { criterion: "Second benzodiazepine dose", threshold: "If seizure has not stopped 5 to 10 minutes after the first dose (NG217)." },
      { criterion: "Definitive control", threshold: "Establish within 60 minutes of onset (NCS)." },
    ],
    rule_in: [
      inv("Fingerstick glucose", "Blood glucose", "Hypoglycaemia", "Low glucose", "Check at 0–2 minutes; give thiamine before dextrose.", "Typical fasting adult 3.9–5.6 mmol/L; treat low values immediately", ncs("Table 5"), "laboratory"),
      inv("Continuous EEG", "Electrical seizure activity", "Non-convulsive seizures and treatment endpoint", "Ongoing electrographic seizures", "Start within 1 hour of suspected status; at least 48 hours in comatose patients; guides anaesthetic titration.", "No electrographic seizures", ncs("Table 10; Table 11"), "specializedAdjunctive"),
      inv("Head computed tomography (CT)", "Structural cause", "Mass, haemorrhage, trauma", "Structural lesion", "Do in most cases once stabilised; do not delay seizure treatment.", "No acute lesion", ncs("Table 3"), "advancedImaging"),
    ],
    rule_out: [
      inv("Full blood count, basic metabolic panel, total and ionised calcium, magnesium", "Metabolic and haematological cause", "Provoked seizure", "Electrolyte or calcium disturbance, infection", "Send at 5 minutes; correct abnormalities.", "Within the reporting laboratory's adult reference ranges", ncs("Table 3"), "laboratory"),
      inv("Antiseizure medicine level", "Drug adherence", "Missed doses", "Subtherapeutic level", "Guides cause; clinical and EEG findings, not levels, guide therapy.", "Within the laboratory's therapeutic range", ncs("Table 3"), "laboratory"),
      inv("Lumbar puncture and toxicology (selected cases)", "Infection and toxins", "Meningitis, encephalitis, toxic cause", "Positive cerebrospinal fluid or toxicology", "Consider by presentation within 60 minutes.", "Normal cerebrospinal fluid; negative toxicology", ncs("Table 3; Table 5"), "laboratory"),
    ],
    steps: [
      { id: "stabilise", title: "Stabilise", timeframe: "0–5 minutes", actions: ["Position the airway, give oxygen, check vital signs and fingerstick glucose at 0–2 minutes; obtain IV access by 5 minutes.", "Intubate within 0–10 minutes if the airway or gas exchange is compromised or raised intracranial pressure is suspected.", "Give thiamine before dextrose if hypoglycaemic."] },
      { id: "first-line", title: "First-line benzodiazepine", timeframe: "Immediately at 5 minutes", actions: ["IV lorazepam 4 mg (0.1 mg/kg, maximum 4 mg per dose), repeat once in 5–10 minutes; or IM midazolam 10 mg; or IV diazepam 10 mg (0.15 mg/kg), repeat once.", "Give an adequate single full dose, not split small doses.", "Without IV access: IM midazolam, or buccal or rectal options per local protocol."] },
      { id: "second-line", title: "Second-line antiseizure medicine", timeframe: "From 5–10 minutes after the first benzodiazepine dose (NCS); AES second therapy starts at 20 minutes", actions: ["If two benzodiazepine doses fail, give levetiracetam, phenytoin or sodium valproate IV; levetiracetam may be quicker and have fewer adverse effects.", "Levetiracetam 1,000–3,000 mg IV; valproate 20–40 mg/kg IV; phenytoin 20 mg/kg IV with cardiac monitoring; phenobarbital 20 mg/kg IV if none available."] },
      { id: "refractory", title: "Refractory status epilepticus", timeframe: "20–60 minutes after the second drug", actions: ["Seek expert guidance; consider an alternative second-line drug or phenobarbital or general anaesthesia (NG217).", "NCS infusions: midazolam bolus 0.2 mg/kg then 0.05–2 mg/kg per hour, or propofol 1–2 mg/kg load then 30–200 µg/kg per minute.", "Admit to the intensive care unit (ICU) with continuous EEG; titrate to EEG endpoints."] },
      { id: "cause", title: "Find the cause", timeframe: "Within 60 minutes", actions: ["Send blood tests, consider head CT, lumbar puncture and toxicology by presentation.", "Treat the cause; consider vasopressors if systolic pressure is below 90 mmHg."] },
    ],
    meds: {
      status: "source-verified",
      note: "NICE NG217 gives the drug order but no doses; doses are from the Neurocritical Care Society 2012 (Table 7, Table 8) and the American Epilepsy Society 2016 guideline. Adult doses only. SFDA registration was not verified; check hospital formulary.",
      regimens: [
        reg({ indication: "First-line for status epilepticus", patientGroup: "Adults", genericName: "Lorazepam", dose: "0.1 mg/kg, maximum 4 mg per dose (4 mg in AES)", route: "IV", frequency: "Repeat once after 5–10 minutes (NG217 5–10 minutes; AES once)", duration: "Two doses at most before second-line", adjustments: ["Maximum rate 2 mg per minute; dilute 1:1 with saline."], monitoring: ["Respiratory rate, oxygen saturation, blood pressure."], contraindications: ["Respiratory depression risk; contraindications not listed in the source."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7" }),
        reg({ indication: "First-line when IV access is not available", patientGroup: "Adults", genericName: "Midazolam", dose: "0.2 mg/kg, maximum 10 mg (10 mg in AES)", route: "IM", frequency: "Single dose; AES: not repeated", duration: "Single dose", adjustments: ["AES: single full dose, not split."], monitoring: ["Respiratory rate, oxygen saturation, blood pressure."], contraindications: ["Respiratory depression risk; contraindications not listed in the source."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7; AES 2016 initial therapy" }),
        reg({ indication: "First-line alternative", patientGroup: "Adults", genericName: "Diazepam", dose: "0.15 mg/kg, maximum 10 mg (10 mg in AES)", route: "IV", frequency: "Repeat once in 5 minutes", duration: "Two doses at most before second-line", adjustments: ["Maximum rate 5 mg per minute."], monitoring: ["Respiratory rate, oxygen saturation, blood pressure."], contraindications: ["Respiratory depression risk; contraindications not listed in the source."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7" }),
        reg({ indication: "Second-line after two benzodiazepine doses", patientGroup: "Adults", genericName: "Levetiracetam", dose: "1,000–3,000 mg", route: "IV", frequency: "Single loading dose", duration: "Single loading dose", adjustments: ["Infusion 2–5 mg/kg per minute; off-label in this use as of April 2022 per NG217."], monitoring: ["Seizure control, level of consciousness."], contraindications: ["Contraindications not listed in the source; check product information."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7; NICE NG217 section 7" }),
        reg({ indication: "Second-line after two benzodiazepine doses", patientGroup: "Adults", genericName: "Sodium valproate", dose: "20–40 mg/kg", route: "IV", frequency: "Single loading dose; additional 20 mg/kg if needed", duration: "Single loading dose", adjustments: ["Infusion 3–6 mg/kg per minute; follow MHRA valproate safety advice for people who may become pregnant (NG217)."], monitoring: ["Seizure control, liver function."], contraindications: ["Valproate safety advice for people who could become pregnant; other contraindications not listed in the source."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7; NICE NG217 section 7" }),
        reg({ indication: "Second-line after two benzodiazepine doses", patientGroup: "Adults", genericName: "Phenytoin", dose: "20 mg/kg", route: "IV", frequency: "Single loading dose; further 5–10 mg/kg if needed", duration: "Single loading dose", adjustments: ["Infusion up to 50 mg per minute; fosphenytoin 20 mg PE/kg up to 150 mg PE/min is the alternative."], monitoring: ["Cardiac monitoring required."], contraindications: ["Contraindications not listed in the source; check product information."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7" }),
        reg({ indication: "Third-line or second-line if others unavailable", patientGroup: "Adults", genericName: "Phenobarbital", dose: "20 mg/kg (18 mg/kg in the VA trial)", route: "IV", frequency: "Single loading dose; further 5–10 mg/kg if needed", duration: "Single loading dose", adjustments: ["Infusion 50–100 mg per minute."], monitoring: ["Respiratory rate, blood pressure."], contraindications: ["Contraindications not listed in the source; check product information."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 7; AES 2016 initial therapy" }),
        reg({ indication: "Refractory status epilepticus (ICU)", patientGroup: "Intubated adults", genericName: "Midazolam infusion", dose: "Bolus 0.2 mg/kg at 2 mg/min, then 0.05–2 mg/kg per hour", route: "IV", frequency: "Continuous infusion", duration: "Titrate to EEG endpoint; maintain 24–48 hours of electrographic control before weaning", adjustments: ["Increase by 0.05–0.1 mg/kg per hour every 3–4 hours."], monitoring: ["Continuous EEG; haemodynamics."], contraindications: ["Contraindications not listed in the source; check product information."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 8" }),
        reg({ indication: "Refractory status epilepticus (ICU)", patientGroup: "Intubated adults", genericName: "Propofol", dose: "Loading 1–2 mg/kg then 30–200 µg/kg per minute", route: "IV", frequency: "Continuous infusion", duration: "Titrate to EEG endpoint", adjustments: ["Use care above 80 µg/kg per minute for more than 48 hours."], monitoring: ["Continuous EEG; haemodynamics."], contraindications: ["Contraindications not listed in the source; check product information."], src: NCS, edition: "NCS status epilepticus guideline 2012, Table 8" }),
      ],
    },
    comparison: {
      title: "First-line benzodiazepine: NICE NG217 versus AES 2016 versus NCS 2012",
      columns: ["NICE NG217", "AES 2016", "NCS 2012"],
      rows: [
        { parameter: "Options", values: ["IV lorazepam if IV access; otherwise buccal midazolam or rectal diazepam.", "IM midazolam, IV lorazepam or IV diazepam (all Level A).", "IV lorazepam (drug of choice IV) or IM midazolam (drug of choice IM)."] },
        { parameter: "Repeat dose", values: ["Second dose if not stopped within 5 to 10 minutes.", "Lorazepam and diazepam once; midazolam IM not repeated.", "Lorazepam may repeat in 5–10 minutes; diazepam in 5 minutes."] },
        { parameter: "Doses", values: ["None stated.", "Midazolam 10 mg IM; lorazepam 4 mg IV; diazepam 10 mg IV.", "Lorazepam 0.1 mg/kg (max 4 mg); midazolam 0.2 mg/kg (max 10 mg); diazepam 0.15 mg/kg (max 10 mg)."] },
      ],
      note: "Shown side by side and not merged; follow the hospital protocol for which to use.",
    },
    teach: teachOf([
      { ref: NG217, edition: "NICE NG217, Section 7 (Treating status epilepticus)", locator: "Section 7" },
      { ref: AES, edition: "AES status epilepticus guideline 2016, Treatment algorithm", locator: "Treatment algorithm; initial therapy" },
      { ref: NCS, edition: "NCS status epilepticus guideline 2012, Tables 3, 5, 7, 8, 10, 11", locator: "Tables 3, 5, 7, 8, 10, 11" },
    ], ["Give a benzodiazepine at 5 minutes and escalate on time.", "Manage refractory status epilepticus with expert help and continuous EEG."],
      ["Treat at 5 minutes.", "Give adequate full doses.", "Aim for control within 60 minutes."],
      ["Underdosed benzodiazepine.", "Delay to second-line therapy.", "Withholding thiamine before dextrose."]),
    edu: ["Explain the event and cause to the patient and family; give written seizure advice.", "Advise on driving restrictions according to current Saudi guidance (not verified here)."],
    life: ["Avoid triggers such as sleep deprivation and alcohol; adhere to antiseizure medicine."],
    mdt: ["Neurology; critical care; emergency medicine; neurophysiology for EEG; pharmacy."],
    discharge: ["Disposition after status epilepticus is not specified in the opened sources; follow local policy and neurology advice.", "Seizure free, back to baseline and cause identified before any discharge decision."],
    follow: "Neurology follow-up; level and medicine review; discuss driving and safety advice.",
  },
  {
    key: "ssnhl", draftTitle: "Sudden Sensorineural Hearing Loss: Urgent Assessment and Steroid Therapy", pillar: "Urgent Care", authority: "Other",
    scope: "Adult sudden sensorineural hearing loss: separate conductive from sensorineural loss, avoid routine CT and laboratory tests, audiometry within 14 days, MRI or auditory brainstem response, steroid timing and salvage therapy, from the AAO-HNSF 2019 guideline.",
    unverified: [
      "The opened guideline text names the steroids tested (prednisone, prednisolone, methylprednisolone, dexamethasone) but does not give a dose, duration, taper or intratympanic concentration; the regimen must come from the treating ENT service.",
      "KAS 10 supporting text and the hyperbaric oxygen discussion were not read in full.",
      "No Saudi guideline was opened.",
      "SFDA registration of corticosteroids was not verified.",
    ],
    mech: [
      "Sudden sensorineural hearing loss is a sensorineural loss of 30 dB or more over at least 3 consecutive frequencies within 72 hours.",
      "Conductive loss must be distinguished first.",
      "Retrocochlear pathology can present as sudden loss, so MRI (most sensitive) or auditory brainstem response is used to look for it.",
      "Bilateral loss, recurrent episodes and focal neurological findings are modifying factors that change the work-up.",
      "Corticosteroids are an option within 2 weeks of onset; therapy after 2 weeks is salvage.",
    ],
    symptoms: ["Sudden hearing loss in one or both ears developing within up to 72 hours.", "Tinnitus."],
    signs: ["Focal neurological findings if present.", "Bilateral involvement if present."],
    red: ["Bilateral sudden hearing loss.", "Recurrent episodes.", "Focal neurological findings: urgent medical and imaging assessment.", "Onset more than 2 weeks ago: the initial-steroid window has passed (any later therapy is salvage)."],
    precip: ["Specific history or examination findings that point to a cause and justify targeted tests."],
    diffs: [
      { condition: "Conductive hearing loss", distinguishingFeatures: "Distinguish at first presentation; treated differently." },
      { condition: "Retrocochlear pathology", distinguishingFeatures: "Detected by MRI or auditory brainstem response." },
      { condition: "Bilateral, recurrent or focal neurological presentation", distinguishingFeatures: "Modifying factors that change the work-up and call for urgent medical assessment." },
    ],
    criteria: [
      { criterion: "SSNHL", threshold: "30 dB or more loss at 3 or more consecutive frequencies within 72 hours." },
      { criterion: "Audiometry", threshold: "As soon as possible and within 14 days of onset (KAS 4)." },
      { criterion: "Initial steroids", threshold: "Offer within 2 weeks of onset (KAS 8, option)." },
      { criterion: "Intratympanic salvage", threshold: "Incomplete recovery 2 to 6 weeks after onset (KAS 10)." },
    ],
    rule_in: [
      inv("Pure-tone audiometry", "Hearing thresholds", "Sensorineural hearing loss", "30 dB or more loss at 3 or more consecutive frequencies", "Confirms SSNHL; obtain as soon as possible within 14 days of onset.", "Thresholds within normal limits", shl("Table 4, KAS 4"), "specializedAdjunctive"),
      inv("Magnetic resonance imaging (MRI)", "Retrocochlear structures", "Retrocochlear pathology", "Retrocochlear lesion", "Most sensitive option; guideline gives no specific timeline.", "No retrocochlear lesion", shl("Table 4, KAS 6"), "advancedImaging"),
      inv("Auditory brainstem response (ABR)", "Retrocochlear function", "Retrocochlear pathology", "Abnormal waveform", "Alternative to MRI when MRI is unavailable or contraindicated.", "Normal wave latencies", shl("Table 4, KAS 6"), "specializedAdjunctive"),
    ],
    rule_out: [
      inv("Routine head computed tomography (CT)", "Structural lesion", "Not indicated routinely", "Not applicable", "Strong recommendation against routine CT in the initial evaluation.", "Not ordered routinely", shl("Table 4, KAS 3"), "advancedImaging"),
      inv("Routine laboratory tests", "Systemic cause", "Not indicated routinely", "Not applicable", "Strong recommendation against; order targeted tests only when history or examination points to a cause.", "Not ordered routinely", shl("Table 4, KAS 5"), "laboratory"),
      inv("Follow-up audiometry", "Hearing recovery", "Treatment response", "Recovery or residual loss", "Obtain at the end of treatment and within 6 months after treatment.", "Return to baseline thresholds", shl("Table 4, KAS 12"), "specializedAdjunctive"),
    ],
    steps: [
      { id: "distinguish", title: "Distinguish sensorineural from conductive", timeframe: "At first presentation", actions: ["Establish whether the loss is sensorineural or conductive.", "Look for bilateral loss, recurrent episodes and focal neurological findings."] },
      { id: "tests", title: "Order the right tests only", timeframe: "As soon as possible, within 14 days", actions: ["Do not order routine head CT or routine laboratory tests.", "Obtain audiometry within 14 days of onset.", "Evaluate for retrocochlear pathology with MRI (most sensitive) or auditory brainstem response."] },
      { id: "counsel", title: "Counsel", timeframe: "At the first visit", actions: ["Explain the natural history, benefits and risks of treatment and the limits of the evidence."] },
      { id: "steroids", title: "Steroid therapy", timeframe: "Within 2 weeks of onset", actions: ["Offer corticosteroids as initial therapy within 2 weeks of onset; the regimen is chosen by the ENT service because the guideline text opened gives no dose.", "Hyperbaric oxygen with steroids is an option within 2 weeks, or as salvage within 1 month."] },
      { id: "salvage", title: "Salvage and follow-up", timeframe: "2–6 weeks", actions: ["If recovery is incomplete 2 to 6 weeks after onset, offer or refer for intratympanic steroids.", "Do not routinely prescribe antivirals, thrombolytics, vasodilators or vasoactive substances.", "Follow-up audiometry at the end of treatment and within 6 months; counsel about audiologic rehabilitation for residual loss or tinnitus."] },
    ],
    meds: localDrug("The AAO-HNSF text opened lists prednisone, prednisolone, methylprednisolone and dexamethasone as systemic steroids and notes a 10- to 14-day course has minimal Cushing-like effect, but gives no dose, taper or intratympanic concentration. The treating ENT service sets the regimen. SFDA registration was not verified; check hospital formulary."),
    teach: teachOf([
      { ref: SHL, edition: "AAO-HNSF Sudden Hearing Loss guideline 2019, Table 4, KAS 1–13", locator: "Table 4, KAS 1–13; pp. S8, S20–S21" },
    ], ["Apply the thirteen key action statements in order.", "Time audiometry and steroid therapy."],
      ["Audiometry within 14 days.", "No routine CT or laboratory tests.", "Steroids within 2 weeks; intratympanic salvage at 2–6 weeks."],
      ["Ordering routine CT.", "Missing the 2-week steroid window.", "Using antivirals or vasodilators routinely."]),
    edu: ["Explain the chance of recovery and limits of evidence.", "Report new neurological symptoms immediately."],
    life: ["Protect hearing from loud noise; manage tinnitus with counselling."],
    mdt: ["ENT; audiology; neurology if focal findings; rehabilitation and hearing-aid services."],
    discharge: ["Audiometry arranged or done, steroid decision made and recorded, and follow-up booked."],
    follow: "Audiometry at the end of treatment and within 6 months; audiologic rehabilitation for residual loss or tinnitus.",
  },
];
