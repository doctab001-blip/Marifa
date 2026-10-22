"use client";

import { useId } from "react";
import { HeartPulse } from "lucide-react";

export type Vitals = { hr: string; sbp: string; dbp: string; rr: string; spo2: string; temp: string; gcs: string; glucose: string };
export const EMPTY_VITALS: Vitals = { hr: "", sbp: "", dbp: "", rr: "", spo2: "", temp: "", gcs: "", glucose: "" };

const num = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/** Vital signs as findings the engine reads ("HR 124", "BP 84/50"). Empty fields add nothing. */
export function vitalsToFindings(vitals: Vitals): { examFindings: string[]; labInvestigations: string[] } {
  const exam: string[] = [];
  const labs: string[] = [];
  const hr = num(vitals.hr), sbp = num(vitals.sbp), dbp = num(vitals.dbp), rr = num(vitals.rr), spo2 = num(vitals.spo2), temp = num(vitals.temp), gcs = num(vitals.gcs), glucose = num(vitals.glucose);
  if (hr !== undefined) exam.push(`HR ${hr}`);
  if (sbp !== undefined) exam.push(dbp !== undefined ? `BP ${sbp}/${dbp}` : `SBP ${sbp}`);
  if (rr !== undefined) exam.push(`RR ${rr}`);
  if (spo2 !== undefined) exam.push(`SpO2 ${spo2}%`);
  if (temp !== undefined) exam.push(`Temp ${temp}`);
  if (gcs !== undefined) exam.push(`GCS ${gcs}`);
  if (glucose !== undefined) labs.push(`Glucose ${glucose}`);
  return { examFindings: exam, labInvestigations: labs };
}

export const vitalsCount = (vitals: Vitals) => Object.entries(vitals).filter(([key, value]) => key !== "dbp" && value.trim() !== "").length;

const FIELDS: Array<{ key: keyof Vitals; label: string; unit: string; min: number; max: number; step?: number }> = [
  { key: "hr", label: "Heart rate", unit: "bpm", min: 20, max: 250 },
  { key: "rr", label: "Resp. rate", unit: "/min", min: 4, max: 70 },
  { key: "spo2", label: "SpO₂", unit: "%", min: 50, max: 100 },
  { key: "temp", label: "Temp", unit: "°C", min: 30, max: 43, step: 0.1 },
  { key: "gcs", label: "GCS", unit: "/15", min: 3, max: 15 },
  { key: "glucose", label: "Glucose", unit: "mmol/L", min: 0.5, max: 60, step: 0.1 },
];

export function VitalsPanel({ vitals, onChange }: { vitals: Vitals; onChange: (vitals: Vitals) => void }) {
  const id = useId();
  const set = (key: keyof Vitals, value: string) => onChange({ ...vitals, [key]: value });
  const count = vitalsCount(vitals);
  return (
    <fieldset className="dx-vector dx-vitals">
      <legend className="dx-vector-head">
        <span className="dx-vector-icon" aria-hidden="true"><HeartPulse size={18} strokeWidth={1.8} /></span>
        <span className="dx-vector-title">Vital signs</span>
        <span className="dx-vector-optional">optional</span>
        {count ? <span className="dx-vector-count" aria-label={`${count} entered`}>{count}</span> : null}
      </legend>
      <div className="dx-vitals-grid">
        <label className="dx-vital dx-vital--bp" htmlFor={`${id}-sbp`}>
          <span>Blood pressure</span>
          <span className="dx-vital-bp">
            <input id={`${id}-sbp`} type="number" inputMode="numeric" min={30} max={300} value={vitals.sbp} onChange={(event) => set("sbp", event.target.value)} aria-label="Systolic blood pressure" placeholder="Sys" />
            <span aria-hidden="true">/</span>
            <input type="number" inputMode="numeric" min={10} max={200} value={vitals.dbp} onChange={(event) => set("dbp", event.target.value)} aria-label="Diastolic blood pressure" placeholder="Dia" />
            <em>mmHg</em>
          </span>
        </label>
        {FIELDS.map((field) => (
          <label className="dx-vital" key={field.key} htmlFor={`${id}-${field.key}`}>
            <span>{field.label}</span>
            <span className="dx-vital-input">
              <input id={`${id}-${field.key}`} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step ?? 1} value={vitals[field.key]} onChange={(event) => set(field.key, event.target.value)} />
              <em>{field.unit}</em>
            </span>
          </label>
        ))}
      </div>
      <p className="dx-vitals-note">Abnormal values are read as findings (e.g. SpO₂ 88% → hypoxia). You can also type values into any box, such as “K 6.9” or “Lactate 4.2”.</p>
    </fieldset>
  );
}
