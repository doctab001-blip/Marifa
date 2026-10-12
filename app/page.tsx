import { redirect } from "next/navigation";

// The root URL always lands on the main dashboard. Unauthenticated visitors are
// sent on to /login by proxy.ts, so no draft or sub-route is ever the default entry.
export default function Home() {
  redirect("/dashboard");
}
