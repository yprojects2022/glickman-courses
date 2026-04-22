import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { sendEmail, welcomeEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing) {
      return NextResponse.json({ error: 'כתובת האימייל כבר רשומה במערכת' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const [user] = await query<{ id: string; email: string; role: string }>(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role`,
      [data.email, passwordHash, data.firstName, data.lastName, data.phone ?? null]
    );

    const token = signToken({ userId: user.id, email: user.email, role: user.role as any });
    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    setAuthCookie(res, token);

    // Send welcome email (non-blocking)
    sendEmail({
      to: user.email,
      subject: 'ברוך הבא!',
      html: welcomeEmail(`${data.firstName}`, 'הקורסים שלך', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`),
    }).catch(console.error);

    return res;
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: 'נתונים לא תקינים' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
