/** The one place the hub reads the clock, so pages stay easy to reason about and tests can pass their own date to the pure functions. */
export function currentDate(): Date {
  return new Date();
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const STAMP_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Riyadh" });
const MONTH_FORMAT = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Calendar date (YYYY-MM-DD) shown as written, with no timezone shift. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const parsed = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed) ? "—" : DATE_FORMAT.format(parsed);
}

/** Timestamp shown in Riyadh time. */
export function formatStamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? "—" : `${STAMP_FORMAT.format(parsed)} (KSA)`;
}

export function formatMonth(iso: string): string {
  return MONTH_FORMAT.format(Date.parse(`${iso.slice(0, 7)}-01T00:00:00Z`));
}

export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined) return "";
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}
