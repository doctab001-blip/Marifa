import { GraduationCap } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function LearningCentrePage() {
  return (
    <ModulePlaceholder
      title="Learning Centre"
      purpose="A planned space for role-relevant learning resources and professional development."
      plannedWork="This module will bring together approved learning pathways, learning materials and completion records for each professional group."
      icon={GraduationCap}
    />
  );
}
