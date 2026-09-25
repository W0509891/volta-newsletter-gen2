import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Login | Volta Builders Dispatch',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getAdminSession()) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <LoginForm next={next ?? '/admin'} />
    </div>
  );
}
