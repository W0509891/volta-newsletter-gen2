'use client';

import { useActionState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { loginAction, LoginState } from '@/app/actions/auth';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form
      action={formAction}
      className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4"
    >
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
        <span className="bg-amber-500 text-slate-950 font-black px-2 py-1 rounded text-sm tracking-wider">
          VOLTA
        </span>
        <h1 className="text-base font-semibold">Admin sign in</h1>
      </div>

      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="username" className="block text-xs font-medium text-slate-300 mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        <span>{pending ? 'Signing in...' : 'Sign in'}</span>
      </button>
    </form>
  );
}
