# Actors, MCP Servers & Skills

## Actors

Generation 3 has two agent identities.

| Actor | Role | Access |
|---|---|---|
| `@volta` | Trusted internal Volta operator | Full CRUD+ |
| `@founder` | External founder/company submitter | Append-only |

---

# @volta

`@volta` represents an authenticated trusted Volta operator.

It may manage:

- content
- revisions
- submissions
- consent
- newsletters
- backlog
- news candidates
- monitoring sources
- delivery
- analytics
- Mailchimp actions

Full access does **not** remove application rules.

Example: `@volta` still should not accidentally send a newsletter containing content whose current revision requires consent but is not approved.

---

# @founder

`@founder` is anonymous and unverified in the MVP.

It may submit potential newsletter content.

It may **not**:

- list newsletter content
- search newsletter content
- retrieve submissions
- modify submissions
- delete submissions
- read consent records
- access contacts
- read news candidates
- access analytics
- access newsletter drafts

Founder access is append-only.

A submission may return:

```json
{
  "submissionId": "...",
  "receivedAt": "...",
  "status": "RECEIVED"
}
```

The returned ID is a receipt only and must not authorize later reads.

---

# MCP Server Structure

Use two independently configured MCP servers.

```text
mcp/
├── shared/
│   ├── context.ts
│   ├── errors.ts
│   ├── schemas.ts
│   ├── audit.ts
│   └── responses.ts
│
├── volta/
│   ├── server.ts
│   ├── tools/
│   ├── resources/
│   └── prompts/
│
└── founder/
    ├── server.ts
    ├── tools/
    ├── resources/
    └── prompts/
```

Suggested endpoints:

```text
/mcp/volta
/mcp/founder
```

Use Streamable HTTP for remote MCP transport.

---

# @volta Tool Surface

Recommended initial tools:

```text
content.search
content.get
content.create
content.create_revision
content.change_status
content.move_to_backlog
content.restore_from_backlog

submission.list
submission.get
submission.promote
submission.reject

consent.create_request
consent.get_status
consent.revoke

newsletter.list
newsletter.get
newsletter.create
newsletter.update
newsletter.delete
newsletter.add_item
newsletter.remove_item
newsletter.reorder_item
newsletter.render
newsletter.send_test
newsletter.sync_mailchimp
newsletter.schedule
newsletter.send

news.list
news.search
news.get
news.promote
news.dismiss
news.save
news.resurface

source.list
source.get
source.add
source.update
source.disable
source.enable
source.check_now

delivery.build_digest
delivery.send_slack
delivery.send_discord

analytics.get_newsletter_report
analytics.get_item_report
```

Avoid generic tools such as:

```text
execute_sql
run_command
update_any_record
call_api
```

---

# @founder Tool Surface

Keep founder MCP intentionally small.

Primary tool:

```text
submission.create
```

Suggested submission categories:

```text
FEATURED
STORIES
EVENTS
WINS
OPPORTUNITIES
COMMUNITY
OTHER
```

Example input model:

```ts
interface FounderSubmissionInput {
  type: SubmissionType;

  title?: string;
  summary?: string;
  body?: string;

  companyName?: string;
  founderName?: string;

  contactName?: string;
  contactEmail?: string;

  sourceUrls?: string[];
  mediaUrls?: string[];

  event?: {
    name?: string;
    startAt?: string;
    endAt?: string;
    location?: string;
    registrationUrl?: string;
  };

  notes?: string;
}
```

Store:

```text
identity_status = UNVERIFIED
submitted_via = FOUNDER_MCP
```

---

# Skills / MCP Prompts

Skills are discoverable workflows, not permissions.

Expose a catalog such as:

```text
skills://catalog
skills://{skill-id}
```

Suggested model:

```ts
interface AgentSkill {
  id: string;
  name: string;
  description: string;
  actor: "VOLTA" | "FOUNDER";
  requiredTools: string[];
  optionalTools?: string[];
  instructions: string;
}
```

## @volta Skills

```text
daily-news-review
research-volta-ecosystem
prepare-founder-story
prepare-company-win
prepare-event
request-founder-consent
review-consent-status
assemble-newsletter
review-newsletter
send-test-newsletter
review-backlog
```

## @founder Skills

```text
submit-founder-update
submit-company-win
submit-event
submit-opportunity
```

Skills must never grant tools that the connected actor does not already have permission to call.
