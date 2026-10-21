import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGovernanceActor } from "@/lib/governance/auth";
import { friendlyMessage, GovernanceInputError } from "@/lib/governance/errors";
import { assertCanWrite, assertMember, checkUpload, safeFileName, type GovActor } from "@/lib/governance/policy";
import { openContext, type Ctx } from "@/lib/governance/repository";

/**
 * Shared helpers for the V2.1 server actions. Same contract as the original actions.ts: the actor always comes from the
 * server session, inputs are validated here for clear messages, and the database guards remain the real enforcement.
 */

export const BASE = "/dashboard/accreditation-and-audits";
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function safeReturn(raw: FormDataEntryValue | null, fallback = BASE): string {
  const value = typeof raw === "string" ? raw : "";
  if (!(value === BASE || value.startsWith(`${BASE}/`))) return fallback;
  // Keep a single ?view=/&meeting= style selector so the user lands back on the record they were working on.
  const [path, query = ""] = value.split("?");
  const keep = new URLSearchParams();
  const params = new URLSearchParams(query);
  for (const key of ["view", "meeting", "tab", "status"]) {
    const v = params.get(key);
    if (v && /^[\w-]{1,60}$/.test(v)) keep.set(key, v);
  }
  const s = keep.toString();
  return s ? `${path}?${s}` : path;
}

function withParam(path: string, key: "done" | "error", message: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message.slice(0, 400))}`;
}

export async function perform(formData: FormData, level: "member" | "writer", work: (ctx: Ctx, actor: GovActor) => Promise<string>, fallback = BASE): Promise<never> {
  const returnTo = safeReturn(formData.get("returnTo"), fallback);
  let target: string;
  try {
    const actor = await getGovernanceActor();
    if (level === "writer") assertCanWrite(actor); else assertMember(actor);
    const ctx = await openContext(actor);
    const message = await work(ctx, actor);
    revalidatePath(BASE, "layout");
    target = withParam(returnTo, "done", message);
  } catch (error) {
    target = withParam(returnTo, "error", friendlyMessage(error));
  }
  redirect(target);
}

export function text(fd: FormData, name: string, label: string, opts: { max?: number; required?: boolean } = {}): string {
  const value = String(fd.get(name) ?? "").trim();
  if (opts.required && !value) throw new GovernanceInputError(`${label} is required.`);
  if (opts.max && value.length > opts.max) throw new GovernanceInputError(`${label} must be ${opts.max} characters or fewer.`);
  return value;
}
export function id(fd: FormData, name: string, label: string): string {
  const value = String(fd.get(name) ?? "");
  if (!UUID.test(value)) throw new GovernanceInputError(`${label} is missing or invalid.`);
  return value;
}
export function optId(fd: FormData, name: string, label: string): string | null {
  const value = String(fd.get(name) ?? "");
  if (!value) return null;
  if (!UUID.test(value)) throw new GovernanceInputError(`${label} is invalid.`);
  return value;
}
export function date(fd: FormData, name: string, label: string, required = false): string | null {
  const value = String(fd.get(name) ?? "").trim();
  if (!value) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  if (!DATE.test(value) || Number.isNaN(Date.parse(value))) throw new GovernanceInputError(`${label} is not a valid date.`);
  return value;
}
export function dateTime(fd: FormData, name: string, label: string, required = false): string | null {
  const value = String(fd.get(name) ?? "").trim();
  if (!value) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  // <input type="datetime-local"> sends no zone. Times are shown in Riyadh time (formatStamp), so read them the same way.
  const zoned = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value) ? `${value}${value.length === 16 ? ":00" : ""}+03:00` : value;
  const parsed = Date.parse(zoned);
  if (Number.isNaN(parsed)) throw new GovernanceInputError(`${label} is not a valid date and time.`);
  return new Date(parsed).toISOString();
}

/** ISO timestamp -> value for <input type="datetime-local">, in Riyadh time (UTC+3, no daylight saving). */
export function toRiyadhInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t + 3 * 3_600_000).toISOString().slice(0, 16);
}
export function oneOf<T extends string>(fd: FormData, name: string, label: string, allowed: readonly T[]): T {
  const value = String(fd.get(name) ?? "");
  if (!(allowed as readonly string[]).includes(value)) throw new GovernanceInputError(`${label} is not valid.`);
  return value as T;
}
export function optOneOf<T extends string>(fd: FormData, name: string, label: string, allowed: readonly T[]): T | null {
  const value = String(fd.get(name) ?? "");
  if (!value) return null;
  return oneOf(fd, name, label, allowed);
}
export function int(fd: FormData, name: string, label: string, min: number, max: number, required = true): number | null {
  const raw = String(fd.get(name) ?? "").trim();
  if (!raw) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new GovernanceInputError(`${label} must be a whole number from ${min} to ${max}.`);
  return value;
}
export function decimal(fd: FormData, name: string, label: string, min: number, max: number, required = false): number | null {
  const raw = String(fd.get(name) ?? "").trim();
  if (!raw) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) throw new GovernanceInputError(`${label} must be a number from ${min} to ${max}.`);
  return value;
}
export function fileOf(fd: FormData, name: string): File | null {
  const value = fd.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function store(ctx: Ctx, area: "evidence" | "policies" | "incidents" | "committees", file: File, subfolder?: string) {
  const problem = checkUpload(file);
  if (problem) throw new GovernanceInputError(problem);
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const sha256 = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const path = [ctx.actor.organizationId, area, subfolder, `${crypto.randomUUID()}-${safeFileName(file.name)}`].filter(Boolean).join("/");
  const { error } = await ctx.client.storage.from("governance-files").upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { path, fileName: file.name.slice(0, 200), mime: file.type, size: file.size, sha256 };
}

export function check<T>(result: { data?: T; error: { message: string } | null }): T | undefined {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/** "type:uuid" from a link picker. */
export function typedRef(fd: FormData, name: string, allowed: readonly string[]): { type: string; id: string } {
  const raw = String(fd.get(name) ?? "");
  const [type, refId] = raw.split(":");
  if (!allowed.includes(type) || !UUID.test(refId ?? "")) throw new GovernanceInputError("Choose what to link to.");
  return { type, id: refId };
}
