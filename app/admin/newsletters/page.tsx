import { getNewsletters } from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { NewslettersList } from '@/components/admin/NewslettersList';
import { requireAdminPage } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function NewslettersPage() {
  await requireAdminPage();
  const newsletters = await getNewsletters();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin/newsletters" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewslettersList newsletters={newsletters} />
      </main>
    </div>
  );
}
