import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

const lessonSchema = z.object({
  moduleId: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  videoDurationSeconds: z.number().min(0).optional(),
  sortOrder: z.number().min(0),
  isPreview: z.boolean().optional(),
  content: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = lessonSchema.parse(await req.json());
    const [lesson] = await query(
      `INSERT INTO lessons (module_id, course_id, title, description, video_url, video_duration_seconds, sort_order, is_preview, content)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [body.moduleId, body.courseId, body.title, body.description ?? null,
       body.videoUrl ?? null, body.videoDurationSeconds ?? 0,
       body.sortOrder, body.isPreview ?? false, body.content ?? null]
    );

    // Update course lesson count
    await query(
      'UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = $1 AND is_published = true) WHERE id = $1',
      [body.courseId]
    );

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: e.errors }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const courseId = req.nextUrl.searchParams.get('courseId');
  const where = courseId ? 'WHERE l.course_id = $1' : '';
  const params = courseId ? [courseId] : [];
  const lessons = await query(
    `SELECT l.*, m.title as module_title FROM lessons l JOIN modules m ON m.id = l.module_id ${where} ORDER BY l.sort_order`,
    params
  );
  return NextResponse.json({ lessons });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id, ...body } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const parsed = lessonSchema.partial().parse(body);
    await query(
      `UPDATE lessons SET
        title = COALESCE($1, title),
        video_url = COALESCE($2, video_url),
        video_duration_seconds = COALESCE($3, video_duration_seconds),
        is_preview = COALESCE($4, is_preview),
        content = COALESCE($5, content),
        updated_at = NOW()
       WHERE id = $6`,
      [parsed.title ?? null, parsed.videoUrl ?? null, parsed.videoDurationSeconds ?? null,
       parsed.isPreview ?? null, parsed.content ?? null, id]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: e.errors }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
