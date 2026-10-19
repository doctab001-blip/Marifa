"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { createServiceClient } from "@/lib/recent-developments/service-client";
import { summariseMissing } from "@/lib/recent-developments/summarise";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function setStatus(formData: FormData, status: "published" | "hidden", allowedFrom: string[]) {
  const id = String(formData.get("id") ?? "");
  if (!uuid.test(id)) return;
  const admin = await requireOrganizationAdmin();
  await createServiceClient()
    .from("recent_developments")
    .update({ status, reviewed_by: admin.userId, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", allowedFrom);
  revalidatePath("/dashboard/recent-developments");
}

/** Publishes a journal item that was waiting for review. */
export async function approveDevelopment(formData: FormData) {
  await setStatus(formData, "published", ["pending_review", "hidden"]);
}

/** Takes an item down (pending or already published). It is kept, not deleted, so a re-scan never brings it back. */
export async function hideDevelopment(formData: FormData) {
  await setStatus(formData, "hidden", ["pending_review", "published"]);
}

/** Administrator button: writes summaries for up to 8 journal items that do not have one yet. */
export async function summariseNow() {
  await requireOrganizationAdmin();
  await summariseMissing(createServiceClient(), { limit: 8, deadline: Date.now() + 50_000 });
  revalidatePath("/dashboard/recent-developments");
}
