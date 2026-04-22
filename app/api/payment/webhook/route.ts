import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db';
import { handleStripeWebhook } from '@/lib/payment';
import { sendEmail, welcomeEmail, purchaseConfirmEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const provider = req.headers.get('x-payment-provider') || 'stripe';
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let result: any = { success: false };

  try {
    // Log the webhook
    await query(
      `INSERT INTO webhook_logs (provider, event_type, payload) VALUES ($1, $2, $3)`,
      [provider, 'incoming', JSON.parse(body || '{}')]
    );

    if (provider === 'stripe' || !req.headers.get('x-payment-provider')) {
      result = await handleStripeWebhook(body, signature);
    } else if (provider === 'tranzila') {
      const params = new URLSearchParams(body);
      const success = params.get('Response') === '000';
      result = {
        success,
        transactionId: params.get('ConfirmationCode') || undefined,
        orderId: params.get('orderId') || undefined,
        event: success ? 'payment_success' : 'payment_failed',
      };
    } else if (provider === 'grow') {
      const data = JSON.parse(body);
      result = {
        success: data.status === 'success',
        transactionId: data.transaction_id,
        orderId: data.reference,
        event: data.status === 'success' ? 'payment_success' : data.status === 'refunded' ? 'refund' : 'payment_failed',
      };
    }

    // Process the result
    if (result.event === 'payment_success' && result.orderId) {
      await processPaymentSuccess(result.orderId, result.transactionId);
    } else if (result.event === 'payment_failed' && result.orderId) {
      await query(`UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = $1`, [result.orderId]);
    } else if (result.event === 'refund' && result.transactionId) {
      await query(
        `UPDATE orders SET status = 'refunded', refunded_at = NOW() WHERE payment_provider_id = $1`,
        [result.transactionId]
      );
    }

    await query(`UPDATE webhook_logs SET processed = true WHERE provider = $1 AND created_at > NOW() - INTERVAL '1 minute'`, [provider]);
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('Webhook error:', e);
    await query(`UPDATE webhook_logs SET error = $1 WHERE provider = $2 AND created_at > NOW() - INTERVAL '1 minute'`, [e.message, provider]);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function processPaymentSuccess(orderId: string, transactionId?: string) {
  await transaction(async (client) => {
    // Update order
    await client.query(
      `UPDATE orders SET status = 'paid', payment_provider_id = COALESCE($1, payment_provider_id), paid_at = NOW() WHERE id = $2`,
      [transactionId ?? null, orderId]
    );

    // Get order details
    const order = await client.query(
      `SELECT o.*, u.email, u.first_name, u.last_name, c.title as course_title
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN courses c ON c.id = o.course_id
       WHERE o.id = $1`,
      [orderId]
    );
    const o = order.rows[0];
    if (!o) return;

    // Create enrollment
    await client.query(
      `INSERT INTO enrollments (user_id, course_id, order_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course_id) DO UPDATE SET is_active = true, order_id = $3`,
      [o.user_id, o.course_id, orderId]
    );

    // Send emails (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    sendEmail({
      to: o.email,
      subject: `אישור רכישה: ${o.course_title}`,
      html: purchaseConfirmEmail(`${o.first_name} ${o.last_name}`, o.course_title, o.amount, o.order_number),
    }).catch(console.error);
  });
}
