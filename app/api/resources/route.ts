import { NextRequest, NextResponse } from 'next/server';
import { getResources, addResource, deleteResource } from '@/lib/store/committee-store';
import type { OCDepartment } from '@/lib/types';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dept = (searchParams.get('dept') as OCDepartment | 'all') || undefined;
  const resources = getResources(dept);
  return NextResponse.json({ resources });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.url || !body.department) {
      return NextResponse.json({ error: 'Title, URL, and department are required' }, { status: 400 });
    }

    const resource = addResource({
      title: body.title,
      description: body.description || '',
      department: body.department,
      category: body.category || 'file',
      url: body.url,
      uploaded_by: body.uploaded_by || 'user',
      uploaded_by_name: body.uploaded_by_name || 'Organizing Committee'
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const success = deleteResource(id);
    if (!success) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
