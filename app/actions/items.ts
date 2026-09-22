'use server';

import { revalidatePath } from 'next/cache';
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

export async function attachItemToNewsletterAction(
  newsletterId: string,
  contentItemId: string,
  section: NewsletterSection,
  position: number = 0
) {
  await attachContentItemToNewsletter(newsletterId, contentItemId, section, position);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true };
}

export async function detachItemFromNewsletterAction(
  newsletterId: string,
  contentItemId: string
) {
  await detachContentItemFromNewsletter(newsletterId, contentItemId);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true };
}
