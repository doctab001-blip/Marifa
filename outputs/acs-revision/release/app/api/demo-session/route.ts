import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.formData();
  const role = data.get("role") === "governance" ? "governance" : "clinician";
  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set("marifa_demo_session", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  });
  return response;
}
