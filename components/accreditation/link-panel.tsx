import Link from "next/link";
import { addLinkAction, removeLinkAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { Empty } from "@/components/accreditation/ui";
import { LINK_TYPE_LABEL, linksOf, type LinkRow, type LinkType } from "@/lib/governance/guideline-governance";
import type { LinkOption } from "@/lib/governance/repository-v21";

const BASE = "/dashboard/accreditation-and-audits";

/** Where a linked record lives, so every chip is a link to the original (nothing is copied). */
export function hrefOf(type: LinkType, id: string): string | null {
  switch (type) {
    case "standard": return `${BASE}/standards/${id}`;
    case "policy": return `${BASE}/policies/${id}`;
    case "guideline": return `${BASE}/policies/guidelines?view=${id}`;
    case "indicator": return `${BASE}/indicators/${id}`;
    case "incident": return `${BASE}/incidents?view=${id}&status=all`;
    case "qip": return `${BASE}/audits/qip/${id}`;
    case "audit": return `${BASE}/audits?audit=${id}`;
    case "committee": return `${BASE}/committees/${id}`;
    case "capa": return `${BASE}/incidents#actions-heading`;
    default: return null;
  }
}

/**
 * Shows every record linked to ONE governance record (read from either end of the link) and, for writers, a picker to
 * add more. Labels come from the catalogue; nothing about the linked record is copied into the link itself.
 */
export function LinkPanel({ title, sourceType, sourceId, links, catalogue, allow, canWrite, returnTo, hint, pinVersionId }: {
  title: string; sourceType: LinkType; sourceId: string; links: LinkRow[]; catalogue: LinkOption[]; allow: LinkType[];
  canWrite: boolean; returnTo: string; hint?: string;
  /** For a guideline: store new links pointing AT it, pinned to this version, so they keep the version that was reviewed. */
  pinVersionId?: string | null;
}) {
  const mine = linksOf(links, sourceType, sourceId);
  const label = new Map(catalogue.map((o) => [`${o.type}:${o.id}`, o.label]));
  const linked = new Set(mine.map((m) => `${m.type}:${m.id}`));
  const options = catalogue.filter((o) => allow.includes(o.type) && !linked.has(`${o.type}:${o.id}`) && !(o.type === sourceType && o.id === sourceId));
  const groups = allow.map((type) => ({ type, items: options.filter((o) => o.type === type) })).filter((g) => g.items.length > 0);
  return (
    <section className="gh-card" aria-label={title}>
      <h3 className="gh-section-title">{title}</h3>
      {hint ? <p className="gh-sub">{hint}</p> : null}
      {mine.length === 0 ? <p className="gh-meta" style={{ margin: ".2rem 0 .6rem" }}>Nothing linked yet.</p> : (
        <ul className="gh-actions" style={{ marginBottom: ".6rem" }}>
          {mine.map((m) => {
            const href = hrefOf(m.type, m.id);
            const text = label.get(`${m.type}:${m.id}`) ?? "Record not visible to you";
            return (
              <li key={m.link.id} className="gh-row" style={{ gridTemplateColumns: "auto 1fr auto" }}>
                <span className="gh-chip">{LINK_TYPE_LABEL[m.type]}</span>
                <span>{href ? <Link href={href}>{text}</Link> : text}{m.versionId ? <span className="gh-meta"> · linked to the version current at the time</span> : null}{m.link.note ? <span className="gh-meta"> · {m.link.note}</span> : null}</span>
                {canWrite ? (
                  <form action={removeLinkAction}>
                    <input type="hidden" name="linkId" value={m.link.id} /><input type="hidden" name="returnTo" value={returnTo} />
                    <button className="ui-button" type="submit" aria-label={`Remove link to ${text}`}>Remove</button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {canWrite && groups.length > 0 ? (
        <form action={addLinkAction} className="gh-form">
          <input type="hidden" name="sourceType" value={sourceType} /><input type="hidden" name="sourceId" value={sourceId} /><input type="hidden" name="returnTo" value={returnTo} />
          {pinVersionId !== undefined ? <><input type="hidden" name="reverse" value="1" /><input type="hidden" name="targetVersionId" value={pinVersionId ?? ""} /></> : null}
          {catalogue.filter((o) => o.type === "guideline" && o.versionId).map((o) => <input key={o.id} type="hidden" name={`version:${o.id}`} value={o.versionId ?? ""} />)}
          <label className="gh-field gh-wide">Link to
            <select name="target" required defaultValue="">
              <option value="" disabled>Choose a record…</option>
              {groups.map((g) => <optgroup key={g.type} label={LINK_TYPE_LABEL[g.type]}>{g.items.map((o) => <option key={o.id} value={`${o.type}:${o.id}`}>{o.label}</option>)}</optgroup>)}
            </select></label>
          <label className="gh-field">Note (optional)<input name="note" maxLength={500} /></label>
          <div><button className="ui-button" type="submit">Add link</button></div>
        </form>
      ) : canWrite && mine.length === 0 ? <Empty title="Nothing to link yet">Create the related records first.</Empty> : null}
    </section>
  );
}
