# 08 — Backlog / Revisit Queue

## Goal

Surface ContentItems parked in `BACKLOG` (Bader's "keep notes and revisit
next month" habit) so they don't get silently forgotten.

## Depends on

`02-admin-curation.md`.

## Tasks

1. `/admin/backlog` — list all `status = BACKLOG` items sorted by
   `revisitAt` ascending, with overdue ones (revisitAt in the past)
   visually flagged.
2. On `/admin` (the main list from step 02), add a small badge/count of
   overdue backlog items so it's visible without navigating away — this is
   the low-effort version of a reminder system. Don't build email/Slack
   notifications for v1 — a visible badge is enough for a 3-person team
   checking the tool monthly.
3. From `/admin/backlog`, allow moving an item straight back to
   `PENDING_CONSENT` or `DRAFT` (whichever fits) in one action, so revisiting
   doesn't require re-navigating to the detail page.

## Acceptance criteria

- An item moved to `BACKLOG` with a past `revisitAt` shows up flagged on
  both `/admin/backlog` and as a count badge on `/admin`.
