import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '@/lib/store/committee-store';
import type { OCDepartment } from '@/lib/types';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dept = (searchParams.get('dept') as OCDepartment | 'all') || undefined;
  const announcements = getAnnouncements(dept);
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.content || !body.department) {
      return NextResponse.json({ error: 'Title, content, and department are required' }, { status: 400 });
    }

    const announcement = addAnnouncement({
      title: body.title,
      content: body.content,
      department: body.department,
      priority: body.priority || 'normal',
      author_name: body.author_name || 'OCVP Desk',
      author_role: body.author_role || 'Organizing Committee'
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const success = deleteAnnouncement(id);
    if (!success) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
