'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay order
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const orderData = await response.json();
      if (!orderData.id) throw new Error('Failed to create order');

      // 2. Configure Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LOKUS',
        description: `Payment for order ${orderData.id}`,
        order_id: orderData.id,
        handler: async function (razorpayResponse: any) {
          // 3. Save order to Supabase after successful payment
          try {
            const saveResponse = await fetch('/api/save-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderData: {
                  payment_id: razorpayResponse.razorpay_payment_id,
                  order_id: razorpayResponse.razorpay_order_id,
                  amount: orderData.amount,
                },
                items: items,
                userId: user?.id || null,
              }),
            });
            if (!saveResponse.ok) {
              console.error('Failed to save order');
            }
          } catch (err) {
            console.error('Error saving order:', err);
          }

          // 4. Clear cart and redirect to success page
          clearCart();
          window.location.href = `/success?payment_id=${razorpayResponse.razorpay_payment_id}&order_id=${razorpayResponse.razorpay_order_id}`;
        },
        prefill: {
          name: user?.email ? user.email.split('@')[0] : 'LOKUS Customer',
          email: user?.email || 'customer@lokus.com',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="bg-gray-50 p-6 rounded-2xl mb-6">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2 text-sm">
            <span>{item.name} (Size {item.size}, {item.color}) x{item.quantity}</span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t pt-4 mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
      </div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${totalPrice}`}
      </button>
    </main>
  );
}