import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const page = Number(req.nextUrl.searchParams.get('page') || 1);
  const limit = 50;
  const offset = (page - 1) * limit;
  const search = req.nextUrl.searchParams.get('q') || '';

  const where = search ? `WHERE u.email ILIKE $3 OR u.first_name ILIKE $3 OR u.last_name ILIKE $3` : '';
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset];

  const users = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
            COUNT(e.id) as enrollment_count
     FROM users u
     LEFT JOIN enrollments e ON e.user_id = u.id AND e.is_active = true
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM users ${search ? 'WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1' : ''}`,
    search ? [`%${search}%`] : []
  );

  return NextResponse.json({ users, total: Number(count), page, limit });
}

// Toggle user active/admin
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { userId, isActive, role } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Prevent demoting yourself
  if (userId === auth.userId && role === 'student') {
    return NextResponse.json({ error: 'לא ניתן להסיר הרשאות מעצמך' }, { status: 403 });
  }

  await query(
    `UPDATE users SET
      is_active = COALESCE($1, is_active),
      role = COALESCE($2, role),
      updated_at = NOW()
     WHERE id = $3`,
    [isActive ?? null, role ?? null, userId]
  );

  return NextResponse.json({ success: true });
}
