import { NewsCandidate } from '@/lib/types';

export function buildDiscordDigestPayload(candidates: NewsCandidate[]) {
  return {
    content:
      candidates.length === 0
        ? 'No new Volta ecosystem news candidates for this digest.'
        : `Volta ecosystem news digest (${candidates.length} candidate${candidates.length === 1 ? '' : 's'})`,
    embeds: candidates.slice(0, 10).map((candidate) => ({
      title: candidate.title,
      url: candidate.canonicalUrl,
      description: candidate.aiSummary || candidate.rawExcerpt || candidate.aiRelevanceReason || '',
    })),
  };
}

export async function sendDiscordDigest(candidates: NewsCandidate[]) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false as const, error: 'DISCORD_WEBHOOK_URL is not configured.' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildDiscordDigestPayload(candidates)),
  });

  if (!response.ok) {
    return {
      success: false as const,
      error: `Discord webhook failed with ${response.status}.`,
    };
  }

  return { success: true as const, reference: `discord:${response.status}` };
}
