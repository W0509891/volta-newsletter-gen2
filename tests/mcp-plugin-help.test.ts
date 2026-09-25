import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { createVoltaMcpServer } from '../mcp/volta/server';
import { VOLTA_MCP_TOOLS, generateToolsDocumentationHtml } from '../mcp/volta/docs';

test('VOLTA_MCP_TOOLS contains all registered tool definitions with descriptions and schemas', () => {
  assert.ok(VOLTA_MCP_TOOLS.length >= 31, `Expected at least 31 tools, found ${VOLTA_MCP_TOOLS.length}`);

  const requiredTools = [
    'content.search',
    'content.get',
    'content.create',
    'content.change_status',
    'revision.current',
    'consent.create_request',
    'submission.list',
    'submission.get',
    'submission.promote',
    'submission.reject',
    'news.search',
    'news.get',
    'news.promote',
    'news.save',
    'news.dismiss',
    'source.list',
    'source.add',
    'source.remove',
    'source.set_enabled',
    'source.check_now',
    'delivery.build_digest',
    'delivery.send_slack',
    'delivery.send_discord',
    'newsletter.list',
    'newsletter.get',
    'newsletter.create',
    'newsletter.add_item',
    'newsletter.remove_item',
    'newsletter.render',
    'newsletter.sync_mailchimp',
    'newsletter.send',
    'plugin.help',
  ];

  for (const toolName of requiredTools) {
    const found = VOLTA_MCP_TOOLS.find((t) => t.name === toolName);
    assert.ok(found, `Tool ${toolName} must be defined in VOLTA_MCP_TOOLS`);
    assert.ok(found.description.length > 0, `Tool ${toolName} must have a description`);
    assert.ok(found.category.length > 0, `Tool ${toolName} must have a category`);
    assert.ok(found.inputSchema, `Tool ${toolName} must have an inputSchema`);
    assert.ok(found.expectedOutput?.sample, `Tool ${toolName} must have expectedOutput.sample`);
  }
});

test('generateToolsDocumentationHtml generates valid HTML with interactive filters and full tool metadata', () => {
  const html = generateToolsDocumentationHtml();

  assert.ok(html.startsWith('<!doctype html>'), 'HTML must start with doctype');
  assert.ok(html.includes('Volta MCP Tools Documentation'), 'HTML must contain title');
  assert.ok(html.includes('content.search'), 'HTML must contain content.search');
  assert.ok(html.includes('newsletter.sync_mailchimp'), 'HTML must contain newsletter.sync_mailchimp');
  assert.ok(html.includes('plugin.help'), 'HTML must contain plugin.help');
  assert.ok(html.includes('Expected Output Format'), 'HTML must contain expected output sections');
  assert.ok(html.includes('Input Parameters'), 'HTML must contain input parameters sections');
});

test('docs/mcp-tools.html exists and contains complete documentation', () => {
  const docPath = path.join(process.cwd(), 'docs', 'mcp-tools.html');
  assert.ok(fs.existsSync(docPath), 'docs/mcp-tools.html must exist on disk');

  const content = fs.readFileSync(docPath, 'utf-8');
  assert.ok(content.length > 1000, 'docs/mcp-tools.html must have substantial content');
  assert.ok(content.includes('plugin.help'), 'docs/mcp-tools.html must document plugin.help');
});

test('createVoltaMcpServer registers plugin.help tool and returns HTML documentation', async () => {
  const server = createVoltaMcpServer();
  assert.ok(server, 'McpServer must be created');

  // Let's verify server tool handlers directly or through server properties
  // The McpServer instance contains registered tools
  const serverWithTools = server as unknown as {
    _registeredTools: Record<string, { handler: (args?: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }>; structuredContent?: Record<string, unknown> }> }>;
  };
  const tools = serverWithTools._registeredTools;
  assert.ok(tools, 'Registered tools must exist on McpServer');
  assert.ok(tools['plugin.help'], 'plugin.help must be registered');
  assert.ok(tools['source.set_enabled'], 'source.set_enabled must be registered');
  assert.ok(tools['source.update_eligibility'], 'source.update_eligibility must be registered');
  assert.ok(tools['do_not_feature.insert'], 'do_not_feature.insert must be registered');
  assert.ok(tools['do_not_feature.update'], 'do_not_feature.update must be registered');
  assert.ok(tools['do_not_feature.list'], 'do_not_feature.list must be registered');
  assert.ok(tools['do_not_feature.get'], 'do_not_feature.get must be registered');

  const helpTool = tools['plugin.help'];
  const result = await helpTool.handler({});
  assert.ok(result, 'Tool execution result must exist');
  assert.ok(Array.isArray(result.content), 'Result must have content array');
  assert.equal(result.content[0].type, 'text');
  assert.ok(result.content[0].text.includes('<!doctype html>'), 'Content text must contain HTML documentation');
  assert.ok(result.content[0].text.includes('Volta MCP Tools Documentation'));
  assert.equal(result.structuredContent?.contentType, 'text/html');
  assert.ok(result.structuredContent?.html);

  // Test json format option
  const jsonResult = await helpTool.handler({ format: 'json' });
  assert.ok(jsonResult.structuredContent?.tools, 'JSON format should return tools array');
  assert.ok(jsonResult.structuredContent?.totalTools >= 31, 'JSON format should include totalTools count');
});
