import { saveSettingsAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { Notice, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadSettings, openContext } from "@/lib/governance/repository";
import { accreditationMilestones } from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const actor = await getGovernanceActor();
  if (!actor || !canReadGovernance(actor)) return <p className="gh-notice gh-notice-bad" role="alert">Settings are visible to governance staff.</p>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const settings = await loadSettings(ctx).catch(() => null);
  if (!settings) return <p className="gh-notice gh-notice-bad" role="alert">Settings could not be loaded. Has the accreditation hub migration been applied?</p>;
  const milestones = accreditationMilestones(settings, currentDate());

  return (
    <>
      <header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Scoring and accreditation settings</h1>
        <p>The defaults follow the CBAHI Hospital Accreditation Process Guide (3rd edition, 2016). Check them against the edition your survey uses and change them here if they differ.</p></div></header>
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />
      <form action={saveSettingsAction} className="gh-card gh-form">
        <input type="hidden" name="returnTo" value={`${BASE}/settings`} />
        <fieldset disabled={!canWrite} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>
          <label className="gh-field gh-wide">Standards edition<input name="editionLabel" defaultValue={settings.editionLabel} maxLength={160} /></label>
          <label className="gh-field">Satisfactory from (% compliance)<input type="number" name="satisfactoryMinPct" defaultValue={settings.satisfactoryMinPct} min={1} max={100} step="0.1" required /></label>
          <label className="gh-field">Partial from (% compliance)<input type="number" name="partialMinPct" defaultValue={settings.partialMinPct} min={0} max={99} step="0.1" required /></label>
          <label className="gh-field">Accreditation from (overall %)<input type="number" name="accreditedMinOverall" defaultValue={settings.accreditedMinOverall} min={1} max={100} step="0.1" required /></label>
          <label className="gh-field">Conditional from (overall %)<input type="number" name="conditionalMinOverall" defaultValue={settings.conditionalMinOverall} min={0} max={99} step="0.1" required /></label>
          <label className="gh-field">Denial risk when ESRs not satisfactory exceed (%)<input type="number" name="esrUnsatisfactoryMaxPct" defaultValue={settings.esrUnsatisfactoryMaxPct} min={0} max={100} step="0.1" required /></label>
          <label className="gh-field">Accreditation valid for (years)<input type="number" name="validityYears" defaultValue={settings.validityYears} min={1} max={10} required /></label>
          <label className="gh-field">Accreditation awarded on<input type="date" name="accreditationAwardedOn" defaultValue={settings.accreditationAwardedOn ?? ""} /></label>
          <label className="gh-field gh-wide">Source note shown with scores<textarea name="scoringSourceNote" defaultValue={settings.scoringSourceNote} maxLength={500} /></label>
          {canWrite ? <div><button className="ui-button ui-button-primary" type="submit">Save settings</button></div> : <p className="gh-meta">Only governance staff can change settings.</p>}
        </fieldset>
      </form>
      {milestones ? (
        <section className="gh-card"><h2>Accreditation cycle</h2>
          <p className="gh-meta">Dates are calculated from the award date and validity above.</p>
          <table className="gh-table"><tbody>
            <tr><th scope="row">Awarded</th><td>{formatDate(milestones.awardedOn)}</td></tr>
            <tr><th scope="row">Mid-term self-assessment due</th><td>{formatDate(milestones.midTermSelfAssessmentDue)}</td></tr>
            <tr><th scope="row">Re-accreditation update due</th><td>{formatDate(milestones.reaccreditationUpdateDue)}</td></tr>
            <tr><th scope="row">Expires</th><td>{formatDate(milestones.expiresOn)} ({milestones.daysToExpiry} days)</td></tr>
          </tbody></table>
        </section>
      ) : null}
    </>
  );
}
