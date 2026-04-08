'use client';

import { useState } from 'react';
import Image from 'next/image';

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-[7rem_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image) => {
          const selected = image === active;
          return (
            <button
              key={image}
              type="button"
              onClick={() => setActive(image)}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border ${
                selected ? 'border-[var(--color-ember)]' : 'border-[var(--color-border)]'
              }`}
            >
              <Image src={image} alt={alt} fill className="object-cover" sizes="80px" />
            </button>
          );
        })}
      </div>
      <div className="premium-card order-1 relative aspect-[4/5] overflow-hidden lg:order-2">
        <Image src={active} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
      </div>
    </div>
  );
}
