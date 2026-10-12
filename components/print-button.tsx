"use client";

import { Printer } from "@/components/icons-3d";

export function PrintButton() {
  return <button className="button-secondary" onClick={() => window.print()} aria-label="Print pathway"><Printer size={15} />Print</button>;
}
