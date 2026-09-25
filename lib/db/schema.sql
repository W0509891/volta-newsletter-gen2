-- PostgreSQL Schema for Volta Newsletter Generation 2

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  external_id TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(32) NOT NULL, -- STORY, EVENT, WIN, OPPORTUNITY, COMMUNITY
  title TEXT NOT NULL,
  body TEXT,
  summary TEXT,
  url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'INBOX', -- INBOX, DRAFT, PENDING_CONSENT, APPROVED, REJECTED, BACKLOG, ARCHIVED
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  item_order INTEGER DEFAULT 0,
  revisit_at TIMESTAMPTZ,
  rejection_reason TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  current_revision_id UUID,
  approved_revision_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  url TEXT,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_item_id, revision_number)
);

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS current_revision_id UUID REFERENCES content_revisions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_revision_id UUID REFERENCES content_revisions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES content_revisions(id) ON DELETE SET NULL,
  consent_request_id UUID,
  content_hash TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, GRANTED, REVOKED, EXPIRED
  method VARCHAR(32) NOT NULL DEFAULT 'EMAIL', -- EMAIL, VERBAL, FORM, RECORDING, PREVIEW_LINK
  evidence TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  revision_id UUID NOT NULL REFERENCES content_revisions(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  token_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'volta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_notes TEXT
);

CREATE TABLE IF NOT EXISTS founder_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  body TEXT,
  company_name TEXT,
  founder_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  event JSONB,
  notes TEXT,
  identity_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
  submitted_via TEXT NOT NULL DEFAULT 'FOUNDER_MCP',
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  promoted_content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE founder_submissions
  ADD COLUMN IF NOT EXISTS promoted_content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, SENDING, SENT, ARCHIVED
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  mailchimp_campaign_id TEXT,
  mailchimp_web_id TEXT,
  mailchimp_archive_url TEXT,
  html_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_items (
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  section VARCHAR(32) NOT NULL DEFAULT 'STORIES', -- FEATURED, STORIES, EVENTS, WINS, OPPORTUNITIES, COMMUNITY
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (newsletter_id, content_item_id)
);

CREATE TABLE IF NOT EXISTS tracked_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  utm_source VARCHAR(64) NOT NULL DEFAULT 'newsletter',
  utm_medium VARCHAR(64) NOT NULL DEFAULT 'email',
  utm_campaign VARCHAR(128) NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  entity_id UUID,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  polling_interval_minutes INTEGER NOT NULL DEFAULT 1440,
  priority INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  last_error TEXT,
  created_by TEXT NOT NULL DEFAULT 'volta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
  canonical_url TEXT NOT NULL,
  original_url TEXT NOT NULL,
  author TEXT,
  title TEXT NOT NULL,
  raw_excerpt TEXT,
  raw_content TEXT,
  published_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_hash TEXT NOT NULL,
  ai_summary TEXT,
  ai_relevance_reason TEXT,
  ai_confidence NUMERIC,
  source_ownership TEXT NOT NULL DEFAULT 'UNKNOWN',
  status TEXT NOT NULL DEFAULT 'NEW',
  first_surfaced_at TIMESTAMPTZ,
  last_surfaced_at TIMESTAMPTZ,
  promoted_content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (canonical_url),
  UNIQUE (content_hash)
);

CREATE TABLE IF NOT EXISTS news_delivery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES news_candidates(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_reference TEXT,
  UNIQUE (candidate_id, channel, delivery_type)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  subject_type TEXT,
  subject_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_revisit_at ON content_items(revisit_at);
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_item ON content_revisions(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_items_current_revision ON content_items(current_revision_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_content_item ON consent_records(content_item_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_revision ON consent_records(revision_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_contact ON consent_records(contact_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_revision ON consent_requests(revision_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_token_hash ON consent_requests(token_hash);
CREATE INDEX IF NOT EXISTS idx_founder_submissions_status ON founder_submissions(status);
CREATE INDEX IF NOT EXISTS idx_founder_submissions_created_at ON founder_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters(slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_items_newsletter ON newsletter_items(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_tracked_links_newsletter ON tracked_links(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_news_sources_enabled ON news_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_news_candidates_status ON news_candidates(status);
CREATE INDEX IF NOT EXISTS idx_news_candidates_published_at ON news_candidates(published_at);
CREATE INDEX IF NOT EXISTS idx_news_delivery_records_candidate ON news_delivery_records(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_subject ON audit_logs(subject_type, subject_id);

INSERT INTO content_revisions (
  content_item_id, revision_number, title, summary, body, url, content_hash, created_by, created_at
)
SELECT
  ci.id,
  1,
  ci.title,
  ci.summary,
  ci.body,
  ci.url,
  md5(concat_ws('::', ci.title, COALESCE(ci.summary, ''), COALESCE(ci.body, ''), COALESCE(ci.url, ''))),
  'migration',
  ci.created_at
FROM content_items ci
WHERE NOT EXISTS (
  SELECT 1 FROM content_revisions cr WHERE cr.content_item_id = ci.id
);

UPDATE content_items ci
SET current_revision_id = cr.id
FROM content_revisions cr
WHERE cr.content_item_id = ci.id
  AND cr.revision_number = 1
  AND ci.current_revision_id IS NULL;

create table if not exists migrations (
                                          id uuid primary key default gen_random_uuid(),
                                          migration varchar(255),
                                          name varchar(255),
                                          date_applied timestamp default current_timestamp,
                                          sql text
);

