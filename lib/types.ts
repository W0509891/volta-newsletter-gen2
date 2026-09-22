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

export type ConsentMethod = 'EMAIL' | 'VERBAL' | 'FORM' | 'RECORDING';

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

export interface ConsentRecord {
  id: string;
  contentItemId: string;
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
  createdAt: string;
  updatedAt: string;
}
