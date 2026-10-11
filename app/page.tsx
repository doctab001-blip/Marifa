import { redirect } from "next/navigation";
import { getCurrentViewer } from "@/lib/supabase/session";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";

export default async function Home() {
  if (isTemporaryOpenAdminMode()) redirect("/dashboard/diseases/drafts");
  redirect((await getCurrentViewer()) ? "/dashboard" : "/login");
}
