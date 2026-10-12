// Dashboard notifications and operations widgets.
// Nothing here is connected to a hospital information system yet: every record is flagged
// `sample` so the interface can label it, and nobody mistakes it for live hospital data.

export type HospitalAlertSeverity = "urgent" | "advisory" | "info";

export type HospitalAlert = {
  id: string;
  severity: HospitalAlertSeverity;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  issuedAt: string;
  sample: boolean;
};

export const hospitalAlerts: HospitalAlert[] = [
  {
    id: "sepsis-protocol-2026-10",
    severity: "urgent",
    title: "Updated Sepsis Protocol — please review",
    detail: "Screening triggers and the first-hour bundle have been revised. Confirm you have read the update before your next shift.",
    href: "/dashboard/diseases?q=sepsis",
    actionLabel: "Review protocol",
    issuedAt: "2026-10-12T07:30:00+03:00",
    sample: true,
  },
  {
    id: "vte-audit-2026-q4",
    severity: "advisory",
    title: "VTE risk assessment audit opens 20 October",
    detail: "Ward leads will sample admissions from the past 30 days.",
    href: "/dashboard/accreditation-and-audits",
    actionLabel: "Audit calendar",
    issuedAt: "2026-10-11T09:00:00+03:00",
    sample: true,
  },
  {
    id: "formulary-insulin-2026-10",
    severity: "info",
    title: "Formulary update: insulin pen devices",
    detail: "Two pen devices change supplier from November; prescribing names are unchanged.",
    href: "/dashboard/medicines-formulary",
    actionLabel: "Formulary",
    issuedAt: "2026-10-09T12:00:00+03:00",
    sample: true,
  },
];

export type OperationsSnapshot = {
  sample: true;
  asOf: string;
  bedOccupancy: { occupied: number; total: number; byArea: Array<{ area: string; occupied: number; total: number }> };
  edWait: { targetMinutes: number; currentMedianMinutes: number; byHour: Array<{ hour: string; minutes: number }> };
  protocolCompliance: Array<{ protocol: string; percent: number; target: number }>;
};

export const operationsSnapshot: OperationsSnapshot = {
  sample: true,
  asOf: "2026-10-12T13:00:00+03:00",
  bedOccupancy: {
    occupied: 412,
    total: 468,
    byArea: [
      { area: "Medical wards", occupied: 188, total: 200 },
      { area: "Surgical wards", occupied: 121, total: 140 },
      { area: "Critical care", occupied: 37, total: 40 },
      { area: "Maternity", occupied: 66, total: 88 },
    ],
  },
  edWait: {
    targetMinutes: 240,
    currentMedianMinutes: 196,
    byHour: [
      { hour: "06", minutes: 118 },
      { hour: "08", minutes: 142 },
      { hour: "10", minutes: 188 },
      { hour: "12", minutes: 231 },
      { hour: "14", minutes: 256 },
      { hour: "16", minutes: 224 },
      { hour: "18", minutes: 205 },
      { hour: "20", minutes: 172 },
    ],
  },
  protocolCompliance: [
    { protocol: "Sepsis 1-hour bundle", percent: 82, target: 90 },
    { protocol: "VTE risk assessment", percent: 94, target: 95 },
    { protocol: "Hand hygiene", percent: 97, target: 95 },
    { protocol: "Early warning score escalation", percent: 88, target: 90 },
  ],
};
