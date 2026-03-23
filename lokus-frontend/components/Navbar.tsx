'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check the cookies for the user's token and role whenever they navigate
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    // Check if the user is actually logged in
    const token = getCookie('token');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(getCookie('role') || 'customer');
    } else {
      setIsAuthenticated(false);
      setUserRole('guest');
    }
  }, [pathname]);

  // Hide the Navbar entirely on the authentication pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/verify') {
    return null;
  }

  const handleLogout = () => {
    // Delete BOTH the auth token and the role cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    
    setIsAuthenticated(false);
    setUserRole('guest');
    
    // Redirect back to the login page
    router.push('/login');
    router.refresh();
  };

  // Prevent hydration flash by rendering an empty nav until auth state is known
  if (userRole === null) {
    return <nav className="bg-neutral-100 border-b border-stone-300 sticky top-0 z-50 h-20"></nav>;
  }

  return (
    <nav className="bg-neutral-100 border-b border-stone-300 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo - Routes dynamically based on role */}
          <Link href={userRole === 'supplier' ? '/vendor' : '/'} className="text-3xl font-extrabold tracking-tighter text-stone-900 hover:text-red-800 transition-colors">
            LOKUS.
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            
            {/* Show to Guests and Customers */}
            {userRole !== 'supplier' && (
              <Link 
                href="/" 
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
              >
                Drops
              </Link>
            )}
            
            {/* Show ONLY to Suppliers */}
            {userRole === 'supplier' && (
              <Link 
                href="/vendor" 
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${pathname === '/vendor' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
              >
                Command Center
              </Link>
            )}
          </div>

          {/* Right Side: Auth / Vault / Logout */}
          <div className="flex items-center space-x-3 md:space-x-4">
            
            {!isAuthenticated ? (
              /* --- UNAUTHENTICATED GUEST CONTROLS --- */
              <>
                <Link 
                  href="/login" 
                  className="text-stone-500 hover:text-stone-900 text-xs md:text-sm font-bold uppercase tracking-widest px-2 md:px-4 py-2.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-stone-900 text-neutral-100 text-xs md:text-sm font-bold uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              /* --- LOGGED IN USER CONTROLS --- */
              <>
                {/* Hide Vault from Suppliers */}
                {userRole !== 'supplier' && (
                  <Link 
                    href="/vault" 
                    className="bg-stone-900 text-neutral-100 text-xs md:text-sm font-bold uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
                  >
                    Vault
                  </Link>
                )}
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="border-2 border-stone-300 text-stone-500 hover:text-red-800 hover:border-red-800 text-xs md:text-sm font-bold uppercase tracking-widest px-4 md:px-6 py-2 rounded-xl transition-colors bg-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}