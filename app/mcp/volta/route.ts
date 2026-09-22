import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { createVoltaMcpServer } from '@/mcp/volta/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version',
    'Access-Control-Expose-Headers': 'mcp-session-id, mcp-protocol-version',
  };
}

function unauthorized(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: corsHeaders() });
}

function assertAuthorized(request: Request) {
  const token = process.env.VOLTA_MCP_TOKEN;
  if (!token) {
    return unauthorized(503, 'VOLTA_MCP_TOKEN is not configured.');
  }

  const authorization = request.headers.get('authorization') || '';
  if (authorization !== `Bearer ${token}`) {
    return unauthorized(401, 'Unauthorized Volta MCP request.');
  }

  return null;
}

async function handleMcpRequest(request: Request) {
  const authFailure = assertAuthorized(request);
  if (authFailure) return authFailure;

  const clientKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous-volta-mcp';
  const rateLimit = checkRateLimit(`volta-mcp:${clientKey}`, {
    limit: 120,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return unauthorized(429, 'Too many Volta MCP requests. Please retry shortly.');
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createVoltaMcpServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
