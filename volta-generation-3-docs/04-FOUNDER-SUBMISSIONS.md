# Founder Submission Intake

## Goal

Allow a founder or founder-controlled AI agent to submit possible newsletter content without gaining read access to Volta's internal newsletter system.

MVP identity is anonymous/unverified.

---

# Submission Model

Add:

```text
founder_submissions
```

Suggested fields:

```text
id UUID PK

type TEXT

title TEXT NULL
summary TEXT NULL
body TEXT NULL

company_name TEXT NULL
founder_name TEXT NULL

contact_name TEXT NULL
contact_email TEXT NULL

source_urls JSONB
media_urls JSONB

event JSONB NULL
notes TEXT NULL

identity_status TEXT
submitted_via TEXT

status TEXT

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Store:

```text
identity_status = UNVERIFIED
submitted_via = FOUNDER_MCP
```

Submission states:

```text
RECEIVED
TRIAGED
PROMOTED
REJECTED
```

Do not reuse editorial `content_items.status` for submission intake.

---

# Append-Only Rule

Founder MCP exposes:

```text
submission.create
```

It does not expose:

```text
submission.get
submission.list
submission.update
submission.delete
```

A submission may return:

```json
{
  "submissionId": "...",
  "receivedAt": "...",
  "status": "RECEIVED"
}
```

The ID is only a receipt.

---

# Founder Submission Flow

```text
@founder
    ↓
submission.create
    ↓
FOUNDER_SUBMISSION
identity = UNVERIFIED
status = RECEIVED
    ↓
@volta reviews
    ↓
PROMOTE / REJECT
```

Promotion must be an explicit Volta action.

A founder submission is source material, not automatically editorial content.

---

# Promotion Flow

When a curator promotes a submission:

```text
founder_submission
      ↓
submission.promote
      ↓
content_item
      ↓
content_revision #1
```

Link the promoted content item back to the originating submission for provenance.

Do not delete or transform the original submission into the content record.

Preserve the original submission as received.

---

# Consent Boundary

Founder submission and founder consent are separate.

A founder may submit:

```text
"We raised a seed round."
```

Volta may rewrite it into:

```text
"Acme Robotics has announced its latest seed financing..."
```

The rewritten revision must receive separate approval when consent is required.

Submission never automatically creates an approved consent record.

---

# Validation

All founder input is untrusted.

Validate:

- email format
- URLs
- maximum title length
- maximum body length
- maximum array lengths
- event dates
- supported submission types
- media URL count
- source URL count

Use runtime schemas, preferably Zod.

---

# Abuse Protection

Because the MVP permits anonymous submissions, implement:

- rate limiting
- request-size limits
- payload validation
- content sanitization
- basic spam protection
- IP/request logging appropriate for operations
- audit records

Do not claim the submitted company/founder identity is verified.

---

# Future Verification

Design the schema so later versions can introduce:

```text
identity_status = VERIFIED
```

Possible future methods may include:

- authenticated founder accounts
- signed email verification
- approved company domains
- invite links
- OAuth-based identity

Do not require these for the MVP.
