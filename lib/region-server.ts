import "server-only";

import { cookies } from "next/headers";
import type { CountryCode } from "@/types/clinical";
import { DEFAULT_REGION, REGION_COOKIE, resolveRegion } from "@/lib/region";

/** The platform for this request: the deployment's fixed region, else (local dev) the remembered cookie, else Saudi. */
export async function currentRequestRegion(): Promise<CountryCode> {
  try {
    return resolveRegion(undefined, (await cookies()).get(REGION_COOKIE)?.value);
  } catch {
    return DEFAULT_REGION;
  }
}
