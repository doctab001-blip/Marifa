import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const content = JSON.parse(fs.readFileSync("data/reviews/acs-blueprint-revision-2026-10-15.json", "utf8"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Missing Supabase environment");
const db = createClient(url, key, { auth: { persistSession: false } });

const { data: current, error: currentError } = await db
  .from("guideline_versions")
  .select("id,source_title,issuing_organization,source_url,jurisdiction,review_date,created_by,status,is_current")
  .eq("guideline_id", content.id)
  .eq("is_current", true)
  .single();
if (currentError) throw currentError;
if (current.status !== "published") throw new Error(`Current topic is ${current.status}, not published`);

const { data: existing, error: existingError } = await db
  .from("guideline_versions").select("id,status,is_current")
  .eq("guideline_id", content.id).eq("version", content.version).maybeSingle();
if (existingError) throw existingError;

let versionId = existing?.id as string | undefined;
if (!versionId) {
  const row = {
    id: randomUUID(), guideline_id: content.id, version: content.version,
    version_number: content.version, status: "under_review", is_current: false,
    content: { ...content, status: "under_review", clinicalReviewStatus: "pending" },
    source_title: current.source_title, issuing_organization: current.issuing_organization,
    source_url: current.source_url, jurisdiction: current.jurisdiction,
    last_verified_date: "2026-10-15", review_date: current.review_date,
    created_by: current.created_by, approved_by: null, approved_at: null, published_at: null,
    change_summary: "Admin-approved replacement of the published Acute Chest Pain topic from the user-supplied blueprint on 15 Oct 2026; prior version preserved."
  };
  const { error } = await db.from("guideline_versions").insert(row);
  if (error) throw error;
  versionId = row.id;
}

const { data: admins, error: adminError } = await db
  .from("organization_memberships")
  .select("user_id,membership_roles!inner(roles!inner(code))")
  .eq("account_status", "active")
  .eq("membership_roles.roles.code", "platform_admin").limit(1);
if (adminError) throw adminError;
const actorId = admins?.[0]?.user_id;
if (!actorId) throw new Error("No active platform_admin actor found for Admin approval");

const { data: approvedId, error: approvalError } = await db.rpc("approve_clinical_guideline_version_as_temporary_admin", {
  p_guideline_id: content.id, p_version_id: versionId, p_actor_id: actorId,
});
if (approvalError) throw approvalError;
console.log(JSON.stringify({ topicId: content.id, versionId: approvedId, reviewer: "Admin", status: "approved", current: true }));
