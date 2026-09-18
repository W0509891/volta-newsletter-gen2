'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newsletter,
  TrackedLink,
} from '@/lib/types';
import {
  NewsletterItemWithContent,
} from '@/lib/db/queries';
import { syncMailchimpReportsAction } from '@/app/actions/newsletters';
import { CampaignReport } from '@/lib/mailchimp';
import {
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Mail,
  MousePointerClick,
  Users,
  Eye,
  ExternalLink,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface Props {
  newsletter: Newsletter;
  items: NewsletterItemWithContent[];
  trackedLinks: TrackedLink[];
  initialReport: CampaignReport;
}

export function NewsletterReportClient({
  newsletter,
  items,
  trackedLinks,
  initialReport,
}: Props) {
  const router = useRouter();
  const [report, setReport] = useState<CampaignReport>(initialReport);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncMailchimpReportsAction(newsletter.id);
      if (res.success && res.report) {
        setReport(res.report);
        setSyncStatus('Metrics synced successfully from Mailchimp.');
        router.refresh();
      } else {
        setSyncStatus(res.error || 'Sync completed with cached metrics.');
      }
    } catch (err: any) {
      setSyncStatus(err.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  }

  // Calculate total tracked clicks across items
  const totalItemClicks = trackedLinks.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/newsletters/${newsletter.id}`}
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
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">
              Funnel Analytics &amp; Click Attribution
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync Mailchimp Metrics</span>
          </button>

          <Link
            href={`/admin/newsletters/${newsletter.id}/preview`}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Email</span>
          </Link>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Audience Reached</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {report.emailsSent.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Delivered via Mailchimp list</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Rate</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {(report.openRate * 100).toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500">
            {report.uniqueOpens} unique opens ({report.opens} total)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Click Rate</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {(report.clickRate * 100).toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500">
            {report.subscriberClicks} subscribers clicked
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Attributed Clicks</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {totalItemClicks}
          </p>
          <p className="text-[11px] text-slate-500">
            Tracked across {trackedLinks.length} outbound links
          </p>
        </div>
      </div>

      {/* Item-Level Attribution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Content Performance &amp; Link Attribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct answers to Matt Cooper&rsquo;s question: which stories drive engagement and workshop registrations.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            UTM Campaign: {newsletter.slug}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No items attached to this dispatch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/30 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Content Item</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Tagged Destination URL</th>
                  <th className="px-4 py-3 text-right">Clicks Earned</th>
                  <th className="px-4 py-3 text-right">Click Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {items.map(({ item, section, trackedUrl }) => {
                  const link = trackedLinks.find(
                    (tl) => tl.contentItemId === item.id
                  );
                  const clicks = link?.clicks || 0;
                  const share =
                    totalItemClicks > 0
                      ? Math.round((clicks / totalItemClicks) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/20">
                      <td className="px-5 py-3.5 max-w-sm">
                        <Link
                          href={`/admin/items/${item.id}`}
                          className="font-bold text-slate-100 hover:text-amber-400 text-sm block truncate"
                        >
                          {item.title}
                        </Link>
                        {item.summary && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.summary}
                          </p>
                        )}
                        {item.eventTitle && (
                          <div className="inline-flex items-center space-x-1 text-[11px] text-purple-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Linked Event: {item.eventTitle}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {section}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs truncate font-mono text-[11px]">
                        {trackedUrl ? (
                          <a
                            href={trackedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:underline inline-flex items-center space-x-1"
                            title={trackedUrl}
                          >
                            <span className="truncate">{trackedUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-600">No outbound URL</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right font-black text-sm text-white">
                        {clicks}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-300 font-semibold w-8 text-right">
                            {share}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blocked Event Attendance Join Decision Note (Step 07 requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Downstream Event Attendance Correlation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Step 07 specification note: In Matt Cooper&rsquo;s interview, he noted Volta tracks visual headcounts and ticket counts in &ldquo;our system&rdquo;. Once the specific ticketing provider (e.g. Luma, Eventbrite, or Volta CRM) is confirmed by the team, the attendee webhook/sync will join email clicks directly against confirmed door arrivals.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                All link clicks are already tracked and tagged with UTM parameters to feed seamlessly into that join.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
