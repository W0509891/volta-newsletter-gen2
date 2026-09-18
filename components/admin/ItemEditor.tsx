'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ContentItem,
  ContentItemStatus,
  ContentItemType,
  ConsentRecord,
  ConsentStatus,
  ConsentMethod,
  Contact,
  Event,
  Newsletter,
} from '@/lib/types';
import {
  saveItemDetailsAction,
  transitionItemStatusAction,
  recordConsentAction,
} from '@/app/actions/items';
import { AttachNewsletterModal } from './AttachNewsletterModal';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Archive,
  ExternalLink,
  Plus,
  Send,
  Loader2,
  History,
  User,
  Calendar,
} from 'lucide-react';

interface Props {
  item: ContentItem;
  consentRecords: ConsentRecord[];
  contacts: Contact[];
  events: Event[];
  newsletters: Newsletter[];
}

export function ItemEditor({
  item,
  consentRecords: initialConsentRecords,
  contacts: initialContacts,
  events,
  newsletters,
}: Props) {
  const router = useRouter();

  // Item form state
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState<ContentItemType>(item.type);
  const [summary, setSummary] = useState(item.summary || '');
  const [body, setBody] = useState(item.body || '');
  const [url, setUrl] = useState(item.url || '');
  const [featured, setFeatured] = useState(item.featured);
  const [contactId, setContactId] = useState(item.contactId || '');
  const [eventId, setEventId] = useState(item.eventId || '');
  const [revisitAt, setRevisitAt] = useState(
    item.revisitAt ? item.revisitAt.split('T')[0] : ''
  );
  const [rejectionReason, setRejectionReason] = useState(
    item.rejectionReason || ''
  );

  // Contacts
  const [contacts, setContacts] = useState(initialContacts);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactOrg, setNewContactOrg] = useState('');

  // Consent modal / record
  const [consentRecords, setConsentRecords] = useState(initialConsentRecords);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('GRANTED');
  const [consentMethod, setConsentMethod] = useState<ConsentMethod>('EMAIL');
  const [consentEvidence, setConsentEvidence] = useState('');
  const [consentNotes, setConsentNotes] = useState('');

  // Attach modal
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSaveDetails(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await saveItemDetailsAction(item.id, {
        title,
        type,
        summary,
        body,
        url: url.trim() || undefined,
        featured,
        contactId: contactId || null,
        eventId: eventId || null,
        revisitAt: revisitAt ? new Date(revisitAt).toISOString() : null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusTransition(newStatus: ContentItemStatus) {
    let reason = rejectionReason;
    if (newStatus === 'REJECTED' && !reason) {
      const promptReason = prompt('Reason for rejection:');
      if (promptReason === null) return;
      reason = promptReason;
      setRejectionReason(promptReason);
    }

    let revAt = revisitAt;
    if (newStatus === 'BACKLOG' && !revAt) {
      const defaultDate = new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split('T')[0];
      const promptDate = prompt('Enter revisit date (YYYY-MM-DD):', defaultDate);
      if (promptDate === null) return;
      revAt = promptDate;
      setRevisitAt(promptDate);
    }

    await transitionItemStatusAction(item.id, newStatus, {
      rejectionReason: reason || undefined,
      revisitAt: revAt ? new Date(revAt).toISOString() : undefined,
    });
    router.refresh();
  }

  async function handleRecordConsent(e: React.FormEvent) {
    e.preventDefault();
    const effectiveContactId = contactId || (contacts[0]?.id ?? '');
    if (!effectiveContactId) {
      alert('Please select or add a Contact first to record consent.');
      return;
    }

    setIsSaving(true);
    try {
      await recordConsentAction({
        contentItemId: item.id,
        contactId: effectiveContactId,
        status: consentStatus,
        method: consentMethod,
        evidence: consentEvidence.trim() || undefined,
        notes: consentNotes.trim() || undefined,
      });
      setShowConsentModal(false);
      setConsentEvidence('');
      setConsentNotes('');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {item.status}
              </span>
              <span className="text-xs text-slate-500">ID: {item.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5 truncate max-w-xl">
              {item.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {item.status === 'APPROVED' ? (
            <button
              onClick={() => setIsAttachOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center space-x-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Attach to Dispatch</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusTransition('APPROVED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center space-x-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve</span>
            </button>
          )}

          {item.status !== 'PENDING_CONSENT' && item.status !== 'APPROVED' && (
            <button
              onClick={() => handleStatusTransition('PENDING_CONSENT')}
              className="px-3 py-1.5 rounded-lg bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 border border-amber-500/40 text-sm font-medium flex items-center space-x-1"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Request Consent</span>
            </button>
          )}

          <button
            onClick={() => handleStatusTransition('BACKLOG')}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center space-x-1 ${
              item.status === 'BACKLOG'
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{item.status === 'BACKLOG' ? 'Update Backlog' : 'Move to Backlog'}</span>
          </button>

          <button
            onClick={() => handleStatusTransition('REJECTED')}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-sm flex items-center space-x-1"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>

          <button
            onClick={handleSaveDetails}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save Details'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <span>Item Editorial Content</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Content Section / Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ContentItemType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="STORY">Founder / Lab Story</option>
                  <option value="EVENT">Event / Workshop</option>
                  <option value="WIN">Community Win</option>
                  <option value="OPPORTUNITY">Opportunity / Grant</option>
                  <option value="COMMUNITY">Community Dispatch</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                />
                <label
                  htmlFor="featured-toggle"
                  className="text-sm font-medium text-slate-200 cursor-pointer"
                >
                  ⭐ Featured Top Item in Dispatch
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Teaser / Summary (1–2 sentences for newsletter render)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Body / Interview Excerpts / Lab Notes
              </label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Outbound Link URL (Automatically tagged with UTM on dispatch attach)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://voltaeffect.com/..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Rejection or Backlog Reason if present */}
          {(item.status === 'BACKLOG' || item.status === 'REJECTED') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Scheduling & Review Status</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Revisit Date
                  </label>
                  <input
                    type="date"
                    value={revisitAt}
                    onChange={(e) => setRevisitAt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rejection / Parked Reason
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Needs more benchmark metrics..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Relationships & Consent History */}
        <div className="space-y-6">
          {/* Linked Contact & Event */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Linked Contact & Stakeholder</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Stakeholder
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- No Contact Linked --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.email})` : c.email}{' '}
                    {c.organization ? `— ${c.organization}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Associated Event (optional)
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- No Event Linked --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.startsAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Consent Tracking & History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Consent Records</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Consent</span>
              </button>
            </div>

            {consentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                No consent records logged yet. Matt Cooper & Bader principle:
                explicit stakeholder approval required prior to dispatch.
              </p>
            ) : (
              <div className="space-y-3">
                {consentRecords.map((cr) => (
                  <div
                    key={cr.id}
                    className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          cr.status === 'GRANTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : cr.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {cr.status}
                      </span>
                      <span className="text-slate-500">
                        Method: {cr.method}
                      </span>
                    </div>

                    {cr.evidence && (
                      <p className="text-slate-300 italic pt-1 border-t border-slate-700/40">
                        &ldquo;{cr.evidence}&rdquo;
                      </p>
                    )}

                    <div className="text-slate-500 text-[11px] flex justify-between pt-1">
                      <span>Contact: {cr.contactEmail || 'N/A'}</span>
                      <span>
                        {new Date(cr.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-base font-semibold flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Record Stakeholder Consent</span>
            </h3>

            <form onSubmit={handleRecordConsent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Consent Status
                </label>
                <select
                  value={consentStatus}
                  onChange={(e) =>
                    setConsentStatus(e.target.value as ConsentStatus)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="GRANTED">Granted (Approved for newsletter)</option>
                  <option value="PENDING">Pending (Asked, awaiting response)</option>
                  <option value="REVOKED">Revoked (Contact asked not to share)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Consent Method
                </label>
                <select
                  value={consentMethod}
                  onChange={(e) =>
                    setConsentMethod(e.target.value as ConsentMethod)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="EMAIL">Email Confirmation</option>
                  <option value="RECORDING">Meeting / Interview Transcript</option>
                  <option value="VERBAL">Verbal Agreement</option>
                  <option value="FORM">Intake Webform Submission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Evidence / Quote (e.g. quote from transcript or email)
                </label>
                <textarea
                  rows={3}
                  value={consentEvidence}
                  onChange={(e) => setConsentEvidence(e.target.value)}
                  placeholder="e.g. Elena confirmed via email on Sept 14th..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  Save Consent Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach to Newsletter Modal */}
      <AttachNewsletterModal
        itemId={item.id}
        itemTitle={item.title}
        newsletters={newsletters}
        isOpen={isAttachOpen}
        onClose={() => setIsAttachOpen(false)}
      />
    </div>
  );
}
