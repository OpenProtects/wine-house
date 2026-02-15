import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const id = searchParams.get('id');

    let query = 'SELECT * FROM wines';
    const params: any[] = [];
    const conditions: string[] = [];

    if (id) {
      conditions.push('id = ?');
      params.push(id);
    } else if (category) {
      const categoryData = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category) as { id: number } | undefined;
      if (categoryData) {
        conditions.push('category_id = ?');
        params.push(categoryData.id);
      }
    }

    if (featured === 'true') {
      conditions.push('featured = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sort_order, id';

    const wines = db.prepare(query).all(...params);
    return NextResponse.json(wines);
  } catch (error) {
    console.error('Error fetching wines:', error);
    return NextResponse.json({ error: 'Failed to fetch wines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category_id, name_zh, name_ja, name_en, name_it,
      description_zh, description_ja, description_en, description_it,
      image, price, year,
      region_zh, region_ja, region_en, region_it,
      grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it,
      alcohol_content, featured, sort_order
    } = body;

    if (!category_id || !name_zh) {
      return NextResponse.json({ error: 'Category and name (zh) are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO wines (category_id, name_zh, name_ja, name_en, name_it, description_zh, description_ja, description_en, description_it, image, price, year, region_zh, region_ja, region_en, region_it, grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it, alcohol_content, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      category_id, name_zh, name_ja, name_en, name_it,
      description_zh, description_ja, description_en, description_it,
      image || null, price || 0, year || 2024,
      region_zh, region_ja, region_en, region_it,
      grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it,
      alcohol_content || 13, featured || 0, sort_order || 0
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating wine:', error);
    return NextResponse.json({ error: 'Failed to create wine' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id, category_id, name_zh, name_ja, name_en, name_it,
      description_zh, description_ja, description_en, description_it,
      image, price, year,
      region_zh, region_ja, region_en, region_it,
      grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it,
      alcohol_content, featured, sort_order
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE wines 
      SET category_id = ?, name_zh = ?, name_ja = ?, name_en = ?, name_it = ?,
          description_zh = ?, description_ja = ?, description_en = ?, description_it = ?,
          image = ?, price = ?, year = ?,
          region_zh = ?, region_ja = ?, region_en = ?, region_it = ?,
          grape_variety_zh = ?, grape_variety_ja = ?, grape_variety_en = ?, grape_variety_it = ?,
          alcohol_content = ?, featured = ?, sort_order = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      category_id, name_zh, name_ja, name_en, name_it,
      description_zh, description_ja, description_en, description_it,
      image || null, price || 0, year || 2024,
      region_zh, region_ja, region_en, region_it,
      grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it,
      alcohol_content || 13, featured || 0, sort_order || 0,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating wine:', error);
    return NextResponse.json({ error: 'Failed to update wine' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM wine_prices WHERE wine_id = ?').run(id);
    db.prepare('DELETE FROM wines WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wine:', error);
    return NextResponse.json({ error: 'Failed to delete wine' }, { status: 500 });
  }
}
