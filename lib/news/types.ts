import { NewsCandidateOwnership, NewsSource } from '@/lib/types';

export interface DiscoveredNewsItem {
  originalUrl: string;
  title: string;
  author?: string | null;
  excerpt?: string | null;
  content?: string | null;
  publishedAt?: string | null;
}

export interface NormalizedNewsItem extends DiscoveredNewsItem {
  canonicalUrl: string;
  contentHash: string;
  sourceOwnership: NewsCandidateOwnership;
}

export interface NewsSourceAdapter {
  supports(source: NewsSource): boolean;
  fetch(source: NewsSource): Promise<DiscoveredNewsItem[]>;
}
