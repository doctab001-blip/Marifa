import { DemoBanner } from "@/components/demo-banner";
import { GuidelineWorkflow } from "@/components/guideline-workflow";

export default function ClinicalLibraryPage() {
  return <main className="page"><DemoBanner /><div className="page-header"><div><div className="eyebrow">Controlled content lifecycle</div><h1 className="page-title">Clinical Guidelines</h1><p className="page-copy">Create new versions, preserve review decisions and publish only through authorized approval stages.</p></div><button className="button-primary">Create draft</button></div><GuidelineWorkflow /></main>;
}
