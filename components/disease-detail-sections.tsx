import { Activity, Beaker, BookOpenText, ChevronDown, ClipboardList, HeartHandshake } from "lucide-react";
import { ClinicalWarning } from "@/components/clinical-warning";
import { PathwaySequence } from "@/components/pathway-sequence";
import type { DiseaseDetail } from "@/lib/validations/disease";

function TextList({ items }: { items: string[] }) {
  return <ul className="clinical-content-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function Section({ number, title, icon, children, open = false }: { number: number; title: string; icon: React.ReactNode; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="clinical-tier" open={open}>
      <summary>
        <span className="clinical-tier-number">{number}</span>
        <span className="clinical-tier-icon" aria-hidden="true">{icon}</span>
        <strong>{title}</strong>
        <ChevronDown className="clinical-tier-chevron" size={18} strokeWidth={1.5} aria-hidden="true" />
      </summary>
      <div className="clinical-tier-body">{children}</div>
    </details>
  );
}

export function DiseaseDetailSections({ disease }: { disease: DiseaseDetail }) {
  return (
    <section className="clinical-tiers" aria-label="Six-tier clinical guideline">
      <Section number={1} title="Pathophysiology" icon={<Activity size={19} strokeWidth={1.5} />} open>
        <p className="clinical-summary">{disease.pathophysiology.summary}</p>
        <h3>Key mechanisms</h3>
        <TextList items={disease.pathophysiology.keyMechanisms} />
      </Section>

      <Section number={2} title="Presentation" icon={<ClipboardList size={19} strokeWidth={1.5} />}>
        <div className="clinical-two-column">
          <div><h3>Symptoms</h3><TextList items={disease.presentation.symptoms} /></div>
          <div><h3>Physical signs</h3><TextList items={disease.presentation.physicalSigns} /></div>
        </div>
        <ClinicalWarning items={disease.presentation.redFlags} />
      </Section>

      <Section number={3} title="Differential diagnoses" icon={<BookOpenText size={19} strokeWidth={1.5} />}>
        <div className="clinical-record-grid">
          {disease.differentials.map((item) => <article key={item.condition}><h3>{item.condition}</h3><p>{item.distinguishingFeatures}</p></article>)}
        </div>
      </Section>

      <Section number={4} title="Investigations" icon={<Beaker size={19} strokeWidth={1.5} />}>
        <div className="investigation-groups">
          {(["ruleIn", "ruleOut"] as const).map((group) => (
            <div key={group}>
              <h3>{group === "ruleIn" ? "Rule in and characterise" : "Rule out complications and alternatives"}</h3>
              <div className="investigation-list">
                {disease.investigations[group].map((test) => (
                  <article key={`${group}-${test.testName}-${test.targetCondition}`}>
                    <h4>{test.testName}</h4>
                    <dl><div><dt>Target</dt><dd>{test.targetCondition}</dd></div><div><dt>Expected finding</dt><dd>{test.expectedFinding}</dd></div><div><dt>Clinical rationale</dt><dd>{test.clinicalRationale}</dd></div></dl>
                  </article>
                ))}
              </div>
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
