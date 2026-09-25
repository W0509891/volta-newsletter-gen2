import crypto from 'crypto';
import {
  createConsentRequest,
  getConsentRequestByTokenHash,
  getContentItemById,
  getContentRevisionById,
  getCurrentContentRevision,
  recordConsent,
  respondToConsentRequest,
} from '@/lib/db/queries';
import {
  ConsentMethod,
  ConsentRequest,
  ConsentStatus,
  ContentItem,
  ContentRevision,
} from '@/lib/types';

export async function recordContentConsent(data: {
  contentItemId: string;
  contactId: string;
  status: ConsentStatus;
  method: ConsentMethod;
  evidence?: string;
  notes?: string;
}) {
  return recordConsent({
    contentItemId: data.contentItemId,
    contactId: data.contactId,
    status: data.status,
    method: data.method,
    evidence: data.evidence || null,
    notes: data.notes || null,
  });
}

function hashConsentToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createPreviewConsentRequest(data: {
  contentItemId: string;
  contactId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  baseUrl: string;
  expiresInDays?: number;
}): Promise<{ request: ConsentRequest; approvalUrl: string }> {
  const revision = await getCurrentContentRevision(data.contentItemId);
  if (!revision) {
    throw new Error('Content revision not found');
  }

  //MAKES TOKEN INTO B64
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(
    Date.now() + (data.expiresInDays || 14) * 24 * 60 * 60 * 1000
  ).toISOString();

  const request = await createConsentRequest({
    contentItemId: data.contentItemId,
    revisionId: revision.id,
    contactId: data.contactId,
    recipientName: data.recipientName,
    recipientEmail: data.recipientEmail,
    tokenHash: hashConsentToken(token),
    expiresAt,
  });

  return {
    request,
    approvalUrl: `${data.baseUrl.replace(/\/$/, '')}/consent/${token}`,
  };
}

export async function getConsentPreviewByToken(token: string): Promise<{
  request: ConsentRequest;
  item: ContentItem;
  revision: ContentRevision;
  isPending: boolean;
} | null> {
  const request = await getConsentRequestByTokenHash(hashConsentToken(token));
  if (!request) return null;

  const [item, revision] = await Promise.all([
    getContentItemById(request.contentItemId),
    getContentRevisionById(request.revisionId),
  ]);
  if (!item || !revision) return null;

  return {
    request,
    item,
    revision,
    isPending:
      request.status === 'PENDING' &&
      new Date(request.expiresAt).getTime() >= Date.now(),
  };
}

export async function submitConsentPreviewResponse(data: {
  token: string;
  response: 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED';
  notes?: string | null;
}) {
  const preview = await getConsentPreviewByToken(data.token);
  if (!preview) {
    return { success: false as const, error: 'Consent request not found.' };
  }

  const { request, item, revision } = preview;
  if (request.status !== 'PENDING') {
    return { success: true as const, status: request.status };
  }

  if (new Date(request.expiresAt).getTime() < Date.now()) {
    await respondToConsentRequest({
      requestId: request.id,
      status: 'EXPIRED',
      responseNotes: 'Expired before response.',
    });
    return { success: false as const, error: 'Consent request has expired.' };
  }

  const updatedRequest = await respondToConsentRequest({
    requestId: request.id,
    status: data.response,
    responseNotes: data.notes,
  });

  if (data.response === 'APPROVED') {
    if (!request.contactId) {
      return {
        success: false as const,
        error: 'Consent request is missing a linked contact.',
      };
    }

    await recordConsent({
      contentItemId: item.id,
      contactId: request.contactId,
      revisionId: revision.id,
      consentRequestId: request.id,
      contentHash: revision.contentHash,
      status: 'GRANTED',
      method: 'PREVIEW_LINK',
      evidence: `Approved exact revision ${revision.revisionNumber} via preview link.`,
      notes: data.notes || null,
    });
  }

  return {
    success: true as const,
    status: updatedRequest?.status || data.response,
  };
}
