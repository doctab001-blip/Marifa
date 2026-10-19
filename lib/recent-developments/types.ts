export const DEVELOPMENT_CATEGORIES = [
  "new_drug_approval",
  "safety_alert",
  "guideline_update",
  "key_trial",
  "regulatory_decision",
  "public_health",
  // Added by the Medical Progress Archive (migration 20261019100000).
  "vaccine",
  "procedure_gene_cell_therapy",
  "device_diagnostic",
  "risk_score_criteria",
  "definition_classification",
] as const;
export type DevelopmentCategory = (typeof DEVELOPMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<DevelopmentCategory, string> = {
  new_drug_approval: "New drug approval",
  safety_alert: "Safety alert",
  guideline_update: "Guideline update",
  key_trial: "Key trial",
  regulatory_decision: "Regulatory decision",
  public_health: "Public health",
  vaccine: "Vaccine",
  procedure_gene_cell_therapy: "Procedure / gene or cell therapy",
  device_diagnostic: "Device / diagnostic",
  risk_score_criteria: "Risk score / criteria",
  definition_classification: "Definition / classification",
};

export type DevelopmentStatus = "published" | "pending_review" | "hidden";

/** One entry read from a feed, before any Marifa rules are applied. */
export type FeedEntry = {
  title: string;
  link: string;
  description: string;
  publishedAt: Date | null;
  doi: string | null;
};

export type DevelopmentRecord = {
  source_id: string;
  category: DevelopmentCategory;
  title: string;
  excerpt: string | null;
  source_url: string;
  doi: string | null;
  published_at: string;
  specialities: string[];
  saudi_relevant: boolean;
  status: DevelopmentStatus;
};

export type DevelopmentRow = DevelopmentRecord & {
  id: string;
  /** AI-written summary of the free PubMed abstract (journal items only). */
  summary: string | null;
  summary_source: "pubmed_abstract" | "curated" | null;
  free_full_text_url: string | null;
  created_at: string;
  reviewed_at: string | null;
  /** Archive-only fields; absent (undefined) until migration 20261019100000 is applied. */
  year?: number;
  significance?: 1 | 2 | 3;
  why_it_matters?: string | null;
  region?: "global" | "gcc" | "ksa";
  source_label?: string | null;
  origin?: "weekly_scan" | "archive";
};
