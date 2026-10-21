import Link from "next/link";
import {
  createElementAction, createRequirementAction, linkEvidenceAction, recordElementAssessmentAction, reviewSubmissionAction, setRequirementActiveAction,
  submitExistingEvidenceAction, unlinkEvidenceAction, updateElementAction, uploadEvidenceV21Action, uploadEvidenceVersionAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { DropZone } from "@/components/accreditation/drop-zone";
import { LinkPanel } from "@/components/accreditation/link-panel";
import { Badge, Details, Empty, Meter, NeedsV21, RatingBadge, Stepper, nameOf, type Tone } from "@/components/accreditation/ui";
import { formatDate, formatStamp } from "@/lib/governance/clock";
import {
  EVIDENCE_STEPS, REQUIREMENT_CATEGORY_LABEL, REQUIREMENT_STATE_LABEL, completeness, evidenceLifecycle, requirementState, supersededIds, versionHistory,
  type EvidenceWithVersion, type RequirementState,
} from "@/lib/governance/evidence-requirements";
import { APPLICABILITY_LABEL, elementProgress } from "@/lib/governance/hierarchy";
import type { Ctx } from "@/lib/governance/repository";
import { signedUrl } from "@/lib/governance/repository";
import {
  loadElementHistory, loadElementStatuses, loadElements, loadEvidenceByIds, loadEvidenceLinks, loadEvidenceVersions, loadLinkCatalogue, loadLinks,
  loadRequirements, loadStandardHierarchy, loadSubmissions, v21,
} from "@/lib/governance/repository-v21";
import { EVIDENCE_TYPE_LABEL, RATING_LABEL, type Person } from "@/lib/governance/types";

const STATE_TONE: Record<RequirementState, Tone> = { missing: "bad", uploaded: "info", under_review: "warn", verified: "ok", rejected: "bad", expired: "bad", superseded: "warn" };
const LIFE_TONE = { current: "ok", expiring: "warn", expired: "bad", withdrawn: "muted", superseded: "muted" } as const;
const METHOD_LABEL: Record<string, string> = { self_assessment: "Self-assessment", mock_survey: "Mock survey", audit: "Audit", external_survey: "External survey" };
const previewable = (name: string) => /\.(pdf|png|jpe?g)$/i.test(name);

/** Everything V2.1 adds to a standard's page. Loads its own data; shows a notice instead if V2.1 is not applied yet. */
export async function StandardV21({ ctx, standardId, standardCode, canWrite, people, today, here }: {
  ctx: Ctx; standardId: string; standardCode: string; canWrite: boolean; people: Person[]; today: Date; here: string;
}) {
  const elements = await v21(loadElements(ctx, standardId));
  if (elements === null) return <NeedsV21 what="Measurable elements, evidence checklists and linked evidence" />;
  const elementIds = elements.map((e) => e.id);
  const [statuses, history, requirements, links, ownEvidence, hierarchy, govLinks, catalogue, vault] = await Promise.all([
    loadElementStatuses(ctx, standardId), loadElementHistory(ctx, elementIds), loadRequirements(ctx, { standardId, elementIds }),
    loadEvidenceLinks(ctx, { standardId, elementIds }), loadEvidenceVersions(ctx, standardId), loadStandardHierarchy(ctx),
    v21(loadLinks(ctx)), v21(loadLinkCatalogue(ctx, ["capa", "audit", "qip", "indicator", "guideline", "policy", "decision"])),
    canWrite ? loadEvidenceVersions(ctx) : Promise.resolve([] as EvidenceWithVersion[]),
  ]);
  const submissions = await loadSubmissions(ctx, requirements.map((r) => r.id));
  // Evidence that lives on another standard but is linked here (or to one of this standard's elements).
  const foreignIds = [...new Set(links.map((l) => l.evidenceId).filter((eid) => !ownEvidence.some((e) => e.id === eid)))];
  const submittedIds = [...new Set(submissions.map((s) => s.evidenceId).filter((eid) => !ownEvidence.some((e) => e.id === eid) && !foreignIds.includes(eid)))];
  const foreign = await loadEvidenceByIds(ctx, [...foreignIds, ...submittedIds]);
  const allEvidence = [...ownEvidence, ...foreign];
  const evidenceById = new Map(allEvidence.map((e) => [e.id, e]));
  const superseded = supersededIds(vault.length ? vault : allEvidence);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const statusById = new Map(statuses.map((s) => [s.elementId, s]));
  const progress = elementProgress(elements, statuses);
  const isOfficial = hierarchy.get(standardId)?.isOfficial !== false;

  const views = requirements.map((r) => requirementState(r, submissions, evidenceById, superseded, today));
  const comp = completeness(views);
  const elementLabel = new Map(elements.map((e) => [e.id, `${standardCode} / ${e.code}`]));
  const urls = new Map<string, string | null>();
  for (const item of allEvidence.filter((e) => !e.withdrawnAt)) urls.set(item.id, await signedUrl(ctx, item.storagePath));
  const currentForPicking = allEvidence.filter((e) => !e.withdrawnAt && !superseded.has(e.id));
  const linkable = vault.filter((e) => !e.withdrawnAt && !superseded.has(e.id) && e.standardId !== standardId && !links.some((l) => l.evidenceId === e.id && l.standardId === standardId));
  const historyOf = (elementId: string) => history.filter((h) => h.elementId === elementId);

  return (
    <>
      {!isOfficial ? <p className="gh-notice gh-notice-info" role="note"><strong>Internal requirement.</strong> Written by the hospital; it is not official CBAHI wording.</p> : null}

      {/* ---- Measurable elements ---- */}
      <section className="gh-card" aria-labelledby="elements-heading">
        <div className="gh-head">
          <div><h2 id="elements-heading" className="gh-section-title" style={{ margin: 0 }}>Measurable elements</h2>
            <p className="gh-sub" style={{ margin: ".15rem 0 0" }}>{progress.total === 0 ? "None imported for this standard yet." : `${progress.assessed} of ${progress.applicable} applicable elements assessed · ${progress.satisfactory} satisfactory${progress.toConfirm ? ` · ${progress.toConfirm} applicability to confirm` : ""}${progress.esr ? ` · ${progress.esr} ESR` : ""}`}</p></div>
          {progress.applicable > 0 ? <div style={{ minWidth: 180 }}><Meter pct={(progress.assessed / progress.applicable) * 100} tone="info" label="Elements assessed" /></div> : null}
        </div>
        {elements.length === 0 ? <div style={{ marginTop: ".6rem" }}><Empty title="No measurable elements">Import them with the import wizard, or add one below.</Empty></div> : (
          <div className="gh-table-wrap" style={{ marginTop: ".6rem" }}><table className="gh-table">
            <thead><tr><th scope="col">Element</th><th scope="col">Requirement</th><th scope="col">Applicability</th><th scope="col">Rating</th><th scope="col">Owner</th><th scope="col">Review due</th></tr></thead>
            <tbody>{elements.map((el) => {
              const st = statusById.get(el.id);
              const elLinks = links.filter((l) => l.elementId === el.id).length;
              return (
                <tr key={el.id}>
                  <td><strong className="gh-code">{el.code}</strong>{el.officialCode && el.officialCode !== el.code ? <div className="gh-meta">Official: {el.officialCode}</div> : null}
                    <div className="gh-btnrow" style={{ marginTop: ".2rem" }}>{el.isEsr ? <Badge tone="bad">ESR</Badge> : null}{!el.isOfficial ? <span className="gh-badge gh-badge-internal">Internal</span> : null}</div></td>
                  <td className="gh-desc"><span className="gh-clamp">{el.description}</span>{el.evidenceGuidance ? <div className="gh-meta gh-clamp">Evidence: {el.evidenceGuidance}</div> : null}
                    <details className="gh-noprint" style={{ marginTop: ".3rem" }}><summary className="gh-meta" style={{ cursor: "pointer" }}>Assess, edit, history{elLinks ? ` · ${elLinks} linked file${elLinks === 1 ? "" : "s"}` : ""}</summary>
                      <div style={{ display: "grid", gap: ".6rem", marginTop: ".5rem", minWidth: "min(80vw, 520px)" }}>
                        {canWrite ? (
                          <form action={recordElementAssessmentAction} className="gh-form">
                            <input type="hidden" name="elementId" value={el.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
                            <label className="gh-field">Rating<select name="rating" required defaultValue=""><option value="" disabled>Choose…</option>{Object.entries(RATING_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                            <label className="gh-field">Method<select name="method" defaultValue="self_assessment">{Object.entries(METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                            <label className="gh-field">Next review<input type="date" name="nextReviewDue" /></label>
                            <label className="gh-field gh-wide">Notes / gap<textarea name="notes" maxLength={4000} /></label>
                            <div><button className="ui-button ui-button-primary" type="submit">Record assessment</button></div>
                          </form>
                        ) : null}
                        {historyOf(el.id).length > 0 ? (
                          <ul className="gh-tl">{historyOf(el.id).map((h) => <li key={h.id}><span><strong>{RATING_LABEL[h.rating as keyof typeof RATING_LABEL] ?? h.rating}</strong> · {METHOD_LABEL[h.method] ?? h.method} · {formatStamp(h.assessedAt)} · {nameOf(peopleById, h.assessedBy)}{h.notes ? <div className="gh-meta">{h.notes}</div> : null}</span></li>)}</ul>
                        ) : <span className="gh-meta">No assessment history yet.</span>}
                        {canWrite ? (
                          <form action={updateElementAction} className="gh-form">
                            <input type="hidden" name="elementId" value={el.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
                            <label className="gh-field">Applicability<select name="applicability" defaultValue={el.applicability}>{Object.entries(APPLICABILITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                            <label className="gh-field">Responsible officer<select name="ownerUserId" defaultValue={el.ownerUserId ?? ""}><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                            <label className="gh-field">Department<input name="department" maxLength={160} defaultValue={el.department} /></label>
                            <label className="gh-field">Verification date<input type="date" name="verifiedOn" defaultValue={el.verifiedOn ?? ""} /></label>
                            <label className="gh-field">Review due<input type="date" name="reviewDue" defaultValue={el.reviewDue ?? ""} /></label>
                            <label className="gh-check"><input type="checkbox" name="isEsr" defaultChecked={el.isEsr} /> ESR</label>
                            <label className="gh-field gh-wide">ESR verified at<input name="esrSource" maxLength={300} defaultValue={el.esrSource} placeholder="Required if ESR: where the classification was confirmed" /></label>
                            <label className="gh-field gh-wide">Evidence requirements (guidance)<textarea name="evidenceGuidance" maxLength={2000} defaultValue={el.evidenceGuidance} /></label>
                            <div><button className="ui-button" type="submit">Save element</button></div>
                          </form>
                        ) : null}
                      </div>
                    </details></td>
                  <td><Badge tone={el.applicability === "applicable" ? "info" : el.applicability === "to_confirm" ? "warn" : "muted"}>{APPLICABILITY_LABEL[el.applicability]}</Badge></td>
                  <td><RatingBadge rating={st?.rating ?? null} />{st?.assessedAt ? <div className="gh-meta">{formatDate(st.assessedAt)}</div> : null}</td>
                  <td>{el.ownerUserId ? nameOf(peopleById, el.ownerUserId) : el.department || <span className="gh-meta">Unassigned</span>}</td>
                  <td>{el.reviewDue ?? st?.nextReviewDue ? formatDate(el.reviewDue ?? st?.nextReviewDue ?? null) : "—"}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
        {canWrite ? (
          <div style={{ marginTop: ".7rem" }}><Details title="Add a measurable element">
            <form action={createElementAction} className="gh-form">
              <input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
              <label className="gh-field">Element code<input name="code" required maxLength={80} placeholder={`e.g. ${standardCode}.1`} /></label>
              <label className="gh-field">Official code<input name="officialCode" maxLength={80} placeholder="As printed in the manual" /></label>
              <label className="gh-field">Source<select name="isOfficial" defaultValue={isOfficial ? "yes" : "no"}><option value="yes">From our licensed manual</option><option value="no">Internal draft (non-official)</option></select></label>
              <label className="gh-field">Applicability<select name="applicability" defaultValue="applicable">{Object.entries(APPLICABILITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              <label className="gh-field gh-wide">Element text<textarea name="description" required maxLength={4000} /></label>
              <label className="gh-field">Responsible officer<select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
              <label className="gh-field">Department<input name="department" maxLength={160} /></label>
              <label className="gh-field">Review due<input type="date" name="reviewDue" /></label>
              <label className="gh-check"><input type="checkbox" name="isEsr" /> ESR</label>
              <label className="gh-field gh-wide">ESR verified at<input name="esrSource" maxLength={300} placeholder="Only if ESR: the manual section that classifies it" /></label>
              <label className="gh-field gh-wide">Evidence requirements (guidance)<textarea name="evidenceGuidance" maxLength={2000} /></label>
              <div><button className="ui-button ui-button-primary" type="submit">Add element</button></div>
            </form>
          </Details></div>
        ) : null}
      </section>

      {/* ---- Evidence checklist and completeness ---- */}
      <section className="gh-card" aria-labelledby="checklist-heading">
        <div className="gh-head">
          <div><h2 id="checklist-heading" className="gh-section-title" style={{ margin: 0 }}>Expected evidence</h2>
            <p className="gh-sub" style={{ margin: ".15rem 0 0" }}>The hospital&apos;s own checklist of what should be on file for this standard and its elements. Categories are your configuration, not a claim about what CBAHI requires.</p></div>
          {comp.pct !== null ? <div style={{ textAlign: "right" }}><div className="gh-stat-value" style={{ fontSize: "1.6rem" }}>{comp.pct}%</div><div className="gh-meta">{comp.satisfied} of {comp.required} required verified</div></div> : null}
        </div>
        {comp.pct !== null ? <Meter pct={comp.pct} label="Evidence completeness" /> : null}
        {comp.missing.length + comp.awaitingReview.length + comp.stale.length > 0 ? (
          <div className="gh-panel-soft" style={{ marginTop: ".7rem" }}>
            <strong>Exactly what is missing</strong>
            <ul style={{ margin: ".4rem 0 0", paddingLeft: "1.1rem", display: "grid", gap: ".2rem" }}>
              {[...comp.missing, ...comp.stale, ...comp.awaitingReview].map((v) => (
                <li key={v.requirement.id}><strong>{REQUIREMENT_CATEGORY_LABEL[v.requirement.category]}</strong>{v.requirement.elementId ? ` for ${elementLabel.get(v.requirement.elementId)}` : ""}{v.requirement.description ? ` — ${v.requirement.description}` : ""}: <Badge tone={STATE_TONE[v.state]}>{REQUIREMENT_STATE_LABEL[v.state]}</Badge>{v.requirement.isRequired ? "" : " (optional)"}{v.overdue ? <> <Badge tone="bad">Overdue</Badge></> : null}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {requirements.length === 0 ? <div style={{ marginTop: ".6rem" }}><Empty title="No checklist yet">{canWrite ? "Add the documents a surveyor should be able to see for this standard." : "Governance staff have not configured expected evidence here."}</Empty></div> : (
          <ul className="gh-actions" style={{ marginTop: ".7rem" }}>
            {views.map((v) => {
              const r = v.requirement;
              return (
                <li key={r.id} className="gh-item" style={r.isActive ? undefined : { opacity: .55 }}>
                  <div className="gh-btnrow" style={{ justifyContent: "space-between" }}>
                    <h4>{REQUIREMENT_CATEGORY_LABEL[r.category]}{r.elementId ? <span className="gh-meta"> · {elementLabel.get(r.elementId)}</span> : null}</h4>
                    <span className="gh-btnrow"><Badge tone={r.isRequired ? "info" : "muted"}>{r.isRequired ? "Required" : "Optional"}</Badge><Badge tone={STATE_TONE[v.state]}>{REQUIREMENT_STATE_LABEL[v.state]}</Badge>{v.expiringSoon ? <Badge tone="warn">Expiring soon</Badge> : null}</span>
                  </div>
                  {r.description ? <p style={{ margin: 0 }}>{r.description}</p> : null}
                  <span className="gh-meta">{r.department || "No department"} · {nameOf(peopleById, r.ownerUserId)}{r.dueDate ? ` · due ${formatDate(r.dueDate)}` : ""}{v.submission?.reviewerUserId ? ` · reviewed by ${nameOf(peopleById, v.submission.reviewerUserId)}${v.submission.reviewedAt ? ` on ${formatDate(v.submission.reviewedAt)}` : ""}` : ""}{v.evidence?.validUntil ? ` · next review/expiry ${formatDate(v.evidence.validUntil)}` : ""}</span>
                  <Stepper label={`Evidence workflow for ${REQUIREMENT_CATEGORY_LABEL[r.category]}`} steps={EVIDENCE_STEPS} current={v.state === "rejected" ? "missing" : v.state === "expired" || v.state === "superseded" ? "verified" : v.state}
                    branch={v.state === "expired" ? { label: "Expired", tone: "bad" } : v.state === "superseded" ? { label: "Superseded", tone: "warn" } : v.state === "rejected" ? { label: "Rejected", tone: "bad" } : null} />
                  {v.evidence ? <span className="gh-meta">Document: {urls.get(v.evidence.id) ? <a href={urls.get(v.evidence.id) as string} target="_blank" rel="noopener noreferrer">{v.evidence.title}</a> : v.evidence.title}{v.submission?.reviewNote ? ` · “${v.submission.reviewNote}”` : ""}</span> : null}
                  {canWrite && r.isActive ? (
                    <div className="gh-btnrow">
                      {v.submission && v.state === "uploaded" ? <ReviewButton submissionId={v.submission.id} to="under_review" label="Start review" standardId={standardId} here={here} /> : null}
                      {v.submission && v.state === "under_review" ? (
                        <>
                          <ReviewButton submissionId={v.submission.id} to="verified" label="Verify" primary standardId={standardId} here={here} />
                          <form action={reviewSubmissionAction} className="gh-btnrow">
                            <input type="hidden" name="submissionId" value={v.submission.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
                            <input name="note" required maxLength={2000} placeholder="Why is it rejected?" aria-label="Reason for rejecting" className="gh-inline-input" />
                            <button className="ui-button ui-button-danger" type="submit">Reject</button>
                          </form>
                        </>
                      ) : null}
                      {v.state === "missing" || v.state === "rejected" || v.state === "expired" || v.state === "superseded" ? (
                        <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Provide evidence…</summary>
                          <div style={{ display: "grid", gap: ".6rem", marginTop: ".5rem", minWidth: "min(80vw, 460px)" }}>
                            {currentForPicking.length > 0 ? (
                              <form action={submitExistingEvidenceAction} className="gh-form">
                                <input type="hidden" name="requirementId" value={r.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
                                <label className="gh-field gh-wide">Use a document already on file<select name="evidenceId" required defaultValue=""><option value="" disabled>Choose…</option>{currentForPicking.map((e) => <option key={e.id} value={e.id}>{e.title} ({EVIDENCE_TYPE_LABEL[e.evidenceType]})</option>)}</select></label>
                                <div><button className="ui-button" type="submit">Link document</button></div>
                              </form>
                            ) : null}
                            <form action={uploadEvidenceV21Action} className="gh-form" encType="multipart/form-data">
                              <input type="hidden" name="requirementId" value={r.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
                              {r.elementId ? <input type="hidden" name="elementId" value={r.elementId} /> : null}
                              <div className="gh-wide"><DropZone name="file" required label="Drop the new document here" /></div>
                              <label className="gh-field">Title<input name="title" maxLength={240} /></label>
                              <label className="gh-field">Type<select name="evidenceType" defaultValue="other">{Object.entries(EVIDENCE_TYPE_LABEL).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}</select></label>
                              <label className="gh-field">Valid until / next review<input type="date" name="validUntil" /></label>
                              <div><button className="ui-button ui-button-primary" type="submit">Upload and submit</button></div>
                            </form>
                          </div>
                        </details>
                      ) : null}
                      <form action={setRequirementActiveAction}><input type="hidden" name="requirementId" value={r.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="active" value="false" /><input type="hidden" name="returnTo" value={here} /><button className="ui-button" type="submit">Remove from checklist</button></form>
                    </div>
                  ) : canWrite && !r.isActive ? <form action={setRequirementActiveAction}><input type="hidden" name="requirementId" value={r.id} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="active" value="true" /><input type="hidden" name="returnTo" value={here} /><button className="ui-button" type="submit">Restore to checklist</button></form> : null}
                </li>
              );
            })}
          </ul>
        )}
        {canWrite ? (
          <div style={{ marginTop: ".7rem" }}><Details title="Add expected evidence">
            <form action={createRequirementAction} className="gh-form">
              <input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
              <label className="gh-field">For<select name="target" defaultValue={`standard:${standardId}`}><option value={`standard:${standardId}`}>The whole standard ({standardCode})</option>{elements.map((e) => <option key={e.id} value={`element:${e.id}`}>{standardCode} / {e.code}</option>)}</select></label>
              <label className="gh-field">Evidence type<select name="category" defaultValue="audit_report">{Object.entries(REQUIREMENT_CATEGORY_LABEL).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}</select></label>
              <label className="gh-field">Required?<select name="isRequired" defaultValue="required"><option value="required">Required</option><option value="optional">Optional</option></select></label>
              <label className="gh-field">Responsible department<input name="department" maxLength={160} /></label>
              <label className="gh-field">Responsible person<select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
              <label className="gh-field">Due date<input type="date" name="dueDate" /></label>
              <label className="gh-field gh-wide">Description<input name="description" maxLength={1000} placeholder="e.g. Quarterly hand hygiene audit report signed by the IPC lead" /></label>
              <div><button className="ui-button ui-button-primary" type="submit">Add to checklist</button></div>
            </form>
          </Details></div>
        ) : null}
      </section>

      {/* ---- Files: versions, preview, links ---- */}
      <section className="gh-card" aria-labelledby="files-heading">
        <h2 id="files-heading" className="gh-section-title">Documents, versions and links</h2>
        <p className="gh-sub">One stored file can support several standards and elements. A new version keeps the old one in the history; links carry over.</p>
        {allEvidence.length === 0 ? <Empty title="No documents yet">Attach evidence above, or link a file already in the vault.</Empty> : (
          <ul className="gh-actions">
            {allEvidence.filter((e) => !e.withdrawnAt).map((item) => {
              const life = evidenceLifecycle(item, superseded, today);
              const versions = versionHistory(item, vault.length ? vault : allEvidence);
              const linkedHere = links.filter((l) => l.evidenceId === item.id);
              const url = urls.get(item.id);
              return (
                <li key={item.id} className="gh-item">
                  <div className="gh-btnrow" style={{ justifyContent: "space-between" }}>
                    <h4>{item.title}</h4>
                    <span className="gh-btnrow">{item.standardId !== standardId ? <Badge tone="info">Linked from another standard</Badge> : null}<Badge tone={LIFE_TONE[life]}>{life === "current" ? (item.validUntil ? `Valid to ${formatDate(item.validUntil)}` : "Current") : life[0].toUpperCase() + life.slice(1)}</Badge>{versions.length ? <Badge tone="muted">v{versions.length + 1}</Badge> : null}</span>
                  </div>
                  <span className="gh-meta">{EVIDENCE_TYPE_LABEL[item.evidenceType]} · {item.fileName} · added {formatDate(item.uploadedAt)} by {nameOf(peopleById, item.uploadedBy)}{linkedHere.length ? ` · linked to ${linkedHere.map((l) => (l.elementId ? elementLabel.get(l.elementId) : standardCode)).join(", ")}` : ""}</span>
                  <div className="gh-btnrow">
                    {url ? <a className="ui-button" href={url} target="_blank" rel="noopener noreferrer">Open</a> : null}
                    {url && previewable(item.fileName) ? (
                      <details className="gh-noprint" style={{ flexBasis: "100%" }}><summary className="ui-button" style={{ cursor: "pointer", width: "fit-content" }}>Preview</summary>
                        {/\.pdf$/i.test(item.fileName) ? <iframe src={url} title={`Preview of ${item.title}`} style={{ width: "100%", height: 420, border: "1px solid var(--mx-line)", borderRadius: 10, marginTop: ".4rem" }} />
                          : <img src={url} alt={`Preview of ${item.title}`} style={{ maxWidth: "100%", maxHeight: 420, marginTop: ".4rem", borderRadius: 10 }} />}
                      </details>
                    ) : null}
                    {canWrite && life !== "superseded" ? (
                      <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>New version…</summary>
                        <form action={uploadEvidenceVersionAction} className="gh-form" encType="multipart/form-data" style={{ marginTop: ".5rem", minWidth: "min(80vw, 420px)" }}>
                          <input type="hidden" name="evidenceId" value={item.id} /><input type="hidden" name="returnTo" value={here} />
                          <div className="gh-wide"><DropZone name="file" required label="Drop the new version here" /></div>
                          <label className="gh-field">Valid from<input type="date" name="validFrom" /></label>
                          <label className="gh-field">Valid until<input type="date" name="validUntil" /></label>
                          <div><button className="ui-button ui-button-primary" type="submit">Save new version</button></div>
                        </form>
                      </details>
                    ) : null}
                    {canWrite ? linkedHere.map((l) => (
                      <details key={l.id} className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Unlink from {l.elementId ? elementLabel.get(l.elementId) : standardCode}…</summary>
                        <form action={unlinkEvidenceAction} className="gh-btnrow" style={{ marginTop: ".4rem" }}>
                          <input type="hidden" name="linkId" value={l.id} /><input type="hidden" name="returnTo" value={here} />
                          <input name="reason" required maxLength={500} placeholder="Reason" aria-label="Reason for unlinking" className="gh-inline-input" />
                          <button className="ui-button ui-button-danger" type="submit">Unlink</button>
                        </form>
                      </details>
                    )) : null}
                  </div>
                  {versions.length > 0 ? <details><summary className="gh-meta" style={{ cursor: "pointer" }}>Version history ({versions.length} earlier)</summary><ul className="gh-tl" style={{ marginTop: ".4rem" }}>{versions.map((v) => <li key={v.id}><span>{v.title} · {v.fileName} · {formatDate(v.uploadedAt)} · {nameOf(peopleById, v.uploadedBy)}</span></li>)}</ul></details> : null}
                </li>
              );
            })}
          </ul>
        )}
        {canWrite && linkable.length > 0 ? (
          <div style={{ marginTop: ".7rem" }}><Details title="Link a file that is already in the vault">
            <form action={linkEvidenceAction} className="gh-form">
              <input type="hidden" name="returnTo" value={here} />
              <label className="gh-field gh-wide">File<select name="evidenceId" required defaultValue=""><option value="" disabled>Choose…</option>{linkable.map((e) => <option key={e.id} value={e.id}>{e.title} · {e.fileName}</option>)}</select></label>
              <label className="gh-field">Link to<select name="target" defaultValue={`standard:${standardId}`}><option value={`standard:${standardId}`}>This standard ({standardCode})</option>{elements.map((e) => <option key={e.id} value={`element:${e.id}`}>{standardCode} / {e.code}</option>)}</select></label>
              <div><button className="ui-button" type="submit">Link without copying</button></div>
            </form>
          </Details></div>
        ) : null}
      </section>

      {govLinks && catalogue ? (
        <LinkPanel title="Linked actions, audits, indicators and guidelines" sourceType="standard" sourceId={standardId} links={govLinks} catalogue={catalogue}
          allow={["capa", "audit", "qip", "indicator", "guideline", "policy", "decision"]} canWrite={canWrite} returnTo={here}
          hint="Corrective actions, audit records, quality indicators and clinical guidelines that relate to this standard. Audits scheduled with this standard's code are listed on the audits page." />
      ) : null}
      {elements.length > 0 && govLinks && catalogue ? (
        <Details title="Links for individual measurable elements">
          {elements.map((el) => <LinkPanel key={el.id} title={`${standardCode} / ${el.code}`} sourceType="element" sourceId={el.id} links={govLinks} catalogue={catalogue} allow={["capa", "audit", "qip", "indicator", "guideline", "policy"]} canWrite={canWrite} returnTo={here} />)}
        </Details>
      ) : null}
      <p className="gh-meta"><Link href="/dashboard/accreditation-and-audits/standards/evidence">Open the evidence vault</Link> to search every document across standards.</p>
    </>
  );
}

function ReviewButton({ submissionId, to, label, primary, standardId, here }: { submissionId: string; to: "under_review" | "verified"; label: string; primary?: boolean; standardId: string; here: string }) {
  return (
    <form action={reviewSubmissionAction}>
      <input type="hidden" name="submissionId" value={submissionId} /><input type="hidden" name="status" value={to} /><input type="hidden" name="standardId" value={standardId} /><input type="hidden" name="returnTo" value={here} />
      <button className={`ui-button${primary ? " ui-button-primary" : ""}`} type="submit">{label}</button>
    </form>
  );
}
