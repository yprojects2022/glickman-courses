// =============================================
// Payment Provider System — Modular
// Enable/disable providers via env vars
// =============================================

export interface PaymentIntent {
  clientSecret?: string;
  redirectUrl?: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in agorot (ILS cents) for stripe, whole ILS for tranzila/grow
  currency: string;
  customerEmail: string;
  customerName: string;
  courseTitle: string;
  successUrl: string;
  cancelUrl: string;
}

// =============================================
// STRIPE PROVIDER
// =============================================
async function createStripePayment(params: CreatePaymentParams): Promise<PaymentIntent> {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: params.customerEmail,
    line_items: [{
      price_data: {
        currency: params.currency.toLowerCase(),
        product_data: { name: params.courseTitle },
        unit_amount: Math.round(params.amount * 100), // convert to agorot
      },
      quantity: 1,
    }],
    success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${params.orderId}`,
    cancel_url: params.cancelUrl,
    metadata: { orderId: params.orderId },
  });

  return {
    redirectUrl: session.url!,
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    provider: 'stripe',
  };
}

async function handleStripeWebhook(body: string, signature: string): Promise<PaymentResult & { orderId?: string; event?: string }> {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return { success: false, error: 'Invalid signature' };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    return {
      success: true,
      transactionId: session.payment_intent,
      orderId: session.metadata?.orderId,
      event: 'payment_success',
    };
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any;
    return {
      success: false,
      orderId: session.metadata?.orderId,
      event: 'payment_failed',
    };
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as any;
    return {
      success: true,
      transactionId: charge.id,
      event: 'refund',
    };
  }

  return { success: true, event: 'ignored' };
}

// =============================================
// TRANZILA PROVIDER
// =============================================
async function createTranzilaPayment(params: CreatePaymentParams): Promise<PaymentIntent> {
  const terminal = process.env.TRANZILA_TERMINAL;
  const redirectUrl = new URL('https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi');
  redirectUrl.searchParams.set('supplier', terminal!);
  redirectUrl.searchParams.set('sum', params.amount.toString());
  redirectUrl.searchParams.set('currency', '1'); // 1=ILS
  redirectUrl.searchParams.set('cred_type', '1');
  redirectUrl.searchParams.set('tranmode', 'A');
  redirectUrl.searchParams.set('contact', params.customerName);
  redirectUrl.searchParams.set('email', params.customerEmail);
  redirectUrl.searchParams.set('notify_url', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`);
  redirectUrl.searchParams.set('success_url', params.successUrl);
  redirectUrl.searchParams.set('fail_url', params.cancelUrl);
  redirectUrl.searchParams.set('orderId', params.orderId);

  return {
    redirectUrl: redirectUrl.toString(),
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    provider: 'tranzila',
  };
}

// =============================================
// GROW PROVIDER
// =============================================
async function createGrowPayment(params: CreatePaymentParams): Promise<PaymentIntent> {
  const response = await fetch('https://api.grow.co.il/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROW_API_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      description: params.courseTitle,
      customer: { email: params.customerEmail, name: params.customerName },
      reference: params.orderId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
    }),
  });

  if (!response.ok) throw new Error('Grow API error');
  const data = await response.json();

  return {
    redirectUrl: data.payment_url,
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    provider: 'grow',
  };
}

// =============================================
// ACTIVE PROVIDER SELECTOR
// =============================================
export function getActiveProvider(): string {
  if (process.env.STRIPE_IS_ACTIVE === 'true') return 'stripe';
  if (process.env.TRANZILA_IS_ACTIVE === 'true') return 'tranzila';
  if (process.env.GROW_IS_ACTIVE === 'true') return 'grow';
  throw new Error('No payment provider is active. Set *_IS_ACTIVE=true in env');
}

export async function createPayment(params: CreatePaymentParams): Promise<PaymentIntent> {
  const provider = getActiveProvider();
  switch (provider) {
    case 'stripe': return createStripePayment(params);
    case 'tranzila': return createTranzilaPayment(params);
    case 'grow': return createGrowPayment(params);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

export { handleStripeWebhook };
