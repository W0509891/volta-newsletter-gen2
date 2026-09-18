# 01 — Data Model

## Goal

Stand up the Prisma schema and migrations that every later step builds on.

## Depends on

Nothing. Do this first.

## Out of scope

No UI in this step. Schema + seed script only.

## Schema

```prisma
enum ContentCategory {
  FOUNDER_STORY
  EVENT
  PROGRAM_LAUNCH
  HACKATHON
  AI_LAB
  OTHER
}

enum ContentStatus {
  DRAFT
  PENDING_CONSENT
  APPROVED
  BACKLOG
  PUBLISHED
}

enum SourceType {
  MANUAL_ENTRY
  SUBMISSION
  TRANSCRIPT // reserved — no ingestion pipeline built against this yet
}

model Contact {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  contentItems  ContentItem[] @relation("subject")
}

model ContentItem {
  id              String          @id @default(cuid())
  category        ContentCategory
  status          ContentStatus   @default(DRAFT)
  sourceType      SourceType      @default(MANUAL_ENTRY)
  title           String
  summary         String
  url             String?
  subjectContact  Contact?        @relation("subject", fields: [subjectContactId], references: [id])
  subjectContactId String?
  consentAskedAt  DateTime?
  consentGrantedAt DateTime?
  revisitAt       DateTime?       // Bader's "check back next month" backlog
  eventId         String?
  event           Event?          @relation(fields: [eventId], references: [id])
  createdBy       String          // curator name/email, plain string is fine for v1
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  trackedLinks    TrackedLink[]
  newsletterId    String?
  newsletter      Newsletter?     @relation(fields: [newsletterId], references: [id])
}

model Event {
  id          String   @id @default(cuid())
  name        String
  startsAt    DateTime
  externalRef String?  // id in whatever ticketing/event system Volta uses — TBD, see 07
  contentItems ContentItem[]
}

model Newsletter {
  id          String   @id @default(cuid())
  title       String
  status      String   @default("draft") // draft | sent
  sentAt      DateTime?
  mailchimpCampaignId String?
  contentItems ContentItem[]
  sendLogs    SendLog[]
}

model TrackedLink {
  id            String   @id @default(cuid())
  contentItemId String
  contentItem   ContentItem @relation(fields: [contentItemId], references: [id])
  destinationUrl String
  utmCampaign   String
  clicks        Int?     // populated later from Mailchimp report, see 07
}

model SendLog {
  id                  String   @id @default(cuid())
  newsletterId        String
  newsletter          Newsletter @relation(fields: [newsletterId], references: [id])
  mailchimpCampaignId String
  mailchimpListId     String
  sentAt              DateTime @default(now())
}
```

## Tasks

1. `npx prisma init` if not already done; point `DATABASE_URL` at Postgres.
2. Add the schema above to `schema.prisma`.
3. `npx prisma migrate dev --name init_content_model`.
4. Write a seed script (`prisma/seed.ts`) with 2-3 fake ContentItems across
   categories and statuses, one Contact, one Event — enough to develop the
   UI against in step 02 without needing real data.
5. Export a typed Prisma client singleton at `lib/db.ts` (standard Next.js
   pattern — avoid creating a new client per request in dev).

## Acceptance criteria

- `npx prisma studio` shows all 6 models with the seed data.
- `ContentStatus` transitions are enforced only at the application layer in
  step 02, not via DB constraints — keep the schema permissive.
