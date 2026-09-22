import { query } from '@/lib/db';
import crypto from 'crypto';
import {
  ContentItem,
  ContentItemStatus,
  ContentItemType,
  ConsentRecord,
  ConsentRequest,
  ConsentRequestStatus,
  ConsentStatus,
  ConsentMethod,
  Newsletter,
  NewsletterStatus,
  NewsletterSection,
  NewsletterItem,
  TrackedLink,
  Contact,
  ContentRevision,
  Event,
  FounderSubmission,
  FounderSubmissionEvent,
  FounderSubmissionType,
} from '@/lib/types';
import { buildTrackedUrl } from '@/lib/tracked-links';

// Row mappers to camelCase
function mapContentItem(row: any): ContentItem {
  return {
    id: row.id,
    currentRevisionId: row.current_revision_id,
    approvedRevisionId: row.approved_revision_id,
    type: row.type as ContentItemType,
    title: row.title,
    body: row.body,
    summary: row.summary,
    url: row.url,
    status: row.status as ContentItemStatus,
    featured: Boolean(row.featured),
    itemOrder: row.item_order,
    revisitAt: row.revisit_at ? new Date(row.revisit_at).toISOString() : null,
    rejectionReason: row.rejection_reason,
    contactId: row.contact_id,
    eventId: row.event_id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    eventTitle: row.event_title,
    consentStatus: row.consent_status as ConsentStatus | null,
    consentId: row.consent_id,
    consentMethod: row.consent_method as ConsentMethod | null,
    consentEvidence: row.consent_evidence,
  };
}

function mapContentRevision(row: any): ContentRevision {
  return {
    id: row.id,
    contentItemId: row.content_item_id,
    revisionNumber: Number(row.revision_number),
    title: row.title,
    summary: row.summary,
    body: row.body,
    url: row.url,
    contentHash: row.content_hash,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapConsentRequest(row: any): ConsentRequest {
  return {
    id: row.id,
    contentItemId: row.content_item_id,
    revisionId: row.revision_id,
    contactId: row.contact_id,
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    status: row.status as ConsentRequestStatus,
    expiresAt: new Date(row.expires_at).toISOString(),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).toISOString(),
    respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
    responseNotes: row.response_notes,
  };
}

function buildContentHash(data: {
  title: string;
  summary?: string | null;
  body?: string | null;
  url?: string | null;
}) {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        title: data.title,
        summary: data.summary || '',
        body: data.body || '',
        url: data.url || '',
      })
    )
    .digest('hex');
}

function mapNewsletter(row: any): Newsletter {
  return {
    id: row.id,
    slug: row.slug,
    subject: row.subject,
    previewText: row.preview_text,
    status: row.status as NewsletterStatus,
    scheduledFor: row.scheduled_for ? new Date(row.scheduled_for).toISOString() : null,
    sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    mailchimpCampaignId: row.mailchimp_campaign_id,
    mailchimpWebId: row.mailchimp_web_id,
    mailchimpArchiveUrl: row.mailchimp_archive_url,
    htmlContent: row.html_content,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    itemCount: row.item_count !== undefined ? Number(row.item_count) : undefined,
  };
}

function mapJsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function mapFounderSubmission(row: any): FounderSubmission {
  return {
    id: row.id,
    type: row.type as FounderSubmissionType,
    title: row.title,
    summary: row.summary,
    body: row.body,
    companyName: row.company_name,
    founderName: row.founder_name,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    sourceUrls: mapJsonArray(row.source_urls),
    mediaUrls: mapJsonArray(row.media_urls),
    event: (row.event || null) as FounderSubmissionEvent | null,
    notes: row.notes,
    identityStatus: row.identity_status,
    submittedVia: row.submitted_via,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

// Content Items
export async function getContentItems(filters?: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<ContentItem[]> {
  let sql = `
    SELECT 
      ci.*,
      c.name AS contact_name,
      c.email AS contact_email,
      e.title AS event_title,
      cr.id AS consent_id,
      cr.status AS consent_status,
      cr.method AS consent_method,
      cr.evidence AS consent_evidence
    FROM content_items ci
    LEFT JOIN contacts c ON ci.contact_id = c.id
    LEFT JOIN events e ON ci.event_id = e.id
    LEFT JOIN LATERAL (
      SELECT id, status, method, evidence 
      FROM consent_records 
      WHERE content_item_id = ci.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) cr ON true
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.status) {
    params.push(filters.status);
    sql += ` AND ci.status = $${params.length}`;
  }

  if (filters?.type) {
    params.push(filters.type);
    sql += ` AND ci.type = $${params.length}`;
  }

  if (filters?.search) {
    params.push(`%${filters.search}%`);
    sql += ` AND (ci.title ILIKE $${params.length} OR ci.summary ILIKE $${params.length} OR ci.body ILIKE $${params.length})`;
  }

  sql += ` ORDER BY ci.created_at DESC`;

  const res = await query(sql, params);
  return res.rows.map(mapContentItem);
}

export async function getContentItemById(id: string): Promise<ContentItem | null> {
  const sql = `
    SELECT 
      ci.*,
      c.name AS contact_name,
      c.email AS contact_email,
      e.title AS event_title,
      cr.id AS consent_id,
      cr.status AS consent_status,
      cr.method AS consent_method,
      cr.evidence AS consent_evidence
    FROM content_items ci
    LEFT JOIN contacts c ON ci.contact_id = c.id
    LEFT JOIN events e ON ci.event_id = e.id
    LEFT JOIN LATERAL (
      SELECT id, status, method, evidence 
      FROM consent_records 
      WHERE content_item_id = ci.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) cr ON true
    WHERE ci.id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows.length ? mapContentItem(res.rows[0]) : null;
}

export async function createContentRevisionForItem(
  contentItemId: string,
  createdBy: string = 'volta'
): Promise<ContentRevision | null> {
  const item = await getContentItemById(contentItemId);
  if (!item) return null;

  const existingCurrent = item.currentRevisionId
    ? await getContentRevisionById(item.currentRevisionId)
    : null;
  const contentHash = buildContentHash(item);

  if (existingCurrent?.contentHash === contentHash) {
    return existingCurrent;
  }

  const nextNumberRes = await query(
    `
      SELECT COALESCE(MAX(revision_number), 0) + 1 AS next_revision_number
      FROM content_revisions
      WHERE content_item_id = $1
    `,
    [contentItemId]
  );
  const nextRevisionNumber = Number(nextNumberRes.rows[0]?.next_revision_number || 1);

  const res = await query(
    `
      INSERT INTO content_revisions (
        content_item_id, revision_number, title, summary, body, url, content_hash, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING *
    `,
    [
      contentItemId,
      nextRevisionNumber,
      item.title,
      item.summary || null,
      item.body || null,
      item.url || null,
      contentHash,
      createdBy,
    ]
  );
  const revision = mapContentRevision(res.rows[0]);
  await query(
    `
      UPDATE content_items
      SET current_revision_id = $1,
          approved_revision_id = CASE
            WHEN approved_revision_id = $1 THEN approved_revision_id
            ELSE approved_revision_id
          END,
          updated_at = NOW()
      WHERE id = $2
    `,
    [revision.id, contentItemId]
  );
  return revision;
}

export async function getContentRevisionById(
  revisionId: string
): Promise<ContentRevision | null> {
  const res = await query(`SELECT * FROM content_revisions WHERE id = $1`, [revisionId]);
  return res.rows.length ? mapContentRevision(res.rows[0]) : null;
}

export async function getCurrentContentRevision(
  contentItemId: string
): Promise<ContentRevision | null> {
  const item = await getContentItemById(contentItemId);
  if (item?.currentRevisionId) {
    return getContentRevisionById(item.currentRevisionId);
  }
  return createContentRevisionForItem(contentItemId, 'migration');
}

export async function createContentItem(data: {
  type: ContentItemType;
  title: string;
  body?: string | null;
  summary?: string | null;
  url?: string | null;
  status?: ContentItemStatus;
  featured?: boolean;
  contactId?: string | null;
  eventId?: string | null;
  revisitAt?: string | null;
}): Promise<ContentItem> {
  const sql = `
    INSERT INTO content_items (
      type, title, body, summary, url, status, featured, contact_id, event_id, revisit_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING *
  `;
  const params = [
    data.type,
    data.title,
    data.body || null,
    data.summary || null,
    data.url || null,
    data.status || 'INBOX',
    data.featured || false,
    data.contactId || null,
    data.eventId || null,
    data.revisitAt ? new Date(data.revisitAt) : null,
  ];
  const res = await query(sql, params);
  await createContentRevisionForItem(res.rows[0].id, 'intake');
  const item = await getContentItemById(res.rows[0].id);
  return item!;
}

export async function updateContentItem(
  id: string,
  data: Partial<{
    title: string;
    body: string | null;
    summary: string | null;
    url: string | null;
    type: ContentItemType;
    status: ContentItemStatus;
    featured: boolean;
    revisitAt: string | null;
    rejectionReason: string | null;
    contactId: string | null;
    eventId: string | null;
  }>
): Promise<ContentItem | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];

  const fieldMap: Record<string, string> = {
    title: 'title',
    body: 'body',
    summary: 'summary',
    url: 'url',
    type: 'type',
    status: 'status',
    featured: 'featured',
    revisitAt: 'revisit_at',
    rejectionReason: 'rejection_reason',
    contactId: 'contact_id',
    eventId: 'event_id',
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    if (key in data) {
      let val = (data as any)[key];
      if (key === 'revisitAt' && val) val = new Date(val);
      params.push(val);
      setClauses.push(`${dbCol} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) return getContentItemById(id);

  setClauses.push('updated_at = NOW()');
  const sql = `UPDATE content_items SET ${setClauses.join(', ')} WHERE id = $1 RETURNING id`;
  const createsNewRevision = ['title', 'summary', 'body', 'url'].some((field) => field in data);
  const res = await query(sql, params);
  if (res.rows.length === 0) return null;
  if (createsNewRevision) {
    await createContentRevisionForItem(id, 'volta');
  }
  return getContentItemById(id);
}

// Backlog management
export async function getBacklogItems(): Promise<ContentItem[]> {
  const sql = `
    SELECT 
      ci.*,
      c.name AS contact_name,
      c.email AS contact_email,
      e.title AS event_title,
      cr.id AS consent_id,
      cr.status AS consent_status,
      cr.method AS consent_method,
      cr.evidence AS consent_evidence
    FROM content_items ci
    LEFT JOIN contacts c ON ci.contact_id = c.id
    LEFT JOIN events e ON ci.event_id = e.id
    LEFT JOIN LATERAL (
      SELECT id, status, method, evidence 
      FROM consent_records 
      WHERE content_item_id = ci.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) cr ON true
    WHERE ci.status = 'BACKLOG'
    ORDER BY ci.revisit_at ASC NULLS LAST, ci.created_at DESC
  `;
  const res = await query(sql);
  return res.rows.map(mapContentItem);
}

export async function getOverdueBacklogCount(): Promise<number> {
  const sql = `
    SELECT COUNT(*)::int AS count 
    FROM content_items 
    WHERE status = 'BACKLOG' AND revisit_at IS NOT NULL AND revisit_at <= NOW()
  `;
  const res = await query(sql);
  return res.rows[0]?.count || 0;
}

// Consent records
export async function getConsentRecords(contentItemId?: string): Promise<ConsentRecord[]> {
  let sql = `
    SELECT cr.*, c.email AS contact_email, c.name AS contact_name
    FROM consent_records cr
    JOIN contacts c ON cr.contact_id = c.id
  `;
  const params: any[] = [];
  if (contentItemId) {
    params.push(contentItemId);
    sql += ` WHERE cr.content_item_id = $1`;
  }
  sql += ` ORDER BY cr.created_at DESC`;
  const res = await query(sql, params);
  return res.rows.map((row) => ({
    id: row.id,
    contentItemId: row.content_item_id,
    revisionId: row.revision_id,
    consentRequestId: row.consent_request_id,
    contentHash: row.content_hash,
    contactId: row.contact_id,
    status: row.status as ConsentStatus,
    method: row.method as ConsentMethod,
    evidence: row.evidence,
    notes: row.notes,
    requestedAt: new Date(row.requested_at).toISOString(),
    respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    contactEmail: row.contact_email,
    contactName: row.contact_name,
  }));
}

export async function recordConsent(data: {
  contentItemId: string;
  contactId: string;
  revisionId?: string | null;
  consentRequestId?: string | null;
  contentHash?: string | null;
  status: ConsentStatus;
  method: ConsentMethod;
  evidence?: string | null;
  notes?: string | null;
}): Promise<ConsentRecord> {
  const currentRevision = data.revisionId
    ? await getContentRevisionById(data.revisionId)
    : await getCurrentContentRevision(data.contentItemId);
  const revisionId = currentRevision?.id || data.revisionId || null;
  const contentHash = data.contentHash || currentRevision?.contentHash || null;

  const sql = `
    INSERT INTO consent_records (
      content_item_id, contact_id, revision_id, consent_request_id, content_hash,
      status, method, evidence, notes, responded_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING *
  `;
  const respondedAt = data.status === 'GRANTED' || data.status === 'REVOKED' ? new Date() : null;
  const res = await query(sql, [
    data.contentItemId,
    data.contactId,
    revisionId,
    data.consentRequestId || null,
    contentHash,
    data.status,
    data.method,
    data.evidence || null,
    data.notes || null,
    respondedAt,
  ]);

  // If consent is GRANTED, advance content item from PENDING_CONSENT to APPROVED if applicable
  if (data.status === 'GRANTED') {
    await query(
      `
        UPDATE content_items
        SET status = 'APPROVED',
            approved_revision_id = COALESCE($2, approved_revision_id),
            updated_at = NOW()
        WHERE id = $1 AND status = 'PENDING_CONSENT'
      `,
      [data.contentItemId, revisionId]
    );
  } else if (data.status === 'PENDING') {
    await query(
      `UPDATE content_items SET status = 'PENDING_CONSENT', updated_at = NOW() WHERE id = $1 AND status IN ('INBOX', 'DRAFT')`,
      [data.contentItemId]
    );
  }

  const records = await getConsentRecords(data.contentItemId);
  return records[0];
}

export async function createConsentRequest(data: {
  contentItemId: string;
  revisionId: string;
  contactId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  tokenHash: string;
  expiresAt: string;
  createdBy?: string;
}): Promise<ConsentRequest> {
  const res = await query(
    `
      INSERT INTO consent_requests (
        content_item_id, revision_id, contact_id, recipient_name, recipient_email,
        token_hash, expires_at, created_by, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'PENDING'
      )
      RETURNING *
    `,
    [
      data.contentItemId,
      data.revisionId,
      data.contactId || null,
      data.recipientName || null,
      data.recipientEmail || null,
      data.tokenHash,
      new Date(data.expiresAt),
      data.createdBy || 'volta',
    ]
  );
  await query(
    `UPDATE content_items SET status = 'PENDING_CONSENT', updated_at = NOW() WHERE id = $1 AND status IN ('INBOX', 'DRAFT', 'APPROVED')`,
    [data.contentItemId]
  );
  return mapConsentRequest(res.rows[0]);
}

export async function getConsentRequestByTokenHash(
  tokenHash: string
): Promise<ConsentRequest | null> {
  const res = await query(`SELECT * FROM consent_requests WHERE token_hash = $1`, [
    tokenHash,
  ]);
  return res.rows.length ? mapConsentRequest(res.rows[0]) : null;
}

export async function respondToConsentRequest(data: {
  requestId: string;
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED' | 'EXPIRED';
  responseNotes?: string | null;
}): Promise<ConsentRequest | null> {
  const res = await query(
    `
      UPDATE consent_requests
      SET status = $2,
          response_notes = $3,
          responded_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [data.requestId, data.status, data.responseNotes || null]
  );
  return res.rows.length ? mapConsentRequest(res.rows[0]) : null;
}

export async function getGrantedConsentForRevision(
  revisionId: string
): Promise<ConsentRecord | null> {
  const records = await query(
    `
      SELECT cr.*, c.email AS contact_email, c.name AS contact_name
      FROM consent_records cr
      JOIN contacts c ON cr.contact_id = c.id
      WHERE cr.revision_id = $1
        AND cr.status = 'GRANTED'
      ORDER BY cr.created_at DESC
      LIMIT 1
    `,
    [revisionId]
  );
  if (records.rows.length === 0) return null;
  const row = records.rows[0];
  return {
    id: row.id,
    contentItemId: row.content_item_id,
    revisionId: row.revision_id,
    consentRequestId: row.consent_request_id,
    contentHash: row.content_hash,
    contactId: row.contact_id,
    status: row.status as ConsentStatus,
    method: row.method as ConsentMethod,
    evidence: row.evidence,
    notes: row.notes,
    requestedAt: new Date(row.requested_at).toISOString(),
    respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : null,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    contactEmail: row.contact_email,
    contactName: row.contact_name,
  };
}

// Contacts
export async function findOrCreateContact(email: string, name?: string | null, organization?: string | null, role?: string | null): Promise<Contact> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await query(`SELECT * FROM contacts WHERE email = $1`, [cleanEmail]);
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (name && !row.name) {
      await query(`UPDATE contacts SET name = $1, updated_at = NOW() WHERE id = $2`, [name, row.id]);
    }
    return {
      id: row.id,
      email: row.email,
      name: name || row.name,
      organization: organization || row.organization,
      role: role || row.role,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  const res = await query(
    `INSERT INTO contacts (email, name, organization, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [cleanEmail, name || null, organization || null, role || null]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    organization: row.organization,
    role: row.role,
    notes: row.notes,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getContacts(): Promise<Contact[]> {
  const res = await query(`SELECT * FROM contacts ORDER BY name ASC, email ASC`);
  return res.rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    organization: row.organization,
    role: row.role,
    notes: row.notes,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

// Events
export async function getEvents(): Promise<Event[]> {
  const res = await query(`SELECT * FROM events ORDER BY starts_at ASC`);
  return res.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    location: row.location,
    externalId: row.external_id,
    source: row.source,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

// Newsletters
export async function getNewsletters(): Promise<Newsletter[]> {
  const sql = `
    SELECT 
      n.*,
      COUNT(ni.content_item_id)::int AS item_count
    FROM newsletters n
    LEFT JOIN newsletter_items ni ON n.id = ni.newsletter_id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `;
  const res = await query(sql);
  return res.rows.map(mapNewsletter);
}

export async function getNewsletterById(id: string): Promise<Newsletter | null> {
  const sql = `
    SELECT 
      n.*,
      COUNT(ni.content_item_id)::int AS item_count
    FROM newsletters n
    LEFT JOIN newsletter_items ni ON n.id = ni.newsletter_id
    WHERE n.id = $1
    GROUP BY n.id
  `;
  const res = await query(sql, [id]);
  return res.rows.length ? mapNewsletter(res.rows[0]) : null;
}

export async function createNewsletter(data: {
  slug: string;
  subject: string;
  previewText?: string | null;
  scheduledFor?: string | null;
}): Promise<Newsletter> {
  const sql = `
    INSERT INTO newsletters (slug, subject, preview_text, scheduled_for, status)
    VALUES ($1, $2, $3, $4, 'DRAFT')
    RETURNING *
  `;
  const res = await query(sql, [
    data.slug,
    data.subject,
    data.previewText || null,
    data.scheduledFor ? new Date(data.scheduledFor) : null,
  ]);
  return mapNewsletter(res.rows[0]);
}

export async function updateNewsletter(
  id: string,
  data: Partial<{
    slug: string;
    subject: string;
    previewText: string | null;
    status: NewsletterStatus;
    scheduledFor: string | null;
    sentAt: string | null;
    mailchimpCampaignId: string | null;
    mailchimpWebId: string | null;
    mailchimpArchiveUrl: string | null;
    htmlContent: string | null;
  }>
): Promise<Newsletter | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];

  const fieldMap: Record<string, string> = {
    slug: 'slug',
    subject: 'subject',
    previewText: 'preview_text',
    status: 'status',
    scheduledFor: 'scheduled_for',
    sentAt: 'sent_at',
    mailchimpCampaignId: 'mailchimp_campaign_id',
    mailchimpWebId: 'mailchimp_web_id',
    mailchimpArchiveUrl: 'mailchimp_archive_url',
    htmlContent: 'html_content',
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    if (key in data) {
      let val = (data as any)[key];
      if ((key === 'scheduledFor' || key === 'sentAt') && val) val = new Date(val);
      params.push(val);
      setClauses.push(`${dbCol} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) return getNewsletterById(id);

  setClauses.push('updated_at = NOW()');
  const sql = `UPDATE newsletters SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
  const res = await query(sql, params);
  return res.rows.length ? mapNewsletter(res.rows[0]) : null;
}

export interface NewsletterItemWithContent {
  newsletterId: string;
  contentItemId: string;
  section: NewsletterSection;
  position: number;
  item: ContentItem;
  trackedUrl?: string;
}

export async function getNewsletterItemsWithContent(
  newsletterId: string
): Promise<NewsletterItemWithContent[]> {
  const sql = `
    SELECT 
      ni.newsletter_id,
      ni.content_item_id,
      ni.section,
      ni.position,
      ci.*,
      c.name AS contact_name,
      c.email AS contact_email,
      e.title AS event_title,
      cr.id AS consent_id,
      cr.status AS consent_status,
      cr.method AS consent_method,
      cr.evidence AS consent_evidence,
      tl.destination_url AS tracked_url
    FROM newsletter_items ni
    JOIN content_items ci ON ni.content_item_id = ci.id
    LEFT JOIN contacts c ON ci.contact_id = c.id
    LEFT JOIN events e ON ci.event_id = e.id
    LEFT JOIN LATERAL (
      SELECT id, status, method, evidence 
      FROM consent_records 
      WHERE content_item_id = ci.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) cr ON true
    LEFT JOIN tracked_links tl ON tl.newsletter_id = ni.newsletter_id AND tl.content_item_id = ni.content_item_id
    WHERE ni.newsletter_id = $1
    ORDER BY ni.section ASC, ni.position ASC, ci.created_at ASC
  `;
  const res = await query(sql, [newsletterId]);
  return res.rows.map((row) => ({
    newsletterId: row.newsletter_id,
    contentItemId: row.content_item_id,
    section: row.section as NewsletterSection,
    position: row.position,
    item: mapContentItem(row),
    trackedUrl: row.tracked_url || undefined,
  }));
}

export async function attachItemToNewsletter(
  newsletterId: string,
  contentItemId: string,
  section: NewsletterSection = 'STORIES',
  position: number = 0
): Promise<void> {
  await query(
    `
    INSERT INTO newsletter_items (newsletter_id, content_item_id, section, position)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (newsletter_id, content_item_id)
    DO UPDATE SET section = EXCLUDED.section, position = EXCLUDED.position
  `,
    [newsletterId, contentItemId, section, position]
  );

  // Sync tracked link for this item
  await syncTrackedLinksForNewsletter(newsletterId);
}

export async function detachItemFromNewsletter(
  newsletterId: string,
  contentItemId: string
): Promise<void> {
  await query(
    `DELETE FROM newsletter_items WHERE newsletter_id = $1 AND content_item_id = $2`,
    [newsletterId, contentItemId]
  );
  await query(
    `DELETE FROM tracked_links WHERE newsletter_id = $1 AND content_item_id = $2`,
    [newsletterId, contentItemId]
  );
}

// Tracked Links & UTMs
export async function syncTrackedLinksForNewsletter(newsletterId: string): Promise<void> {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) return;

  const campaign = newsletter.slug;

  const itemsRes = await query(
    `
    SELECT ci.id, ci.url
    FROM newsletter_items ni
    JOIN content_items ci ON ni.content_item_id = ci.id
    WHERE ni.newsletter_id = $1 AND ci.url IS NOT NULL AND TRIM(ci.url) != ''
  `,
    [newsletterId]
  );

  for (const row of itemsRes.rows) {
    const originalUrl = row.url.trim();
    const destinationUrl = buildTrackedUrl(originalUrl, campaign);

    await query(
      `
      INSERT INTO tracked_links (
        newsletter_id, content_item_id, original_url, destination_url, utm_source, utm_medium, utm_campaign
      ) VALUES (
        $1, $2, $3, $4, 'newsletter', 'email', $5
      )
      ON CONFLICT DO NOTHING
    `,
      [newsletterId, row.id, originalUrl, destinationUrl, campaign]
    );
  }
}

export async function getTrackedLinksForNewsletter(newsletterId: string): Promise<TrackedLink[]> {
  const res = await query(
    `SELECT * FROM tracked_links WHERE newsletter_id = $1 ORDER BY created_at ASC`,
    [newsletterId]
  );
  return res.rows.map((row) => ({
    id: row.id,
    newsletterId: row.newsletter_id,
    contentItemId: row.content_item_id,
    originalUrl: row.original_url,
    destinationUrl: row.destination_url,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    clicks: row.clicks,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function recordLinkClick(destinationUrl: string): Promise<void> {
  await query(`UPDATE tracked_links SET clicks = clicks + 1 WHERE destination_url = $1`, [
    destinationUrl,
  ]);
}

// Founder submissions
export async function createFounderSubmission(data: {
  type: FounderSubmissionType;
  title?: string | null;
  summary?: string | null;
  body?: string | null;
  companyName?: string | null;
  founderName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  sourceUrls?: string[];
  mediaUrls?: string[];
  event?: FounderSubmissionEvent | null;
  notes?: string | null;
}): Promise<FounderSubmission> {
  const sql = `
    INSERT INTO founder_submissions (
      type, title, summary, body, company_name, founder_name, contact_name, contact_email,
      source_urls, media_urls, event, notes, identity_status, submitted_via, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12,
      'UNVERIFIED', 'FOUNDER_MCP', 'RECEIVED'
    )
    RETURNING *
  `;

  const res = await query(sql, [
    data.type,
    data.title || null,
    data.summary || null,
    data.body || null,
    data.companyName || null,
    data.founderName || null,
    data.contactName || null,
    data.contactEmail || null,
    JSON.stringify(data.sourceUrls || []),
    JSON.stringify(data.mediaUrls || []),
    data.event ? JSON.stringify(data.event) : null,
    data.notes || null,
  ]);

  return mapFounderSubmission(res.rows[0]);
}
