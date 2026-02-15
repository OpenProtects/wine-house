import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stories = db.prepare('SELECT * FROM stories ORDER BY sort_order').all();
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title_zh, title_ja, title_en, title_it,
      content_zh, content_ja, content_en, content_it,
      image, sort_order 
    } = body;

    if (!title_zh || !content_zh) {
      return NextResponse.json({ error: 'Title and content (zh) are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO stories (title_zh, title_ja, title_en, title_it, content_zh, content_ja, content_en, content_it, image, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title_zh, title_ja, title_en, title_it, content_zh, content_ja, content_en, content_it, image || null, sort_order || 0);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, title_zh, title_ja, title_en, title_it,
      content_zh, content_ja, content_en, content_it,
      image, sort_order 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE stories 
      SET title_zh = ?, title_ja = ?, title_en = ?, title_it = ?,
          content_zh = ?, content_ja = ?, content_en = ?, content_it = ?,
          image = ?, sort_order = ?
      WHERE id = ?
    `).run(
      title_zh, title_ja, title_en, title_it,
      content_zh, content_ja, content_en, content_it,
      image || null, sort_order || 0, id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM stories WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
