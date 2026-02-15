import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as any;

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ 
      success: true, 
      admin: { id: admin.id, username: admin.username, email: admin.email } 
    });

    response.cookies.set('admin_session', JSON.stringify({ 
      id: admin.id, 
      username: admin.username 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const sessionData = JSON.parse(session.value);
    return NextResponse.json({ authenticated: true, admin: sessionData });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
