import {
  getCurrentContentRevision,
  getGrantedConsentForRevision,
  getNewsletterItemsWithContent,
} from '@/lib/db/queries';
import { ContentItem } from '@/lib/types';

export interface PublicationEligibility {
  eligible: boolean;
  consentRequired: boolean;
  currentRevisionApproved: boolean;
  reasons: string[];
}

export async function evaluateContentPublicationEligibility(
  item: ContentItem
): Promise<PublicationEligibility> {
  const revision = item.currentRevisionId
    ? await getCurrentContentRevision(item.id)
    : await getCurrentContentRevision(item.id);

  const consentRequired = Boolean(
    item.contactId || item.type === 'STORY' || item.type === 'WIN'
  );

  if (!revision) {
    return {
      eligible: false,
      consentRequired,
      currentRevisionApproved: false,
      reasons: ['Current revision is missing.'],
    };
  }

  if (!consentRequired) {
    return {
      eligible: true,
      consentRequired: false,
      currentRevisionApproved: true,
      reasons: ['Consent is not required for this content type without a stakeholder contact.'],
    };
  }

  const grantedConsent = await getGrantedConsentForRevision(revision.id);
  const currentRevisionApproved = Boolean(
    grantedConsent && grantedConsent.contentHash === revision.contentHash
  );

  return {
    eligible: currentRevisionApproved,
    consentRequired: true,
    currentRevisionApproved,
    reasons: currentRevisionApproved
      ? ['Current revision has stakeholder consent.']
      : ['Current revision requires approved stakeholder consent.'],
  };
}

export async function evaluateNewsletterPublicationEligibility(newsletterId: string) {
  const rows = await getNewsletterItemsWithContent(newsletterId);
  const itemResults = await Promise.all(
    rows.map(async (row) => ({
      item: row.item,
      eligibility: await evaluateContentPublicationEligibility(row.item),
    }))
  );
  const blocked = itemResults.filter((result) => !result.eligibility.eligible);

  return {
    eligible: blocked.length === 0,
    items: itemResults,
    reasons: blocked.flatMap((result) =>
      result.eligibility.reasons.map((reason) => `${result.item.title}: ${reason}`)
    ),
  };
}
