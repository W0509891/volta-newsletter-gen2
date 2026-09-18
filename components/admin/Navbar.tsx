import Link from 'next/link';
import { getOverdueBacklogCount } from '@/lib/db/queries';
import { Mail, Inbox, Clock, Send, PlusCircle, BarChart3, AlertCircle } from 'lucide-react';

export async function AdminNavbar({ currentPath }: { currentPath?: string }) {
  const overdueCount = await getOverdueBacklogCount();

  const navItems = [
    { href: '/admin', label: 'Curation Pipeline', icon: Inbox },
    {
      href: '/admin/backlog',
      label: 'Backlog Queue',
      icon: Clock,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { href: '/admin/newsletters', label: 'Newsletters', icon: Mail },
    { href: '/submit', label: 'Public Intake Form', icon: PlusCircle },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 font-black px-2 py-1 rounded text-sm tracking-wider">
                VOLTA
              </span>
              <span className="font-semibold text-lg text-slate-100 hidden sm:inline">
                Builders Dispatch
              </span>
            </Link>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Admin Curation
            </span>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <AlertCircle className="w-3 h-3 mr-1 inline" />
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
