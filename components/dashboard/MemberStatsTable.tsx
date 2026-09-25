'use client';

import { DEPARTMENT_LABELS } from '@/lib/types';
import type { Department } from '@/lib/types';
import { exportToCsv, type ExportColumn } from '@/lib/export';

export interface MemberRow {
  id: string;
  name: string;
  department: Department;
  total: number;
  confirmed: number;
  active: number;
  loggedThisWeek: number;
}

const columns: ExportColumn<MemberRow>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Department', value: (r) => DEPARTMENT_LABELS[r.department] },
  { header: 'Total contacts', value: (r) => r.total },
  { header: 'Confirmed', value: (r) => r.confirmed },
  { header: 'Active pipeline', value: (r) => r.active },
  { header: 'Logged this week', value: (r) => r.loggedThisWeek }
];

export default function MemberStatsTable({ rows }: { rows: MemberRow[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="text-sm font-semibold text-ink">Per-OC breakdown</p>
        <button className="btn-secondary" onClick={() => exportToCsv('oc-performance', rows, columns)}>
          Export CSV
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-paper text-left text-xs font-medium uppercase tracking-wide text-muted">
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Department</th>
            <th className="px-4 py-2.5">Total</th>
            <th className="px-4 py-2.5">Confirmed</th>
            <th className="px-4 py-2.5">Active</th>
            <th className="px-4 py-2.5">Logged (7d)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
              <td className="px-4 py-3 text-muted">{DEPARTMENT_LABELS[r.department]}</td>
              <td className="px-4 py-3 text-muted">{r.total}</td>
              <td className="px-4 py-3 text-muted">{r.confirmed}</td>
              <td className="px-4 py-3 text-muted">{r.active}</td>
              <td className="px-4 py-3 text-muted">{r.loggedThisWeek}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">No team members yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}