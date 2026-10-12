import { ShieldCheck } from "@/components/icons-3d";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ClinicalGovernancePage() {
  return (
    <ModulePlaceholder
      title="Clinical Governance"
      purpose="A planned workspace for accountable review, quality oversight and clinical governance activity."
      plannedWork="This module will help authorized teams coordinate governance reviews, record decisions and follow actions through an auditable process."
      icon={ShieldCheck}
    />
  );
}
