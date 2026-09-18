'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newsletter,
  NewsletterSection,
  TrackedLink,
} from '@/lib/types';
import {
  NewsletterItemWithContent,
} from '@/lib/db/queries';
import {
  detachItemFromNewsletterAction,
} from '@/app/actions/items';
import {
  pushToMailchimpAction,
  sendMailchimpCampaignAction,
} from '@/app/actions/newsletters';
import {
  ArrowLeft,
  Eye,
  Send,
  Trash2,
  ExternalLink,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface Props {
  newsletter: Newsletter;
  itemsWithContent: NewsletterItemWithContent[];
  trackedLinks: TrackedLink[];
}

const SECTION_TITLES: Record<NewsletterSection, string> = {
  FEATURED: '⭐ Featured Builder Story',
  STORIES: '📖 Founder & Lab Stories',
  EVENTS: '📅 Upcoming Practice Sessions & Workshops',
  WINS: '🏆 Community Wins & Milestones',
  OPPORTUNITIES: '🚀 Opportunities & Residency Grants',
  COMMUNITY: '💬 Community Discussions & Milestones',
};

export function NewsletterDetailClient({
  newsletter,
  itemsWithContent,
  trackedLinks,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleDetach(contentItemId: string) {
    if (!confirm('Remove this item from the dispatch?')) return;
    await detachItemFromNewsletterAction(newsletter.id, contentItemId);
    router.refresh();
  }

  async function handlePush() {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await pushToMailchimpAction(newsletter.id);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Pushed to Mailchimp! Campaign ID: ${res.campaignId}`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Push failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!confirm('Irreversible action: Send this newsletter to the entire Volta audience list now?')) {
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await sendMailchimpCampaignAction(newsletter.id);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Campaign dispatched successfully!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Send failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Group items by section
  const sections: NewsletterSection[] = [
    'FEATURED',
    'STORIES',
    'EVENTS',
    'WINS',
    'OPPORTUNITIES',
    'COMMUNITY',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/newsletters"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {newsletter.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                /{newsletter.slug}
              </span>
              {newsletter.mailchimpCampaignId && (
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                  MC: {newsletter.mailchimpCampaignId}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              {newsletter.subject}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/newsletters/${newsletter.id}/preview`}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Email</span>
          </Link>

          <Link
            href={`/admin/newsletters/${newsletter.id}/report`}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium flex items-center space-x-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Funnel Analytics</span>
          </Link>

          <button
            onClick={handlePush}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Push to Mailchimp</span>
          </button>

          <button
            onClick={handleSend}
            disabled={loading || newsletter.status === 'SENT'}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            {newsletter.status === 'SENT' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sent</span>
              </>
            ) : (
              <span>Send Campaign</span>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Dispatch Sections & Items */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Staged Dispatch Sections ({itemsWithContent.length} items)
          </h2>
          <Link
            href="/admin"
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            + Attach more from Curation Pipeline
          </Link>
        </div>

        {itemsWithContent.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <p className="text-base font-medium text-slate-300">
              No content items attached to this dispatch yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Go to the Curation Pipeline, review approved stories, and click &ldquo;Attach to Dispatch&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((sec) => {
              const secItems = itemsWithContent.filter((i) => i.section === sec);
              if (secItems.length === 0) return null;

              return (
                <div
                  key={sec}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                    <span>{SECTION_TITLES[sec]}</span>
                    <span className="text-slate-400">{secItems.length} items</span>
                  </div>

                  <div className="divide-y divide-slate-800/80">
                    {secItems.map(({ item, trackedUrl }) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/items/${item.id}`}
                              className="font-semibold text-slate-100 hover:text-amber-400 text-sm truncate"
                            >
                              {item.title}
                            </Link>
                            {item.consentStatus === 'GRANTED' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>

                          {item.summary && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {item.summary}
                            </p>
                          )}

                          {trackedUrl && (
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono truncate">
                              <LinkIcon className="w-3 h-3 text-sky-400 shrink-0" />
                              <span className="truncate">{trackedUrl}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <Link
                            href={`/admin/items/${item.id}`}
                            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-700"
                          >
                            Edit Item
                          </Link>
                          <button
                            onClick={() => handleDetach(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                            title="Remove from dispatch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tracked Links & UTM Table (Step 06) */}
        {trackedLinks.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8">
            <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  UTM Tracked Outbound Links ({trackedLinks.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Auto-generated for campaign: <span className="font-mono text-amber-300">{newsletter.slug}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/40 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Original URL</th>
                    <th className="px-4 py-2.5">UTM Tagged Destination</th>
                    <th className="px-4 py-2.5 text-right">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {trackedLinks.map((tl) => (
                    <tr key={tl.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-slate-300 truncate max-w-xs">
                        <a
                          href={tl.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span className="truncate">{tl.originalUrl}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-sky-400 truncate max-w-md">
                        <span title={tl.destinationUrl}>{tl.destinationUrl}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-400">
                        {tl.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
