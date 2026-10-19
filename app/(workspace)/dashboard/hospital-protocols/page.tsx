import { redirect } from "next/navigation";
import { PROTOCOLS_HOME } from "@/lib/local-protocols";

// Older link for the Local Protocols module.
export default function HospitalProtocolsPage() {
  redirect(PROTOCOLS_HOME);
}
