import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DEPARTMENT_LABELS } from '@/lib/types';
import type { Contact, Department, Log, PipelineStatus, Profile } from '@/lib/types';
import StatCard from '@/components/dashboard/StatCard';
import DepartmentChart from '@/components/dashboard/DepartmentChart';
import OutreachTrendChart from '@/components/dashboard/OutreachTrendChart';
import ConfirmationRateChart from '@/components/dashboard/ConfirmationRateChart';
import MemberStatsTable, { type MemberRow } from '@/components/dashboard/MemberStatsTable';
import { isDIM } from '@/lib/auth';
import { CheckSquare, BookOpen, Database, ShieldCheck, ArrowRight, Package, TrendingUp, Megaphone, HeartHandshake } from 'lucide-react';

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
  const isDimUser = isDIM(profile) || isAdminUser || user?.email === 'bsabt76@gmail.com';

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-muted">
            {isAdminUser ? 'Committee-wide performance overview' : 'Your personal performance overview'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/tasks" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <CheckSquare size={14} className="text-cobalt-500" /> To-Do Lists
          </Link>
          <Link href="/toolkit" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <BookOpen size={14} className="text-cobalt-500" /> OC Toolkit
          </Link>
        </div>
      </div>

      {/* DIM Master Banner if user is DIM */}
      {isDimUser && (
        <div className="panel mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-surface to-paper border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  OCVP Data &amp; Information Management
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono text-amber-700 dark:text-amber-300">
                  SUPREME ACCESS
                </span>
              </div>
              <p className="text-xs text-ink mt-0.5">
                Full system audit, cross-branch data hygiene scanner, and Executive Briefing Generator are active.
              </p>
            </div>
          </div>
          <Link
            href="/dim"
            className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white shrink-0 flex items-center gap-1.5"
          >
            Open DIM Command Center <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* OCVP Workspace Quick-Jumps for Admins */}
      {isAdminUser && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            href="/ocvp/logistics"
            className="panel p-3 flex items-center gap-2.5 hover:border-cobalt-500/40 transition-colors"
          >
            <Package size={16} className="text-amber-500" />
            <span className="text-xs font-semibold text-ink">OCVP Logistics</span>
          </Link>
          <Link
            href="/ocvp/sales"
            className="panel p-3 flex items-center gap-2.5 hover:border-cobalt-500/40 transition-colors"
          >
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs font-semibold text-ink">OCVP Sales</span>
          </Link>
          <Link
            href="/ocvp/marketing"
            className="panel p-3 flex items-center gap-2.5 hover:border-cobalt-500/40 transition-colors"
          >
            <Megaphone size={16} className="text-purple-500" />
            <span className="text-xs font-semibold text-ink">OCVP Marketing</span>
          </Link>
          <Link
            href="/ocvp/participant-xp"
            className="panel p-3 flex items-center gap-2.5 hover:border-cobalt-500/40 transition-colors"
          >
            <HeartHandshake size={16} className="text-sky-500" />
            <span className="text-xs font-semibold text-ink">OCVP Participant XP</span>
          </Link>
        </div>
      )}

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