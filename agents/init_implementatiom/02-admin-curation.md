# 02 — Admin Curation UI

## Goal

Give a curator a screen to see all ContentItems, move them through the
status machine, and record consent — replacing Bader's mental checklist.

## Depends on

`01-data-model.md`.

## Out of scope

No public-facing pages. No rich WYSIWYG editor — plain textareas are fine.

## Routes

- `/admin` — list view, filterable by `status` and `category`, sorted by
  `createdAt` desc. Default filter: hide `PUBLISHED`.
- `/admin/items/[id]` — detail/edit view for one ContentItem.
- `/admin/items/new` — manual entry form (category, title, summary, url,
  subject contact email, event link if applicable).

## Status machine (enforce in a server action, not just the UI)

```
DRAFT ──────────────► PENDING_CONSENT ──► APPROVED ──► PUBLISHED
  │                         │
  └────────► BACKLOG ◄──────┘   (set revisitAt when moving here)
```

Rules to enforce server-side:
- Can't move to `APPROVED` unless `consentGrantedAt` is set OR the item has
  no `subjectContactId` (e.g. an Event or Program Launch item with no named
  individual doesn't need consent).
- Moving to `BACKLOG` requires `revisitAt` to be set.
- Moving to `PUBLISHED` requires the item to belong to a `Newsletter`.

## UI on the detail page

- Status badge + action buttons matching the legal transitions above (don't
  render a transition button that's currently invalid).
- A "Request consent" button that sets `consentAskedAt = now()` and flips
  status to `PENDING_CONSENT` — this is a manual log action, not an actual
  outbound email in v1 (Bader asks in person/Slack today; don't automate
  that conversation).
- A "Mark consent granted" checkbox that sets `consentGrantedAt`.
- `revisitAt` date picker, only shown/editable when status is `BACKLOG`.

## Tasks

1. Build the list view with server-side filtering via search params
   (`?status=DRAFT&category=FOUNDER_STORY`).
2. Build the detail view with the status machine actions as server actions
   (`app/admin/items/[id]/actions.ts`), each validated with Zod before
   touching Prisma.
3. Build the manual entry form (`/admin/items/new`) — on submit, look up or
   create the `Contact` by email if provided.
4. Add a minimal top-level auth gate (shared password via cookie, or
   middleware checking a hardcoded allowlist of emails) — don't build a
   full auth system for 3 users.

## Acceptance criteria

- A curator can create a founder story, request consent, mark it granted,
  approve it, and see it disappear from the default (non-published-hidden)
  filtered list once published.
- Attempting an illegal status transition (e.g. approving without consent
  when a subject contact is set) is rejected server-side, not just hidden
  in the UI.
