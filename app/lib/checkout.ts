import type { CheckoutFormValues } from '@/app/lib/types';

export function validateCheckoutForm(values: CheckoutFormValues) {
  const errors: string[] = [];

  if (!values.fullName.trim()) errors.push('Full name is required.');
  if (!values.email.trim()) errors.push('Email is required.');
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.push('Enter a valid email address.');
  if (!/^\d{10}$/.test(values.phone.trim())) errors.push('Phone number must be 10 digits.');
  if (!values.addressLine1.trim()) errors.push('Address line 1 is required.');
  if (!values.city.trim()) errors.push('City is required.');
  if (!values.state.trim()) errors.push('State is required.');
  if (!/^\d{6}$/.test(values.postalCode.trim())) errors.push('Pincode must be 6 digits.');

  return Array.from(new Set(errors));
}
