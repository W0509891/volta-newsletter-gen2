# Volta Builders Dispatch — Generation 2

> Internal newsletter curation, consent tracking, template compilation, and campaign dispatch engine for **Volta Innovation Hub**.

---

## 1. System Overview

Volta Builders Dispatch Generation 2 replaces ad-hoc template copying with a robust, relationship-first editorial pipeline. Designed for Volta curators (Bader, Laura, Amy), the platform manages the entire lifecycle of ecosystem stories, founder wins, events, and community updates—from initial pitch to verified founder consent, responsive table-based email rendering, Mailchimp dispatch, and outbound UTM link attribution.

### Key Architectural Tenets
- **Relationship-First Editorial Control**: Content never enters a published newsletter without explicit, auditable founder/stakeholder consent.
- **Fail-Safe Email Compatibility**: Email rendering compiles modular Pug templates into pure HTML with inline CSS via `juice`, stripping unsafe `<style>` tags to ensure rendering across Outlook, Gmail, and Apple Mail.
- **Auditable Funnel Attribution**: Outbound links are automatically tagged with UTM parameters and registered for click tracking to bridge newsletter engagement with event and ecosystem participation.
- **Continuous Backlog Loop**: Non-urgent or future-milestone items are parked with scheduled revisit dates and surface automatically when overdue for review.

---

## 2. Architecture Process & Lifecycle

The platform operates as a unidirectional state progression with feedback loops for consent and backlog revisit:

```
+---------------------------------------------------------------------------------------------------+
|                                      1. INTAKE & SOURCING                                         |
|  - Staff Quick Capture (/admin/items/quick)                                                       |
|  - Public / Partner Submission Form (/submit)                                                     |
|  - Direct Curator Entry (/admin)                                                                  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  2. CURATION & CONSENT LIFECYCLE                                  |
|                                                                                                   |
|   [ INBOX ] ----> [ DRAFT ] ----> [ PENDING_CONSENT ] ----> [ APPROVED ]                         |
|      |               |                    |                      |                                |
|      |               v                    v                      |                                |
|      +--------> [ REJECTED ]      [ CONSENT REVOKED ]            |                                |
|      |                                                           |                                |
|      +--------> [ BACKLOG ] <====================================+                                |
|                      |             (Parked with revisit_at date)                                  |
|                      v                                                                            |
|             [ OVERDUE QUEUE ] ---> Re-evaluate for draft                                          |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  3. EDITION ASSEMBLY & CURATION                                   |
|  - Create Newsletter Edition (Slug, Subject, Preview Text)                                        |
|  - Assign Approved Items into Sections:                                                           |
|    * FEATURED (Hero story)          * WINS (Company milestones)                                   |
|    * STORIES (Founder profiles)     * OPPORTUNITIES (Grants, hiring)                              |
|    * EVENTS (Upcoming workshops)    * COMMUNITY (Ecosystem news)                                  |
|  - Reorder item positions within sections                                                         |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                               4. TEMPLATE COMPILATION & INLINING                                  |
|  - Modular Pug layout (templates/base-layout.pug + templates/sections/*)                          |
|  - Table-based nested layouts (email client resilient)                                            |
|  - Link Transformer: Injects UTM parameters (utm_source, utm_medium, utm_campaign)                |
|  - Registers links in tracked_links table                                                         |
|  - juice CSS Inlining: Inlines all styles and purges raw <style> tags                             |
|  - Generates self-contained, email-safe HTML with *|UNSUB|* merge tag                             |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                              5. MAILCHIMP DISPATCH & CAMPAIGN SYNC                                |
|  - Sync HTML payload to Mailchimp Campaign API                                                    |
|  - Send live test emails to curators                                                              |
|  - Execute final campaign dispatch                                                                |
|  - Transition Newsletter status: DRAFT -> SCHEDULED -> SENDING -> SENT                            |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                 6. FUNNEL ANALYTICS & ATTRIBUTION                                 |
|  - Ingest campaign delivery stats (opens, clicks, bounces)                                        |
|  - Aggregate item-level click counts via tracked_links                                            |
|  - Funnel bridge ready for event attendance / check-in joins                                      |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Core Architectural Processes

### Process 1: Sourcing & Intake Pipeline
1. **Curator Quick Capture (`/admin/items/quick`)**: Streamlined single-screen interface for staff to log founder updates, link drops, or upcoming events with minimal friction.
2. **Public Submission Form (`/submit`)**: External intake endpoint for ecosystem members, students, and partners. Automatically associates stakeholder contact information and marks the submission as `INBOX` with an accompanying consent record audit log.
3. **Database Insertion**: Items are stored in `content_items` with initial `INBOX` status, linked optionally to `contacts` and `events`.

### Process 2: Relationship-First Consent Architecture
Volta prioritizes founder trust over marketing velocity. Stories concerning founders, private metrics, or sensitive milestones cannot be published without verifiable consent.
- **Workflow States**:
  - `INBOX` / `DRAFT`: Item being prepared by staff.
  - `PENDING_CONSENT`: Curator reaches out to founder/stakeholder via email, verbal check, or form.
  - `APPROVED`: Founder provides verifiable confirmation. Item is now unlocked for newsletter inclusion.
  - `BACKLOG`: If a founder requests postponing ("check back after our beta launch"), the item is parked with a `revisit_at` timestamp.
- **Audit Records (`consent_records`)**: Every consent request and status change records the method (`EMAIL`, `VERBAL`, `FORM`, `RECORDING`), evidence string (e.g. email quote, link), timestamp, and contact reference.

### Process 3: Newsletter Assembly & Section Management
- Curators create an issue edition with a URL slug (e.g., `2026-10-builders-dispatch`), email subject line, and preview snippet.
- Items in `APPROVED` status can be attached to the edition and organized across 6 editorial sections:
  1. `FEATURED`: Hero feature story
  2. `STORIES`: Deep-dive founder updates
  3. `EVENTS`: Upcoming workshops, office hours, and meetups
  4. `WINS`: Funding milestones, product launches, customer wins
  5. `OPPORTUNITIES`: Grants, accelerator deadlines, founder perks
  6. `COMMUNITY`: General ecosystem announcements
- Items within each section support positional reordering (`newsletter_items.position`).

### Process 4: Template Rendering & CSS Inlining Pipeline
Email client HTML engines (especially desktop Microsoft Outlook and mobile webmail) do not support modern CSS grids, flexbox, or external stylesheets.
- **Pug Templates (`templates/`)**: The layout is split into clean, maintainable components (`base-layout.pug`, `founder-highlight.pug`, `events.pug`, `program-updates.pug`, `weekly.pug`).
- **Semantic Tables**: Emits nested `<table>`, `<tr>`, and `<td>` structures with explicit widths, cellpaddings, and mso-conditionals.
- **Link Processing**: Outbound URLs are rewritten to include standardized UTM tags:
  ```
  https://example.com/demo?utm_source=newsletter&utm_medium=email&utm_campaign=2026-10-builders-dispatch
  ```
  and recorded in `tracked_links` for granular click measurement.
- **Juice CSS Inliner (`juice`)**: Automatically transforms all CSS classes and embedded styles into inline `style="..."` attributes on every HTML tag.
- **Sanitization**: Strips raw `<style>` blocks so email clients do not choke or strip styling. Enforces the presence of Mailchimp's required `*|UNSUB|*` footer token.

### Process 5: Mailchimp Campaign Dispatch
- Integrated via `@mailchimp/mailchimp_marketing` with environment credentials (`MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_LIST_ID`).
- **Two-Way Synchronization**:
  1. Creates or updates a Mailchimp regular campaign draft.
  2. Uploads the inlined HTML payload directly into the campaign content.
  3. Allows curators to send test emails to internal addresses directly from the dashboard (`/admin/newsletters/[id]/preview`).
  4. Triggers the final send command through Mailchimp.
- **Mock Mode**: In environments without active Mailchimp API keys, the client safely logs payloads and returns mock campaign IDs, ensuring the entire UI and pipeline remain testable.

### Process 6: Outbound Link Attribution & Funnel Analytics
- **Link Tracking Table (`tracked_links`)**: Maintains a record of every outbound link per newsletter edition and content item.
- **Funnel Analytics (`/admin/newsletters/[id]/report`)**:
  - Displays high-level delivery metrics (recipients, open rate, click rate, bounces, unsubscriptions).
  - Breaks down click-throughs by individual content item and destination URL.
  - Designed with an extensible schema to join newsletter clicks against Volta event ticketing platforms (e.g., Luma or Eventbrite check-in data).

### Process 7: Overdue Backlog & Revisit Loop
- Stories parked in `BACKLOG` with a `revisit_at` timestamp are indexed and surfaced in the Backlog Queue (`/admin/backlog`).
- Items whose revisit date has passed are highlighted in the **Overdue for Revisit** section, allowing curators with a single click to restore them to `DRAFT`, request consent, or approve them for the next edition.

---

## 4. Relational Data Model (PostgreSQL)

The database schema is defined in `lib/db/schema.sql` and operated via a connection pool (`lib/db.ts`) with typed queries in `lib/db/queries.ts`:

| Table | Purpose | Key Relations |
|---|---|---|
| `contacts` | Stakeholder / founder profiles and communication history | `1:N` with `consent_records`, `1:N` with `content_items` |
| `events` | Calendar events, workshops, and meetups | `1:N` with `content_items` |
| `content_items` | Core editorial items (stories, wins, events, opportunities) | Belongs to `contacts`, `events`; `1:N` with `consent_records` |
| `consent_records` | Auditable history of founder consent requests and responses | Belongs to `content_items`, `contacts` |
| `newsletters` | Newsletter editions with delivery state and Mailchimp IDs | `M:N` with `content_items` through `newsletter_items` |
| `newsletter_items` | Join table storing section placement and order within an edition | Composite PK (`newsletter_id`, `content_item_id`) |
| `tracked_links` | Outbound URLs with UTM parameters and aggregate click counters | Belongs to `newsletters`, `content_items` |

---

## 5. Technology Stack

- **Framework**: Next.js 16 (React 19, App Router, Server Actions, Turbopack)
- **Database**: PostgreSQL (hosted on `homeserver-1`, Node `pg` connection pool)
- **Template Compilation**: Pug 3.0 + `juice` 11.0 (CSS inlining)
- **Email Delivery**: Mailchimp Marketing API (`@mailchimp/mailchimp_marketing`)
- **UI Styling**: Tailwind CSS, Lucide React icons
- **Validation & Types**: TypeScript 5, strict schema typings

---

## 6. Project Structure

```
├── app/
│   ├── actions/               # Server Actions (items, newsletters, consent)
│   ├── admin/                 # Curator Dashboard
│   │   ├── backlog/           # Backlog revisit queue
│   │   ├── items/             # Item list, editor, and quick-capture
│   │   └── newsletters/       # Edition management, preview, and analytics
│   ├── api/                   # API routes (HTML preview rendering)
│   ├── submit/                # Public/partner submission portal
│   └── layout.tsx             # Root layout with curator navigation
├── components/
│   ├── admin/                 # Editor, modals, backlog queue, report client
│   └── public/                # Public submission form component
├── lib/
│   ├── db.ts                  # PostgreSQL connection pool
│   ├── db/
│   │   ├── queries.ts         # Strongly typed SQL query layer
│   │   └── schema.sql         # Relational DDL definitions & indexes
│   ├── mailchimp.ts           # Mailchimp API wrapper with mock fallback
│   ├── render-newsletter.ts   # Pug compiler + juice style inliner
│   ├── tracked-links.ts       # UTM parameter builder
│   └── types.ts               # Core domain TypeScript interfaces
├── scripts/
│   ├── migrate.js             # Schema migration runner
│   └── seed.ts                # Ecosystem demo data seed script
└── templates/                 # Modular Pug email templates
    ├── base-layout.pug        # Responsive table-based email container
    └── sections/              # Section-specific templates
```

---

## 7. Getting Started

### Prerequisites
- Node.js (v20+ recommended, tested on v24.12.0)
- PostgreSQL database instance

### Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Configure your environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@hostname:5432/volta_email_2
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mailchimp API (Leave mock keys for local development)
MAILCHIMP_API_KEY=mock-key-for-demo
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=mock-list-id
MAILCHIMP_FROM_NAME="Volta Innovation Hub"
MAILCHIMP_REPLY_TO="newsletter@voltaeffect.com"
```

### Database Migration & Seeding
Run the database migration and populate with Volta ecosystem seed data:
```bash
npm run db:migrate
npm run db:seed
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Curator Dashboard or [http://localhost:3000/submit](http://localhost:3000/submit) to test the public intake portal.

### Production Build
```bash
npm run build
npm run start
```
