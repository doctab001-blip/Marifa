from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Preterm labour and preterm prelabour rupture of membranes (India)"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Obstetrics / Neonatology", authority="Other", pillar="Safe Birth",
 scope="Threatened and established preterm labour and preterm prelabour rupture of membranes (P-PROM) in India: diagnosis, antibiotics for P-PROM, tocolysis, antenatal corticosteroids, magnesium sulfate for fetal neuroprotection, place of birth and newborn readiness, using WHO antenatal corticosteroid recommendations (2022) and NICE NG25 because the MoHFW antenatal corticosteroid guideline could not be opened.",
 findings=["Speculum diagnosis of P-PROM, oral erythromycin 250 mg four times daily for up to 10 days, no co-amoxiclav, cervical length 15 mm and fetal fibronectin 50 ng/mL thresholds from 30 weeks, nifedipine tocolysis 26–33+6 weeks, oxytocin receptor antagonist if nifedipine contraindicated, no betamimetics, corticosteroids 24–33+6 weeks with one repeat course, magnesium sulfate 4 g IV over 15 minutes then 1 g/hour up to 24 hours at 24–29+6 weeks (consider to 33+6) with 4-hourly monitoring checked against NICE NG25.", "Dexamethasone 6 mg IM every 12 hours for 4 doses or betamethasone 12 mg IM every 24 hours for 2 doses at 24–34 weeks when birth is likely within 7 days, with gestation reasonably assessed and facilities for newborn care, checked against WHO 2022 recommendations 1.0–1.10.", "Not clinically reviewed."],
 unverified=["The MoHFW Operational Guidelines on antenatal corticosteroids (2014) were not opened.", "Nifedipine dose is not given in NICE NG25 and is not included; use the unit protocol.", "NICE NG25 gives no oral penicillin dose for P-PROM; use the local protocol.", "Group B streptococcus intrapartum prophylaxis is not covered in the opened sources."],
 summary="India has the largest number of preterm births in the world, and prematurity is the leading cause of newborn death. Care aims to confirm preterm labour or membrane rupture, buy time for corticosteroids and in-utero transfer to a facility with newborn care, protect the baby's brain with magnesium sulfate before early preterm birth, and prevent infection after membranes rupture. Tocolysis is short-term only. WHO links corticosteroid use to conditions that make it safe: reliable gestational age, birth expected within 7 days, no maternal infection, and adequate care for the preterm baby.",
 mechanisms=["Infection, inflammation, overdistension and bleeding trigger preterm labour.", "Corticosteroids speed fetal lung maturation and reduce respiratory distress, brain bleed and death.", "Magnesium sulfate reduces cerebral palsy risk in very preterm babies.", "After membranes rupture, ascending infection (chorioamnionitis) threatens mother and baby."],
 presentation={"symptoms": ["Regular painful contractions before 37 weeks", "Watery vaginal leakage", "Low backache, pelvic pressure"], "physicalSigns": ["Cervical change on examination", "Pooling of amniotic fluid on speculum (NICE)", "Fever, uterine tenderness, foul liquor (chorioamnionitis)"], "redFlags": ["Chorioamnionitis: fever, tachycardia, uterine tenderness (corticosteroids contraindicated in clinical infection, WHO)", "Antepartum haemorrhage", "Fetal distress", "Cord prolapse after rupture"], "precipitants": ["Urinary or genital infection", "Multiple pregnancy", "Previous preterm birth", "Short cervix, anaemia, low maternal weight"]},
 differentials=[("Braxton Hicks contractions", "Irregular, no cervical change."), ("Urinary incontinence or discharge", "No pooling on speculum."), ("Placental abruption", "Pain, bleeding, tender uterus."), ("Urinary tract infection", "Dysuria, pyuria.")],
 criteria=[("Preterm labour diagnosis from 30 weeks (NICE 1.7)", "Cervical length 15 mm or less, or fetal fibronectin above 50 ng/mL."), ("Corticosteroids (WHO 2022)", "24–34 weeks, birth likely within 7 days, no clinical infection, care available for the preterm newborn."), ("Magnesium sulfate (NICE 1.10)", "24–29+6 weeks (consider to 33+6) in established labour or planned birth within 24 hours.")],
 ruleIn=[
  inv("specializedAdjunctive", "Sterile speculum examination", "Bedside", "P-PROM", "No pooling", "Pooling of amniotic fluid", "Do not use nitrazine (NICE 1.3.1, 1.3.4).", "ng25", "recommendations 1.3.1–1.3.4"),
  inv("firstLineImaging", "Transvaginal cervical length", "Ultrasound", "Preterm labour from 30 weeks", "Above 15 mm", "15 mm or less", "Not combined with fibronectin (NICE 1.7.4, 1.7.7).", "ng25", "recommendation 1.7.4"),
  inv("laboratory", "Fetal fibronectin", "Vaginal swab", "Preterm labour from 30 weeks", "50 ng/mL or less", "Above 50 ng/mL", "If cervical length unavailable (NICE 1.7.5).", "ng25", "recommendation 1.7.5"),
  inv("firstLineImaging", "Obstetric ultrasound", "Ultrasound", "Gestation, presentation, liquor", "Gestation consistent", "Malpresentation, oligohydramnios", "Gestational age must be reliably assessed for corticosteroids (WHO).", "whoacs", "recommendation 1.0"),
  inv("laboratory", "Maternal temperature, pulse, white cells, CRP and urine culture", "Bedside and blood", "Chorioamnionitis, urinary infection", "Afebrile; normal counts", "Fever, tachycardia, raised counts", "Monitor after P-PROM.", "ng25", "recommendations 1.4.1–1.4.3"),
  inv("specializedAdjunctive", "Fetal heart rate monitoring", "Doppler or cardiotocography", "Fetal wellbeing", "Normal rate 110–160/min", "Abnormal pattern", "Throughout labour.", "ng25", "section 1.8")],
 ruleOut=[inv("laboratory", "Insulin-like growth factor binding protein-1 or placental alpha-microglobulin-1 test", "Vaginal swab", "P-PROM when no pooling", "Negative", "Positive (interpret with clinical picture)", "Not used alone (NICE 1.3.2).", "ng25", "recommendation 1.3.2")],
 management=[
  step("confirm", "Confirm and assess", "On arrival", ["Gestation, contractions, cervix, membranes, infection, fetal wellbeing (NICE).", "Transfer in utero to a facility with newborn care when possible."]),
  step("pprom", "P-PROM", "From diagnosis", ["Erythromycin 250 mg four times daily for up to 10 days or until labour (NICE 1.4.1).", "Do not give co-amoxiclav (NICE 1.4.3)."]),
  step("steroid", "Corticosteroids and tocolysis", "Within hours", ["Corticosteroids at 24–34 weeks when criteria met (WHO 2022; NICE 1.9).", "Nifedipine tocolysis at 26–33+6 weeks with intact membranes; no betamimetics (NICE 1.8)."]),
  step("mag", "Neuroprotection", "Birth within 24 hours", ["Magnesium sulfate 4 g IV over 15 minutes, then 1 g/hour until birth or 24 hours (NICE 1.10.4).", "Check pulse, BP, respiratory rate and reflexes at least 4-hourly (NICE 1.10.5)."]),
  step("birth", "Birth", "At delivery", ["Newborn resuscitation team present; thermal care and early breastfeeding (see newborn topics)."])],
 branches=[("P-PROM antibiotics", "Confirmed P-PROM."), ("Antenatal corticosteroids", "24–34 weeks, birth likely within 7 days."), ("Fetal neuroprotection", "24–33+6 weeks, birth expected within 24 hours.")],
 regimens=[
  rx("P-PROM antibiotics", "P-PROM antibiotic", "P-PROM", "Pregnant women", "Erythromycin", "250 mg", "Oral", "Four times daily", "Up to 10 days or until established labour", "Not applicable (maternal).", "Not a beta-lactam; suitable in penicillin allergy.", "No adjustment.", "Caution in liver disease.", ["Signs of chorioamnionitis"], ["Macrolide allergy"], "ng25", "recommendation 1.4.1", sel="one-of", pref=True),
  rx("P-PROM antibiotics", "P-PROM antibiotic", "P-PROM, erythromycin not tolerated", "Pregnant women", "Phenoxymethylpenicillin (oral penicillin)", "Dose per local protocol", "Oral", "As per protocol", "Up to 10 days", "Not applicable (maternal).", "Contraindicated in penicillin allergy.", "No adjustment.", "No adjustment.", ["Infection signs"], ["Penicillin allergy"], "ng25", "recommendation 1.4.2", sel="one-of", pref=False, use="Erythromycin not tolerated or contraindicated (NICE 1.4.2)."),
  rx("Antenatal corticosteroids", "Corticosteroid", "Preterm birth likely", "Pregnant women 24–34 weeks", "Dexamethasone", "6 mg", "IM", "Every 12 hours", "4 doses", "Not applicable (maternal treatment for the fetus).", NOT_ABX, "No adjustment.", "No adjustment.", ["Maternal glucose in diabetes"], ["Clinical chorioamnionitis (WHO)"], "whoacs", "recommendations 1.0, 1.9", sel="one-of", pref=True),
  rx("Antenatal corticosteroids", "Corticosteroid", "Preterm birth likely", "Pregnant women 24–34 weeks", "Betamethasone", "12 mg", "IM", "Every 24 hours", "2 doses", "Not applicable.", NOT_ABX, "No adjustment.", "No adjustment.", ["Maternal glucose in diabetes"], ["Clinical chorioamnionitis"], "whoacs", "recommendation 1.9", sel="one-of", pref=False, use="Dexamethasone unavailable (WHO: either agent)."),
  rx("Fetal neuroprotection", "Magnesium sulfate", "Birth expected within 24 hours", "Pregnant women 24–33+6 weeks", "Magnesium sulfate", "4 g over 15 minutes, then 1 g/hour", "IV", "Bolus then infusion", "Until birth or 24 hours, whichever is sooner", "Not applicable (maternal).", NOT_ABX, "Monitor more often and reduce or stop if oliguria or renal failure (NICE 1.10.6).", "No adjustment.", ["Pulse, BP, respiratory rate, tendon reflexes at least 4-hourly (NICE 1.10.5)"], ["Myasthenia gravis"], "ng25", "recommendations 1.10.4–1.10.6", extra_adj=("Calcium gluconate 10 mL of 10% IV is the antidote for toxicity (general practice).",))],
 medNote="P-PROM antibiotics, tocolysis criteria and magnesium sulfate from NICE NG25; corticosteroid doses from WHO 2022. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Preterm labour and P-PROM in Indian facilities.", "learningObjectives": ["Diagnose preterm labour and P-PROM.", "Give corticosteroids under WHO conditions.", "Give magnesium sulfate for neuroprotection."],
  "keyPoints": ["Erythromycin 250 mg four times daily up to 10 days after P-PROM.", "Dexamethasone 6 mg IM 12-hourly × 4 at 24–34 weeks.", "Magnesium 4 g IV then 1 g/hour.", "No betamimetics; no co-amoxiclav."],
  "pitfalls": ["Corticosteroids with clinical infection.", "Digital examination after P-PROM.", "Delaying transfer.", "Missing chorioamnionitis."],
  "references": [tref("ng25", "recommendations 1.3, 1.4, 1.7–1.10"), tref("whoacs", "recommendations 1.0–1.10")]},
 nonClinical={"patientEducation": ["Report leaking fluid, fever, bleeding or reduced movements at once.", "Explain why corticosteroids and magnesium are given."], "lifestyleAndDiet": ["Normal diet; treat anaemia."], "mdtReferrals": ["Neonatology / special newborn care unit", "Higher centre for in-utero transfer"], "dischargeCriteria": ["Contractions settled, no infection, follow-up arranged (threatened preterm labour)"], "followUpPlan": "Close antenatal review; plan for next pregnancy with early booking."})
T["evidenceAudit"]["unverifiedSections"] = [u for u in T["evidenceAudit"]["unverifiedSections"] if not (u.startswith("Nifedipine dose") or u.startswith("NICE NG25 gives no oral penicillin") or u.startswith("Group B streptococcus"))]
T["evidenceAudit"]["unverifiedSections"].insert(1, "NICE NG25 names an oral penicillin as the alternative to erythromycin without a regimen; no row is shown, and the choice is left to the obstetrician.")
T["evidenceAudit"]["unverifiedSections"].insert(2, "Nifedipine dosing is from a GPnotebook summary of NICE guidance, and GBS prophylaxis from an Irish hospital guideline citing the HSE 2023 national guideline.")
T["evidenceAudit"]["findings"].insert(2, "Nifedipine 20 mg orally then 10–20 mg three to four times daily adjusted to uterine activity (GPnotebook, NICE); intrapartum GBS prophylaxis with benzylpenicillin 3 g IV then 1.8 g IV every 4 hours, cefuroxime 1.5 g for non-severe allergy and vancomycin 20 mg/kg for severe allergy (Louth Hospitals, HSE 2023).")
T["medicationPlan"]["regimens"] = [r for r in T["medicationPlan"]["regimens"] if not r["genericName"].startswith("Phenoxymethylpenicillin")]
for r in T["medicationPlan"]["regimens"]:
    if r["genericName"] == "Erythromycin":
        r.pop("selection", None); r.pop("preferred", None)
        r["adjustments"].append("If erythromycin is not tolerated or contraindicated, NICE advises an oral penicillin for up to 10 days (no regimen given).")
T["pathophysiology"]["summary"] += " Group B streptococcus (GBS) colonisation adds to the risk of early-onset neonatal sepsis, so women in preterm labour receive intrapartum antibiotic prophylaxis. Every hour gained before birth helps, because it allows steroids and transfer."
T["presentation"]["symptoms"] += ["Vaginal bleeding or show", "Fever or offensive vaginal discharge (infection)"]
T["presentation"]["physicalSigns"] += ["Palpable regular uterine contractions", "Maternal tachycardia above 100/min or fetal tachycardia (chorioamnionitis)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Braxton Hicks contractions", "Irregular, painless tightenings with no cervical change; cervical length above 15 mm or negative fibronectin from 30 weeks settles it (NICE)."),
 ("Urinary incontinence or physiological discharge", "Leak with coughing or a thin discharge but no pooling of liquor on speculum; speculum examination settles it (NICE)."),
 ("Placental abruption", "Constant pain, a tender hard uterus and bleeding, sometimes concealed; clinical findings and fetal monitoring settle it (see Antepartum haemorrhage topic)."),
 ("Urinary tract infection or pyelonephritis", "Dysuria, loin pain and fever; urine microscopy and culture settle it, and infection may itself trigger preterm labour."),
 ("Chorioamnionitis", "Fever, maternal and fetal tachycardia, uterine tenderness and offensive liquor after membrane rupture; clinical diagnosis with raised white cells and CRP."),
 ("Appendicitis or other surgical cause in pregnancy", "Localised right-sided pain and tenderness with anorexia; ultrasound settles it.")]]
for m in T["clinicalManagement"]:
    if m["id"] == "birth":
        m["actions"] = ["Newborn resuscitation team present; delayed cord clamping where appropriate; thermal care and early breastfeeding (see newborn topics).", "Intrapartum GBS prophylaxis with benzylpenicillin from the onset of preterm labour (Louth Hospitals; HSE 2023)."]
    if m["id"] == "steroid":
        m["actions"] = ["Corticosteroids at 24–34 weeks when criteria are met (WHO 2022; NICE 1.9).", "Nifedipine 20 mg then 10–20 mg three to four times daily at 26–33+6 weeks with intact membranes; oxytocin receptor antagonist if nifedipine contraindicated; no betamimetics (NICE 1.8; GPnotebook)."]
T["medicationPlan"]["branches"].insert(1, {"label": "Tocolysis", "entryCriteria": "Suspected or diagnosed preterm labour at 26+0 to 33+6 weeks (consider from 24+0), intact membranes, no contraindication."})
T["medicationPlan"]["branches"].append({"label": "Intrapartum GBS prophylaxis", "entryCriteria": "Established preterm labour or birth expected."})
T["medicationPlan"]["regimens"] += [
 rx("Tocolysis", "Calcium channel blocker", "Preterm labour, intact membranes", "Pregnant women 24+0 to 33+6 weeks", "Nifedipine", "20 mg loading, then 10–20 mg three to four times daily adjusted to uterine activity", "Oral", "Three to four times daily", "Short course (typically up to 48 hours to complete corticosteroids)", "Not applicable (maternal).", NOT_ABX, "No adjustment.", "Reduce dose in liver disease.", ["Maternal BP and pulse, fetal heart rate"], ["Maternal hypotension, cardiac disease, bleeding or infection where stopping labour is unsafe"], "gpntoco", "section Nifedipine", extra_adj=("Offer at 26+0 to 33+6 weeks, consider at 24+0 to 25+6 weeks (NICE 1.8.2–1.8.3); off-label use.",)),
 rx("Intrapartum GBS prophylaxis", "Penicillin", "Preterm labour", "Pregnant women in labour", "Benzylpenicillin", "3 g, then 1.8 g", "IV", "3 g stat, then 1.8 g every 4 hours", "Until delivery", "Not applicable (maternal).", "Non-severe allergy: cefuroxime 1.5 g IV stat then 1.5 g IV four times daily; severe allergy: vancomycin 20 mg/kg IV three times daily (maximum 2 g per dose) (Louth Hospitals).", "Reduce dose in severe renal impairment.", "No adjustment.", ["Ideally first dose at least 4 hours before birth"], ["Penicillin allergy"], "louthgbs", "section GBS intrapartum prophylaxis")]
T["teaching"]["learningObjectives"].append("Give tocolysis and intrapartum GBS prophylaxis correctly.")
T["teaching"]["keyPoints"] += ["Nifedipine 20 mg then 10–20 mg three to four times daily for short-term tocolysis.", "Benzylpenicillin 3 g IV then 1.8 g every 4 hours in preterm labour."]
T["teaching"]["references"] += [tref("gpntoco", "section Nifedipine"), tref("louthgbs", "section GBS intrapartum prophylaxis")]

ALG = algo("preterm-pathway", "Threatened preterm labour or P-PROM", "manage", "ng25", "recommendations 1.3, 1.4, 1.7–1.10 (corticosteroid doses from WHO 2022)", [
 node("start", "start", "Pregnant woman before 37 weeks with contractions or leaking fluid", [("pprom", None)], "Confirm gestation; check for infection, bleeding and fetal wellbeing."),
 node("pprom", "decision", "Pooling of liquor on speculum (P-PROM)?", [("ab", "Yes"), ("tl", "No")]),
 node("ab", "action", "Erythromycin 250 mg four times daily up to 10 days; no co-amoxiclav; watch for chorioamnionitis", [("abster", None)]),
 node("abster", "decision", "24–34 weeks and birth likely within 7 days?", [("abmg", "Yes"), ("abwait", "No")]),
 node("abmg", "outcome", "Corticosteroids; magnesium sulfate if 24–33+6 weeks and birth within 24 hours; in-utero transfer", None),
 node("abwait", "outcome", "Monitor for infection and labour; plan birth with obstetric team", None),
 node("tl", "decision", "Preterm labour confirmed? (under 30 weeks: treat as yes; from 30 weeks: cervical length 15 mm or less or fibronectin above 50 ng/mL)", [("pl", "Yes"), ("notl", "No")]),
 node("notl", "outcome", "Preterm labour unlikely; look for other causes; safety-net advice", None),
 node("pl", "action", "Corticosteroids at 24–34 weeks; nifedipine at 26–33+6 weeks with intact membranes", [("imminent", None)]),
 node("imminent", "decision", "Birth expected within 24 hours?", [("mg", "Yes"), ("trans", "No")]),
 node("mg", "outcome", "Magnesium sulfate (24–33+6 weeks), benzylpenicillin for GBS, neonatal team", None),
 node("trans", "outcome", "In-utero transfer to a unit with newborn care; continue monitoring", None)])

VIG = "Sunita, a 23-year-old primigravida at 30 weeks and 2 days by first-trimester scan, attends a district hospital in Odisha with 4 hours of regular painful tightenings every 7 minutes and lower backache. She has had burning urination for 3 days. Temperature is 37.4°C, BP 112/70 mmHg and pulse 92/min. Speculum shows no pooling of liquor and the cervix appears to be opening. The hospital has no neonatal intensive care unit; the nearest is 90 km away."

EXP = [
 explain("pathophysiology", "Why preterm birth happens and why time matters", "What can we change once preterm labour starts?",
  "Preterm labour is the final common pathway of several processes: infection and inflammation (including urinary and ascending genital infection), overdistension from multiple pregnancy, placental bleeding, cervical insufficiency and maternal stress. Once labour is established it is difficult to stop, and tocolytics only delay birth for a few days. That delay is valuable because it allows two things that change the baby's outcome: a course of corticosteroids, which matures the fetal lungs and reduces respiratory distress, intraventricular haemorrhage and death, and transfer of the mother to a hospital with newborn care. Magnesium sulfate given shortly before a very preterm birth protects the fetal brain and reduces cerebral palsy. After the membranes rupture, ascending infection becomes the main threat to both mother and baby."),
 explain("signs-symptoms", "Recognising true preterm labour and its complications", "How do you tell real preterm labour from false alarms?",
  "Regular painful contractions with progressive cervical change define preterm labour. Before 30 weeks, NICE advises treating suspected preterm labour as real because the cost of missing it is high. From 30 weeks, a transvaginal cervical length of 15 mm or less, or a fetal fibronectin above 50 ng/mL, confirms it, and values above these thresholds make it unlikely. A speculum examination looking for pooled liquor diagnoses P-PROM; digital examination should be avoided after membrane rupture. Look actively for causes and complications: urinary infection, bleeding from abruption, and chorioamnionitis — maternal fever, maternal and fetal tachycardia, uterine tenderness and offensive liquor — which is a contraindication to tocolysis and to delaying birth."),
 explain("investigations", "Tests that guide decisions", "Which investigations change management?",
  "Gestational age must be reliably known before giving corticosteroids, so check the dating scan. Cervical length and fetal fibronectin help from 30 weeks but should not be combined. Urine microscopy and culture look for a treatable trigger. After P-PROM, monitor maternal temperature, pulse, white cell count and CRP for chorioamnionitis, and use fetal heart rate monitoring throughout. An obstetric ultrasound confirms presentation, liquor volume and estimated weight, which help plan the place and mode of birth, and confirms whether in-utero transfer is still safe."),
 explain("management", "Buying time and protecting the baby", "What should be given, and in what order?",
  "For P-PROM, start erythromycin 250 mg four times daily for up to 10 days and avoid co-amoxiclav because of an association with necrotising enterocolitis. Give corticosteroids — dexamethasone 6 mg IM every 12 hours for four doses or betamethasone 12 mg IM every 24 hours for two doses — at 24–34 weeks when birth is likely within 7 days and there is no clinical infection. With intact membranes at 26–33+6 weeks, nifedipine 20 mg followed by 10–20 mg three to four times daily delays birth long enough to complete steroids and transfer; betamimetics should not be used. When birth is expected within 24 hours at 24–29+6 weeks (consider up to 33+6), give magnesium sulfate 4 g IV over 15 minutes then 1 g/hour, monitoring reflexes, respiratory rate and urine output. In established preterm labour, give benzylpenicillin for group B streptococcus and call the neonatal team.")]

QS = [
 bq("q1", "A 23-year-old woman at 30+2 weeks has regular painful contractions every 7 minutes, intact membranes and a cervical length of 12 mm. She has no fever, bleeding or signs of infection. Her BP is 112/70 mmHg. The nearest neonatal intensive care unit is 90 km away.", "What is the most appropriate management now?",
  [("Terbutaline infusion to stop labour", "Betamimetics should not be used for tocolysis (NICE 1.8.5)."),
   ("Corticosteroids, nifedipine and in-utero transfer", "Correct. Cervical length 15 mm or less confirms preterm labour; steroids at 24–34 weeks and nifedipine at 26–33+6 weeks buy time for transfer (NICE; WHO)."),
   ("Erythromycin for 10 days", "Erythromycin is for P-PROM; her membranes are intact."),
   ("Immediate caesarean section", "Preterm labour itself is not an indication for caesarean birth."),
   ("Send home with advice as the cervix is closed", "A cervical length of 12 mm confirms preterm labour.")],
  "B", "Manage confirmed preterm labour with intact membranes.", "Steroids + nifedipine + transfer; no betamimetics."),
 bq("q2", "A 28-year-old woman at 31 weeks reports a gush of clear fluid 6 hours ago. Speculum shows pooling of liquor. She is afebrile with pulse 84/min, the uterus is non-tender, and the fetal heart rate is 140/min. She is not contracting.", "Which antibiotic should be started?",
  [("Co-amoxiclav 625 mg three times daily", "Co-amoxiclav should not be offered in P-PROM (NICE 1.4.3)."),
   ("No antibiotic until labour starts", "Prophylactic antibiotics are offered after P-PROM (NICE 1.4.1)."),
   ("Ceftriaxone 1 g IV daily", "This is not the recommended P-PROM prophylaxis and adds unnecessary broad-spectrum exposure."),
   ("Erythromycin 250 mg four times daily for up to 10 days or until established labour", "Correct. Erythromycin for up to 10 days or until established labour is the NICE recommendation (1.4.1)."),
   ("Benzylpenicillin 3 g IV now", "Intrapartum GBS prophylaxis is for labour; P-PROM prophylaxis is erythromycin.")],
  "D", "Prescribe antibiotic prophylaxis after P-PROM.", "P-PROM: erythromycin 250 mg four times daily up to 10 days; never co-amoxiclav."),
 bq("q3", "A 26-year-old woman at 27 weeks is in established preterm labour with the cervix 6 cm dilated. Birth is expected within a few hours. She received the first dose of dexamethasone 2 hours ago. Her reflexes are normal and urine output is adequate.", "Which additional treatment protects the baby's brain?",
  [("Nifedipine 20 mg orally", "Tocolysis is not appropriate in advanced labour, and it does not protect the brain."),
   ("Second course of corticosteroids", "She is already receiving her first course; a repeat course does not protect the brain."),
   ("Magnesium sulfate 4 g IV over 15 minutes then 1 g/hour", "Correct. Offer magnesium sulfate at 24–29+6 weeks when birth is expected within 24 hours (NICE 1.10.2, 1.10.4)."),
   ("Indomethacin", "Not recommended in the cited sources and does not provide neuroprotection."),
   ("Phenobarbitone", "Phenobarbitone has no role in fetal neuroprotection in the cited sources.")],
  "C", "Give magnesium sulfate for fetal neuroprotection.", "Birth within 24 hours at 24–29+6 weeks: magnesium sulfate 4 g then 1 g/hour.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
NG = "NICE NG25, updated 2022"
for r in T["investigations"]["ruleIn"]:
    if r["testName"] == "Fetal heart rate monitoring":
        r["references"][0]["edition"] = f"{NG}, section 1.12"
    if r["testName"].startswith("Maternal temperature"):
        r["testName"] = "Maternal temperature and pulse, white cells, CRP and cardiotocography (CTG); urine culture"
        r["clinicalRationale"] = "Diagnose intrauterine infection with clinical assessment plus CRP, white cells and CTG together; never use one test alone (NICE 1.5.1–1.5.3)."
        r["references"][0]["edition"] = f"{NG}, recommendations 1.5.1–1.5.3"
R = T["medicationPlan"]["regimens"]
for r in R:
    n = r["genericName"]
    if n == "Nifedipine":
        r["duration"] = "Not stated in the source; commonly up to 48 hours to complete corticosteroids (general practice)"
        r["adjustments"] = [a if not a.startswith("CLD:") else "CLD: No sourced adjustment; hepatically metabolised, so use with caution (general pharmacology)." for a in r["adjustments"]]
    if n == "Benzylpenicillin":
        r["indication"] = "Intrapartum GBS prophylaxis when indicated by risk factors (Louth Hospitals: risk-factor approach, HSE 2023)"
        r["adjustments"] = [a if not a.startswith("Penicillin allergy:") else "Penicillin allergy: Non-severe allergy: cefuroxime 1.5 g IV stat then 1.5 g IV four times daily; severe allergy: clindamycin 900 mg IV three times daily if GBS is clindamycin-susceptible, otherwise vancomycin 20 mg/kg IV three times daily (maximum 2 g per dose) (Louth Hospitals)." for a in r["adjustments"]]
        r["adjustments"] = [a if not a.startswith("CKD:") else "CKD: No sourced adjustment; reduce in severe renal impairment (general pharmacology)." for a in r["adjustments"]]
    if n in ("Dexamethasone", "Betamethasone"):
        r["sourceEdition"] = "WHO, 2022, recommendation 1.0 and remarks under recommendation 1.9"
T["medicationPlan"]["branches"].append({"label": "Suspected intrauterine infection", "entryCriteria": "Maternal fever with raised white cells, fetal tachycardia or purulent discharge."})
R.append(rx("Suspected intrauterine infection", "Broad-spectrum antibiotics", "Suspected or confirmed intraamniotic infection (chorioamnionitis)", "Pregnant women", "Ampicillin plus gentamicin",
  "Ampicillin 2 g every 6 hours plus gentamicin 2 mg/kg load then 1.5 mg/kg every 8 hours, or 5 mg/kg every 24 hours", "IV", "As stated", "Until birth; after caesarean give one further dose and add clindamycin 900 mg or metronidazole 500 mg IV after cord clamping",
  "Not applicable (maternal); inform the neonatal team.", "Mild allergy: cefazolin 2 g IV every 8 hours plus gentamicin; severe allergy: clindamycin 900 mg IV every 8 hours or vancomycin 1 g IV every 12 hours plus gentamicin (MSD Manual).",
  "Gentamicin: extend interval and monitor levels in renal impairment (general pharmacology).", "No adjustment.", ["Temperature, pulse, CTG, gentamicin levels, renal function"], ["Do not give corticosteroids or tocolysis with clinical chorioamnionitis (WHO); expedite birth"], "msdiai", "section Treatment"))
for m in T["clinicalManagement"]:
    if m["id"] == "confirm":
        m["actions"].append("Dysuria or bacteriuria: send urine culture and treat urinary infection with a pregnancy-safe antibiotic guided by culture (see the urinary tract infection topic).")
    if m["id"] == "pprom":
        m["actions"].append("Suspected intrauterine infection (fever with raised white cells, fetal tachycardia or offensive liquor): IV ampicillin plus gentamicin, no tocolysis, expedite birth and inform the neonatal team (NICE 1.5; MSD Manual).")
    if m["id"] == "steroid":
        m["actions"] += ["At 22+0 to 23+6 weeks, discuss corticosteroids with the woman, family and multidisciplinary team (NICE 1.9.1).", "Consider one repeat course before 34+0 weeks if the first was over 7 days ago and birth is very likely within 48 hours; never more than 2 courses (NICE 1.9.4–1.9.5)."]
    if m["id"] == "birth":
        m["actions"] = [m["actions"][0], "Intrapartum GBS prophylaxis with benzylpenicillin when indicated by risk factors (Louth Hospitals; HSE 2023)."]
d0 = T["differentials"][0]
d0["distinguishingFeatures"] = "Irregular, painless tightenings with no cervical change; from 30 weeks, cervical length above 15 mm or fibronectin 50 ng/mL or less makes preterm labour unlikely (NICE)."
A = T["algorithms"][0]
nodes = {n["id"]: n for n in A["nodes"]}
nodes["ab"]["next"] = [{"to": "infx"}]
i = [n["id"] for n in A["nodes"]].index("ab") + 1
A["nodes"][i:i] = [
 {"id": "infx", "kind": "decision", "text": "Signs of intrauterine infection (fever with raised white cells or CRP, fetal tachycardia, offensive liquor)?", "next": [{"to": "chorio", "label": "Yes"}, {"to": "abster", "label": "No"}]},
 {"id": "chorio", "kind": "outcome", "text": "IV ampicillin plus gentamicin; no corticosteroids or tocolysis; expedite birth; neonatal team"}]
nodes["abmg"]["text"] = "Corticosteroids; magnesium sulfate if 24–33+6 weeks and birth within 24 hours; GBS prophylaxis in labour; in-utero transfer"

save("t72_preterm.json", [T])
