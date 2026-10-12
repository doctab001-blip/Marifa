import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from "@/components/icons-3d";

export type TopicLink = { id: string; title: string };

export function TopicLibraryHeader({ pillar, topics, currentId, backHref = "/dashboard/diseases", backLabel = "Disease Management" }: {
  pillar: string;
  topics: TopicLink[];
  currentId: string;
  backHref?: string;
  backLabel?: string;
}) {
  const index = topics.findIndex((topic) => topic.id === currentId);
  const current = index >= 0 ? topics[index] : undefined;
  return (
    <header className="topic-library-header">
      <Link href={backHref} className="topic-back-pill"><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />{backLabel}</Link>
      <p className="topic-library-title">{pillar} topic library</p>
      <span className="topic-library-rule" aria-hidden="true" />
      {topics.length > 0 ? <p className="topic-library-count">{topics.length} {topics.length === 1 ? "topic" : "topics"} in this care pillar</p> : null}
      {current ? (
        <details className="topic-switcher">
          <summary>
            <span><span className="topic-switcher-position">Topic {index + 1} of {topics.length}</span><strong>{current.title}</strong></span>
            <span className="topic-switcher-action">All topics <ChevronDown size={18} aria-hidden="true" /></span>
          </summary>
          <ol className="topic-switcher-list">
            {topics.map((topic, position) => (
              <li key={topic.id}>
                <Link href={`/dashboard/diseases/${topic.id}`} aria-current={topic.id === currentId ? "page" : undefined}>
                  <span>{position + 1}</span>{topic.title}
                </Link>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </header>
  );
}

export function TopicPager({ topics, currentId }: { topics: TopicLink[]; currentId: string }) {
  const index = topics.findIndex((topic) => topic.id === currentId);
  if (index < 0 || topics.length < 2) return null;
  const previous = index > 0 ? topics[index - 1] : undefined;
  const next = index < topics.length - 1 ? topics[index + 1] : undefined;
  return (
    <nav className="topic-pager" aria-label="Topic navigation">
      {previous ? <Link href={`/dashboard/diseases/${previous.id}`} className="topic-pager-link"><ChevronLeft size={18} aria-hidden="true" /><span><small>Previous</small>{previous.title}</span></Link> : <span />}
      {next ? <Link href={`/dashboard/diseases/${next.id}`} className="topic-pager-link is-next"><span><small>Next</small>{next.title}</span><ChevronRight size={18} aria-hidden="true" /></Link> : <span />}
    </nav>
  );
}
