"use server";

import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/lib/auth/schemas";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/utils/supabase/server";

export type AuthActionResult = { error?: string; message?: string };

function readCredentials(formData: FormData) {
  return {
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(readCredentials(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your sign-in details." };
  if (!isSupabaseConfigured()) return { error: "Sign-in is temporarily unavailable. Contact your administrator." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: "We couldn’t sign you in. Check your email and password, then try again." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your registration details." };
  if (!isSupabaseConfigured()) return { error: "Registration is temporarily unavailable. Contact your administrator." };

  const siteUrl = getAuthSiteUrl();
  if (!siteUrl) return { error: "Registration is not configured for this site yet. Contact your administrator." };

  let result;
  try {
    const supabase = await createClient();
    result = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: new URL("/auth/callback?next=/dashboard", siteUrl).toString(),
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          display_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        },
      },
    });
  } catch {
    return { error: "Registration is temporarily unavailable. Please try again shortly." };
  }

  if (result.error) return { error: "We couldn’t create your account with those details. Check the information or contact your administrator." };
  if (result.data.session) redirect("/dashboard");
  return { message: "Your account request was received. Check your email to confirm your address before signing in." };
}

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured()) redirect("/login?error=auth_config");
  const siteUrl = getAuthSiteUrl();
  if (!siteUrl) redirect("/login?error=auth_config");

  let oauthUrl: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/auth/callback?next=/dashboard", siteUrl).toString() },
    });
    if (!error) oauthUrl = data.url;
  } catch {
    oauthUrl = null;
  }

  if (oauthUrl) redirect(oauthUrl);
  redirect("/login?error=oauth");
}
