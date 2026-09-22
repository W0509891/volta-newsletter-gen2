import { NormalizedNewsItem } from './types';

const VOLTA_TERMS = [
  'volta',
  'startup',
  'founder',
  'funding',
  'seed',
  'venture',
  'innovation',
  'halifax',
  'atlantic canada',
  'accelerator',
  'ai',
];

export function classifyNewsRelevance(item: NormalizedNewsItem) {
  const haystack = `${item.title} ${item.excerpt || ''} ${item.content || ''}`.toLowerCase();
  const matches = VOLTA_TERMS.filter((term) => haystack.includes(term));
  const confidence = Math.min(0.95, Math.max(0.15, matches.length / 6));

  return {
    aiSummary: item.excerpt || item.title,
    aiRelevanceReason:
      matches.length > 0
        ? `Matched ecosystem terms: ${matches.join(', ')}.`
        : 'No explicit ecosystem terms matched; candidate retained for curator review.',
    aiConfidence: Number(confidence.toFixed(2)),
  };
}
