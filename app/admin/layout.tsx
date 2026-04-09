'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/context/AuthContext';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/delivery', label: 'Delivery' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  if (pathname === '/admin/login') {
    return children;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm lg:block">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">LOKUS admin</p>
          <h2 className="mt-3 font-display text-4xl">Control room</h2>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-full px-4 py-3 text-sm uppercase tracking-[0.18em] transition ${
                    active ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-full border border-stone-200 px-4 py-3 text-sm uppercase tracking-[0.18em] text-stone-700"
          >
            Log out
          </button>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
