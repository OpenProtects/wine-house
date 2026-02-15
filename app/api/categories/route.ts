import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name_zh, name_ja, name_en, name_it, description_zh, sort_order } = body;

    if (!slug || !name_zh) {
      return NextResponse.json({ error: 'Slug and name (zh) are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO categories (slug, name_zh, name_ja, name_en, name_it, description_zh, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(slug, name_zh, name_ja, name_en, name_it, description_zh, sort_order || 0);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
