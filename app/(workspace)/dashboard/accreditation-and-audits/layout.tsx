import type { ReactNode } from "react";
import "../../../accreditation-hub.css";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { HubFrame, HubNav } from "@/components/accreditation/hub-nav";

export const metadata = { title: "Governance hub — Marifa" };

export default function AccreditationLayout({ children }: { children: ReactNode }) {
  return (
    <HubFrame>
      {isTemporaryOpenAdminMode() ? <p className="gh-notice gh-notice-bad" role="alert"><strong>Temporary open-admin mode is on.</strong> Everyone who can reach this site acts as a platform administrator. Turn it off before real use.</p> : null}
      <HubNav />
      {children}
    </HubFrame>
  );
}
