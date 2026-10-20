import type { ReactNode } from "react";
import "../../../accreditation-hub.css";
import { HubNav } from "@/components/accreditation/hub-nav";

export const metadata = { title: "Accreditation hub — Marifa" };

export default function AccreditationLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page gh-page">
      <HubNav />
      {children}
    </main>
  );
}
