import { BookOpenCheck } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function PoliciesAndSopsPage() {
  return (
    <ModulePlaceholder
      title="Policies and SOPs"
      purpose="A planned library for controlled hospital policies, procedures and operational standards."
      plannedWork="This module will provide searchable policy documents with clear owners, effective dates, revision history and approval controls."
      icon={BookOpenCheck}
    />
  );
}
