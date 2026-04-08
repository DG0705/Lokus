import { NextRequest, NextResponse } from 'next/server';

import type { CartItem } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/server';

type SaveOrderRequest = {
  orderData: {
    payment_id: string;
    order_id: string;
    amount: number;
    shipping_address?: string | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
  };
  items: CartItem[];
  userId: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { orderData, items, userId } = (await request.json()) as SaveOrderRequest;

    const orderInsert = {
      user_id: userId || null,
      order_number: `LOK-${Date.now()}`,
      total_amount: orderData.amount,
      status: 'paid',
      payment_id: orderData.payment_id,
      razorpay_order_id: orderData.order_id,
      shipping_address: orderData.shipping_address || null,
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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Save order error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
