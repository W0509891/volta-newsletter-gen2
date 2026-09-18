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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, GRANTED, REVOKED, EXPIRED
  method VARCHAR(32) NOT NULL DEFAULT 'EMAIL', -- EMAIL, VERBAL, FORM, RECORDING
  evidence TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_revisit_at ON content_items(revisit_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_content_item ON consent_records(content_item_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_contact ON consent_records(contact_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters(slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_items_newsletter ON newsletter_items(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_tracked_links_newsletter ON tracked_links(newsletter_id);
