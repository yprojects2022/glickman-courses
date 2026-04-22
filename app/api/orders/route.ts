import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { query, queryOne, transaction } from '@/lib/db';
import { createPayment, getActiveProvider } from '@/lib/payment';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  courseId: z.string().uuid(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Get course
    const course = await queryOne<{ id: string; title: string; price: number; is_published: boolean }>(
      'SELECT id, title, price, is_published FROM courses WHERE id = $1',
      [data.courseId]
    );
    if (!course || !course.is_published) {
      return NextResponse.json({ error: 'קורס לא נמצא' }, { status: 404 });
    }

    // Check not already enrolled
    const enrolled = await queryOne(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND is_active = true',
      [auth.userId, data.courseId]
    );
    if (enrolled) {
      return NextResponse.json({ error: 'כבר רשום לקורס זה' }, { status: 409 });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const provider = getActiveProvider();

    const order = await transaction(async (client) => {
      const [o] = await client.query(
        `INSERT INTO orders (user_id, course_id, order_number, status, amount, currency, payment_provider, billing_email, billing_name, billing_phone)
         VALUES ($1, $2, $3, 'pending', $4, 'ILS', $5, $6, $7, $8)
         RETURNING id, order_number`,
        [auth.userId, data.courseId, orderNumber, course.price, provider, auth.email, data.customerName, data.customerPhone ?? null]
      );
      return o.rows[0];
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const payment = await createPayment({
      orderId: order.id,
      amount: course.price,
      currency: 'ILS',
      customerEmail: auth.email,
      customerName: data.customerName,
      courseTitle: course.title,
      successUrl: `${appUrl}/payment/success`,
      cancelUrl: `${appUrl}/courses/${data.courseId}`,
    });

    // Store payment provider intent id if we have it
    if (payment.clientSecret) {
      await query('UPDATE orders SET payment_provider_id = $1 WHERE id = $2', [payment.clientSecret, order.id]);
    }

    return NextResponse.json({ order, payment });
  } catch (e: any) {
    if (e.name === 'ZodError') return NextResponse.json({ error: 'נתונים לא תקינים' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
