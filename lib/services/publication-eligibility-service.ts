import {
  getCurrentContentRevision,
  getGrantedConsentForRevision,
  getNewsletterItemsWithContent,
} from '@/lib/db/queries';
import { ContentItem, DoNotFeature } from '@/lib/types';
import {
  checkDoNotFeature,
  describeDoNotFeatureMatches,
  doNotFeatureSubjectFromContentItem,
  DoNotFeatureMatch,
  loadEnabledDoNotFeatures,
} from './do-not-feature-service';

export interface PublicationEligibility {
  eligible: boolean;
  consentRequired: boolean;
  currentRevisionApproved: boolean;
  doNotFeatureMatches: DoNotFeatureMatch[];
  reasons: string[];
}

export async function evaluateContentPublicationEligibility(
  item: ContentItem,
  doNotFeatureEntries?: DoNotFeature[]
): Promise<PublicationEligibility> {
  const consentRequired = Boolean(
    item.contactId || item.type === 'STORY' || item.type === 'WIN'
  );

  // do_not_feature overrides consent: a match blocks even an approved revision.
  const doNotFeature = await checkDoNotFeature(
    doNotFeatureSubjectFromContentItem(item),
    doNotFeatureEntries
  );
  if (doNotFeature.blocked) {
    return {
      eligible: false,
      consentRequired,
      currentRevisionApproved: false,
      doNotFeatureMatches: doNotFeature.matches,
      reasons: [
        `Blocked by do_not_feature list: ${describeDoNotFeatureMatches(doNotFeature.matches)}.`,
      ],
    };
  }

  const revision = item.currentRevisionId
    ? await getCurrentContentRevision(item.id)
    : await getCurrentContentRevision(item.id);

  if (!revision) {
    return {
      eligible: false,
      consentRequired,
      currentRevisionApproved: false,
      doNotFeatureMatches: [],
      reasons: ['Current revision is missing.'],
    };
  }

  if (!consentRequired) {
    return {
      eligible: true,
      consentRequired: false,
      currentRevisionApproved: true,
      doNotFeatureMatches: [],
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
    doNotFeatureMatches: [],
    reasons: currentRevisionApproved
      ? ['Current revision has stakeholder consent.']
      : ['Current revision requires approved stakeholder consent.'],
  };
}

export async function evaluateNewsletterPublicationEligibility(newsletterId: string) {
  const [rows, doNotFeatureEntries] = await Promise.all([
    getNewsletterItemsWithContent(newsletterId),
    loadEnabledDoNotFeatures(),
  ]);
  const itemResults = await Promise.all(
    rows.map(async (row) => ({
      item: row.item,
      eligibility: await evaluateContentPublicationEligibility(row.item, doNotFeatureEntries),
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
