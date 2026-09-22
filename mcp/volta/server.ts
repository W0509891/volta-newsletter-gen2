import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import {
  getContentItemById,
  getContentItems,
  getCurrentContentRevision,
  getNewsletterById,
  getNewsletters,
} from '@/lib/db/queries';
import {
  attachContentItemToNewsletter,
  createContentItemFromIntake,
  detachContentItemFromNewsletter,
  transitionContentItemStatus,
} from '@/lib/services/content-service';
import { createPreviewConsentRequest } from '@/lib/services/consent-service';
import {
  createDispatchNewsletter,
  pushDispatchNewsletterToMailchimp,
  renderDispatchNewsletter,
  sendDispatchNewsletter,
} from '@/lib/services/newsletter-service';
import {
  getFounderSubmission,
  listFounderSubmissions,
  promoteFounderSubmission,
  rejectFounderSubmission,
} from '@/lib/services/curation-service';

function jsonResult(value: Record<string, unknown>) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}

const contentTypeSchema = z.enum(['STORY', 'EVENT', 'WIN', 'OPPORTUNITY', 'COMMUNITY']);
const contentStatusSchema = z.enum([
  'INBOX',
  'DRAFT',
  'PENDING_CONSENT',
  'APPROVED',
  'REJECTED',
  'BACKLOG',
  'ARCHIVED',
]);
const newsletterSectionSchema = z.enum([
  'FEATURED',
  'STORIES',
  'EVENTS',
  'WINS',
  'OPPORTUNITIES',
  'COMMUNITY',
]);

const voltaSkills = [
  {
    id: 'review-founder-submissions',
    name: 'Review founder submissions',
    description: 'List received founder submissions and promote or reject them explicitly.',
    actor: 'VOLTA',
    requiredTools: ['submission.list', 'submission.get', 'submission.promote', 'submission.reject'],
    instructions:
      'Review source material, promote only suitable submissions to draft content, then edit and request revision-specific consent before publication.',
  },
  {
    id: 'prepare-newsletter',
    name: 'Prepare newsletter',
    description: 'Create a newsletter, attach eligible content, render it, and sync/send through Mailchimp gates.',
    actor: 'VOLTA',
    requiredTools: [
      'content.search',
      'newsletter.create',
      'newsletter.add_item',
      'newsletter.render',
      'newsletter.sync_mailchimp',
      'newsletter.send',
    ],
    instructions:
      'Use approved or consent-ready content. The sync and send tools enforce publication eligibility server-side.',
  },
];

export function createVoltaMcpServer() {
  const server = new McpServer({
    name: 'volta-curator',
    version: '0.1.0',
  });

  server.registerResource(
    'volta-skills-catalog',
    'skills://catalog',
    {
      title: 'Volta Skills Catalog',
      description: 'Trusted Volta curation workflows for the newsletter system.',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [
        {
          uri: 'skills://catalog',
          mimeType: 'application/json',
          text: JSON.stringify(voltaSkills, null, 2),
        },
      ],
    })
  );

  server.registerTool(
    'content.search',
    {
      description: 'Search newsletter content items.',
      inputSchema: {
        status: contentStatusSchema.optional(),
        type: contentTypeSchema.optional(),
        search: z.string().trim().max(200).optional(),
      },
    },
    async (input) => jsonResult({ items: await getContentItems(input) })
  );

  server.registerTool(
    'content.get',
    {
      description: 'Get one content item by ID.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ item: await getContentItemById(id) })
  );

  server.registerTool(
    'content.create',
    {
      description: 'Create a draft content item.',
      inputSchema: {
        title: z.string().trim().min(1).max(180),
        type: contentTypeSchema,
        summary: z.string().trim().max(600).optional(),
        body: z.string().trim().max(6000).optional(),
        url: z.url().optional(),
        contactEmail: z.email().optional(),
        contactName: z.string().trim().max(180).optional(),
        contactOrganization: z.string().trim().max(180).optional(),
      },
    },
    async (input) =>
      jsonResult({
        item: await createContentItemFromIntake({
          ...input,
          summary: input.summary || '',
          body: input.body || '',
          status: 'DRAFT',
        }),
      })
  );

  server.registerTool(
    'content.change_status',
    {
      description: 'Change content status or move content to backlog/rejected states.',
      inputSchema: {
        id: z.string().uuid(),
        status: contentStatusSchema,
        rejectionReason: z.string().trim().max(500).optional(),
        revisitAt: z.iso.datetime().optional(),
      },
    },
    async (input) =>
      jsonResult({
        item: await transitionContentItemStatus(input),
      })
  );

  server.registerTool(
    'revision.current',
    {
      description: 'Get the current immutable revision for a content item.',
      inputSchema: { contentItemId: z.string().uuid() },
    },
    async ({ contentItemId }) =>
      jsonResult({ revision: await getCurrentContentRevision(contentItemId) })
  );

  server.registerTool(
    'consent.create_request',
    {
      description: 'Create a secure revision-specific approval link.',
      inputSchema: {
        contentItemId: z.string().uuid(),
        contactId: z.string().uuid().optional(),
        recipientName: z.string().trim().max(180).optional(),
        recipientEmail: z.email().optional(),
        baseUrl: z.url(),
      },
    },
    async (input) => jsonResult(await createPreviewConsentRequest(input))
  );

  server.registerTool(
    'submission.list',
    {
      description: 'List founder submissions for curation.',
      inputSchema: {
        status: z.enum(['RECEIVED', 'TRIAGED', 'PROMOTED', 'REJECTED']).optional(),
      },
    },
    async (input) => jsonResult({ submissions: await listFounderSubmissions(input) })
  );

  server.registerTool(
    'submission.get',
    {
      description: 'Get a founder submission by ID.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ submission: await getFounderSubmission(id) })
  );

  server.registerTool(
    'submission.promote',
    {
      description: 'Promote a founder submission into a draft content item.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult(await promoteFounderSubmission(id))
  );

  server.registerTool(
    'submission.reject',
    {
      description: 'Reject a founder submission.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult(await rejectFounderSubmission(id))
  );

  server.registerTool(
    'newsletter.list',
    {
      description: 'List newsletters.',
      inputSchema: {},
    },
    async () => jsonResult({ newsletters: await getNewsletters() })
  );

  server.registerTool(
    'newsletter.get',
    {
      description: 'Get a newsletter by ID.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ newsletter: await getNewsletterById(id) })
  );

  server.registerTool(
    'newsletter.create',
    {
      description: 'Create a draft newsletter.',
      inputSchema: {
        slug: z.string().trim().min(1).max(120),
        subject: z.string().trim().min(1).max(180),
        previewText: z.string().trim().max(280).optional(),
        scheduledFor: z.iso.datetime().optional(),
      },
    },
    async (input) => jsonResult({ newsletter: await createDispatchNewsletter(input) })
  );

  server.registerTool(
    'newsletter.add_item',
    {
      description: 'Attach a content item to a newsletter.',
      inputSchema: {
        newsletterId: z.string().uuid(),
        contentItemId: z.string().uuid(),
        section: newsletterSectionSchema,
        position: z.number().int().min(0).optional(),
      },
    },
    async ({ newsletterId, contentItemId, section, position }) => {
      await attachContentItemToNewsletter(newsletterId, contentItemId, section, position || 0);
      return jsonResult({ success: true });
    }
  );

  server.registerTool(
    'newsletter.remove_item',
    {
      description: 'Detach a content item from a newsletter.',
      inputSchema: {
        newsletterId: z.string().uuid(),
        contentItemId: z.string().uuid(),
      },
    },
    async ({ newsletterId, contentItemId }) => {
      await detachContentItemFromNewsletter(newsletterId, contentItemId);
      return jsonResult({ success: true });
    }
  );

  server.registerTool(
    'newsletter.render',
    {
      description: 'Render newsletter HTML through the Pug/Juice pipeline.',
      inputSchema: { newsletterId: z.string().uuid() },
    },
    async ({ newsletterId }) => jsonResult(await renderDispatchNewsletter(newsletterId))
  );

  server.registerTool(
    'newsletter.sync_mailchimp',
    {
      description: 'Sync newsletter content to Mailchimp after eligibility checks.',
      inputSchema: { newsletterId: z.string().uuid() },
    },
    async ({ newsletterId }) =>
      jsonResult(await pushDispatchNewsletterToMailchimp(newsletterId))
  );

  server.registerTool(
    'newsletter.send',
    {
      description: 'Send a Mailchimp campaign after eligibility checks.',
      inputSchema: { newsletterId: z.string().uuid() },
    },
    async ({ newsletterId }) => jsonResult(await sendDispatchNewsletter(newsletterId))
  );

  return server;
}
