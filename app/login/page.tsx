'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Department } from '@/lib/types';
import { DEPARTMENT_LABELS } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('logistics');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await supabase.auth.signOut();

        if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.assign('/dashboard');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, department } }
      });
      if (error) setError(error.message);
      else window.location.assign('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-cobalt-500 font-mono text-sm font-semibold text-white">
            OC
          </div>
          <h1 className="text-lg font-semibold text-ink">Organizing Committee CRM</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === 'sign-in' ? 'Sign in to your department workspace' : 'Create an account for your department'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          {mode === 'sign-up' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Department</label>
                <select
                  className="input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                >
                  {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((d) => (
                    <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6}
            />
          </div>

          {error && <p className="text-sm text-clay-500">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="font-medium text-cobalt-500 hover:underline"
            onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          >
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
