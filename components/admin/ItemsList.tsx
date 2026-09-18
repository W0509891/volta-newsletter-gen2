'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ContentItem,
  ContentItemStatus,
  ContentItemType,
  Newsletter,
} from '@/lib/types';
import {
  batchUpdateItemsAction,
  transitionItemStatusAction,
} from '@/app/actions/items';
import { AttachNewsletterModal } from './AttachNewsletterModal';
import { NewItemModal } from './NewItemModal';
import {
  Inbox,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Send,
  MoreVertical,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';

interface Props {
  initialItems: ContentItem[];
  newsletters: Newsletter[];
  overdueBacklogCount: number;
}

const STATUS_TABS: {
  id: ContentItemStatus | 'ARCHIVE_GROUP';
  label: string;
  icon: any;
  color: string;
}[] = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox, color: 'text-sky-400' },
  { id: 'DRAFT', label: 'Drafts', icon: FileEdit, color: 'text-indigo-400' },
  {
    id: 'PENDING_CONSENT',
    label: 'Pending Consent',
    icon: ShieldAlert,
    color: 'text-amber-400',
  },
  {
    id: 'APPROVED',
    label: 'Approved (Ready)',
    icon: CheckCircle2,
    color: 'text-emerald-400',
  },
  { id: 'BACKLOG', label: 'Backlog', icon: Clock, color: 'text-purple-400' },
  {
    id: 'ARCHIVE_GROUP',
    label: 'Rejected / Archived',
    icon: Archive,
    color: 'text-slate-400',
  },
];

const TYPE_LABELS: Record<ContentItemType, { label: string; badge: string }> = {
  STORY: {
    label: 'Story',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  EVENT: {
    label: 'Event',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  WIN: {
    label: 'Win',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  OPPORTUNITY: {
    label: 'Opportunity',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  COMMUNITY: {
    label: 'Community',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
};

export function ItemsList({ initialItems, newsletters, overdueBacklogCount }: Props) {
  const [activeTab, setActiveTab] = useState<ContentItemStatus | 'ARCHIVE_GROUP'>(
    'INBOX'
  );
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [attachModalState, setAttachModalState] = useState<{
    isOpen: boolean;
    itemId: string;
    itemTitle: string;
  }>({ isOpen: false, itemId: '', itemTitle: '' });

  // Filter items
  const filteredItems = initialItems.filter((item) => {
    // Tab match
    if (activeTab === 'ARCHIVE_GROUP') {
      if (item.status !== 'REJECTED' && item.status !== 'ARCHIVED') return false;
    } else {
      if (item.status !== activeTab) return false;
    }

    // Type filter
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchContact = item.contactName?.toLowerCase().includes(q) || item.contactEmail?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchContact) return false;
    }

    return true;
  });

  // Tab counts
  const tabCounts: Record<ContentItemStatus | 'ARCHIVE_GROUP', number> = {
    INBOX: initialItems.filter((i) => i.status === 'INBOX').length,
    DRAFT: initialItems.filter((i) => i.status === 'DRAFT').length,
    PENDING_CONSENT: initialItems.filter((i) => i.status === 'PENDING_CONSENT').length,
    APPROVED: initialItems.filter((i) => i.status === 'APPROVED').length,
    BACKLOG: initialItems.filter((i) => i.status === 'BACKLOG').length,
    REJECTED: initialItems.filter((i) => i.status === 'REJECTED').length,
    ARCHIVED: initialItems.filter((i) => i.status === 'ARCHIVED').length,
    ARCHIVE_GROUP: initialItems.filter((i) => i.status === 'REJECTED' || i.status === 'ARCHIVED').length,
  };

  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((i) => selectedIds.includes(i.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  }

  function toggleSelectOne(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  // Batch actions
  async function handleBatchAction(action: 'APPROVE' | 'BACKLOG' | 'REJECT' | 'ARCHIVE') {
    if (selectedIds.length === 0) return;
    let revisitAt: string | undefined;
    let rejectionReason: string | undefined;

    if (action === 'BACKLOG') {
      const dateStr = prompt(
        'Enter date to revisit (YYYY-MM-DD), or leave empty for 30 days from now:',
        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      );
      if (dateStr === null) return;
      revisitAt = dateStr ? new Date(dateStr).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
    } else if (action === 'REJECT') {
      const reason = prompt('Optional rejection reason:');
      if (reason === null) return;
      rejectionReason = reason;
    }

    await batchUpdateItemsAction(selectedIds, action, { revisitAt, rejectionReason });
    setSelectedIds([]);
  }

  // Quick single actions
  async function handleQuickTransition(
    id: string,
    newStatus: ContentItemStatus
  ) {
    let revisitAt: string | undefined;
    let rejectionReason: string | undefined;

    if (newStatus === 'BACKLOG') {
      const dateStr = prompt(
        'Enter revisit date (YYYY-MM-DD):',
        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      );
      if (dateStr === null) return;
      revisitAt = new Date(dateStr).toISOString();
    } else if (newStatus === 'REJECTED') {
      const reason = prompt('Reason for rejection:');
      if (reason === null) return;
      rejectionReason = reason;
    }

    await transitionItemStatusAction(id, newStatus, { revisitAt, rejectionReason });
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Curate Stories & Dispatch Items
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review submissions, track consent, and stage approved content into the next dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 space-x-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds([]);
              }}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
              {tab.id === 'BACKLOG' && overdueBacklogCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  {overdueBacklogCount} due
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, teaser, or contact..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Types</option>
              <option value="STORY">Stories</option>
              <option value="EVENT">Events</option>
              <option value="WIN">Wins</option>
              <option value="OPPORTUNITY">Opportunities</option>
              <option value="COMMUNITY">Community</option>
            </select>
          </div>
        </div>

        {/* Batch Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-800/90 border border-amber-500/40 rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-amber-300 mr-2">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBatchAction('APPROVE')}
              className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => handleBatchAction('BACKLOG')}
              className="px-2.5 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-medium"
            >
              Backlog
            </button>
            <button
              onClick={() => handleBatchAction('REJECT')}
              className="px-2.5 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => handleBatchAction('ARCHIVE')}
              className="px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Items Table / Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <p className="text-base font-medium text-slate-300">No items found</p>
          <p className="text-xs text-slate-500 mt-1">
            No items in {activeTab === 'ARCHIVE_GROUP' ? 'Rejected/Archived' : activeTab} match your current filters.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-white"
              >
                {allFilteredSelected ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span>Item & Teaser</span>
            </div>
            <div className="hidden sm:flex items-center space-x-8">
              <span>Consent / Contact</span>
              <span>Quick Actions</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const typeCfg = TYPE_LABELS[item.type] || TYPE_LABELS.STORY;

              return (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSelectOne(item.id)}
                      className="mt-1 text-slate-400 hover:text-white shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeCfg.badge}`}
                        >
                          {typeCfg.label}
                        </span>

                        {item.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ⭐ Top Feature
                          </span>
                        )}

                        <Link
                          href={`/admin/items/${item.id}`}
                          className="font-semibold text-slate-100 hover:text-amber-400 transition-colors text-base truncate"
                        >
                          {item.title}
                        </Link>
                      </div>

                      {item.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-slate-400 hover:text-amber-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{item.url}</span>
                          </a>
                        )}

                        {item.revisitAt && (
                          <span className="inline-flex items-center space-x-1 text-purple-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              Revisit: {new Date(item.revisitAt).toLocaleDateString()}
                            </span>
                          </span>
                        )}

                        {item.rejectionReason && (
                          <span className="text-rose-400 italic">
                            Reason: {item.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consent & Contact Indicator */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                    <div className="text-left md:text-right shrink-0">
                      {item.contactName || item.contactEmail ? (
                        <div>
                          <div className="text-xs font-medium text-slate-300">
                            {item.contactName || item.contactEmail}
                          </div>
                          {item.consentStatus === 'GRANTED' ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Consent Granted</span>
                            </span>
                          ) : item.consentStatus === 'PENDING' ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-amber-400">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Consent Pending</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              No consent record
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">No contact linked</span>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.status === 'APPROVED' && (
                        <button
                          onClick={() =>
                            setAttachModalState({
                              isOpen: true,
                              itemId: item.id,
                              itemTitle: item.title,
                            })
                          }
                          className="px-2.5 py-1 text-xs rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Attach to Dispatch</span>
                        </button>
                      )}

                      {item.status === 'INBOX' && (
                        <>
                          <button
                            onClick={() => handleQuickTransition(item.id, 'DRAFT')}
                            className="px-2.5 py-1 text-xs rounded-md bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-medium"
                          >
                            Accept to Draft
                          </button>
                          <button
                            onClick={() => handleQuickTransition(item.id, 'REJECTED')}
                            className="px-2 py-1 text-xs rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.status === 'DRAFT' && (
                        <button
                          onClick={() => handleQuickTransition(item.id, 'PENDING_CONSENT')}
                          className="px-2.5 py-1 text-xs rounded-md bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 font-medium"
                        >
                          Request Consent
                        </button>
                      )}

                      {item.status === 'PENDING_CONSENT' && (
                        <button
                          onClick={() => handleQuickTransition(item.id, 'APPROVED')}
                          className="px-2.5 py-1 text-xs rounded-md bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium"
                        >
                          Mark Approved
                        </button>
                      )}

                      {item.status !== 'BACKLOG' && (
                        <button
                          onClick={() => handleQuickTransition(item.id, 'BACKLOG')}
                          title="Move to Backlog"
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-md"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <Link
                        href={`/admin/items/${item.id}`}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
                        title="Edit Item"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attach Newsletter Modal */}
      <AttachNewsletterModal
        itemId={attachModalState.itemId}
        itemTitle={attachModalState.itemTitle}
        newsletters={newsletters}
        isOpen={attachModalState.isOpen}
        onClose={() =>
          setAttachModalState({ isOpen: false, itemId: '', itemTitle: '' })
        }
      />

      {/* New Item Modal */}
      <NewItemModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
}
