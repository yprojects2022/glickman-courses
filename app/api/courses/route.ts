import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const courses = await query(`
      SELECT id, slug, title, subtitle, description, thumbnail_url, promo_video_url,
             price, original_price, level, total_lessons, total_duration_minutes, instructor_name
      FROM courses
      WHERE is_published = true
      ORDER BY is_featured DESC, created_at ASC
    `);
    return NextResponse.json({ courses });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
