import { XMLParser } from 'fast-xml-parser';
import { NewsSource } from '@/lib/types';
import { DiscoveredNewsItem, NewsSourceAdapter } from '../types';

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '#text' in value) {
    const text = (value as Record<string, unknown>)['#text'];
    return typeof text === 'string' ? text : undefined;
  }
  return undefined;
}

export class RssNewsSourceAdapter implements NewsSourceAdapter {
  supports(source: NewsSource) {
    return source.type === 'RSS';
  }

  async fetch(source: NewsSource): Promise<DiscoveredNewsItem[]> {
    const response = await fetch(source.url, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });
    if (!response.ok) {
      throw new Error(`RSS fetch failed with ${response.status}`);
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
    });
    const parsed = parser.parse(xml) as Record<string, unknown>;
    const rss = parsed.rss as Record<string, unknown> | undefined;
    const channel = rss?.channel as Record<string, unknown> | undefined;
    const rssItems = asArray(channel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
    const feed = parsed.feed as Record<string, unknown> | undefined;
    const atomEntries = asArray(feed?.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);

    const items = rssItems.length > 0 ? rssItems : atomEntries;
    const discovered: DiscoveredNewsItem[] = [];
    for (const item of items) {
        const link = textValue(item.link) || textValue((item.link as Record<string, unknown>)?.href);
        const title = textValue(item.title);
        if (!link || !title) continue;

        discovered.push({
          originalUrl: link,
          title,
          author: textValue(item.author) || null,
          excerpt: textValue(item.description) || textValue(item.summary) || null,
          content: textValue(item['content:encoded']) || textValue(item.content) || null,
          publishedAt:
            textValue(item.pubDate) || textValue(item.published) || textValue(item.updated) || null,
        });
    }
    return discovered;
  }
}
