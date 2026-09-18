'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentItemType } from '@/lib/types';
import { createNewItemAction } from '@/app/actions/items';
import { Zap, Loader2, ArrowRight } from 'lucide-react';

export function QuickCaptureForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentItemType>('STORY');
  const [summary, setSummary] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setLoading(true);
    try {
      const res = await createNewItemAction({
        title: title.trim(),
        type,
        summary: summary.trim(),
        body: '',
        status: 'DRAFT',
        contactEmail: contactEmail.trim() || undefined,
        url: url.trim() || undefined,
      });

      if (res.success && res.item) {
        router.push(`/admin/items/${res.item.id}`);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white shadow-2xl">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Quick Story Capture</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log hallway chats, Slack mentions, or partner milestones in 3 quick fields.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            1. Headline / What happened? *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NovaSurge AI hits 60 FPS edge inference milestone"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-base text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              2. Category *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentItemType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="STORY">Founder / Lab Story</option>
              <option value="EVENT">Event / Workshop</option>
              <option value="WIN">Community Win / Milestone</option>
              <option value="OPPORTUNITY">Opportunity / Grant</option>
              <option value="COMMUNITY">Community Dispatch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Stakeholder Email (optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="elena@novasurge.ai"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            3. Summary / One-liner *
          </label>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="1–2 sentences capturing why this matters for local builders..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Reference / Outbound URL (optional)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Saves directly to Drafts &rarr; redirects to detail view for consent request
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Capturing...</span>
              </>
            ) : (
              <>
                <span>Save &amp; Request Consent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
