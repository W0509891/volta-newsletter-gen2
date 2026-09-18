# 03 — Template Pipeline (Pug + juice)

## Goal

Turn a Newsletter's approved ContentItems into email-safe HTML, replacing
"duplicate last month's template by hand."

## Depends on

`01-data-model.md`, `02-admin-curation.md` (need APPROVED items to render).

## Out of scope

No drag-and-drop template editor. Section order is fixed, per Bader's
existing structure — do not build a dynamic block-composer.

## Fixed section order (do not make this configurable in v1)

1. Founder highlight (top `FOUNDER_STORY` item — the one that sets the
   newsletter's tone, per Bader's process)
2. Events (all `EVENT` items linked to this Newsletter)
3. Program updates / other (`PROGRAM_LAUNCH`, `HACKATHON`, `AI_LAB`, `OTHER`)

## File layout

```
templates/
  base-layout.pug        # table-based layout, inline-safe structure
  sections/
    founder-highlight.pug
    events.pug
    program-updates.pug
  weekly.pug              # composes the sections above (name is historical —
                           # cadence is content-driven, not weekly)
```

## Tasks

1. Write `base-layout.pug` using table-based layout (not flexbox/grid —
   Outlook needs table layout). Extract shared header/footer (Volta logo,
   unsubscribe footer placeholder — Mailchimp injects the real unsubscribe
   merge tag at send time, so leave `*|UNSUB|*` literally in the Pug output).
2. Write each section partial, taking a typed props object matching the
   `ContentItem` shape (don't pass raw Prisma models into templates — map to
   a plain view-model first so template changes don't silently break on
   schema changes).
3. Write a render function:

```ts
// lib/render-newsletter.ts
import pug from 'pug';
import juice from 'juice';

export function renderNewsletter(newsletter: NewsletterViewModel): string {
  const html = pug.renderFile('templates/weekly.pug', { newsletter });
  return juice(html, { removeStyleTags: true });
}
```

4. Add a `/admin/newsletters/[id]/preview` route that renders the output
   inline in an iframe so a curator can eyeball it before sending.
5. Manually test the rendered HTML in at least Gmail web + Outlook desktop
   (or Litmus/Email on Acid if available) before wiring into step 05 — email
   client CSS support is inconsistent enough that this can't be skipped.

## Acceptance criteria

- Given a Newsletter with items in all three categories, `renderNewsletter`
  produces a single self-contained HTML string with inlined CSS and no
  `<style>` blocks.
- The preview route renders it without hitting Mailchimp.
