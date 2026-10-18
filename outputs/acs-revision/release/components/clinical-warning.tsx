import { TriangleAlert } from "lucide-react";

export function ClinicalWarning({ title = "Emergency red flags", items }: { title?: string; items: string[] }) {
  return (
    <section className="clinical-warning" aria-labelledby="clinical-warning-title">
      <div className="clinical-warning-icon" aria-hidden="true">
        <TriangleAlert size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p className="clinical-warning-kicker">Urgent escalation</p>
        <h2 id="clinical-warning-title">{title}</h2>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
