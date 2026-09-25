---
name: service-writer
description: Add a new capability to the Volta backend end-to-end: write the DB query, wrap it in a service function, and (if agents need it) register it as an MCP tool. Use whenever the user asks to add or change a query, service, endpoint, or MCP tool in the Volta codebase.
---

# Service Writer

Build new functionality in three layers. Each layer only calls the one below it.

| layer    | location                   | responsibility                                                |
|----------|----------------------------|---------------------------------------------------------------|
| Query    | `lib/db/queries.ts`        | Raw data access. No business logic.                           |
| Service  | `lib/services/<domain>.ts` | Business rules, validation, and orchestration. Calls queries. |
| MCP tool | `mcp/volta/server`         | Thin wrapper that exposes the service to agents. Optional.    |

## 1. Query: `lib/db/queries.ts`

Add a named, typed function. Keep it to a single data operation.

    export async function deleteNewsSource(id: string) {
      return db.delete(newsSources).where(eq(newsSources.id, id)).returning();
    }

## 2. Service: `lib/services/<domain>.ts`

Put it in the file that matches the domain (for example `sources.ts`, `newsletters.ts`, `content.ts`). Create a new domain file only if none fits.

    export async function removeSource(id: string) {
      const [deleted] = await deleteNewsSource(id);
      if (!deleted) throw new Error(`Source ${id} not found`);
      return { source: { id: deleted.id, deleted: true } };
    }

Rules:
- Keep all business logic here (eligibility checks, status transitions, audit logs).
- Throw clear errors, and never return `null` silently.
- Return plain serializable objects.

## 3. MCP tool: `mcp/volta/server`

Register a tool only if agents need the capability.

    server.registerTool(
      'source.remove',
      {
        description: 'Remove a news source by ID.',
        inputSchema: {
          id: z.string().min(1).max(180),
        },
      },
      async ({ id }) => {
        const result = await removeSource(id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
    );

Conventions:
- Name tools `<domain>.<action>` (`newsletter.render`, `consent.create_request`).
- Descriptions are one short sentence saying what the tool does, not how.
- Validate every input with Zod, including enums, max lengths and UUIDs.
- The handler only calls the service, with no logic of its own.
- Add the tool to the `plugin.help` docs.

## Checklist

- [ ] Query added and typed
- [ ] Service in the correct domain file, with error handling
- [ ] MCP tool registered (if needed), with a Zod schema
- [ ] `plugin.help` docs updated