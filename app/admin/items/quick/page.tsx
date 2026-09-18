import { AdminNavbar } from '@/components/admin/Navbar';
import { QuickCaptureForm } from '@/components/admin/QuickCaptureForm';

export const dynamic = 'force-dynamic';

export default function QuickCapturePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNavbar currentPath="/admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <QuickCaptureForm />
      </main>
    </div>
  );
}
