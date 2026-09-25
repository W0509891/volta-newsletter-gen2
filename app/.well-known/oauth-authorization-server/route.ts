import { issuerFromRequest, oauthMetadata } from '@/lib/oauth/claude-mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return Response.json(oauthMetadata(issuerFromRequest(request)));
}

