export type ContentItemType = 'STORY' | 'EVENT' | 'WIN' | 'OPPORTUNITY' | 'COMMUNITY';

export type ContentItemStatus =
  | 'INBOX'
  | 'DRAFT'
  | 'PENDING_CONSENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'BACKLOG'
  | 'ARCHIVED';

export type NewsletterStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'ARCHIVED';

export type NewsletterSection =
  | 'FEATURED'
  | 'STORIES'
  | 'EVENTS'
  | 'WINS'
  | 'OPPORTUNITIES'
  | 'COMMUNITY';

export type ConsentStatus = 'PENDING' | 'GRANTED' | 'REVOKED' | 'EXPIRED';

export type ConsentMethod = 'EMAIL' | 'VERBAL' | 'FORM' | 'RECORDING' | 'PREVIEW_LINK';
export type ConsentRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'DECLINED'
  | 'REVOKED'
  | 'EXPIRED';

export type FounderSubmissionType =
  | 'FEATURED'
  | 'STORIES'
  | 'EVENTS'
  | 'WINS'
  | 'OPPORTUNITIES'
  | 'COMMUNITY'
  | 'OTHER';

export type FounderSubmissionIdentityStatus = 'UNVERIFIED';
export type FounderSubmissionVia = 'FOUNDER_MCP' | 'PUBLIC_FORM';
export type FounderSubmissionStatus = 'RECEIVED' | 'TRIAGED' | 'PROMOTED' | 'REJECTED';
export type NewsSourceType =
  | 'RSS'
  | 'WEBSITE'
  | 'LINKEDIN_PAGE'
  | 'LINKEDIN_PROFILE'
  | 'MANUAL'
  | 'API';
export type NewsCandidateOwnership = 'VOLTA' | 'THIRD_PARTY' | 'UNKNOWN';
export type NewsCandidateStatus = 'NEW' | 'SURFACED' | 'SAVED' | 'DISMISSED' | 'PROMOTED';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  externalId?: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  email: string;
  name?: string | null;
  organization?: string | null;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  currentRevisionId?: string | null;
  approvedRevisionId?: string | null;
  type: ContentItemType;
  title: string;
  body?: string | null;
  summary?: string | null;
  url?: string | null;
  status: ContentItemStatus;
  featured: boolean;
  itemOrder?: number | null;
  revisitAt?: string | null;
  rejectionReason?: string | null;
  contactId?: string | null;
  eventId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  contactName?: string | null;
  contactEmail?: string | null;
  eventTitle?: string | null;
  consentStatus?: ConsentStatus | null;
  consentId?: string | null;
  consentMethod?: ConsentMethod | null;
  consentEvidence?: string | null;
}

export interface ContentRevision {
  id: string;
  contentItemId: string;
  revisionNumber: number;
  title: string;
  summary?: string | null;
  body?: string | null;
  url?: string | null;
  contentHash: string;
  createdBy: string;
  createdAt: string;
}

export interface ConsentRequest {
  id: string;
  contentItemId: string;
  revisionId: string;
  contactId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  status: ConsentRequestStatus;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  respondedAt?: string | null;
  responseNotes?: string | null;
}

export interface ConsentRecord {
  id: string;
  contentItemId: string;
  revisionId?: string | null;
  consentRequestId?: string | null;
  contentHash?: string | null;
  contactId: string;
  status: ConsentStatus;
  method: ConsentMethod;
  evidence?: string | null;
  notes?: string | null;
  requestedAt: string;
  respondedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  contactEmail?: string | null;
  contactName?: string | null;
}

export interface Newsletter {
  id: string;
  slug: string;
  subject: string;
  previewText?: string | null;
  status: NewsletterStatus;
  scheduledFor?: string | null;
  sentAt?: string | null;
  mailchimpCampaignId?: string | null;
  mailchimpWebId?: string | null;
  mailchimpArchiveUrl?: string | null;
  htmlContent?: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface NewsletterItem {
  newsletterId: string;
  contentItemId: string;
  section: NewsletterSection;
  position: number;
}

export interface TrackedLink {
  id: string;
  newsletterId: string;
  contentItemId: string;
  originalUrl: string;
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  clicks: number;
  createdAt: string;
}

export interface FounderSubmissionEvent {
  name?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  registrationUrl?: string;
}

export interface FounderSubmission {
  id: string;
  type: FounderSubmissionType;
  title?: string | null;
  summary?: string | null;
  body?: string | null;
  companyName?: string | null;
  founderName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  sourceUrls: string[];
  mediaUrls: string[];
  event?: FounderSubmissionEvent | null;
  notes?: string | null;
  identityStatus: FounderSubmissionIdentityStatus;
  submittedVia: FounderSubmissionVia;
  status: FounderSubmissionStatus;
  promotedContentItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsSource {
  id: string;
  name: string;
  type: NewsSourceType;
  url: string;
  entityId?: string | null;
  enabled: boolean;
  pollingIntervalMinutes: number;
  priority: number;
  lastCheckedAt?: string | null;
  lastSuccessAt?: string | null;
  lastErrorAt?: string | null;
  lastError?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsCandidate {
  id: string;
  sourceId?: string | null;
  canonicalUrl: string;
  originalUrl: string;
  author?: string | null;
  title: string;
  rawExcerpt?: string | null;
  rawContent?: string | null;
  publishedAt?: string | null;
  discoveredAt: string;
  contentHash: string;
  aiSummary?: string | null;
  aiRelevanceReason?: string | null;
  aiConfidence?: number | null;
  sourceOwnership: NewsCandidateOwnership;
  status: NewsCandidateStatus;
  firstSurfacedAt?: string | null;
  lastSurfacedAt?: string | null;
  promotedContentItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}
