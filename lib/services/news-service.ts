import {
  createNewsSource,
  getNewsCandidateById,
  getNewsCandidates,
  getNewsSources,
  updateNewsCandidateStatus,
} from '@/lib/db/queries';
import { aggregateNewsSources } from '@/lib/news/aggregator';
import { NewsCandidateStatus, NewsSourceType } from '@/lib/types';
import { createContentItemFromIntake } from './content-service';

export async function addNewsSource(data: {
  name: string;
  type: NewsSourceType;
  url: string;
  enabled?: boolean;
  pollingIntervalMinutes?: number;
  priority?: number;
}) {
  return createNewsSource(data);
}

export async function listNewsSources(filters?: { enabled?: boolean }) {
  return getNewsSources(filters);
}

export async function checkNewsSourcesNow() {
  return aggregateNewsSources();
}

export async function searchNewsCandidates(filters?: {
  status?: NewsCandidateStatus;
  search?: string;
}) {
  return getNewsCandidates(filters);
}

export async function getNewsCandidate(id: string) {
  return getNewsCandidateById(id);
}

export async function saveNewsCandidate(id: string) {
  return updateNewsCandidateStatus(id, 'SAVED');
}

export async function dismissNewsCandidate(id: string) {
  return updateNewsCandidateStatus(id, 'DISMISSED');
}

export async function promoteNewsCandidate(id: string) {
  const candidate = await getNewsCandidateById(id);
  if (!candidate) {
    return { success: false as const, error: 'News candidate not found' };
  }

  const item = await createContentItemFromIntake({
    title: candidate.title,
    type: 'STORY',
    summary: candidate.aiSummary || candidate.rawExcerpt || '',
    body: candidate.rawContent || candidate.rawExcerpt || '',
    url: candidate.canonicalUrl,
    status: 'DRAFT',
  });

  await updateNewsCandidateStatus(id, 'PROMOTED', item.id);
  return { success: true as const, item };
}
