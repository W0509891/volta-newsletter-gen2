import { issuerFromRequest } from '@/lib/oauth/claude-mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = issuerFromRequest(request);
  return Response.json({
    resource: `${origin}/mcp/volta`,
    authorization_servers: [origin],
    resource_name: 'Volta MCP',
  });
}

