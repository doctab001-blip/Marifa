import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, ShieldAlert } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { BookmarkButton } from "@/components/bookmark-button";
import { PathwayRenderer } from "@/components/pathway-renderer";
import { PrintButton } from "@/components/print-button";
import { diseases } from "@/lib/demo-data";
import { validatePathway } from "@/lib/pathway-validation";
import { getDiseaseTopic } from "@/lib/data/diseases";

export function generateStaticParams() { return diseases.map(({ slug }) => ({ slug })); }

export default async function DiseasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const disease = await getDiseaseTopic(slug);
  if (!disease) notFound();
  const validation = validatePathway(disease.pathway);
  return <main className="page"><DemoBanner />
    <Link href="/diseases" className="section-link" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 16 }}><ArrowLeft size={14} /> Back to directory</Link>
    <div className="page-header"><div><div className="eyebrow">{disease.specialty}</div><div className="detail-title-row"><h1 className="page-title">{disease.name}</h1><span className="status status-demo">Demo only</span><span className="status status-draft">{disease.source.status}</span></div><div className="arabic-title" lang="ar">{disease.arabicName}</div><p className="page-copy" style={{ marginTop: 9 }}>{disease.summary}</p></div><div className="detail-actions"><BookmarkButton topicId={disease.id} /><a className="button-secondary" href="#quick-pathway"><FileText size={15} />Quick pathway</a><PrintButton /></div></div>
    <section className="card source-panel" style={{ marginBottom: 18 }}><div className="section-head"><h3>Source & approval record</h3><span className={`status ${validation.valid ? "status-good" : "status-warn"}`}>{validation.valid ? "Graph validated" : "Validation issue"}</span></div><dl className="source-grid"><div><dt>Source title</dt><dd>{disease.source.title}</dd></div><div><dt>Issuing organization</dt><dd>{disease.source.issuingOrganization}</dd></div><div><dt>Version</dt><dd>{disease.source.version}</dd></div><div><dt>Approval status</dt><dd>{disease.source.status} · illustrative local adaptation</dd></div><div><dt>Last verified</dt><dd>{disease.source.lastVerifiedDate}</dd></div><div><dt>Review date</dt><dd>{disease.source.reviewDate}</dd></div><div><dt>Jurisdiction</dt><dd>{disease.source.jurisdiction}</dd></div><div><dt>Original source</dt><dd>{disease.source.url ? <a href={disease.source.url} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a> : "No external source connected"}</dd></div></dl></section>
    <div className="clinical-grid"><div className="grid">{disease.sections.map((section) => <section className={`card content-section ${section.tone ?? ""}`} key={section.title}><h2>{section.title}</h2><p>{section.content}</p></section>)}</div><aside className="grid" style={{ alignContent: "start" }}><section className="card section-card"><div className="section-head"><h2>At a glance</h2><ShieldAlert size={18} color="#b42318" /></div><p className="page-copy" style={{ fontSize: ".74rem" }}>No medication doses, thresholds, timings or diagnostic criteria are provided in this illustrative record. Use your hospital&apos;s approved clinical systems.</p></section><section className="card section-card"><div className="section-head"><h2>Related information</h2></div><div className="topic-row"><div className="topic-main"><strong>Hospital pathway</strong><p>Not connected</p></div></div><div className="topic-row"><div className="topic-main"><strong>Medication references</strong><p>Not connected</p></div></div><div className="topic-row"><div className="topic-main"><strong>Linked competency</strong><p>Acute deterioration recognition — demo</p></div></div></section></aside></div>
    <div style={{ marginTop: 18 }}><PathwayRenderer pathway={disease.pathway} /></div>
  </main>;
}
