import type { ReactNode } from 'react';

import { StorefrontFooter } from '@/app/components/storefront/StorefrontFooter';
import { StorefrontHeader } from '@/app/components/storefront/StorefrontHeader';

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="luxury-shell min-h-screen bg-[radial-gradient(circle_at_top,_rgba(185,106,60,0.12),_transparent_34%),linear-gradient(180deg,_#f8f3eb_0%,_#f4ede2_45%,_#f9f4ee_100%)]">
      <StorefrontHeader />
      <div className="min-h-[calc(100vh-5rem)]">{children}</div>
      <StorefrontFooter />
    </div>
  );
}
