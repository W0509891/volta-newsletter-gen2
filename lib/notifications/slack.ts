import { NewsCandidate } from '@/lib/types';

export function buildSlackDigestPayload(candidates: NewsCandidate[]) {
  const text =
    candidates.length === 0
      ? 'No new Volta ecosystem news candidates for this digest.'
      : `Volta ecosystem news digest (${candidates.length} candidate${candidates.length === 1 ? '' : 's'})`;

  return {
    text,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
      ...candidates.slice(0, 10).map((candidate) => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${candidate.title}*\n${candidate.aiSummary || candidate.rawExcerpt || candidate.canonicalUrl}\n<${candidate.canonicalUrl}|Open source>`,
        },
      })),
    ],
  };
}

export async function sendSlackDigest(candidates: NewsCandidate[]) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false as const, error: 'SLACK_WEBHOOK_URL is not configured.' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSlackDigestPayload(candidates)),
  });

  if (!response.ok) {
    return {
      success: false as const,
      error: `Slack webhook failed with ${response.status}.`,
    };
  }

  return { success: true as const, reference: `slack:${response.status}` };
}
