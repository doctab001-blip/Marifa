"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrderActor } from "@/lib/clinical-orders/auth";
import { createOrdersRepository } from "@/lib/clinical-orders/repository";
import { applyProtocolOrders, previewProtocolApplication, type ApplyResult, type PreviewResult } from "@/lib/clinical-orders/service";
import { addManualOrder, closeEncounter, createPatient, getEncounterContext, markOrderReviewed, removeOrder, startEncounter, updateOrder } from "@/lib/clinical-orders/workspace";
import { ACTIVE_ENCOUNTER_COOKIE } from "@/lib/clinical-orders/constants";
import { OrderAuthorizationError, OrderWorkflowError, PROTOCOL_SOURCE_MODULES, type DuplicateMatch } from "@/lib/clinical-orders/types";
import { z } from "zod";

/**
 * Server actions for the protocol -> patient order workflow. Both protocol modules call the SAME actions.
 * The acting clinician always comes from the server session (getOrderActor); nothing the browser sends can change who is acting.
 */

export type ActionFailure = { ok: false; code: string; message: string; details?: unknown };
export type ActionResult<T> = { ok: true; data: T } | ActionFailure;

function failure(error: unknown): ActionFailure {
  if (error instanceof OrderAuthorizationError) return { ok: false, code: "not_authorised", message: error.message };
  if (error instanceof OrderWorkflowError) return { ok: false, code: error.code, message: error.message, details: error.code === "duplicates_need_review" ? error.details : undefined };
  console.error("[patient-orders] unexpected failure", error);
  return { ok: false, code: "unknown", message: "Something went wrong. Nothing was changed. Try again." };
}

const previewInput = z.object({ protocolId: z.uuid(), sourceModule: z.enum(PROTOCOL_SOURCE_MODULES) });

async function activeEncounterId() {
  const value = (await cookies()).get(ACTIVE_ENCOUNTER_COOKIE)?.value;
  return value && z.uuid().safeParse(value).success ? value : null;
}

/** Step A + B. With no active encounter the doctor is asked to choose one; nothing is written. */
export async function previewProtocolOrdersAction(input: { protocolId: string; sourceModule: string }): Promise<ActionResult<PreviewResult>> {
  try {
    const parsed = previewInput.safeParse(input);
    if (!parsed.success) return { ok: false, code: "invalid_selection", message: "That protocol could not be identified." };
    const actor = await getOrderActor();
    let encounterId = await activeEncounterId();
    // A stale cookie (closed or foreign encounter) falls back to asking the doctor to choose.
    if (encounterId && !(await getEncounterContext(actor, encounterId).catch(() => null))) encounterId = null;
    return { ok: true, data: await previewProtocolApplication(createOrdersRepository(), actor, { ...parsed.data, encounterId }) };
  } catch (error) {
    return failure(error);
  }
}

export async function selectActiveEncounterAction(encounterId: string): Promise<ActionResult<{ encounterId: string }>> {
  try {
    const actor = await getOrderActor();
    const encounter = await getEncounterContext(actor, encounterId);
    if (!encounter || encounter.status !== "active") return { ok: false, code: "no_encounter", message: "Choose an active encounter." };
    (await cookies()).set(ACTIVE_ENCOUNTER_COOKIE, encounter.encounterId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
    return { ok: true, data: { encounterId: encounter.encounterId } };
  } catch (error) {
    return failure(error);
  }
}

/** Step C + D. The encounter is taken from the request but re-verified against the actor's organisation on the server. */
export async function applyProtocolOrdersAction(request: unknown): Promise<ActionResult<ApplyResult & { patientPath: string }>> {
  try {
    const actor = await getOrderActor();
    const result = await applyProtocolOrders(createOrdersRepository(), actor, request);
    revalidatePath(`/dashboard/patients/${result.encounter.patientId}`);
    return { ok: true, data: { ...result, patientPath: `/dashboard/patients/${result.encounter.patientId}` } };
  } catch (error) {
    return failure(error);
  }
}

export type { DuplicateMatch };

// ---- Patient workspace form actions -----------------------------------------------------------------------------

const back = (patientId: string, query = "") => `/dashboard/patients/${patientId}${query}`;

async function run(patientId: string | null, work: () => Promise<void>, success: string) {
  let outcome = success;
  try {
    await work();
  } catch (error) {
    outcome = `error=${encodeURIComponent(failure(error).message)}`;
  }
  const target = patientId ? back(patientId, `?${outcome.startsWith("error=") ? outcome : `done=${encodeURIComponent(outcome)}`}`) : `/dashboard/patients?${outcome.startsWith("error=") ? outcome : `done=${encodeURIComponent(outcome)}`}`;
  if (patientId) revalidatePath(back(patientId));
  redirect(target);
}

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "");

export async function createPatientAction(formData: FormData) {
  let patientId: string | null = null;
  let message = "Patient created.";
  try {
    patientId = await createPatient(await getOrderActor(), { mrn: field(formData, "mrn"), fullName: field(formData, "fullName"), dateOfBirth: field(formData, "dateOfBirth"), sex: field(formData, "sex") || "unknown" });
  } catch (error) {
    message = failure(error).message;
    redirect(`/dashboard/patients?error=${encodeURIComponent(message)}`);
  }
  redirect(back(patientId!, `?done=${encodeURIComponent(message)}`));
}

export async function startEncounterAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  let encounterId: string | null = null;
  await run(patientId, async () => {
    const actor = await getOrderActor();
    encounterId = await startEncounter(actor, patientId, field(formData, "encounterType"));
    (await cookies()).set(ACTIVE_ENCOUNTER_COOKIE, encounterId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  }, "Encounter started and set as the active encounter.");
}

export async function setActiveEncounterAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  await run(patientId, async () => {
    const result = await selectActiveEncounterAction(field(formData, "encounterId"));
    if (!result.ok) throw new OrderWorkflowError("no_encounter", result.message);
  }, "Active encounter set.");
}

export async function closeEncounterAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  await run(patientId, async () => {
    await closeEncounter(await getOrderActor(), field(formData, "encounterId"));
    const jar = await cookies();
    if (jar.get(ACTIVE_ENCOUNTER_COOKIE)?.value === field(formData, "encounterId")) jar.delete(ACTIVE_ENCOUNTER_COOKIE);
  }, "Encounter closed.");
}

function parametersFrom(formData: FormData) {
  const parameters: Record<string, string> = {};
  for (const key of ["dose", "route", "frequency", "duration"]) {
    const value = field(formData, `param_${key}`);
    if (formData.has(`param_${key}`)) parameters[key] = value;
  }
  return parameters;
}

export async function updateOrderAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  const priority = field(formData, "priority");
  await run(patientId, async () => {
    await updateOrder(await getOrderActor(), field(formData, "orderId"), {
      orderName: field(formData, "orderName"), priority: priority || null, indication: field(formData, "indication"), instructions: field(formData, "instructions"), parameters: parametersFrom(formData),
    });
  }, "Order updated. Any earlier review was withdrawn; it is a draft until you review it again.");
}

export async function reviewOrderAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  await run(patientId, async () => {
    await markOrderReviewed(await getOrderActor(), field(formData, "orderId"), field(formData, "conditionConfirmed") === "on");
  }, "Order marked reviewed. It is not signed or sent anywhere.");
}

export async function removeOrderAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  await run(patientId, async () => {
    await removeOrder(await getOrderActor(), field(formData, "orderId"));
  }, "Order removed.");
}

export async function addManualOrderAction(formData: FormData) {
  const patientId = field(formData, "patientId");
  const priority = field(formData, "priority");
  await run(patientId, async () => {
    await addManualOrder(await getOrderActor(), field(formData, "encounterId"), {
      orderType: field(formData, "orderType"), orderName: field(formData, "orderName"), category: "", priority: priority || null, indication: field(formData, "indication"),
      instructions: field(formData, "instructions"), parameters: parametersFrom(formData), allowDuplicate: field(formData, "allowDuplicate") === "on",
    });
  }, "Draft order added.");
}
