import { createClient } from '@/lib/supabase/server';
import { DEPARTMENT_LABELS } from '@/lib/types';
import type { Contact, Department, Log, PipelineStatus, Profile } from '@/lib/types';
import StatCard from '@/components/dashboard/StatCard';
import DepartmentChart from '@/components/dashboard/DepartmentChart';
import OutreachTrendChart from '@/components/dashboard/OutreachTrendChart';
import ConfirmationRateChart from '@/components/dashboard/ConfirmationRateChart';
import MemberStatsTable, { type MemberRow } from '@/components/dashboard/MemberStatsTable';

function startOfWeekLabel(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
  const isAdminUser = profile?.department === 'admin';

  let contactsQuery = supabase
    .from('contacts')
    .select('id, department, category, status, created_at, owner_id');
  if (!isAdminUser) contactsQuery = contactsQuery.eq('owner_id', user!.id);
  const { data: contactsData } = await contactsQuery;
  const contacts = (contactsData ?? []) as (Pick<Contact, 'id' | 'department' | 'category' | 'status' | 'created_at'> & {
    owner_id: string | null;
  })[];

  let logsQuery = supabase.from('logs').select('id, occurred_at, user_id').order('occurred_at', { ascending: true });
  if (!isAdminUser) logsQuery = logsQuery.eq('user_id', user!.id);
  const { data: logsData } = await logsQuery;
  const logs = (logsData ?? []) as (Pick<Log, 'id' | 'occurred_at'> & { user_id: string | null })[];

  const total = contacts.length;
  const confirmed = contacts.filter((c) => c.status === 'confirmed').length;
  const inProgress = contacts.filter((c) => c.status === 'contacted' || c.status === 'in_discussion').length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const loggedThisWeek = logs.filter((l) => new Date(l.occurred_at).getTime() >= oneWeekAgo).length;

  const deptCounts = new Map<Department, number>();
  for (const c of contacts) deptCounts.set(c.department, (deptCounts.get(c.department) ?? 0) + 1);
  const departmentData = Array.from(deptCounts.entries())
    .filter(([d]) => d !== 'admin')
    .map(([d, count]) => ({ department: DEPARTMENT_LABELS[d], contacts: count }));

  const weekBuckets = new Map<string, number>();
  for (const l of logs) {
    const label = startOfWeekLabel(l.occurred_at);
    weekBuckets.set(label, (weekBuckets.get(label) ?? 0) + 1);
  }
  const outreachData = Array.from(weekBuckets.entries())
    .map(([week, interactions]) => ({ week, interactions }))
    .slice(-8);

  const eventContacts = contacts.filter((c) => c.category === 'guest' || c.category === 'vip');
  const statusCounts = new Map<PipelineStatus, number>();
  for (const c of eventContacts) statusCounts.set(c.status, (statusCounts.get(c.status) ?? 0) + 1);
  const confirmationData = [
    { name: 'Confirmed', value: statusCounts.get('confirmed') ?? 0 },
    { name: 'Pending', value: (statusCounts.get('new') ?? 0) + (statusCounts.get('contacted') ?? 0) + (statusCounts.get('in_discussion') ?? 0) },
    { name: 'Declined', value: statusCounts.get('declined') ?? 0 },
    { name: 'On hold', value: statusCounts.get('on_hold') ?? 0 }
  ].filter((d) => d.value > 0);

  let memberRows: MemberRow[] = [];
  if (isAdminUser) {
    const { data: membersData } = await supabase
      .from('profiles')
      .select('id, name, department')
      .neq('department', 'admin')
      .order('name', { ascending: true });
    const members = (membersData ?? []) as Pick<Profile, 'id' | 'name' | 'department'>[];

    memberRows = members.map((m) => {
      const mine = contacts.filter((c) => c.owner_id === m.id);
      const mineLogs = logs.filter((l) => l.user_id === m.id);
      return {
        id: m.id,
        name: m.name,
        department: m.department,
        total: mine.length,
        confirmed: mine.filter((c) => c.status === 'confirmed').length,
        active: mine.filter((c) => c.status === 'contacted' || c.status === 'in_discussion').length,
        loggedThisWeek: mineLogs.filter((l) => new Date(l.occurred_at).getTime() >= oneWeekAgo).length
      };
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">
          {isAdminUser ? 'Committee-wide performance overview' : 'Your personal performance overview'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total contacts" value={total} />
        <StatCard label="Confirmed" value={confirmed} />
        <StatCard label="Active pipeline" value={inProgress} hint="Contacted or in discussion" />
        <StatCard label="Logged this week" value={loggedThisWeek} hint="Calls, emails, meetings, notes" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DepartmentChart data={departmentData.length ? departmentData : [{ department: DEPARTMENT_LABELS[profile?.department as Department] ?? '—', contacts: total }]} />
        <OutreachTrendChart data={outreachData} />
        <div className="lg:col-span-2">
          {confirmationData.length > 0 ? (
            <ConfirmationRateChart data={confirmationData} />
          ) : (
            <div className="panel p-5 text-sm text-muted">
              No guest or VIP contacts logged yet — confirmation rate will appear once PR/Marketing adds event participants.
            </div>
          )}
        </div>
      </div>

      {isAdminUser && (
        <div className="mt-6">
          <MemberStatsTable rows={memberRows} />
        </div>
      )}
    </div>
  );
}