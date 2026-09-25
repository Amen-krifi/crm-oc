import { getTasks } from '@/lib/store/committee-store';
import TodoListComponent from '@/components/tasks/TodoListComponent';

export default function TasksPage() {
  const initialTasks = getTasks();

  return (
    <div>
      <TodoListComponent initialTasks={initialTasks} />
    </div>
  );
}
