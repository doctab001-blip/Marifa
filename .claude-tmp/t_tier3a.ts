import type { Spec } from "./common.ts";
import { specs as s1 } from "./t3a_1.ts";
import { specs as s2 } from "./t3a_2.ts";
import { specs as s3 } from "./t3a_3.ts";
const METHOD = "Source pages were read through automated page extraction rather than page-by-page in the original documents, so each figure should be spot-checked against the source during clinical review.";
export const specs: Spec[] = [...s1, ...s2, ...s3].map((s) => ({ ...s, unverified: [...s.unverified, METHOD] }));
