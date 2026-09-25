import { notFound } from 'next/navigation';
import {
  getNewsletterById,
  getNewsletterItemsWithContent,
  getTrackedLinksForNewsletter,
} from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { NewsletterDetailClient } from '@/components/admin/NewsletterDetailClient';
import { requireAdminPage } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function NewsletterDetailPage({
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

  const [itemsWithContent, trackedLinks] = await Promise.all([
    getNewsletterItemsWithContent(id),
    getTrackedLinksForNewsletter(id),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin/newsletters" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsletterDetailClient
          newsletter={newsletter}
          itemsWithContent={itemsWithContent}
          trackedLinks={trackedLinks}
        />
      </main>
    </div>
  );
}
