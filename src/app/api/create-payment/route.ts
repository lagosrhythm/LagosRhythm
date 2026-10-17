import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.lagosrhythm.com';

export async function POST(req: Request) {
  // Not used by the site yet; keep it admin-only until the NowPayments flow is finished.
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    // In a real application, you would get the amount and currency from the request body
    // and validate them.
    const { amount, order_id, order_description } = await req.json();

    if (!amount || !order_id || !order_description) {
      return NextResponse.json({ error: 'Missing required fields: amount, order_id, order_description' }, { status: 400 });
    }

    // This is a placeholder for the actual NowPayments API endpoint and request body.
    // Refer to NowPayments API documentation for exact details.
    const nowPaymentsApiUrl = 'https://api.nowpayments.io/v1/payment'; // Example URL
    const apiKey = process.env.NOWPAYMENTS_API_KEY; // Your NowPayments API Key

    if (!apiKey) {
      console.error('NOWPAYMENTS_API_KEY is not set.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const response = await fetch(nowPaymentsApiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd', // Or your base currency
        pay_currency: 'usdttrc20', // Specify USDT on TRON
        order_id: order_id,
        order_description: order_description,
        success_url: `${siteUrl}/success`,
        cancel_url: `${siteUrl}/cancel`,
        // TODO: no /api/nowpayments-webhook route exists yet; add one before using this endpoint.
        ipn_callback_url: `${siteUrl}/api/nowpayments-webhook`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('NowPayments API error:', errorData);
      return NextResponse.json({ error: 'Failed to create payment with NowPayments' }, { status: 502 });
    }

    const paymentData = await response.json();
    return NextResponse.json(paymentData, { status: 200 });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
