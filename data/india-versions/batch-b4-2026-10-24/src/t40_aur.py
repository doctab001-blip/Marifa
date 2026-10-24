from h import *
AR = "sections Definition, Causes, Risk factors, History, Examination, Investigations, Catheterisation, Catheter care, Drugs, Trial without catheter, Referral, Complications"
TM = "sections 2, 5.1, 5.5, 5.6, 8.4, 8.6, 8.7"
TITLE = "Acute urinary retention in men (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Urology / Emergency Medicine / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Men with acute urinary retention (AUR) in India: causes, safe catheterisation at primary and community level, alpha-blocker before a trial without catheter (TWOC), complications and urology referral. Built on the ICMR Acute Urinary Retention in Men workflow (November 2025), with the tamsulosin dose from its US label.",
 findings=[
  "Definition, obstructive and detrusor causes, spontaneous and precipitated risk factors, drugs that precipitate retention, history, examination including digital rectal and neurological examination, investigations, 12–14 Fr Foley catheterisation, catheter care, alpha-blocker for 2–4 days, TWOC after 1–3 days, complications and referral checked against the ICMR AUR STW (November 2025).",
  "Tamsulosin dose and cautions from the US label because the ICMR STW gives no alpha-blocker dose.",
  "Not clinically reviewed."],
 unverified=[
  "Monitoring thresholds for post-obstructive diuresis are not given in the ICMR STW.",
  "Analgesic doses for catheter-related bladder spasm are not given.",
  "Alfuzosin and silodosin were not dose-checked for this indication."],
 summary="Acute urinary retention is the sudden, painful inability to pass urine despite a full bladder. In men the commonest cause is benign prostatic hyperplasia (BPH); others include urethral stricture, stones, prostatitis, prostate cancer and faecal impaction, or a weak detrusor from diabetes, neurological disease, surgery or drugs (ICMR STW). Retention is often precipitated by anaesthesia, cold, a long journey, alcohol, diuretics or anticholinergic and sympathomimetic drugs. Treatment is prompt catheter drainage — no investigation is needed first — followed by an alpha-blocker and a trial without catheter (ICMR STW).",
 mechanisms=[
  "Prostatic enlargement or urethral narrowing obstructs outflow.",
  "Alpha-adrenergic tone in the prostate and bladder neck adds dynamic obstruction; alpha-blockers relax it.",
  "Anticholinergics, opioids, alcohol, cold and over-distension weaken detrusor contraction.",
  "Sudden decompression can cause haematuria and post-obstructive diuresis with electrolyte loss."],
 presentation={
  "symptoms": ["Sudden painful inability to pass urine (ICMR STW)", "Prior weak stream, hesitancy, frequency (lower urinary tract symptoms)", "Fever, weight loss, leg weakness or numbness (ICMR STW history)"],
  "physicalSigns": ["Tender, enlarged, palpable bladder, dull to percussion (ICMR STW)", "Phimosis, meatal stenosis, urethral induration, stone or discharge (ICMR STW)", "Enlarged, hard or tender prostate; faecal impaction on rectal examination (ICMR STW)", "Reduced anal tone or perianal sensation (ICMR STW neurological examination)"],
  "redFlags": ["Fever or urinary tract infection (ICMR STW complication)", "Rising creatinine: acute kidney injury (AKI) (ICMR STW)", "Leg weakness, saddle numbness or lost anal tone: spinal cord or cauda equina cause", "Failed urethral catheterisation: urologist (ICMR STW)"],
  "precipitants": ["Surgery under general or regional anaesthesia (ICMR STW)", "Long journey, cold exposure (ICMR STW)", "Opioids, anticholinergics, antihistamines, antidiarrhoeals, sympathomimetics, diuretics, alcohol (ICMR STW)", "Faecal impaction, urinary tract infection (ICMR STW)"]},
 differentials=[
  ("Chronic retention with overflow", "Painless, large residual volume, often raised creatinine."),
  ("Urethral stricture", "Catheter will not pass; history of trauma or infection (ICMR STW)."),
  ("Acute prostatitis", "Fever, very tender prostate (ICMR STW)."),
  ("Neurogenic bladder", "Reduced anal tone, perianal sensory loss, abnormal bulbocavernosus reflex (ICMR STW)."),
  ("Anuria from kidney failure", "Bladder not palpable and empty on ultrasound.")],
 criteria=[
  ("AUR (ICMR STW)", "Sudden, painful inability to void despite a full bladder."),
  ("Catheterise first (ICMR STW)", "No investigation is needed before catheterisation; record the volume drained."),
  ("Trial without catheter (ICMR STW)", "Keep the catheter at least 1 day and usually 1–3 days; alpha-blocker for 2–4 days first in men with no previous retention."),
  ("Admit (ICMR STW)", "Significant comorbidities or complications such as urinary tract infection or acute kidney injury.")],
 ruleIn=[
  inv("firstLineImaging", "Ultrasound kidneys, ureters and bladder (KUB)", "Ultrasound", "Bladder volume, hydronephrosis, prostate size", "Bladder empties; no hydronephrosis", "Distended bladder; hydronephrosis; enlarged prostate", "Desirable test (ICMR STW).", "aur", AR),
  inv("laboratory", "Volume drained by catheter", "Measured on catheterisation", "Confirms retention", "Normal bladder capacity about 400–500 mL", "Large residual volume", "Record the volume drained (ICMR STW).", "aur", AR),
  inv("laboratory", "Serum creatinine and electrolytes", "Blood tests", "Acute kidney injury; post-obstructive diuresis", "Creatinine 0.6–1.2 mg/dL; sodium 135–145 mmol/L; potassium 3.5–5.0 mmol/L", "Raised creatinine; electrolyte disturbance", "Desirable; AKI is an admission criterion (ICMR STW).", "aur", AR)],
 ruleOut=[
  inv("laboratory", "Urinalysis and urine culture of drained urine", "Urine tests", "Urinary tract infection", "No pus cells; no growth", "Pyuria; bacterial growth", "Desirable (ICMR STW).", "aur", AR),
  inv("laboratory", "Complete blood count and blood glucose", "Blood tests", "Infection; diabetes", "White cells 4–11 ×10⁹/L; random glucose under 140 mg/dL", "Leucocytosis; hyperglycaemia", "Desirable; diabetes causes detrusor failure (ICMR STW).", "aur", AR),
  inv("specializedAdjunctive", "Cystoscopy, computed tomography (CT) or magnetic resonance imaging (MRI), urethrogram, urodynamics", "Specialist tests", "Stricture, tumour, neurogenic bladder", "Normal", "Stricture or other cause", "Specialist only; not routine (ICMR STW).", "aur", AR)],
 management=[
  step("drain", "Drain the bladder", "Immediately", ["Gentle urethral catheterisation with a 12 or 14 Fr Foley catheter, aseptic technique and plenty of lubricant (ICMR STW).", "Do not delay for investigations; record volume drained (ICMR STW).", "Urethral catheter fails: refer to a urologist; suprapubic cystostomy only if trained (ICMR STW)."]),
  step("after", "After drainage", "First 24 hours", ["Watch for haematuria and post-obstructive diuresis with electrolyte disturbance (ICMR STW complications).", "Treat precipitants: stop offending drugs, relieve constipation, treat infection (ICMR STW).", "Bladder spasm: counsel, analgesia, check the catheter drains; change only if blocked (ICMR STW)."]),
  step("twoc", "Alpha-blocker and trial without catheter", "Day 1–3", ["No previous retention: alpha-blocker for 2–4 days, then remove the catheter for a TWOC (ICMR STW).", "Keep the catheter at least 1 day (ICMR STW)."]),
  step("refer", "Admit or refer", "When indicated", ["Admit for significant comorbidity, infection or acute kidney injury (ICMR STW).", "Refer failed TWOC, recurrent retention, suspected cancer, stricture or neurological cause to urology."])],
 branches=[("Before trial without catheter", "First episode of AUR, no previous retention (ICMR STW).")],
 regimens=[
  rx("Before trial without catheter", "Alpha-blocker", "AUR due to BPH before TWOC", "Adult men", "Tamsulosin", "0.4 mg", "Oral", "Once daily, about 30 minutes after the same meal", "2–4 days before TWOC (ICMR STW); continue if TWOC succeeds and BPH symptomatic", "Not indicated in children (label 8.4).", NOT_ABX, "No dose change; end-stage kidney disease not studied (label 8.6).", "No change in moderate impairment; severe not studied (label 8.7).", ["Postural dizziness, falls"], ["Postural hypotension (label 5.1)", "Cataract surgery planned: tell the surgeon (floppy iris, label 5.5)", "Serious sulfa allergy: caution (label 5.6)"], "tams", TM)],
 medNote="The ICMR STW recommends an alpha-blocker for 2–4 days before TWOC but gives no drug or dose; tamsulosin dosing is from its US label. Avoid drugs that precipitate retention (ICMR STW). Not clinically reviewed.",
 teaching={"scope": "Acute urinary retention in men.", "learningObjectives": ["Catheterise safely without delay.", "Find and remove precipitants.", "Plan alpha-blocker and trial without catheter."],
  "keyPoints": ["Catheterise first; investigate after.", "12–14 Fr Foley, aseptic and well lubricated.", "Alpha-blocker 2–4 days, catheter 1–3 days, then TWOC.", "Check drugs: anticholinergics, opioids, antihistamines."],
  "pitfalls": ["Forcing a catheter against resistance (stricture).", "Missing faecal impaction.", "Missing a spinal cause.", "Ignoring post-obstructive diuresis."],
  "references": [tref("aur", AR), tref("tams", TM)]},
 nonClinical={"patientEducation": ["Avoid cold medicines and antihistamines that can cause retention.", "Do not hold urine for long periods; avoid excess alcohol.", "Keep the catheter bag below bladder level; drink enough fluid."], "lifestyleAndDiet": ["Prevent constipation", "Spread fluids through the day"], "mdtReferrals": ["Urology for failed catheterisation, failed TWOC or recurrent retention (ICMR STW)", "Neurology for neurological causes"], "dischargeCriteria": ["Bladder drained, no infection or kidney injury", "Catheter care taught", "TWOC date planned"], "followUpPlan": "TWOC after 1–3 days with alpha-blocker cover (ICMR STW); urology review for prostate assessment."})
save("t40_aur.json", [T])
