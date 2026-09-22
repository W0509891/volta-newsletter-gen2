# 05 — Mailchimp Integration

## Goal

Push a rendered Newsletter into Mailchimp as a campaign and send it.
Mailchimp stays the subscriber source of truth — do not build a competing
subscriber/list system.

## Depends on

`03-template-pipeline.md`.

## Out of scope

No automatic/scheduled sending. No subscriber signup form in this repo
(Volta's existing site form already feeds Mailchimp directly — leave it).

## Setup

```
npm install @mailchimp/mailchimp_marketing
```

Env vars: `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_LIST_ID`.

## Tasks

1. `lib/mailchimp.ts` — configured client singleton.
2. Server action `createCampaign(newsletterId)`:
   - Render HTML via `renderNewsletter` from step 03.
   - `mailchimp.campaigns.create({ type: 'regular', recipients: { list_id }, settings: { subject_line, from_name, reply_to } })`.
   - `mailchimp.campaigns.setContent(campaignId, { html })`.
   - Store `mailchimpCampaignId` on the `Newsletter` row.
3. Server action `sendCampaign(newsletterId)`:
   - Guard: only allowed if `newsletter.status === 'draft'` and a
     `mailchimpCampaignId` already exists (i.e. `createCampaign` ran first).
   - `mailchimp.campaigns.send(campaignId)`.
   - Update `newsletter.status = 'sent'`, `sentAt = now()`.
   - Write a `SendLog` row.
   - Mark every linked `ContentItem.status = PUBLISHED`.
4. UI: on `/admin/newsletters/[id]`, two buttons — "Push to Mailchimp"
   (calls `createCampaign`) and "Send" (calls `sendCampaign`, only enabled
   after the first succeeds). Add a confirmation dialog before `sendCampaign`
   — this is irreversible.

## Acceptance criteria

- A draft Newsletter can be pushed to Mailchimp and previewed inside
  Mailchimp's own UI before sending (curators should get a chance to
  double-check in Mailchimp itself, matching how Bader already trusts that
  tool).
- Sending updates local `Newsletter` and `ContentItem` statuses correctly.
- Re-clicking "Send" after a successful send is impossible (button
  disabled / guarded server-side).
