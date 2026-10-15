import { Activity, ClipboardCheck, Clock3, FileSearch, Stethoscope, TriangleAlert, type LucideIcon } from "@/components/icons-3d";
import { SectionNav } from "@/components/section-nav";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { PathwaySequence } from "@/components/pathway-sequence";
import type { CitationSource } from "@/components/source-citation";
import { Investigations as MonitoringSchedule, TreatmentDetails } from "@/components/granular-pathway";
import { ClinicalEvidenceAudit } from "@/components/clinical-evidence-audit";
import { getMedicationPlan } from "@/lib/data/medication-plans";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

type Investigation = DiseaseDetail["investigations"]["ruleIn"][number];

export const emergencySections = [
  { id: "pathophysiology", label: "Pathophysiology" },
  { id: "signs-symptoms", label: "Signs & symptoms" },
  { id: "investigations", label: "Investigations" },
  { id: "management", label: "Management" },
] as const;

function Labelled({ text }: { text: string }) {
  const displayText = withoutInlineSourceLocators(text);
  const separator = displayText.indexOf(":");
  if (separator > 0 && separator < 60) return <><strong>{displayText.slice(0, separator)}:</strong>{displayText.slice(separator + 1)}</>;
  return <>{displayText}</>;
}

function List({ items, className = "em-list" }: { items: string[]; className?: string }) {
  return <ul className={className}>{items.map((item, index) => <li key={`${index}-${item}`}><Labelled text={item} /></li>)}</ul>;
}

const sectionIcons: Record<string, LucideIcon> = { pathophysiology: Activity, "signs-symptoms": Stethoscope, investigations: FileSearch, management: ClipboardCheck };

function Heading({ id, number, title }: { id: string; number: number; title: string }) {
  const Icon = sectionIcons[id] ?? Activity;
  return <h2 className="em-heading" id={`${id}-title`}><span className="em-heading-number" aria-hidden="true"><Icon size={24} /></span><span className="em-heading-text"><small aria-hidden="true">Section {number}</small>{title}</span></h2>;
}

const isImaging = (item: Investigation) => item.tier === "firstLineImaging" || item.tier === "advancedImaging";

export function EmergencyTopic({ disease, investigationSource }: { disease: DiseaseDetail; investigationSource?: CitationSource }) {
  const topicSources: CitationSource[] = investigationSource ? [investigationSource] : [];
  const allTests = [...disease.investigations.ruleIn, ...disease.investigations.ruleOut];
  const labs = allTests.filter((item) => !isImaging(item));
  const imaging = allTests.filter(isImaging);
  const showNormal = labs.some((item) => item.normalValue);
  const testChoices = allTests.filter((item) => item.pros?.length || item.cons?.length);
  const medicationPlan = disease.medicationPlan ?? getMedicationPlan(disease.id);
  const hasContraindications = Boolean(medicationPlan?.regimens.some((regimen) => regimen.contraindications?.length));
  const care = disease.nonClinicalManagement;
  const pitfalls = disease.teaching?.pitfalls ?? [];
  const pearls = disease.teaching?.keyPoints ?? [];

  return (
    <div className="em-topic">
      <SectionNav sections={emergencySections} />

      <section id="pathophysiology" className="em-section" aria-labelledby="pathophysiology-title">
        <Heading id="pathophysiology" number={1} title="Pathophysiology" />
        <p className="em-lead">{withoutInlineSourceLocators(disease.pathophysiology.summary)}</p>
        <List items={disease.pathophysiology.keyMechanisms} />
      </section>

      <section id="signs-symptoms" className="em-section" aria-labelledby="signs-symptoms-title">
        <Heading id="signs-symptoms" number={2} title="Signs & symptoms" />
        <div className="em-alert" role="note">
          <TriangleAlert size={30} tone="rose" aria-hidden="true" />
          <div><strong>Red flags — escalate now</strong><List items={disease.presentation.redFlags} /></div>
        </div>
        <div className="em-two-col">
          <div><h3>Symptoms</h3><List items={disease.presentation.symptoms} /></div>
          <div><h3>Signs</h3><List items={disease.presentation.physicalSigns} /></div>
        </div>
        {disease.presentation.precipitants?.length ? <div className="em-box"><h3>Look for the precipitant</h3><List items={disease.presentation.precipitants} /></div> : null}
        <h3>Mimics and must-not-miss alternatives</h3>
        <div className="em-table-wrap">
          <table className="em-table">
            <thead><tr><th scope="col">Condition</th><th scope="col">How to tell it apart</th></tr></thead>
            <tbody>{disease.differentials.map((item) => <tr key={item.condition}><th scope="row">{item.condition}</th><td>{withoutInlineSourceLocators(item.distinguishingFeatures)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section id="investigations" className="em-section" aria-labelledby="investigations-title">
        <Heading id="investigations" number={3} title="Investigations" />
        {disease.diagnosticCriteria?.length ? (
          <div className="em-criteria">
            <h3>Diagnostic criteria</h3>
            <dl>{disease.diagnosticCriteria.map((item) => <div key={item.criterion}><dt>{item.criterion}</dt><dd>{withoutInlineSourceLocators(item.threshold)}</dd></div>)}</dl>
          </div>
        ) : null}
        <div className="em-table-wrap">
          <table className="em-table em-investigation-table">
            <thead><tr><th scope="col">Test</th>{showNormal ? <th scope="col">Normal</th> : null}<th scope="col">In this condition</th><th scope="col">What it means / next step</th></tr></thead>
            <tbody>
              {labs.map((item) => (
                <tr key={item.testName}>
                  <th scope="row">{item.testName}<small>{item.modalityTarget}</small></th>
                  {showNormal ? <td data-label="Normal">{withoutInlineSourceLocators(item.normalValue ?? "—")}</td> : null}
                  <td data-label="In this condition" className="em-deranged">{withoutInlineSourceLocators(item.expectedFinding)}</td>
                  <td data-label="What it means">{withoutInlineSourceLocators(item.clinicalRationale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showNormal ? <p className="em-footnote">Normal values are typical adult reference ranges; use your own laboratory&apos;s ranges.</p> : null}

        {testChoices.length ? testChoices.map((item) => (
          <div key={`choice-${item.testName}`} className="em-proscons">
            <h3>{item.testName}: pros and cons</h3>
            <div className="em-two-col">
              {item.pros?.length ? <div className="em-pros"><strong>Pros</strong><List items={item.pros} /></div> : null}
              {item.cons?.length ? <div className="em-cons"><strong>Cons</strong><List items={item.cons} /></div> : null}
            </div>
          </div>
        )) : null}

        {imaging.length ? (
          <>
            <h3>Imaging</h3>
            <div className="em-table-wrap">
              <table className="em-table">
                <thead><tr><th scope="col">Imaging</th><th scope="col">When to order</th><th scope="col">What you are looking for</th></tr></thead>
                <tbody>{imaging.map((item) => <tr key={item.testName}><th scope="row">{item.testName}</th><td>{withoutInlineSourceLocators(item.modalityTarget)}</td><td>{withoutInlineSourceLocators(`${item.expectedFinding} ${item.clinicalRationale}`)}</td></tr>)}</tbody>
              </table>
            </div>
          </>
        ) : null}

        {disease.granularPathway ? <details className="em-more"><summary>Monitoring schedule and decision points</summary><MonitoringSchedule phases={disease.granularPathway.Investigations} /></details> : null}
      </section>

      <section id="management" className="em-section" aria-labelledby="management-title">
        <Heading id="management" number={4} title="Management" />
        <PathwaySequence steps={disease.clinicalManagement} sources={topicSources} compact />

        {medicationPlan?.regimens.length ? (
          <>
            <h3>Medicines and doses</h3>
            <p className="em-footnote">{withoutInlineSourceLocators(medicationPlan.note)}</p>
            <div className="em-table-wrap">
              <table className="em-table em-dose-table">
                <thead><tr><th scope="col">Medicine and indication</th><th scope="col">Dose, route, frequency</th>{hasContraindications ? <th scope="col">Contraindications</th> : null}<th scope="col">Cautions and monitoring</th></tr></thead>
                <tbody>{medicationPlan.regimens.map((regimen) => (
                  <tr key={`${regimen.genericName}-${regimen.indication}`}>
                    <th scope="row">{regimen.genericName}<small>{withoutInlineSourceLocators(regimen.indication)} · {withoutInlineSourceLocators(regimen.patientGroup)}</small></th>
                    <td>{withoutInlineSourceLocators(regimen.dose)}<span className="em-regimen-pills"><span className="pill pill-sky pill-sm">{regimen.route}</span><span className="pill pill-violet pill-sm">{regimen.frequency}</span><span className="pill pill-amber pill-sm"><Clock3 size={13} aria-hidden="true" />{regimen.duration}</span></span></td>
                    {hasContraindications ? <td className="em-contra">{regimen.contraindications?.length ? <List items={regimen.contraindications} /> : <span className="em-muted">See product label</span>}</td> : null}
                    <td><List items={[...regimen.adjustments, ...regimen.monitoring.map((item) => `Monitor: ${item}`)]} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        ) : medicationPlan?.note ? <p className="em-footnote">{withoutInlineSourceLocators(medicationPlan.note)}</p> : null}

        {disease.guidelineComparison ? (
          <>
            <h3>{disease.guidelineComparison.title}</h3>
            <div className="em-table-wrap">
              <table className="em-table">
                <thead><tr><th scope="col">Parameter</th>{disease.guidelineComparison.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                <tbody>{disease.guidelineComparison.rows.map((row) => <tr key={row.parameter}><th scope="row">{row.parameter}</th>{row.values.map((value, index) => <td key={`${row.parameter}-${index}`}>{withoutInlineSourceLocators(value)}</td>)}</tr>)}</tbody>
              </table>
            </div>
            {disease.guidelineComparison.note ? <p className="em-footnote">{withoutInlineSourceLocators(disease.guidelineComparison.note)}</p> : null}
          </>
        ) : disease.granularPathway ? <TreatmentDetails plans={disease.granularPathway.Treatment_Plan} /> : null}

        {pearls.length || pitfalls.length ? (
          <div className="em-two-col">
            {pearls.length ? <div className="em-box em-pearls"><h3>Key points</h3><List items={pearls} /></div> : null}
            {pitfalls.length ? <div className="em-box em-pitfalls"><h3>Pitfalls</h3><List items={pitfalls} /></div> : null}
          </div>
        ) : null}

        <h3>Disposition and follow-up</h3>
        <div className="em-two-col">
          <div><h4>Discharge when</h4><List items={care.dischargeCriteria} /></div>
          <div><h4>Before they leave</h4><List items={[...care.patientEducation, ...care.lifestyleAndDiet, ...care.mdtReferrals].filter((item) => !/^not applicable/i.test(item))} /></div>
        </div>
        <p className="em-followup"><strong>Follow-up:</strong> {withoutInlineSourceLocators(care.followUpPlan)}</p>
      </section>

      {disease.evidenceAudit ? <details className="em-more"><summary>Evidence and review status</summary><ClinicalEvidenceAudit audit={disease.evidenceAudit} /></details> : null}
      <References disease={disease} versionSource={investigationSource} />
    </div>
  );
}

type Reference = { title: string; url: string; detail?: string };

/** Every source cited anywhere in the version, de-duplicated and listed at the end of the page. */
export function collectReferences(disease: DiseaseDetail, versionSource?: CitationSource): Reference[] {
  const found: Reference[] = [];
  const add = (title: string | undefined, url: string | undefined, detail?: string) => {
    if (!title || !url || !/^https?:\/\//i.test(url)) return;
    const existing = found.find((item) => item.url === url);
    if (existing) {
      if (detail && existing.detail && !existing.detail.includes(detail)) existing.detail = `${existing.detail}; ${detail}`;
      return;
    }
    found.push({ title, url, detail });
  };
  disease.teaching?.references?.forEach((ref) => add(ref.title, ref.url, [ref.edition, ref.locator].filter(Boolean).join(" · ")));
  disease.pathophysiology.references?.forEach((ref) => add(ref.title, ref.url, ref.edition));
  [...disease.investigations.ruleIn, ...disease.investigations.ruleOut].forEach((item) => item.references?.forEach((ref) => add(ref.title, ref.url, ref.edition)));
  disease.medicationPlan?.regimens.forEach((regimen) => add(regimen.sourceTitle, regimen.sourceUrl, regimen.sourceEdition));
  const pathway = disease.granularPathway;
  if (pathway) {
    const sources = [pathway.evidence, ...pathway.Investigations.map((item) => item.evidence), ...pathway.Treatment_Plan.flatMap((plan) => [plan.evidence, ...plan.branches.map((branch) => branch.evidence)])].flatMap((evidence) => evidence.sources);
    sources.forEach((source) => add(source.title, source.url, [source.edition, source.locator].filter(Boolean).join(" · ")));
  }
  if (versionSource) add(versionSource.title, versionSource.url, versionSource.edition);
  return found;
}

function References({ disease, versionSource }: { disease: DiseaseDetail; versionSource?: CitationSource }) {
  const references = collectReferences(disease, versionSource);
  return (
    <section className="em-references" aria-labelledby="references-title">
      <h2 id="references-title">References</h2>
      {references.length ? (
        <ol>{references.map((ref) => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title}</a>{ref.detail ? <span> — {ref.detail}</span> : null}</li>)}</ol>
      ) : <p>No source with a verifiable link is recorded for this version. Treat the content as unverified.</p>}
    </section>
  );
}
