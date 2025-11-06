import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all sessions for a hobby
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verify hobby belongs to user
    const hobby = db
      .prepare('SELECT id FROM hobbies WHERE id = ? AND user_id = ?')
      .get(params.id, user.userId);

    if (!hobby) {
      return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
    }

    const sessions = db
      .prepare('SELECT * FROM sessions WHERE hobby_id = ? ORDER BY date DESC, created_at DESC')
      .all(params.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST create new session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verify hobby belongs to user
    const hobby = db
      .prepare('SELECT id FROM hobbies WHERE id = ? AND user_id = ?')
      .get(params.id, user.userId);

    if (!hobby) {
      return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
    }

    const { duration, notes, date } = await request.json();

    if (!duration || !date) {
      return NextResponse.json(
        { error: 'Duration and date are required' },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        'INSERT INTO sessions (hobby_id, duration, notes, date) VALUES (?, ?, ?, ?)'
      )
      .run(params.id, duration, notes || null, date);

    const session = db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
