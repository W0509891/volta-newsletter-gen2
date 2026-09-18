'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Newsletter } from '@/lib/types';
import { createNewNewsletterAction } from '@/app/actions/newsletters';
import {
  Mail,
  Plus,
  ArrowRight,
  Eye,
  Send,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BarChart3,
  X,
  Loader2,
} from 'lucide-react';

interface Props {
  newsletters: Newsletter[];
}

export function NewslettersList({ newsletters }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim() || !subject.trim()) return;

    setLoading(true);
    try {
      await createNewNewsletterAction({
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        subject: subject.trim(),
        previewText: previewText.trim() || undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      });
      setIsModalOpen(false);
      setSlug('');
      setSubject('');
      setPreviewText('');
      setScheduledFor('');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Email Dispatches
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Stage curated items into monthly dispatches, compile Pug templates, and push to Mailchimp.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      {newsletters.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-300">
            No newsletters created yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Click &ldquo;New Dispatch&rdquo; above to start drafting your next monthly newsletter.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-800">
          {newsletters.map((nl) => {
            const isSent = nl.status === 'SENT';

            return (
              <div
                key={nl.id}
                className="p-5 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isSent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {nl.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      /{nl.slug}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {nl.itemCount || 0} items attached
                    </span>
                  </div>

                  <Link
                    href={`/admin/newsletters/${nl.id}`}
                    className="font-bold text-slate-100 hover:text-amber-400 text-lg transition-colors block truncate"
                  >
                    {nl.subject}
                  </Link>

                  {nl.previewText && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {nl.previewText}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    {nl.sentAt ? (
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sent on {new Date(nl.sentAt).toLocaleDateString()}</span>
                      </span>
                    ) : nl.scheduledFor ? (
                      <span className="flex items-center space-x-1 text-purple-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Scheduled: {new Date(nl.scheduledFor).toLocaleDateString()}</span>
                      </span>
                    ) : (
                      <span>Draft stage</span>
                    )}

                    {nl.mailchimpArchiveUrl && (
                      <a
                        href={nl.mailchimpArchiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-sky-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Mailchimp Archive</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/admin/newsletters/${nl.id}/preview`}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview Email</span>
                  </Link>

                  <Link
                    href={`/admin/newsletters/${nl.id}/report`}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium flex items-center space-x-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analytics</span>
                  </Link>

                  <Link
                    href={`/admin/newsletters/${nl.id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-semibold flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <span>Create New Dispatch</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dispatch Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Volta Builders Dispatch: Edge AI & Marine Robotics"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Campaign Slug (used for UTM tracking) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. 2026-11-builders-dispatch"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preview Teaser (Inboxes show next to subject)
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Elena Rostova details real-time 60fps edge computer vision..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Send Date (optional)
                </label>
                <input
                  type="date"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  Create Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
