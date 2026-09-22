import { notFound } from 'next/navigation';
import { submitConsentPreviewResponseAction } from '@/app/actions/items';
import { getConsentPreviewByToken } from '@/lib/services/consent-service';

export const dynamic = 'force-dynamic';

export default async function ConsentPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getConsentPreviewByToken(token);

  if (!preview) {
    notFound();
  }

  const { request, revision, isPending } = preview;

  async function respond(formData: FormData) {
    'use server';
    await submitConsentPreviewResponseAction({
      token,
      response: formData.get('response') as 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED',
      notes: String(formData.get('notes') || ''),
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Volta Builders Dispatch
          </p>
          <h1 className="mt-2 text-2xl font-bold">Proposed feature approval</h1>
          <p className="mt-2 text-sm text-slate-400">
            Please review this exact version before responding.
          </p>
        </div>

        <article className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs text-slate-500">Revision {revision.revisionNumber}</p>
          <h2 className="mt-2 text-xl font-semibold">{revision.title}</h2>
          {revision.summary && (
            <p className="mt-4 text-sm leading-6 text-slate-200">{revision.summary}</p>
          )}
          {revision.body && (
            <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {revision.body}
            </div>
          )}
          {revision.url && (
            <a
              href={revision.url}
              className="mt-5 inline-block text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              Source link
            </a>
          )}
        </article>

        {!isPending ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
            This consent request is {request.status.toLowerCase()}.
          </div>
        ) : (
          <form action={respond} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input type="checkbox" required className="mt-1" />
              <span>I confirm that I have reviewed this exact version.</span>
            </label>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Comments
            </label>
            <textarea
              name="notes"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              placeholder="Optional notes, requested changes, or reason for declining"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                name="response"
                value="APPROVED"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Approve
              </button>
              <button
                name="response"
                value="CHANGES_REQUESTED"
                className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-semibold text-amber-200"
              >
                Request Changes
              </button>
              <button
                name="response"
                value="DECLINED"
                className="rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-semibold text-rose-200"
              >
                Decline
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
