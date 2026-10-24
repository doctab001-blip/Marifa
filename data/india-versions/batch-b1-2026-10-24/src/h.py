"""Helpers for India batch 1 topic payloads (DiseaseDetailSchema shape)."""
import json, os, uuid
TODAY = "2026-10-24"
VERSION = "india-b1-2026-10-24-v1"
S = {
 "dka":   ("Standard Treatment Workflow: Diabetic Ketoacidosis (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567244_diabetic_ketoacidosis.pdf", "ICMR STW, July 2022"),
 "ada24": ("Hyperglycemic crises in adults: a look at the 2024 consensus report (ADA/EASD/JBDS/AACE/DTS), Cleveland Clinic Journal of Medicine", "https://www.ccjm.org/content/92/3/152.full.pdf", "Cleve Clin J Med 2025;92(3), summarising Umpierrez et al., Diabetes Care 2024"),
 "ispad": ("ISPAD Clinical Practice Consensus Guidelines 2022: Diabetic ketoacidosis and hyperglycemic hyperosmolar state", "https://renaissance.stonybrookmedicine.edu/system/files/Ch.11._ISPAD_Guidelines_DKA_HHS_Pediatric_Diabetes_2022-_.pdf", "Pediatric Diabetes 2022;23:835-856"),
 "epi":   ("Standard Treatment Workflow: Epilepsy (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952345_neurology_epilepsy.pdf", "ICMR STW, October 2019"),
 "lev":   ("Levetiracetam injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=e86dc508-4d22-493b-bdf1-408b6484d3f1&type=display", "DailyMed label"),
 "vpa":   ("Valproate sodium injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=8d5fc1c1-d3c0-497e-971b-6c4dba9a3fad&type=display", "DailyMed label, rev. 3/2026"),
 "copd":  ("Standard Treatment Workflow: Chronic Obstructive Pulmonary Disease (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952329_pulmonology_chronic_obstructive_pulmonary_disease.pdf", "ICMR STW, October 2019"),
 "ntg":   ("National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes (NCDC-ICMR)", "https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf", "Version 2.0, November 2025"),
 "aki":   ("Standard Treatment Workflow: Acute Kidney Injury (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1784807239_acutekidneyinjury-updated.pdf", "ICMR STW, July 2026"),
 "hf":    ("Standard Treatment Workflow: Heart Failure — a breathless patient (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1768823345_cardiology_1-3.pdf", "ICMR STW, January 2026"),
 "arni":  ("Sacubitril and valsartan tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=487102e3-f319-836b-e063-6394a90a4438", "DailyMed label"),
 "spiro": ("Spironolactone tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8a66d90e-5450-4716-8c01-e7dc1967d00d", "DailyMed label"),
 "gdm":   ("Diagnosis & Management of Gestational Diabetes Mellitus: Technical and Operational Guidelines (MoHFW, Government of India)", "https://nhm.gov.in/New_Updates_2018/NHM_Components/RMNCH_MH_Guidelines/Gestational-Diabetes-Mellitus.pdf", "MoHFW national guidelines 2018"),
 "met":   ("Metformin hydrochloride tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b8004451-7b26-425b-b5ea-cbb1b08e30e3", "DailyMed label"),
 "ugib":  ("Standard Treatment Workflow: Acute Gastrointestinal Bleed in Adults, Part A (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567564_gastrointestinal_bleed_part_a.pdf", "ICMR STW, July 2020"),
 "terli": ("Terlipressin for injection (TERLIVAZ), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=3a35b86c-f451-4fac-8499-43019e4da354&type=display", "DailyMed label (indication: hepatorenal syndrome)"),
 "uti":   ("Standard Treatment Workflow: Urinary Tract Infections (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1784807340_uti.pdf", "ICMR STW, July 2026"),
 "ispn":  ("Management of urinary tract infections and vesicoureteric reflux: key updates from revised Indian Society of Pediatric Nephrology guidelines 2023", "https://indianjnephrol.org/management-of-urinary-tract-infections-and-vesicoureteric-reflux-key-updates-from-revised-indian-society-of-pediatric-nephrology-guidelines-2023/", "Indian J Nephrol 2024;34:442-7"),
 "nitro": ("Nitrofurantoin capsules (macrocrystals), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=bc90b22e-e48a-4a22-b328-ca5bb2561864", "DailyMed label"),
 "genta": ("Gentamicin injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=8bdeef7f-ad8e-46e0-a872-e945eae51d68&type=display", "DailyMed label"),
 "psep":  ("Standard Treatment Workflow: Sepsis and Septic Shock in Children (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952338_paediatrics_sepsis_and_septic_shock_in_children.pdf", "ICMR STW, October 2019"),
 "anc":   ("Standard Treatment Workflow: Antenatal Management of Normal Pregnancy (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1771568619_ante-natalmanagementofnormalpregnancy-7.pdf", "ICMR STW, December 2025"),
}
NOT_ABX = "Not an antibiotic; penicillin allergy does not change this medicine."
NS = "Not specified in the cited sources."

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
                           "unverifiedSections": kw["unverified"] + ["Drug cautions and contraindications without a source tag are general pharmacology statements and need formulary confirmation."], "medscapeStatus": "unavailable",
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
