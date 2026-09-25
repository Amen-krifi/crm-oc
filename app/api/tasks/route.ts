import { NextRequest, NextResponse } from 'next/server';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/store/committee-store';
import type { OCDepartment } from '@/lib/types';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dept = (searchParams.get('dept') as OCDepartment) || undefined;
  const tasks = getTasks(dept);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.department) {
      return NextResponse.json({ error: 'Title and department are required' }, { status: 400 });
    }

    const task = addTask({
      title: body.title,
      description: body.description || '',
      department: body.department,
      priority: body.priority || 'medium',
      phase: body.phase || 'pre_event',
      completed: false,
      assigned_to_name: body.assigned_to_name || undefined,
      assigned_to_id: body.assigned_to_id || undefined,
      due_date: body.due_date || undefined,
      created_by: body.created_by || 'Organizing Committee'
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const updates = { ...body };
    delete updates.id;

    if (updates.completed !== undefined) {
      updates.completed_at = updates.completed ? new Date().toISOString() : undefined;
    }

    const updated = updateTask(body.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const success = deleteTask(id);
    if (!success) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
