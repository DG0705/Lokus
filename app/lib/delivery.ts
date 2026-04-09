import { createHash, createHmac, randomUUID } from 'crypto';

import type {
  DeliveryEarningSummary,
  DeliveryJob,
  DeliveryJobStatus,
  DeliveryZoneRate,
  OrderRecord,
} from '@/app/lib/types';

export const deliveryStatusLabels: Record<DeliveryJobStatus, string> = {
  ready_to_dispatch: 'Ready to dispatch',
  assigned: 'Assigned',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  failed_delivery: 'Failed delivery',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const deliveryStatusTransitions: Record<DeliveryJobStatus, DeliveryJobStatus[]> = {
  ready_to_dispatch: ['assigned', 'accepted', 'cancelled'],
  assigned: ['accepted', 'cancelled'],
  accepted: ['picked_up', 'failed_delivery', 'cancelled'],
  picked_up: ['out_for_delivery', 'failed_delivery', 'returned'],
  out_for_delivery: ['failed_delivery'],
  delivered: [],
  failed_delivery: ['ready_to_dispatch', 'returned', 'cancelled'],
  returned: [],
  cancelled: [],
};

export const trackableJobStatuses: DeliveryJobStatus[] = ['accepted', 'picked_up', 'out_for_delivery'];

export function canTransitionDeliveryJobStatus(current: DeliveryJobStatus, next: DeliveryJobStatus) {
  return deliveryStatusTransitions[current].includes(next);
}

export function normaliseServiceZones(value: string | string[] | null | undefined) {
  const values = Array.isArray(value) ? value : (value ?? '').split(/[,\n]/g);
  return Array.from(
    new Set(
      values
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => entry.toUpperCase())
    )
  );
}

export function formatDeliveryAddress(
  value: Pick<OrderRecord, 'address_line1' | 'address_line2' | 'city' | 'state' | 'postal_code'> | Pick<DeliveryJob, 'address_line1' | 'address_line2' | 'city' | 'state' | 'postal_code'>
) {
  return [value.address_line1, value.address_line2, [value.city, value.state].filter(Boolean).join(', '), value.postal_code]
    .filter(Boolean)
    .join(', ');
}

export function resolveZoneRate(postalCode: string | null | undefined, zoneRates: DeliveryZoneRate[]) {
  if (!postalCode) {
    return null;
  }

  const normalisedPostalCode = postalCode.trim();
  return (
    zoneRates.find(
      (zoneRate) =>
        zoneRate.is_active &&
        zoneRate.postal_codes.some((candidate) => candidate.trim() === normalisedPostalCode)
    ) ?? null
  );
}

export function calculateDeliveryEarnings(jobs: DeliveryJob[]): DeliveryEarningSummary {
  return jobs.reduce<DeliveryEarningSummary>(
    (summary, job) => {
      if (job.status === 'delivered') {
        summary.deliveredCount += 1;
        summary.totalEarned += job.payout_amount;
      }

      if (job.payout_status === 'unpaid') {
        summary.unpaidAmount += job.payout_amount;
      }

      if (job.payout_status === 'batched') {
        summary.batchedAmount += job.payout_amount;
      }

      if (job.payout_status === 'paid') {
        summary.paidAmount += job.payout_amount;
      }

      return summary;
    },
    {
      deliveredCount: 0,
      totalEarned: 0,
      unpaidAmount: 0,
      batchedAmount: 0,
      paidAmount: 0,
    }
  );
}

export function hashDeliveryOtp(otp: string) {
  return createHash('sha256').update(otp).digest('hex');
}

export function deriveDeliveryOtp(jobId: number, otpSeed: string, secret: string) {
  const digest = createHmac('sha256', secret).update(`${jobId}:${otpSeed}`).digest('hex');
  const value = Number.parseInt(digest.slice(0, 12), 16) % 1_000_000;
  return value.toString().padStart(6, '0');
}

export function createDeliveryOtpSession(jobId: number, secret: string, ttlMinutes = 15) {
  const otpSeed = randomUUID();
  const otp = deriveDeliveryOtp(jobId, otpSeed, secret);
  const otpHash = hashDeliveryOtp(otp);
  const otpExpiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  return {
    otp,
    otpHash,
    otpSeed,
    otpExpiresAt,
  };
}

export function verifyDeliveryOtp({
  otp,
  otpHash,
  otpExpiresAt,
}: {
  otp: string;
  otpHash: string | null | undefined;
  otpExpiresAt: string | null | undefined;
}) {
  if (!otpHash || !otpExpiresAt) {
    return false;
  }

  if (new Date(otpExpiresAt).getTime() < Date.now()) {
    return false;
  }

  return hashDeliveryOtp(otp.trim()) === otpHash;
}

export function isTrackableStatus(status: DeliveryJobStatus) {
  return trackableJobStatuses.includes(status);
}

export function isLocationStale(lastLocationAt: string | null | undefined, staleAfterMinutes = 2) {
  if (!lastLocationAt) {
    return true;
  }

  return Date.now() - new Date(lastLocationAt).getTime() > staleAfterMinutes * 60_000;
}

export function getDirectionsHref(job: Pick<DeliveryJob, 'address_line1' | 'address_line2' | 'city' | 'state' | 'postal_code'>) {
  const address = encodeURIComponent(formatDeliveryAddress(job));
  return `https://www.google.com/maps/search/?api=1&query=${address}`;
}

export function buildMapPreviewUrl({
  latitude,
  longitude,
  token,
  width = 960,
  height = 520,
}: {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  token?: string | null;
  width?: number;
  height?: number;
}) {
  if (latitude == null || longitude == null || !token) {
    return null;
  }

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+111111(${longitude},${latitude})/${longitude},${latitude},13/${width}x${height}?access_token=${token}`;
}
