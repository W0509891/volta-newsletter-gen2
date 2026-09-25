'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import {
  attachContentItemToNewsletter,
  batchTransitionContentItems,
  createContentItemFromIntake,
  detachContentItemFromNewsletter,
  saveContentItemDetails,
  transitionContentItemStatus,
} from '@/lib/services/content-service';
import { recordContentConsent } from '@/lib/services/consent-service';
import {
  createPreviewConsentRequest,
  submitConsentPreviewResponse,
} from '@/lib/services/consent-service';
import {
  ContentItemStatus,
  ContentItemType,
  ConsentStatus,
  ConsentMethod,
  NewsletterSection,
} from '@/lib/types';

export async function transitionItemStatusAction(
  id: string,
  newStatus: ContentItemStatus,
  options?: {
    rejectionReason?: string;
    revisitAt?: string;
  }
) {
  await requireAdmin();
  await transitionContentItemStatus({
    id,
    status: newStatus,
    rejectionReason: options?.rejectionReason,
    revisitAt: options?.revisitAt,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/backlog');
  revalidatePath(`/admin/items/${id}`);
  return { success: true };
}

export async function batchUpdateItemsAction(
  ids: string[],
  action: 'APPROVE' | 'BACKLOG' | 'REJECT' | 'ARCHIVE',
  options?: {
    revisitAt?: string;
    rejectionReason?: string;
  }
) {
  await requireAdmin();
  const result = await batchTransitionContentItems(ids, action, options);

  revalidatePath('/admin');
  revalidatePath('/admin/backlog');
  return { success: true, count: result.count };
}

export async function saveItemDetailsAction(
  id: string,
  data: {
    title: string;
    type: ContentItemType;
    summary: string;
    body: string;
    url?: string;
    featured?: boolean;
    contactId?: string | null;
    eventId?: string | null;
    revisitAt?: string | null;
  }
) {
  await requireAdmin();
  await saveContentItemDetails(id, data);

  revalidatePath('/admin');
  revalidatePath('/admin/backlog');
  revalidatePath(`/admin/items/${id}`);
  return { success: true };
}

export async function createNewItemAction(data: {
  title: string;
  type: ContentItemType;
  summary: string;
  body: string;
  url?: string;
  status?: ContentItemStatus;
  contactEmail?: string;
  contactName?: string;
  contactOrganization?: string;
}) {
  const item = await createContentItemFromIntake(data);

  revalidatePath('/admin');
  return { success: true, item };
}

export async function recordConsentAction(data: {
  contentItemId: string;
  contactId: string;
  status: ConsentStatus;
  method: ConsentMethod;
  evidence?: string;
  notes?: string;
}) {
  await recordContentConsent(data);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${data.contentItemId}`);
  return { success: true };
}

export async function createConsentRequestAction(data: {
  contentItemId: string;
  contactId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
}) {
  await requireAdmin();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';
  const result = await createPreviewConsentRequest({
    contentItemId: data.contentItemId,
    contactId: data.contactId,
    recipientName: data.recipientName,
    recipientEmail: data.recipientEmail,
    baseUrl,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${data.contentItemId}`);
  return { success: true as const, approvalUrl: result.approvalUrl };
}

export async function submitConsentPreviewResponseAction(data: {
  token: string;
  response: 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED';
  notes?: string | null;
}) {
  return submitConsentPreviewResponse(data);
}

export async function attachItemToNewsletterAction(
  newsletterId: string,
  contentItemId: string,
  section: NewsletterSection,
  position: number = 0
) {
  await requireAdmin();
  const result = await attachContentItemToNewsletter(
    newsletterId,
    contentItemId,
    section,
    position
  );
  if (!result.success) {
    return { success: false as const, error: result.error };
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true as const };
}

export async function detachItemFromNewsletterAction(
  newsletterId: string,
  contentItemId: string
) {
  await requireAdmin();
  await detachContentItemFromNewsletter(newsletterId, contentItemId);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true };
}
