import { Activity, BookOpenCheck, Building2, FileCheck2, BookOpen, Landmark, Megaphone, Pill, Settings, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";

const modules = [
  { title: "Hospital Protocols", copy: "Private, versioned protocols with document ownership and review dates.", icon: FileCheck2, state: "Foundation ready" },
  { title: "Medicines & Formulary", copy: "Structured references, local formulary status and source metadata without invented doses.", icon: Pill, state: "Schema designed" },
  { title: "Learning Centre", copy: "Courses, learning pathways, assessments and completion tracking.", icon: BookOpen, state: "Competency-linked" },
  { title: "Policies & SOPs", copy: "Governed policies, acknowledgements, private files and scheduled review.", icon: BookOpenCheck, state: "Foundation ready" },
  { title: "Clinical Governance", copy: "Audit registers, actions, risks, committees and quality-improvement evidence.", icon: ShieldCheck, state: "Schema designed" },
  { title: "Accreditation & Audits", copy: "Configurable, sourced standards and evidence-gap reporting.", icon: Landmark, state: "Schema designed" },
  { title: "Staff Directory", copy: "Permission-aware departments, professional roles and escalation contacts.", icon: UsersRound, state: "Schema designed" },
  { title: "Credentials & Onboarding", copy: "Verification states, expiries, induction and privilege records.", icon: UserRoundCheck, state: "Schema designed" },
  { title: "Hospital News", copy: "Tenant announcements with publication and expiry dates.", icon: Megaphone, state: "Dashboard preview" },
  { title: "Governance Reports", copy: "Department compliance, evidence gaps and overdue actions.", icon: Activity, state: "Planned next" },
  { title: "Organization Settings", copy: "Branding, departments, roles and tenant configuration.", icon: Building2, state: "Schema designed" },
  { title: "Platform Administration", copy: "Organizations, configuration and future billing foundation.", icon: Settings, state: "Planned next" }
];

export default function ModulesPage() {
  return <main className="page"><DemoBanner /><div className="page-header"><div><div className="eyebrow">Hospital platform</div><h1 className="page-title">Connected governance modules</h1><p className="page-copy">The first release foundation keeps clinical knowledge, competency and governance records connected without implying unfinished modules are operational.</p></div></div><div className="module-grid">{modules.map(({ title, copy, icon: Icon, state }) => <article className="card module-card" key={title}><div className="module-icon"><Icon size={19} /></div><h2>{title}</h2><p>{copy}</p><footer>{state}</footer></article>)}</div></main>;
}
