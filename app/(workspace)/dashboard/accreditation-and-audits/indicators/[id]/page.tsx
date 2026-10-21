import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity } from "lucide-react";
import { addIndicatorResultAction, updateIndicatorAction, verifyIndicatorResultAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { TrendChart } from "@/components/accreditation/charts";
import { LinkPanel } from "@/components/accreditation/link-panel";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stat, nameOf, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadPeople, openContext } from "@/lib/governance/repository";
import { loadEvidenceVersions, loadIndicatorById, loadIndicatorResults, loadLinkCatalogue, loadLinks, v21 } from "@/lib/governance/repository-v21";
import {
  DIRECTION_LABEL, FREQUENCY_LABEL, JUDGEMENT_LABEL, MEASURE_LABEL, VERIFICATION_LABEL, formatIndicatorValue, periodLabel, summariseIndicator,
  type IndicatorJudgement, type Verification,
} from "@/lib/governance/indicators";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JUDGE_TONE: Record<IndicatorJudgement, Tone> = { on_target: "ok", off_target: "bad", no_target: "muted", no_data: "muted", no_eligible_cases: "info" };
const VER_TONE: Record<Verification, Tone> = { verified: "ok", unverified: "warn", rejected: "bad" };

export default async function IndicatorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) return <p className="gh-notice gh-notice-bad" role="alert">Quality indicators are visible to governance staff and auditors.</p>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const indicator = await v21(loadIndicatorById(ctx, id));
  if (indicator === null) {
    const exists = await v21(loadIndicatorResults(ctx, id));
    if (exists === null) return <NeedsV21 what="The indicator designer" />;
    notFound();
  }
  const [results, people, links, catalogue, evidence] = await Promise.all([
    loadIndicatorResults(ctx, id), loadPeople(ctx).catch(() => []), v21(loadLinks(ctx, { type: "indicator", ids: [id] })),
    v21(loadLinkCatalogue(ctx, ["standard", "element", "guideline", "qip", "capa", "audit", "policy"])), canWrite ? v21(loadEvidenceVersions(ctx)) : Promise.resolve([]),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const s = summariseIndicator(indicator, results);
  const replaced = new Set(results.map((r) => r.supersedesId).filter(Boolean));
  const history = [...results].sort((a, b) => b.periodStart.localeCompare(a.periodStart) || b.enteredAt.localeCompare(a.enteredAt));
  const here = `${BASE}/indicators/${id}`;
  const ratio = indicator.measureType === "percentage" || indicator.measureType === "rate";
  const correcting = pageParam(sp.correct);
  const toCorrect = results.find((r) => r.id === correcting);

  return (
    <>
      <PageHeader icon={<Activity size={20} />} eyebrow={<><Link href={`${BASE}/indicators`}>Clinical indicators</Link> / {indicator.code}</>} title={indicator.title}
        subtitle={indicator.description || `${MEASURE_LABEL[indicator.measureType]} · ${FREQUENCY_LABEL[indicator.frequency]}`}
        actions={<><Badge tone={JUDGE_TONE[s.judgement]}>{JUDGEMENT_LABEL[s.judgement]}</Badge>{indicator.status === "retired" ? <Badge tone="muted">Retired</Badge> : null}</>} />
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />

      <div className="gh-grid">
        <Stat accent="turquoise" label="Current performance" value={s.latest ? formatIndicatorValue(indicator, s.latest.value) : "—"} note={s.latest ? `${periodLabel(s.latest.periodStart, s.latest.periodEnd)} · ${VERIFICATION_LABEL[s.latest.verification]}` : "No data yet"} />
        <Stat accent="gold" label="Target" value={indicator.targetValue === null ? "Not set" : indicator.direction === "within_range" ? `${indicator.targetValue}–${indicator.targetUpper}` : formatIndicatorValue(indicator, indicator.targetValue)} note={DIRECTION_LABEL[indicator.direction]} />
        <Stat accent="blue" label="Previous period" value={s.previous ? formatIndicatorValue(indicator, s.previous.value) : "—"} note={s.change === null ? "No comparison yet" : `${s.change > 0 ? "+" : ""}${s.change}${indicator.measureType === "percentage" ? " pts" : ""}${s.improving === null ? "" : s.improving ? " · improving" : " · worsening"}`} tone={s.improving === null ? undefined : s.improving ? "ok" : "bad"} />
        <Stat accent="navy" label="Department" value={<span style={{ fontSize: "1.15rem" }}>{indicator.department || "—"}</span>} note={`Owner: ${nameOf(peopleById, indicator.ownerUserId)}`} />
      </div>

      <section className="gh-card" aria-labelledby="trend-heading">
        <h2 id="trend-heading" className="gh-section-title">Trend over time</h2>
        <p className="gh-sub">Filled points are verified; hollow points are not yet verified. Corrected and rejected values are left out of the line but stay in the history below.</p>
        {s.series.length === 0 ? <Empty title="No results yet">Record the first reporting period below.</Empty> : (
          <TrendChart name={indicator.title} unit={indicator.unit} percent={indicator.measureType === "percentage"} target={indicator.targetValue} targetUpper={indicator.direction === "within_range" ? indicator.targetUpper : null}
            data={s.series.map((r) => ({ label: periodLabel(r.periodStart, r.periodEnd), value: r.value, verified: r.verification === "verified" }))} />
        )}
      </section>

      <div className="gh-split">
        <section className="gh-card" aria-labelledby="history-heading">
          <h2 id="history-heading" className="gh-section-title">Reporting history</h2>
          <p className="gh-sub">Values are never edited or deleted. A correction is a new entry that replaces the old one in the trend.</p>
          {history.length === 0 ? <Empty title="Nothing reported yet" /> : (
            <div className="gh-table-wrap"><table className="gh-table">
              <thead><tr><th scope="col">Period</th>{ratio ? <><th scope="col" className="gh-num">Num.</th><th scope="col" className="gh-num">Den.</th></> : null}<th scope="col" className="gh-num">Value</th><th scope="col">Status</th><th scope="col">Entered</th>{canWrite ? <th scope="col"><span className="sr-only">Actions</span></th> : null}</tr></thead>
              <tbody>{history.map((r) => (
                <tr key={r.id} style={replaced.has(r.id) ? { opacity: .6 } : undefined}>
                  <td>{periodLabel(r.periodStart, r.periodEnd)}<div className="gh-meta">{formatDate(r.periodStart)} – {formatDate(r.periodEnd)}</div>{r.supersedesId ? <Badge tone="info">Correction</Badge> : null}{replaced.has(r.id) ? <Badge tone="muted">Replaced</Badge> : null}</td>
                  {ratio ? <><td className="gh-num">{r.numerator ?? "—"}</td><td className="gh-num">{r.denominator ?? "—"}</td></> : null}
                  <td className="gh-num"><strong>{r.value === null && ratio ? "No eligible cases" : formatIndicatorValue(indicator, r.value)}</strong>{r.sampleSize ? <div className="gh-meta">n = {r.sampleSize}</div> : null}</td>
                  <td><Badge tone={VER_TONE[r.verification]}>{VERIFICATION_LABEL[r.verification]}</Badge>{r.verifiedBy ? <div className="gh-meta">{nameOf(peopleById, r.verifiedBy)}{r.verificationNote ? `: ${r.verificationNote}` : ""}</div> : null}{r.notes ? <div className="gh-meta gh-clamp">{r.notes}</div> : null}</td>
                  <td className="gh-meta">{nameOf(peopleById, r.enteredBy)}<br />{formatStamp(r.enteredAt)}</td>
                  {canWrite ? (
                    <td>
                      {!replaced.has(r.id) ? (
                        <div className="gh-btnrow">
                          {r.verification !== "verified" ? <VerifyButton resultId={r.id} indicatorId={id} to="verified" label="Verify" note={r.enteredBy === actor.userId ? "Verified by the person who entered it" : ""} /> : null}
                          <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>More…</summary>
                            <div style={{ display: "grid", gap: ".4rem", marginTop: ".4rem", minWidth: "15rem" }}>
                              <form action={verifyIndicatorResultAction} className="gh-btnrow">
                                <input type="hidden" name="resultId" value={r.id} /><input type="hidden" name="indicatorId" value={id} /><input type="hidden" name="returnTo" value={here} /><input type="hidden" name="verification" value="rejected" />
                                <input name="note" required maxLength={2000} placeholder="Why is it rejected?" aria-label="Reason for rejection" className="gh-inline-input" />
                                <button className="ui-button ui-button-danger" type="submit">Reject</button>
                              </form>
                              <Link className="ui-button" href={`${here}?correct=${r.id}#add-result`}>Record a correction</Link>
                            </div>
                          </details>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}</tbody>
            </table></div>
          )}
          {canWrite && indicator.status === "active" ? (
            <div id="add-result" style={{ marginTop: ".9rem" }}>
              <Details title={toCorrect ? `Correct the value for ${periodLabel(toCorrect.periodStart, toCorrect.periodEnd)}` : "Record a reporting period"} open={Boolean(toCorrect) || results.length === 0}>
                <form action={addIndicatorResultAction} className="gh-form">
                  <input type="hidden" name="indicatorId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  {toCorrect ? <input type="hidden" name="supersedesId" value={toCorrect.id} /> : null}
                  <label className="gh-field">Period start<input type="date" name="periodStart" required defaultValue={toCorrect?.periodStart} /></label>
                  <label className="gh-field">Period end<input type="date" name="periodEnd" required defaultValue={toCorrect?.periodEnd} /></label>
                  {ratio ? (
                    <>
                      <label className="gh-field">Numerator<input type="number" name="numerator" min={0} step="any" required /><small>{indicator.numeratorDefinition || "Cases meeting the measure"}</small></label>
                      <label className="gh-field">Denominator<input type="number" name="denominator" min={0} step="any" required /><small>{indicator.denominatorDefinition || "Eligible cases"}. Enter 0 if there were none.</small></label>
                    </>
                  ) : <label className="gh-field">Value{indicator.unit ? ` (${indicator.unit})` : ""}<input type="number" name="value" step={indicator.measureType === "count" ? 1 : "any"} min={indicator.measureType === "continuous" ? undefined : 0} required /></label>}
                  <label className="gh-field">Sample size<input type="number" name="sampleSize" min={1} /></label>
                  {evidence && evidence.length > 0 ? (
                    <label className="gh-field">Source document<select name="evidenceId" defaultValue=""><option value="">None</option>{evidence.filter((e) => !e.withdrawnAt).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
                  ) : null}
                  <label className="gh-field gh-wide">Notes<textarea name="notes" maxLength={2000} placeholder={toCorrect ? "Why is the value being corrected?" : ""} required={Boolean(toCorrect)} /></label>
                  <div className="gh-btnrow"><button className="ui-button ui-button-primary" type="submit">{toCorrect ? "Save correction" : "Record result"}</button>{toCorrect ? <Link className="ui-button" href={here}>Cancel</Link> : null}</div>
                </form>
                {ratio ? <p className="gh-meta" style={{ margin: 0 }}>The {indicator.measureType === "percentage" ? "percentage" : "rate"} is calculated for you. A period with no eligible cases is recorded as such — never as 0% — and a numerator larger than the denominator is refused.</p> : null}
              </Details>
            </div>
          ) : null}
        </section>

        <div style={{ display: "grid", gap: ".9rem" }}>
          <section className="gh-card" aria-labelledby="def-heading">
            <h2 id="def-heading" className="gh-section-title">Definition</h2>
            <dl className="gh-kv">
              <dt>Code</dt><dd>{indicator.code}</dd>
              <dt>Domain</dt><dd>{indicator.domain || "—"}</dd>
              <dt>Measure</dt><dd>{MEASURE_LABEL[indicator.measureType]}{indicator.measureType === "rate" ? ` (× ${indicator.rateMultiplier})` : ""}</dd>
              <dt>Numerator</dt><dd>{indicator.numeratorDefinition || "—"}</dd>
              <dt>Denominator</dt><dd>{indicator.denominatorDefinition || "—"}</dd>
              <dt>Inclusion</dt><dd>{indicator.inclusionCriteria || "—"}</dd>
              <dt>Exclusion</dt><dd>{indicator.exclusionCriteria || "—"}</dd>
              <dt>Data source</dt><dd>{indicator.dataSource || "—"}</dd>
              <dt>Frequency</dt><dd>{FREQUENCY_LABEL[indicator.frequency]}</dd>
            </dl>
            {canWrite ? (
              <Details title="Edit target, owner and status">
                <form action={updateIndicatorAction} className="gh-form">
                  <input type="hidden" name="indicatorId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field">Direction<select name="direction" defaultValue={indicator.direction}>{Object.entries(DIRECTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                  <label className="gh-field">Target<input type="number" name="targetValue" step="any" defaultValue={indicator.targetValue ?? ""} /></label>
                  <label className="gh-field">Upper limit<input type="number" name="targetUpper" step="any" defaultValue={indicator.targetUpper ?? ""} /></label>
                  <label className="gh-field">Responsible officer<select name="ownerUserId" defaultValue={indicator.ownerUserId ?? ""}><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                  <label className="gh-field">Department<input name="department" maxLength={160} defaultValue={indicator.department} /></label>
                  <label className="gh-field">Data source<input name="dataSource" maxLength={500} defaultValue={indicator.dataSource} /></label>
                  <label className="gh-field">Status<select name="status" defaultValue={indicator.status}><option value="active">Active</option><option value="retired">Retired</option></select></label>
                  <div><button className="ui-button" type="submit">Save</button></div>
                </form>
              </Details>
            ) : null}
          </section>
          {links && catalogue ? (
            <LinkPanel title="Linked standards, guidelines and improvement actions" sourceType="indicator" sourceId={id} links={links} catalogue={catalogue}
              allow={["standard", "element", "guideline", "qip", "capa", "audit", "policy"]} canWrite={canWrite} returnTo={here}
              hint={s.judgement === "off_target" ? "This indicator is outside target: link the improvement project or action addressing it." : "Accreditation requirements this indicator evidences, and the actions that act on it."} />
          ) : null}
        </div>
      </div>
    </>
  );
}

function VerifyButton({ resultId, indicatorId, to, label, note }: { resultId: string; indicatorId: string; to: Verification; label: string; note: string }) {
  return (
    <form action={verifyIndicatorResultAction}>
      <input type="hidden" name="resultId" value={resultId} /><input type="hidden" name="indicatorId" value={indicatorId} /><input type="hidden" name="verification" value={to} />
      <input type="hidden" name="note" value={note} /><input type="hidden" name="returnTo" value={`${BASE}/indicators/${indicatorId}`} />
      <button className="ui-button ui-button-primary" type="submit">{label}</button>
    </form>
  );
}
