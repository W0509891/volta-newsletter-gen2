'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContentItem } from '@/lib/types';
import { transitionItemStatusAction } from '@/app/actions/items';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  FileEdit,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface Props {
  backlogItems: ContentItem[];
}

export function BacklogQueue({ backlogItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(backlogItems);
  const now = new Date();

  async function handleMove(id: string, targetStatus: 'DRAFT' | 'PENDING_CONSENT' | 'APPROVED') {
    await transitionItemStatusAction(id, targetStatus);
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  const overdueItems = items.filter(
    (i) => i.revisitAt && new Date(i.revisitAt) <= now
  );
  const upcomingItems = items.filter(
    (i) => !i.revisitAt || new Date(i.revisitAt) > now
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Backlog & Revisit Queue
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Parked stories, student projects, and pending milestones awaiting the next monthly review.
          </p>
        </div>

        {overdueItems.length > 0 && (
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{overdueItems.length} items overdue for review</span>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-300">
            No items in backlog
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Items parked with a revisit date will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue for Revisit ({overdueItems.length})</span>
              </h2>

              <div className="bg-slate-900 border border-amber-500/30 rounded-xl divide-y divide-slate-800/80 overflow-hidden shadow-md">
                {overdueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-500/5"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">
                          Overdue
                        </span>
                        <Link
                          href={`/admin/items/${item.id}`}
                          className="font-semibold text-slate-100 hover:text-amber-400 text-base truncate"
                        >
                          {item.title}
                        </Link>
                      </div>

                      {item.summary && (
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-amber-400/90 pt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Was scheduled for:{' '}
                            {new Date(item.revisitAt!).toLocaleDateString()}
                          </span>
                        </span>
                        {item.rejectionReason && (
                          <span className="text-slate-400 italic">
                            Note: {item.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleMove(item.id, 'DRAFT')}
                        className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center space-x-1"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Move to Draft</span>
                      </button>
                      <button
                        onClick={() => handleMove(item.id, 'PENDING_CONSENT')}
                        className="px-3 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Request Consent</span>
                      </button>
                      <button
                        onClick={() => handleMove(item.id, 'APPROVED')}
                        className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Revisit Section */}
          {upcomingItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Upcoming Scheduled Revisits ({upcomingItems.length})</span>
              </h2>

              <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden shadow-sm">
                {upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.type}
                        </span>
                        <Link
                          href={`/admin/items/${item.id}`}
                          className="font-semibold text-slate-100 hover:text-amber-400 text-base truncate"
                        >
                          {item.title}
                        </Link>
                      </div>

                      {item.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                        {item.revisitAt ? (
                          <span className="flex items-center space-x-1 text-purple-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Revisit on:{' '}
                              {new Date(item.revisitAt).toLocaleDateString()}
                            </span>
                          </span>
                        ) : (
                          <span>No revisit date specified</span>
                        )}
                        {item.rejectionReason && (
                          <span className="italic text-slate-400">
                            Note: {item.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleMove(item.id, 'DRAFT')}
                        className="px-2.5 py-1 text-xs rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Restore to Draft
                      </button>
                      <button
                        onClick={() => handleMove(item.id, 'PENDING_CONSENT')}
                        className="px-2.5 py-1 text-xs rounded-md bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30"
                      >
                        Request Consent
                      </button>
                      <Link
                        href={`/admin/items/${item.id}`}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
