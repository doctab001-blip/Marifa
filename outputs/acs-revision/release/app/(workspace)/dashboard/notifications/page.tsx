import { Bell } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function NotificationsPage() {
  return (
    <ModulePlaceholder
      title="Notifications"
      purpose="A planned inbox for timely updates and actions relevant to each user."
      plannedWork="This module will collect assigned reviews, competency reminders and organization updates with clear status and source context."
      icon={Bell}
    />
  );
}
