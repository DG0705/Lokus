'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store the auth token in a cookie so the middleware can read it
      document.cookie = `token=${data.access_token || 'authenticated'}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `role=${data.role || 'customer'}; path=/; max-age=86400; SameSite=Strict`;
      // --- DYNAMIC REDIRECT BASED ON ROLE ---
      if (data.role === 'supplier') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Lokus.</h1>
            <p className="text-stone-400 font-medium">Access the ultimate sneaker hub</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-medium"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-stone-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-stone-200 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-stone-400 text-sm mt-8 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-white hover:text-stone-200 font-bold transition underline decoration-stone-600 underline-offset-4">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}