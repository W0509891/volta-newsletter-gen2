export function buildTrackedUrl(baseUrl: string, campaign: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'newsletter');
    url.searchParams.set('utm_medium', 'email');
    url.searchParams.set('utm_campaign', campaign); // e.g. newsletter slug + send date
    return url.toString();
  } catch {
    // If not a full URL or relative, return as is
    return baseUrl;
  }
}
