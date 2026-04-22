import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const schema = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  watchSeconds: z.number().min(0),
  isCompleted: z.boolean(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = schema.parse(await req.json());

    // Verify enrollment
    const enrolled = await queryOne(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND is_active = true',
      [auth.userId, data.courseId]
    );
    if (!enrolled) return NextResponse.json({ error: 'לא רשום לקורס' }, { status: 403 });

    await query(
      `INSERT INTO progress (user_id, lesson_id, course_id, watch_seconds, is_completed, last_watched_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
       SET watch_seconds = GREATEST(progress.watch_seconds, EXCLUDED.watch_seconds),
           is_completed = EXCLUDED.is_completed OR progress.is_completed,
           last_watched_at = NOW(),
           completed_at = CASE WHEN EXCLUDED.is_completed AND progress.completed_at IS NULL THEN NOW() ELSE progress.completed_at END,
           updated_at = NOW()`,
      [auth.userId, data.lessonId, data.courseId, data.watchSeconds, data.isCompleted,
       data.isCompleted ? new Date() : null]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: 'נתונים לא תקינים' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const courseId = req.nextUrl.searchParams.get('courseId');
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  const progress = await query(
    'SELECT lesson_id, is_completed, watch_seconds, completed_at FROM progress WHERE user_id = $1 AND course_id = $2',
    [auth.userId, courseId]
  );

  return NextResponse.json({ progress });
}
