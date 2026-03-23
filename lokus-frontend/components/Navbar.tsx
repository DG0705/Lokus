"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-neutral-100 border-b border-stone-300">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-stone-900 hover:text-red-800 transition-colors">
            LOKUS.
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link 
              href="/" 
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
            >
              Drops
            </Link>
            <Link 
              href="/admin" 
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/admin' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
            >
              Command Center
            </Link>
          </div>

          {/* Vault / User Link */}
          <div>
            <Link 
              href="/vault" 
              className="bg-stone-900 text-neutral-100 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:bg-red-800 transition-colors shadow-md"
            >
              My Vault
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}



