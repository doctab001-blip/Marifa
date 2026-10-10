export type ContentStatus = "draft" | "under_review" | "approved" | "published" | "superseded" | "archived";

export type SourceType = "hospital_protocol" | "saudi_national" | "international" | "educational";

export type PathwayNode = {
  id: string;
  type: "start" | "assessment" | "decision" | "action" | "escalation" | "end";
  title: string;
  detail: string;
  emphasis?: "standard" | "warning" | "critical";
  referenceIds: string[];
};

export type PathwayTransition = {
  from: string;
  to: string;
  label?: string;
};

export type ClinicalSource = {
  id: string;
  title: string;
  issuingOrganization: string;
  sourceType: SourceType;
  jurisdiction: string;
  publicationDate: string;
  lastVerifiedDate: string;
  reviewDate: string;
  version: string;
  status: ContentStatus;
  localAdaptationStatus: "illustrative" | "adapted" | "not_applicable";
  url?: string;
};

export type DiseaseTopic = {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  abbreviations: string[];
  synonyms: string[];
  symptoms: string[];
  specialty: string;
  summary: string;
  updatedAt: string;
  demoOnly: boolean;
  source: ClinicalSource;
  sections: { title: string; content: string; tone?: "critical" | "warning" | "neutral" }[];
  pathway: {
    title: string;
    nodes: PathwayNode[];
    transitions: PathwayTransition[];
  };
};

export type Competency = {
  id: string;
  title: string;
  category: string;
  status: "completed" | "in_progress" | "pending_signoff" | "overdue";
  progress: number;
  dueDate: string;
  assessmentType: string;
  practicalSignoffRequired: boolean;
};

export type DemoUser = {
  id: string;
  name: string;
  initials: string;
  role: string;
  designation: string;
  isAdmin: boolean;
  primaryColor: string;
  specialty: string;
  organizationId: string;
  organizationName: string;
};
