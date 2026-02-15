import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get('wine_id');
    
    if (wineId) {
      const prices = db.prepare('SELECT * FROM wine_prices WHERE wine_id = ?').all(wineId);
      return NextResponse.json(prices);
    }
    
    const countries = db.prepare('SELECT * FROM countries WHERE active = 1 ORDER BY sort_order').all();
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries/prices:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wine_id, country_code, price, currency } = body;

    if (!wine_id || !country_code || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM wine_prices WHERE wine_id = ? AND country_code = ?').get(wine_id, country_code);

    if (existing) {
      db.prepare('UPDATE wine_prices SET price = ?, currency = ?, updated_at = CURRENT_TIMESTAMP WHERE wine_id = ? AND country_code = ?')
        .run(price, currency || 'CNY', wine_id, country_code);
    } else {
      db.prepare('INSERT INTO wine_prices (wine_id, country_code, price, currency) VALUES (?, ?, ?, ?)')
        .run(wine_id, country_code, price, currency || 'CNY');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving price:', error);
    return NextResponse.json({ error: 'Failed to save price' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM wine_prices WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting price:', error);
    return NextResponse.json({ error: 'Failed to delete price' }, { status: 500 });
  }
}
