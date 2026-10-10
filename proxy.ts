import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  if (!isDashboardRoute && !isAuthRoute) return NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return isDashboardRoute
      ? NextResponse.redirect(new URL("/login?error=auth_config", request.url))
      : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  let refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];
  let isAuthenticated = false;

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          refreshedCookies = cookiesToSet;
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && typeof data?.claims?.sub === "string";
  } catch {
    // Fail closed for protected routes if session verification is unavailable.
    isAuthenticated = false;
  }

  if (isDashboardRoute && !isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    refreshedCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  if (isAuthRoute && isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    refreshedCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"]
};
