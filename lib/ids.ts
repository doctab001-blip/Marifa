/**
 * Record ID check for server actions.
 *
 * Accepts any RFC 9562 UUID (versions 1–8, RFC variant), matching Postgres `uuid`
 * columns and Zod's `z.uuid()`. Topic IDs are not all random v4 values: regional
 * topics (for example the India module) use deterministic UUIDv5 IDs.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
