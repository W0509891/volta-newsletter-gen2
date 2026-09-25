import {
  getFounderSubmissionById,
  getFounderSubmissions,
  updateFounderSubmissionStatus,
} from '@/lib/db/queries';
import { createContentItemFromIntake } from './content-service';
import { ContentItemType } from '@/lib/types';
import { auditAgentAction } from './audit-service';
import { checkDoNotFeature, formatDoNotFeatureError } from './do-not-feature-service';

function mapSubmissionTypeToContentType(type: string): ContentItemType {
  if (type === 'EVENTS') return 'EVENT';
  if (type === 'WINS') return 'WIN';
  if (type === 'OPPORTUNITIES') return 'OPPORTUNITY';
  if (type === 'COMMUNITY') return 'COMMUNITY';
  return 'STORY';
}

export async function listFounderSubmissions(filters?: { status?: string }) {
  return getFounderSubmissions(filters);
}

export async function getFounderSubmission(id: string) {
  return getFounderSubmissionById(id);
}

export async function promoteFounderSubmission(id: string) {
  const submission = await getFounderSubmissionById(id);
  if (!submission) {
    return { success: false as const, error: 'Submission not found' };
  }

  const doNotFeature = await checkDoNotFeature({
    contactOrganization: submission.companyName,
    contactName: [submission.contactName, submission.founderName],
    title: submission.title,
    summary: [submission.summary, submission.notes],
    body: submission.body,
    url: submission.sourceUrls,
  });
  if (doNotFeature.blocked) {
    return {
      success: false as const,
      error: formatDoNotFeatureError(doNotFeature.matches),
      doNotFeatureMatches: doNotFeature.matches,
    };
  }

  const item = await createContentItemFromIntake({
    title: submission.title || submission.companyName || 'Founder submission',
    type: mapSubmissionTypeToContentType(submission.type),
    summary: submission.summary || submission.notes || '',
    body: submission.body || '',
    url: submission.sourceUrls[0],
    status: 'DRAFT',
    contactEmail: submission.contactEmail || undefined,
    contactName: submission.contactName || submission.founderName || undefined,
    contactOrganization: submission.companyName || undefined,
  });

  await updateFounderSubmissionStatus(id, 'PROMOTED', item.id);
  await auditAgentAction({
    actor: 'VOLTA_MCP',
    action: 'submission.promote',
    subjectType: 'founder_submission',
    subjectId: id,
    metadata: { contentItemId: item.id },
  });
  return { success: true as const, item };
}

export async function rejectFounderSubmission(id: string) {
  const submission = await updateFounderSubmissionStatus(id, 'REJECTED');
  if (!submission) {
    return { success: false as const, error: 'Submission not found' };
  }
  await auditAgentAction({
    actor: 'VOLTA_MCP',
    action: 'submission.reject',
    subjectType: 'founder_submission',
    subjectId: id,
  });
  return { success: true as const, submission };
}
