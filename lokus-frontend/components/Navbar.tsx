"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, PlusCircle, ShoppingBag, LayoutGrid, LogOut, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // New Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('token');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(getCookie('role') || 'customer');
    } else {
      setIsAuthenticated(false);
      setUserRole('guest');
    }
  }, [pathname]);

  if (pathname === '/login' || pathname === '/register' || pathname === '/verify') return null;

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    setIsAuthenticated(false);
    setUserRole('guest');
    router.push('/login');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Pass the search term to the collection page via URL parameters
      router.push(`/collection?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  if (userRole === null) return <header className="sticky top-0 z-50 bg-white border-b border-gray-100 h-[73px]"></header>;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          <Link href={userRole === 'admin' ? '/admin' : '/'} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center overflow-hidden">
               <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-black tracking-tighter">LOKUS</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={`${pathname === '/' ? 'text-black' : 'text-gray-500'} hover:text-black transition-colors font-medium`}>Shop</Link>
            <Link href="/collection" className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all ${pathname === '/collection' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <LayoutGrid className="w-4 h-4" /> Explore Collection
            </Link>
            
            {/* STRICTLY LOCKED: Only Suppliers see Add Shoe */}
            {userRole === 'supplier' && (
              <Link href="/vendor" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                <PlusCircle className="w-4 h-4" /> Add Shoe
              </Link>
            )}

            {/* STRICTLY LOCKED: Only Admins see Command Center */}
            {userRole === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-full transition-colors">
                <ShieldAlert className="w-4 h-4" /> Command Center
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Functional Interactive Search */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              {showSearch && (
                <input 
                  type="text" autoFocus placeholder="Search shoes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="absolute right-8 w-48 sm:w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-black transition-all font-medium text-black"
                />
              )}
              <button type="button" onClick={() => setShowSearch(!showSearch)} className="text-gray-600 hover:text-black transition-colors p-2 bg-white rounded-full z-10">
                <Search className="w-5 h-5" />
              </button>
            </form>
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">Sign In</Link>
                <Link href="/register" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-md">Register</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {userRole !== 'supplier' && userRole !== 'admin' && (
                  <Link href="/vault" className="text-gray-600 hover:text-black transition-colors" title="Your Orders"><ShoppingBag className="w-5 h-5" /></Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-red-50" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
}