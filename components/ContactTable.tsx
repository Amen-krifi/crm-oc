'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import type { Contact, ContactCategory, Department, PipelineStatus } from '@/lib/types';
import { CATEGORY_LABELS, DEPARTMENT_LABELS, STATUS_LABELS } from '@/lib/types';
import StatusBadge from './StatusBadge';
import ExportMenu from './ExportMenu';
import ContactFormModal from './ContactFormModal';

export default function ContactTable({
  contacts,
  department,
  showDepartmentColumn = false,
  showDepartmentFilter = false
}: {
  contacts: Contact[];
  /** Department the "new contact" form should default to / be locked to for non-admins. */
  department: Department;
  showDepartmentColumn?: boolean;
  showDepartmentFilter?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ContactCategory | 'all'>('all');
  const [status, setStatus] = useState<PipelineStatus | 'all'>('all');
    const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const isAdminView = department === 'admin';
  const owners = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.owner?.name).filter((n): n is string => !!n))).sort(),
    [contacts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (q && !`${c.name} ${c.organization ?? ''} ${c.email ?? ''}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && c.category !== category) return false;
      if (status !== 'all' && c.status !== status) return false;
      if (showDepartmentFilter && deptFilter !== 'all' && c.department !== deptFilter) return false;
      if (isAdminView && ownerFilter !== 'all' && c.owner?.name !== ownerFilter) return false;
      return true;
    });
  }, [contacts, search, category, status, deptFilter, showDepartmentFilter, isAdminView, ownerFilter]);

  const exportColumns = [
    { header: 'Name', value: (c: Contact) => c.name },
    { header: 'Organization', value: (c: Contact) => c.organization ?? '' },
    { header: 'Category', value: (c: Contact) => CATEGORY_LABELS[c.category] },
    { header: 'Email', value: (c: Contact) => c.email ?? '' },
    { header: 'Phone', value: (c: Contact) => c.phone ?? '' },
    { header: 'Department', value: (c: Contact) => DEPARTMENT_LABELS[c.department] },
    { header: 'Status', value: (c: Contact) => STATUS_LABELS[c.status] },
    { header: 'Owner', value: (c: Contact) => c.owner?.name ?? '' },
    { header: 'Created', value: (c: Contact) => new Date(c.created_at).toLocaleDateString() }
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search name, organization, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {showDepartmentFilter && (
          <select className="input w-auto" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as any)}>
            <option value="all">All departments</option>
            {Object.entries(DEPARTMENT_LABELS).filter(([v]) => v !== 'admin' && v !== 'dim').map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        {isAdminView && owners.length > 0 && (
          <select className="input w-auto" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="all">All OCs</option>
            {owners.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAdminView && <ExportMenu filename="contacts" data={filtered} columns={exportColumns} />}
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New contact
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-paper text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Organization</th>
              <th className="px-4 py-2.5">Category</th>
              {showDepartmentColumn && <th className="px-4 py-2.5">Department</th>}
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`/contacts/${c.id}`)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-paper"
              >
                                <td className="px-4 py-3 font-medium text-ink">
                  {c.name}
                  {c.hidden_at && (
                    <span className="ml-2 rounded-full bg-clay-500/10 px-2 py-0.5 text-[10px] font-medium text-clay-500">
                      Hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{c.organization ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{CATEGORY_LABELS[c.category]}</td>
                {showDepartmentColumn && <td className="px-4 py-3 text-muted">{DEPARTMENT_LABELS[c.department]}</td>}
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-muted">{c.owner?.name ?? '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                  No contacts match these filters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ContactFormModal
          department={department}
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
