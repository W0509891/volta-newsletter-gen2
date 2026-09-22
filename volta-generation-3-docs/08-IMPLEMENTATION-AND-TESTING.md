# Implementation Order & Testing

## Agent Execution Rule

Before changing code:

```text
inspect existing schema
inspect typed DB queries
inspect Server Actions
inspect consent implementation
inspect newsletter rendering
inspect Mailchimp wrapper
run current tests/build
```

Do not start by generating a large MCP tool catalog.

First make the existing application logic reusable safely.

---

# Phase 0 — Baseline

Verify Generation 2.

Confirm:

- current build passes
- newsletter creation works
- Pug rendering works
- Juice inlining works
- Mailchimp mock mode works
- consent flow works
- backlog works

**Exit condition:** current application behaviour is documented and reproducible.

---

# Phase 1 — Domain Service Extraction

Extract reusable business services from Server Actions/query logic.

Target:

```text
Web UI → Server Action → Domain Service
MCP    → MCP Tool      → Domain Service
Worker → Job           → Domain Service
```

**Exit condition:** web application still behaves identically while domain rules can be reused.

---

# Phase 2 — Revisions & Consent

Implement:

```text
content_revisions
consent_requests
secure preview links
revision-specific approval
publication eligibility
```

Migrate existing content to baseline revisions.

**Exit condition:** editing approved content creates a new revision that requires new approval where applicable.

---

# Phase 3 — Founder MCP

Implement:

```text
founder_submissions
@founder MCP
submission.create
founder skills
rate limits
validation
```

**Exit condition:** an external agent can append a founder submission but cannot read newsletter data.

---

# Phase 4 — Volta MCP

Implement authenticated `@volta`.

Expose:

```text
content
revisions
consent
submissions
newsletters
backlog
skills
```

**Exit condition:** an authorized MCP client can perform normal curator operations through shared services.

---

# Phase 5 — News Aggregation

Implement:

```text
news_sources
source adapters
normalization
deduplication
entity matching
AI classification abstraction
news_candidates
```

**Exit condition:** configured sources produce reviewable candidates without creating newsletter items automatically.

---

# Phase 6 — News MCP

Expose:

```text
news.search
news.get
news.promote
news.save
news.dismiss
source management
source.check_now
```

**Exit condition:** `@volta` can run the news intelligence workflow through MCP.

---

# Phase 7 — Slack / Discord

Implement:

```text
digest service
notification service
Slack adapter
Discord adapter
delivery tracking
scheduled digest
manual delivery
```

**Exit condition:** news can be surfaced without uncontrolled duplicate delivery.

---

# Phase 8 — Hardening

Add:

```text
audit logging
abuse tests
consent bypass tests
rate limits
secret validation
end-to-end newsletter tests
```

**Exit condition:** MCP does not weaken Generation 2 publication or consent safeguards.

---

# Critical Tests

| Scenario | Expected Result |
|---|---|
| Founder submits content | New unverified append-only submission |
| Founder attempts content listing | Capability does not exist |
| Founder tries arbitrary ID retrieval | Unsupported |
| Submission promoted | New content item + Revision 1 |
| Revision 1 approved | Revision 1 eligible |
| Revision 2 created | Revision 1 approval preserved; Revision 2 requires approval |
| Consent link opened | Exact requested revision shown |
| Expired consent token | Approval rejected |
| Consent revoked | Publication blocked |
| Volta institutional event | May be no-consent-required |
| Volta-owned founder story | Stakeholder consent still required |
| Third-party story discovered | News candidate only |
| High AI relevance | No automatic promotion |
| Duplicate RSS/web article | One candidate |
| Broken source | Other sources continue |
| Newsletter contains unapproved revision | Send blocked |
| Fully eligible newsletter | Existing rendering/send pipeline succeeds |

Also test MCP authorization separately from domain rules.

---

# End-to-End Founder Flow

```text
Founder asks agent:
"Submit our seed-round announcement to Volta."

        ↓

@founder MCP

        ↓

submission.create

        ↓

RECEIVED / UNVERIFIED

        ↓

receipt
```

No read access is granted.

---

# End-to-End Curator Submission Flow

```text
@volta:
"Show me new founder submissions."

        ↓

Review

        ↓

"Turn Acme into a draft."

        ↓

content item
Revision 1

        ↓

edit

        ↓

Revision 2

        ↓

"Create approval link."

        ↓

Founder sees exact Revision 2

        ↓

APPROVED

        ↓

Revision 2 becomes eligible
```

---

# End-to-End News Flow

```text
scheduler
   ↓
RSS / websites / LinkedIn adapters
   ↓
normalize
   ↓
dedupe
   ↓
entity matching
   ↓
AI relevance
   ↓
news_candidates
   ↓
Slack/Discord digest
```

Curator:

```text
"What relevant ecosystem news came in today?"

   ↓

news.search

   ↓

"Promote the Acme story."

   ↓

content item
   ↓
revision
   ↓
consent evaluation
```

---

# End-to-End Newsletter Flow

```text
@volta:
"Prepare the October newsletter."

        ↓

query eligible content
        ↓
assemble edition
        ↓
render Pug
        ↓
inline Juice CSS
        ↓
preview
        ↓
publication eligibility check
        ↓
Mailchimp test
        ↓
final send
```

---

# Definition of Done

Generation 3 is done when:

1. Existing Generation 2 functionality still works.
2. `@founder` can append submissions and cannot read internal data.
3. `@volta` can operate the main newsletter workflow through MCP.
4. Content revisions are immutable.
5. Consent is revision-specific.
6. Preview approval links show the exact revision being approved.
7. Editing approved copy invalidates current publication eligibility when new consent is required.
8. Third-party news cannot auto-enter a newsletter.
9. Dynamic sources can be added without deployment.
10. Slack/Discord digests work with delivery tracking.
11. MCP, dashboard and workers share domain services.
12. Final newsletter sending is blocked when required consent is missing.
13. Audit logging exists for important agent actions.
