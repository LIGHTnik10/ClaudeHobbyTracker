import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all hobbies for current user
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const hobbies = db
      .prepare(`
        SELECT
          h.*,
          COALESCE(SUM(s.duration), 0) as total_time_spent,
          COUNT(s.id) as session_count
        FROM hobbies h
        LEFT JOIN sessions s ON h.id = s.hobby_id
        WHERE h.user_id = ?
        GROUP BY h.id
        ORDER BY h.created_at DESC
      `)
      .all(user.userId);

    return NextResponse.json({ hobbies });
  } catch (error) {
    console.error('Error fetching hobbies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hobbies' },
      { status: 500 }
    );
  }
}

// POST create new hobby
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, description, category } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        'INSERT INTO hobbies (user_id, name, description, category) VALUES (?, ?, ?, ?)'
      )
      .run(user.userId, name, description || null, category || null);

    const hobby = db
      .prepare('SELECT * FROM hobbies WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json({ hobby }, { status: 201 });
  } catch (error) {
    console.error('Error creating hobby:', error);
    return NextResponse.json(
      { error: 'Failed to create hobby' },
      { status: 500 }
    );
  }
}
