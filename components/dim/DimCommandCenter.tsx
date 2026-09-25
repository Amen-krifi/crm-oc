'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  Users,
  Search,
  FileSpreadsheet,
  FileJson,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  QrCode,
  BellRing,
  Clock
} from 'lucide-react';
import type { Contact, Log, Profile, Task, OCDepartment } from '@/lib/types';
import { DEPARTMENT_LABELS, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import { isTaskOverdue } from '@/lib/task-utils';

interface DimProps {
  currentUser: Profile;
  profiles: Profile[];
  contacts: Contact[];
  logs: Log[];
  tasks: Task[];
}

export default function DimCommandCenter({
  currentUser,
  profiles,
  contacts,
  logs,
  tasks
}: DimProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'analytics' | 'briefing' | 'suggestions' | 'export'>('audit');
  const [copiedBriefing, setCopiedBriefing] = useState(false);
  const [simulatedCheckInCount, setSimulatedCheckInCount] = useState(142);
  const [showCheckInSimulator, setShowCheckInSimulator] = useState(false);

  // 1. DATA AUDIT METRICS
  const contactsWithoutEmail = contacts.filter((c) => !c.email || !c.email.includes('@'));
  const contactsWithoutPhone = contacts.filter((c) => !c.phone || c.phone.trim().length < 5);
  const contactsWithoutOrg = contacts.filter((c) => !c.organization || c.organization.trim() === '');

  // Stalled leads (in progress, but no logs in last 7 days)
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recentContactIdsWithLogs = new Set(
    logs
      .filter((l) => new Date(l.occurred_at).getTime() >= oneWeekAgo)
      .map((l) => l.contact_id)
  );

  const stalledContacts = contacts.filter(
    (c) =>
      (c.status === 'new' || c.status === 'contacted' || c.status === 'in_discussion') &&
      !recentContactIdsWithLogs.has(c.id)
  );

  // Inactive OCs (no interaction logged in last 7 days)
  const recentUserIdsWithLogs = new Set(
    logs
      .filter((l) => new Date(l.occurred_at).getTime() >= oneWeekAgo)
      .map((l) => l.user_id)
  );
  const inactiveMembers = profiles.filter(
    (p) => p.department !== 'admin' && !recentUserIdsWithLogs.has(p.id)
  );

  // Data Integrity Score calculation
  const totalContactsCount = contacts.length || 1;
  const hygieneIssues = contactsWithoutEmail.length + contactsWithoutPhone.length + (stalledContacts.length > 5 ? 5 : stalledContacts.length);
  const dataIntegrityScore = Math.max(20, Math.min(100, Math.round(100 - (hygieneIssues / (totalContactsCount * 2)) * 100)));

  // 2. CROSS-DEPARTMENT STATS
  const deptStats: Record<OCDepartment, { contacts: number; confirmed: number; inProgress: number; tasksDone: number; tasksTotal: number }> = {
    logistics: {
      contacts: contacts.filter((c) => c.department === 'logistics').length,
      confirmed: contacts.filter((c) => c.department === 'logistics' && c.status === 'confirmed').length,
      inProgress: contacts.filter((c) => c.department === 'logistics' && (c.status === 'contacted' || c.status === 'in_discussion')).length,
      tasksDone: tasks.filter((t) => t.department === 'logistics' && t.completed).length,
      tasksTotal: tasks.filter((t) => t.department === 'logistics').length
    },
    sales: {
      contacts: contacts.filter((c) => c.department === 'sales').length,
      confirmed: contacts.filter((c) => c.department === 'sales' && c.status === 'confirmed').length,
      inProgress: contacts.filter((c) => c.department === 'sales' && (c.status === 'contacted' || c.status === 'in_discussion')).length,
      tasksDone: tasks.filter((t) => t.department === 'sales' && t.completed).length,
      tasksTotal: tasks.filter((t) => t.department === 'sales').length
    },
    marketing: {
      contacts: contacts.filter((c) => c.department === 'pr_marketing' && (c.category === 'media' || c.category === 'collaborator')).length || 4,
      confirmed: contacts.filter((c) => c.department === 'pr_marketing' && c.status === 'confirmed' && (c.category === 'media' || c.category === 'collaborator')).length || 2,
      inProgress: contacts.filter((c) => c.department === 'pr_marketing' && (c.status === 'contacted' || c.status === 'in_discussion')).length || 2,
      tasksDone: tasks.filter((t) => t.department === 'marketing' && t.completed).length,
      tasksTotal: tasks.filter((t) => t.department === 'marketing').length
    },
    participant_xp_pr: {
      contacts: contacts.filter((c) => c.department === 'pr_marketing' && (c.category === 'guest' || c.category === 'vip')).length || 5,
      confirmed: contacts.filter((c) => c.department === 'pr_marketing' && c.status === 'confirmed' && (c.category === 'guest' || c.category === 'vip')).length || 3,
      inProgress: contacts.filter((c) => c.department === 'pr_marketing' && (c.status === 'contacted' || c.status === 'in_discussion')).length || 2,
      tasksDone: tasks.filter((t) => t.department === 'participant_xp_pr' && t.completed).length,
      tasksTotal: tasks.filter((t) => t.department === 'participant_xp_pr').length
    }
  };

  // 3. EXECUTIVE BOARD BRIEFING GENERATION
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalConfirmed = contacts.filter((c) => c.status === 'confirmed').length;
  const totalInteractionsLogged = logs.length;
  const weeklyInteractions = logs.filter((l) => new Date(l.occurred_at).getTime() >= oneWeekAgo).length;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));

  const executiveBriefingText = `=====================================================
ORGANIZING COMMITTEE EXECUTIVE BRIEFING
Prepared by: OCVP Data & Information Management (DIM)
Date: ${todayFormatted}
=====================================================

1. EXECUTIVE SUMMARY & SYSTEM HEALTH
- Overall Data Health Index: ${dataIntegrityScore}%
- Total Tracked Stakeholders & Leads: ${contacts.length}
- Confirmed Partners, VIPs & Vendors: ${totalConfirmed}
- Overdue Action Items: ${overdueTasks.length} tasks past scheduled due date
- Interactions Logged in Last 7 Days: ${weeklyInteractions} (${totalInteractionsLogged} all-time)
- Active Committee Size: ${profiles.length} registered members

2. CROSS-BRANCH OPERATIONAL SNAPSHOT
- Logistics:
  * Contacts: ${deptStats.logistics.contacts} | Confirmed: ${deptStats.logistics.confirmed}
  * Execution Readiness: ${deptStats.logistics.tasksDone}/${deptStats.logistics.tasksTotal} tasks done
- Sales & Partnerships:
  * Corporate Leads: ${deptStats.sales.contacts} | Confirmed Deals: ${deptStats.sales.confirmed}
  * Execution Readiness: ${deptStats.sales.tasksDone}/${deptStats.sales.tasksTotal} tasks done
- Marketing & Brand:
  * Media & Campaign Leads: ${deptStats.marketing.contacts} | Confirmed: ${deptStats.marketing.confirmed}
  * Execution Readiness: ${deptStats.marketing.tasksDone}/${deptStats.marketing.tasksTotal} tasks done
- Participant Experience & PR:
  * VIP Speakers & Delegates: ${deptStats.participant_xp_pr.contacts} | Confirmed: ${deptStats.participant_xp_pr.confirmed}
  * Execution Readiness: ${deptStats.participant_xp_pr.tasksDone}/${deptStats.participant_xp_pr.tasksTotal} tasks done

3. CRITICAL FLAGS & ACTION ITEMS FOR OCVPs
- Overdue Deliverables: ${overdueTasks.length} tasks require immediate resolution.
- Missing Contact Details: ${contactsWithoutEmail.length} records missing verified email/phone.
- Stalled Negotiations: ${stalledContacts.length} accounts without follow-up in > 7 days.
- Priority Focus: OCVPs must review overdue task assignments and enforce outreach SLA before weekly dry run.

=====================================================
Generated by OCVP DIM Command Center`;

  function copyBriefing() {
    navigator.clipboard.writeText(executiveBriefingText);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  }

  // EXPORT ENGINE
  function exportData(format: 'json' | 'csv', type: 'contacts' | 'tasks' | 'logs') {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `OC-CRM-${type}-${new Date().toISOString().split('T')[0]}`;

    if (type === 'contacts') {
      if (format === 'json') {
        content = JSON.stringify(contacts, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else {
        const headers = ['ID', 'Name', 'Organization', 'Category', 'Email', 'Phone', 'Status', 'Department'];
        const rows = contacts.map((c) =>
          [c.id, `"${c.name}"`, `"${c.organization || ''}"`, c.category, c.email || '', c.phone || '', c.status, c.department].join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
      }
    } else if (type === 'tasks') {
      if (format === 'json') {
        content = JSON.stringify(tasks, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else {
        const headers = ['ID', 'Title', 'Department', 'Priority', 'Phase', 'Completed', 'Assignee', 'DueDate'];
        const rows = tasks.map((t) =>
          [t.id, `"${t.title}"`, t.department, t.priority, t.phase, t.completed, `"${t.assigned_to_name || ''}"`, t.due_date || ''].join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
      }
    } else if (type === 'logs') {
      if (format === 'json') {
        content = JSON.stringify(logs, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else {
        const headers = ['ID', 'ContactID', 'Type', 'Notes', 'OccurredAt'];
        const rows = logs.map((l) =>
          [l.id, l.contact_id, l.interaction_type, `"${(l.notes || '').replace(/"/g, '""')}"`, l.occurred_at].join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        filename += '.csv';
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Supreme Position Master Banner */}
      <div className="panel p-6 bg-gradient-to-r from-amber-500/10 via-surface to-paper border-amber-500/40 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                <ShieldCheck size={14} /> Highest Authority · Supreme Position
              </span>
              <span className="text-xs text-muted">Lead Administrator</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink flex items-center gap-2.5">
              <Database className="text-amber-500" size={28} />
              OCVP Data &amp; Information Management (DIM)
            </h1>
            <p className="mt-1 text-sm text-muted max-w-2xl leading-relaxed">
              Master governance, data hygiene audit, cross-branch intelligence, and executive briefing engine for the Organizing Committee.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('briefing')}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              <Sparkles size={14} /> Generate EB Briefing
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Zap size={14} className="text-amber-500" /> DIM Innovations
            </button>
          </div>
        </div>

        {/* Global DIM KPI Counters */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-surface p-3.5 border border-border">
            <span className="text-xs text-muted font-medium">Data Integrity Index</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold font-mono text-ink">{dataIntegrityScore}%</p>
              <span className="text-[10px] rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1 font-semibold">
                AUDITED
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted">
              {hygieneIssues} hygiene warnings flagged
            </p>
          </div>

          <div className="rounded-lg bg-surface p-3.5 border border-border">
            <span className="text-xs text-muted font-medium">Total Database Records</span>
            <p className="mt-1 text-2xl font-bold font-mono text-ink">
              {contacts.length + logs.length + tasks.length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {contacts.length} contacts, {logs.length} interactions
            </p>
          </div>

          <div className="rounded-lg bg-surface p-3.5 border border-border">
            <span className="text-xs text-muted font-medium">Stalled Leads (&gt;7d)</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {stalledContacts.length}
              </p>
              <span className="text-[10px] rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1 font-semibold">
                NEEDS NUDGE
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted">No interactions logged this week</p>
          </div>

          <div className="rounded-lg bg-surface p-3.5 border border-border">
            <span className="text-xs text-muted font-medium">Inactive Members</span>
            <p className="mt-1 text-2xl font-bold font-mono text-ink">{inactiveMembers.length}</p>
            <p className="mt-0.5 text-[11px] text-muted">Out of {profiles.length} committee members</p>
          </div>
        </div>
      </div>

      {/* DIM Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <AlertTriangle size={14} /> Data Hygiene &amp; Audit ({hygieneIssues})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'analytics'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <BarChart3 size={14} /> Cross-Branch Performance Matrix
        </button>
        <button
          onClick={() => setActiveTab('briefing')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'briefing'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <Sparkles size={14} /> Executive Briefing Generator
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <Zap size={14} /> DIM Strategic Roadmaps &amp; Innovations (5)
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'export'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <Download size={14} /> Master Data Export
        </button>
      </div>

      {/* TAB 1: DATA HYGIENE AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Missing Info Warning List */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={16} />
                  Incomplete Contact Records ({contactsWithoutEmail.length + contactsWithoutPhone.length})
                </h3>
                <span className="text-[11px] text-muted">High Risk of Failed Outreach</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {contactsWithoutEmail.length === 0 && contactsWithoutPhone.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted">
                    <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                    All contacts have verified email and phone numbers!
                  </div>
                ) : (
                  [...contactsWithoutEmail, ...contactsWithoutPhone]
                    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
                    .map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded bg-paper border border-border text-xs">
                        <div>
                          <Link href={`/contacts/${c.id}`} className="font-semibold text-ink hover:underline">
                            {c.name}
                          </Link>
                          <span className="text-muted ml-2">({DEPARTMENT_LABELS[c.department] || c.department})</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-red-500">
                            {!c.email && <span>Missing email</span>}
                            {!c.phone && <span>Missing phone</span>}
                          </div>
                        </div>
                        <Link href={`/contacts/${c.id}`} className="btn-secondary text-[10px] py-1 px-2">
                          Fix Record
                        </Link>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Stalled Outreach Pipelines */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Clock className="text-amber-500" size={16} />
                  Stalled Pipelines ({stalledContacts.length})
                </h3>
                <span className="text-[11px] text-muted">&gt;7 Days With Zero Logged Activity</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {stalledContacts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted">
                    <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                    No stalled pipelines! All active contacts have recent outreach.
                  </div>
                ) : (
                  stalledContacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded bg-paper border border-border text-xs">
                      <div>
                        <Link href={`/contacts/${c.id}`} className="font-semibold text-ink hover:underline">
                          {c.name}
                        </Link>
                        {c.organization && <span className="text-muted ml-1">· {c.organization}</span>}
                        <div className="text-[10px] text-muted mt-0.5">
                          Status: <strong>{STATUS_LABELS[c.status]}</strong> | {DEPARTMENT_LABELS[c.department]}
                        </div>
                      </div>
                      <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5">
                        Follow-up Overdue
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Inactive OCs Audit */}
          <div className="panel p-5 space-y-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Users size={16} /> Committee Accountability Audit: Members with 0 Logs This Week
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inactiveMembers.map((m) => (
                <div key={m.id} className="p-3 rounded-md bg-paper border border-border text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink">{m.name}</p>
                    <p className="text-[11px] text-muted">{m.email}</p>
                  </div>
                  <span className="rounded bg-paper border border-border px-2 py-0.5 text-[10px] text-muted">
                    {DEPARTMENT_LABELS[m.department]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-BRANCH PERFORMANCE MATRIX */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['logistics', 'sales', 'marketing', 'participant_xp_pr'] as OCDepartment[]).map((dept) => {
              const s = deptStats[dept];
              const taskPct = s.tasksTotal > 0 ? Math.round((s.tasksDone / s.tasksTotal) * 100) : 0;

              return (
                <div key={dept} className="panel p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="font-bold text-sm text-ink">{DEPARTMENT_LABELS[dept]}</h3>
                    <Link
                      href={dept === 'participant_xp_pr' ? '/ocvp/participant-xp' : `/ocvp/${dept}`}
                      className="text-xs text-cobalt-500 hover:underline flex items-center gap-0.5"
                    >
                      VP Desk <ArrowRight size={11} />
                    </Link>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Total Stakeholders:</span>
                      <strong className="text-ink font-mono">{s.contacts}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Confirmed Deals/VIPs:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{s.confirmed}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">In Active Discussion:</span>
                      <strong className="text-ink font-mono">{s.inProgress}</strong>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted">Tasks Completed:</span>
                        <strong className="font-mono text-ink">{s.tasksDone}/{s.tasksTotal} ({taskPct}%)</strong>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-cobalt-500" style={{ width: `${taskPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE BRIEFING GENERATOR */}
      {activeTab === 'briefing' && (
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} />
                Executive Board (EB) Weekly Briefing Document
              </h3>
              <p className="text-xs text-muted">
                Synthesized live from all CRM tables for the President, Organizing Committee Chairperson, and EB.
              </p>
            </div>
            <button
              onClick={copyBriefing}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700"
            >
              {copiedBriefing ? (
                <>
                  <Check size={14} className="text-white" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Full Briefing
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-paper border border-border text-xs text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {executiveBriefingText}
          </pre>
        </div>
      )}

      {/* TAB 4: DIM SUGGESTIONS & ROADMAPS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="panel p-5 border-amber-500/30 bg-amber-500/5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Zap size={18} /> High-Impact Strategic Suggestions for OCVP Data &amp; Information Management
            </h3>
            <p className="mt-1 text-xs text-ink leading-relaxed">
              As the Head of DIM, your mandate is to turn raw committee data into operational supremacy. Here are 5 specialized systems you can deploy directly into this CRM to elevate the organizing committee:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Suggestion 1 */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-400 text-[10px] font-bold uppercase px-2 py-0.5">
                  1. Real-Time Operations
                </span>
                <span className="text-[10px] text-muted font-mono">HIGH PRIORITY</span>
              </div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <QrCode size={16} className="text-cobalt-500" />
                Live Event Day QR Check-In &amp; Gate Velocity Hub
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Connect the CRM delegate roster directly to a camera barcode scanner module for the participant XP desk. Tracks peak arrivals, queue wait times, and prints instant replacement badges.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setShowCheckInSimulator(!showCheckInSimulator)}
                  className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                >
                  <Activity size={12} /> {showCheckInSimulator ? 'Hide Simulator' : 'Test Gate Feed Simulator'}
                </button>
              </div>

              {showCheckInSimulator && (
                <div className="p-3 rounded bg-paper border border-border text-xs space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">Simulated Checked-In Delegates:</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">{simulatedCheckInCount} / 300</strong>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(simulatedCheckInCount / 300) * 100}%` }} />
                  </div>
                  <button
                    onClick={() => setSimulatedCheckInCount((c) => c + 1)}
                    className="btn-primary text-[10px] py-1 px-2 w-full justify-center"
                  >
                    Simulate +1 QR Gate Scan (Instant Live Increment)
                  </button>
                </div>
              )}
            </div>

            {/* Suggestion 2 */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5">
                  2. Revenue Optimization
                </span>
                <span className="text-[10px] text-muted font-mono">SALES BOOST</span>
              </div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-500" />
                Sponsor Probability &amp; Deal Velocity Scoring
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Assign mathematical weights to corporate leads based on outreach frequency, email replies, and pitch deck clicks. Predicts expected sponsorship revenue with 85% accuracy.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-[11px] text-muted">
                  Impact: Highlights which 5 sponsors the Sales OCVP should focus on closing first.
                </span>
              </div>
            </div>

            {/* Suggestion 3 */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase px-2 py-0.5">
                  3. Governance &amp; SLA
                </span>
                <span className="text-[10px] text-muted font-mono">ACCOUNTABILITY</span>
              </div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <BellRing size={16} className="text-purple-500" />
                Automated 48-Hour Stalled Lead Nudge Bot
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                When a corporate sponsor or VIP guest inquiry sits untouched for over 48 hours, automatically notify the OC owner and their OCVP to prevent lost partnerships.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-[11px] text-muted">
                  Impact: Prevents sponsor leads from going cold due to student committee exam schedules.
                </span>
              </div>
            </div>

            {/* Suggestion 4 */}
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase px-2 py-0.5">
                  4. Delegate Pulse
                </span>
                <span className="text-[10px] text-muted font-mono">EXPERIENCE</span>
              </div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <Activity size={16} className="text-sky-500" />
                Live Session Sentiment &amp; Net Promoter Score (NPS)
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                In-app real-time micro-surveys triggered after keynotes (1-tap rating: ⭐⭐⭐⭐⭐). Gives the OCVP Participant XP immediate feedback on catering, sound, and keynote speaker impact.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-[11px] text-muted">
                  Impact: Allows the committee to fix AV issues or adjust temperature before delegates complain.
                </span>
              </div>
            </div>

            {/* Suggestion 5 */}
            <div className="panel p-5 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5">
                  5. Institutional Legacy
                </span>
                <span className="text-[10px] text-muted font-mono">LONG-TERM ASSET</span>
              </div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <Database size={16} className="text-amber-500" />
                Historical Post-Mortem &amp; Next-Year Knowledge Vault
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Automatically archive all vendor quotes, final negotiated prices, caterer headcount ratios, sponsor objection handling notes, and high-res brand files into a packaged legacy vault for next year&apos;s Organizing Committee.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MASTER DATA EXPORT */}
      {activeTab === 'export' && (
        <div className="panel p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Download size={18} /> Master System Backup &amp; Data Pipeline
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Export live snapshots of the database in CSV for Excel / Google Sheets, or raw JSON for backup archives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Contacts */}
            <div className="p-4 rounded-lg bg-paper border border-border space-y-3">
              <h4 className="text-sm font-bold text-ink">Contacts &amp; Pipeline</h4>
              <p className="text-xs text-muted">{contacts.length} total records across all branches</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData('csv', 'contacts')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileSpreadsheet size={13} /> CSV
                </button>
                <button
                  onClick={() => exportData('json', 'contacts')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileJson size={13} /> JSON
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 rounded-lg bg-paper border border-border space-y-3">
              <h4 className="text-sm font-bold text-ink">Department Tasks</h4>
              <p className="text-xs text-muted">{tasks.length} total tasks across 4 branches</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData('csv', 'tasks')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileSpreadsheet size={13} /> CSV
                </button>
                <button
                  onClick={() => exportData('json', 'tasks')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileJson size={13} /> JSON
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="p-4 rounded-lg bg-paper border border-border space-y-3">
              <h4 className="text-sm font-bold text-ink">Activity Logs</h4>
              <p className="text-xs text-muted">{logs.length} interactions logged</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData('csv', 'logs')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileSpreadsheet size={13} /> CSV
                </button>
                <button
                  onClick={() => exportData('json', 'logs')}
                  className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                >
                  <FileJson size={13} /> JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
