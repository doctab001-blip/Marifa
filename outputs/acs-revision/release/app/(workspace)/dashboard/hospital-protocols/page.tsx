import { FileCheck2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function HospitalProtocolsPage() {
  return (
    <ModulePlaceholder
      title="Hospital Protocols"
      purpose="A governed home for hospital-owned protocols, operational pathways and approved local guidance."
      plannedWork="This module will organize locally approved protocols with named owners, version history, review dates and clear approval status."
      icon={FileCheck2}
    />
  );
}
