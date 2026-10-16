import { Award } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function MyCertificatesPage() {
  return (
    <ModulePlaceholder
      title="My Certificates"
      purpose="A planned personal record of verified professional certificates and renewal dates."
      plannedWork="This module will bring together certificate details, verification status and renewal reminders linked to relevant competency requirements."
      icon={Award}
    />
  );
}
