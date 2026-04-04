import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { orderData, items, userId } = await request.json();

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        order_number: `LOK-${Date.now()}`,
        total_amount: orderData.amount,
        status: 'paid',
        payment_id: orderData.payment_id,
        razorpay_order_id: orderData.order_id,
        shipping_address: orderData.shipping_address || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name,
      product_image: item.image_url,
      size: item.size,
      color: item.color,
      price: item.price * 100, // convert to paise
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Save order error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}