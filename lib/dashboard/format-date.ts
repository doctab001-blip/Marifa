const format = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" });

export function formatManagedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format.format(date);
}
