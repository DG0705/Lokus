'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab the email and role passed from the register page URL
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'customer';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!code) {
      setError('Please enter the 6-digit code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      const data = await response.json();
      
      // Store the auth token and role in cookies
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `role=${data.role}; path=/; max-age=86400; SameSite=Strict`;
      
      // Redirect based on role
      if (data.role === 'supplier') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Verify.</h1>
          <p className="text-stone-400 font-medium">
            We sent a 6-digit code to <br/> <span className="text-white font-bold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-bold text-stone-300 mb-2 uppercase tracking-wide text-center">
              Enter Verification Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition font-mono text-center text-3xl tracking-widest"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full bg-white text-stone-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-stone-200 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg"
          >
            {isLoading ? 'Verifying...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Wrap in Suspense boundary for Next.js 13+ search params
export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-white font-black uppercase tracking-widest">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}