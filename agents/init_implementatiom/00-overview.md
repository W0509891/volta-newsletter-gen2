# Volta Newsletter Tool — Build Overview

Read this first. Then execute `01` through `08` in order — each depends on
the schema/routes the previous one adds. Don't skip ahead.

## What this is

An internal tool for Volta staff (Bader, Laura, Amy) to curate stories and
events into a monthly-ish newsletter, track consent per story, and send via
Mailchimp. It replaces "copy last month's template and hand-edit it."

## What this is NOT (do not build these)

- No RSS feed ingestion.
- No web scraping of external pages.
- No custom contact/CRM system — Mailchimp remains the subscriber source of
  truth. We only store the minimum contact data needed to cross-reference
  Mailchimp clicks against event attendance.
- No automated/cron-driven sending. Sends are manually triggered by a
  curator once content is ready.
- No meeting-transcript ingestion. The schema reserves a `sourceType` value
  for it, but no ingestion pipeline is built.

## Stack

- Next.js (App Router), TypeScript
- Prisma + Postgres
- Pug for email templates, `juice` for CSS inlining
- `@mailchimp/mailchimp_marketing`
- Zod for all input validation

## Users

Single internal role for v1: **curator** (Bader/Laura/Amy). No public-facing
accounts. Auth can be a simple shared-password or magic-link gate — do not
over-build this; it's 2-3 internal users.

## File map (what each build file produces)

| File | Produces |
|---|---|
| `01-data-model.md` | Prisma schema: ContentItem, Contact, Event, TrackedLink, SendLog |
| `02-admin-curation.md` | Curator UI: list/filter/edit ContentItems, consent workflow |
| `03-template-pipeline.md` | Pug templates + juice → email-ready HTML |
| `04-submission-intake.md` | Internal quick-capture form for logging a story |
| `05-mailchimp-integration.md` | Sync + send via Mailchimp API |
| `06-link-tracking.md` | UTM tagging on outbound links |
| `07-funnel-analytics.md` | Pull Mailchimp click reports, join to event attendance |
| `08-backlog-reminders.md` | "Revisit next month" queue view |

## Open questions to raise with the human before `07`

`07-funnel-analytics.md` depends on knowing Volta's event/ticketing data
source (mentioned in discovery but not confirmed which system). Flag this
explicitly rather than guessing at an integration.
