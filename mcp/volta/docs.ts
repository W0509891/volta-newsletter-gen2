import fs from 'fs';
import path from 'path';

export interface ToolDocumentation {
  name: string;
  category: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        required?: boolean;
        enum?: string[];
        format?: string;
        validation?: string;
      }
    >;
    required?: string[];
  };
  expectedOutput: {
    description: string;
    sample: Record<string, unknown>;
  };
}

export const VOLTA_MCP_TOOLS: ToolDocumentation[] = [
  {
    name: 'content.search',
    category: 'Content Management',
    description: 'Search newsletter content items by status, category type, or search term.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['INBOX', 'DRAFT', 'PENDING_CONSENT', 'APPROVED', 'REJECTED', 'BACKLOG', 'ARCHIVED'],
          required: false,
          description: 'Filter content items by their workflow status.',
        },
        type: {
          type: 'string',
          enum: ['STORY', 'EVENT', 'WIN', 'OPPORTUNITY', 'COMMUNITY'],
          required: false,
          description: 'Filter content items by section/topic category.',
        },
        search: {
          type: 'string',
          required: false,
          validation: 'Max 200 chars',
          description: 'Keyword search query matched across title and body.',
        },
      },
    },
    expectedOutput: {
      description: 'An object containing an array of matched content items.',
      sample: {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            type: 'STORY',
            title: 'Breakthrough in AI Research at Volta',
            summary: 'Volta research team publishes new findings on LLM workflows.',
            body: 'Full editorial content text goes here...',
            url: 'https://volta.example.com/blog/ai-research',
            status: 'APPROVED',
            featured: true,
            itemOrder: 1,
            contactName: 'Jane Doe',
            contactEmail: 'jane@example.com',
            consentStatus: 'GRANTED',
            createdAt: '2026-09-24T10:00:00.000Z',
            updatedAt: '2026-09-24T12:00:00.000Z',
          },
        ],
      },
    },
  },
  {
    name: 'content.get',
    category: 'Content Management',
    description: 'Get one content item by its unique UUID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item to retrieve.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'An object containing the full content item record or null if not found.',
      sample: {
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          currentRevisionId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          approvedRevisionId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          type: 'STORY',
          title: 'Breakthrough in AI Research at Volta',
          body: 'Full editorial story content...',
          summary: 'Brief executive summary of the story.',
          url: 'https://volta.example.com/story/1',
          status: 'APPROVED',
          featured: true,
          itemOrder: 1,
          contactId: '7ca7b810-9dad-11d1-80b4-00c04fd430c9',
          contactName: 'Jane Doe',
          contactEmail: 'jane@example.com',
          consentStatus: 'GRANTED',
          createdAt: '2026-09-24T10:00:00.000Z',
          updatedAt: '2026-09-24T12:00:00.000Z',
        },
      },
    },
  },
  {
    name: 'content.create',
    category: 'Content Management',
    description: 'Create a new draft content item with automatic contact deduplication and initial revision snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          required: true,
          validation: '1-180 chars',
          description: 'Headline or title of the content item.',
        },
        type: {
          type: 'string',
          enum: ['STORY', 'EVENT', 'WIN', 'OPPORTUNITY', 'COMMUNITY'],
          required: true,
          description: 'Category / section type.',
        },
        summary: {
          type: 'string',
          required: false,
          validation: 'Max 600 chars',
          description: 'Short synopsis for newsletter teasers.',
        },
        body: {
          type: 'string',
          required: false,
          validation: 'Max 6000 chars',
          description: 'Full body content (Markdown or plain text).',
        },
        url: {
          type: 'string',
          format: 'url',
          required: false,
          description: 'Canonical link for the item.',
        },
        contactEmail: {
          type: 'string',
          format: 'email',
          required: false,
          description: 'Email of the author or primary contact.',
        },
        contactName: {
          type: 'string',
          required: false,
          validation: 'Max 180 chars',
          description: 'Full name of the contact person.',
        },
        contactOrganization: {
          type: 'string',
          required: false,
          validation: 'Max 180 chars',
          description: 'Company or entity associated with the contact.',
        },
      },
      required: ['title', 'type'],
    },
    expectedOutput: {
      description: 'An object containing the newly created DRAFT content item record.',
      sample: {
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          currentRevisionId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          type: 'STORY',
          title: 'Exciting Launch Announcement',
          summary: 'Preview summary text',
          body: 'Full story text',
          url: 'https://example.com/launch',
          status: 'DRAFT',
          contactId: '7ca7b810-9dad-11d1-80b4-00c04fd430c9',
          createdAt: '2026-09-24T14:00:00.000Z',
          updatedAt: '2026-09-24T14:00:00.000Z',
        },
      },
    },
  },
  {
    name: 'content.change_status',
    category: 'Content Management',
    description: 'Change content status or move content to backlog/rejected states with optional rationale.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item.',
        },
        status: {
          type: 'string',
          enum: ['INBOX', 'DRAFT', 'PENDING_CONSENT', 'APPROVED', 'REJECTED', 'BACKLOG', 'ARCHIVED'],
          required: true,
          description: 'Target workflow status.',
        },
        rejectionReason: {
          type: 'string',
          required: false,
          validation: 'Max 500 chars',
          description: 'Required or recommended explanation when status is REJECTED.',
        },
        revisitAt: {
          type: 'string',
          format: 'iso datetime',
          required: false,
          description: 'Follow-up date when parked in BACKLOG.',
        },
      },
      required: ['id', 'status'],
    },
    expectedOutput: {
      description: 'An object containing the updated content item.',
      sample: {
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'APPROVED',
          rejectionReason: null,
          revisitAt: null,
          updatedAt: '2026-09-24T14:15:00.000Z',
        },
      },
    },
  },
  {
    name: 'revision.current',
    category: 'Revisions & Consents',
    description: 'Get the current immutable content revision (snapshot and content hash) for a content item.',
    inputSchema: {
      type: 'object',
      properties: {
        contentItemId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item.',
        },
      },
      required: ['contentItemId'],
    },
    expectedOutput: {
      description: 'The current immutable revision details including SHA-256 hash.',
      sample: {
        revision: {
          id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          contentItemId: '550e8400-e29b-41d4-a716-446655440000',
          revisionNumber: 1,
          title: 'Breakthrough in AI Research at Volta',
          summary: 'Summary text',
          body: 'Body text',
          url: 'https://volta.example.com',
          contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          createdBy: 'system',
          createdAt: '2026-09-24T10:00:00.000Z',
        },
      },
    },
  },
  {
    name: 'consent.create_request',
    category: 'Revisions & Consents',
    description: 'Create a secure, tokenized preview link for author/founder approval tied to an immutable revision.',
    inputSchema: {
      type: 'object',
      properties: {
        contentItemId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item to be approved.',
        },
        contactId: {
          type: 'string',
          format: 'uuid',
          required: false,
          description: 'Optional ID of the contact recipient.',
        },
        recipientName: {
          type: 'string',
          required: false,
          validation: 'Max 180 chars',
          description: 'Display name of the approver.',
        },
        recipientEmail: {
          type: 'string',
          format: 'email',
          required: false,
          description: 'Email destination for the request.',
        },
        baseUrl: {
          type: 'string',
          format: 'url',
          required: true,
          description: 'Base web URL used to generate the consent landing link.',
        },
      },
      required: ['contentItemId', 'baseUrl'],
    },
    expectedOutput: {
      description: 'Consent request database record and full approval URL with embedded secure token.',
      sample: {
        request: {
          id: '8ca7b810-9dad-11d1-80b4-00c04fd430ca',
          contentItemId: '550e8400-e29b-41d4-a716-446655440000',
          revisionId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          contactId: '7ca7b810-9dad-11d1-80b4-00c04fd430c9',
          recipientName: 'Jane Doe',
          recipientEmail: 'jane@example.com',
          status: 'PENDING',
          expiresAt: '2026-10-08T14:00:00.000Z',
          createdAt: '2026-09-24T14:00:00.000Z',
        },
        approvalUrl: 'https://newsletter.volta.com/consent/dGVzdC1zZWN1cmUtdG9rZW4',
      },
    },
  },
  {
    name: 'submission.list',
    category: 'Founder Submissions',
    description: 'List intake submissions from founders for curation triage.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['RECEIVED', 'TRIAGED', 'PROMOTED', 'REJECTED'],
          required: false,
          description: 'Filter submissions by lifecycle stage.',
        },
      },
    },
    expectedOutput: {
      description: 'An array of founder submissions matching the status filter.',
      sample: {
        submissions: [
          {
            id: '9ca7b810-9dad-11d1-80b4-00c04fd430cb',
            type: 'STORIES',
            founderName: 'Alex Rivera',
            founderEmail: 'alex@startup.io',
            companyName: 'StartupX',
            title: 'StartupX raises Seed round',
            summary: 'StartupX secured $2M in Seed funding to expand platform.',
            status: 'RECEIVED',
            sourceUrls: ['https://startup.io/news'],
            submittedAt: '2026-09-24T11:30:00.000Z',
          },
        ],
      },
    },
  },
  {
    name: 'submission.get',
    category: 'Founder Submissions',
    description: 'Get a specific founder submission by its UUID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the founder submission.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'The detailed submission record or null if not found.',
      sample: {
        submission: {
          id: '9ca7b810-9dad-11d1-80b4-00c04fd430cb',
          type: 'STORIES',
          founderName: 'Alex Rivera',
          founderEmail: 'alex@startup.io',
          companyName: 'StartupX',
          title: 'StartupX raises Seed round',
          summary: 'Full pitch notes and details...',
          body: 'Detailed narrative...',
          status: 'RECEIVED',
          sourceUrls: ['https://startup.io/news'],
          createdAt: '2026-09-24T11:30:00.000Z',
        },
      },
    },
  },
  {
    name: 'submission.promote',
    category: 'Founder Submissions',
    description: 'Promote a founder submission into an editorial DRAFT content item and record an audit log entry.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the submission to promote.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Success indicator and newly generated DRAFT content item.',
      sample: {
        success: true,
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'StartupX raises Seed round',
          type: 'STORY',
          status: 'DRAFT',
          contactId: '7ca7b810-9dad-11d1-80b4-00c04fd430c9',
          createdAt: '2026-09-24T14:45:00.000Z',
        },
      },
    },
  },
  {
    name: 'submission.reject',
    category: 'Founder Submissions',
    description: 'Reject a founder submission and record audit log trace.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the submission to reject.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Success indicator and updated submission record.',
      sample: {
        success: true,
        submission: {
          id: '9ca7b810-9dad-11d1-80b4-00c04fd430cb',
          status: 'REJECTED',
          updatedAt: '2026-09-24T14:50:00.000Z',
        },
      },
    },
  },
  {
    name: 'news.search',
    category: 'News Curation',
    description: 'Search aggregated reviewable news candidates across registered news sources.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['NEW', 'SURFACED', 'SAVED', 'DISMISSED', 'PROMOTED'],
          required: false,
          description: 'Filter candidates by triage status.',
        },
        search: {
          type: 'string',
          required: false,
          validation: 'Max 200 chars',
          description: 'Text search across news title and excerpts.',
        },
      },
    },
    expectedOutput: {
      description: 'An array of news candidate items.',
      sample: {
        candidates: [
          {
            id: 'aca7b810-9dad-11d1-80b4-00c04fd430cc',
            sourceId: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
            title: 'Atlantic Tech Ecosystem Sees Record Growth',
            canonicalUrl: 'https://news.example.com/atlantic-tech',
            aiSummary: 'Summary generated during RSS ingest.',
            status: 'SURFACED',
            publishedAt: '2026-09-24T08:00:00.000Z',
          },
        ],
      },
    },
  },
  {
    name: 'news.get',
    category: 'News Curation',
    description: 'Get full details of a specific news candidate item.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the news candidate.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Full candidate record including raw scraped text and AI classification.',
      sample: {
        candidate: {
          id: 'aca7b810-9dad-11d1-80b4-00c04fd430cc',
          sourceId: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
          title: 'Atlantic Tech Ecosystem Sees Record Growth',
          canonicalUrl: 'https://news.example.com/atlantic-tech',
          rawContent: 'Full article text fetched from source adapter...',
          aiSummary: 'Structured AI digest...',
          status: 'NEW',
          publishedAt: '2026-09-24T08:00:00.000Z',
          createdAt: '2026-09-24T08:05:00.000Z',
        },
      },
    },
  },
  {
    name: 'news.promote',
    category: 'News Curation',
    description: 'Promote a discovered news candidate into draft editorial content.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the news candidate to promote.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Success flag and resulting draft ContentItem entity.',
      sample: {
        success: true,
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Atlantic Tech Ecosystem Sees Record Growth',
          type: 'STORY',
          summary: 'Structured AI digest...',
          body: 'Full article text...',
          url: 'https://news.example.com/atlantic-tech',
          status: 'DRAFT',
          createdAt: '2026-09-24T15:00:00.000Z',
        },
      },
    },
  },
  {
    name: 'news.save',
    category: 'News Curation',
    description: 'Save a news candidate for later review (marks status as SAVED).',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the news candidate.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Updated news candidate record.',
      sample: {
        candidate: {
          id: 'aca7b810-9dad-11d1-80b4-00c04fd430cc',
          status: 'SAVED',
          updatedAt: '2026-09-24T15:02:00.000Z',
        },
      },
    },
  },
  {
    name: 'news.dismiss',
    category: 'News Curation',
    description: 'Dismiss a news candidate from active queues (marks status as DISMISSED).',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the news candidate.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Updated news candidate record.',
      sample: {
        candidate: {
          id: 'aca7b810-9dad-11d1-80b4-00c04fd430cc',
          status: 'DISMISSED',
          updatedAt: '2026-09-24T15:03:00.000Z',
        },
      },
    },
  },
  {
    name: 'source.list',
    category: 'News Sources',
    description: 'List configured news ingestion sources.',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          required: false,
          description: 'Filter sources by enabled status.',
        },
      },
    },
    expectedOutput: {
      description: 'An array of news source definitions.',
      sample: {
        sources: [
          {
            id: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
            name: 'Entrevestor Atlantic News',
            type: 'RSS',
            url: 'https://entrevestor.com/feed',
            enabled: true,
            pollingIntervalMinutes: 60,
            priority: 10,
            lastCheckedAt: '2026-09-24T14:00:00.000Z',
          },
        ],
      },
    },
  },
  {
    name: 'source.add',
    category: 'News Sources',
    description: 'Add a new dynamic news feed or source for aggregation.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          required: true,
          validation: '1-180 chars',
          description: 'Readable name for the source feed.',
        },
        type: {
          type: 'string',
          enum: ['RSS', 'WEBSITE', 'LINKEDIN_PAGE', 'LINKEDIN_PROFILE', 'MANUAL', 'API'],
          required: true,
          description: 'Type of connector/adapter required.',
        },
        url: {
          type: 'string',
          format: 'url',
          required: true,
          description: 'Valid URL endpoint or feed URL.',
        },
        enabled: {
          type: 'boolean',
          required: false,
          description: 'Whether polling should be active (defaults to true).',
        },
        pollingIntervalMinutes: {
          type: 'integer',
          required: false,
          validation: '5-10080 minutes',
          description: 'How frequently the background worker crawls this source.',
        },
        priority: {
          type: 'integer',
          required: false,
          validation: '-100 to 100',
          description: 'Priority score for sorting crawled items.',
        },
      },
      required: ['name', 'type', 'url'],
    },
    expectedOutput: {
      description: 'The created NewsSource database entity.',
      sample: {
        source: {
          id: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
          name: 'TechCrunch Regional',
          type: 'RSS',
          url: 'https://techcrunch.com/feed',
          enabled: true,
          pollingIntervalMinutes: 60,
          priority: 0,
          createdAt: '2026-09-24T15:05:00.000Z',
        },
      },
    },
  },
  {
    name: 'source.remove',
    category: 'News Sources',
    description: 'Remove a configured news source by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          required: true,
          validation: '1-180 chars',
          description: 'ID of the news source to delete.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Result of the removal operation.',
      sample: {
        source: {
          id: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
          deleted: true,
        },
      },
    },
  },
  {
    name: 'source.check_now',
    category: 'News Sources',
    description: 'Trigger immediate on-demand aggregation cycle across all enabled news sources.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    expectedOutput: {
      description: 'Aggregation execution summary with per-source counts and errors.',
      sample: {
        sourcesChecked: 2,
        results: [
          {
            sourceId: 'bca7b810-9dad-11d1-80b4-00c04fd430cd',
            sourceName: 'Entrevestor',
            fetched: 8,
            created: 3,
          },
          {
            sourceId: 'cca7b810-9dad-11d1-80b4-00c04fd430ce',
            sourceName: 'Regional Feed',
            fetched: 0,
            created: 0,
            error: 'HTTP 404 Not Found',
          },
        ],
      },
    },
  },
  {
    name: 'delivery.build_digest',
    category: 'Delivery & Notifications',
    description: 'Build a digest payload preview of undelivered news candidates without transmitting.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          enum: ['SLACK', 'DISCORD'],
          required: true,
          description: 'Target notification platform.',
        },
        limit: {
          type: 'integer',
          required: false,
          validation: '1-25 items',
          description: 'Maximum candidate items to include.',
        },
      },
      required: ['channel'],
    },
    expectedOutput: {
      description: 'Structured digest preview including targeted candidates.',
      sample: {
        channel: 'SLACK',
        deliveryType: 'DIGEST',
        candidates: [
          {
            id: 'aca7b810-9dad-11d1-80b4-00c04fd430cc',
            title: 'Atlantic Tech Growth',
            canonicalUrl: 'https://news.example.com',
            aiSummary: 'Summary of top stories',
          },
        ],
      },
    },
  },
  {
    name: 'delivery.send_slack',
    category: 'Delivery & Notifications',
    description: 'Send Slack webhook digest for undelivered news candidates and record delivery history.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          required: false,
          validation: '1-25 items',
          description: 'Maximum items to deliver.',
        },
      },
    },
    expectedOutput: {
      description: 'Delivery confirmation with delivered count and reference ID.',
      sample: {
        success: true,
        delivered: 3,
        reference: 'slack-msg-1727190000',
      },
    },
  },
  {
    name: 'delivery.send_discord',
    category: 'Delivery & Notifications',
    description: 'Send Discord webhook digest for undelivered news candidates and record delivery history.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          required: false,
          validation: '1-25 items',
          description: 'Maximum items to deliver.',
        },
      },
    },
    expectedOutput: {
      description: 'Delivery confirmation with delivered count and reference ID.',
      sample: {
        success: true,
        delivered: 3,
        reference: 'discord-msg-1727190000',
      },
    },
  },
  {
    name: 'newsletter.list',
    category: 'Newsletter Management',
    description: 'List all dispatch newsletters with status, schedules, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    expectedOutput: {
      description: 'An array of newsletter records.',
      sample: {
        newsletters: [
          {
            id: 'dda7b810-9dad-11d1-80b4-00c04fd430cf',
            slug: 'volta-dispatch-2026-09',
            subject: 'Volta Dispatch - Autumn 2026',
            previewText: 'Key startup updates and founder wins.',
            status: 'DRAFT',
            scheduledFor: '2026-09-30T13:00:00.000Z',
            createdAt: '2026-09-24T12:00:00.000Z',
          },
        ],
      },
    },
  },
  {
    name: 'newsletter.get',
    category: 'Newsletter Management',
    description: 'Get one newsletter edition by ID including status and Mailchimp campaign linkages.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the newsletter.',
        },
      },
      required: ['id'],
    },
    expectedOutput: {
      description: 'Newsletter details record or null if not found.',
      sample: {
        newsletter: {
          id: 'dda7b810-9dad-11d1-80b4-00c04fd430cf',
          slug: 'volta-dispatch-2026-09',
          subject: 'Volta Dispatch - Autumn 2026',
          previewText: 'Key startup updates and founder wins.',
          status: 'DRAFT',
          mailchimpCampaignId: 'mc_camp_123',
          mailchimpWebId: 456789,
          mailchimpArchiveUrl: 'https://mailchi.mp/volta/autumn-2026',
          scheduledFor: '2026-09-30T13:00:00.000Z',
          createdAt: '2026-09-24T12:00:00.000Z',
        },
      },
    },
  },
  {
    name: 'newsletter.create',
    category: 'Newsletter Management',
    description: 'Create a new draft newsletter campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          required: true,
          validation: '1-120 chars',
          description: 'URL-friendly unique identifier for the newsletter edition.',
        },
        subject: {
          type: 'string',
          required: true,
          validation: '1-180 chars',
          description: 'Email subject line.',
        },
        previewText: {
          type: 'string',
          required: false,
          validation: 'Max 280 chars',
          description: 'Preheader / preview text visible in email clients.',
        },
        scheduledFor: {
          type: 'string',
          format: 'iso datetime',
          required: false,
          description: 'Planned publication/send timestamp.',
        },
      },
      required: ['slug', 'subject'],
    },
    expectedOutput: {
      description: 'The created newsletter record in DRAFT status.',
      sample: {
        newsletter: {
          id: 'dda7b810-9dad-11d1-80b4-00c04fd430cf',
          slug: 'volta-dispatch-2026-09',
          subject: 'Volta Dispatch - Autumn 2026',
          previewText: 'Key updates',
          status: 'DRAFT',
          scheduledFor: '2026-09-30T13:00:00.000Z',
          createdAt: '2026-09-24T15:10:00.000Z',
        },
      },
    },
  },
  {
    name: 'newsletter.add_item',
    category: 'Newsletter Management',
    description: 'Attach an approved content item to a newsletter section at a given position.',
    inputSchema: {
      type: 'object',
      properties: {
        newsletterId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the target newsletter.',
        },
        contentItemId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item to attach.',
        },
        section: {
          type: 'string',
          enum: ['FEATURED', 'STORIES', 'EVENTS', 'WINS', 'OPPORTUNITIES', 'COMMUNITY'],
          required: true,
          description: 'Section of the newsletter where the item should appear.',
        },
        position: {
          type: 'integer',
          required: false,
          validation: '>= 0',
          description: 'Zero-indexed position within the section (defaults to 0).',
        },
      },
      required: ['newsletterId', 'contentItemId', 'section'],
    },
    expectedOutput: {
      description: 'Success status confirmation.',
      sample: {
        success: true,
      },
    },
  },
  {
    name: 'newsletter.remove_item',
    category: 'Newsletter Management',
    description: 'Detach a content item from a newsletter edition.',
    inputSchema: {
      type: 'object',
      properties: {
        newsletterId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the newsletter.',
        },
        contentItemId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the content item to remove.',
        },
      },
      required: ['newsletterId', 'contentItemId'],
    },
    expectedOutput: {
      description: 'Success status confirmation.',
      sample: {
        success: true,
      },
    },
  },
  {
    name: 'newsletter.render',
    category: 'Newsletter Publishing',
    description: 'Render the complete HTML email template through the Pug and Juice inlining pipeline with tracked click links.',
    inputSchema: {
      type: 'object',
      properties: {
        newsletterId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the newsletter to render.',
        },
      },
      required: ['newsletterId'],
    },
    expectedOutput: {
      description: 'Success flag, newsletter model, and inlined HTML string.',
      sample: {
        success: true,
        newsletter: {
          id: 'dda7b810-9dad-11d1-80b4-00c04fd430cf',
          slug: 'volta-dispatch-2026-09',
        },
        htmlContent: '<!DOCTYPE html><html><head>...</head><body>...</body></html>',
      },
    },
  },
  {
    name: 'newsletter.sync_mailchimp',
    category: 'Newsletter Publishing',
    description: 'Perform server-side publication eligibility verification (consents and approvals) and sync rendered content into Mailchimp.',
    inputSchema: {
      type: 'object',
      properties: {
        newsletterId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the newsletter to sync.',
        },
      },
      required: ['newsletterId'],
    },
    expectedOutput: {
      description: 'Success status, Mailchimp campaign ID, and web archive URL (or error reason on eligibility failure).',
      sample: {
        success: true,
        campaignId: 'mc_camp_123456789',
        archiveUrl: 'https://mailchi.mp/volta/autumn-2026',
      },
    },
  },
  {
    name: 'newsletter.send',
    category: 'Newsletter Publishing',
    description: 'Trigger campaign send on Mailchimp after validating server-side publication eligibility gates, and archive attached content items.',
    inputSchema: {
      type: 'object',
      properties: {
        newsletterId: {
          type: 'string',
          format: 'uuid',
          required: true,
          description: 'UUID of the newsletter to send.',
        },
      },
      required: ['newsletterId'],
    },
    expectedOutput: {
      description: 'Success confirmation upon completed broadcast.',
      sample: {
        success: true,
      },
    },
  },
  {
    name: 'plugin.help',
    category: 'Plugin Utilities',
    description: 'Show comprehensive documentation, schemas, parameter rules, and expected output examples for all Volta MCP tools.',
    inputSchema: {
      type: 'object',
      properties: {
        tool: {
          type: 'string',
          required: false,
          description: 'Optional name of a specific tool to inspect.',
        },
        format: {
          type: 'string',
          enum: ['html', 'json', 'text'],
          required: false,
          description: 'Desired output format (defaults to html).',
        },
      },
    },
    expectedOutput: {
      description: 'HTML documentation string (in content text) and structured metadata.',
      sample: {
        format: 'html',
        totalTools: 31,
        categories: [
          'Content Management',
          'Revisions & Consents',
          'Founder Submissions',
          'News Curation',
          'News Sources',
          'Delivery & Notifications',
          'Newsletter Management',
          'Newsletter Publishing',
          'Plugin Utilities',
        ],
        html: '<!doctype html>...',
      },
    },
  },
];

export function generateToolsDocumentationHtml(): string {
  const categories = Array.from(new Set(VOLTA_MCP_TOOLS.map((t) => t.category)));
  
  const toolRows = VOLTA_MCP_TOOLS.map((tool) => {
    const properties = tool.inputSchema.properties;
    const requiredProps = tool.inputSchema.required || [];
    const propRows = Object.entries(properties).map(([name, def]) => {
      const isReq = def.required ?? requiredProps.includes(name);
      return `
        <tr>
          <td><code class="param-name">${name}</code></td>
          <td><span class="type-badge ${def.type}">${def.type}${def.format ? ` (${def.format})` : ''}</span></td>
          <td>${isReq ? '<span class="req-badge">Required</span>' : '<span class="opt-badge">Optional</span>'}</td>
          <td>${def.enum ? `<code>${def.enum.join(' | ')}</code>` : (def.validation ? `<em>${def.validation}</em>` : '-')}</td>
          <td>${def.description || ''}</td>
        </tr>
      `;
    }).join('');

    const inputTable = Object.keys(properties).length > 0 ? `
      <table class="params-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Presence</th>
            <th>Constraints / Enum</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${propRows}
        </tbody>
      </table>
    ` : '<p class="empty-params"><em>No input parameters required.</em></p>';

    const sampleJson = JSON.stringify(tool.expectedOutput.sample, null, 2);

    return `
      <article class="tool-card" id="tool-${tool.name.replace(/\./g, '-')}" data-category="${tool.category}" data-name="${tool.name}">
        <div class="tool-header">
          <div class="tool-title-group">
            <span class="category-tag">${tool.category}</span>
            <h3 class="tool-name"><code>${tool.name}</code></h3>
          </div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText('${tool.name}')" title="Copy tool name">Copy Name</button>
        </div>
        <p class="tool-desc">${tool.description}</p>
        
        <div class="tool-section">
          <h4 class="section-title">Input Parameters</h4>
          ${inputTable}
        </div>

        <div class="tool-section">
          <h4 class="section-title">Expected Output Format</h4>
          <p class="output-desc">${tool.expectedOutput.description}</p>
          <div class="code-block-container">
            <pre><code class="language-json">${escapeHtml(sampleJson)}</code></pre>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const categoryFilterButtons = categories.map((cat, idx) => `
    <button class="filter-btn ${idx === 0 ? 'active' : ''}" data-category="${cat}" onclick="filterCategory('${cat}', this)">${cat}</button>
  `).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Volta MCP Tools Reference & Documentation</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --border-accent: #388bfd;
      --text: #c9d1d9;
      --text-heading: #f0f6fc;
      --text-muted: #8b949e;
      --primary: #238636;
      --primary-hover: #2ea043;
      --accent-blue: #58a6ff;
      --accent-purple: #bc8cff;
      --accent-green: #3fb950;
      --accent-orange: #d29922;
      --code-bg: #0b0e14;
      --badge-req: #da3633;
      --badge-opt: #6e7681;
      --shadow: 0 8px 24px rgba(1, 4, 9, 0.6);
      --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-main);
      line-height: 1.6;
      padding: 32px 20px 80px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }

    .header-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-blue);
      background: rgba(56, 139, 253, 0.15);
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
      border: 1px solid rgba(56, 139, 253, 0.3);
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-heading);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .lead {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 800px;
    }

    .summary-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .summary-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }

    .summary-card .num {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-heading);
    }

    .summary-card .label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .controls-panel {
      position: sticky;
      top: 12px;
      z-index: 100;
      background: rgba(22, 27, 34, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 28px;
      box-shadow: var(--shadow);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    .search-input {
      background: var(--code-bg);
      border: 1px solid var(--border);
      color: var(--text-heading);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 0.9rem;
      width: 280px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent-blue);
    }

    .filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .filter-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }

    .filter-btn:hover {
      background: var(--border);
      color: var(--text-heading);
    }

    .filter-btn.active {
      background: var(--accent-blue);
      border-color: var(--accent-blue);
      color: #ffffff;
      font-weight: 600;
    }

    .tool-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .tool-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 24px;
      box-shadow: var(--shadow);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .tool-card:hover {
      border-color: var(--border-accent);
    }

    .tool-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .tool-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .category-tag {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      background: rgba(188, 140, 255, 0.15);
      color: var(--accent-purple);
      border: 1px solid rgba(188, 140, 255, 0.3);
      border-radius: 4px;
    }

    .tool-name code {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent-blue);
    }

    .copy-btn {
      background: var(--code-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .copy-btn:hover {
      background: var(--border);
      color: var(--text-heading);
    }

    .tool-desc {
      font-size: 0.98rem;
      color: var(--text);
      margin-bottom: 20px;
    }

    .tool-section {
      margin-top: 18px;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(48, 54, 61, 0.5);
      padding-bottom: 4px;
    }

    .params-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      margin-top: 8px;
    }

    .params-table th {
      text-align: left;
      padding: 8px 12px;
      background: var(--code-bg);
      color: var(--text-muted);
      font-weight: 600;
      border: 1px solid var(--border);
    }

    .params-table td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      vertical-align: top;
    }

    .param-name {
      font-family: var(--font-mono);
      color: var(--accent-orange);
      font-weight: 600;
    }

    .type-badge {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(110, 118, 129, 0.2);
    }

    .req-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #ff7b72;
      background: rgba(218, 54, 51, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(218, 54, 51, 0.3);
    }

    .opt-badge {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: rgba(110, 118, 129, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .output-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .code-block-container {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      overflow-x: auto;
    }

    .code-block-container pre {
      margin: 0;
    }

    .code-block-container code {
      font-family: var(--font-mono);
      font-size: 0.84rem;
      color: var(--accent-green);
      line-height: 1.45;
    }

    .empty-params {
      font-size: 0.88rem;
      color: var(--text-muted);
      padding: 6px 0;
    }

    footer {
      margin-top: 60px;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }

    @media (max-width: 768px) {
      .controls-panel {
        flex-direction: column;
        align-items: stretch;
      }
      .search-input {
        width: 100%;
      }
      .params-table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="header-badge">Model Context Protocol Reference</span>
      <h1>Volta MCP Tools Documentation</h1>
      <p class="lead">Complete specification of tools, input schemas, parameter requirements, and expected structured outputs for the Volta Curator MCP Server.</p>
      
      <div class="summary-bar">
        <div class="summary-card">
          <div class="num">${VOLTA_MCP_TOOLS.length}</div>
          <div class="label">Total Registered Tools</div>
        </div>
        <div class="summary-card">
          <div class="num">${categories.length}</div>
          <div class="label">Functional Categories</div>
        </div>
        <div class="summary-card">
          <div class="num">v0.1.0</div>
          <div class="label">MCP Protocol Version</div>
        </div>
      </div>
    </header>

    <div class="controls-panel">
      <input type="text" id="toolSearch" class="search-input" placeholder="Search tools or keywords..." oninput="handleSearch(this.value)">
      <div class="filter-group">
        <button class="filter-btn active" data-category="ALL" onclick="filterCategory('ALL', this)">All (${VOLTA_MCP_TOOLS.length})</button>
        ${categoryFilterButtons}
      </div>
    </div>

    <main class="tool-list" id="toolList">
      ${toolRows}
    </main>

    <footer>
      <p>Volta MCP Documentation &bull; Generated for Volta Newsletter & Curation System</p>
    </footer>
  </div>

  <script>
    let currentCategory = 'ALL';
    let currentQuery = '';

    function filterCategory(cat, btn) {
      currentCategory = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    }

    function handleSearch(val) {
      currentQuery = (val || '').toLowerCase().trim();
      applyFilters();
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.tool-card');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const name = card.getAttribute('data-name').toLowerCase();
        const text = card.textContent.toLowerCase();

        const matchCat = (currentCategory === 'ALL' || cat === currentCategory);
        const matchQuery = (!currentQuery || name.includes(currentQuery) || text.includes(currentQuery));

        if (matchCat && matchQuery) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getMcpToolsHtml(): string {
  return generateToolsDocumentationHtml();
}

export function writeDocumentationFile(filePath?: string): string {
  const targetPath = filePath || path.join(process.cwd(), 'docs', 'mcp-tools.html');
  const html = generateToolsDocumentationHtml();
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, html, 'utf-8');
  return targetPath;
}
