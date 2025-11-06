import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET single hobby
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const hobby = db
      .prepare('SELECT * FROM hobbies WHERE id = ? AND user_id = ?')
      .get(params.id, user.userId);

    if (!hobby) {
      return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
    }

    return NextResponse.json({ hobby });
  } catch (error) {
    console.error('Error fetching hobby:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hobby' },
      { status: 500 }
    );
  }
}

// PUT update hobby
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, description, category } = await request.json();

    // Check if hobby belongs to user
    const existing = db
      .prepare('SELECT id FROM hobbies WHERE id = ? AND user_id = ?')
      .get(params.id, user.userId);

    if (!existing) {
      return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
    }

    db.prepare(
      'UPDATE hobbies SET name = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, description || null, category || null, params.id);

    const hobby = db
      .prepare('SELECT * FROM hobbies WHERE id = ?')
      .get(params.id);

    return NextResponse.json({ hobby });
  } catch (error) {
    console.error('Error updating hobby:', error);
    return NextResponse.json(
      { error: 'Failed to update hobby' },
      { status: 500 }
    );
  }
}

// DELETE hobby
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Check if hobby belongs to user
    const existing = db
      .prepare('SELECT id FROM hobbies WHERE id = ? AND user_id = ?')
      .get(params.id, user.userId);

    if (!existing) {
      return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM hobbies WHERE id = ?').run(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hobby:', error);
    return NextResponse.json(
      { error: 'Failed to delete hobby' },
      { status: 500 }
    );
  }
}
