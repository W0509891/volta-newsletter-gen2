import {
  getUndeliveredNewsCandidates,
  recordNewsDelivery,
} from '@/lib/db/queries';
import {
  NewsCandidate,
  NewsDeliveryChannel,
  NewsDeliveryType,
} from '@/lib/types';
import { sendDiscordDigest } from './discord';
import { sendSlackDigest } from './slack';

export async function buildNewsDigest(data: {
  channel: NewsDeliveryChannel;
  deliveryType?: NewsDeliveryType;
  limit?: number;
}) {
  const deliveryType = data.deliveryType || 'DIGEST';
  const candidates = await getUndeliveredNewsCandidates({
    channel: data.channel,
    deliveryType,
    limit: data.limit,
  });

  return {
    channel: data.channel,
    deliveryType,
    candidates,
  };
}

async function sendDigestToChannel(
  channel: NewsDeliveryChannel,
  candidates: NewsCandidate[]
) {
  if (channel === 'SLACK') {
    return sendSlackDigest(candidates);
  }
  return sendDiscordDigest(candidates);
}

export async function sendNewsDigest(data: {
  channel: NewsDeliveryChannel;
  deliveryType?: NewsDeliveryType;
  limit?: number;
}) {
  const digest = await buildNewsDigest(data);
  const result = await sendDigestToChannel(digest.channel, digest.candidates);
  if (!result.success) {
    return result;
  }

  const deliveries = [];
  for (const candidate of digest.candidates) {
    deliveries.push(
      await recordNewsDelivery({
        candidateId: candidate.id,
        channel: digest.channel,
        deliveryType: digest.deliveryType,
        deliveryReference: result.reference,
      })
    );
  }

  return {
    success: true as const,
    delivered: deliveries.length,
    reference: result.reference,
  };
}
