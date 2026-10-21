import { saveEditionAction, saveRegulatoryRuleAction, saveRiskSettingsAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { Badge, Details, Empty, NeedsV21 } from "@/components/accreditation/ui";
import type { Ctx } from "@/lib/governance/repository";
import { loadEditions, loadRegulatoryRules, v21 } from "@/lib/governance/repository-v21";
import { RISK_BAND_LABEL } from "@/lib/governance/scoring";
import type { GovSettings } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const SEVERITY = { low: "Low", medium: "Medium", high: "High", critical: "Critical" } as const;

export async function SettingsV21({ ctx, settings, canWrite }: { ctx: Ctx; settings: GovSettings; canWrite: boolean }) {
  const loaded = await v21(Promise.all([loadEditions(ctx), loadRegulatoryRules(ctx)]));
  if (!loaded) return <NeedsV21 what="Risk methodology, regulatory reporting rules and editions" />;
  const [editions, rules] = loaded;
  const here = `${BASE}/settings`;
  return (
    <>
      <section className="gh-card" aria-labelledby="risk-heading">
        <h2 id="risk-heading" className="gh-section-title">Risk methodology</h2>
        <p className="gh-sub">Score = likelihood × impact on the 5 × 5 matrix. Set where each band starts so the matrix, badges and counts follow your hospital&apos;s own risk method.</p>
        <form action={saveRiskSettingsAction} className="gh-form">
          <input type="hidden" name="returnTo" value={here} />
          <fieldset disabled={!canWrite} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>
            <label className="gh-field">{RISK_BAND_LABEL.moderate} from score<input type="number" name="riskModerateMin" min={2} max={25} defaultValue={settings.riskModerateMin} required /></label>
            <label className="gh-field">{RISK_BAND_LABEL.high} from score<input type="number" name="riskHighMin" min={2} max={25} defaultValue={settings.riskHighMin} required /></label>
            <label className="gh-field">{RISK_BAND_LABEL.extreme} from score<input type="number" name="riskExtremeMin" min={2} max={25} defaultValue={settings.riskExtremeMin} required /></label>
            <label className="gh-field gh-wide">Methodology reference<input name="riskMethodologyNote" maxLength={500} defaultValue={settings.riskMethodologyNote} placeholder="e.g. Hospital risk management policy RM-001, section 4" /></label>
            {canWrite ? <div><button className="ui-button ui-button-primary" type="submit">Save risk bands</button></div> : null}
          </fieldset>
        </form>
      </section>

      <section className="gh-card" id="regulatory" aria-labelledby="reg-heading">
        <h2 id="reg-heading" className="gh-section-title">Regulatory reporting rules</h2>
        <p className="gh-sub">Marifa ships no reporting deadlines. Enter each rule your hospital follows, from the programme and edition it comes from; incidents then show when a notification is due, due soon or overdue.</p>
        {rules.length === 0 ? <Empty title="No rules configured">{canWrite ? "Add the first rule below." : "Governance staff configure rules here."}</Empty> : (
          <ul className="gh-actions">{rules.map((r) => (
            <li key={r.id} className="gh-item" style={r.isActive ? undefined : { opacity: .6 }}>
              <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><h4>{r.name}</h4><span className="gh-btnrow"><Badge tone="info">{r.program}</Badge><Badge tone={r.isActive ? "ok" : "muted"}>{r.isActive ? "Active" : "Off"}</Badge></span></div>
              <span className="gh-meta">Report within {r.reportWithinHours} h · remind {r.remindBeforeHours} h before · applies to {[r.appliesToSentinel ? "sentinel events" : null, r.minSeverity ? `${SEVERITY[r.minSeverity].toLowerCase()} severity or worse` : null, r.categories.length ? `categories: ${r.categories.join(", ")}` : null].filter(Boolean).join(" and ")}{r.recipient ? ` · to ${r.recipient}` : ""}</span>
              <span className="gh-meta">Source: {r.sourceNote}</span>
              {canWrite ? <Details title="Edit rule"><RuleForm rule={r} editions={editions} here={here} /></Details> : null}
            </li>
          ))}</ul>
        )}
        {canWrite ? <div style={{ marginTop: ".7rem" }}><Details title="Add a reporting rule" open={rules.length === 0}><RuleForm editions={editions} here={here} /></Details></div> : null}
      </section>

      <section className="gh-card" aria-labelledby="editions-heading">
        <h2 id="editions-heading" className="gh-section-title">Accreditation editions</h2>
        <p className="gh-sub">Each imported register belongs to an edition. Record which programme and hospital type it covers, and whether it is official text from your licensed manual or an internal framework.</p>
        {editions.length === 0 ? <Empty title="No editions yet">They are created when you import standards.</Empty> : (
          <ul className="gh-actions">{editions.map((e) => (
            <li key={e.id} className="gh-item">
              <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><h4>{e.label}</h4><span className="gh-btnrow"><Badge tone="info">{e.program}</Badge>{e.isOfficial ? <span className="gh-badge gh-badge-official">Official</span> : <span className="gh-badge gh-badge-internal">Internal</span>}<Badge tone={e.status === "active" ? "ok" : "muted"}>{e.status}</Badge></span></div>
              <span className="gh-meta">{e.hospitalType || "Hospital type not recorded"}{e.sourceNote ? ` · ${e.sourceNote}` : ""}</span>
              {canWrite ? (
                <Details title="Edit edition">
                  <form action={saveEditionAction} className="gh-form">
                    <input type="hidden" name="editionId" value={e.id} /><input type="hidden" name="returnTo" value={here} />
                    <label className="gh-field">Programme<input name="program" required maxLength={80} defaultValue={e.program} /></label>
                    <label className="gh-field">Hospital type<input name="hospitalType" maxLength={120} defaultValue={e.hospitalType} /></label>
                    <label className="gh-field">Status<select name="status" defaultValue={e.status}><option value="active">Active</option><option value="superseded">Superseded</option><option value="draft">Draft</option></select></label>
                    <label className="gh-check"><input type="checkbox" name="isOfficial" defaultChecked={e.isOfficial} /> Official text from our licensed manual</label>
                    <label className="gh-field gh-wide">Source<input name="sourceNote" maxLength={1000} defaultValue={e.sourceNote} /></label>
                    <div><button className="ui-button" type="submit">Save</button></div>
                  </form>
                </Details>
              ) : null}
            </li>
          ))}</ul>
        )}
      </section>
    </>
  );
}

function RuleForm({ rule, editions, here }: { rule?: Awaited<ReturnType<typeof loadRegulatoryRules>>[number]; editions: Awaited<ReturnType<typeof loadEditions>>; here: string }) {
  return (
    <form action={saveRegulatoryRuleAction} className="gh-form">
      <input type="hidden" name="returnTo" value={here} />
      {rule ? <input type="hidden" name="ruleId" value={rule.id} /> : null}
      <label className="gh-field">Rule name<input name="name" required maxLength={200} defaultValue={rule?.name} placeholder="e.g. Sentinel event notification" /></label>
      <label className="gh-field">Programme<input name="program" required maxLength={80} defaultValue={rule?.program ?? "CBAHI"} /></label>
      <label className="gh-field">Edition<select name="editionId" defaultValue={rule?.editionId ?? ""}><option value="">Any</option>{editions.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
      <label className="gh-field">Report within (hours)<input type="number" name="reportWithinHours" min={1} max={8760} required defaultValue={rule?.reportWithinHours} /></label>
      <label className="gh-field">Remind before deadline (hours)<input type="number" name="remindBeforeHours" min={0} max={8759} defaultValue={rule?.remindBeforeHours ?? 0} /></label>
      <label className="gh-field">Report to<input name="recipient" maxLength={200} defaultValue={rule?.recipient} /></label>
      <label className="gh-check"><input type="checkbox" name="appliesToSentinel" defaultChecked={rule ? rule.appliesToSentinel : true} /> Applies to sentinel events</label>
      <label className="gh-field">Minimum severity<select name="minSeverity" defaultValue={rule?.minSeverity ?? ""}><option value="">Any</option>{Object.entries(SEVERITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="gh-field">Categories (comma-separated)<input name="categories" maxLength={1000} defaultValue={rule?.categories.join(", ")} placeholder="Blank = any category" /></label>
      <label className="gh-field">Active<select name="isActive" defaultValue={rule?.isActive === false ? "off" : "on"}><option value="on">Active</option><option value="off">Off</option></select></label>
      <label className="gh-field gh-wide">Source of this rule (required)<input name="sourceNote" required maxLength={500} defaultValue={rule?.sourceNote} placeholder="The document and section this deadline comes from" /></label>
      <label className="gh-field gh-wide">Description<textarea name="description" maxLength={2000} defaultValue={rule?.description} /></label>
      <div><button className="ui-button ui-button-primary" type="submit">{rule ? "Save rule" : "Add rule"}</button></div>
    </form>
  );
}
