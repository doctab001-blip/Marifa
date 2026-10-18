import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/recent-developments/service-client";
import { runScan } from "@/lib/recent-developments/scan";

// Called by Vercel Cron (vercel.json): Mondays 03:00 UTC = 06:00 Riyadh.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const summary = await runScan(createServiceClient());
    revalidatePath("/dashboard/recent-developments");
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("[recent-developments] scan failed", error);
    return NextResponse.json({ ok: false, error: "Scan failed." }, { status: 500 });
  }
}
