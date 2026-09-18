# 07 — Funnel Analytics

## Goal

Answer Matt's actual question: does the newsletter drive event attendance,
and which content types earn it. Pull Mailchimp click data and join it
against event attendance.

## Depends on

`05-mailchimp-integration.md`, `06-link-tracking.md`.

## ⚠️ Blocked on a human decision — do not guess

Volta's event/ticketing data source was not identified in discovery (Matt
referenced "our system" for visual headcounts and ticket segmentation
without naming the tool). **Stop and ask the human which system this is**
(Luma? Eventbrite? something internal?) before building the attendance-side
integration. Everything below the line is safe to build without that answer;
the attendance join is not.

---

## What's safe to build now (Mailchimp side only)

1. `lib/mailchimp-reports.ts` — after a campaign has been sent ~1 week
   (matches Bader's existing habit of checking back a week later), pull:
   - `reports.getCampaignReport(campaignId)` — opens, unique opens, clicks.
   - `reports.getCampaignClickDetails(campaignId)` — per-link click counts.
2. Write those click counts back onto the matching `TrackedLink.clicks` by
   matching on the tagged URL.
3. Build `/admin/newsletters/[id]/report` showing, per ContentItem: open
   rate (newsletter-level, not per-item — Mailchimp doesn't give per-item
   opens), and click count per `TrackedLink`. This alone replaces Bader's
   manual "go back into Mailchimp and eyeball the analytics" step.

## What's blocked pending the event-system answer

- Join `TrackedLink` clicks (or, better, actual event registrations if the
  ticketing tool exposes them) against `Event` attendance to answer "did
  people who clicked from the newsletter actually show up."
- Cross-reference Mailchimp audience members against event attendee lists
  to answer Matt's "are people on the mailing list also coming to events"
  question — this needs attendee emails from the ticketing system, matched
  against the Mailchimp list via `Contact.email`.

Once the tool is known, this step needs its own fetch/sync job (webhook if
the tool supports one, polling if not) writing into a
`EventAttendance(eventId, contactEmail, registeredAt, attendedAt)` table —
not yet in the step-01 schema on purpose, since the shape depends on what
that system returns.

## Acceptance criteria (for the unblocked portion)

- The report page shows real open/click numbers pulled from Mailchimp for
  any sent newsletter, matched back to the ContentItems that earned them.
