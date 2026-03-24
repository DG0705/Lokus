"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, MapPin, Building, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'customer', address: '', pincode: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');

      router.push(`/verify?email=${encodeURIComponent(formData.email)}&role=${formData.role}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-2xl">L</span></div>
        </Link>
        <h2 className="text-center text-4xl font-black text-gray-900 tracking-tight">Join Lokus</h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">Already have an account? <Link href="/login" className="font-bold text-black hover:underline">Sign in</Link></p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-8 shadow-xl border border-gray-100 rounded-3xl">
          {error && <div className="mb-6 bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl text-sm font-bold text-center">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'customer' })} className={`py-4 rounded-xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${formData.role === 'customer' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                <User className="w-6 h-6" /> Customer
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'supplier' })} className={`py-4 rounded-xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${formData.role === 'supplier' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                <Building className="w-6 h-6" /> Supplier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium text-black" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium text-black" placeholder="you@example.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
                  <input required type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium text-black" placeholder="123 Street Name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                <input required type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium text-black" placeholder="100001" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium text-black" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 px-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg mt-6">
              {isLoading ? 'Creating Account...' : <><ShieldCheck className="w-5 h-5" /> Continue to Verification</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}