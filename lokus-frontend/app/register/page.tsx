'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: 'customer', // default role
    address: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Form Validation
    if (!formData.name || !formData.email || !formData.address || !formData.pincode || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://lokus-8cbg.onrender.com/api/v1/auth/register-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          address: formData.address,
          pincode: formData.pincode,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed to initiate');
      }

      // Pass both the email and the intended role to the verification page
      router.push(`/verify?email=${encodeURIComponent(formData.email)}&role=${formData.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Lokus.</h1>
            <p className="text-stone-400 font-medium">Join the ultimate sneaker hub</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selection */}
            <div className="flex justify-center space-x-6 pb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="customer" 
                  checked={formData.role === 'customer'} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-stone-900 bg-stone-800 border-stone-700 focus:ring-stone-500 focus:ring-1"
                />
                <span className="text-sm font-bold text-stone-300 uppercase tracking-wide">Customer</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="supplier" 
                  checked={formData.role === 'supplier'} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-stone-900 bg-stone-800 border-stone-700 focus:ring-stone-500 focus:ring-1"
                />
                <span className="text-sm font-bold text-stone-300 uppercase tracking-wide">Supplier</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium" disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium" disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Delivery Address</label>
              <textarea
                id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Sneaker Street, City" rows={2}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium resize-none" disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="pincode" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Pincode / Zip Code</label>
              <input
                type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="400001" maxLength={10}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium" disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Password</label>
                <input
                  type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium" disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium" disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-white text-stone-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-stone-200 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg">
              {isLoading ? 'Processing...' : 'Continue to Verification'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-sm mt-8 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-stone-200 font-bold transition underline decoration-stone-600 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}