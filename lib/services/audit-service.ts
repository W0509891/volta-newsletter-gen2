import { createAuditLog } from '@/lib/db/queries';

export async function auditAgentAction(data: {
  actor: 'FOUNDER_MCP' | 'VOLTA_MCP' | 'WORKER' | 'WEB';
  action: string;
  subjectType?: string;
  subjectId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    return await createAuditLog(data);
  } catch (error) {
    console.error('Audit log failed:', error);
    return null;
  }
}
