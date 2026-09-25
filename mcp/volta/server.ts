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
import {
  addNewsSource,
removeNewsSource,
  checkNewsSourcesNow,
  dismissNewsCandidate,
  getNewsCandidate,
  listNewsSources,
  promoteNewsCandidate,
  saveNewsCandidate,
  searchNewsCandidates,
} from '@/lib/services/news-service';
import {
  buildNewsDigest,
  sendNewsDigest,
} from '@/lib/notifications/notification-service';
import { getMcpToolsHtml, VOLTA_MCP_TOOLS } from './docs';

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
const newsStatusSchema = z.enum(['NEW', 'SURFACED', 'SAVED', 'DISMISSED', 'PROMOTED']);
const newsSourceTypeSchema = z.enum([
  'RSS',
  'WEBSITE',
  'LINKEDIN_PAGE',
  'LINKEDIN_PROFILE',
  'MANUAL',
  'API',
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
      'news.search',
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
    'news.search',
    {
      description: 'Search reviewable news candidates.',
      inputSchema: {
        status: newsStatusSchema.optional(),
        search: z.string().trim().max(200).optional(),
      },
    },
    async (input) => jsonResult({ candidates: await searchNewsCandidates(input) })
  );

  server.registerTool(
    'news.get',
    {
      description: 'Get a news candidate by ID.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ candidate: await getNewsCandidate(id) })
  );

  server.registerTool(
    'news.promote',
    {
      description: 'Promote a news candidate into draft editorial content.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult(await promoteNewsCandidate(id))
  );

  server.registerTool(
    'news.save',
    {
      description: 'Save a news candidate for later review.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ candidate: await saveNewsCandidate(id) })
  );

  server.registerTool(
    'news.dismiss',
    {
      description: 'Dismiss a news candidate.',
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => jsonResult({ candidate: await dismissNewsCandidate(id) })
  );

  server.registerTool(
    'source.list',
    {
      description: 'List configured news sources.',
      inputSchema: { enabled: z.boolean().optional() },
    },
    async (input) => jsonResult({ sources: await listNewsSources(input) })
  );

  server.registerTool(
    'source.add',
    {
      description: 'Add a dynamic news source.',
      inputSchema: {
        name: z.string().trim().min(1).max(180),
        type: newsSourceTypeSchema,
        url: z.url(),
        enabled: z.boolean().optional(),
        pollingIntervalMinutes: z.number().int().min(5).max(10080).optional(),
        priority: z.number().int().min(-100).max(100).optional(),
      },
    },
    async (input) => jsonResult({ source: await addNewsSource(input) })
  );

  server.registerTool(
    'source.remove',
    {
      description: 'Remove a dynamic news source.',
      inputSchema: {
        id: z.string().trim().min(1).max(180),
      },
    },
    async (input) => jsonResult({ source: await removeNewsSource(input.id) })
  )
  server.registerTool(
    'source.check_now',
    {
      description: 'Run news aggregation for all enabled sources now.',
      inputSchema: {},
    },
    async () => jsonResult(await checkNewsSourcesNow())
  );

  server.registerTool(
    'delivery.build_digest',
    {
      description: 'Build a digest preview for undelivered news candidates.',
      inputSchema: {
        channel: z.enum(['SLACK', 'DISCORD']),
        limit: z.number().int().min(1).max(25).optional(),
      },
    },
    async (input) => jsonResult(await buildNewsDigest(input))
  );

  server.registerTool(
    'delivery.send_slack',
    {
      description: 'Send a Slack digest for undelivered news candidates.',
      inputSchema: {
        limit: z.number().int().min(1).max(25).optional(),
      },
    },
    async ({ limit }) => jsonResult(await sendNewsDigest({ channel: 'SLACK', limit }))
  );

  server.registerTool(
    'delivery.send_discord',
    {
      description: 'Send a Discord digest for undelivered news candidates.',
      inputSchema: {
        limit: z.number().int().min(1).max(25).optional(),
      },
    },
    async ({ limit }) => jsonResult(await sendNewsDigest({ channel: 'DISCORD', limit }))
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

  server.registerResource(
    'volta-mcp-documentation',
    'docs://mcp-tools',
    {
      title: 'Volta MCP Tools Documentation',
      description: 'Complete HTML reference and specifications for all Volta MCP tools and expected outputs.',
      mimeType: 'text/html',
    },
    async () => ({
      contents: [
        {
          uri: 'docs://mcp-tools',
          mimeType: 'text/html',
          text: getMcpToolsHtml(),
        },
      ],
    })
  );

  server.registerTool(
    'plugin.help',
    {
      description: 'Show comprehensive HTML documentation, parameter schemas, and expected outputs for all Volta MCP tools.',
      inputSchema: {
        tool: z.string().optional(),
        format: z.enum(['html', 'json', 'text']).optional(),
      },
    },
    async (input) => {
      const format = input?.format;
      const tool = input?.tool;
      const html = getMcpToolsHtml();

      if (format === 'json') {
        const filteredTools = tool
          ? VOLTA_MCP_TOOLS.filter((t) => t.name.toLowerCase() === tool.toLowerCase())
          : VOLTA_MCP_TOOLS;
        return jsonResult({
          tools: filteredTools,
          totalTools: filteredTools.length,
          html,
        });
      }

      return {
        content: [{ type: 'text' as const, text: html }],
        structuredContent: {
          contentType: 'text/html',
          html,
          totalTools: VOLTA_MCP_TOOLS.length,
        },
      };
    }
  );

  return server;
}
