# Data Model, Security & Operations

## New Tables

Generation 3 should add the following incrementally:

```text
founder_submissions
content_revisions
consent_requests
news_sources
news_candidates
ecosystem_entities
entity_relationships
news_candidate_entities
news_delivery_records
agent_audit_log
```

Modify existing:

```text
content_items
consent_records
```

as necessary to reference revisions.

Do not replace the existing Generation 2 schema.

---

# Migration Strategy

Use incremental migrations.

For existing Generation 2 content:

1. Create a baseline Revision 1 from current content.
2. Set it as the current revision.
3. Preserve existing consent/history.
4. Avoid silently invalidating historical newsletter records.

Where an exact historical consent-to-revision relationship cannot be reconstructed, preserve the legacy record honestly rather than inventing one.

---

# @volta Authentication

`@volta` must require authenticated access.

Use bearer/OAuth-compatible authorization.

Conceptual permission:

```text
volta:full
```

Do not put authentication secrets inside MCP tool arguments.

---

# @founder Security

Founder MVP permits anonymous submissions.

Apply:

```text
rate limiting
payload size limits
URL limits
schema validation
content sanitization
spam protection
request logging
```

Identity must remain:

```text
UNVERIFIED
```

unless explicitly verified later.

---

# Runtime Validation

Use strong runtime validation, preferably Zod.

Validate:

```text
UUIDs
URLs
emails
dates
enums
string lengths
array lengths
content lengths
```

External web/source content is always untrusted input.

---

# Audit Log

Add:

```text
agent_audit_log
```

Suggested fields:

```text
id

actor
server
tool_name

request_id

target_type
target_id

result

created_at
```

Optional sanitized metadata is acceptable.

Never log:

```text
OAuth tokens
bearer tokens
raw consent tokens
webhook secrets
API keys
```

The audit log should answer:

- which actor invoked an operation
- which MCP server was used
- which tool ran
- what record changed
- whether it succeeded
- when it occurred

---

# High-Risk Operations

Treat these as high-risk:

```text
newsletter.send
newsletter.delete
consent.revoke
source.delete
```

Require explicit target inputs.

Where useful, require:

```text
confirm: true
```

Audit all high-risk operations.

---

# Failure Behaviour

One failed source must not terminate an aggregation batch.

Example:

```text
source A → success
source B → failed
source C → success
```

Record source failures individually.

Implement retry/backoff where sensible.

Other isolation rules:

- Slack failure must not delete news candidates.
- Discord failure must not remove delivery eligibility.
- Mailchimp failure must not change consent state.
- AI provider failure must not corrupt source records.
- MCP request failure must not leave partial writes where a transaction is required.

---

# Logging & Observability

Structured application logs should include:

```text
operation
actor
source
record IDs
duration
result
```

Aggregation runs should additionally report:

```text
sources checked
successful sources
failed sources
items discovered
duplicates removed
candidates created
candidates resurfaced
```

Never log secrets or raw consent URLs.
