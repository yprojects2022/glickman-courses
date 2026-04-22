import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const courseSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  level: z.enum(['beginner', 'advanced', 'all']),
  isPublished: z.boolean().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  promoVideoUrl: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// GET /api/admin/courses
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const courses = await query('SELECT * FROM courses ORDER BY created_at DESC');
  return NextResponse.json({ courses });
}

// POST /api/admin/courses
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = courseSchema.parse(await req.json());
    const [course] = await query(
      `INSERT INTO courses (slug, title, subtitle, description, price, original_price, level, is_published,
        thumbnail_url, promo_video_url, meta_title, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [body.slug, body.title, body.subtitle ?? null, body.description ?? null,
       body.price, body.originalPrice ?? null, body.level, body.isPublished ?? false,
       body.thumbnailUrl || null, body.promoVideoUrl || null,
       body.metaTitle ?? null, body.metaDescription ?? null]
    );
    return NextResponse.json({ course }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: e.errors }, { status: 400 });
    if (e.code === '23505') return NextResponse.json({ error: 'Slug כבר קיים' }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
