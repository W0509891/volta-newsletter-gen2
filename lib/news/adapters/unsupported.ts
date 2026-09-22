import { NewsSource } from '@/lib/types';
import { DiscoveredNewsItem, NewsSourceAdapter } from '../types';

export class UnsupportedNewsSourceAdapter implements NewsSourceAdapter {
  supports() {
    return true;
  }

  async fetch(source: NewsSource): Promise<DiscoveredNewsItem[]> {
    if (source.type === 'MANUAL') {
      return [];
    }
    throw new Error(`${source.type} adapter is not configured yet.`);
  }
}
