'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Newsletter } from '@/lib/types';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { pushToMailchimpAction, sendMailchimpCampaignAction } from '@/app/actions/newsletters';

interface Props {
  newsletter: Newsletter;
  itemCount: number;
}

export function NewsletterPreviewClient({ newsletter, itemCount }: Props) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handlePush() {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await pushToMailchimpAction(newsletter.id);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully synced with Mailchimp! Campaign ID: ${res.campaignId}`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to push to Mailchimp',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!confirm('Are you sure you want to SEND this campaign to the Volta audience list now?')) {
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await sendMailchimpCampaignAction(newsletter.id);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Campaign successfully queued and dispatched via Mailchimp!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to send campaign',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
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
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {newsletter.status}
              </span>
              <span className="text-xs text-slate-500">{itemCount} items attached</span>
              {newsletter.mailchimpCampaignId && (
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-sky-950 text-sky-400 border border-sky-800">
                  MC: {newsletter.mailchimpCampaignId}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5 truncate max-w-xl">
              {newsletter.subject}
            </h1>
          </div>
        </div>

        {/* Viewport Toggles and Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop (600px)</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile (375px)</span>
            </button>
          </div>

          <a
            href={`/api/newsletters/${newsletter.id}/preview`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open raw email in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href={`/admin/newsletters/${newsletter.id}/report`}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium flex items-center space-x-1.5"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Funnel Analytics</span>
          </Link>

          <button
            onClick={handlePush}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Push to Mailchimp</span>
          </button>

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <span>Send Campaign</span>
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

      {/* Frame Container */}
      <div className="flex justify-center bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-8 min-h-[750px]">
        <div
          className={`transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-white ${
            viewMode === 'desktop' ? 'w-[640px]' : 'w-[375px]'
          }`}
        >
          <iframe
            src={`/api/newsletters/${newsletter.id}/preview`}
            title="Newsletter Preview"
            className="w-full h-[750px] border-none"
          />
        </div>
      </div>
    </div>
  );
}
