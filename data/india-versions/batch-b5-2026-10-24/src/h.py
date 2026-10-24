"""Helpers for India batch 5 topic payloads (DiseaseDetailSchema shape)."""
import json, os, uuid
TODAY = "2026-10-24"
VERSION = os.environ.get("MARIFA_VERSION", "india-b5-2026-10-24")
DL = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="
STW = "https://www.icmr.gov.in/icmrobject/uploads/STWs/"
S = {
 "brstw": ("Standard Treatment Workflow: Breast Cancer (ICMR / Department of Health Research)", STW + "1726568905_breast_cancer.pdf", "ICMR STW, July 2020"),
 "ofcc":  ("Operational Framework: Management of Common Cancers (Ministry of Health and Family Welfare, Government of India)", "https://platform.who.int/docs/default-source/mca-documents/policy-documents/operational-guidance/IND-RH-47-02-OPERATIONAL-GUIDANCE-2016-eng-Operational-Framework-Management-of-Common-Cancers.pdf", "MoHFW, 2016"),
 "tam":   ("Tamoxifen citrate tablets, US prescribing information (DailyMed)", DL + "a596c715-8e30-43c1-aba3-4fe5de6729fa", "DailyMed label"),
 "let":   ("Letrozole tablets, US prescribing information (DailyMed)", DL + "fe0e4d4b-436d-a36d-e053-6294a90a973d", "DailyMed label"),
 "ana":   ("Anastrozole tablets, US prescribing information (DailyMed)", DL + "f86d2158-b078-3f74-e053-6394a90aa4b6", "DailyMed label"),
 "hbtg":  ("Technical Guidelines for Diagnosis and Management of Hepatitis B (National Viral Hepatitis Control Program, MoHFW)", "https://nvhcp.mohfw.gov.in/common_libs/TechnicalGuidelines-for-Diagnosis-management-of-Hepatitis-B.pdf", "NVHCP, 2019"),
 "vh":    ("National Guidelines for Diagnosis and Management of Viral Hepatitis (National Viral Hepatitis Control Program, MoHFW)", "https://nvhcp.mohfw.gov.in/common_libs/diagnosis-management-viral-hepatitis.pdf", "NVHCP, 2018"),
 "arf":   ("Standard Treatment Workflow: Acute Rheumatic Fever (ICMR / Department of Health Research)", STW + "1726651147_1_acute_rheumatic_fever.pdf", "ICMR STW, July 2024"),
 "ntg":   ("National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes (NCDC-ICMR)", "https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf", "Version 2.0, November 2025"),
 "cac":   ("CAC Training and Service Delivery Guidelines for safe abortion care (Ministry of Health and Family Welfare, Government of India)", "https://nhm.gov.in/images/pdf/programmes/maternal-health/guidelines/CAC_Training_&_Service_Guidelines_2023.pdf", "MoHFW, 2023"),
 "nice":  ("Ectopic pregnancy and miscarriage: diagnosis and initial management (NICE guideline NG126)", "https://www.nice.org.uk/guidance/ng126/chapter/Recommendations", "NICE NG126, 2019, updated 2023"),
 "oman":  ("Guidelines of Ectopic Pregnancy (Ministry of Health, Sultanate of Oman; Khoula Hospital Obstetrics and Gynaecology)", "https://moh.gov.om/media/bjwmnavh/guidelines-of-ectopic-pregnancy.pdf", "MoH/DGKH/GUD/009, September 2021"),
 "smfm":  ("Society for Maternal-Fetal Medicine Consult Series #67: Maternal sepsis (endorsed by ACOG)", "https://doi.org/10.1016/j.ajog.2023.05.019", "Am J Obstet Gynecol, September 2023"),
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
