import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [user, enrollments] = await Promise.all([
    query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [auth.userId]
    ),
    query(`
      SELECT
        c.id, c.slug, c.title, c.subtitle, c.thumbnail_url, c.total_lessons,
        e.enrolled_at, e.expires_at,
        COUNT(p.id) FILTER (WHERE p.is_completed) as completed_lessons,
        MAX(p.last_watched_at) as last_activity
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = c.id
      WHERE e.user_id = $1 AND e.is_active = true
      GROUP BY c.id, e.enrolled_at, e.expires_at
      ORDER BY last_activity DESC NULLS LAST, e.enrolled_at DESC
    `, [auth.userId]),
  ]);

  if (!user[0]) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: user[0], enrollments });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { firstName, lastName, phone } = await req.json();

  await query(
    'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), updated_at = NOW() WHERE id = $4',
    [firstName ?? null, lastName ?? null, phone ?? null, auth.userId]
  );

  return NextResponse.json({ success: true });
}
