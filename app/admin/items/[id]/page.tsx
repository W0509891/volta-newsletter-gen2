import { notFound } from 'next/navigation';
import {
  getContentItemById,
  getConsentRecords,
  getContacts,
  getEvents,
  getNewsletters,
} from '@/lib/db/queries';
import { AdminNavbar } from '@/components/admin/Navbar';
import { ItemEditor } from '@/components/admin/ItemEditor';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, consentRecords, contacts, events, newsletters] = await Promise.all([
    getContentItemById(id),
    getConsentRecords(id),
    getContacts(),
    getEvents(),
    getNewsletters(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ItemEditor
          item={item}
          consentRecords={consentRecords}
          contacts={contacts}
          events={events}
          newsletters={newsletters}
        />
      </main>
    </div>
  );
}
