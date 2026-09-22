import { createFounderSubmission } from '@/lib/db/queries';
import {
  FounderSubmissionEvent,
  FounderSubmissionType,
} from '@/lib/types';

const MAX_TITLE_LENGTH = 180;
const MAX_SUMMARY_LENGTH = 600;
const MAX_BODY_LENGTH = 6000;
const MAX_NOTES_LENGTH = 1000;
const MAX_URLS = 10;

export interface FounderSubmissionInput {
  type: FounderSubmissionType;
  title?: string;
  summary?: string;
  body?: string;
  companyName?: string;
  founderName?: string;
  contactName?: string;
  contactEmail?: string;
  sourceUrls?: string[];
  mediaUrls?: string[];
  event?: FounderSubmissionEvent;
  notes?: string;
}

export interface FounderSubmissionReceipt {
  submissionId: string;
  receivedAt: string;
  status: 'RECEIVED';
}

function cleanText(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function cleanUrlList(urls: string[] | undefined) {
  return (urls || [])
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, MAX_URLS);
}

export async function submitFounderContent(
  input: FounderSubmissionInput
): Promise<FounderSubmissionReceipt> {
  const submission = await createFounderSubmission({
    type: input.type,
    title: cleanText(input.title, MAX_TITLE_LENGTH),
    summary: cleanText(input.summary, MAX_SUMMARY_LENGTH),
    body: cleanText(input.body, MAX_BODY_LENGTH),
    companyName: cleanText(input.companyName, MAX_TITLE_LENGTH),
    founderName: cleanText(input.founderName, MAX_TITLE_LENGTH),
    contactName: cleanText(input.contactName, MAX_TITLE_LENGTH),
    contactEmail: cleanText(input.contactEmail, MAX_TITLE_LENGTH)?.toLowerCase(),
    sourceUrls: cleanUrlList(input.sourceUrls),
    mediaUrls: cleanUrlList(input.mediaUrls),
    event: input.event,
    notes: cleanText(input.notes, MAX_NOTES_LENGTH),
  });

  return {
    submissionId: submission.id,
    receivedAt: submission.createdAt,
    status: 'RECEIVED',
  };
}
