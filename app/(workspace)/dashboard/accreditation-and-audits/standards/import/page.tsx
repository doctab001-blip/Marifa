import Link from "next/link";
import { Upload } from "lucide-react";
import { ImportWizard, type EditionChoice } from "@/components/accreditation/import-wizard";
import { NeedsV21, PageHeader } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import type { ExistingRegister } from "@/lib/governance/hierarchy";
import { canWriteGovernance } from "@/lib/governance/policy";
import { loadSettings, loadStandards, openContext } from "@/lib/governance/repository";
import { loadEditions, loadElements, v21 } from "@/lib/governance/repository-v21";

const BASE = "/dashboard/accreditation-and-audits";

export default async function ImportPage() {
  const actor = await getGovernanceActor();
  const header = <PageHeader icon={<Upload size={20} />} eyebrow={<><Link href={`${BASE}/standards`}>Standards &amp; evidence</Link> / Import</>} title="Import standards" subtitle="Upload, map, preview, validate, confirm. Existing records and their history are never deleted." />;
  if (!canWriteGovernance(actor)) return <>{header}<p className="gh-notice gh-notice-bad" role="alert">Only governance staff can import standards.</p></>;
  const ctx = await openContext(actor);
  const [standards, settings, editions, elements] = await Promise.all([loadStandards(ctx), loadSettings(ctx), v21(loadEditions(ctx)), v21(loadElements(ctx))]);
  if (editions === null || elements === null) return <>{header}<NeedsV21 what="The import wizard" /><p className="gh-meta">Until then, the original quick import on the <Link href={`${BASE}/standards`}>standards page</Link> still works.</p></>;

  // The current register, per edition, so the browser can show exactly what would be created or updated.
  const codeById = new Map(standards.map((s) => [s.id, s.code]));
  const editionById = new Map(standards.map((s) => [s.id, s.edition]));
  const registers: Record<string, ExistingRegister> = {};
  const reg = (label: string) => (registers[label] ??= { standards: [], elements: [] });
  for (const s of standards) reg(s.edition).standards.push({ id: s.id, code: s.code, description: s.description, chapterCode: s.chapterCode, chapterName: s.chapterName, isEsr: s.isEsr, department: s.department });
  for (const e of elements) {
    const label = editionById.get(e.standardId);
    if (label) reg(label).elements.push({ id: e.id, standardCode: codeById.get(e.standardId) ?? "", code: e.code, description: e.description, officialCode: e.officialCode, isEsr: e.isEsr, department: e.department });
  }
  const choices: EditionChoice[] = editions.map((e) => ({ label: e.label, program: e.program, hospitalType: e.hospitalType, isOfficial: e.isOfficial }));

  return (
    <>
      {header}
      <ImportWizard registers={registers} editions={choices} defaultEdition={settings.editionLabel || choices[0]?.label || ""} />
    </>
  );
}
