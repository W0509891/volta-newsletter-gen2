# 04 — Submission Intake

## Goal

A fast way for a curator to log a story the moment they hear about it (in a
hallway chat, on Slack, on LinkedIn) — this replaces RSS/scraping as the
primary ingestion path, because sourcing here is relationship-driven, not
feed-driven.

## Depends on

`01-data-model.md`, `02-admin-curation.md`.

## Out of scope

No public-facing submission form for founders in v1 — Matt and Bader both
described this as curator-mediated, not self-serve. Don't build founder
self-submission yet; revisit only if the curators ask for it.

## What to build

A stripped-down version of `/admin/items/new` optimized for speed, not
completeness — a curator logging a story mid-conversation shouldn't have to
fill in every field:

- Required: `title`, one-line `summary`, `category`.
- Optional at capture time, fillable later from the detail view: `url`,
  `subjectContact` email, `event` link.
- On submit: create with `status = DRAFT`, `sourceType = SUBMISSION`,
  `createdBy` = the logged-in curator.
- Redirect to the item's detail page after save so they can immediately hit
  "Request consent" if it's fresh in their head.

## Optional but cheap: quick-capture affordance

If time allows, add a keyboard-shortcut-triggered modal (e.g. `Cmd+K` style)
available from anywhere in `/admin` so a curator doesn't have to navigate
away from what they're doing. Not required for v1 — build the plain page
first, add this only if the plain page proves too slow in practice.

## Tasks

1. Build `/admin/items/quick` as a 3-field form (title, summary, category).
2. Server action creates the ContentItem and redirects to
   `/admin/items/[id]`.
3. (Optional) global quick-capture modal per above.

## Acceptance criteria

- A curator can go from "hears a story" to a saved DRAFT ContentItem in
  under 3 fields / one screen.
