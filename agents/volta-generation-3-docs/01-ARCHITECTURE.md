# Volta Builders Dispatch — Generation 3 Architecture

## Purpose

Extend the existing Generation 2 newsletter application with:

- MCP-driven AI access
- founder submissions
- revision-level consent
- news aggregation
- Slack/Discord resurfacing
- reusable MCP skills/prompts

Generation 3 must extend the current application rather than replace it.

## Core Principle

All interfaces must use the same domain services.

```text
Web UI ──────────────┐
                     │
@volta MCP ──────────┤
                     ↓
               Domain Services
                     ↓
@founder MCP ────────┤
                     │
Scheduled Workers ───┤
                     ↓
               Repository Layer
                     ↓
                 PostgreSQL
```

Do **not** implement MCP handlers that directly contain business rules or raw SQL.

Bad:

```text
MCP Tool → Raw SQL
```

Preferred:

```text
MCP Tool → Domain Service → Repository → PostgreSQL
```

## Existing Generation 2 Workflow

Preserve the existing lifecycle:

```text
Intake
  ↓
INBOX
  ↓
DRAFT
  ↓
PENDING_CONSENT
  ↓
APPROVED
  ↓
Newsletter Assembly
  ↓
Pug Rendering
  ↓
Juice CSS Inlining
  ↓
Mailchimp
```

Existing functionality that must continue to work:

- newsletter item management
- backlog and revisit dates
- Pug templates
- Juice email CSS inlining
- Mailchimp sync and sending
- tracked links
- analytics
- consent records

## Recommended Domain Service Layer

Create or extract reusable services:

```text
lib/services/
├── content-service.ts
├── revision-service.ts
├── submission-service.ts
├── consent-service.ts
├── publication-eligibility-service.ts
├── newsletter-service.ts
├── news-service.ts
├── source-service.ts
├── aggregation-service.ts
├── digest-service.ts
└── notification-service.ts
```

Server Actions, MCP tools, scheduled jobs and APIs should all call these services.

## Suggested Project Evolution

```text
app/
├── admin/
├── api/
├── consent/
│   └── [token]/
└── submit/

components/
├── admin/
├── consent/
└── public/

lib/
├── db/
├── services/
├── news/
├── notifications/
├── ai/
├── security/
└── types/

mcp/
├── shared/
├── volta/
└── founder/

workers/
├── aggregate-news.ts
└── send-news-digest.ts

templates/
scripts/
```

## Non-Negotiable Architecture Rules

1. MCP is an interface, not the business layer.
2. The existing web application remains supported.
3. Domain rules must not differ between dashboard and MCP.
4. AI cannot directly bypass consent.
5. News discovery and editorial content remain separate domains.
6. Publication eligibility must be checked server-side.
7. Existing Generation 2 data should be migrated incrementally rather than replaced.
