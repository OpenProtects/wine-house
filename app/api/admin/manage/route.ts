import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(session.value);
    const body = await request.json();
    const { currentPassword, newPassword, type } = body;

    if (type === 'changePassword') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
      }

      const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(sessionData.id) as any;
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      const isValid = bcrypt.compareSync(currentPassword, admin.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, sessionData.id);

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    if (type === 'addAdmin') {
      const { username, password, email } = body;
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
      }

      const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)')
        .run(username, hashedPassword, email || null);

      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    }

    if (type === 'deleteAdmin') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
      }

      if (id === sessionData.id) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
      }

      db.prepare('DELETE FROM admins WHERE id = ?').run(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = db.prepare('SELECT id, username, email, created_at FROM admins ORDER BY id').all();
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}
