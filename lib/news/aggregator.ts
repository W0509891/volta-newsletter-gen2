import {
  getNewsSources,
  updateNewsSourceCheckResult,
  upsertNewsCandidate,
} from '@/lib/db/queries';
import { RssNewsSourceAdapter } from './adapters/rss';
import { UnsupportedNewsSourceAdapter } from './adapters/unsupported';
import { normalizeNewsItem } from './normalize';
import { classifyNewsRelevance } from './relevance';
import { NewsSourceAdapter } from './types';

const adapters: NewsSourceAdapter[] = [
  new RssNewsSourceAdapter(),
  new UnsupportedNewsSourceAdapter(),
];

export async function aggregateNewsSources() {
  const sources = await getNewsSources({ enabled: true });
  const results: Array<{
    sourceId: string;
    sourceName: string;
    fetched: number;
    created: number;
    error?: string;
  }> = [];

  for (const source of sources) {
    const adapter = adapters.find((candidate) => candidate.supports(source));
    if (!adapter) {
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        fetched: 0,
        created: 0,
        error: 'No adapter found.',
      });
      continue;
    }

    try {
      const discovered = await adapter.fetch(source);
      let created = 0;
      for (const item of discovered) {
        const normalized = normalizeNewsItem(source, item);
        const relevance = classifyNewsRelevance(normalized);
        const result = await upsertNewsCandidate({
          sourceId: source.id,
          canonicalUrl: normalized.canonicalUrl,
          originalUrl: normalized.originalUrl,
          author: normalized.author,
          title: normalized.title,
          rawExcerpt: normalized.excerpt,
          rawContent: normalized.content,
          publishedAt: normalized.publishedAt,
          contentHash: normalized.contentHash,
          sourceOwnership: normalized.sourceOwnership,
          ...relevance,
        });
        if (result.created) created += 1;
      }
      await updateNewsSourceCheckResult(source.id, { success: true });
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        fetched: discovered.length,
        created,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown source error.';
      await updateNewsSourceCheckResult(source.id, { success: false, error: message });
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        fetched: 0,
        created: 0,
        error: message,
      });
    }
  }

  return { sourcesChecked: results.length, results };
}
