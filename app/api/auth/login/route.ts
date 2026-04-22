import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { queryOne } from '@/lib/db';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const user = await queryOne<{
      id: string; email: string; password_hash: string;
      role: string; first_name: string; last_name: string; is_active: boolean;
    }>('SELECT id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = $1', [data.email]);

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'אימייל או סיסמה שגויים' }, { status: 401 });
    }

    const valid = await comparePassword(data.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'אימייל או סיסמה שגויים' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role as any });
    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
    });
    setAuthCookie(res, token);
    return res;
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: 'נתונים לא תקינים' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
