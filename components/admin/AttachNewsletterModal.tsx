'use client';

import { useState } from 'react';
import { Newsletter, NewsletterSection } from '@/lib/types';
import { attachItemToNewsletterAction } from '@/app/actions/items';
import { Mail, Check, X, Loader2 } from 'lucide-react';

interface Props {
  itemId: string;
  itemTitle: string;
  newsletters: Newsletter[];
  isOpen: boolean;
  onClose: () => void;
}

export function AttachNewsletterModal({
  itemId,
  itemTitle,
  newsletters,
  isOpen,
  onClose,
}: Props) {
  const [selectedNewsletterId, setSelectedNewsletterId] = useState(
    newsletters[0]?.id || ''
  );
  const [section, setSection] = useState<NewsletterSection>('STORIES');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleAttach(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNewsletterId) return;

    setLoading(true);
    try {
      await attachItemToNewsletterAction(selectedNewsletterId, itemId, section);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold">Attach to Newsletter</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 mt-3 truncate">
          Attaching: <span className="text-white font-medium">{itemTitle}</span>
        </p>

        {newsletters.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400">
            No draft newsletters available. Create one first in the Newsletters tab.
          </div>
        ) : (
          <form onSubmit={handleAttach} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Newsletter
              </label>
              <select
                value={selectedNewsletterId}
                onChange={(e) => setSelectedNewsletterId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {newsletters.map((nl) => (
                  <option key={nl.id} value={nl.id}>
                    {nl.subject} ({nl.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Newsletter Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as NewsletterSection)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="FEATURED">⭐ Featured Story (Top placement)</option>
                <option value="STORIES">📖 Founder & Lab Stories</option>
                <option value="EVENTS">📅 Upcoming Events & Workshops</option>
                <option value="WINS">🏆 Community Wins & Milestones</option>
                <option value="OPPORTUNITIES">🚀 Opportunities & Grants</option>
                <option value="COMMUNITY">💬 Community Updates & Discussion</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Attaching...</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Attached!</span>
                  </>
                ) : (
                  <span>Confirm Attachment</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
