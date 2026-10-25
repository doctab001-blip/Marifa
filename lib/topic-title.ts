/**
 * Display form of a topic title. Marifa India and Marifa Saudi are separate platforms, so the "(India)" tag
 * that marks an India topic in the database is redundant on screen and is hidden everywhere a title is shown.
 * Stored titles are not changed: lib/region-topics.ts still uses the tag to keep India topics off Marifa Saudi.
 */
export function displayTopicTitle(title: string): string {
  return title.replace(/\s*\((?:India|Indian)\)/gi, "").replace(/\s{2,}/g, " ").trim();
}
