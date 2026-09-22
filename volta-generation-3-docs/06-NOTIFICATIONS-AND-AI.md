# AI, Digests, Slack & Discord

## News Consumption Modes

Support three ways to consume aggregated news.

### Digest

Scheduled summary:

```text
"Here are the relevant Volta ecosystem developments discovered in the last 24 hours."
```

### Alert

Used for sufficiently important or urgent candidates.

Do not enable aggressive alerting by default.

### Query

Interactive request through `@volta`, for example:

```text
"What happened with Volta companies this week?"
```

---

# Notification Architecture

Slack and Discord are delivery adapters only.

```text
NewsCandidateService
        ↓
NewsDigestService
        ↓
NotificationService
      ↙     ↘
 Slack     Discord
```

Do not place aggregation logic inside Slack or Discord implementations.

Suggested structure:

```text
lib/notifications/
├── notification-service.ts
├── slack.ts
└── discord.ts
```

MVP environment values may include:

```text
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```

Never commit secrets.

---

# Delivery Tracking

Add:

```text
news_delivery_records
```

Suggested fields:

```text
id
candidate_id
channel
delivery_type
delivered_at
delivery_reference
```

Channels:

```text
SLACK
DISCORD
```

Delivery types:

```text
DIGEST
ALERT
MANUAL
```

Track separately:

```text
discovered
surfaced
delivered
triaged
promoted
```

This prevents morning digests from repeatedly announcing the same content unintentionally.

---

# Scheduling

Aggregation and digests must support both scheduled and manual execution.

Expose domain operations such as:

```text
runAggregation()
runSource(sourceId)
buildDigest(window)
sendDigest(channel)
```

Scheduled workers and MCP tools must call the same functions.

Do not create separate MCP aggregation logic.

Morning digest time should be configurable.

---

# AI Provider Abstraction

The system should not require one LLM vendor.

Most interactive intelligence may come from Claude or another MCP client.

If background classification/summarization needs a model, hide it behind an interface:

```ts
interface AiProvider {
  summarize(...): Promise<...>;
  classifyRelevance(...): Promise<...>;
  extractEntities(...): Promise<...>;
}
```

Potential future providers:

```text
Anthropic
OpenAI
other provider
```

If no background AI provider is configured:

- source polling should still work
- deterministic deduplication should still work
- deterministic entity matching should still work

AI enhancement should degrade gracefully.

---

# AI Boundaries

AI may:

```text
discover
classify
summarize
draft
recommend
assemble candidate editions
```

AI may not:

```text
fabricate consent
approve its own draft
silently modify approved content
auto-promote third-party news
publish founder-specific unapproved content
```

Human curation remains authoritative.

---

# Recommended @volta AI Flows

## Daily News Review

```text
daily-news-review
```

1. Query new candidates.
2. Group by entity/category.
3. Explain relevance.
4. Highlight duplicates and high-interest stories.
5. Let curator choose promote/save/dismiss.

## Prepare Founder Story

```text
prepare-founder-story
```

1. Load source material.
2. Draft proposed newsletter copy.
3. Preserve provenance.
4. Create content revision.
5. Evaluate consent.
6. Create consent preview when required.

## Assemble Newsletter

```text
assemble-newsletter
```

1. Search eligible content.
2. Suggest section placement.
3. Create/update edition.
4. Add content.
5. Render preview.
6. Run eligibility checks.
7. Send test only after eligibility passes.
