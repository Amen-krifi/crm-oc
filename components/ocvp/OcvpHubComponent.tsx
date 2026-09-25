'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingUp,
  Megaphone,
  HeartHandshake,
  Users,
  CheckSquare,
  FileUp,
  Plus,
  Calendar,
  ExternalLink,
  Trash2,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Send,
  Download
} from 'lucide-react';
import type { Contact, Log, Profile, Task, ResourceUpload, Announcement, OCDepartment, TaskPriority, TaskPhase } from '@/lib/types';
import { DEPARTMENT_LABELS, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { isTaskOverdue, getTaskDueStatus } from '@/lib/task-utils';

interface OcvpHubProps {
  dept: OCDepartment;
  vpTitle: string;
  vpSubtitle: string;
  targetKpis: { label: string; value: string | number; hint?: string }[];
  teamMembers: Profile[];
  contacts: Contact[];
  logs: Log[];
  initialTasks: Task[];
  initialResources: ResourceUpload[];
  initialAnnouncements: Announcement[];
}

export default function OcvpHubComponent({
  dept,
  vpTitle,
  vpSubtitle,
  targetKpis,
  teamMembers,
  contacts,
  logs,
  initialTasks,
  initialResources,
  initialAnnouncements
}: OcvpHubProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'tasks' | 'resources' | 'announcements'>('team');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [resources, setResources] = useState<ResourceUpload[]>(initialResources);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskPhase, setTaskPhase] = useState<TaskPhase>('pre_event');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  // New resource form state
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resCategory, setResCategory] = useState<ResourceUpload['category']>('sop');

  // Announcement state
  const [isAddingAnn, setIsAddingAnn] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          department: dept,
          priority: taskPriority,
          phase: taskPhase,
          due_date: taskDueDate || undefined,
          assigned_to_name: taskAssignee || undefined,
          created_by: vpTitle
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
        setIsAddingTask(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleTask(task: Task) {
    const nextCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, completed: nextCompleted })
    });
  }

  async function handleDeleteTask(id: string) {
    if (!confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resTitle || !resUrl) return;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resTitle,
          description: resDesc,
          department: dept,
          category: resCategory,
          url: resUrl,
          uploaded_by: `vp-${dept}`,
          uploaded_by_name: vpTitle
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data.resource, ...prev]);
        setResTitle('');
        setResDesc('');
        setResUrl('');
        setIsAddingResource(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteResource(id: string) {
    if (!confirm('Delete this resource?')) return;
    setResources((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/resources?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          department: dept,
          priority: annPriority,
          author_name: vpTitle,
          author_role: 'Vice President'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setAnnTitle('');
        setAnnContent('');
        setIsAddingAnn(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Delete announcement?')) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // Selected member inspection
  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);
  const selectedMemberContacts = contacts.filter((c) => c.owner_id === selectedMemberId);
  const selectedMemberLogs = logs.filter((l) => l.user_id === selectedMemberId);
  const selectedMemberTasks = tasks.filter(
    (t) => t.assigned_to_id === selectedMemberId || (selectedMember?.name && t.assigned_to_name === selectedMember.name)
  );

  return (
    <div className="space-y-6">
      {/* VP Top Banner */}
      <div className="panel p-6 bg-gradient-to-r from-surface via-surface to-paper border-cobalt-500/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cobalt-500/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400">
                OCVP Leadership Workspace
              </span>
              <span className="text-xs text-muted">Branch: {DEPARTMENT_LABELS[dept]}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{vpTitle}</h1>
            <p className="mt-1 text-sm text-muted max-w-2xl">{vpSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tasks?dept=${dept}`}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <CheckSquare size={14} /> View To-Do List
            </Link>
            <button
              onClick={() => setIsAddingTask(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus size={14} /> Assign Task
            </button>
          </div>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {targetKpis.map((kpi, idx) => (
            <div key={idx} className="rounded-lg bg-surface p-3.5 border border-border">
              <span className="text-xs text-muted font-medium">{kpi.label}</span>
              <p className="mt-1 text-2xl font-bold font-mono text-ink">{kpi.value}</p>
              {kpi.hint && <p className="mt-0.5 text-[11px] text-muted">{kpi.hint}</p>}
            </div>
          ))}
          <div className="rounded-lg bg-surface p-3.5 border border-border">
            <span className="text-xs text-muted font-medium">Task Completion</span>
            <p className="mt-1 text-2xl font-bold font-mono text-ink">{taskCompletionRate}%</p>
            <p className="mt-0.5 text-[11px] text-muted">{completedTasks} of {totalTasks} tasks done</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => { setActiveTab('team'); setSelectedMemberId(null); }}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'team'
              ? 'bg-cobalt-500 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <Users size={14} /> Team &amp; Work Inspection ({teamMembers.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'bg-cobalt-500 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <CheckSquare size={14} /> Task Assignment &amp; Tracking ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'resources'
              ? 'bg-cobalt-500 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <FileUp size={14} /> Uploads &amp; Files to OCs ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'announcements'
              ? 'bg-cobalt-500 text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          <Send size={14} /> Team Directives &amp; Bulletins ({announcements.length})
        </button>
      </div>

      {/* TAB 1: TEAM & WORK INSPECTOR */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {!selectedMemberId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-ink">OC Member Roster &amp; Output</h3>
                  <p className="text-xs text-muted">
                    Click &quot;Inspect Work&quot; on any OC to view their owned contacts, outreach logs, and task deliverables.
                  </p>
                </div>
              </div>

              <div className="panel overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper border-b border-border text-muted uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Member Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-center">Contacts Owned</th>
                      <th className="px-4 py-3 text-center">Confirmed</th>
                      <th className="px-4 py-3 text-center">Logs Recorded</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teamMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted">
                          No team members registered under this department yet.
                        </td>
                      </tr>
                    ) : (
                      teamMembers.map((m) => {
                        const mContacts = contacts.filter((c) => c.owner_id === m.id);
                        const mConfirmed = mContacts.filter((c) => c.status === 'confirmed').length;
                        const mLogs = logs.filter((l) => l.user_id === m.id).length;

                        return (
                          <tr key={m.id} className="hover:bg-paper/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-ink flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cobalt-500/10 text-cobalt-600 font-bold text-xs">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{m.name}</span>
                            </td>
                            <td className="px-4 py-3 text-muted">{m.email}</td>
                            <td className="px-4 py-3 text-center font-mono font-medium text-ink">
                              {mContacts.length}
                            </td>
                            <td className="px-4 py-3 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">
                              {mConfirmed}
                            </td>
                            <td className="px-4 py-3 text-center font-mono text-muted">
                              {mLogs}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setSelectedMemberId(m.id)}
                                className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                              >
                                <Eye size={12} /> Inspect Work
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Detailed Member Inspector */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    ← Back to Roster
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-ink flex items-center gap-2">
                      <span>{selectedMember?.name}</span>
                      <span className="rounded bg-paper border border-border px-2 py-0.5 text-[11px] font-normal text-muted">
                        {selectedMember?.email}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>

              {/* Member Work Overview Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="panel p-3 text-center">
                  <span className="text-xs text-muted">Owned Contacts</span>
                  <p className="text-xl font-bold font-mono text-ink mt-0.5">{selectedMemberContacts.length}</p>
                </div>
                <div className="panel p-3 text-center">
                  <span className="text-xs text-muted">Logged Interactions</span>
                  <p className="text-xl font-bold font-mono text-ink mt-0.5">{selectedMemberLogs.length}</p>
                </div>
                <div className="panel p-3 text-center">
                  <span className="text-xs text-muted">Assigned Tasks</span>
                  <p className="text-xl font-bold font-mono text-ink mt-0.5">{selectedMemberTasks.length}</p>
                </div>
              </div>

              {/* Contacts Owned by this OC */}
              <div className="panel p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Pipeline &amp; Contacts Managed by {selectedMember?.name}
                </h4>
                {selectedMemberContacts.length === 0 ? (
                  <p className="text-xs text-muted py-2">No contacts logged by this member yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMemberContacts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded-md bg-paper border border-border text-xs">
                        <div>
                          <Link href={`/contacts/${c.id}`} className="font-semibold text-ink hover:underline">
                            {c.name}
                          </Link>
                          {c.organization && <span className="text-muted ml-2">({c.organization})</span>}
                          <span className="ml-2 text-muted">· {CATEGORY_LABELS[c.category] || c.category}</span>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity Logged by this OC */}
              <div className="panel p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Recent Interactions Logged
                </h4>
                {selectedMemberLogs.length === 0 ? (
                  <p className="text-xs text-muted py-2">No calls, emails or meetings logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMemberLogs.map((l) => (
                      <div key={l.id} className="p-2.5 rounded-md bg-paper border border-border text-xs">
                        <div className="flex items-center justify-between text-muted mb-1">
                          <span className="capitalize font-semibold text-ink">{l.interaction_type}</span>
                          <span>{new Date(l.occurred_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-ink">{l.notes || 'No notes entered.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASK ASSIGNMENT */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Department Deliverables &amp; Work Orders</h3>
              <p className="text-xs text-muted">Assign actionable tasks with deadlines to specific OCs.</p>
            </div>
            <button
              onClick={() => setIsAddingTask(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} /> Assign New Task
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isOverdue = isTaskOverdue(task);
              const dueStatus = getTaskDueStatus(task);

              return (
                <div
                  key={task.id}
                  className={`panel p-3.5 flex items-start gap-3 transition-colors ${
                    task.completed
                      ? 'bg-surface/50 opacity-70'
                      : isOverdue
                      ? 'border-l-4 border-l-red-500 bg-red-500/[0.04] dark:bg-red-950/20 border-red-500/40 shadow-xs'
                      : 'bg-surface'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-muted hover:text-emerald-500"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <Clock size={18} className={isOverdue ? 'text-red-500' : ''} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${task.completed ? 'line-through text-muted' : 'text-ink'}`}>
                        {task.title}
                      </span>
                      {isOverdue && (
                        <span className="rounded bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/40 px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider">
                          Overdue
                        </span>
                      )}
                      <span className="rounded bg-paper px-1.5 py-0.5 text-[9px] uppercase font-bold text-muted border border-border">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-muted line-clamp-1">{task.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted">
                      {task.assigned_to_name && <span>Assignee: <strong>{task.assigned_to_name}</strong></span>}
                      {task.due_date && (
                        <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                          Due: <strong>{task.due_date}</strong> {isOverdue && `(${dueStatus.badgeLabel})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-muted hover:text-red-500 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RESOURCE UPLOADS */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Upload Master Files &amp; Assets for your OCs</h3>
              <p className="text-xs text-muted">
                Files, pitch decks, Notion playbooks, and floor plans uploaded here appear directly in the OC Toolkit.
              </p>
            </div>
            <button
              onClick={() => setIsAddingResource(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} /> Upload Asset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((res) => (
              <div key={res.id} className="panel p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                    <span className="uppercase font-mono">{res.category}</span>
                    <span>{new Date(res.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-ink">{res.title}</h4>
                  <p className="mt-1 text-xs text-muted line-clamp-2">{res.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="text-muted hover:text-red-500 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <ExternalLink size={11} /> Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTIVES & ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Broadcast Directives to {DEPARTMENT_LABELS[dept]} OCs</h3>
              <p className="text-xs text-muted">Pinned updates broadcast directly to your branch members.</p>
            </div>
            <button
              onClick={() => setIsAddingAnn(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} /> Post Directive
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="panel p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {ann.priority === 'urgent' && (
                      <span className="rounded bg-red-500/20 text-red-600 text-[10px] font-bold px-2 py-0.5 uppercase">
                        Urgent
                      </span>
                    )}
                    <span className="text-[11px] text-muted">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-ink">{ann.title}</h4>
                  <p className="mt-1 text-xs text-ink">{ann.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="text-muted hover:text-red-500 p-1 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-ink">Assign Deliverable ({DEPARTMENT_LABELS[dept]})</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm 2nd tier sponsor banner measurements"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="input text-xs"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Phase</label>
                  <select
                    value={taskPhase}
                    onChange={(e) => setTaskPhase(e.target.value as any)}
                    className="input text-xs"
                  >
                    <option value="pre_event">Pre-Event</option>
                    <option value="event_day">Event Day</option>
                    <option value="post_event">Post-Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Assign to Member</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="">Unassigned / Team wide</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-ink">Due Date</label>
                    <div className="flex items-center gap-1 text-[9px]">
                      <button
                        type="button"
                        onClick={() => setTaskDueDate(new Date().toISOString().split('T')[0])}
                        className="px-1 py-0.2 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                        className="px-1 py-0.2 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                      >
                        +1d
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])}
                        className="px-1 py-0.2 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                      >
                        +7d
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingTask(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Resource */}
      {isAddingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-ink">Upload Asset / Link for OCs</h3>
              <button onClick={() => setIsAddingResource(false)} className="text-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Sponsorship Contract Template 2026"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">File URL / Cloud Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Category</label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="brief">Presentation / Brief</option>
                  <option value="sop">SOP &amp; Protocol</option>
                  <option value="template">Contract / Template</option>
                  <option value="file">File / Graphic</option>
                  <option value="run_of_show">Run of Show Sheet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for team..."
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingResource(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Upload Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Announcement */}
      {isAddingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-ink">Broadcast Team Directive</h3>
              <button onClick={() => setIsAddingAnn(false)} className="text-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Directive Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Standup Moved to 4:00 PM"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details for your OCs..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingAnn(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Send Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
