import {
  attachItemToNewsletter,
  createContentItem,
  detachItemFromNewsletter,
  findOrCreateContact,
  updateContentItem,
} from '@/lib/db/queries';
import {
  ContentItemStatus,
  ContentItemType,
  NewsletterSection,
} from '@/lib/types';

export interface TransitionContentItemStatusInput {
  id: string;
  status: ContentItemStatus;
  rejectionReason?: string;
  revisitAt?: string;
}

export async function transitionContentItemStatus({
  id,
  status,
  rejectionReason,
  revisitAt,
}: TransitionContentItemStatusInput) {
  return updateContentItem(id, {
    status,
    rejectionReason: rejectionReason || null,
    revisitAt: revisitAt || null,
  });
}

export async function batchTransitionContentItems(
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

  return { count: ids.length };
}

export async function saveContentItemDetails(
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
  return updateContentItem(id, {
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
}

export async function createContentItemFromIntake(data: {
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
  let contactId: string | null = null;
  if (data.contactEmail && data.contactEmail.trim()) {
    const contact = await findOrCreateContact(
      data.contactEmail.trim(),
      data.contactName?.trim() || null,
      data.contactOrganization?.trim() || null
    );
    contactId = contact.id;
  }

  return createContentItem({
    title: data.title,
    type: data.type,
    summary: data.summary,
    body: data.body,
    url: data.url || null,
    status: data.status || 'INBOX',
    contactId,
  });
}

export async function attachContentItemToNewsletter(
  newsletterId: string,
  contentItemId: string,
  section: NewsletterSection,
  position: number = 0
) {
  await attachItemToNewsletter(newsletterId, contentItemId, section, position);
}

export async function detachContentItemFromNewsletter(
  newsletterId: string,
  contentItemId: string
) {
  await detachItemFromNewsletter(newsletterId, contentItemId);
}
