import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

import { createDeliveryJobForOrder } from '@/app/lib/delivery-server';
import type { CartItem } from '@/app/lib/types';
import { escapeHtml, sendOfficialMail } from '@/app/lib/mailer';
import { createClient } from '@/utils/supabase/server';

type SaveOrderRequest = {
  orderData: {
    payment_id: string;
    order_id: string;
    signature: string;
    amount: number;
    shipping_address?: string | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
  };
  items: CartItem[];
  userId: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { orderData, items, userId } = (await request.json()) as SaveOrderRequest;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error('Missing Razorpay secret for payment verification.');
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${orderData.order_id}|${orderData.payment_id}`)
      .digest('hex');

    if (expectedSignature !== orderData.signature) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    const orderInsert = {
      user_id: userId || null,
      order_number: `LOK-${Date.now()}`,
      total_amount: orderData.amount,
      status: 'ready_to_dispatch',
      payment_id: orderData.payment_id,
      razorpay_order_id: orderData.order_id,
      shipping_address: orderData.shipping_address || null,
      customer_name: orderData.customer_name || null,
      customer_email: orderData.customer_email || null,
      customer_phone: orderData.customer_phone || null,
      address_line1: orderData.address_line1 || null,
      address_line2: orderData.address_line2 || null,
      city: orderData.city || null,
      state: orderData.state || null,
      postal_code: orderData.postal_code || null,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_name: item.name,
      product_image: item.image_url,
      size: item.size,
      color: item.color,
      price: Math.round(item.price * 100),
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    await createDeliveryJobForOrder(supabase, order);

    const customerName = orderData.customer_name || 'Customer';
    const customerEmail = orderData.customer_email;

    if (customerEmail) {
      try {
        const orderSummary = items
          .map((item) => `${item.name} x${item.quantity} - Rs. ${item.price * item.quantity}`)
          .join('\n');

        await sendOfficialMail({
          to: customerEmail,
          subject: `Order confirmed | ${order.order_number}`,
          text: `Hi ${customerName},\n\nYour LOKUS order ${order.order_number} is confirmed.\n\n${orderSummary}\n\nShipping address:\n${orderData.shipping_address || 'Will be updated soon.'}`,
          html: `
            <p>Hi ${escapeHtml(customerName)},</p>
            <p>Your LOKUS order <strong>${escapeHtml(order.order_number)}</strong> is confirmed.</p>
            <pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(orderSummary)}</pre>
            <p><strong>Shipping address:</strong><br />${escapeHtml(orderData.shipping_address || 'Will be updated soon.').replace(/, /g, '<br />')}</p>
          `,
        });

        await sendOfficialMail({
          to: process.env.MAIL_TO_SUPPORT || 'support@lokus.store',
          subject: `New paid order | ${order.order_number}`,
          replyTo: customerEmail,
          text: `Paid order received.\nOrder: ${order.order_number}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${orderData.customer_phone || 'N/A'}\nAddress: ${orderData.shipping_address || 'N/A'}\n\n${orderSummary}`,
          html: `
            <p>Paid order received.</p>
            <p><strong>Order:</strong> ${escapeHtml(order.order_number)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(orderData.customer_phone || 'N/A')}</p>
            <p><strong>Address:</strong><br />${escapeHtml(orderData.shipping_address || 'N/A').replace(/, /g, '<br />')}</p>
            <pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(orderSummary)}</pre>
          `,
        });
      } catch (mailError) {
        console.error('Order email warning:', mailError);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Save order error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
