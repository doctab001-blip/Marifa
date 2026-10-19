/**
 * Local Protocols & SOPs reuse the Disease Management storage (clinical_guidelines + guideline_versions)
 * and the same DiseaseDetailSchema, so the editor, paste tool and renderer all work unchanged.
 *
 * A protocol is told apart from a disease topic ONLY by `clinical_guidelines.source_type`. Protocols are
 * owned by the organization (organization_id set, not a shared reference), and have exactly two
 * governance states: draft and published. There is no Approved queue for protocols.
 */
export const LOCAL_PROTOCOL_SOURCE_TYPE = "local-protocol";

export function isLocalProtocolSourceType(value: unknown): boolean {
  return value === LOCAL_PROTOCOL_SOURCE_TYPE;
}

export const PROTOCOLS_HOME = "/dashboard/protocols";
export const PROTOCOLS_DRAFTS = "/dashboard/protocols/drafts";
export const PROTOCOLS_PUBLISHED = "/dashboard/protocols/published";
