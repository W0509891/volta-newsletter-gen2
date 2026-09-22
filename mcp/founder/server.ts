import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import { submitFounderContent } from '@/lib/services/submission-service';

const urlSchema = z.url().max(2048);

const founderSkills = [
  {
    id: 'submit-founder-update',
    name: 'Submit founder update',
    description:
      'Package a founder milestone, company win, event, opportunity, or community update for Volta editorial review.',
    actor: 'FOUNDER',
    requiredTools: ['submission.create'],
    instructions:
      'Collect only the information the founder wants Volta to review. Submit it once with submission.create. Treat the returned submissionId as a receipt only; do not attempt to read, update, or list internal newsletter data.',
  },
];

export function createFounderMcpServer() {
  const server = new McpServer({
    name: 'volta-founder-submissions',
    version: '0.1.0',
  });

  server.registerResource(
    'founder-skills-catalog',
    'skills://catalog',
    {
      title: 'Founder Skills Catalog',
      description: 'Append-only founder submission workflows available to external agents.',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [
        {
          uri: 'skills://catalog',
          mimeType: 'application/json',
          text: JSON.stringify(founderSkills, null, 2),
        },
      ],
    })
  );

  server.registerTool(
    'submission.create',
    {
      title: 'Create Founder Submission',
      description:
        'Append a founder-controlled newsletter submission. Returns only a receipt and does not expose internal newsletter data.',
      inputSchema: {
        type: z.enum([
          'FEATURED',
          'STORIES',
          'EVENTS',
          'WINS',
          'OPPORTUNITIES',
          'COMMUNITY',
          'OTHER',
        ]),
        title: z.string().trim().max(180).optional(),
        summary: z.string().trim().max(600).optional(),
        body: z.string().trim().max(6000).optional(),
        companyName: z.string().trim().max(180).optional(),
        founderName: z.string().trim().max(180).optional(),
        contactName: z.string().trim().max(180).optional(),
        contactEmail: z.email().optional(),
        sourceUrls: z.array(urlSchema).max(10).optional(),
        mediaUrls: z.array(urlSchema).max(10).optional(),
        event: z
          .object({
            name: z.string().trim().max(180).optional(),
            startAt: z.iso.datetime().optional(),
            endAt: z.iso.datetime().optional(),
            location: z.string().trim().max(240).optional(),
            registrationUrl: urlSchema.optional(),
          })
          .optional(),
        notes: z.string().trim().max(1000).optional(),
      },
      outputSchema: {
        submissionId: z.string().uuid(),
        receivedAt: z.iso.datetime(),
        status: z.literal('RECEIVED'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (input) => {
      const receipt = await submitFounderContent(input);
      const structuredContent: Record<string, unknown> = {
        submissionId: receipt.submissionId,
        receivedAt: receipt.receivedAt,
        status: receipt.status,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(structuredContent, null, 2),
          },
        ],
        structuredContent,
      };
    }
  );

  return server;
}
