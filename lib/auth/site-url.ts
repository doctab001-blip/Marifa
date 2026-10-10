export function getAuthSiteUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : null);
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const isLocalHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !isLocalHttp) return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}
