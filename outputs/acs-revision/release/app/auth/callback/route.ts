import { NextResponse, type NextRequest } from "next/server";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/utils/supabase/server";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const siteUrl = getAuthSiteUrl();
  if (!siteUrl) return NextResponse.json({ error: "Authentication callback is not configured." }, { status: 503 });

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", siteUrl));

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=oauth", siteUrl));

    return NextResponse.redirect(new URL(getSafeNext(request.nextUrl.searchParams.get("next")), siteUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth", siteUrl));
  }
}
