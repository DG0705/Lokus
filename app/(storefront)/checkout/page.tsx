'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { validateCheckoutForm } from '@/app/lib/checkout';
import { formatPrice, formatShippingAddress } from '@/app/lib/format';
import type { CheckoutFormValues } from '@/app/lib/types';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

function readStoredCheckoutDetails() {
  if (typeof window === 'undefined') return initialForm;

  try {
    const stored = window.localStorage.getItem('lokus_checkout');
    return stored ? ({ ...initialForm, ...(JSON.parse(stored) as Partial<CheckoutFormValues>) }) : initialForm;
  } catch {
    return initialForm;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<CheckoutFormValues>(readStoredCheckoutDetails);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.localStorage.setItem('lokus_checkout', JSON.stringify(formValues));
  }, [formValues]);

  useEffect(() => {
    if (user?.email) {
      setFormValues((prev) => ({ ...prev, email: prev.email || user.email || '' }));
    }
  }, [user?.email]);

  const errors = useMemo(() => validateCheckoutForm(formValues), [formValues]);

  const updateField = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!items.length) return;
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }
    if (!window.Razorpay) {
      setMessage('Razorpay checkout did not load. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: `lokus_${Date.now()}`,
        }),
      });

      const orderData = (await response.json()) as { id?: string; amount: number; currency: string; error?: string };
      if (!response.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LOKUS',
        description: `Payment for order ${orderData.id}`,
        order_id: orderData.id,
        handler: async (razorpayResponse) => {
          try {
            const saveResponse = await fetch('/api/save-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderData: {
                  payment_id: razorpayResponse.razorpay_payment_id,
                  order_id: razorpayResponse.razorpay_order_id,
                  signature: razorpayResponse.razorpay_signature,
                  amount: orderData.amount,
                  shipping_address: formatShippingAddress(formValues),
                  customer_name: formValues.fullName,
                  customer_email: formValues.email,
                  customer_phone: formValues.phone,
                  address_line1: formValues.addressLine1,
                  address_line2: formValues.addressLine2,
                  city: formValues.city,
                  state: formValues.state,
                  postal_code: formValues.postalCode,
                },
                items,
                userId: user?.id || null,
              }),
            });

            const saveData = (await saveResponse.json()) as {
              error?: string;
              order?: { order_number?: string };
            };

            if (!saveResponse.ok) {
              throw new Error(saveData.error || 'Payment was captured, but saving the order failed.');
            }

            clearCart();
            window.localStorage.removeItem('lokus_checkout');
            const orderNumber = saveData.order?.order_number || razorpayResponse.razorpay_order_id;
            window.location.href = `/success?payment_id=${razorpayResponse.razorpay_payment_id}&order_id=${encodeURIComponent(orderNumber)}`;
          } catch (saveError) {
            console.error('Order save error:', saveError);
            setLoading(false);
            setMessage(
              saveError instanceof Error
                ? saveError.message
                : 'Payment finished, but we could not finalize the order. Please contact support.'
            );
          }
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
      setMessage(error instanceof Error ? error.message : 'Something went wrong while starting payment.');
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
    <main className="pb-16 pt-10">
      <section className="section-wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.9),rgba(185,106,60,0.14))] p-6 text-white shadow-[var(--shadow)] md:p-8">
            <div className="absolute inset-y-0 right-0 hidden w-36 border-l border-white/8 md:block" />
            <div className="relative grid gap-6 md:grid-cols-[5rem_minmax(0,1fr)]">
              <div className="hidden md:flex md:items-start md:justify-center">
                <span className="writing-mode-vertical text-[10px] uppercase tracking-[0.45em] text-white/35 [writing-mode:vertical-rl]">
                  Checkout
                </span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Compulsory delivery details</p>
                <h1 className="mt-4 font-display text-6xl leading-[0.92] md:text-7xl">Confirm the pair. Lock the route.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
                  We now require the key details before payment begins, especially phone number and pincode, so delivery and payment confirmation do not break mid-flow.
                </p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Order summary</p>
            <div className="mt-5 space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
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
          </aside>
        </div>
      </section>

      <section className="section-wrap mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow)] md:p-8">
          <div className="absolute left-0 top-0 h-full w-3 bg-[linear-gradient(180deg,var(--color-ember),transparent)]" />
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['fullName', 'Full name', 'text', 'Required for shipping'],
              ['email', 'Email', 'email', 'Order confirmation goes here'],
              ['phone', 'Phone number', 'tel', 'Required: 10 digits'],
              ['city', 'City', 'text', 'Required'],
              ['state', 'State', 'text', 'Required'],
              ['postalCode', 'Pincode', 'text', 'Required: 6 digits'],
            ].map(([field, label, type, note]) => (
              <label key={field} className="text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  {label}
                </span>
                <input
                  type={type}
                  required
                  value={formValues[field as keyof CheckoutFormValues]}
                  onChange={(event) => updateField(field as keyof CheckoutFormValues, event.target.value)}
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-3 text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ember)]"
                />
                <span className="mt-2 block text-xs text-[var(--color-muted-foreground)]">{note}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-5">
            <label className="text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                Address line 1
              </span>
              <input
                required
                value={formValues.addressLine1}
                onChange={(event) => updateField('addressLine1', event.target.value)}
                className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-3 text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
            <label className="text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                Address line 2
              </span>
              <input
                value={formValues.addressLine2}
                onChange={(event) => updateField('addressLine2', event.target.value)}
                className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-3 text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[var(--color-foreground)] p-6 text-white shadow-[var(--shadow)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">Payment lock</p>
          <h2 className="mt-4 font-display text-4xl leading-none">Verified before we save the order.</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Razorpay payment is now checked with signature verification on the server before the order becomes paid.
          </p>

          {errors.length ? (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-4 text-sm text-white/80">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-sand)]">Still required</p>
              <ul className="mt-3 space-y-2">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {message ? (
            <p className="mt-6 text-sm text-[var(--color-sand)]">{message}</p>
          ) : null}

          <button
            type="button"
            onClick={handlePayment}
            disabled={loading || errors.length > 0}
            className="mt-8 w-full rounded-full bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
          </button>
        </aside>
      </section>
    </main>
  );
}
