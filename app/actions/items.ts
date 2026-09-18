'use server';

import { revalidatePath } from 'next/cache';
import {
  getContentItemById,
  updateContentItem,
  createContentItem,
  recordConsent,
  attachItemToNewsletter,
  detachItemFromNewsletter,
  findOrCreateContact,
} from '@/lib/db/queries';
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
  await updateContentItem(id, {
    status: newStatus,
    rejectionReason: options?.rejectionReason || null,
    revisitAt: options?.revisitAt || null,
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
  for (const id of ids) {
    if (action === 'APPROVE') {
      await updateContentItem(id, { status: 'APPROVED' });
    } else if (action === 'BACKLOG') {
      await updateContentItem(id, {
        status: 'BACKLOG',
        revisitAt: options?.revisitAt || null,
      });
    } else if (action === 'REJECT') {
      await updateContentItem(id, {
        status: 'REJECTED',
        rejectionReason: options?.rejectionReason || null,
      });
    } else if (action === 'ARCHIVE') {
      await updateContentItem(id, { status: 'ARCHIVED' });
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/backlog');
  return { success: true, count: ids.length };
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
  await updateContentItem(id, {
    title: data.title,
    type: data.type,
    summary: data.summary,
    body: data.body,
    url: data.url || null,
    featured: Boolean(data.featured),
    contactId: data.contactId || null,
    eventId: data.eventId || null,
    revisitAt: data.revisitAt || null,
  });

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
}) {
  let contactId: string | null = null;
  if (data.contactEmail && data.contactEmail.trim()) {
    const contact = await findOrCreateContact(
      data.contactEmail.trim(),
      data.contactName?.trim() || null
    );
    contactId = contact.id;
  }

  const item = await createContentItem({
    title: data.title,
    type: data.type,
    summary: data.summary,
    body: data.body,
    url: data.url || null,
    status: data.status || 'INBOX',
    contactId,
  });

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
  await recordConsent({
    contentItemId: data.contentItemId,
    contactId: data.contactId,
    status: data.status,
    method: data.method,
    evidence: data.evidence || null,
    notes: data.notes || null,
  });

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
  await attachItemToNewsletter(newsletterId, contentItemId, section, position);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true };
}

export async function detachItemFromNewsletterAction(
  newsletterId: string,
  contentItemId: string
) {
  await detachItemFromNewsletter(newsletterId, contentItemId);

  revalidatePath('/admin');
  revalidatePath(`/admin/items/${contentItemId}`);
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  return { success: true };
}
