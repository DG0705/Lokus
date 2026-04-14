'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { BRAND_NAME, navLinks } from '@/app/lib/constants';
import { useHydrated } from '@/app/lib/use-hydrated';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

export function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const hydrated = useHydrated();

  const closeMenu = () => setMenuOpen(false);
  const displayTotalItems = hydrated ? totalItems : 0;
  const displayUser = hydrated ? user : null;

  const submitSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:color-mix(in_srgb,var(--color-background)_84%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="font-display text-3xl tracking-[0.18em] text-[var(--color-foreground)]">
          {BRAND_NAME}
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/shop"
            className={`text-sm uppercase tracking-[0.22em] transition ${
              pathname === '/shop'
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            Shop
          </Link>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm uppercase tracking-[0.22em] transition ${
                  active ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <div className="hidden items-center rounded-full border border-[var(--color-border)] bg-white/60 px-4 py-2 text-sm shadow-[var(--shadow)] xl:flex">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitSearch();
              }}
              placeholder="Search shoes…"
              className="w-56 bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted-foreground)]"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="ml-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]"
            >
              Go
            </button>
          </div>
          <Link href="/cart" className="text-sm uppercase tracking-[0.22em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]">
            Cart ({displayTotalItems})
          </Link>
          {displayUser ? (
            <>
              <Link href="/account" className="text-sm uppercase tracking-[0.22em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]">
                Account
              </Link>
              <button
                onClick={() => void signOut()}
                className="text-sm uppercase tracking-[0.22em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm uppercase tracking-[0.22em] transition hover:border-[var(--color-ember)] hover:text-[var(--color-foreground)]">
              Sign in
            </Link>
          )}
        </div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-16 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-foreground)] lg:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-white/10 bg-[var(--color-background)] px-5 py-6 lg:hidden"
          >
            <div className="flex flex-col gap-5">
              <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-3 shadow-[var(--shadow)]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Search</p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') submitSearch();
                    }}
                    placeholder="Search shoes…"
                    className="w-full bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted-foreground)]"
                  />
                  <button
                    type="button"
                    onClick={submitSearch}
                    className="rounded-full bg-[var(--color-foreground)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white"
                  >
                    Go
                  </button>
                </div>
              </div>
              <Link href="/shop" onClick={closeMenu} className="text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]">
                Shop
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" onClick={closeMenu} className="text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]">
                Cart ({displayTotalItems})
              </Link>
              {displayUser ? (
                <>
                  <Link href="/account" onClick={closeMenu} className="text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]">
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      void signOut();
                    }}
                    className="text-left text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeMenu} className="text-sm uppercase tracking-[0.24em] text-[var(--color-foreground)]">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
