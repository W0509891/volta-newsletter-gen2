# 06 — Link Tracking (UTM tagging)

## Goal

Tag every outbound link in a newsletter so clicks can later be attributed
back to a specific ContentItem and, where relevant, a specific Event. This
is the prerequisite for `07-funnel-analytics.md` — Matt's core ask.

## Depends on

`01-data-model.md`. Can be built in parallel with `03`/`05`, but must land
before `07`.

## Tasks

1. Helper to build a `TrackedLink` + tagged URL whenever a ContentItem with
   a `url` is attached to a Newsletter:

```ts
// lib/tracked-links.ts
export function buildTrackedUrl(baseUrl: string, campaign: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', 'newsletter');
  url.searchParams.set('utm_medium', 'email');
  url.searchParams.set('utm_campaign', campaign); // e.g. newsletter slug + send date
  return url.toString();
}
```

2. When a Newsletter is created (or items are attached to it), generate a
   `TrackedLink` row per ContentItem with a `url`, using the Newsletter's
   slug/date as `utmCampaign`. Store the tagged URL, not the bare one.
3. Update the Pug section partials (step 03) to render `trackedLink.destinationUrl`
   instead of the raw `ContentItem.url`.
4. If a ContentItem is linked to an `Event`, also set `TrackedLink` →
   `contentItem.eventId` implicitly available via the relation — no extra
   field needed, it's already on `ContentItem`.

## Acceptance criteria

- Every link in a sent newsletter's HTML carries `utm_source`, `utm_medium`,
  `utm_campaign` params.
- Each `TrackedLink` row is traceable back to its `ContentItem` and (if
  applicable) `Event`.
