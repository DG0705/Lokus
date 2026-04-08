'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { formatPrice, formatShippingAddress } from '@/app/lib/format';
import type { CheckoutFormValues } from '@/app/lib/types';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
};

type RazorpayOptions = {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

const initialForm: CheckoutFormValues = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<CheckoutFormValues>(initialForm);

  useEffect(() => {
    if (user?.email) {
      setFormValues((prev) => ({ ...prev, email: prev.email || user.email || '' }));
    }
  }, [user?.email]);

  const updateField = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!items.length) return;
    setLoading(true);

    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const orderData = (await response.json()) as { id?: string; amount: number; currency: string };
      if (!orderData.id) throw new Error('Failed to create order');

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LOKUS',
        description: `Payment for order ${orderData.id}`,
        order_id: orderData.id,
        handler: async (razorpayResponse) => {
          await fetch('/api/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderData: {
                payment_id: razorpayResponse.razorpay_payment_id,
                order_id: razorpayResponse.razorpay_order_id,
                amount: orderData.amount,
                shipping_address: formatShippingAddress(formValues),
                customer_name: formValues.fullName,
                customer_email: formValues.email,
                customer_phone: formValues.phone,
              },
              items,
              userId: user?.id || null,
            }),
          });

          clearCart();
          window.location.href = `/success?payment_id=${razorpayResponse.razorpay_payment_id}&order_id=${razorpayResponse.razorpay_order_id}`;
        },
        prefill: {
          name: formValues.fullName,
          email: formValues.email,
          contact: formValues.phone,
        },
        theme: {
          color: '#111111',
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong while starting payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="section-wrap py-20">
        <div className="premium-card flex min-h-[26rem] flex-col items-center justify-center px-8 text-center">
          <h1 className="font-display text-5xl">No items ready for checkout.</h1>
          <Link
            href="/shop"
            className="mt-8 rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
          >
            Return to catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-wrap py-12">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Checkout</p>
        <h1 className="mt-3 font-display text-6xl">Secure your order</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="premium-card p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['fullName', 'Full name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['city', 'City'],
              ['state', 'State'],
              ['postalCode', 'Postal code'],
            ].map(([field, label]) => (
              <label key={field} className="text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  {label}
                </span>
                <input
                  value={formValues[field as keyof CheckoutFormValues]}
                  onChange={(event) => updateField(field as keyof CheckoutFormValues, event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
                  required
                />
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-5">
            <label className="text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                Address line 1
              </span>
              <input
                value={formValues.addressLine1}
                onChange={(event) => updateField('addressLine1', event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                Address line 2
              </span>
              <input
                value={formValues.addressLine2}
                onChange={(event) => updateField('addressLine2', event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
          </div>
        </div>

        <aside className="premium-card h-fit p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Order summary</p>
          <div className="mt-5 space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">
                  {item.name} x{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
          >
            {loading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
          </button>
        </aside>
      </div>
    </main>
  );
}
