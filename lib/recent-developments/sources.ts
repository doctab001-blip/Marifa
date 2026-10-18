import type { DevelopmentCategory, FeedEntry } from "./types";

/**
 * Sources scanned each week. Tier A = official regulator / public-health bodies (publish automatically).
 * Tier B = journals (held for administrator approval). Every item URL must be on one of the source's `hosts`.
 * Journal feeds carry only a title and citation, so no summary is ever generated for them.
 */
export type SourceConfig = {
  id: string;
  name: string;
  tier: "A" | "B";
  url: string;
  hosts: string[];
  /** Newest-first cap per run, keeps the review queue and the page readable. */
  maxPerRun: number;
  include?: (entry: FeedEntry) => boolean;
  category: (entry: FeedEntry) => DevelopmentCategory;
};

const test = (pattern: RegExp) => (entry: FeedEntry) => pattern.test(entry.title);

const FDA_INCLUDE = /(FDA (approves|approved|grants|clears|authori[sz]es|issues|warns|announces|requires|requests)|approval of|drug safety|safety communication|shortage|boxed warning|recall|biosimilar|first generic)/i;
const FDA_EXCLUDE = /(\||accelerated approvals|user fee|GDUFA|PDUFA|BsUFA|OTCMUFA|webinar|workshop|conference|public meeting|draft guidance|guidance for industry|request for comment|advisory committee|small business|ANDA|paid facilit|ISO\b|learn more about|upcoming)/i;

export const sources: SourceConfig[] = [
  {
    id: "fda-drugs",
    name: "FDA: Drugs news",
    tier: "A",
    url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml",
    hosts: ["www.fda.gov", "fda.gov"],
    maxPerRun: 20,
    include: (entry) => FDA_INCLUDE.test(entry.title) && !FDA_EXCLUDE.test(entry.title),
    category: (entry) => (/approv|authori[sz]|clears?|cleared|biosimilar|first generic/i.test(entry.title) ? "new_drug_approval" : /safety|warning|alert|recall|shortage|boxed/i.test(entry.title) ? "safety_alert" : "regulatory_decision"),
  },
  {
    id: "fda-medwatch",
    name: "FDA: MedWatch safety",
    tier: "A",
    url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml",
    hosts: ["www.fda.gov", "fda.gov"],
    maxPerRun: 20,
    category: () => "safety_alert",
  },
  {
    id: "ema-news",
    name: "European Medicines Agency",
    tier: "A",
    url: "https://www.ema.europa.eu/en/news.xml",
    hosts: ["www.ema.europa.eu"],
    maxPerRun: 15,
    include: (entry) => !/veterinary|CVMP|animal|dog|cat\b|cattle|poultry/i.test(`${entry.title} ${entry.description.slice(0, 200)}`),
    category: (entry) => (/recommends?.{0,40}(authori[sz]ation|approval)|new medicines|marketing authori[sz]ation|CHMP/i.test(entry.title) ? "new_drug_approval" : /safety|PRAC|suspend|restrict|review of/i.test(entry.title) ? "safety_alert" : "regulatory_decision"),
  },
  {
    id: "who-news",
    name: "World Health Organization",
    tier: "A",
    url: "https://www.who.int/rss-feeds/news-english.xml",
    hosts: ["www.who.int"],
    maxPerRun: 10,
    include: test(/guideline|recommend|outbreak|vaccine|prequalif|alert|emergency|MERS|resistan|certif|essential medicines|new (test|tool|treatment)/i),
    category: (entry) => (/guideline|recommend/i.test(entry.title) ? "guideline_update" : "public_health"),
  },
  {
    id: "nejm",
    name: "New England Journal of Medicine",
    tier: "B",
    url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss",
    hosts: ["www.nejm.org"],
    maxPerRun: 8,
    // NEJMoa = original article (trial / cohort), NEJMsa = special article (often a guideline or consensus).
    include: (entry) => /NEJM(oa|sa)\d/i.test(entry.doi ?? entry.link),
    category: (entry) => (/NEJMsa/i.test(entry.doi ?? entry.link) ? "guideline_update" : "key_trial"),
  },
  {
    id: "lancet",
    name: "The Lancet",
    tier: "B",
    url: "https://www.thelancet.com/rssfeed/lancet_current.xml",
    hosts: ["www.thelancet.com"],
    maxPerRun: 8,
    include: test(/^\[(Articles?|Guidelines?)\]/i),
    category: (entry) => (/^\[Guideline/i.test(entry.title) ? "guideline_update" : "key_trial"),
  },
  {
    id: "bmj",
    name: "The BMJ",
    tier: "B",
    url: "https://www.bmj.com/rss/recent.xml",
    hosts: ["www.bmj.com"],
    maxPerRun: 8,
    include: test(/guideline|rapid recommendation|randomi[sz]ed|\btrial\b|\bapprov|NICE\b/i),
    category: (entry) => (/guideline|recommendation/i.test(entry.title) ? "guideline_update" : /approv/i.test(entry.title) ? "regulatory_decision" : "key_trial"),
  },
  {
    id: "jama",
    name: "JAMA",
    tier: "B",
    url: "https://jamanetwork.com/rss/site_3/67.xml",
    hosts: ["jamanetwork.com"],
    maxPerRun: 8,
    // Many JAMA items carry only the journal name as a title; those say nothing useful, so they are skipped.
    include: (entry) => entry.title.length > 12 && !/podcast|editors.? summary/i.test(entry.title) && /FDA|approv|guideline|recommend|trial|randomi[sz]ed/i.test(entry.title),
    category: (entry) => (/guideline|recommend/i.test(entry.title) ? "guideline_update" : /FDA|approv/i.test(entry.title) ? "new_drug_approval" : "key_trial"),
  },
];

export function getSource(id: string): SourceConfig | undefined {
  return sources.find((source) => source.id === id);
}
