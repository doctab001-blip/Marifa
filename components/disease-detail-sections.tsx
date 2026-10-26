"use client";
import { MedicineSideEffects } from "@/components/medicine-side-effects";
import { cleanAdjustments } from "@/lib/medicine-adjustments";

import { useState } from "react";
import { ChevronDown } from "@/components/icons-3d";
import { ClinicalWarning } from "@/components/clinical-warning";
import { PathwaySequence } from "@/components/pathway-sequence";
import { uncoveredRegimens } from "@/lib/step-medication";
import { InvestigationCards } from "@/components/investigation-cards";
import type { InvestigationReference } from "@/lib/investigation-display";
import { getMedicationPlan } from "@/lib/data/medication-plans";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { groupMedicationPlan, isBranchedMedicationPlan, type MedicationRegimen } from "@/lib/medication-pathway";
import { SourceCitation, type CitationSource } from "@/components/source-citation";
import { Investigations as GranularInvestigations, TreatmentDetails } from "@/components/granular-pathway";
import { ClinicalEvidenceAudit } from "@/components/clinical-evidence-audit";
import { teachingSections, type TeachingSectionKey } from "@/lib/teaching";

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-disc space-y-2 ps-5 text-sm leading-relaxed text-body marker:text-aqua-300">
      {items.map((item, index) => {
        const separator = item.indexOf(":");
        return (
          <li key={`${index}-${item}`}>
            {separator > 0 ? (
              <><strong className="font-semibold text-ink">{item.slice(0, separator)}:</strong>{item.slice(separator + 1)}</>
            ) : item}
          </li>
        );
      })}
    </ul>
  );
}

function Section({ number, section, children }: {
  number: number;
  section: TeachingSectionKey;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const meta = teachingSections[section];
  const headingId = `clinical-step-${number}-heading`;
  const panelId = `clinical-step-${number}-panel`;

  return (
    <section id={meta.anchor} className={`clinical-tier${isOpen ? " is-open" : ""}`}>
      <button
        id={headingId}
        className="clinical-tier-heading"
        type="button"
        aria-label={`Step ${number}: ${meta.title} (${meta.formal})`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="clinical-tier-number">{number}</span>
        <span className="clinical-tier-icon" aria-hidden="true">{meta.emoji}</span>
        <span className="clinical-tier-title" role="heading" aria-level={2}>{meta.title}<small>{meta.formal}</small></span>
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
          <div className="clinical-tier-body">
            <p className="teaching-cue"><span aria-hidden="true">💡</span><span><strong>Guide:</strong> {meta.cue}</span></p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function MedicationItem({ regimen }: { regimen: MedicationRegimen }) {
  const role = regimen.selection === "one-of" ? (regimen.preferred ? "Preferred" : "Alternative") : null;
  return <li>
    <h4>{regimen.indication}{role ? <> — <em>{role}</em></> : null}</h4>
    <dl>
      <div><dt>Medicine</dt><dd>{regimen.genericName}<MedicineSideEffects name={regimen.genericName} /></dd></div>
      {regimen.useWhen ? <div><dt>Use when</dt><dd>{regimen.useWhen}</dd></div> : null}
      <div><dt>Patient group</dt><dd>{regimen.patientGroup}</dd></div>
      <div><dt>Dose and route</dt><dd>{regimen.dose}; {regimen.route}</dd></div>
      <div><dt>Frequency and duration</dt><dd>{regimen.frequency}; {regimen.duration}</dd></div>
      <div><dt>Adjustments and precautions</dt><dd><ul>{cleanAdjustments(regimen.adjustments, regimen.genericName).map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
      <div><dt>Monitoring</dt><dd><ul>{regimen.monitoring.map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
      <div><dt>Source</dt><dd><a href={regimen.sourceUrl} target="_blank" rel="noreferrer">{regimen.sourceTitle} ({regimen.sourceEdition})</a></dd></div>
    </dl>
    <SourceCitation sources={[{ title: regimen.sourceTitle, url: regimen.sourceUrl, edition: regimen.sourceEdition }]} />
  </li>;
}

export function DiseaseDetailSections({ disease, investigationSource }: { disease: DiseaseDetail; investigationSource?: InvestigationReference }) {
  const medicationPlan = disease.medicationPlan ?? getMedicationPlan(disease.id);
  const remainingRegimens = medicationPlan ? uncoveredRegimens(disease.clinicalManagement, medicationPlan.regimens) : [];
  const remainingPlan = medicationPlan ? { ...medicationPlan, regimens: remainingRegimens } : medicationPlan;
  const topicSources: CitationSource[] = investigationSource ? [investigationSource] : [];

  return (
    <section className="clinical-tiers" aria-label="Six-step clinical teaching pathway">
      <ClinicalEvidenceAudit audit={disease.evidenceAudit} />
      <Section number={1} section="why">
        <p className="clinical-summary">{disease.pathophysiology.summary}</p>
        <h3>Key mechanisms</h3>
        <TextList items={disease.pathophysiology.keyMechanisms} />
        {disease.pathophysiology.references?.length ? (
          <div className="clinical-references" aria-label="Sources for further reading">
            <h3>Sources for further reading</h3>
            <ul>
              {disease.pathophysiology.references.map((reference) => (
                <li key={`${reference.title}-${reference.edition}`}>
                  <a href={reference.url} target="_blank" rel="noreferrer">{reference.title} <span>({reference.edition})</span></a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section number={2} section="recognise">
        <div className="clinical-two-column presentation-observations">
          <div className="presentation-observation"><div className="presentation-observation-heading"><h3>Symptoms</h3></div><TextList items={disease.presentation.symptoms} /></div>
          <div className="presentation-observation"><div className="presentation-observation-heading"><h3>Physical signs</h3></div><TextList items={disease.presentation.physicalSigns} /></div>
        </div>
        <div className="presentation-red-flags"><ClinicalWarning items={disease.presentation.redFlags} /></div>
      </Section>

      <Section number={3} section="differentiate">
        <ul className="clinical-content-list differential-list">
          {disease.differentials.map((item) => <li key={item.condition}><strong>{item.condition}:</strong> {item.distinguishingFeatures}</li>)}
        </ul>
      </Section>

      <Section number={4} section="confirm">
        {disease.granularPathway ? <GranularInvestigations phases={disease.granularPathway.Investigations} /> : <><InvestigationCards investigations={disease.investigations} source={investigationSource} /><SourceCitation sources={topicSources} /></>}
      </Section>

      <Section number={5} section="manage">
        <PathwaySequence steps={disease.clinicalManagement} sources={topicSources} regimens={medicationPlan?.regimens ?? []} />
        {disease.granularPathway ? <TreatmentDetails plans={disease.granularPathway.Treatment_Plan} /> : null}
        <section className="medication-plan" aria-labelledby="medication-plan-title">
          <header><div><p className="disease-kicker">Treatment details</p><h3 id="medication-plan-title">Medicines and doses</h3></div></header>
          {medicationPlan?.regimens.length ? <p className="medication-plan-status">{medicationPlan.note}</p> : null}
          {medicationPlan?.regimens.length && !remainingRegimens.length ? <p className="medication-plan-status">Every medicine in this pathway is listed with its dose, route, frequency, duration, adjustments, cautions and monitoring in the table under the step that uses it.</p> : null}
          {remainingRegimens.length ? (isBranchedMedicationPlan(remainingPlan!)
            ? groupMedicationPlan(remainingPlan!).filter((branch) => branch.steps.length).map((branch) => <div className="medication-branch" key={branch.label}>
                <h4 className="medication-branch-title">If: {branch.label}</h4>
                {branch.entryCriteria ? <p className="medication-plan-status">{branch.entryCriteria}</p> : null}
                {branch.steps.map((step) => <div key={step.step}>
                  <p className="medication-step-title"><strong>{step.step}</strong> — {step.selection === "one-of" ? "choose ONE" : step.options.length > 1 ? "give all" : "give"}</p>
                  <ul className="medication-plan-list">{step.options.map((regimen) => <MedicationItem key={`${regimen.genericName}-${regimen.indication}`} regimen={regimen} />)}</ul>
                </div>)}
              </div>)
            : <ul className="medication-plan-list">{remainingRegimens.map((regimen) => <MedicationItem key={`${regimen.genericName}-${regimen.indication}`} regimen={regimen} />)}</ul>) : <p className="m-0 rounded-lg border border-edge bg-panel px-4 py-3 text-sm leading-relaxed text-muted">{medicationPlan?.note ?? "No exact-dose medicine plan is linked to this topic. Consult the current Saudi/local protocol and hospital formulary for prescribing details."}</p>}
        </section>
        <SourceCitation sources={topicSources} />
      </Section>

      <Section number={6} section="ongoing">
        <div className="non-clinical-grid">
          <div><h3>Patient education</h3><TextList items={disease.nonClinicalManagement.patientEducation} /></div>
          <div><h3>Lifestyle and diet</h3><TextList items={disease.nonClinicalManagement.lifestyleAndDiet} /></div>
          <div><h3>MDT referrals</h3><TextList items={disease.nonClinicalManagement.mdtReferrals} /></div>
          <div><h3>Discharge criteria</h3><TextList items={disease.nonClinicalManagement.dischargeCriteria} /></div>
        </div>
        <div className="follow-up-plan"><strong>Follow-up plan</strong><p>{disease.nonClinicalManagement.followUpPlan}</p></div>
      </Section>
      {disease.teaching?.guidedApproach?.length ? (
        <section className="topic-teaching-appendix" aria-labelledby="topic-teaching-appendix-title">
          <h2 id="topic-teaching-appendix-title">Additional clinical reference</h2>
          {disease.teaching.guidedApproach.map((item) => (
            <article className="topic-teaching-appendix-block" key={item.title}>
              <h3>{item.title}</h3>
              <p className="topic-teaching-appendix-prompt">{item.prompt}</p>
              <div className="topic-teaching-appendix-guidance">{item.guidance.split("\n").map((line, index) => <p key={`${item.title}-${index}`}>{line}</p>)}</div>
            </article>
          ))}
        </section>
      ) : null}
      <SourceCitation sources={topicSources} />
    </section>
  );
}
