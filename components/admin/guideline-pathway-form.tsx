"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "@/components/icons-3d";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { DraftMarkdownCanvas } from "@/components/admin/draft-markdown-canvas";
import type { DraftTopic } from "@/lib/draft-markdown";

type Path = Array<string | number>;
type JsonObject = Record<string, unknown>;

const LONG_TEXT_KEYS = new Set([
  "summary", "clinicalScenario", "distinguishingFeatures", "modalityTarget", "targetCondition",
  "expectedFinding", "clinicalRationale", "note", "followUpPlan", "selection_rationale",
  "instruction", "clinical_question", "decision_rationale", "reason",
  "text", "prompt", "guidance", "question", "answer", "scope",
]);

const SELECT_OPTIONS: Record<string, string[]> = {
  authority: ["MOH", "SHC", "PHA", "NICE", "Textbook", "Other"],
  pillar: ["Urgent Care", "Chronic Care", "Keep Well", "Planned Care", "Safe Birth", "Palliative Care"],
  tier: ["laboratory", "firstLineImaging", "advancedImaging", "specializedAdjunctive"],
  status: ["source-verified", "no-drug-indicated", "local-protocol-required"],
  issuer: ["MOH", "SHC", "ADA", "ACC/AHA", "ESC", "NICE", "PHA", "Textbook", "Other"],
  kind: ["exact", "not-indicated"],
};

function labelFor(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizedPath(path: Path) {
  return path.map((part) => typeof part === "number" ? "*" : part).join(".");
}

function sourceTemplate() {
  return { id: crypto.randomUUID(), title: "", issuer: "Other", edition: "", url: "https://", locator: "", primary_source: false };
}

function evidenceTemplate() {
  return { sources: [sourceTemplate()], selection_rationale: "" };
}

function medicineTemplate(index = 1) {
  return {
    id: `new-medicine-${index}`, medicine: "", indication: "", patient_group: "",
    loading_dose: { kind: "not-indicated", reason: "" },
    maintenance_dose: { kind: "not-indicated", reason: "" }, route: "",
    contraindications: [""], adjustments: [""], monitoring: [""], evidence: evidenceTemplate(),
  };
}

function newArrayItem(path: Path, existing: unknown[]) {
  const key = normalizedPath(path);
  const sample = existing[0];
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (key.endsWith("references")) return { title: "", edition: "", url: "https://" };
  if (key.endsWith("differentials")) return { condition: "", distinguishingFeatures: "" };
  if (key.endsWith("investigations.ruleIn") || key.endsWith("investigations.ruleOut")) return { tier: "laboratory", testName: "", modalityTarget: "", targetCondition: "", expectedFinding: "", clinicalRationale: "" };
  if (key.endsWith("clinicalManagement")) return { id: `new-step-${existing.length + 1}`, title: "", timeframe: "", actions: [""] };
  if (key.endsWith("clinicalManagement.*.branches")) return { condition: "", actions: [""] };
  if (key.endsWith("medicationPlan.regimens")) return { indication: "", patientGroup: "", genericName: "", dose: "", route: "", frequency: "", duration: "", adjustments: [""], monitoring: [""], sourceTitle: "", sourceUrl: "https://", sourceEdition: "" };
  if (key.endsWith("teaching.guidedApproach")) return { title: "", prompt: "", guidance: "" };
  if (key.endsWith("teaching.checkpoints")) return { question: "", answer: "" };
  if (key.endsWith("sources")) return sourceTemplate();
  if (key.endsWith("granularPathway.Investigations")) return { id: `new-investigation-${existing.length + 1}`, title: "", timeframe: "", steps: [{ test: "", clinical_question: "", expected_finding: "", decision_rationale: "", timeframe: "" }], evidence: evidenceTemplate() };
  if (key.endsWith("Investigations.*.steps")) return { test: "", clinical_question: "", expected_finding: "", decision_rationale: "", timeframe: "" };
  if (key.endsWith("Treatment_Plan")) return { id: `new-treatment-${existing.length + 1}`, title: "", timeframe: "", actions: [{ instruction: "", timeframe: "" }], Medicines_Doses: [], branches: [], evidence: evidenceTemplate() };
  if (key.endsWith("clinicalManagement.*.actions") || key.endsWith("clinicalManagement.*.branches.*.actions")) return "";
  if (key.endsWith(".actions")) return { instruction: "", timeframe: "" };
  if (key.endsWith("Medicines_Doses")) return medicineTemplate(existing.length + 1);
  if (key.endsWith("Treatment_Plan.*.branches")) return { id: `new-branch-${existing.length + 1}`, condition: "", actions: [{ instruction: "", timeframe: "" }], Medicines_Doses: [], evidence: evidenceTemplate() };
  if (sample && typeof sample === "object") {
    const clone = structuredClone(sample) as JsonObject;
    for (const property of Object.keys(clone)) {
      const value = clone[property];
      if (typeof value === "string") clone[property] = property === "url" ? "https://" : property === "id" ? `new-${existing.length + 1}` : "";
      else if (typeof value === "number") clone[property] = 0;
      else if (typeof value === "boolean") clone[property] = false;
      else if (Array.isArray(value)) clone[property] = value.length ? [newArrayItem([...path, existing.length, property], value)] : [];
    }
    return clone;
  }
  return "";
}

function setAtPath(root: DiseaseDetail, path: Path, value: unknown) {
  const next = structuredClone(root) as unknown as JsonObject;
  let cursor: unknown = next;
  path.forEach((part, index) => {
    if (index === path.length - 1) (cursor as JsonObject)[part] = value;
    else cursor = (cursor as JsonObject)[part];
  });
  return next as unknown as DiseaseDetail;
}

function FieldEditor({ name, value, path, update }: { name: string; value: unknown; path: Path; update: (path: Path, value: unknown) => void }) {
  if (Array.isArray(value)) {
    return <div className="pathway-array-field">
      <div className="pathway-field-heading"><h4>{labelFor(name)}</h4><button type="button" className="ui-button ui-button-secondary pathway-add-button" onClick={() => update(path, [...value, newArrayItem(path, value)])}><Plus size={14} />Add item</button></div>
      {value.length === 0 ? <p className="pathway-empty-list">No items added.</p> : value.map((item, index) => (
        <div className={`pathway-array-item${typeof item === "object" && item !== null ? " is-object" : ""}`} key={`${normalizedPath(path)}-${index}`}>
          {typeof item === "string" ? <textarea aria-label={`${labelFor(name)} item ${index + 1}`} value={item} onChange={(event) => update([...path, index], event.target.value)} rows={2} required /> : <ValueEditor value={item} path={[...path, index]} update={update} />}
          <button type="button" className="pathway-remove-button" onClick={() => update(path, value.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${labelFor(name)} item ${index + 1}`}><Trash2 size={14} />Remove</button>
        </div>
      ))}
    </div>;
  }
  if (value && typeof value === "object") {
    return <fieldset className="pathway-object-field"><legend>{labelFor(name)}</legend><ValueEditor value={value} path={path} update={update} /></fieldset>;
  }
  if (typeof value === "boolean") {
    return <label className="pathway-checkbox"><input type="checkbox" checked={value} onChange={(event) => update(path, event.target.checked)} />{labelFor(name)}</label>;
  }
  if (typeof value === "number") {
    return <label className="pathway-input-field"><span>{labelFor(name)}</span><input type="number" step="any" value={value} onChange={(event) => update(path, Number(event.target.value))} required /></label>;
  }
  const stringValue = typeof value === "string" ? value : "";
  const options = SELECT_OPTIONS[name];
  if (options) return <label className="pathway-input-field"><span>{labelFor(name)}</span><select value={stringValue} onChange={(event) => {
    const nextValue = event.target.value;
    if (name === "kind") update(path.slice(0, -1), nextValue === "exact" ? { kind: "exact", amount: 1, unit: "", frequency: "", duration: "" } : { kind: "not-indicated", reason: "" });
    else update(path, nextValue);
  }}>{options.map((option) => <option key={option} value={option}>{labelFor(option)}</option>)}</select></label>;
  const multiline = LONG_TEXT_KEYS.has(name) || stringValue.length > 90;
  return <label className="pathway-input-field"><span>{labelFor(name)}</span>{multiline ? <textarea value={stringValue} onChange={(event) => update(path, event.target.value)} rows={4} required /> : <input type={name.toLowerCase().includes("url") ? "url" : name === "lastReviewed" ? "date" : "text"} value={stringValue} onChange={(event) => update(path, event.target.value)} required />}</label>;
}

function ValueEditor({ value, path, update }: { value: unknown; path: Path; update: (path: Path, value: unknown) => void }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return <div className="pathway-object-grid">{Object.entries(value as JsonObject).map(([name, child]) => <FieldEditor key={`${normalizedPath(path)}-${name}`} name={name} value={child} path={[...path, name]} update={update} />)}</div>;
}

function OptionalSection({ title, present, onAdd, onRemove, children }: { title: string; present: boolean; onAdd: () => void; onRemove: () => void; children: React.ReactNode }) {
  return <div className="pathway-optional-section"><div className="pathway-field-heading"><h4>{title}</h4>{present ? <button type="button" className="pathway-remove-button" onClick={onRemove}><Trash2 size={14} />Remove section</button> : <button type="button" className="ui-button ui-button-secondary pathway-add-button" onClick={onAdd}><Plus size={14} />Add section</button>}</div>{present ? children : <p className="pathway-empty-list">This optional section is not included in the current version.</p>}</div>;
}

function SavePathwayButton() {
  return <button className="ui-button ui-button-primary" type="submit"><Save size={15} />Create new version</button>;
}

function toMarkdownTopic(disease: DiseaseDetail): DraftTopic {
  const investigations = [...disease.investigations.ruleIn, ...disease.investigations.ruleOut];
  return {
    title: disease.title, specialty: disease.specialty, authority: disease.authority, pillar: disease.pillar, lastReviewed: disease.lastReviewed,
    pathophysiology: { summary: disease.pathophysiology.summary, keyMechanisms: disease.pathophysiology.keyMechanisms },
    // The canvas exposes the same clinical facts as the first investigation; the
    // canonical schema keeps those facts on each investigation rather than at topic level.
    expectedFinding: investigations[0]?.expectedFinding ?? "Not recorded.", clinicalRationale: investigations[0]?.clinicalRationale ?? "Not recorded.",
    symptoms: disease.presentation.symptoms, physicalSigns: disease.presentation.physicalSigns, redFlags: disease.presentation.redFlags,
    differentials: disease.differentials,
    investigations: investigations.map(({ tier, testName, expectedFinding, clinicalRationale }) => ({ tier, testName, expectedFinding, clinicalRationale })),
    management: {
      firstLine: disease.clinicalManagement[0]?.actions ?? ["Not recorded."],
      secondLine: disease.clinicalManagement.slice(1).flatMap((step) => step.actions),
      nonPharmacological: disease.nonClinicalManagement.patientEducation,
      urgentReferralCriteria: disease.presentation.redFlags,
    },
  };
}

function applyMarkdownTopic(disease: DiseaseDetail, topic: DraftTopic): DiseaseDetail {
  const currentGroups = new Map<string, "ruleIn" | "ruleOut">();
  disease.investigations.ruleIn.forEach((item) => currentGroups.set(item.testName, "ruleIn"));
  disease.investigations.ruleOut.forEach((item) => currentGroups.set(item.testName, "ruleOut"));
  const existing = new Map([...disease.investigations.ruleIn, ...disease.investigations.ruleOut].map((item) => [item.testName, item]));
  const ruleIn: DiseaseDetail["investigations"]["ruleIn"] = [];
  const ruleOut: DiseaseDetail["investigations"]["ruleOut"] = [];
  topic.investigations.forEach((item) => {
    const prior = existing.get(item.testName);
    const next = { ...prior, tier: prior?.tier ?? "laboratory", testName: item.testName, expectedFinding: item.expectedFinding, clinicalRationale: item.clinicalRationale, modalityTarget: prior?.modalityTarget ?? item.testName, targetCondition: prior?.targetCondition ?? topic.title };
    (currentGroups.get(item.testName) === "ruleOut" ? ruleOut : ruleIn).push(next);
  });
  // Both canonical investigation groups are required. Keep an unchanged item in
  // a group if the Markdown author removed every item from it.
  if (!ruleIn.length) ruleIn.push(disease.investigations.ruleIn[0]);
  if (!ruleOut.length) ruleOut.push(disease.investigations.ruleOut[0]);
  return {
    ...disease, title: topic.title, specialty: topic.specialty, authority: topic.authority as DiseaseDetail["authority"], pillar: topic.pillar as DiseaseDetail["pillar"], lastReviewed: topic.lastReviewed,
    pathophysiology: { ...disease.pathophysiology, ...topic.pathophysiology },
    presentation: { ...disease.presentation, symptoms: topic.symptoms, physicalSigns: topic.physicalSigns, redFlags: topic.redFlags },
    differentials: topic.differentials, investigations: { ruleIn, ruleOut },
    clinicalManagement: disease.clinicalManagement.map((step, index) => index === 0 ? { ...step, actions: topic.management.firstLine } : index === 1 && topic.management.secondLine.length ? { ...step, actions: topic.management.secondLine } : step),
    nonClinicalManagement: { ...disease.nonClinicalManagement, patientEducation: topic.management.nonPharmacological },
  };
}

export function GuidelinePathwayForm({ disease, guidelineId, versionId, saveAction }: { disease: DiseaseDetail; guidelineId: string; versionId: string; saveAction: (formData: FormData) => Promise<void> }) {
  const [payload, setPayload] = useState(disease);
  const [issues, setIssues] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<"fields" | "markdown">("fields");
  const update = (path: Path, value: unknown) => setPayload((current) => setAtPath(current, path, value));
  const validate = (event: React.FormEvent<HTMLFormElement>) => {
    const result = DiseaseDetailSchema.safeParse(payload);
    if (result.success) { setIssues([]); return; }
    event.preventDefault();
    setIssues(result.error.issues.slice(0, 12).map((issue) => `${issue.path.map(String).join(" → ")}: ${issue.message}`));
  };

  return <form id="pathway-editor" action={saveAction} onSubmit={validate} className="admin-pathway-form">
    <input type="hidden" name="id" value={guidelineId} />
    <input type="hidden" name="versionId" value={versionId} />
    <input type="hidden" name="content" value={JSON.stringify(payload)} readOnly />

    {issues.length > 0 && <div className="admin-save-error pathway-validation-errors" role="alert"><strong>Correct these fields before saving:</strong><ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
    <div className="pathway-editor-mode" role="group" aria-label="Editor mode"><button type="button" className={`ui-button ${editorMode === "fields" ? "ui-button-primary" : "ui-button-secondary"}`} onClick={() => setEditorMode("fields")}>📋 Form View</button><button type="button" className={`ui-button ${editorMode === "markdown" ? "ui-button-primary" : "ui-button-secondary"}`} onClick={() => setEditorMode("markdown")}>📝 Bulk Text View</button></div>
    {editorMode === "markdown" && <DraftMarkdownCanvas topic={toMarkdownTopic(payload)} onApply={(topic) => setPayload((current) => applyMarkdownTopic(current, topic))} />}

    {editorMode === "fields" && <><section className="card pathway-form-section"><header><p className="eyebrow">Topic details</p><h3>Clinical topic</h3><p>Governance identifiers, status, and version are preserved automatically.</p></header><div className="pathway-object-grid">
      <FieldEditor name="title" value={payload.title} path={["title"]} update={update} />
      <FieldEditor name="specialty" value={payload.specialty} path={["specialty"]} update={update} />
      {payload.speciality !== undefined && <FieldEditor name="speciality" value={payload.speciality} path={["speciality"]} update={update} />}
      {payload.sub_specialities !== undefined && <FieldEditor name="sub_specialities" value={payload.sub_specialities} path={["sub_specialities"]} update={update} />}
      <FieldEditor name="authority" value={payload.authority} path={["authority"]} update={update} />
      <FieldEditor name="pillar" value={payload.pillar} path={["pillar"]} update={update} />
      <FieldEditor name="lastReviewed" value={payload.lastReviewed} path={["lastReviewed"]} update={update} />
      {payload.clinicalScenario !== undefined && <FieldEditor name="clinicalScenario" value={payload.clinicalScenario} path={["clinicalScenario"]} update={update} />}
    </div></section>

    <section className="card pathway-form-section"><header><span>1</span><div><h3>Pathophysiology</h3><p>Summary, mechanisms, and supporting references.</p></div></header><ValueEditor value={payload.pathophysiology} path={["pathophysiology"]} update={update} /></section>
    <section className="card pathway-form-section"><header><span>2</span><div><h3>Presentation</h3><p>Symptoms, physical signs, and urgent red flags.</p></div></header><ValueEditor value={payload.presentation} path={["presentation"]} update={update} /></section>
    <section className="card pathway-form-section"><header><span>3</span><div><h3>Differential diagnoses</h3><p>Conditions and their distinguishing features.</p></div></header><FieldEditor name="differentials" value={payload.differentials} path={["differentials"]} update={update} /></section>
    <section className="card pathway-form-section"><header><span>4</span><div><h3>Investigations</h3><p>Rule-in and rule-out tests, findings, and rationale.</p></div></header><ValueEditor value={payload.investigations} path={["investigations"]} update={update} /></section>
    <section className="card pathway-form-section"><header><span>5</span><div><h3>Clinical pathway</h3><p>Sequenced management, medicines, branches, and guideline evidence.</p></div></header>
      <FieldEditor name="clinicalManagement" value={payload.clinicalManagement} path={["clinicalManagement"]} update={update} />
      <OptionalSection title="Medication plan" present={Boolean(payload.medicationPlan)} onAdd={() => update(["medicationPlan"], { status: "local-protocol-required", regimens: [], note: "" })} onRemove={() => { const next = structuredClone(payload) as unknown as JsonObject; delete next.medicationPlan; setPayload(next as unknown as DiseaseDetail); }}><ValueEditor value={payload.medicationPlan} path={["medicationPlan"]} update={update} /></OptionalSection>
      <OptionalSection title="Granular evidence pathway" present={Boolean(payload.granularPathway)} onAdd={() => update(["granularPathway"], { schema_version: 1, evidence: evidenceTemplate(), Investigations: [], Treatment_Plan: [] })} onRemove={() => { const next = structuredClone(payload) as unknown as JsonObject; delete next.granularPathway; setPayload(next as unknown as DiseaseDetail); }}><ValueEditor value={payload.granularPathway} path={["granularPathway"]} update={update} /></OptionalSection>
    </section>
    <section className="card pathway-form-section"><header><span>6</span><div><h3>Non-clinical care</h3><p>Education, lifestyle, referrals, discharge, and follow-up.</p></div></header><ValueEditor value={payload.nonClinicalManagement} path={["nonClinicalManagement"]} update={update} /></section>

    <section className="card pathway-form-section"><header><span>7</span><div><h3>Teaching guide</h3><p>Learning objectives, guided approach, check-your-understanding questions and pitfalls. Do not add doses, thresholds or timings that the clinical sections and sources do not already support.</p></div></header>
      <OptionalSection title="Teaching guide" present={Boolean(payload.teaching)} onAdd={() => update(["teaching"], { learningObjectives: [""], guidedApproach: [{ title: "", prompt: "", guidance: "" }], checkpoints: [{ question: "", answer: "" }], pitfalls: [""], keyPoints: [""] })} onRemove={() => { const next = structuredClone(payload) as unknown as JsonObject; delete next.teaching; setPayload(next as unknown as DiseaseDetail); }}><ValueEditor value={payload.teaching} path={["teaching"]} update={update} /></OptionalSection>
    </section></>}

    <div className="card pathway-save-bar"><span>Saving preserves this version and creates a new one. Versions scoring 80% or more publish automatically; clinical review remains pending.</span><SavePathwayButton /></div>
  </form>;
}
