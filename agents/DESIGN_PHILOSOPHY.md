# Volta Newsletter Platform — Design Philosophy

**Document:** `DESIGN_PHILOSOPHY.md`  
**Applies to:** React dashboard, Pug email templates, preview experience, exported newsletter HTML, shared visual assets  
**Purpose:** Give designers and implementation agents a single design direction for building a newsletter product that feels consistent with Volta without confusing product-design recommendations with official brand standards.

---

## 1. Design North Star

The Volta newsletter platform should feel like a **tool for builders**.

It should be:

- clear rather than decorative
- energetic rather than loud
- technical rather than sterile
- confident rather than corporate
- human rather than generic
- practical rather than aspirational-only
- measurable rather than vague
- editorial rather than “marketing-template” driven

The platform should make it easy for staff to move from:

> information → judgement → curation → review → publication

with as little friction as possible.

The product should reflect the same attitude visible in Volta’s current public language:

- hands-on practice
- builders and founders
- learning by doing
- iteration
- measurable outcomes
- clear communication
- action over ceremony

The interface should therefore prioritize **clarity, momentum, and evidence** over visual novelty.

---

# 2. Brand Interpretation vs Product Extension

This document deliberately separates two things.

## 2.1 Observed Volta Brand Traits

Current Volta public materials consistently emphasize:

- builders
- founders
- AI applied to real problems
- learning through practice
- measurable outcomes
- iteration
- action
- peer community
- concise, direct communication

The current public site uses short, declarative headlines such as:

- “Where builders get built.”
- “Don’t build in a bubble.”
- “Build skill on problems that matter to you.”
- “Go deeper when you’re ready.”

Volta’s published values include ideas such as:

- Clear is Kind
- We Measure What Matters
- Less Wrong Over Time
- Founders at the Core
- Default to Action
- Quality over Quantity

These ideas should influence both the visual system and the product interaction model.

## 2.2 Product-System Extensions

Some decisions in this document are **recommended UI conventions**, not claims about official Volta brand rules.

Examples include:

- semantic dashboard colors
- category colors
- spacing scales
- component radii
- editor states
- status badge mappings
- email-specific token choices

Treat these as a Volta-compatible product system.

If an official internal Volta brand guide or asset kit conflicts with this document, the official internal guide takes precedence.

---

# 3. Core Design Principles

## 3.1 Clear Is Kind

The interface should tell the user:

- what they are editing
- what state the newsletter is in
- what action is available next
- what changed
- whether changes were saved
- what content came from where
- what will happen when they publish

Avoid interfaces that make the user infer state.

### Prefer

```text
Saved 8 seconds ago
```

over:

```text
✓
```

Prefer:

```text
Approved — ready to publish
```

over a green dot with no text.

Prefer:

```text
3 stories are missing image alt text
```

over:

```text
Validation failed
```

---

## 3.2 Default to Action

Primary actions should be visually obvious.

A user opening a draft should immediately understand the next useful action.

Examples:

```text
Add content
Preview
Send test
Submit for review
Publish
```

Do not give every control equal visual weight.

Every screen should have:

- one clear primary action
- a small number of secondary actions
- destructive actions separated from normal workflow

---

## 3.3 Less Wrong Over Time

The product should support iteration instead of pretending the first version is final.

This means:

- autosave or obvious save feedback
- revision history where practical
- source traceability
- preview before send
- test sends
- review states
- editable summaries
- duplicated issues rather than modifying published issues
- warnings rather than destructive auto-corrections

The design should make changing your mind inexpensive.

---

## 3.4 We Measure What Matters

The product should distinguish useful signals from vanity metrics.

In the dashboard, metrics should be contextual rather than decorative.

Good examples:

- content candidates waiting for review
- newsletters awaiting approval
- upcoming events with no newsletter placement
- missing links or alt text
- published issue count
- click/open metrics only if available and meaningful through the provider

Avoid filling the dashboard with charts merely because data exists.

---

## 3.5 Founders and Builders at the Core

Newsletter content should primarily feel like it is about real people doing real work.

The strongest visual hierarchy should usually go to:

- founder/member stories
- shipped work
- events
- programs
- measurable outcomes
- opportunities to participate

Avoid generic “innovation ecosystem” imagery and vague promotional filler.

---

# 4. Overall Visual Character

The system should combine two modes.

## 4.1 Utility Mode

Used for:

- dashboard navigation
- forms
- content inbox
- issue editor
- tables
- filters
- workflow states

Characteristics:

- restrained
- spacious
- low visual noise
- high readability
- mostly neutral surfaces
- dark text
- limited accent use

## 4.2 Communication Mode

Used for:

- newsletter hero areas
- template previews
- announcements
- empty states
- selected editorial moments
- login/landing experience

Characteristics:

- stronger brand contrast
- dark fields
- bright accent colors
- large type
- real photography
- energetic line/trajectory motifs
- confident negative space

The editor should never feel like a poster.

The newsletter may.

---

# 5. Color Philosophy

## 5.1 Primary Foundation

Use a deep navy / near-black as the core dark surface rather than generic pure black.

Recommended product token:

```scss
$volta-navy: #082231;
```

Use for:

- primary brand surfaces
- top navigation
- email mastheads
- strong footer areas
- high-emphasis text where appropriate

The exact production value should be verified against Volta’s official current asset kit before final release.

---

## 5.2 Electric Accent Family

A Volta-compatible palette can use vivid accents such as:

```scss
$volta-cyan:   #01d9e7;
$volta-blue:   #01a4e7;
$volta-purple: #6100ff;
$volta-yellow: #ffbb0e;
$volta-coral:  #ff7272;
```

These should be used as **accents**, not as equal background colors across the interface.

Think:

```text
80–90% restrained surfaces
10–20% expressive color
```

The platform should not resemble a rainbow dashboard.

---

## 5.3 Product Neutrals

Recommended supporting neutrals:

```scss
$white:         #ffffff;
$surface:       #ffffff;
$surface-soft:  #f5f7f7;
$surface-warm:  #faf9f5;

$text-strong:   #082231;
$text-default:  #263740;
$text-muted:    #65747b;

$border-soft:   #e1e7e9;
$border-strong: #c7d0d4;
```

The warm surface is useful for newsletter previews and editorial contexts.

The cooler soft surface is better for dashboard utility screens.

---

## 5.4 Semantic Colors

Do not force workflow meaning onto brand accents if it hurts usability.

Recommended semantic tokens:

```scss
$success: #237a57;
$warning: #a76f00;
$danger:  #b94a51;
$info:    #166b8f;
```

Semantic colors are product utilities.

They do not need to be official brand colors.

---

# 6. Accent Color Roles

Use accent colors consistently.

Recommended product mapping:

| Accent | Suggested Role |
|---|---|
| Cyan | primary digital accent, active selection, community/builders |
| Purple | AI/program-specific editorial emphasis |
| Yellow | events, dates, time-sensitive attention |
| Coral | member news, announcements, editorial highlight |
| Blue | supporting information, secondary editorial category |

These assignments are configurable product conventions.

Do not imply that they are official Volta program colors unless confirmed internally.

---

# 7. Color Usage Rules

## Do

- use navy as a strong anchor
- use white/off-white generously
- use one dominant accent per section
- use color to improve information scanning
- maintain WCAG contrast
- use semantic colors for state
- test email colors in dark mode

## Do Not

- apply every accent color in every component
- use color alone to communicate status
- put long body copy on saturated accent backgrounds
- use bright gradients everywhere
- use pure black when navy provides stronger brand continuity
- invent a new accent family when the existing palette can do the job

---

# 8. Typography Philosophy

Typography should feel:

- modern
- direct
- compact
- editorial
- highly readable
- confident

The identity should rely more on scale and hierarchy than decorative type.

---

## 8.1 Dashboard Font Stack

Until an official licensed Volta typeface is supplied, use a system-safe modern sans stack.

```scss
$font-ui:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Arial,
  sans-serif;
```

If Volta provides its official font, swap it into the first position.

---

## 8.2 Email Font Stack

Email should prioritize compatibility.

```scss
$font-email:
  Arial,
  Helvetica,
  sans-serif;
```

Do not make the design depend on web-font loading.

---

## 8.3 Type Scale — Dashboard

Recommended scale:

```scss
$font-xs:  0.75rem;   // 12px
$font-sm:  0.875rem;  // 14px
$font-md:  1rem;      // 16px
$font-lg:  1.125rem;  // 18px
$font-xl:  1.375rem;  // 22px
$font-2xl: 1.75rem;   // 28px
$font-3xl: 2.25rem;   // 36px
```

Use restrained sizes for utility UI.

Large display type belongs mainly in:

- dashboard landing moments
- template previews
- email heroes
- major empty states

---

## 8.4 Email Type Scale

Recommended baseline:

```text
Body:            16px
Metadata:        13–14px
Section title:   22–28px
Hero title:      32–44px
CTA:             15–16px
```

Use line-height generously:

```text
Body: 1.5–1.65
Headlines: 1.05–1.2
```

---

# 9. Copy and Voice

The product and newsletter copy should be direct and useful.

## 9.1 Preferred Voice

Prefer:

- concrete over abstract
- active over passive
- short over ceremonial
- specific over “visionary”
- evidence over hype
- outcomes over adjectives
- verbs over buzzwords

### Strong

```text
See what builders shipped this month.
```

### Weak

```text
Explore another exciting month of groundbreaking innovation across our dynamic ecosystem.
```

---

## 9.2 Product Microcopy

Buttons should use action verbs.

Prefer:

```text
Add story
Send test
Submit for review
Approve issue
Publish newsletter
Open source
Dismiss story
```

Avoid:

```text
Proceed
Confirm
Continue
OK
Submit
```

when a more specific verb is available.

---

## 9.3 Newsletter Headlines

Aim for editorial clarity.

Examples of the desired style:

```text
What builders shipped this month
```

```text
Three things worth showing up for
```

```text
What changed at Volta this week
```

```text
A member win worth knowing about
```

Do not force cleverness.

---

## 9.4 Avoid Generic Startup Language

Avoid habitual use of:

- game-changing
- revolutionary
- cutting-edge
- world-class
- groundbreaking
- ecosystem
- synergistic
- transformational

Some of these words may occasionally be accurate.

They should not become default filler.

---

# 10. Spacing and Rhythm

Use an 8px-based spacing system.

```scss
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 24px;
$space-6: 32px;
$space-7: 48px;
$space-8: 64px;
$space-9: 96px;
```

Dashboard:

- compact inside controls
- generous between conceptual groups

Email:

- generous vertical rhythm
- avoid dense card stacking
- allow major sections to breathe

A Volta newsletter should feel edited, not packed.

---

# 11. Shape Language

The interface should avoid excessive softness.

Recommended:

```text
Inputs:        6–8px radius
Cards:         8–12px radius
Buttons:       6–8px radius
Badges:        pill only when useful
Email cards:   0–8px depending on template
```

Do not make every surface a rounded floating card.

Use:

- lines
- spacing
- typography
- background changes

to create grouping before adding boxes.

---

# 12. Borders and Shadows

Borders should do most structural work.

Recommended:

```scss
border: 1px solid $border-soft;
```

Shadows should be subtle and rare.

Use shadows primarily for:

- dialogs
- floating menus
- drag states
- sticky editor controls

Avoid heavy card shadows across the dashboard.

Email should not rely on shadows for hierarchy.

---

# 13. Buttons

## Primary

- navy or high-contrast brand surface
- white text
- concise action label

## Accent Primary

Cyan may be used where it passes contrast requirements, but dark navy text may be required rather than white.

## Secondary

- white/neutral surface
- visible border
- dark text

## Destructive

- explicit danger treatment
- separated from primary workflow

Button hierarchy should remain obvious even when viewed in grayscale.

---

# 14. Navigation

Recommended dashboard shell:

```text
┌────────────────────────────────────────────────────────────┐
│ VOLTA                                        User / Help   │
├──────────────┬─────────────────────────────────────────────┤
│ Newsletters  │                                             │
│ Content      │                                             │
│ Templates    │                 Main View                   │
│ Archive      │                                             │
│ Settings     │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

Navigation should be:

- compact
- stable
- dark or high-contrast
- immediately recognizable

Avoid oversized navigation treatments.

---

# 15. Dashboard Home Philosophy

The home screen should answer:

1. What needs attention?
2. What is being worked on?
3. What can I do next?

Recommended structure:

```text
Good morning

3 things need attention

[ 12 content candidates ]
[  2 drafts            ]
[  1 issue in review   ]


Recent newsletters

October Community Digest    Draft
AI Builders Events          Review
September Digest            Published


Primary action:
Create newsletter
```

Do not start with analytics unless analytics are actionable.

---

# 16. Content Inbox Design

The Content Inbox should feel closer to an editorial desk than an email client.

Each candidate should show:

- category
- title
- concise summary
- source
- date
- matched organization/member
- image if useful
- clear actions

Example:

```text
MEMBER NEWS                                  Sep 17

Acme closes a $2M seed round

Acme announced...

Source: Entrevestor
Matched member: Acme

[Open source]     [Dismiss]     [Add to issue]
```

The source should always remain visible.

Automated discovery must never appear indistinguishable from verified editorial copy.

---

# 17. Newsletter Editor Design

Use a split working environment on wide screens.

```text
┌──────────────────────────┬───────────────────────────┐
│ EDITOR                   │ PREVIEW                   │
│                          │                           │
│ Subject                  │       Email iframe        │
│ Preheader                │                           │
│ Template                 │                           │
│                          │                           │
│ Hero                     │                           │
│ News                     │                           │
│ Events                   │                           │
│ CTA                      │                           │
│                          │                           │
└──────────────────────────┴───────────────────────────┘
```

The editor side should remain functional and quiet.

The preview carries the visual personality.

---

# 18. Drag and Reorder

Reordering is central to editorial work.

Requirements:

- visible drag handle
- keyboard-accessible alternative
- clear hover/focus state
- obvious drop target
- optimistic visual movement
- saved-state confirmation

Do not require opening a modal just to change item order.

---

# 19. Template Selection

Template cards should show:

- real rendered thumbnail
- template name
- one-line purpose
- compatible sections
- current version

Example:

```text
COMMUNITY DIGEST

General newsletter for community updates,
member news, events and opportunities.

[Preview]
```

Avoid abstract template names such as:

```text
Template A
Template B
Template C
```

---

# 20. Photography Philosophy

Use real people and real activity wherever possible.

Prefer:

- founders working
- builders using tools
- workshops
- events
- conversations
- teams
- Volta spaces
- member companies
- real product work

Avoid:

- generic stock offices
- handshake photography
- fake “AI brain” imagery
- anonymous glowing laptops
- robots unless directly relevant
- generic circuit-board backgrounds

Photography should prove that the community exists.

---

# 21. Image Treatment

Photos should generally be:

- full-bleed when used as hero media
- naturally cropped
- high quality
- minimally filtered
- not buried under heavy overlays

If text must sit on an image:

- use a deliberate dark overlay
- check contrast
- keep copy short

For email, placing text beside or below imagery is safer than relying on image overlays.

---

# 22. Graphic Motifs

A useful Volta-compatible motif is the idea of:

- trajectories
- paths
- iteration
- movement
- branching
- imperfect progress

This can be represented with sparse:

- lines
- strokes
- route-like curves
- dots
- intersections
- short accent bars

Use these as supporting visual energy.

Do not turn every screen into an illustration.

---

# 23. “Messy Lines” Rule

Expressive line graphics work best in:

- newsletter hero art
- login page
- template previews
- empty states
- section separators
- campaign graphics

Avoid them in:

- dense forms
- tables
- configuration pages
- error dialogs
- content editing rows

For email, use static exported raster imagery if compatibility is important.

Do not rely on complex SVG/CSS artwork inside the email.

---

# 24. Iconography

Use simple outline or compact solid icons.

Icons should:

- support labels
- not replace important text
- share one stroke family
- remain legible at 16–20px

Good use:

```text
↗ Open source
```

Bad use:

```text
↗
```

with no accessible name.

---

# 25. Motion Philosophy

Motion is for dashboard UX only.

Generated email contains no JavaScript and should not depend on animation.

Dashboard motion may help communicate:

- reordering
- loading
- saving
- section expansion
- successful publication
- drawer/modal transitions

Motion should be:

- short
- functional
- interruptible
- respectful of `prefers-reduced-motion`

Avoid decorative continuous animation.

---

# 26. Newsletter Visual Architecture

A Volta newsletter should generally use:

```text
Dark or high-contrast masthead
            ↓
Strong editorial headline
            ↓
Real photo or purposeful graphic
            ↓
Light reading surface
            ↓
Clearly separated content sections
            ↓
Focused CTAs
            ↓
Dark/legal footer
```

Do not make the entire newsletter dark.

Long-form reading should generally occur on light backgrounds.

---

# 27. Email Canvas

Recommended email shell:

```text
Page background:       soft off-white / light neutral
Content width:         600–640px
Primary content:       white
Masthead:              navy
Body text:             dark navy / charcoal
Accent:                one or two brand accents per section
```

---

# 28. Newsletter Masthead

The masthead should use the official Volta logo asset.

Never reconstruct the wordmark using typed text when an approved logo asset exists.

Recommended structure:

```text
┌────────────────────────────────────────────┐
│                                            │
│  VOLTA                                     │
│                                            │
│  COMMUNITY DIGEST                          │
│  OCTOBER 2026                              │
│                                            │
└────────────────────────────────────────────┘
```

Masthead should feel confident but not oversized.

---

# 29. Community Digest Philosophy

The general-purpose newsletter.

Character:

- editorial
- energetic
- balanced
- modular

Suggested hierarchy:

```text
Masthead
Hero
Lead story
Members in the news
Awards / wins
Upcoming events
Opportunities
Final CTA
Footer
```

Use category accents sparingly.

---

# 30. Events Focus Philosophy

The events template should emphasize scanning.

Date and time matter as much as the title.

Example:

```text
24
SEP

AI Builders Meetup

6:00 PM
Volta, Halifax

A practical session on...

[Register]
```

Use yellow or cyan as event accents, subject to contrast.

---

# 31. Member Spotlight Philosophy

This template should feel more like a short editorial feature.

Use:

- strong photography
- fewer blocks
- larger headline
- more narrative text
- quote or outcome callout
- one clear CTA

Avoid turning the member profile into a generic promotional card.

---

# 32. Minimal Announcement Philosophy

The minimal announcement should be the most restrained template.

Use:

- navy
- white
- one accent
- short body copy
- one primary CTA

Best for:

- applications opening
- schedule changes
- program launches
- major announcements

---

# 33. Email Section Components

Create a limited component library.

Required:

- masthead
- hidden preheader
- hero
- section heading
- story block
- compact story row
- event row
- spotlight block
- quote/callout
- CTA button
- text CTA
- divider
- sponsor/partner block
- footer
- legal/unsubscribe block

Templates should compose these pieces rather than inventing unique markup repeatedly.

---

# 34. Email-Safe HTML Philosophy

The email system should be conservative.

Use:

- tables for structural layout
- inline CSS
- absolute HTTPS image URLs
- standard semantic text elements
- presentation roles on layout tables

Do not use:

- JavaScript
- forms
- iframes
- client-side behavior
- CSS Grid for critical layout
- Flexbox for critical layout
- external stylesheet dependencies
- interactive widgets
- hover-only content

---

# 35. Email Button Pattern

Use a link styled as a button within table layout.

Pug conceptual pattern:

```pug
table(role="presentation" cellspacing="0" cellpadding="0" border="0")
  tr
    td.cta-cell
      a.cta-button(href=action.href)= action.label
```

The compiled CSS should be inlined.

---

# 36. Email Imagery Rules

Every email image should have:

- absolute HTTPS source
- alt text
- useful width dimensions
- graceful absence behavior

Do not use a decorative image if the template breaks without it.

Content must remain understandable when images are blocked.

---

# 37. Dark Mode

Email clients may alter colors.

The system should:

- preserve contrast where possible
- avoid transparent assets that disappear
- test navy/white combinations
- avoid depending on subtle gray differences
- not promise pixel-perfect dark-mode rendering

Dashboard dark mode is optional and should not be implemented merely because the brand has dark colors.

---

# 38. Accessibility

Accessibility is part of the design philosophy, not a cleanup task.

Dashboard requirements:

- visible focus
- full keyboard navigation
- logical tab order
- explicit labels
- accessible dialogs
- color-independent state
- descriptive error text
- reduced-motion support

Email requirements:

- meaningful alt text
- logical headings
- descriptive links
- sufficient contrast
- readable font sizes
- plain-text fallback
- presentation roles on layout tables

---

# 39. Responsive Dashboard

Desktop is the primary editing environment, but the dashboard should remain usable on smaller screens.

Breakpoints should respond to layout needs rather than arbitrary device names.

Suggested:

```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;
```

On narrow screens:

- preview moves below editor or into a dedicated tab
- sidebar collapses
- drag-reorder retains alternate controls
- tables become stacked or horizontally scrollable where appropriate

---

# 40. Email Mobile Behavior

Email is designed desktop-first within a 600–640px shell but must collapse gracefully.

Mobile behavior should prioritize:

- one-column content
- readable text
- large tap targets
- stacked images/content
- no horizontal scrolling
- simplified spacing

The narrow dashboard preview is an approximation.

Always validate representative output in actual email clients before production rollout.

---

# 41. Status Design

Statuses must use both text and visual treatment.

Recommended:

```text
Draft
Review
Approved
Published
Archived
```

Suggested treatment:

| Status | Tone |
|---|---|
| Draft | neutral |
| Review | attention/warm |
| Approved | success |
| Published | strong brand/dark |
| Archived | muted |

Never show a status as only a colored dot.

---

# 42. Empty States

Empty states should be useful.

Good:

```text
No stories saved yet.

Review the Content Inbox to add member news,
events, awards and community updates.

[Open Content Inbox]
```

Weak:

```text
Nothing here.
```

Use small brand graphics where appropriate, but the action comes first.

---

# 43. Error States

Errors should explain:

- what happened
- what was not affected
- what the user can do next

Example:

```text
Test email could not be sent.

Your newsletter is still saved as a draft.
Check the recipient address or try again.

[Try again]
```

Avoid raw provider exceptions in the UI.

---

# 44. Loading and Saving

Saving state should be visible but quiet.

Recommended:

```text
Saving…
Saved
Save failed — retry
```

Preview rendering may show:

```text
Updating preview…
```

Do not block the entire editor for routine autosave.

---

# 45. Source Provenance

Because the Content Inbox may include automated discovery, source provenance should be visually first-class.

Show:

- original source
- source URL
- discovered date
- publication date
- matched member
- original title where useful

This reinforces trust and supports editorial verification.

---

# 46. Human Review Is Part of the Brand Experience

The system should not present automation as authority.

Automation should say:

```text
Suggested
Detected
Matched
Draft summary
```

not:

```text
Verified
Approved
Ready to publish
```

unless a human has actually performed those actions.

Volta’s “Less Wrong Over Time” philosophy is better represented by reviewable assistance than by false certainty.

---

# 47. AI-Assisted Features

If AI assistance is added later, visually distinguish generated suggestions.

Example:

```text
Suggested summary

[Use suggestion] [Edit] [Dismiss]
```

AI should assist:

- summarization
- headline alternatives
- preheader suggestions
- classification
- duplicate detection

AI must not silently overwrite editorial content.

---

# 48. Logo Rules

Use official supplied assets.

Recommended usage:

Full wordmark:

- newsletter masthead
- login
- major dashboard brand area

Compact mark:

- favicon
- collapsed navigation
- small app identity
- loading treatment if approved

Do not:

- stretch
- recolor arbitrarily
- add effects
- recreate in text
- place on low-contrast backgrounds

---

# 49. Partner and Sponsor Logos

Newsletter partner logos should:

- preserve aspect ratio
- use consistent visual height
- have generous surrounding whitespace
- not overpower Volta branding

Where possible, use a neutral sponsor strip rather than placing many logos inside editorial content.

---

# 50. Component Philosophy

React components should be visually boring in isolation and strong in combination.

Core UI library:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Radio
Tabs
Badge
StatusBadge
Card
Divider
Dialog
Drawer
Toast
Tooltip
DataTable
EmptyState
FilterBar
SearchInput
SortableList
PreviewFrame
```

Feature components then compose them.

Avoid importing a large theme-heavy component library unless necessary.

---

# 51. Shared Token Strategy

Keep dashboard and email styling separate but derive from a shared conceptual token source.

Recommended architecture:

```text
packages/design-tokens/
  tokens.ts

apps/client/
  styles/

apps/server/
  rendering/styles/
```

Possible token object:

```ts
export const brand = {
  navy: "#082231",
  cyan: "#01d9e7",
  blue: "#01a4e7",
  purple: "#6100ff",
  yellow: "#ffbb0e",
  coral: "#ff7272",
  white: "#ffffff",
} as const;
```

The agent may generate SCSS variables from this source or keep mirrored SCSS files with tests ensuring key values remain synchronized.

Do not share full dashboard stylesheets with email rendering.

---

# 52. SCSS Organization — Dashboard

```text
styles/
├── abstracts/
│   ├── _tokens.scss
│   ├── _mixins.scss
│   └── _functions.scss
│
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _global.scss
│
├── components/
│   ├── _buttons.scss
│   ├── _forms.scss
│   ├── _badges.scss
│   ├── _cards.scss
│   └── _dialogs.scss
│
├── layouts/
│   ├── _shell.scss
│   └── _editor.scss
│
└── app.scss
```

---

# 53. SCSS Organization — Email

```text
rendering/styles/
├── _tokens.scss
├── _reset.scss
├── _typography.scss
├── _layout.scss
├── _buttons.scss
├── _stories.scss
├── _events.scss
├── _footer.scss
└── email.scss
```

Email styles must remain deliberately smaller and more conservative.

---

# 54. CSS Inlining Pipeline

Required flow:

```text
SCSS
  ↓
Sass
  ↓
CSS
  ↓
Pug HTML
  ↓
Juice
  ↓
Inline CSS
  ↓
Validation
  ↓
Final email HTML
```

Preview and production rendering should use the same renderer.

Do not maintain a separate hand-built preview version.

---

# 55. Template Preview Philosophy

Previews should be trustworthy.

The preview should render:

- the actual Pug template
- the actual content model
- the actual compiled CSS
- the same render path used for publishing

The React app should display that output in a sandboxed iframe.

Do not approximate the email in React components.

---

# 56. Design QA Checklist

Before a dashboard feature is considered finished:

- [ ] hierarchy is obvious within 3 seconds
- [ ] primary action is identifiable
- [ ] status is expressed in words
- [ ] keyboard navigation works
- [ ] focus state is visible
- [ ] text meets contrast requirements
- [ ] error state exists
- [ ] empty state exists
- [ ] loading state exists
- [ ] mobile/narrow behavior is defined
- [ ] decorative color is restrained

Before an email template is considered finished:

- [ ] official logo asset is used
- [ ] all images have alt text
- [ ] layout still works with images blocked
- [ ] body copy is readable
- [ ] links are descriptive
- [ ] CTA hierarchy is clear
- [ ] HTML contains no JavaScript
- [ ] CSS is inlined
- [ ] no critical layout depends on Grid/Flexbox
- [ ] mobile version does not horizontally scroll
- [ ] Gmail has been checked
- [ ] Outlook has been checked where relevant
- [ ] Apple/iPhone Mail has been checked
- [ ] dark-mode behavior is acceptable
- [ ] plain-text output exists

---

# 57. Design Anti-Patterns

Do not build:

## The Generic SaaS Dashboard

Symptoms:

- endless white cards
- gradient KPI blocks
- every metric has an icon
- everything has a drop shadow
- branding only appears in the logo

The dashboard should feel connected to Volta through restraint, typography, navy anchoring, and selective energy.

## The Startup Rainbow

Symptoms:

- cyan, purple, yellow, coral and blue all used simultaneously
- every section has a different saturated background
- no neutral reading space

Use accents, not confetti.

## The Marketing Email Builder

Symptoms:

- unlimited drag-and-drop formatting
- arbitrary colors/fonts
- users directly editing HTML
- dozens of layout variants

The platform should curate design choices.

Structured content + strong templates produces more consistent newsletters.

## The AI Autopilot

Symptoms:

- scraped content automatically becomes newsletter content
- AI summaries appear as final truth
- source provenance disappears
- publication can occur without review

Automation should reduce hunting, not remove judgement.

---

# 58. Design Decision Priority

When two design goals conflict, use this order:

1. clarity
2. accessibility
3. editorial trust
4. email compatibility
5. workflow speed
6. brand expression
7. visual novelty

Brand expression should never make the product harder to operate.

---

# 59. Practical Design Formula

For the dashboard:

```text
Neutral workspace
+ dark Volta anchor
+ concise typography
+ one accent at a time
+ clear workflow
+ real source context
```

For newsletters:

```text
Volta navy
+ white/light reading field
+ large direct headline
+ real community photography
+ selective electric accent
+ strong editorial spacing
+ one clear action per content block
```

---

# 60. Final Philosophy

The product should not feel like a generic newsletter builder with a Volta logo placed on top.

It should feel like a tool designed around how Volta communicates and works:

**Build. Test. Learn. Curate. Ship. Improve.**

The dashboard should stay out of the editor’s way.

The newsletter should make the community visible.

The content should be concrete.

The sources should be traceable.

The typography should be confident.

The color should create energy without noise.

The interface should make action obvious.

And every major design decision should reinforce one idea:

> Make it easier for Volta to clearly show what its builders, founders, members, programs, and community are doing — then get that story out the door.

---

# Research Basis

This philosophy was informed by Volta’s current public website and public program/value language reviewed in September 2026, including:

- Volta homepage — https://voltaeffect.com/
- Mission & Vision — https://voltaeffect.com/mission-vision
- About Volta — https://voltaeffect.com/about
- Community — https://voltaeffect.com/community
- AI Residency — https://voltaeffect.com/ai-residency
- Volta Sprint — https://sprint.voltaeffect.com/

The exact production logo files, typefaces, spacing rules, and official brand color values should be verified against Volta’s internal/current brand asset package before launch.
