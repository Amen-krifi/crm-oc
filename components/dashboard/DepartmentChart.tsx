'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DepartmentChart({ data }: { data: { department: string; contacts: number }[] }) {
  return (
    <div className="panel p-5">
      <p className="mb-4 text-sm font-semibold text-ink">Contacts per department</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
          <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={{ stroke: '#E2E5EA' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: '#E2E5EA', fontSize: 13 }}
            cursor={{ fill: '#F5F6F8' }}
          />
          <Bar dataKey="contacts" fill="#2952CC" radius={[4, 4, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
