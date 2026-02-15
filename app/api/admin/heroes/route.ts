import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const heroes = db.prepare('SELECT * FROM home_heroes ORDER BY sort_order').all();
    return NextResponse.json(heroes);
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return NextResponse.json({ error: 'Failed to fetch heroes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title_zh, title_ja, title_en, title_it,
      subtitle_zh, subtitle_ja, subtitle_en, subtitle_it,
      image, theme, link, sort_order 
    } = body;

    if (!title_zh || !subtitle_zh) {
      return NextResponse.json({ error: 'Title and subtitle (zh) are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO home_heroes (title_zh, title_ja, title_en, title_it, subtitle_zh, subtitle_ja, subtitle_en, subtitle_it, image, theme, link, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title_zh, title_ja, title_en, title_it,
      subtitle_zh, subtitle_ja, subtitle_en, subtitle_it,
      image || null, theme || 'from-stone-900 to-stone-950', link || '/wines/red', sort_order || 0
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating hero:', error);
    return NextResponse.json({ error: 'Failed to create hero' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, title_zh, title_ja, title_en, title_it,
      subtitle_zh, subtitle_ja, subtitle_en, subtitle_it,
      image, theme, link, sort_order 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero ID is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE home_heroes 
      SET title_zh = ?, title_ja = ?, title_en = ?, title_it = ?,
          subtitle_zh = ?, subtitle_ja = ?, subtitle_en = ?, subtitle_it = ?,
          image = ?, theme = ?, link = ?, sort_order = ?
      WHERE id = ?
    `).run(
      title_zh, title_ja, title_en, title_it,
      subtitle_zh, subtitle_ja, subtitle_en, subtitle_it,
      image || null, theme || 'from-stone-900 to-stone-950', link || '/wines/red', sort_order || 0, id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hero:', error);
    return NextResponse.json({ error: 'Failed to update hero' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM home_heroes WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero:', error);
    return NextResponse.json({ error: 'Failed to delete hero' }, { status: 500 });
  }
}
