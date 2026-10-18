import { TriangleAlert } from "lucide-react";

export function DemoBanner() {
  return <div className="demo-banner" role="note"><TriangleAlert size={16} /> DEMO — NOT FOR CLINICAL USE. No record shown here is an approved hospital protocol.</div>;
}
