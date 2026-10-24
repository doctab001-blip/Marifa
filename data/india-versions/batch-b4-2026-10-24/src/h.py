"""Helpers for India batch 4 topic payloads (DiseaseDetailSchema shape)."""
import json, os, uuid
TODAY = "2026-10-24"
VERSION = os.environ.get("MARIFA_VERSION", "india-b4-2026-10-24")
DL = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="
STW = "https://www.icmr.gov.in/icmrobject/uploads/STWs/"
S = {
 "pa":    ("Standard Treatment Workflow: Approach to Acute Paralysis (ICMR / Department of Health Research)", STW + "1725952346_neurology_acute_paralysis.pdf", "ICMR STW, October 2019"),
 "jd":    ("Standard Treatment Workflow: Jaundice (ICMR / Department of Health Research)", STW + "1726567564_jaundice.pdf", "ICMR STW, July 2020"),
 "cadra": ("Standard Treatment Workflow: Cutaneous Adverse Drug Reactions, Part A (ICMR / Department of Health Research)", STW + "1725967367_cutaneous_part_a.pdf", "ICMR STW, July 2022"),
 "cadrb": ("Standard Treatment Workflow: Cutaneous Adverse Drug Reactions, Part B (ICMR / Department of Health Research)", STW + "1725967367_cutaneous_part_b.pdf", "ICMR STW, July 2022"),
 "t1dm":  ("Standard Treatment Workflow: Diabetes Mellitus Type 1 (ICMR / Department of Health Research)", STW + "1726567249_diabetes_mellitus_type_1.pdf", "ICMR STW, July 2022"),
 "bsi":   ("Standard Treatment Workflow: Bacterial Skin Infections (ICMR / Department of Health Research)", STW + "1725967368_bacterial_skin_infections.pdf", "ICMR STW, July 2022"),
 "phar":  ("Standard Treatment Workflow: Pharyngitis and Sore Throat (ICMR / Department of Health Research)", STW + "1725952349_ent_pharyngitis_and_sore_throat.pdf", "ICMR STW, October 2019"),
 "tbm":   ("Standard Treatment Workflow: Management of Adult Tubercular Meningitis (ICMR / Department of Health Research)", STW + "1725964688_6_adult_tbm_21032022.pdf", "ICMR STW, March 2022"),
 "ntep":  ("Standard Treatment Workflow: Drug Sensitive TB Treatment as per NTEP (ICMR / Department of Health Research)", STW + "1725964686_2_ntep_18032022.pdf", "ICMR STW, March 2022"),
 "atth":  ("Standard Treatment Workflow: Management of Antitubercular Therapy-Related Hepatitis (ICMR / Department of Health Research)", STW + "1725964686_3_antitubercular_therapy_hepatitis_18032022.pdf", "ICMR STW, March 2022"),
 "hmb":   ("Standard Treatment Workflow: Heavy Menstrual Bleeding (ICMR / Department of Health Research)", STW + "1768382529_updatedheavymenstrualbleeding.pdf", "ICMR STW, December 2025"),
 "aur":   ("Standard Treatment Workflow: Acute Urinary Retention in Men (ICMR / Department of Health Research)", STW + "1768800257_acuteurinaryretentioninmen3.pdf", "ICMR STW, November 2025"),
 "aud":   ("Standard Treatment Workflow: Management of Alcohol Use Disorders (ICMR / Department of Health Research)", STW + "1725952335_psychiatry_alcohol_use_disorders.pdf", "ICMR STW, October 2019"),
 "ntg":   ("National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes (NCDC-ICMR)", "https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf", "Version 2.0, November 2025"),
 "ntepmdr": ("NTEP Knowledge Base: weight-band doses for the longer oral M/XDR-TB regimen (Central TB Division, MoHFW)", "https://ntep.in/node/2626", "NTEP, accessed October 2026"),
 "ean":   ("European Academy of Neurology/Peripheral Nerve Society Guideline on diagnosis and treatment of Guillain-Barré syndrome", "https://ddd.uab.cat/pub/artpub/2023/300094/300094_1.pdf", "J Peripher Nerv Syst 2023;28:535-563"),
 "ada":   ("Glycemic goals and hypoglycemia: ADA Standards of Care in Diabetes 2025, section 6 (summary)", "https://www.linksmedicus.com/news/comprehensive-glycemic-goals-and-hypoglycemia-management-in-diabetes-2025-ada-standards/", "Diabetes Care 2025;48(Suppl 1), summarised"),
 "stan":  ("Streptococcal pharyngitis algorithm (Stanford CORIZA antimicrobial stewardship; dosing per AHA 2009 and IDSA 2012)", "https://www.stanfordchildrens.org/content/dam/sch/content-public/pdf/antimicrobial-stewardship-program/group-a-streptococcal-pharyngitis.pdf", "Stanford, updated August 2026"),
 "tams":  ("Tamsulosin (Flomax), US prescribing information (DailyMed)", DL + "c8beeebe-a666-4521-ba3b-a42f2e8a8851", "DailyMed label"),
 "mef":   ("Mefenamic acid capsules, US prescribing information (DailyMed)", DL + "d15733a9-d5fd-4d5f-86ce-e7ed8c706c7f", "DailyMed label"),
 "enox":  ("Enoxaparin sodium injection (Lovenox), US prescribing information (DailyMed)", DL + "afec67a9-ae16-4f48-bc0b-5331835e8aa2", "DailyMed label"),
 "zosyn": ("Piperacillin and tazobactam (Zosyn), US prescribing information (DailyMed)", DL + "8db6bd91-2106-4bfd-8cc8-38aaf1e18d17", "DailyMed label"),
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
