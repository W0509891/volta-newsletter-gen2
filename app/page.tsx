import Link from 'next/link';
import { ArrowRight, Inbox, Mail, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded text-sm tracking-wider">
              VOLTA
            </span>
            <span className="font-bold text-lg text-white">Builders Dispatch</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/submit"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Public Intake
            </Link>
            <Link
              href="/admin"
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
            >
              Curator Portal &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Volta Innovation Hub &middot; AI Programs</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
          Relationship-driven curation for local builders.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Turning hallway chats, AI lab resident breakthroughs, and community milestones into verified, consent-tracked monthly dispatches with automated Mailchimp push and link attribution.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/10 transition-all"
          >
            <Inbox className="w-5 h-5" />
            <span>Open Curation Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base flex items-center justify-center space-x-2 transition-all"
          >
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <span>Submit a Story</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Explicit Consent Tracking</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every story requires verified founder approval (email, verbal, or recording transcript) before publication.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Pug Email Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-compiles into table-based, inline-safe HTML ready for Mailchimp campaigns with zero manual copying.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Full Funnel Attribution</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic UTM link tagging attributes clicks back to specific stories and upcoming workshop registrations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        Volta Innovation Hub &middot; Halifax, Nova Scotia &middot; Generation 2 Architecture
      </footer>
    </div>
  );
}
