import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const course = await queryOne(`
      SELECT id, slug, title, subtitle, description, thumbnail_url, promo_video_url,
             price, original_price, level, total_lessons, total_duration_minutes,
             instructor_name, meta_title, meta_description
      FROM courses WHERE slug = $1 AND is_published = true
    `, [params.slug]);

    if (!course) return NextResponse.json({ error: 'קורס לא נמצא' }, { status: 404 });

    const modules = await query(`
      SELECT m.id, m.title, m.description, m.sort_order,
             json_agg(
               json_build_object(
                 'id', l.id, 'title', l.title, 'video_duration_seconds', l.video_duration_seconds,
                 'sort_order', l.sort_order, 'is_preview', l.is_preview
               ) ORDER BY l.sort_order
             ) FILTER (WHERE l.id IS NOT NULL) as lessons
      FROM modules m
      LEFT JOIN lessons l ON l.module_id = m.id AND l.is_published = true
      WHERE m.course_id = $1 AND m.is_published = true
      GROUP BY m.id ORDER BY m.sort_order
    `, [(course as any).id]);

    const testimonials = await query(`
      SELECT name, title, content, rating FROM testimonials
      WHERE (course_id = $1 OR course_id IS NULL) AND is_published = true
      ORDER BY sort_order LIMIT 6
    `, [(course as any).id]);

    // Check enrollment if user is logged in
    let isEnrolled = false;
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      const { verifyToken } = await import('@/lib/auth');
      const payload = verifyToken(token);
      if (payload) {
        const enrollment = await queryOne(
          'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND is_active = true',
          [payload.userId, (course as any).id]
        );
        isEnrolled = !!enrollment;
      }
    }

    return NextResponse.json({ course, modules, testimonials, isEnrolled });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
