import { notFound } from 'next/navigation';
import {
  getNewsletterById,
  getNewsletterItemsWithContent,
} from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { NewsletterPreviewClient } from '@/components/admin/NewsletterPreviewClient';
import { requireAdminPage } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function NewsletterPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const newsletter = await getNewsletterById(id);

  if (!newsletter) {
    notFound();
  }

  const items = await getNewsletterItemsWithContent(id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin/newsletters" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NewsletterPreviewClient
          newsletter={newsletter}
          itemCount={items.length}
        />
      </main>
    </div>
  );
}
