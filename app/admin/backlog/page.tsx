import { getBacklogItems } from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { BacklogQueue } from '@/components/admin/BacklogQueue';
import { requireAdminPage } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function BacklogPage() {
  await requireAdminPage();
  const backlogItems = await getBacklogItems();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin/backlog" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BacklogQueue backlogItems={backlogItems} />
      </main>
    </div>
  );
}
