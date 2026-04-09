'use client';

import { deliveryStatusLabels } from '@/app/lib/delivery';
import type { DeliveryJob } from '@/app/lib/types';

const eventLabels: Record<string, string> = {
  job_created: 'Job created',
  job_claimed: 'Claimed by rider',
  job_assigned: 'Assigned by admin',
  job_accepted: 'Accepted by rider',
  picked_up: 'Picked up',
  out_for_delivery: 'Out for delivery',
  otp_sent: 'Customer OTP sent',
  otp_verified: 'OTP verified',
  delivery_completed: 'Delivered',
  delivery_failed: 'Delivery failed',
  job_returned: 'Returned',
  job_cancelled: 'Cancelled',
  payout_batched: 'Added to payout batch',
  payout_paid: 'Payout marked paid',
};

export function DeliveryTimeline({ job }: { job: DeliveryJob }) {
  const events = job.events ?? [];

  if (!events.length) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted-foreground)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Timeline</p>
        <p className="mt-3">Current status: {deliveryStatusLabels[job.status]}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Timeline</p>
      <div className="mt-4 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="lokus-line pl-5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {eventLabels[event.event_type] ?? event.event_type.replaceAll('_', ' ')}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {new Date(event.created_at).toLocaleString('en-IN')}
            </p>
            {event.notes ? <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{event.notes}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
