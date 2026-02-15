import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM site_settings').all();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it } = body;

    if (!setting_key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM site_settings WHERE setting_key = ?').get(setting_key) as any;

    if (existing) {
      db.prepare(`
        UPDATE site_settings 
        SET setting_value_zh = COALESCE(NULLIF(?, ''), setting_value_zh), 
            setting_value_ja = COALESCE(NULLIF(?, ''), setting_value_ja), 
            setting_value_en = COALESCE(NULLIF(?, ''), setting_value_en), 
            setting_value_it = COALESCE(NULLIF(?, ''), setting_value_it), 
            updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = ?
      `).run(setting_value_zh, setting_value_ja, setting_value_en, setting_value_it, setting_key);
    } else {
      db.prepare(`
        INSERT INTO site_settings (setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it)
        VALUES (?, ?, ?, ?, ?)
      `).run(setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
