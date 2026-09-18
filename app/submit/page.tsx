import { PublicSubmitForm } from '@/components/public/PublicSubmitForm';

export const metadata = {
  title: 'Submit a Builder Story | Volta Innovation Hub',
  description: 'Submit your tech milestone, startup lesson, or workshop to the Volta Builders Dispatch.',
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PublicSubmitForm />
    </div>
  );
}
