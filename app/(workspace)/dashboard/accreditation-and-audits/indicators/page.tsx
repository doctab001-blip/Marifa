import Link from "next/link";
import { Activity, Plus, Target } from "lucide-react";
import { createIndicatorAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { Sparkline } from "@/components/accreditation/charts";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stat, nameOf, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { formatDate } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadDepartments, loadPeople, openContext } from "@/lib/governance/repository";
import { loadIndicatorResults, loadIndicators, loadLinkCatalogue, loadLinks, v21 } from "@/lib/governance/repository-v21";
import {
  DIRECTION_LABEL, FREQUENCY_LABEL, INDICATOR_TEMPLATES, JUDGEMENT_LABEL, MEASURE_LABEL, VERIFICATION_LABEL, formatIndicatorValue, periodLabel,
  summariseIndicator, type IndicatorJudgement,
} from "@/lib/governance/indicators";

const BASE = "/dashboard/accreditation-and-audits";
const JUDGE_TONE: Record<IndicatorJudgement, Tone> = { on_target: "ok", off_target: "bad", no_target: "muted", no_data: "muted", no_eligible_cases: "info" };

export default async function IndicatorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const templateKey = pageParam(sp.template);
  const dept = pageParam(sp.department);
  const show = pageParam(sp.show);
  const actor = await getGovernanceActor();
  const header = <PageHeader icon={<Activity size={20} />} eyebrow="Governance hub" title="Clinical quality indicators" subtitle="Define, measure and track the hospital's own indicators. Values are entered and verified here; nothing is calculated from unverified clinical data." />;
  if (!canReadGovernance(actor)) {
    return <>{header}<p className="gh-notice gh-notice-bad" role="alert">Quality indicators are visible to governance staff and auditors.</p></>;
  }
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const loaded = await v21(Promise.all([loadIndicators(ctx), loadIndicatorResults(ctx)]));
  if (!loaded) return <>{header}<NeedsV21 what="The indicator designer" /></>;
  const [indicators, results] = loaded;
  const [people, departments, links, catalogue] = await Promise.all([
    loadPeople(ctx).catch(() => []), loadDepartments(ctx).catch(() => []), v21(loadLinks(ctx, { type: "indicator", ids: indicators.map((i) => i.id) })),
    canWrite ? v21(loadLinkCatalogue(ctx, ["standard", "element", "guideline"])) : Promise.resolve([]),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const template = INDICATOR_TEMPLATES.find((t) => t.key === templateKey);

  const active = indicators.filter((i) => i.status === "active");
  const summaries = active.map((indicator) => ({ indicator, s: summariseIndicator(indicator, results) }));
  const departmentsInUse = [...new Set(active.map((i) => i.department).filter(Boolean))].sort();
  const visible = summaries.filter(({ indicator, s }) => (!dept || indicator.department === dept) && (!show || (show === "off_target" ? s.judgement === "off_target" : show === "unverified" ? s.unverifiedCount > 0 : show === "no_data" ? s.judgement === "no_data" : true)));
  const linkCount = (indicatorId: string) => (links ?? []).filter((l) => (l.sourceType === "indicator" && l.sourceId === indicatorId) || (l.targetType === "indicator" && l.targetId === indicatorId)).length;
  const counts = {
    on: summaries.filter((x) => x.s.judgement === "on_target").length,
    off: summaries.filter((x) => x.s.judgement === "off_target").length,
    unverified: summaries.reduce((n, x) => n + x.s.unverifiedCount, 0),
    noData: summaries.filter((x) => x.s.judgement === "no_data").length,
  };

  return (
    <>
      {header}
      <Notice done={done} error={error} />
      <div className="gh-grid">
        <Stat accent="turquoise" icon={<Activity size={15} />} label="Active indicators" value={active.length} note={indicators.length > active.length ? `${indicators.length - active.length} retired` : "Defined by your quality team"} />
        <Stat accent="emerald" icon={<Target size={15} />} label="Meeting target" value={counts.on} unit={`of ${active.length}`} href={`${BASE}/indicators`} progress={active.length ? (counts.on / active.length) * 100 : null} note="Latest period, against your own targets" />
        <Stat accent="coral" label="Outside target" value={counts.off} href={`${BASE}/indicators?show=off_target`} tone={counts.off > 0 ? "bad" : "ok"} note={counts.off > 0 ? "Link an improvement action" : "None"} />
        <Stat accent="gold" label="Awaiting verification" value={counts.unverified} href={`${BASE}/indicators?show=unverified`} tone={counts.unverified > 0 ? "warn" : "ok"} note={counts.noData > 0 ? `${counts.noData} with no data yet` : "Every indicator has data"} />
      </div>

      {canWrite ? (
        <Details title={template ? `New indicator from template: ${template.title}` : "Design a new indicator"} open={Boolean(template) || indicators.length === 0}>
          <div className="gh-panel-soft">
            <strong>Start from a template</strong> <span className="gh-meta">— definitions to adapt locally. Templates never set a target: your hospital decides.</span>
            <div className="gh-chiplist" style={{ marginTop: ".45rem" }}>
              {INDICATOR_TEMPLATES.map((t) => <Link key={t.key} className="gh-chip" href={`${BASE}/indicators?template=${t.key}`} aria-current={t.key === templateKey ? "true" : undefined}>{t.title}</Link>)}
              {template ? <Link className="gh-chip" href={`${BASE}/indicators`}>Blank form</Link> : null}
            </div>
          </div>
          <form key={templateKey || "blank"} action={createIndicatorAction} className="gh-form">
            <input type="hidden" name="returnTo" value={`${BASE}/indicators`} />
            <input type="hidden" name="templateKey" value={template?.key ?? ""} />
            <label className="gh-field">Code<input name="code" required maxLength={40} placeholder="e.g. IPC-HH-01" /></label>
            <label className="gh-field gh-wide">Title<input name="title" required maxLength={240} defaultValue={template?.title} /></label>
            <label className="gh-field">Clinical domain<input name="domain" maxLength={120} defaultValue={template?.domain} /></label>
            <label className="gh-field">Department<input name="department" list="gh-ind-depts" maxLength={160} /><datalist id="gh-ind-depts">{departments.map((d) => <option key={d} value={d} />)}</datalist></label>
            <label className="gh-field">Responsible officer<select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
            <label className="gh-field gh-wide">Description<textarea name="description" maxLength={4000} defaultValue={template?.description} /></label>
            <label className="gh-field">Numerator<textarea name="numeratorDefinition" maxLength={2000} defaultValue={template?.numeratorDefinition} /></label>
            <label className="gh-field">Denominator<textarea name="denominatorDefinition" maxLength={2000} defaultValue={template?.denominatorDefinition} /></label>
            <label className="gh-field">Inclusion criteria<textarea name="inclusionCriteria" maxLength={2000} defaultValue={template?.inclusionCriteria} /></label>
            <label className="gh-field">Exclusion criteria<textarea name="exclusionCriteria" maxLength={2000} defaultValue={template?.exclusionCriteria} /></label>
            <label className="gh-field">Data source<input name="dataSource" maxLength={500} defaultValue={template?.dataSource} /></label>
            <label className="gh-field">Measurement frequency<select name="frequency" defaultValue={template?.frequency ?? "monthly"}>{Object.entries(FREQUENCY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="gh-field">Measure type<select name="measureType" defaultValue={template?.measureType ?? "percentage"}>{Object.entries(MEASURE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="gh-field">Rate multiplier<input type="number" name="rateMultiplier" min={0} step="any" defaultValue={template?.rateMultiplier} placeholder="Rates only, e.g. 1000" /></label>
            <label className="gh-field">Unit<input name="unit" maxLength={40} defaultValue={template?.unit} placeholder="e.g. minutes, per 1,000 patient-days" /></label>
            <label className="gh-field">Direction of improvement<select name="direction" defaultValue={template?.direction ?? "higher_is_better"}>{Object.entries(DIRECTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="gh-field">Target<input type="number" name="targetValue" step="any" /><small>Set by your hospital. Leave blank if not agreed yet.</small></label>
            <label className="gh-field">Upper limit<input type="number" name="targetUpper" step="any" /><small>Only for “within a range”.</small></label>
            {catalogue && catalogue.length > 0 ? (
              <label className="gh-field gh-wide">Linked CBAHI standard, element or guideline (optional)
                <select name="linkStandard" defaultValue=""><option value="">None for now</option>
                  {(["standard", "element", "guideline"] as const).map((type) => <optgroup key={type} label={type === "standard" ? "Standards" : type === "element" ? "Measurable elements" : "Clinical guidelines"}>{catalogue.filter((o) => o.type === type).map((o) => <option key={o.id} value={`${o.type}:${o.id}`}>{o.label}</option>)}</optgroup>)}
                </select></label>
            ) : null}
            <div><button className="ui-button ui-button-primary" type="submit"><Plus size={15} aria-hidden="true" /> Create indicator</button></div>
          </form>
        </Details>
      ) : null}

      {active.length > 0 ? (
        <form className="gh-filters gh-noprint" method="get">
          <label className="gh-field" style={{ flex: "1 1 200px" }}>Department
            <select name="department" defaultValue={dept}><option value="">All departments</option>{departmentsInUse.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
          <label className="gh-field" style={{ flex: "1 1 200px" }}>Show
            <select name="show" defaultValue={show}><option value="">All active</option><option value="off_target">Outside target</option><option value="unverified">Awaiting verification</option><option value="no_data">No data yet</option></select></label>
          <button className="ui-button" type="submit">Filter</button>
          {dept || show ? <Link className="ui-button" href={`${BASE}/indicators`}>Clear</Link> : null}
        </form>
      ) : null}

      {active.length === 0 ? (
        <Empty title="No indicators yet">{canWrite ? "Design the first one above, or start from one of the templates." : "Your quality team has not defined any indicators yet."}</Empty>
      ) : visible.length === 0 ? <Empty title="Nothing matches">Try clearing the filter.</Empty> : (
        <div className="gh-ind-grid">
          {visible.map(({ indicator, s }) => (
            <Link key={indicator.id} href={`${BASE}/indicators/${indicator.id}`} className="gh-card gh-card-link gh-ind">
              <div className="gh-ind-head">
                <div><div className="gh-ind-code">{indicator.code}{indicator.domain ? ` · ${indicator.domain}` : ""}</div><h3 style={{ margin: ".1rem 0 0" }}>{indicator.title}</h3></div>
                <Badge tone={JUDGE_TONE[s.judgement]}>{JUDGEMENT_LABEL[s.judgement]}</Badge>
              </div>
              <div className="gh-hstack" style={{ alignItems: "baseline" }}>
                <span className="gh-ind-value">{s.latest ? formatIndicatorValue(indicator, s.latest.value) : "—"}</span>
                {s.change !== null ? <span className={s.improving === null ? "gh-meta" : s.improving ? "gh-trend-up" : "gh-trend-down"} style={{ fontSize: ".85rem", fontWeight: 700 }}>{s.change > 0 ? "▲" : s.change < 0 ? "▼" : "■"} {Math.abs(s.change)}{indicator.measureType === "percentage" ? " pts" : ""} vs previous</span> : null}
              </div>
              <Sparkline values={s.series.slice(-12).map((r) => r.value)} label={`${indicator.title} trend`} />
              <div className="gh-ind-meta">
                <span>Target: {indicator.targetValue === null ? "not set" : indicator.direction === "within_range" ? `${indicator.targetValue}–${indicator.targetUpper}` : `${indicator.direction === "lower_is_better" ? "≤" : "≥"} ${formatIndicatorValue(indicator, indicator.targetValue)}`}</span>
                <span>Previous: {s.previous ? formatIndicatorValue(indicator, s.previous.value) : "—"}</span>
                <span>{s.latest ? periodLabel(s.latest.periodStart, s.latest.periodEnd) : "No periods yet"}</span>
                <span>{indicator.department || "No department"}</span>
                <span>{nameOf(peopleById, indicator.ownerUserId)}</span>
                {s.latest ? <span>{VERIFICATION_LABEL[s.latest.verification]}</span> : null}
                {linkCount(indicator.id) > 0 ? <span>{linkCount(indicator.id)} linked record{linkCount(indicator.id) === 1 ? "" : "s"}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
      {indicators.some((i) => i.status === "retired") ? (
        <Details title={`Retired indicators (${indicators.filter((i) => i.status === "retired").length})`}>
          <ul className="gh-actions">{indicators.filter((i) => i.status === "retired").map((i) => <li key={i.id}><Link className="gh-action" style={{ gridTemplateColumns: "1fr auto" }} href={`${BASE}/indicators/${i.id}`}><span><strong>{i.code} · {i.title}</strong></span><Badge tone="muted">Retired</Badge></Link></li>)}</ul>
        </Details>
      ) : null}
      <p className="gh-meta">Automatic measurement from clinical records is deliberately not switched on: values are entered and verified by people until the source data itself is verified. Last refreshed {formatDate(new Date().toISOString())}.</p>
    </>
  );
}
