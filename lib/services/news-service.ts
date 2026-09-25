import {
  createNewsSource,
  deleteNewsSource,
  getNewsCandidateById,
  getNewsCandidates,
  getNewsSources,
  updateNewsSourceEnabled as updateNewsSourceEnabledQuery,
  updateNewsCandidateStatus,
} from '@/lib/db/queries';
import { aggregateNewsSources } from '@/lib/news/aggregator';
import { NewsCandidateStatus, NewsSourceType } from '@/lib/types';
import { createContentItemFromIntake } from './content-service';
import { auditAgentAction } from './audit-service';
import { checkDoNotFeature, formatDoNotFeatureError } from './do-not-feature-service';

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

export async function removeNewsSource(id: string) {
  return deleteNewsSource(id);
}

export async function listNewsSources(filters?: { enabled?: boolean }) {
  return getNewsSources(filters);
}

export async function checkNewsSourcesNow() {
  return aggregateNewsSources();
}


export async function updateNewsSourceEnabled(id: string, state: boolean) {
  return updateNewsSourceEnabledQuery(id, state);
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

  const doNotFeature = await checkDoNotFeature({
    title: candidate.title,
    summary: [candidate.aiSummary, candidate.rawExcerpt],
    body: candidate.rawContent,
    url: candidate.canonicalUrl,
  });
  if (doNotFeature.blocked) {
    return {
      success: false as const,
      error: formatDoNotFeatureError(doNotFeature.matches),
      doNotFeatureMatches: doNotFeature.matches,
    };
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
  await auditAgentAction({
    actor: 'VOLTA_MCP',
    action: 'news.promote',
    subjectType: 'news_candidate',
    subjectId: id,
    metadata: { contentItemId: item.id },
  });
  return { success: true as const, item };
}
