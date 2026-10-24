from h import *
PC = "section At primary care: moderate/severe depression"
SC = "section Broad management plans at secondary care"
SP = "section Special population"
PAED_FLX = "Adolescents: fluoxetine 20–40 mg/day; watch for switch, activation and suicidality (ICMR STW)."
PAED_REF = "Children and adolescents: refer to secondary care; adolescents use fluoxetine (ICMR STW)."
T = topic(
 id="aabf2fc2-f10c-59fb-99c8-c8ce792404cb",
 title="Depression and suicide-risk assessment (India)",
 specialty="Psychiatry / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Adults (with notes for adolescents, older adults and pregnancy) with depression in Indian primary and secondary care, including suicide-risk assessment, built on the ICMR Depression workflow (October 2019).",
 findings=[
  "Core and additional symptoms, severity grading, depressive cognitions, suicide-risk elements, medical and drug causes to exclude, investigations, primary-care management, drug choices and doses, secondary and tertiary referral and special populations checked against the ICMR Depression STW (October 2019).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow lists suicide-risk elements but no structured scoring tool; none is added.",
  "Renal and hepatic dose adjustments for antidepressants are not given in the workflow.",
  "Normal laboratory ranges are typical adult values."],
 summary="Depression is a common, recurrent illness of persistent low mood and loss of interest, with changes in sleep, appetite, energy, concentration and self-worth lasting at least 2 weeks (ICMR STW). Biological (monoamine and stress-axis dysregulation, genetic risk), psychological (negative cognitions of hopelessness, helplessness and worthlessness) and social stressors interact. Medical illness — hypothyroidism, diabetes, stroke, epilepsy, cancer, coronary and autoimmune disease — and drugs such as efavirenz, cyclophosphamide, dapsone and propranolol can cause or worsen it, so they must be excluded (ICMR STW). The gravest risk is suicide; every assessment includes suicidal thoughts, ideas, intent and immediate risk. Mild depression is managed with behavioural activation and counselling; moderate and severe depression with a selective serotonin reuptake inhibitor (SSRI), expecting improvement from week 2 and an adequate response by 6 weeks.",
 mechanisms=[
  "Monoamine and stress-hormone dysregulation affect mood, sleep and appetite.",
  "Negative cognitions (hopelessness, helplessness, worthlessness) maintain low mood.",
  "Medical illness and some drugs can cause depressive syndromes.",
  "Untreated severe depression carries a high suicide risk."],
 presentation={
  "symptoms": ["Depressed mood; loss of interest and enjoyment; easy fatigability (core) (ICMR STW)", "Poor concentration, low self-esteem, guilt, pessimism (ICMR STW)", "Disturbed sleep, reduced appetite (ICMR STW)", "Ideas or acts of self-harm or suicide (ICMR STW)"],
  "physicalSigns": ["Psychomotor slowing or agitation", "Weight loss", "Poor self-care", "Signs of an underlying medical cause (e.g. hypothyroidism)"],
  "redFlags": ["Immediate risk of a suicide attempt or active intent: urgent referral (ICMR STW)", "Psychotic symptoms, catatonia (ICMR STW)", "Depression in pregnancy, lactation, older adults, children or adolescents: refer (ICMR STW)", "No improvement after 4–6 weeks of first-line treatment (ICMR STW)"],
  "precipitants": ["Chronic medical illness: diabetes, stroke, epilepsy, cancer, coronary disease (ICMR STW)", "Drugs: efavirenz, zidovudine, cyclophosphamide, dapsone, ethambutol, anabolic steroids, propranolol (ICMR STW)", "Substance use", "Bereavement and life stress"]},
 differentials=[
  ("Bipolar disorder", "Past episodes of elevated mood; antidepressants may cause a switch (ICMR STW)."),
  ("Grief", "Clear bereavement; mood in waves tied to the loss (ICMR STW)."),
  ("Adjustment disorder", "Linked to a recent stressor, milder and time-limited (ICMR STW)."),
  ("Hypothyroidism", "Fatigue, weight gain, cold intolerance; raised TSH (ICMR STW)."),
  ("Substance use disorder", "Alcohol or drug use history; withdrawal features.")],
 criteria=[
  ("Diagnosis (ICMR STW)", "Symptoms for at least 2 weeks."),
  ("Severity (ICMR STW)", "Mild: 2 core + 2 additional. Moderate: 2 core + 3 or more additional. Severe: 3 core + 4 or more additional."),
  ("Suicide risk (ICMR STW)", "Assess suicidal thoughts, ideas, intent and immediate risk of an attempt at every visit."),
  ("Expected response (ICMR STW)", "Improvement from week 2; adequate response by 6 weeks; treat 6–9 months for a first episode, then taper.")],
 ruleIn=[
  inv("specializedAdjunctive", "Clinical interview: core and additional symptoms", "ICMR symptom count", "Depression and severity", "Fewer than 2 core symptoms", "2–3 core with 2–4 or more additional symptoms for 2 weeks", "Grades mild, moderate or severe (ICMR STW).", "dep", "sections Clinical diagnosis and Severity"),
  inv("specializedAdjunctive", "Suicide-risk assessment", "Thoughts, ideas, intent, immediate risk", "Suicide risk", "No suicidal thoughts", "Thoughts, plans, intent or immediate risk", "Immediate risk needs urgent referral (ICMR STW).", "dep", "section Assessment of suicide risk"),
  inv("laboratory", "Thyroid function test", "TSH", "Hypothyroidism", "TSH 0.4–4.0 mIU/L", "Raised TSH", "Rule out secondary medical cause (ICMR STW).", "dep", "section Investigation"),
  inv("laboratory", "Haemogram", "CBC", "Anaemia as cause of fatigue", "Haemoglobin 12–17 g/dL", "Low haemoglobin", "Routine investigation (ICMR STW).", "dep", "section Investigation"),
  inv("laboratory", "Serum sodium", "Electrolytes", "Baseline before SSRIs (hyponatraemia risk, especially in older adults)", "135–145 mEq/L", "Below 135 mEq/L", "Monitor in older adults on SSRIs (ICMR STW).", "dep", "sections Investigation and Special population")],
 ruleOut=[
  inv("specializedAdjunctive", "Electrocardiogram (ECG)", "12-lead ECG", "Cardiac safety before TCAs", "Normal QT and conduction", "Conduction delay or prolonged QT", "Investigation listed by ICMR; TCA overdose is dangerous (ICMR STW).", "dep", "section Investigation"),
  inv("laboratory", "Medication and substance review", "History", "Drug-induced depression; substance use", "No causative drugs", "Efavirenz, dapsone, propranolol, steroids or substance use", "Rule out drug causes (ICMR STW).", "dep", "section Rule out")],
 management=[
  step("assess", "Assess", "First visit", ["Confirm diagnosis and grade severity; assess suicide risk, depressive cognitions and family support (ICMR STW).", "Rule out bipolar disorder, grief and adjustment disorder; exclude medical and drug causes; check haemoglobin, TFT, ECG and sodium (ICMR STW)."]),
  step("mild", "Mild depression (primary care)", "First 4–6 weeks", ["Behavioural activation: activity monitoring, scheduling enjoyable activities, clear goals, attention to sleep, diet and hygiene (ICMR STW).", "Supportive psychotherapy or brief counselling with frequent follow-up (ICMR STW).", "If no improvement in 4–6 weeks, consider medication (ICMR STW)."]),
  step("moderate-severe", "Moderate or severe depression", "From diagnosis", ["Start an SSRI (escitalopram or fluoxetine); short-term clonazepam for sleep or anxiety, stopped after 2 weeks (ICMR STW).", "Watch for gastrointestinal bleeding, drug interactions and switch to mania (ICMR STW).", "If response at 2–4 weeks, continue 6–9 months, then taper (ICMR STW)."], [("No response after 4–6 weeks (secondary care)", ["Switch to venlafaxine, mirtazapine or a TCA; add CBT or problem-solving therapy; partial responders may be augmented with lithium or thyroxine (ICMR STW)."])]),
  step("refer", "Refer", "As needed", ["Secondary care: diagnostic difficulty, no improvement at 4–6 weeks, special populations, comorbid illness or substance use, suicide risk (ICMR STW).", "Tertiary care: no improvement on second line, immediate suicide risk, need for intensive psychotherapy, complex substance use (ICMR STW).", "Add electroconvulsive therapy for catatonia or suicidality; low-dose antipsychotic for psychotic symptoms (ICMR STW)."])],
 branches=[
  ("Moderate or severe depression — first line", "Adults with moderate or severe depression."),
  ("Sleep or anxiety symptoms", "Short-term adjunct during the first 2 weeks."),
  ("Non-responders — second line", "No improvement after 4–6 weeks of an SSRI (secondary care)."),
  ("Pregnancy and lactation", "Women who are pregnant, breastfeeding or planning conception."),
  ("Older adults", "Patients aged 60 and above.")],
 regimens=[
  rx("Moderate or severe depression — first line", "SSRI", "Moderate or severe depression", "Adults", "Escitalopram", "10–20 mg/day", "Oral", "Once daily", "6–9 months after response, then taper", PAED_REF, NOT_ABX, NS, NS, ["Suicidality early in treatment", "GI bleeding, drug interactions (ICMR STW)", "Switch to mania"], ["Bipolar disorder without mood stabiliser"], "dep", PC, sel="one-of", pref=True),
  rx("Moderate or severe depression — first line", "SSRI", "Moderate or severe depression", "Adults and adolescents", "Fluoxetine", "20–40 mg/day", "Oral", "Once daily", "6–9 months after response, then taper", PAED_FLX, NOT_ABX, NS, NS, ["Suicidality, activation", "Switch to mania"], ["Bipolar disorder without mood stabiliser"], "dep", PC, sel="one-of", pref=False, use="Adolescents, or escitalopram unsuitable (ICMR STW)."),
  rx("Sleep or anxiety symptoms", "Short-term benzodiazepine", "Sleep disturbance or anxiety", "Adults", "Clonazepam", "0.25–0.5 mg/day", "Oral", "Once daily", "Taper and stop after 2 weeks", PAED_REF, NOT_ABX, NS, NS, ["Sedation, dependence"], ["Substance use; respiratory disease"], "dep", PC),
  rx("Non-responders — second line", "Switch antidepressant", "No response to SSRI", "Adults", "Venlafaxine", "75–150 mg/day", "Oral", "Daily", "6–9 months after response", PAED_REF, NOT_ABX, NS, NS, ["BP", "Switch to mania"], ["Uncontrolled hypertension"], "dep", SC, sel="one-of", pref=True),
  rx("Non-responders — second line", "Switch antidepressant", "No response to SSRI", "Adults", "Mirtazapine", "30 mg/day", "Oral", "At night", "6–9 months after response", PAED_REF, NOT_ABX, NS, NS, ["Weight, sedation", "Overdose risk (ICMR STW)"], ["Overdose risk in suicidal patients"], "dep", SC, sel="one-of", pref=False, use="Prominent insomnia or poor appetite, or venlafaxine unsuitable."),
  rx("Non-responders — second line", "Switch antidepressant", "No response to SSRI", "Adults under 60", "Amitriptyline", "75–225 mg/day", "Oral", "Daily, usually at night", "6–9 months after response", PAED_REF, NOT_ABX, NS, NS, ["ECG", "Overdose risk (ICMR STW)"], ["Older adults (anticholinergic effects, ICMR STW)", "Recent myocardial infarction; overdose risk in suicidal patients"], "dep", SC, sel="one-of", pref=False, use="SNRI and mirtazapine unsuitable; not in older adults."),
  rx("Pregnancy and lactation", "Antidepressant", "Depression in pregnancy or lactation", "Pregnant or breastfeeding women", "Sertraline", "50 mg (lowest possible dose)", "Oral", "Once daily", "Specialist-guided; preconception counselling (ICMR STW)", "Not applicable.", NOT_ABX, NS, NS, ["Mood and suicidality", "Neonatal observation after delivery"], ["Use lowest effective dose (ICMR STW)"], "dep", SP),
  rx("Older adults", "Antidepressant", "Depression in older adults", "Patients aged 60 and above", "Escitalopram", "10–20 mg", "Oral", "Once daily", "6–9 months after response", "Not applicable.", NOT_ABX, NS, NS, ["Sodium (hyponatraemia) (ICMR STW)", "Falls"], ["Avoid TCAs in older adults (ICMR STW)"], "dep", SP, sel="one-of", pref=True),
  rx("Older adults", "Antidepressant", "Depression in older adults", "Patients aged 60 and above", "Sertraline", "100 mg", "Oral", "Once daily", "6–9 months after response", "Not applicable.", NOT_ABX, NS, NS, ["Sodium (hyponatraemia) (ICMR STW)"], ["Avoid TCAs in older adults (ICMR STW)"], "dep", SP, sel="one-of", pref=False, use="Escitalopram unsuitable.")],
 medNote="All doses are from the ICMR Depression STW (October 2019). Lithium (300–600 mg/day) or thyroxine (25–50 µg/day) augmentation, bupropion or sertraline add-on, and low-dose risperidone or olanzapine for psychotic symptoms are secondary or tertiary-care steps (ICMR STW). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Depression and suicide-risk assessment in India.", "learningObjectives": ["Diagnose and grade depression with ICMR criteria.", "Assess suicide risk at every visit.", "Start, monitor and continue SSRI treatment correctly."],
  "keyPoints": ["Symptoms for at least 2 weeks.", "Escitalopram 10–20 mg or fluoxetine 20–40 mg for moderate or severe depression.", "Treat 6–9 months after response, then taper.", "Avoid TCAs in older adults; sertraline in pregnancy."],
  "pitfalls": ["Missing bipolar disorder before starting an antidepressant.", "Not asking about suicide.", "Stopping too early.", "Prescribing large TCA supplies to suicidal patients."],
  "references": [tref("dep", "sections Clinical diagnosis, Severity, Suicide risk, Rule out, Investigation, At primary care, Secondary care, Special population, Referral")]},
 nonClinical={"patientEducation": ["Depression is treatable; improvement starts in about 2 weeks (ICMR STW).", "Do not stop medicine suddenly.", "Tell family and seek help at once for thoughts of self-harm."], "lifestyleAndDiet": ["Behavioural activation, regular sleep and meals (ICMR STW).", "Yoga or meditation as add-on (ICMR STW)."], "mdtReferrals": ["Psychiatrist (secondary or tertiary care, ICMR STW)", "Clinical psychologist for CBT or problem-solving therapy", "Family support"], "dischargeCriteria": ["No immediate suicide risk", "Safety plan and follow-up agreed", "Family support engaged"], "followUpPlan": "Frequent follow-up early; review response at 2–4 weeks and 4–6 weeks; continue 6–9 months after response (ICMR STW)."})
save("t16_depression.json", [T])
