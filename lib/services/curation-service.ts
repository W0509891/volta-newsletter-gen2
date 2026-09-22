import {
  getFounderSubmissionById,
  getFounderSubmissions,
  updateFounderSubmissionStatus,
} from '@/lib/db/queries';
import { createContentItemFromIntake } from './content-service';
import { ContentItemType } from '@/lib/types';

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
  return { success: true as const, item };
}

export async function rejectFounderSubmission(id: string) {
  const submission = await updateFounderSubmissionStatus(id, 'REJECTED');
  if (!submission) {
    return { success: false as const, error: 'Submission not found' };
  }
  return { success: true as const, submission };
}
