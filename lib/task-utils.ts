import type { Task } from './types';

/**
 * Checks if a task is overdue based on its due_date and completion state.
 * Tasks are overdue if due_date is prior to today (00:00:00) and completed is false.
 */
export function isTaskOverdue(task: Pick<Task, 'due_date' | 'completed'>): boolean {
  if (!task.due_date || task.completed) return false;
  
  const parts = task.due_date.split('-');
  if (parts.length !== 3) return false;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const dueDate = new Date(year, month, day, 23, 59, 59, 999);
  const now = new Date();
  
  return dueDate.getTime() < now.getTime();
}

export interface TaskDueStatus {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // within 3 days
  daysDiff: number;
  formattedDate: string;
  badgeLabel: string;
}

/**
 * Computes human-friendly due date status and overdue duration.
 */
export function getTaskDueStatus(
  task: Pick<Task, 'due_date' | 'completed'>,
  currentDate: Date = new Date()
): TaskDueStatus {
  if (!task.due_date) {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      daysDiff: 0,
      formattedDate: 'No due date',
      badgeLabel: 'No date'
    };
  }

  const parts = task.due_date.split('-');
  if (parts.length !== 3) {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      daysDiff: 0,
      formattedDate: task.due_date,
      badgeLabel: task.due_date
    };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const due = new Date(year, month, day);
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const diffTime = due.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = !task.completed && daysDiff < 0;
  const isDueToday = daysDiff === 0;
  const isDueSoon = !task.completed && daysDiff > 0 && daysDiff <= 3;

  let badgeLabel = '';
  if (task.completed) {
    badgeLabel = 'Completed';
  } else if (isOverdue) {
    const overdueDays = Math.abs(daysDiff);
    badgeLabel = overdueDays === 1 ? 'Overdue (1 day ago)' : `Overdue (${overdueDays} days ago)`;
  } else if (isDueToday) {
    badgeLabel = 'Due today!';
  } else if (daysDiff === 1) {
    badgeLabel = 'Due tomorrow';
  } else {
    badgeLabel = `Due in ${daysDiff} days`;
  }

  // Format date like "Oct 5, 2026"
  const formattedDate = due.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    isOverdue,
    isDueToday,
    isDueSoon,
    daysDiff,
    formattedDate,
    badgeLabel
  };
}
