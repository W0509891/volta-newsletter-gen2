'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentItemType } from '@/lib/types';
import { createNewItemAction, recordConsentAction } from '@/app/actions/items';
import { Send, CheckCircle2, Loader2, Sparkles, ArrowLeft } from 'lucide-react';

export function PublicSubmitForm() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentItemType>('STORY');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await createNewItemAction({
        title: title.trim(),
        type,
        summary: summary.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
        status: 'INBOX',
        contactName: name.trim() || undefined,
        contactEmail: email.trim(),
        contactOrganization: organization.trim() || undefined,
      });

      if (res.success && res.item && res.item.contactId) {
        await recordConsentAction({
          contentItemId: res.item.id,
          contactId: res.item.contactId,
          status: 'GRANTED',
          method: 'FORM',
          evidence: `Submitted via public intake form by ${email}`,
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white shadow-2xl">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Submission Received!</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
          Thanks for sharing your story with Volta. Our AI lab team and curators review submissions weekly for the Builders Dispatch.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setSummary('');
              setBody('');
              setUrl('');
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
          >
            Submit Another Item
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold"
          >
            Go to Admin Curation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 text-white shadow-2xl">
      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
        <Sparkles className="w-4 h-4" />
        <span>Volta Ecosystem Dispatch</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
        Share a Builder Story or Milestone
      </h1>
      <p className="text-sm text-slate-400 mt-2">
        Built something new? Deployed a model to production? Won a customer or grant?
        Tell the Volta builder community.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Work Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@company.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Startup or Organization Name
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. NovaSurge AI"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Type of Story *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentItemType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="STORY">Founder Story / Tech Breakdown</option>
              <option value="WIN">Milestone / Customer Win</option>
              <option value="EVENT">Event / Practice Session</option>
              <option value="OPPORTUNITY">Hiring / Grant Opportunity</option>
              <option value="COMMUNITY">Community Project</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Headline / What did you achieve? *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. We scaled video inference to 60 FPS on edge hardware"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Email Summary (1–2 sentences) *
          </label>
          <textarea
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief takeaway explaining the milestone or lesson learned..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Additional Details / Context / Quotes
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How did you solve the problem? What tools or models did you use? Any metrics?"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Link (Demo, Blog post, Github, or Announcement)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Consent &amp; Privacy Notice</p>
          <p>
            By submitting, you agree to allow Volta editorial curators to feature this content in the Builders Dispatch and associated community channels. We never publish without contacting you if edits are substantial.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Curation Hub</span>
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit to Editorial Team</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
