'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BRAND_NAME, navLinks } from '@/app/lib/constants';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

export function StorefrontHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:color-mix(in_srgb,var(--color-background)_84%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="font-display text-3xl tracking-[0.18em] text-[var(--color-foreground)]">
          {BRAND_NAME}
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
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
        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/cart" className="text-sm uppercase tracking-[0.22em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]">
            Cart ({totalItems})
          </Link>
          {user ? (
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
                Cart ({totalItems})
              </Link>
              {user ? (
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
