import { UsersRound } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function StaffDirectoryPage() {
  return (
    <ModulePlaceholder
      title="Staff Directory"
      purpose="A planned directory of clinical and operational roles within each organization."
      plannedWork="This module will provide an organization-scoped view of staff, specialties, departments and responsibilities, subject to role-based access."
      icon={UsersRound}
    />
  );
}
