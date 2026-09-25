'use client';

import { useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Department } from '@/lib/types';
import { DEPARTMENT_LABELS } from '@/lib/types';
import { createTeamMember } from '@/app/(app)/settings/actions';

function randomPassword() {
  // Not cryptographically precious — it's a one-time temp password the
  // admin hands off, and the member should change it on first login once
  // this app grows a "change password" flow.
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

export default function CreateMemberForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [department, setDepartment] = useState<Department>('logistics');
  const [password, setPassword] = useState(randomPassword);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '');
    const result = await createTeamMember(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setCreated({ email, password });
      formRef.current?.reset();
      setDepartment('logistics');
      setPassword(randomPassword());
    }
    setSaving(false);
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus size={16} className="text-cobalt-500" />
        <p className="text-sm font-semibold text-ink">Create a team member account</p>
      </div>

      {created && (
        <div className="mb-4 rounded-md border border-moss-500/30 bg-moss-100 p-3 text-sm text-moss-700">
          Account created for <span className="font-medium">{created.email}</span>. Share this temporary
          password with them directly — it won&apos;t be shown again:{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-moss-700">{created.password}</code>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Department</label>
            <select
              name="department"
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
            >
              {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((d) => (
                <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input name="email" type="email" className="input" required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Temporary password</label>
          <div className="flex gap-2">
            <input
              name="password"
              className="input font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              onClick={() => setPassword(randomPassword())}
            >
              Regenerate
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Auto-generated — edit it if you&apos;d rather set your own. You&apos;ll share this with the new member yourself.
          </p>
        </div>

        {error && <p className="text-sm text-clay-500">{error}</p>}

        <div className="flex justify-end pt-1">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
