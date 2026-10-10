"use client";

import { useState } from "react";
import { Activity, Beaker, BookOpenText, ChevronDown, ClipboardList, HeartHandshake } from "lucide-react";
import { ClinicalWarning } from "@/components/clinical-warning";
import { PathwaySequence } from "@/components/pathway-sequence";
import type { DiseaseDetail } from "@/lib/validations/disease";

function TextList({ items }: { items: string[] }) {
  return <ul className="clinical-content-list">{items.map((item) => {
    const separator = item.indexOf(":");
    return <li key={item}>{separator > 0 ? <><strong>{item.slice(0, separator)}:</strong>{item.slice(separator + 1)}</> : item}</li>;
  })}</ul>;
}

function Section({ number, title, icon, children }: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const headingId = `clinical-step-${number}-heading`;
  const panelId = `clinical-step-${number}-panel`;

  return (
    <section className={`clinical-tier${isOpen ? " is-open" : ""}`}>
      <button
        id={headingId}
        className="clinical-tier-heading"
        type="button"
        aria-label={`Step ${number}: ${title}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="clinical-tier-number">{number}</span>
        <span className="clinical-tier-icon" aria-hidden="true">{icon}</span>
        <span className="clinical-tier-title" role="heading" aria-level={2}>{title}</span>
        <ChevronDown className="clinical-tier-chevron" size={19} strokeWidth={1.7} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className={`clinical-tier-panel${isOpen ? " is-open" : ""}`}
        role="region"
        aria-labelledby={headingId}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="clinical-tier-panel-inner">
          <div className="clinical-tier-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function DiseaseDetailSections({ disease }: { disease: DiseaseDetail }) {
  return (
    <section className="clinical-tiers" aria-label="Six-tier clinical guideline">
      <Section number={1} title="Pathophysiology" icon={<Activity size={19} strokeWidth={1.5} />}>
        <p className="clinical-summary">{disease.pathophysiology.summary}</p>
        <h3>Key mechanisms</h3>
        <TextList items={disease.pathophysiology.keyMechanisms} />
      </Section>

      <Section number={2} title="Presentation" icon={<ClipboardList size={19} strokeWidth={1.5} />}>
        <div className="clinical-two-column presentation-observations">
          <div className="presentation-observation"><div className="presentation-observation-heading"><h3>Symptoms</h3></div><TextList items={disease.presentation.symptoms} /></div>
          <div className="presentation-observation"><div className="presentation-observation-heading"><h3>Physical signs</h3></div><TextList items={disease.presentation.physicalSigns} /></div>
        </div>
        <div className="presentation-red-flags"><ClinicalWarning items={disease.presentation.redFlags} /></div>
      </Section>

      <Section number={3} title="Differential diagnoses" icon={<BookOpenText size={19} strokeWidth={1.5} />}>
        <ul className="clinical-content-list differential-list">
          {disease.differentials.map((item) => <li key={item.condition}><strong>{item.condition}:</strong> {item.distinguishingFeatures}</li>)}
        </ul>
      </Section>

      <Section number={4} title="Investigations" icon={<Beaker size={19} strokeWidth={1.5} />}>
        <div className="investigation-groups">
          {(["ruleIn", "ruleOut"] as const).map((group) => (
            <div key={group}>
              <h3>{group === "ruleIn" ? "Rule in and characterise" : "Rule out complications and alternatives"}</h3>
              <ul className="investigation-list">
                {disease.investigations[group].map((test) => (
                  <li key={`${group}-${test.testName}-${test.targetCondition}`}>
                    <strong>{test.testName}</strong>
                    <span><b>Target:</b> {test.targetCondition}</span>
                    <span><b>Expected:</b> {test.expectedFinding}</span>
                    <span><b>Why:</b> {test.clinicalRationale}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section number={5} title="Clinical pathway" icon={<ClipboardList size={19} strokeWidth={1.5} />}>
        <PathwaySequence steps={disease.clinicalManagement} />
      </Section>

      <Section number={6} title="Non-clinical care" icon={<HeartHandshake size={19} strokeWidth={1.5} />}>
        <div className="non-clinical-grid">
          <div><h3>Patient education</h3><TextList items={disease.nonClinicalManagement.patientEducation} /></div>
          <div><h3>Lifestyle and diet</h3><TextList items={disease.nonClinicalManagement.lifestyleAndDiet} /></div>
          <div><h3>MDT referrals</h3><TextList items={disease.nonClinicalManagement.mdtReferrals} /></div>
          <div><h3>Discharge criteria</h3><TextList items={disease.nonClinicalManagement.dischargeCriteria} /></div>
        </div>
        <div className="follow-up-plan"><strong>Follow-up plan</strong><p>{disease.nonClinicalManagement.followUpPlan}</p></div>
      </Section>
    </section>
  );
}
