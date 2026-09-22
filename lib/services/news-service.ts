import {
  createNewsSource,
  getNewsCandidateById,
  getNewsCandidates,
  getNewsSources,
  updateNewsCandidateStatus,
} from '@/lib/db/queries';
import { aggregateNewsSources } from '@/lib/news/aggregator';
import { NewsCandidateStatus, NewsSourceType } from '@/lib/types';

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
