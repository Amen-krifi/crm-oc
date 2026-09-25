'use client';

import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Filter,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Clock,
  User,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
  Package,
  TrendingUp,
  Megaphone,
  HeartHandshake
} from 'lucide-react';
import type { Task, OCDepartment, TaskPriority, TaskPhase } from '@/lib/types';
import { OC_DEPARTMENTS, DEPARTMENT_LABELS } from '@/lib/types';
import { useProfile } from '@/lib/profile-context';
import { isTaskOverdue, getTaskDueStatus } from '@/lib/task-utils';

const DEPT_ICONS: Record<OCDepartment, React.ElementType> = {
  logistics: Package,
  sales: TrendingUp,
  marketing: Megaphone,
  participant_xp_pr: HeartHandshake
};

const DEPT_COLORS: Record<OCDepartment, { bg: string; text: string; border: string; accent: string }> = {
  logistics: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', accent: 'bg-amber-500' },
  sales: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', accent: 'bg-emerald-500' },
  marketing: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30', accent: 'bg-purple-500' },
  participant_xp_pr: { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/30', accent: 'bg-sky-500' }
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; class: string }> = {
  urgent: { label: 'Urgent', class: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20' },
  high: { label: 'High', class: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20' },
  medium: { label: 'Medium', class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  low: { label: 'Low', class: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/20' }
};

const PHASE_LABELS: Record<TaskPhase, string> = {
  pre_event: 'Pre-Event Phase',
  event_day: 'Event Day (Run-of-Show)',
  post_event: 'Post-Event Wrap-up'
};

export default function TodoListComponent({ initialTasks }: { initialTasks: Task[] }) {
  const profile = useProfile();

  // Determine initial selected department
  const userDept = profile.department as OCDepartment;
  const validDept = OC_DEPARTMENTS.includes(userDept) ? userDept : 'logistics';

  const [activeDept, setActiveDept] = useState<OCDepartment>(validDept);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [phaseFilter, setPhaseFilter] = useState<'all' | TaskPhase>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  // New task modal
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newPhase, setNewPhase] = useState<TaskPhase>('pre_event');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState(profile.name || '');

  // Refetch when active department changes
  async function refreshTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks`);
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }

  // Toggle completion
  async function toggleTask(task: Task) {
    const nextCompleted = !task.completed;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: nextCompleted })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    }
  }

  // Add new task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          department: activeDept,
          priority: newPriority,
          phase: newPhase,
          due_date: newDueDate || undefined,
          assigned_to_name: newAssignee.trim() || undefined,
          created_by: profile.name || 'OC'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle('');
        setNewDesc('');
        setNewDueDate('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  }

  // Delete task
  async function handleDeleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  }

  // Filter tasks for active department
  const deptTasks = tasks.filter((t) => t.department === activeDept);
  const totalDeptTasks = deptTasks.length;
  const completedDeptTasks = deptTasks.filter((t) => t.completed).length;
  const overdueDeptTasks = deptTasks.filter((t) => isTaskOverdue(t));
  const deptOverdueCount = overdueDeptTasks.length;
  const completionPercentage = totalDeptTasks > 0 ? Math.round((completedDeptTasks / totalDeptTasks) * 100) : 0;

  const filteredTasks = deptTasks.filter((t) => {
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (statusFilter === 'overdue' && !isTaskOverdue(t)) return false;
    if (phaseFilter !== 'all' && t.phase !== phaseFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  function exportChecklist() {
    const textData = `--- OC ${DEPARTMENT_LABELS[activeDept].toUpperCase()} TO-DO CHECKLIST ---\n` +
      `Progress: ${completedDeptTasks}/${totalDeptTasks} completed (${completionPercentage}%)\n` +
      `Overdue Tasks: ${deptOverdueCount}\n\n` +
      deptTasks.map((t, i) => {
        const overdue = isTaskOverdue(t);
        const tag = overdue ? ' [OVERDUE]' : t.completed ? ' [DONE]' : '';
        return `[${t.completed ? 'X' : ' '}] ${i + 1}. ${t.title}${tag} (${t.priority.toUpperCase()} - ${t.phase})\n` +
          (t.description ? `    Notes: ${t.description}\n` : '') +
          (t.assigned_to_name ? `    Assigned: ${t.assigned_to_name}\n` : '') +
          (t.due_date ? `    Due Date: ${t.due_date}${overdue ? ' *** OVERDUE ***' : ''}\n` : '');
      }).join('\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OC-${activeDept}-Checklist.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header and Department Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2.5">
            <CheckSquare className="text-cobalt-500" size={26} />
            Department To-Do Lists
          </h1>
          <p className="mt-1 text-sm text-muted">
            Specialized execution checklists tailored for each of the 4 Organizing Committee branches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportChecklist}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Download formatted checklist"
          >
            <Download size={14} /> Export List
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* The 4 Department Selector Pills */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OC_DEPARTMENTS.map((dept) => {
          const Icon = DEPT_ICONS[dept];
          const isActive = activeDept === dept;
          const color = DEPT_COLORS[dept];
          const count = tasks.filter((t) => t.department === dept).length;
          const completedCount = tasks.filter((t) => t.department === dept && t.completed).length;

          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all ${
                isActive
                  ? `border-cobalt-500 bg-surface ring-2 ring-cobalt-500/20 shadow-sm`
                  : 'border-border bg-surface/50 hover:bg-surface hover:border-muted/30'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color.bg} ${color.text}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-ink' : 'text-muted'}`}>
                  {DEPARTMENT_LABELS[dept]}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                  <span className="font-mono font-medium text-ink">{completedCount}/{count}</span>
                  <span>done</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Department Readiness Banner */}
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DEPT_COLORS[activeDept].bg} ${DEPT_COLORS[activeDept].text}`}>
                <Sparkles size={12} /> {DEPARTMENT_LABELS[activeDept]} Readiness
              </span>
              <span className="text-xs text-muted">
                {completedDeptTasks} of {totalDeptTasks} tasks completed
              </span>
            </div>
            <p className="mt-1 text-sm text-ink">
              {completionPercentage === 100
                ? '🎉 All department checklist items are complete! Superb work!'
                : completionPercentage >= 50
                ? '👍 On track! Over half the execution milestones are confirmed.'
                : '⚡ Execution in progress. Focus on Urgent and High priority items.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-mono text-2xl font-bold text-ink">{completionPercentage}%</span>
            </div>
            <div className="h-3 w-32 sm:w-48 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full transition-all duration-500 ${DEPT_COLORS[activeDept].accent}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Visual Indicator Banner for Overdue Tasks */}
        {deptOverdueCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-red-500/5 -mx-5 -mb-5 p-4 rounded-b-lg border-t-red-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertTriangle size={16} className="text-red-500 shrink-0 animate-pulse" />
              <span>
                Attention: {deptOverdueCount} {deptOverdueCount === 1 ? 'task has passed its due date' : 'tasks have passed their due dates'}!
              </span>
            </div>
            <button
              onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1.5 w-fit ${
                statusFilter === 'overdue'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 hover:bg-red-500/25'
              }`}
            >
              <AlertCircle size={13} />
              {statusFilter === 'overdue' ? 'Show All Tasks' : `Filter to Overdue Tasks (${deptOverdueCount})`}
            </button>
          </div>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted mr-1">
            <Filter size={13} />
            <span>Filter:</span>
          </div>

          {/* Status Tabs */}
          {(['all', 'active', 'overdue', 'completed'] as const).map((st) => {
            const isOverdueTab = st === 'overdue';
            const label =
              st === 'all'
                ? 'All Tasks'
                : st === 'active'
                ? 'Active'
                : st === 'completed'
                ? 'Completed'
                : `🚨 Overdue (${deptOverdueCount})`;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? isOverdueTab
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'bg-cobalt-500 text-white font-semibold shadow-xs'
                    : isOverdueTab && deptOverdueCount > 0
                    ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-semibold'
                    : 'bg-surface border border-border text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            );
          })}

          {/* Phase Filter */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-ink focus:outline-none"
          >
            <option value="all">All Phases</option>
            <option value="pre_event">Pre-Event</option>
            <option value="event_day">Event Day</option>
            <option value="post_event">Post-Event</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-ink focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <span className="text-xs text-muted">
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="panel p-10 text-center">
            <CheckCircle2 size={36} className="mx-auto mb-2 text-muted/50" />
            <h3 className="text-sm font-semibold text-ink">No tasks match your filters</h3>
            <p className="mt-1 text-xs text-muted">
              Try adjusting your filter settings or create a new task for {DEPARTMENT_LABELS[activeDept]}.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priorityBadge = PRIORITY_BADGES[task.priority];
            const dueStatus = getTaskDueStatus(task);
            const isOverdue = dueStatus.isOverdue;
            const isDueToday = dueStatus.isDueToday;

            return (
              <div
                key={task.id}
                className={`panel p-4 transition-all hover:border-cobalt-500/40 ${
                  task.completed
                    ? 'bg-surface/50 opacity-75'
                    : isOverdue
                    ? 'border-l-4 border-l-red-500 bg-red-500/[0.04] dark:bg-red-950/20 border-red-500/40 hover:border-red-500 shadow-xs'
                    : isDueToday
                    ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.04] dark:bg-amber-950/20 border-amber-500/40 hover:border-amber-500 shadow-xs'
                    : 'bg-surface'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Checkbox */}
                  <button
                    onClick={() => toggleTask(task)}
                    className="mt-0.5 text-muted hover:text-cobalt-500 transition-colors shrink-0"
                    title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {task.completed ? (
                      <CheckSquare className="text-emerald-500" size={20} />
                    ) : isOverdue ? (
                      <Square className="text-red-500 hover:text-red-600" size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-semibold text-ink ${
                          task.completed ? 'line-through text-muted' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Overdue Visual Callout Badge */}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          <AlertCircle size={11} className="text-red-500 shrink-0" />
                          <span>{dueStatus.badgeLabel}</span>
                        </span>
                      )}

                      {/* Due Today Badge */}
                      {isDueToday && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={11} className="text-amber-500 shrink-0" />
                          <span>Due Today</span>
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityBadge.class}`}>
                        {priorityBadge.label}
                      </span>

                      {/* Phase Badge */}
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-medium text-muted border border-border">
                        {PHASE_LABELS[task.phase]}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`mt-1 text-xs text-muted leading-relaxed ${task.completed ? 'line-through opacity-60' : ''}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Footer: Due Date, Assignee, Created By */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-muted">
                      {task.due_date && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            task.completed
                              ? 'text-muted'
                              : isOverdue
                              ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 font-semibold'
                              : isDueToday
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-semibold'
                              : 'text-ink bg-surface border border-border'
                          }`}
                        >
                          <Calendar
                            size={12}
                            className={
                              task.completed
                                ? 'text-muted'
                                : isOverdue
                                ? 'text-red-500'
                                : isDueToday
                                ? 'text-amber-500'
                                : 'text-cobalt-500'
                            }
                          />
                          <span>Due: <strong>{task.due_date}</strong> ({dueStatus.formattedDate})</span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                              · OVERDUE
                            </span>
                          )}
                        </span>
                      )}

                      {task.assigned_to_name && (
                        <span className="inline-flex items-center gap-1">
                          <User size={12} />
                          <span>Assignee: <strong className="text-ink font-medium">{task.assigned_to_name}</strong></span>
                        </span>
                      )}

                      {task.created_by && (
                        <span className="inline-flex items-center gap-1 opacity-70">
                          <span>Set by: {task.created_by}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Task */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-muted hover:text-red-500 transition-colors p-1"
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-cobalt-500" size={20} />
                <h2 className="text-base font-bold text-ink">
                  Add New Task ({DEPARTMENT_LABELS[activeDept]})
                </h2>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="text-muted hover:text-ink text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm audio mixer equipment with supplier"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Description &amp; Execution Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific instructions, specs, phone numbers or deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="input text-xs"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Phase</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TaskPhase)}
                    className="input text-xs"
                  >
                    <option value="pre_event">Pre-Event Phase</option>
                    <option value="event_day">Event Day</option>
                    <option value="post_event">Post-Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-ink">Due Date *</label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewDueDate(new Date().toISOString().split('T')[0])}
                      className="px-1.5 py-0.5 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                      className="px-1.5 py-0.5 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDueDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0])}
                      className="px-1.5 py-0.5 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])}
                      className="px-1.5 py-0.5 rounded bg-surface border border-border text-muted hover:text-ink cursor-pointer"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input text-xs"
                />
                <p className="text-[10px] text-muted">
                  Setting a due date enables automated overdue indicators and executive alerts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Assignee Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
