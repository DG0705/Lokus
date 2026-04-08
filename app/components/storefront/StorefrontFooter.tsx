import Link from 'next/link';

import { BRAND_NAME, footerShopLinks, footerSupportLinks } from '@/app/lib/constants';

export function StorefrontFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--color-foreground)] text-[var(--color-background)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div className="max-w-md">
          <p className="text-[11px] uppercase tracking-[0.36em] text-[var(--color-sand)]/70">Premium shoe gallery</p>
          <h2 className="mt-4 font-display text-5xl leading-none">{BRAND_NAME}</h2>
          <p className="mt-5 text-sm leading-7 text-[var(--color-background)]/72">
            Curated sneakers, runners, and statement footwear from the world&apos;s most admired labels,
            styled for an India-first launch with luxury energy.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-sand)]">Shop</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-[var(--color-background)]/70">
            {footerShopLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-sand)]">Support</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-[var(--color-background)]/70">
            {footerSupportLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs uppercase tracking-[0.22em] text-[var(--color-background)]/55 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>
            {new Date().getFullYear()} {BRAND_NAME}. Crafted for confident steps.
          </span>
          <span>India-first launch | Secure payments by Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
