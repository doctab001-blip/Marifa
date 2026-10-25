from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Contraception (India)"
NO_PAED = "Suitable for adolescents (no age restriction on medical grounds)."
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Obstetrics and Gynaecology / Primary Care / Family Planning", authority="MoHFW", pillar="Keep Well",
 scope="Contraceptive counselling and provision under the Indian national family planning programme: injectable medroxyprogesterone acetate (Antara), combined oral contraceptive pills (Mala-N), centchroman (Chhaya), copper intrauterine devices including postpartum IUCD, emergency contraception and condoms, with eligibility, timing after childbirth and abortion, side effects and follow-up, using MoHFW reference manuals, FOGSI, WHO and MSF sources.",
 findings=["DMPA 150 mg IM every 3 months (13 weeks), 2 weeks early to 4 weeks late, start 6 weeks postpartum if breastfeeding, immediately after abortion, MEC category 4 conditions, side effects, fertility return 7–10 months, no routine bone density monitoring checked against the MoHFW Injectable Contraceptive (MPA) manual (2016).", "Cu IUCD 380A (10 years) and Cu IUCD 375 (5 years), post-placental (within 10 minutes), within 48 hours or intra-caesarean PPIUCD, interval and post-abortion timing, follow-up at 6 weeks or first period, PAINS warning signs and use within 5 days as emergency contraception checked against the MoHFW IUCD manual (2018).", "Centchroman twice weekly for 3 months then weekly, safe in breastfeeding, contraindications checked against FOGSI Pankh.", "Levonorgestrel 1.5 mg or ulipristal 30 mg up to 120 hours and copper IUD within 5 days checked against WHO (2021).", "Ethinylestradiol 30 µg / levonorgestrel 150 µg, missed-pill rules, contraindications, enzyme inducers and breastfeeding advice checked against MSF Essential drugs (2021).", "Not clinically reviewed."],
 unverified=["The MoHFW oral contraceptive pill manual could not be opened; Mala-N use rules are from the MSF monograph for the same formulation.", "Sterilisation (tubectomy and vasectomy) is described only briefly and is not sourced.", "The FOGSI centchroman brochure gives no missed-pill rule."],
 summary="India's family planning programme offers a basket of free methods: condoms, combined pills (Mala-N), the weekly non-hormonal pill centchroman (Chhaya), the three-monthly injectable Antara (DMPA), copper IUCDs including immediate postpartum and post-abortion insertion, emergency contraceptive pills, and sterilisation. Good care starts with counselling about the woman's needs and medical eligibility, excludes pregnancy, and uses every contact — especially delivery and abortion — to offer a method. Most women can use most methods; key restrictions are oestrogen-containing pills in the first 6 weeks postpartum with breastfeeding, high blood pressure, migraine with aura, smoking over 35 and history of thrombosis.",
 mechanisms=["Combined pills suppress ovulation.", "DMPA suppresses ovulation and thickens cervical mucus.", "Centchroman is a selective oestrogen receptor modulator that prevents implantation.", "Copper ions are toxic to sperm and prevent fertilisation; also work as emergency contraception."],
 presentation={"symptoms": ["Request for contraception", "Unprotected sex in the last 5 days (emergency contraception)", "Side effects: irregular bleeding, amenorrhoea, headache"], "physicalSigns": ["Blood pressure", "Pelvic examination before IUCD"], "redFlags": ["Blood pressure 160/100 mmHg or higher: avoid DMPA and combined pills (MoHFW MEC 4)", "Migraine with aura: stop hormonal methods (MoHFW)", "IUCD: pain, fever, abnormal discharge, missing strings (PAINS) (MoHFW)", "Missed period on any method: pregnancy test"], "precipitants": ["Unmet need for contraception", "Gaps after childbirth or abortion", "Enzyme-inducing drugs (rifampicin, carbamazepine) reducing pill efficacy (MSF)"]},
 differentials=[("Pregnancy", "Missed period; test before starting."), ("Irregular bleeding from pathology", "Persistent or postcoital bleeding needs examination."), ("Pelvic infection with IUCD", "Pain, fever, discharge.")],
 criteria=[("DMPA timing (MoHFW)", "Every 3 months; up to 2 weeks early or 4 weeks late without backup."), ("PPIUCD (MoHFW)", "Within 10 minutes of placenta, within 48 hours of vaginal birth, or at caesarean."), ("Emergency contraception (WHO)", "Pills up to 120 hours; copper IUD within 5 days."), ("Combined pill and breastfeeding (MSF)", "Contraindicated before 6 weeks; not recommended 6 weeks to 6 months.")],
 ruleIn=[
  inv("laboratory", "Urine pregnancy test", "Urine", "Pregnancy before starting", "Negative", "Positive", "When pregnancy cannot be reasonably excluded (MoHFW).", "dmpa", "Chapter 5, section Administration"),
  inv("specializedAdjunctive", "Blood pressure measurement", "Sphygmomanometer", "Eligibility for hormonal methods", "Below 140/90 mmHg", "160/100 mmHg or higher (MEC 4 for DMPA)", "Before starting and during combined pill use (MoHFW; MSF).", "dmpa", "Chapter 4, section Eligibility"),
  inv("specializedAdjunctive", "Pelvic examination", "Speculum and bimanual", "IUCD eligibility, infection", "Normal", "Cervicitis, PID, uterine anomaly", "Before IUCD insertion (MoHFW).", "iucd", "section Client screening"),
  inv("specializedAdjunctive", "STI and HIV risk assessment", "History", "Dual protection need", "Low risk", "High risk: add condoms", "Counselling stage I (MoHFW).", "dmpa", "Chapter 3, section Counselling"),
  inv("specializedAdjunctive", "IUCD string check at follow-up", "Speculum", "Expulsion or displacement", "Strings visible", "Missing strings", "At 6 weeks or after first period (MoHFW).", "iucd", "section Follow-up")],
 ruleOut=[inv("firstLineImaging", "Pelvic ultrasound (missing IUCD strings)", "Ultrasound", "IUCD position", "IUCD in uterine cavity", "Expelled or perforated", "Missing strings (MoHFW PAINS).", "iucd", "section Follow-up")],
 management=[
  step("counsel", "Counsel", "First contact", ["Discuss all methods, side effects and return to fertility (MoHFW).", "Check eligibility and exclude pregnancy (MoHFW)."]),
  step("method", "Provide the method", "Same day", ["Offer PPIUCD or post-abortion IUCD at the time of delivery or abortion (MoHFW).", "DMPA from 6 weeks postpartum if breastfeeding (MoHFW).", "Combined pill not before 6 weeks postpartum with breastfeeding (MSF)."]),
  step("ec", "Emergency contraception", "Within 120 hours", ["Levonorgestrel 1.5 mg or ulipristal 30 mg; copper IUD within 5 days is most effective (WHO)."]),
  step("follow", "Follow-up", "Per method", ["IUCD at 6 weeks or first period (MoHFW).", "DMPA every 3 months; manage bleeding with NSAIDs or tranexamic acid (MoHFW)."])],
 branches=[("Injectable", "Woman choosing a 3-monthly injection."), ("Oral pills", "Woman choosing a daily or weekly pill."), ("Emergency contraception", "Unprotected sex within the last 120 hours.")],
 regimens=[
  rx("Injectable", "Progestogen injection", "Contraception", "Women of reproductive age", "Medroxyprogesterone acetate (DMPA, Antara)", "150 mg", "Deep IM", "Every 3 months (13 weeks); 2 weeks early to 4 weeks late", "Long term", NO_PAED, NOT_ABX, "No adjustment.", "Avoid in severe liver disease or liver tumour.", ["BP, bleeding pattern, weight"], ["BP 160/100 mmHg or higher; under 6 weeks postpartum breastfeeding; unexplained vaginal bleeding (MEC 4) (MoHFW)"], "dmpa", "Chapter 2, section MPA; Chapter 6, section Follow-up", extra_adj=("Return of fertility may take 7–10 months (MoHFW).",)),
  rx("Oral pills", "Contraceptive pill", "Contraception", "Women of reproductive age", "Ethinylestradiol 30 µg with levonorgestrel 150 µg (Mala-N)", "1 tablet", "Oral", "Daily, same time, no break (28-day pack)", "Long term", NO_PAED, NOT_ABX, "Contraindicated in renal impairment (MSF).", "Contraindicated in severe or recent liver disease (MSF).", ["BP before and during use (MSF)"], ["Breastfeeding under 6 weeks, hypertension, thromboembolism, stroke, migraine with aura, smoking over 35 (MSF)"], "msfcoc", "sections Dosage, Contraindications", sel="one-of", pref=True, extra_adj=("Missed 3 or more active pills: take one, continue, condoms 7 days; emergency contraception if missed in week 1 with recent sex (MSF).",)),
  rx("Oral pills", "Contraceptive pill", "Contraception (non-hormonal pill)", "Women of reproductive age", "Centchroman (ormeloxifene, Chhaya)", "30 mg", "Oral", "Twice weekly for 3 months (first day of period and 3 days later), then once weekly", "Long term", NO_PAED, NOT_ABX, "Avoid in renal disease (FOGSI).", "Avoid in liver dysfunction or jaundice (FOGSI).", ["Cycle length; pregnancy test if period delayed over 15 days"], ["Polycystic ovarian disease, cervical dysplasia, recent jaundice (FOGSI)"], "cent", "section Dose schedule", sel="one-of", pref=False, use="Breastfeeding, or oestrogen contraindicated, or prefers a weekly pill."),
  rx("Emergency contraception", "Emergency contraceptive pill", "Unprotected sex within 120 hours", "Women and adolescent girls", "Levonorgestrel", "1.5 mg", "Oral", "Single dose", "Once, as early as possible", "No age restriction (WHO).", NOT_ABX, "No adjustment.", "No adjustment.", ["Pregnancy test if period delayed"], ["None absolute (WHO)"], "whoec", "section Methods", sel="one-of", pref=True, extra_adj=("Less effective if BMI above 30 but still offer (WHO).",)),
  rx("Emergency contraception", "Emergency contraceptive pill", "Unprotected sex within 120 hours", "Women and adolescent girls", "Ulipristal acetate", "30 mg", "Oral", "Single dose", "Once", "No age restriction (WHO).", NOT_ABX, "No adjustment.", "Caution in severe liver impairment.", ["Pregnancy test if period delayed"], ["None absolute (WHO)"], "whoec", "section Methods", sel="one-of", pref=False, use="72–120 hours after sex (more effective than levonorgestrel then, WHO).")],
 medNote="DMPA from the MoHFW MPA manual; IUCD from the MoHFW IUCD manual; centchroman from FOGSI; emergency contraception from WHO; combined pill rules from MSF. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Contraception in the Indian public health system.", "learningObjectives": ["Counsel on the national method basket.", "Apply eligibility rules and timing after birth or abortion.", "Provide emergency contraception."],
  "keyPoints": ["Antara 150 mg IM every 3 months.", "PPIUCD within 10 minutes or 48 hours of birth.", "Chhaya twice weekly for 3 months, then weekly.", "Emergency pill up to 120 hours; copper IUD within 5 days."],
  "pitfalls": ["Combined pills in early breastfeeding.", "Missing the delivery opportunity for PPIUCD.", "Refusing DMPA for late returns without a pregnancy check.", "Forgetting enzyme-inducer interactions."],
  "references": [tref("dmpa", "Chapters 2–7"), tref("iucd", "Section I, Technical aspects"), tref("cent", "sections Dose, Contraindications"), tref("whoec", "sections Methods, Eligibility"), tref("msfcoc", "sections Dosage, Missed tablets, Contraindications")]},
 nonClinical={"patientEducation": ["Methods do not protect against STIs or HIV; use condoms for dual protection.", "Return dates and warning signs for each method."], "lifestyleAndDiet": ["Stop smoking if over 35 and using combined pills."], "mdtReferrals": ["Family planning counsellor", "Gynaecology for sterilisation or IUCD problems"], "dischargeCriteria": ["Method provided and understood"], "followUpPlan": "IUCD at 6 weeks or after first period; DMPA every 3 months; pills review at 3 months (MoHFW)."})
NO_PAED = "Suitable for adolescents (no age restriction on medical grounds)."
T["pathophysiology"]["summary"] += " The right method is the one the woman will use: long-acting methods (IUCD, injectable) avoid daily adherence, while pills and condoms suit women who prefer control and quick return of fertility."
T["presentation"]["symptoms"] += ["Heavy or prolonged bleeding on DMPA (MoHFW)", "Lower abdominal pain, fever or abnormal discharge after IUCD insertion (PAINS warning signs) (MoHFW)"]
T["presentation"]["physicalSigns"] += ["Weight (DMPA users gain about 1–2 kg a year) (MoHFW)", "Missing or lengthened IUCD strings on speculum (MoHFW)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Pregnancy", "Missed or late period, nausea or breast tenderness; a urine pregnancy test settles it and must be done before starting a method when pregnancy cannot be excluded."),
 ("Irregular bleeding from pathology", "Postcoital, intermenstrual or persistent bleeding not explained by the method; speculum examination, VIA or Pap test and ultrasound settle it."),
 ("Pelvic infection with IUCD", "Lower abdominal pain, fever and discharge, most often in the first weeks after insertion; examination and treatment as PID (see Vaginal discharge and PID topic)."),
 ("IUCD expulsion or perforation", "Missing strings or pain after insertion, sometimes with pregnancy; pelvic ultrasound and, if not seen, abdominal X-ray settle it."),
 ("Ectopic pregnancy in a contraceptive user", "Pain and bleeding with a positive pregnancy test in an IUCD or progestogen user; transvaginal ultrasound settles it."),
 ("Migraine with aura developing on hormonal method", "New focal visual or sensory symptoms before headache; history settles it and hormonal methods should be stopped (MoHFW).")]]
for m in T["clinicalManagement"]:
    if m["id"] == "ec":
        m["actions"] = ["Levonorgestrel 1.5 mg or ulipristal 30 mg as early as possible, up to 120 hours; copper IUD within 5 days is the most effective (WHO).", "Start a regular method and arrange a pregnancy test if the next period is delayed (WHO)."]
T["clinicalManagement"].insert(3, step("side", "Side effects and switching", "At any visit", ["DMPA bleeding: reassure; NSAIDs or tranexamic acid and iron for prolonged bleeding; refer if it persists (MoHFW).", "Late DMPA return more than 4 months: pregnancy check, inject and use condoms for 7 days (MoHFW).", "Migraine with aura, BP 160/100 mmHg or more, or new thrombosis: stop oestrogen-containing methods and switch (MoHFW; MSF)."]))
T["diagnosticCriteria"].append({"criterion": "IUCD follow-up and duration (MoHFW)", "threshold": "Check at 6 weeks or after the first period; Cu IUCD 380A lasts 10 years and Cu IUCD 375 lasts 5 years."})
T["medicationPlan"]["regimens"].insert(1, rx("Injectable", "Progestogen injection", "Contraception (subcutaneous self-injection)", "Women of reproductive age", "Medroxyprogesterone acetate subcutaneous (DMPA-SC)", "104 mg in 0.65 mL", "SC", "Every 3 months", "Long term", NO_PAED, NOT_ABX, "No adjustment.", "Avoid in severe liver disease or liver tumour.", ["BP, bleeding pattern"], ["Same as DMPA-IM (MoHFW MEC 4 conditions)"], "dmpa", "Chapter 2, section MPA", sel="one-of", pref=False, use="Subcutaneous or self-injected form available and preferred by the woman."))
T["medicationPlan"]["regimens"][0]["selection"] = "one-of"; T["medicationPlan"]["regimens"][0]["preferred"] = True
T["teaching"]["learningObjectives"].append("Manage common side effects and late returns for injectable contraception.")
T["teaching"]["keyPoints"].append("Late DMPA return beyond 4 months: pregnancy check, inject, condoms for 7 days.")
T["teaching"]["pitfalls"].append("Removing an IUCD for every bleeding problem instead of examining for pathology.")

ALG = algo("contraception-choice", "Choosing a method under the national programme", "manage", "dmpa", "Chapter 4, section Eligibility (IUCD timing from the MoHFW IUCD manual; pills from MSF and FOGSI; emergency contraception from WHO)", [
 node("start", "start", "Woman requesting contraception", [("ec", None)], "Counsel on all methods; exclude pregnancy."),
 node("ec", "decision", "Unprotected sex in the last 5 days?", [("ecyes", "Yes"), ("timing", "No")]),
 node("ecyes", "outcome", "Emergency contraception: copper IUD within 5 days, or levonorgestrel 1.5 mg or ulipristal 30 mg up to 120 hours; then start a regular method", None),
 node("timing", "decision", "Just delivered or just had an abortion?", [("pp", "Delivered"), ("pa", "Abortion"), ("interval", "Neither")]),
 node("pp", "outcome", "PPIUCD within 10 minutes of placenta or 48 hours; if breastfeeding, DMPA or Mala-N from 6 weeks (Mala-N not recommended until 6 months); centchroman is safe in breastfeeding", None),
 node("pa", "outcome", "IUCD within 12 days of surgical abortion, or DMPA immediately or within 7 days", None),
 node("interval", "decision", "Wants a long-acting method?", [("iucd", "Yes"), ("short", "No")]),
 node("iucd", "outcome", "Cu IUCD 380A (10 years) or Cu IUCD 375 (5 years), or DMPA every 3 months", None),
 node("short", "decision", "Any contraindication to oestrogen? (BP 160/100 or more, migraine with aura, thrombosis, smoker over 35)", [("cent", "Yes"), ("coc", "No")]),
 node("cent", "outcome", "Copper IUCD or condoms; DMPA unless migraine with aura (MoHFW); centchroman only if no cardiovascular risk factor (FOGSI)", None),
 node("coc", "outcome", "Mala-N daily, or centchroman weekly; condoms for dual protection", None)])

VIG = "Rekha, a 22-year-old woman from a village near Jaipur, delivered her first baby by normal vaginal birth 6 hours ago at a community health centre and is exclusively breastfeeding. She wants to wait at least 3 years before her next pregnancy but is worried that 'the copper-T causes cancer' and that injections will stop her milk. Her BP is 118/74 mmHg and she has no medical problems."

EXP = [
 explain("pathophysiology", "How each method works, and why that matters", "Why does the mechanism change your advice?",
  "Combined pills such as Mala-N suppress ovulation through oestrogen and progestogen, so they work only when taken every day and carry oestrogen-related risks — thrombosis, raised blood pressure and stroke in women with migraine with aura or who smoke over 35. DMPA (Antara) suppresses ovulation for 3 months from a single injection, so adherence is easy, but return of fertility can take 7–10 months. Centchroman (Chhaya) is a non-steroidal selective oestrogen receptor modulator taken weekly after the first 3 months; it is safe during breastfeeding. Copper IUCDs are toxic to sperm and work for 5–10 years, and inserted within 5 days of unprotected sex they are the most effective emergency contraception."),
 explain("signs-symptoms", "Eligibility and the warning signs", "What do you check before and after starting a method?",
  "Most women can use most methods, and no pelvic examination or blood test is needed before starting DMPA or pills. The key checks are pregnancy, blood pressure, migraine with aura, past thrombosis, smoking and breastfeeding status. Blood pressure of 160/100 mmHg or more, breastfeeding under 6 weeks and unexplained vaginal bleeding are category 4 conditions for DMPA. After insertion of an IUCD, teach the PAINS warning signs — period problems or pregnancy, abdominal pain, infection or discharge, not feeling well, and string problems. On DMPA, irregular bleeding and amenorrhoea are expected and are the commonest reason women stop, so counselling in advance improves continuation."),
 explain("investigations", "When tests are needed", "Which investigations matter in contraceptive care?",
  "A urine pregnancy test is needed when pregnancy cannot be reasonably excluded, and after a late return for DMPA (more than 4 months since the last injection). Blood pressure is measured before starting oestrogen-containing pills and at follow-up. A speculum and bimanual examination is required before IUCD insertion to look for cervicitis or pelvic infection, and the strings are checked at the 6-week visit or after the first period. Missing strings need a pelvic ultrasound to distinguish expulsion from displacement or perforation. Routine bone density testing is not recommended for DMPA users."),
 explain("management", "Using every contact to offer a method", "How do you make contraception happen in practice?",
  "The most effective moments are immediately after delivery and after abortion, when women are in contact with the health system. A post-placental or 48-hour PPIUCD, or a post-abortion IUCD within 12 days of a surgical abortion, gives years of protection without a separate visit. Breastfeeding women can start DMPA from 6 weeks and centchroman at any time; combined pills are avoided before 6 weeks and not recommended until 6 months. Emergency contraception should be offered whenever a woman reports unprotected sex in the past 5 days. Side effects are managed rather than used as a reason to stop: NSAIDs or tranexamic acid with iron for DMPA bleeding, and a switch of method when a contraindication appears. Every woman should hear that these methods do not protect against STIs or HIV.")]

QS = [
 bq("q1", "A 22-year-old woman delivered her first baby vaginally 6 hours ago and is exclusively breastfeeding. She wants to delay the next pregnancy for at least 3 years and has no medical problems. BP is 118/74 mmHg. She is willing to consider an IUCD after counselling.", "What is the best option to offer now?",
  [("Combined pill (Mala-N) starting today", "Combined pills are contraindicated before 6 weeks postpartum in breastfeeding women (MSF)."),
   ("DMPA injection today", "In breastfeeding women DMPA is started from 6 weeks postpartum (MoHFW)."),
   ("Post-partum IUCD within 48 hours of delivery", "Correct. PPIUCD can be inserted within 48 hours of vaginal delivery and gives long-acting protection (MoHFW IUCD manual)."),
   ("No method until her periods return", "Waiting misses the delivery opportunity; ovulation can return before the first period."),
   ("Emergency contraceptive pill", "She has not had unprotected sex since delivery; she needs a regular method.")],
  "C", "Use the immediate postpartum window for long-acting contraception.", "PPIUCD within 10 minutes of the placenta or within 48 hours of vaginal birth."),
 bq("q2", "A 30-year-old woman on DMPA returns for her injection 18 weeks after the last dose, having been away visiting family. She has had unprotected sex 3 days ago and not since the last 2 weeks before that. Her urine pregnancy test today is negative.", "What should be done?",
  [("Give the injection and no further action", "She is more than 4 months late (a 'dropout'); she needs backup and emergency contraception consideration."),
   ("Refuse the injection until her next period", "This leaves her unprotected; she can be injected after pregnancy is reasonably excluded."),
   ("Switch to a combined pill only", "Switching does not address the recent unprotected sex."),
   ("Offer emergency contraception for the recent unprotected sex, give the injection and advise condoms for 7 days", "Correct. Late beyond 4 months: pregnancy check, inject, backup for 7 days (MoHFW); unprotected sex within 5 days warrants emergency contraception (WHO)."),
   ("Insert an IUCD without discussion", "An IUCD within 5 days is effective emergency contraception, but the choice must follow counselling and consent.")],
  "D", "Manage a late DMPA return safely.", "More than 4 months late: pregnancy check, inject, condoms 7 days, and consider emergency contraception."),
 bq("q3", "A 36-year-old woman who smokes 15 bidis a day and has migraine preceded by flashing zigzag lights asks for 'the daily pill' because her sister uses it. She has two children aged 6 and 9, wants no more for now but is not ready for sterilisation, and has regular periods. BP is 132/84 mmHg and pelvic examination is normal.", "Which method is most appropriate to recommend?",
  [("Mala-N combined pill", "Combined pills are contraindicated with migraine with neurological signs and in smokers over 35 (MSF)."),
   ("A copper IUCD", "Correct. A non-hormonal long-acting method avoids oestrogen risks and suits a woman wanting no more children for now (MoHFW)."),
   ("Mala-N with aspirin to reduce stroke risk", "Adding aspirin does not make combined pills safe in migraine with aura."),
   ("Emergency contraceptive pills whenever needed", "Repeated emergency pills are not a regular method."),
   ("No contraception until she stops smoking", "She needs effective contraception now; several safe methods exist.")],
  "B", "Identify contraindications to oestrogen and choose a safe alternative.", "Migraine with aura or smoking over 35: avoid combined pills; offer IUCD, DMPA or other methods.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA = T["evidenceAudit"]
EA["unverifiedSections"].insert(0, "The FOGSI centchroman brochure gives no dose or year; the 30 mg dose is from a BMJ Open 2019 scoping review. Condoms and sterilisation have no medicine rows.")
P = T["medicationPlan"]; R = P["regimens"]
P["note"] = P["note"].replace("centchroman from FOGSI;", "centchroman schedule and cautions from FOGSI, dose from BMJ Open 2019; postpartum timing for non-breastfeeding women from NHSRC; DMPA bleeding doses from the MoHFW MPA manual;")
for r in R:
    n = r["genericName"]
    if n.startswith("Medroxyprogesterone"):
        r["adjustments"] = [("Paediatric: Adolescents under 18 years: WHO MEC category 2, benefits generally outweigh risks (MoHFW)." if a.startswith("Paediatric:") else "CLD: Avoid in severe liver disease or liver tumour (general pharmacology)." if a.startswith("CLD:") else a) for a in r["adjustments"]]
    if n.startswith("Ethinylestradiol"):
        r["adjustments"].append("Missed pills in week 3: finish the active pills and start a new pack without the inactive tablets (MSF).")
        r["contraindications"] = ["Breastfeeding under 6 weeks, hypertension, thromboembolism, stroke, migraine with aura, smoking over 35, breast cancer, hyperlipidaemia (MSF)", "Not breastfeeding: not before 3 weeks postpartum (NHSRC)"]
    if n.startswith("Centchroman"):
        r["sourceEdition"] = "FOGSI Pankh brochure (undated), section Dose schedule; dose from BMJ Open 2019;9(10)"
        r["contraindications"] = ["Heart disease, stroke, smoking, diabetes, high blood pressure, high cholesterol, tuberculosis, chronic cervicitis, polycystic ovarian disease, cervical dysplasia, recent jaundice (FOGSI)"]
        r["adjustments"].append("Missed pill: take it as soon as possible; missed by more than 7 days, restart as a new user (NHSRC).")
P["branches"].append({"label": "Bleeding on DMPA", "entryCriteria": "Prolonged or heavy bleeding on DMPA after pregnancy and gynaecological causes are excluded."})
common = dict(k="dmpa", loc="Chapter 7, section 7.2.1")
R.append(rx("Bleeding on DMPA", "First-line", "Prolonged or heavy bleeding on DMPA", "Women", "Ibuprofen", "400 mg", "Oral", "Three times daily", "5 days",
  "Adolescents: same dose (MoHFW).", NOT_ABX, "Avoid in significant renal impairment (general pharmacology).", "Avoid in severe liver disease (general pharmacology).", ["Bleeding pattern, haemoglobin"], ["Peptic ulcer, NSAID allergy"], sel="one-of", pref=True, **common))
R.append(rx("Bleeding on DMPA", "First-line", "Prolonged or heavy bleeding on DMPA", "Women", "Tranexamic acid", "500 mg", "Oral", "Three times daily", "5 days",
  "Adolescents: same dose (MoHFW).", NOT_ABX, "Reduce dose in renal impairment (general pharmacology).", "No adjustment.", ["Bleeding pattern"], ["Active thromboembolism or high thrombosis risk"], sel="one-of", pref=False, use="NSAIDs contraindicated or ineffective.", **common))
R.append(rx("Bleeding on DMPA", "Hormonal", "Heavy bleeding on DMPA not controlled by NSAID or tranexamic acid", "Women", "Ethinylestradiol", "50 µg", "Oral", "Once daily", "21 days",
  "Adolescents: same dose (MoHFW).", NOT_ABX, "No adjustment.", "Avoid in liver disease (general pharmacology).", ["Bleeding pattern, BP"], ["Any oestrogen contraindication (MEC 4)"], **common))
for m in T["clinicalManagement"]:
    if m["id"] == "method":
        m["actions"] = ["Offer PPIUCD or post-abortion IUCD at the time of delivery or abortion (MoHFW).",
                        "Breastfeeding: DMPA from 6 weeks postpartum (MoHFW). Not breastfeeding: DMPA from 4 weeks postpartum without backup (MoHFW; NHSRC).",
                        "Combined pill not before 6 weeks postpartum with breastfeeding (MSF) and not before 3 weeks if not breastfeeding (thrombosis risk, NHSRC).",
                        "After medical abortion: IUCD once completion is confirmed, around day 15 after the first pill (MoHFW; NHSRC)."]
    if m["id"] == "ec":
        m["actions"][1] = "Start a regular method and arrange a pregnancy test if the next period is delayed; after ulipristal, wait until the 6th day before starting a progestogen method (WHO)."
    if m["id"] == "side":
        m["actions"][0] = "DMPA bleeding: reassure; ibuprofen 400 mg or tranexamic acid 500 mg three times daily for 5 days, then ethinylestradiol 50 µg daily for 21 days if heavy; iron; refer if it persists (MoHFW)."
        m["actions"][2] = "Migraine with aura on DMPA: stop MPA and switch to a non-oestrogen method; BP 160/100 mmHg or more or new thrombosis: stop oestrogen-containing methods and switch (MoHFW; MSF)."
    if m["id"] == "follow":
        m["actions"][0] = "IUCD at 6 weeks or after the first menstruation, whichever is earlier (MoHFW)."
T["presentation"]["redFlags"] = [("Migraine with aura on DMPA: stop MPA and switch to a non-oestrogen method (MoHFW)" if f.startswith("Migraine with aura") else f) for f in T["presentation"]["redFlags"]]
T["nonClinicalManagement"]["followUpPlan"] = "IUCD at 6 weeks or after the first menstruation, whichever is earlier; DMPA every 3 months; pills review at 3 months (MoHFW)."
nodes = {n["id"]: n for n in T["algorithms"][0]["nodes"]}
nodes["pp"]["text"] = "PPIUCD within 10 minutes of placenta or 48 hours; breastfeeding: DMPA from 6 weeks, centchroman any time, Mala-N not until 6 months; not breastfeeding: DMPA from 4 weeks, Mala-N not before 3 weeks"
nodes["pa"]["text"] = "Surgical abortion: IUCD within 12 days; medical abortion: IUCD once completion is confirmed (around day 15); DMPA immediately or within 7 days"
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("or a post-abortion IUCD within 12 days of a surgical abortion,", "or a post-abortion IUCD within 12 days of a surgical abortion (around day 15 after a medical abortion, once completion is confirmed),")
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q2":
        q["vignette"] = "A 30-year-old woman on DMPA returns for her injection 18 weeks after the last dose, having been away visiting family. She had unprotected sex once, 3 days ago, and no other sex in the previous 2 weeks. Her urine pregnancy test today is negative and she wants to continue DMPA."
        for o in q["options"]:
            if o["id"] == "D":
                o["text"] = "Levonorgestrel 1.5 mg now, give the injection and advise condoms for 7 days"
                o["explanation"] = "Correct. Late beyond 4 months: pregnancy check, inject, backup for 7 days (MoHFW). Levonorgestrel suits sex 3 days ago and, unlike ulipristal, does not require a 5-day wait before DMPA (WHO)."
        q["keyPoint"] = "More than 4 months late: pregnancy check, inject, condoms 7 days; levonorgestrel if recent unprotected sex."
T["teaching"]["references"] += [tref("centbmj", "section Results (dose)"), tref("nhsrcfp", "sections Injectable, Centchroman, Post-abortion")]

save("t74_contraception.json", [T])
