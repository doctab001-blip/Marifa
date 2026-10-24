"""Helpers for India batch 3 topic payloads (DiseaseDetailSchema shape)."""
import json, os, uuid
TODAY = "2026-10-24"
VERSION = os.environ.get("MARIFA_VERSION", "india-b3-2026-10-24")
DL = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="
STW = "https://www.icmr.gov.in/icmrobject/uploads/STWs/"
S = {
 # ICMR Standard Treatment Workflows (primary Indian sources)
 "af":     ("Standard Treatment Workflow: Atrial Fibrillation (ICMR / Department of Health Research)", STW + "1768823343_cardiology_1-1.pdf", "ICMR STW, January 2026"),
 "sa":     ("Standard Treatment Workflow: Stable Angina (ICMR / Department of Health Research)", STW + "1768823342_cardiology_1-6.pdf", "ICMR STW, January 2026"),
 "htn":    ("Standard Treatment Workflow: Hypertension in Adults (ICMR / Department of Health Research)", STW + "1778941063_hypertensioninadults_final.pdf", "ICMR STW, May 2026"),
 "rf":     ("Standard Treatment Workflow: Management of Respiratory Failure (ICMR / Department of Health Research)", STW + "1725952328_pulmonology_respiratory_failure.pdf", "ICMR STW, October 2019"),
 "copd":   ("Standard Treatment Workflow: Chronic Obstructive Pulmonary Disease (ICMR / Department of Health Research)", STW + "1725952329_pulmonology_chronic_obstructive_pulmonary_disease.pdf", "ICMR STW, October 2019"),
 "asthma": ("Standard Treatment Workflow: Asthma (ICMR / Department of Health Research)", STW + "1725952329_pulmonology_asthma.pdf", "ICMR STW, October 2019"),
 "app":    ("Standard Treatment Workflow: Appendicitis (ICMR / Department of Health Research)", STW + "1726567743_appendicitis.pdf", "ICMR STW, July 2022"),
 "gs":     ("Standard Treatment Workflow: Gall Stone Disease (ICMR / Department of Health Research)", STW + "1726567742_gall_stone_disease.pdf", "ICMR STW, July 2022"),
 "df":     ("Standard Treatment Workflow: Diabetic Foot (ICMR / Department of Health Research)", STW + "1726567742_diabetic_foot.pdf", "ICMR STW, July 2022"),
 "rs":     ("Standard Treatment Workflow: Renal and Ureteric Stones (ICMR / Department of Health Research)", STW + "1768800256_renalanduretericstones3.pdf", "ICMR STW, November 2025"),
 "aud":    ("Standard Treatment Workflow: Management of Alcohol Use Disorders (ICMR / Department of Health Research)", STW + "1725952335_psychiatry_alcohol_use_disorders.pdf", "ICMR STW, October 2019"),
 "ha":     ("Standard Treatment Workflow: Treatment of Major Catastrophic Headaches at Tertiary Centre (ICMR / Department of Health Research)", STW + "1725952344_neurology_headache.pdf", "ICMR STW, October 2019"),
 "ntg":    ("National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes (NCDC-ICMR)", "https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf", "Version 2.0, November 2025"),
 # International guidelines and reviews
 "acc23t": ("2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: Table 21, drugs for rate control", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11104284/table/T21", "Circulation 2024;149:e1-e156"),
 "msd":    ("Hypertensive Emergencies (MSD Manual Professional Version, Weir MR) — review, used where Indian sources give no IV therapy", "https://www.msdmanuals.com/professional/cardiovascular-disorders/hypertension/hypertensive-emergencies", "MSD Manual, full review February 2025, updated April 2026"),
 "btsniv": ("BTS/ICS Guideline for the Ventilatory Management of Acute Hypercapnic Respiratory Failure in Adults", "https://brit-thoracic.org.uk/document-library/guidelines/niv/btsics-guideline-for-the-ventilatory-management-of-acute-hypercapnic-respiratory-failure-in-adults", "Thorax 2016;71:ii1-ii35"),
 "btso2":  ("BTS Guideline for oxygen use in adults in healthcare and emergency settings: summary for hospital use (Web Appendix 3)", "https://www.brit-thoracic.org.uk/document-library/guidelines/emergency-oxygen/web-appendix-3-summary-of-guideline-for-hospital-use", "Thorax 2017;72 Suppl 1:i1-i89"),
 "wses":   ("Diagnosis and treatment of acute appendicitis: 2020 update of the WSES Jerusalem guidelines", "https://wjes.biomedcentral.com/track/pdf/10.1186/s13017-020-00306-3", "World J Emerg Surg 2020;15:27"),
 "tg":     ("Diagnostic criteria and severity grading of acute cholecystitis (Tokyo Guidelines TG07/13, reproduced in BMC Gastroenterology 2015, Table 1)", "https://bmcgastroenterol.biomedcentral.com/articles/10.1186/s12876-015-0365-4/tables/1", "BMC Gastroenterol 2015;15:111"),
 "iwgdf":  ("IWGDF/IDSA Guidelines on the Diagnosis and Treatment of Diabetes-related Foot Infections", "https://iwgdfguidelines.org/wp-content/uploads/2023/07/IWGDF-2023-04-Infection-Guideline.pdf", "IWGDF/IDSA 2023"),
 "ng118":  ("Renal and ureteric stones: assessment and management (NICE NG118)", "https://www.nice.org.uk/guidance/NG118/chapter/Recommendations", "NICE guideline NG118, 2019"),
 "baus":   ("British Association of Urological Surgeons standards for management of acute ureteric colic", "https://www.baus.org.uk/_userfiles/pages/files/Publications/Acute ureteric colic 2018.pdf", "J Clin Urol 2018;11(1):58-61"),
 "coe":    ("Pharmacotherapy options for alcohol use disorder in patients with alcohol-associated liver disease: a brief guide for clinicians", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10627592", "Clin Liver Dis 2023;21(5):125-129"),
 "sathi":  ("Thiamine: prevention and treatment of Wernicke's encephalopathy and chronic alcohol misuse (South African NEMLC evidence summary)", "https://www.health.gov.za/wp-content/uploads/2025/06/Thiamine-in-the-prevention-and-treatment-of-Wernickes-encephalopathy-and-chronic-alcohol-misuse-27October2022.pdf", "National Department of Health, South Africa, 27 October 2022"),
 "ggc":    ("Protocol for the management of alcohol withdrawal using a fixed benzodiazepine regime (NHS Greater Glasgow & Clyde)", "https://rightdecisions.scot.nhs.uk/media/fjvchtoo/mhs-mrg-27-inpatient-protocol-for-the-management-of-alcohol-withdrawl.pdf", "NHS GGC Mental Health Services, March 2023"),
 "cg150":  ("Headaches in over 12s: diagnosis and management (NICE CG150)", "https://www.nice.org.uk/guidance/cg150/chapter/Recommendations", "NICE clinical guideline CG150"),
 # Product labels (DailyMed) for doses the Indian sources do not give
 "apix":   ("Apixaban (Eliquis), US prescribing information (DailyMed)", DL + "e9481622-7cc6-418a-acb6-c5450daae9b0", "DailyMed label"),
 "riva":   ("Rivaroxaban (Xarelto), US prescribing information (DailyMed)", DL + "10db92f9-2300-4a80-836b-673e1ae91610", "DailyMed label"),
 "warf":   ("Warfarin sodium tablets, US prescribing information (DailyMed)", DL + "ba8b4ead-d080-91e7-e053-2995a90a82fe", "DailyMed label"),
 "enox":   ("Enoxaparin sodium injection (Lovenox), US prescribing information (DailyMed)", DL + "afec67a9-ae16-4f48-bc0b-5331835e8aa2", "DailyMed label"),
 "gtn":    ("Nitroglycerin sublingual tablets (Nitrostat), US prescribing information (DailyMed)", DL + "9a52da75-d0af-4237-96c0-0b12adfa8636", "DailyMed label"),
 "labet":  ("Labetalol hydrochloride injection, US prescribing information (DailyMed)", DL + "99a715a0-4579-410c-b102-7ef6fab8db55", "DailyMed label"),
 "nicar":  ("Nicardipine hydrochloride injection, US prescribing information (DailyMed)", DL + "7226a518-164b-4755-9624-1cc75c939063", "DailyMed label"),
 "para":   ("Acetaminophen injection (Ofirmev), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=9a38f63a-8852-6dab-e053-2a95a90a90d6&type=display", "DailyMed label"),
 "ketor":  ("Ketorolac tromethamine injection, US prescribing information (DailyMed)", DL + "0c2c75c9-ed7b-46a8-9543-429bf2d8f090", "DailyMed label, rev. April 2024"),
 "cdz":    ("Chlordiazepoxide hydrochloride capsules, US prescribing information (DailyMed)", DL + "e3ff8641-ae8a-4016-acb1-cb1b7890f5ed", "DailyMed label"),
 "suma":   ("Sumatriptan tablets (Imitrex), US prescribing information (DailyMed)", DL + "584abe73-8290-4484-ff8e-5890831c095e", "DailyMed label"),
 "sumasc": ("Sumatriptan injection (Imitrex), US prescribing information (DailyMed)", DL + "fee7d073-0b99-48f2-7985-0d8cf970894b", "DailyMed label"),
 "topa":   ("Topiramate (Topamax), US prescribing information (DailyMed)", DL + "21628112-0c47-11df-95b3-498d55d89593", "DailyMed label"),
 "cefx":   ("Cephalexin capsules (Keflex), US prescribing information (DailyMed)", DL + "68fba58a-7748-4581-8432-f5286c46d90a", "DailyMed label"),
 "clinda": ("Clindamycin hydrochloride capsules, US prescribing information (DailyMed)", DL + "2367340c-d297-4a3f-8253-6d27a0ed39cb", "DailyMed label"),
 "augm":   ("Amoxicillin and clavulanate potassium (Augmentin), US prescribing information (DailyMed)", DL + "174cc098-fe49-4f1a-87e2-601c7573f0db", "DailyMed label"),
 "zosyn":  ("Piperacillin and tazobactam (Zosyn), US prescribing information (DailyMed)", DL + "8db6bd91-2106-4bfd-8cc8-38aaf1e18d17", "DailyMed label"),
}
NOT_ABX = "Not an antibiotic; penicillin allergy does not change this medicine."
NS = "Not specified in the cited sources; check the formulary."
ADULT = "Adult guideline; paediatric dosing not given in the cited sources — seek paediatric advice."

def ref(k, loc):
    t, u, e = S[k]
    return {"title": t, "edition": f"{e}, {loc}", "url": u}

def tref(k, loc):
    t, u, e = S[k]
    return {"title": t, "edition": e, "url": u, "locator": loc}

def inv(tier, test, modality, target, normal, finding, rationale, k, loc, extra=None):
    d = {"tier": tier, "testName": test, "modalityTarget": modality, "targetCondition": target, "normalValue": normal,
         "expectedFinding": finding, "clinicalRationale": rationale, "references": [ref(k, loc)]}
    if extra:
        d["references"].append(ref(*extra))
    return d

def rx(branch, step, ind, group, name, dose, route, freq, dur, paed, pen, ckd, cld, mon, contra, k, loc,
       sel="all", pref=None, use=None, extra_adj=()):
    t, u, e = S[k]
    d = {"indication": ind, "patientGroup": group, "genericName": name, "dose": dose, "route": route, "frequency": freq,
         "duration": dur,
         "adjustments": [f"Paediatric: {paed}", f"Penicillin allergy: {pen}", f"CKD: {ckd}", f"CLD: {cld}", *extra_adj],
         "monitoring": mon, "contraindications": contra, "branch": branch, "step": step, "selection": sel,
         "sourceTitle": t, "sourceUrl": u, "sourceEdition": f"{e}, {loc}"}
    if pref is not None:
        d["preferred"] = pref
    if use:
        d["useWhen"] = use
    return d

def step(id, title, tf, actions, branches=None):
    d = {"id": id, "title": title, "timeframe": tf, "actions": actions}
    if branches:
        d["branches"] = [{"condition": c, "actions": a} for c, a in branches]
    return d

def new_id(title):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "marifa-india/" + title))

def topic(**kw):
    t = {"id": kw["id"], "title": kw["title"], "specialty": kw["specialty"], "authority": kw.get("authority", "ICMR"),
         "status": "under_review", "version": VERSION, "lastReviewed": TODAY, "pillar": kw["pillar"],
         "clinicalReviewStatus": "pending",
         "evidenceAudit": {"checkedOn": TODAY, "status": "incomplete", "scope": kw["scope"], "findings": kw["findings"],
                           "unverifiedSections": kw["unverified"] + ["Drug cautions and contraindications without a source tag are general pharmacology statements and need formulary confirmation.", "US labels (DailyMed) were used where Indian sources give no dose; confirm against the Indian product label (CDSCO) and hospital formulary."], "medscapeStatus": "unavailable",
                           "originalVersionIds": [kw["id"]]},
         "pathophysiology": {"summary": kw["summary"], "keyMechanisms": kw["mechanisms"]},
         "presentation": kw["presentation"],
         "differentials": [{"condition": c, "distinguishingFeatures": f} for c, f in kw["differentials"]],
         "diagnosticCriteria": [{"criterion": c, "threshold": th} for c, th in kw["criteria"]],
         "investigations": {"ruleIn": kw["ruleIn"], "ruleOut": kw["ruleOut"]},
         "clinicalManagement": kw["management"],
         "medicationPlan": {"status": "source-verified",
                            "branches": [{"label": l, "entryCriteria": e} for l, e in kw["branches"]],
                            "regimens": kw["regimens"], "note": kw["medNote"]},
         "teaching": kw["teaching"], "nonClinicalManagement": kw["nonClinical"]}
    if kw.get("comparison"):
        t["guidelineComparison"] = kw["comparison"]
    return t

def save(name, items):
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
    json.dump(items, open(p, "w"), indent=1, ensure_ascii=False)
    print("saved", p, len(items))
