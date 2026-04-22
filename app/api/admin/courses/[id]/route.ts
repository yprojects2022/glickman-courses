import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const updateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().nullable().optional(),
  level: z.enum(['beginner', 'advanced', 'all']).optional(),
  isPublished: z.boolean().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  promoVideoUrl: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const course = await queryOne('SELECT * FROM courses WHERE id = $1', [params.id]);
  if (!course) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = updateSchema.parse(await req.json());
    await query(
      `UPDATE courses SET
        slug = COALESCE($1, slug),
        title = COALESCE($2, title),
        subtitle = COALESCE($3, subtitle),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        original_price = COALESCE($6, original_price),
        level = COALESCE($7, level),
        is_published = COALESCE($8, is_published),
        thumbnail_url = COALESCE($9, thumbnail_url),
        promo_video_url = COALESCE($10, promo_video_url),
        meta_title = COALESCE($11, meta_title),
        meta_description = COALESCE($12, meta_description),
        updated_at = NOW()
       WHERE id = $13`,
      [body.slug ?? null, body.title ?? null, body.subtitle ?? null, body.description ?? null,
       body.price ?? null, body.originalPrice ?? null, body.level ?? null, body.isPublished ?? null,
       body.thumbnailUrl ?? null, body.promoVideoUrl ?? null, body.metaTitle ?? null, body.metaDescription ?? null,
       params.id]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: e.errors }, { status: 400 });
    if (e.code === '23505') return NextResponse.json({ error: 'Slug כבר קיים' }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  // Prevent deleting course with paid orders
  const paidOrders = await queryOne(
    "SELECT id FROM orders WHERE course_id = $1 AND status = 'paid' LIMIT 1",
    [params.id]
  );
  if (paidOrders) {
    return NextResponse.json({ error: 'לא ניתן למחוק קורס עם הזמנות שולמו' }, { status: 409 });
  }

  await query('DELETE FROM courses WHERE id = $1', [params.id]);
  return NextResponse.json({ success: true });
}
