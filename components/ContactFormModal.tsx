'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/profile-context';
import type { Department, ContactCategory, PipelineStatus } from '@/lib/types';
import { CATEGORY_BY_DEPARTMENT, CATEGORY_LABELS, DEPARTMENT_LABELS, STATUS_LABELS } from '@/lib/types';

export default function ContactFormModal({
  department,
  onClose,
  onCreated
}: {
  department: Department;
  onClose: () => void;
  onCreated: () => void;
}) {
  const profile = useProfile();
  const supabase = createClient();
  const isAdmin = profile.department === 'admin';

  const [dept, setDept] = useState<Department>(department === 'admin' ? 'logistics' : department);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<ContactCategory>(CATEGORY_BY_DEPARTMENT[dept][0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PipelineStatus>('new');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDeptChange(next: Department) {
    setDept(next);
    setCategory(CATEGORY_BY_DEPARTMENT[next][0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('contacts').insert({
      name,
      organization: organization || null,
      category,
      email: email || null,
      phone: phone || null,
      status,
      department: dept,
      owner_id: profile.id
    });

    if (error) setError(error.message);
    else onCreated();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-midnight/40 px-4">
      <div className="w-full max-w-md panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New contact</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Organization</label>
            <input className="input" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </div>

          {isAdmin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Department</label>
              <select className="input" value={dept} onChange={(e) => handleDeptChange(e.target.value as Department)}>
                {(Object.keys(DEPARTMENT_LABELS) as Department[]).filter((d) => d !== 'admin').map((d) => (
                  <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ContactCategory)}>
              {CATEGORY_BY_DEPARTMENT[dept].map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Pipeline status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as PipelineStatus)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-clay-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
