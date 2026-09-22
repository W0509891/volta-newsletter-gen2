# Consent, Revisions & Publication Eligibility

## Core Rule

Consent applies to an **exact immutable content revision**.

A content item may have many revisions:

```text
Story
 ├── Revision 1
 ├── Revision 2 ← APPROVED
 └── Revision 3 ← CURRENT
```

Revision 3 is not approved simply because Revision 2 was approved.

---

# Content Revisions

Add:

```text
content_revisions
```

Suggested fields:

```text
id UUID PK

content_item_id UUID FK
revision_number INTEGER

title TEXT
summary TEXT
body TEXT

media JSONB
metadata JSONB

content_hash TEXT

created_by TEXT
created_at TIMESTAMPTZ
```

Add to `content_items`:

```text
current_revision_id
```

Optionally:

```text
approved_revision_id
```

## Immutable Revision Rule

Never update the text of an existing revision.

Editing content creates a new revision.

Correct:

```text
Revision 1 → Revision 2 → Revision 3
```

Incorrect:

```text
UPDATE Revision 1
```

Historical revisions must remain available for auditing.

---

# Consent Requests

Add:

```text
consent_requests
```

Suggested fields:

```text
id UUID PK

content_item_id UUID
revision_id UUID

contact_id UUID NULL

recipient_name TEXT NULL
recipient_email TEXT NULL

token_hash TEXT

status TEXT

expires_at TIMESTAMPTZ

created_by TEXT

created_at TIMESTAMPTZ
responded_at TIMESTAMPTZ NULL

response_notes TEXT NULL
```

Statuses:

```text
PENDING
APPROVED
CHANGES_REQUESTED
DECLINED
REVOKED
EXPIRED
```

Extend existing consent records with:

```text
revision_id
consent_request_id
content_hash
```

Add evidence method:

```text
PREVIEW_LINK
```

---

# Secure Preview Link

Public route:

```text
/consent/[token]
```

Requirements:

1. Generate a cryptographically random token.
2. Store only a hash of the token.
3. Never retain the raw token after issuing the URL.
4. Bind the request to one exact revision.
5. The preview must render that exact revision, not `current_revision_id`.

The page should show:

```text
Volta Builders Dispatch

Proposed feature

[EXACT APPROVAL COPY]

[associated images/media]

I confirm that I have reviewed this version.

[Approve]
[Request Changes]
[Decline]
```

Allow comments for:

```text
REQUEST_CHANGES
DECLINE
```

---

# Approval Transaction

On approval:

```text
validate token
      ↓
verify PENDING
      ↓
verify not expired
      ↓
load exact revision
      ↓
verify content hash
      ↓
mark request APPROVED
      ↓
create consent record
      ↓
store revision_id
      ↓
store content_hash
      ↓
store PREVIEW_LINK evidence
      ↓
recalculate publication eligibility
```

Perform this transactionally.

Repeated approval requests should be idempotent.

---

# Submission Is Not Consent

A founder submitting content does **not** grant publication permission.

Flow:

```text
Founder submission
      ↓
Volta editorial review
      ↓
Draft / rewrite
      ↓
Exact revision
      ↓
Separate consent request
```

Choices can change after submission, so publication permission must be separate.

---

# Consent Policy

## Third-Party / Founder-Specific Content

Consent is required when newsletter material meaningfully concerns:

- a founder
- a company
- a private milestone
- a quote
- sensitive information
- a stakeholder-specific claim

## Volta-Owned Sources

If content originated on:

```text
Volta website
Volta LinkedIn
other official Volta channel
```

the system may skip contacting the original publisher.

However, this does **not** automatically waive founder/company consent.

If the newsletter draft materially concerns another stakeholder, request consent for the final revision.

## Pure Volta Institutional Content

Examples:

```text
Volta office-hours notice
Volta program deadline
Volta-hosted event
Volta administrative announcement
```

may be classified:

```text
consent_required = false
```

Store why consent was not required.

---

# Publication Eligibility Service

Create one authoritative service:

```text
PublicationEligibilityService
```

Concept:

```ts
evaluate(contentItem, revision): PublicationEligibility
```

Example result:

```ts
{
  eligible: boolean;
  consentRequired: boolean;
  currentRevisionApproved: boolean;
  reasons: string[];
}
```

Consider:

- content ownership
- content type
- current revision
- approval state
- revocation
- expiration
- newsletter edition
- consent scope

Every newsletter operation should use this service.

---

# Mailchimp Safety Gate

Before:

```text
sync
schedule
send
```

check every newsletter item.

Block if:

```text
consent_required = true
```

and the current revision is not validly approved.

Also block when consent is:

```text
REVOKED
EXPIRED
DECLINED
```

Return structured errors such as:

```json
{
  "eligible": false,
  "blockingItems": [
    {
      "contentItemId": "...",
      "reason": "Current revision has not been approved"
    }
  ]
}
```

---

# UI Requirements

The editor should show revision-specific status.

Good:

```text
CURRENT REVISION: 4

CONSENT:
Pending for Revision 4

Previous:
Revision 3 — Approved
Revision 2 — Changes Requested
Revision 1 — Draft
```

Avoid:

```text
Consent: Approved
```

without identifying which revision was approved.
