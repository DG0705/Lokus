'use client';

import { buildMapPreviewUrl, formatDeliveryAddress, isLocationStale } from '@/app/lib/delivery';
import type { DeliveryJob } from '@/app/lib/types';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function LiveMapCard({
  job,
  title = 'Live location',
}: {
  job: Pick<DeliveryJob, 'address_line1' | 'address_line2' | 'city' | 'state' | 'postal_code' | 'last_known_lat' | 'last_known_lng' | 'last_location_at'>;
  title?: string;
}) {
  const previewUrl = buildMapPreviewUrl({
    latitude: job.last_known_lat,
    longitude: job.last_known_lng,
    token: mapboxToken,
  });
  const stale = isLocationStale(job.last_location_at);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-graphite)] text-white shadow-[var(--shadow)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">{title}</p>
        <p className="mt-2 text-sm text-white/72">
          {job.last_location_at
            ? `${stale ? 'Signal stale' : 'Signal live'} since ${new Date(job.last_location_at).toLocaleTimeString('en-IN')}`
            : 'Waiting for the rider to share location.'}
        </p>
      </div>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Delivery map preview" className="h-64 w-full object-cover" />
      ) : (
        <div className="premium-grid flex h-64 items-center justify-center px-6 text-center text-sm text-white/62">
          <div>
            <p>Map preview becomes available when a public Mapbox token is set and the rider shares live coordinates.</p>
            {job.last_known_lat != null && job.last_known_lng != null ? (
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--color-sand)]">
                {job.last_known_lat.toFixed(5)}, {job.last_known_lng.toFixed(5)}
              </p>
            ) : null}
          </div>
        </div>
      )}
      <div className="px-5 py-4 text-sm text-white/74">
        <p>{formatDeliveryAddress(job) || 'Address details will appear once the order is prepared.'}</p>
      </div>
    </div>
  );
}
