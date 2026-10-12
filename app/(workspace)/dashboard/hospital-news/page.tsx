import { Megaphone } from "@/components/icons-3d";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function HospitalNewsPage() {
  return (
    <ModulePlaceholder
      title="Hospital News"
      purpose="A planned channel for relevant organization-wide announcements and operational updates."
      plannedWork="This module will provide targeted announcements with publication dates, expiry controls and acknowledgement tracking where required."
      icon={Megaphone}
    />
  );
}
