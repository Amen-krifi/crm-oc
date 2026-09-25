'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2F7A44', '#C2691D', '#B8433C', '#5B6472'];

export default function ConfirmationRateChart({
  data
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const confirmed = data.find((d) => d.name === 'Confirmed')?.value ?? 0;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="panel p-5">
      <p className="mb-1 text-sm font-semibold text-ink">Event participant confirmation rate</p>
      <p className="mb-3 font-mono text-2xl font-semibold text-moss-500">{rate}%</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E2E5EA', fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}
