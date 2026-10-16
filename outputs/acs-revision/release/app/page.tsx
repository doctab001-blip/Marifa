import { redirect } from "next/navigation";
import { getCurrentViewer } from "@/lib/supabase/session";

export default async function Home() {
  redirect((await getCurrentViewer()) ? "/dashboard" : "/login");
}
