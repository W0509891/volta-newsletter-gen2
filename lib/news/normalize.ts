import crypto from 'crypto';
import { DiscoveredNewsItem, NormalizedNewsItem } from './types';
import { NewsSource } from '@/lib/types';

function canonicalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (key.toLowerCase().startsWith('utm_')) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function hashNews(item: DiscoveredNewsItem) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        title: item.title.trim().toLowerCase(),
        url: canonicalizeUrl(item.originalUrl),
        excerpt: item.excerpt || '',
      })
    )
    .digest('hex');
}

export function normalizeNewsItem(
  source: NewsSource,
  item: DiscoveredNewsItem
): NormalizedNewsItem {
  const canonicalUrl = canonicalizeUrl(item.originalUrl);
  const sourceOwnership = source.url.includes('voltaeffect.com') ? 'VOLTA' : 'UNKNOWN';

  return {
    ...item,
    title: item.title.trim(),
    originalUrl: item.originalUrl.trim(),
    canonicalUrl,
    contentHash: hashNews(item),
    sourceOwnership,
  };
}
