'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function OutreachTrendChart({ data }: { data: { week: string; interactions: number }[] }) {
  return (
    <div className="panel p-5">
      <p className="mb-4 text-sm font-semibold text-ink">Weekly outreach volume</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={{ stroke: '#E2E5EA' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E2E5EA', fontSize: 13 }} />
          <Line type="monotone" dataKey="interactions" stroke="#C2691D" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
