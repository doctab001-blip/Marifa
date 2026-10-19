import { redirect } from "next/navigation";
import { getProtocolCounts } from "@/lib/data/disease-drafts";
import { PROTOCOLS_DRAFTS, PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";

/** Opens on Published once any protocol is live; until then the work is in Drafts. */
export default async function LocalProtocolsIndexPage() {
  const counts = await getProtocolCounts();
  redirect(counts.published > 0 ? PROTOCOLS_PUBLISHED : PROTOCOLS_DRAFTS);
}
