import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { db } from '@/lib/db';

const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.name);
    const filename = `${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    const result = db.prepare(`
      INSERT INTO uploads (filename, original_name, mime_type, size)
      VALUES (?, ?, ?, ?)
    `).run(filename, file.name, file.type, file.size);

    const imageUrl = `/images/uploads/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      filename: filename,
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const uploads = db.prepare('SELECT * FROM uploads ORDER BY created_at DESC').all();
    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
