import { recordConsent } from '@/lib/db/queries';
import { ConsentMethod, ConsentStatus } from '@/lib/types';

export async function recordContentConsent(data: {
  contentItemId: string;
  contactId: string;
  status: ConsentStatus;
  method: ConsentMethod;
  evidence?: string;
  notes?: string;
}) {
  return recordConsent({
    contentItemId: data.contentItemId,
    contactId: data.contactId,
    status: data.status,
    method: data.method,
    evidence: data.evidence || null,
    notes: data.notes || null,
  });
}
