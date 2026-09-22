# Volta News Aggregation

## Goal

Monitor Volta-related sources and bring potentially relevant developments to the curator's attention.

Discovered news must **not** automatically become newsletter content.

---

# Pipeline

```text
SOURCE
   ↓
DISCOVERY
   ↓
NORMALIZATION
   ↓
DEDUPLICATION
   ↓
ENTITY MATCHING
   ↓
RELEVANCE CLASSIFICATION
   ↓
NEWS CANDIDATE
   ↓
CURATOR ATTENTION
   ↓
PROMOTE / SAVE / DISMISS
```

Promotion is the boundary between news intelligence and editorial content.

---

# News Sources

Add:

```text
news_sources
```

Suggested fields:

```text
id
name
type

url

entity_id NULL

enabled

polling_interval_minutes
priority

last_checked_at
last_success_at
last_error_at
last_error

created_by
created_at
updated_at
```

Source types:

```text
RSS
WEBSITE
LINKEDIN_PAGE
LINKEDIN_PROFILE
MANUAL
API
```

Sources must be dynamically configurable.

Adding a new monitored founder/company should not require a new deployment.

---

# Adapter Interface

Use interchangeable adapters.

```ts
interface NewsSourceAdapter {
  supports(source: NewsSource): boolean;
  fetch(source: NewsSource): Promise<DiscoveredNewsItem[]>;
}
```

Suggested structure:

```text
lib/news/
├── adapters/
│   ├── rss.ts
│   ├── website.ts
│   ├── linkedin.ts
│   ├── manual.ts
│   └── api.ts
├── normalize.ts
├── dedupe.ts
├── relevance.ts
├── entities.ts
└── aggregator.ts
```

LinkedIn must be treated as an adapter, not a special core dependency.

If direct retrieval is unavailable, report the source error rather than tightly coupling the system to brittle scraping assumptions.

---

# News Candidates

Add:

```text
news_candidates
```

Suggested fields:

```text
id

source_id

canonical_url
original_url

author
title

raw_excerpt
raw_content NULL

published_at
discovered_at

content_hash

ai_summary
ai_relevance_reason
ai_confidence

source_ownership
status

first_surfaced_at
last_surfaced_at

promoted_content_item_id NULL

created_at
updated_at
```

Ownership:

```text
VOLTA
THIRD_PARTY
UNKNOWN
```

Statuses:

```text
NEW
SURFACED
SAVED
DISMISSED
PROMOTED
```

---

# Facts vs AI Interpretation

Always keep source material and AI output separately.

Store:

```text
source facts
```

separately from:

```text
AI summary
AI relevance reasoning
AI confidence
```

The curator must always be able to determine:

- where the story came from
- what the source actually said
- why the AI considered it relevant

---

# Deduplication

The same story may appear on:

```text
company website
RSS
founder LinkedIn
Volta LinkedIn
```

Deduplicate using:

- canonical URL
- normalized URL
- content hash
- title similarity
- publication timestamps

Prefer one news candidate with multiple source/discovery references over duplicate curator cards.

---

# Ecosystem Entities

Do not define relevance solely by searching for "Volta".

Suggested entity types:

```text
VOLTA
COMPANY
FOUNDER
EMPLOYEE
PROGRAM
PARTNER
ALUMNI
EVENT
```

Example relationships:

```text
FOUNDER → FOUNDED → COMPANY
PERSON → WORKS_AT → COMPANY
COMPANY → PARTICIPATED_IN → PROGRAM
PROGRAM → OPERATED_BY → VOLTA
COMPANY → MEMBER_OF → VOLTA_ECOSYSTEM
```

Reuse existing contacts where possible rather than duplicating people.

---

# Unknown Entities

AI may encounter an unknown founder/company.

AI may:

```text
suggest entity
suggest founder relationship
suggest company relationship
```

AI must not automatically promote a suggested entity to trusted ecosystem data.

Require curator review.

---

# Relevance Classification

Possible classification dimensions:

```text
matched entities
relationship to Volta
news category
relevance
novelty
urgency
newsletter potential
```

AI scoring is advisory.

High relevance must not automatically promote news into `content_items`.

---

# Editorial Promotion

Third-party flow:

```text
news candidate
     ↓
surface to @volta
     ↓
curator chooses PROMOTE
     ↓
create content_item
     ↓
create revision
     ↓
contact stakeholder
     ↓
consent preview if required
```

Volta-owned flow:

```text
news candidate
     ↓
surface to @volta
     ↓
curator chooses PROMOTE
     ↓
create content_item
     ↓
create revision
     ↓
evaluate consent requirement
```

Volta-owned source skips original-publisher outreach, but founder/company-specific newsletter copy may still require consent.
