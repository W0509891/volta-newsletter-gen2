import {
  getContentItems,
  getNewsletters,
  getOverdueBacklogCount,
} from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { ItemsList } from '@/components/admin/ItemsList';
import { requireAdminPage } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdminPage();
  const [items, newsletters, overdueCount] = await Promise.all([
    getContentItems(),
    getNewsletters(),
    getOverdueBacklogCount(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ItemsList
          initialItems={items}
          newsletters={newsletters}
          overdueBacklogCount={overdueCount}
        />
      </main>
    </div>
  );
}
