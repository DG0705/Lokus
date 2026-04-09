import assert from 'node:assert/strict';

import {
  calculateDeliveryEarnings,
  canTransitionDeliveryJobStatus,
  createDeliveryOtpSession,
  normaliseServiceZones,
  resolveZoneRate,
  verifyDeliveryOtp,
} from '../app/lib/delivery.ts';
import type { DeliveryJob, DeliveryZoneRate } from '../app/lib/types.ts';

assert.deepEqual(normaliseServiceZones(' south_delhi, Noida\nsouth_delhi '), ['SOUTH_DELHI', 'NOIDA']);

const zoneRates: DeliveryZoneRate[] = [
  {
    id: 1,
    zone_name: 'SOUTH_DELHI',
    postal_codes: ['110001', '110003'],
    rate_amount: 8500,
    is_active: true,
  },
  {
    id: 2,
    zone_name: 'NOIDA',
    postal_codes: ['201301'],
    rate_amount: 9200,
    is_active: true,
  },
];

assert.equal(resolveZoneRate('110003', zoneRates)?.zone_name, 'SOUTH_DELHI');
assert.equal(resolveZoneRate('201999', zoneRates), null);

const otpSession = createDeliveryOtpSession(42, 'test-secret', 15);
assert.equal(otpSession.otp.length, 6);
assert.equal(
  verifyDeliveryOtp({
    otp: otpSession.otp,
    otpHash: otpSession.otpHash,
    otpExpiresAt: otpSession.otpExpiresAt,
  }),
  true
);
assert.equal(
  verifyDeliveryOtp({
    otp: '000000',
    otpHash: otpSession.otpHash,
    otpExpiresAt: otpSession.otpExpiresAt,
  }),
  false
);

assert.equal(canTransitionDeliveryJobStatus('ready_to_dispatch', 'assigned'), true);
assert.equal(canTransitionDeliveryJobStatus('assigned', 'accepted'), true);
assert.equal(canTransitionDeliveryJobStatus('picked_up', 'out_for_delivery'), true);
assert.equal(canTransitionDeliveryJobStatus('out_for_delivery', 'delivered'), false);
assert.equal(canTransitionDeliveryJobStatus('delivered', 'returned'), false);

const jobs = [
  {
    id: 1,
    order_id: 101,
    order_number: 'LOK-1',
    customer_name: null,
    customer_email: null,
    customer_phone: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    postal_code: null,
    zone_name: 'SOUTH_DELHI',
    rate_amount: 8000,
    assignment_mode: 'rider_claimed',
    status: 'delivered',
    assigned_partner_id: 'partner-1',
    otp_expires_at: null,
    otp_last_sent_at: null,
    payout_status: 'unpaid',
    payout_amount: 8000,
    last_known_lat: null,
    last_known_lng: null,
    last_location_at: null,
    failure_reason: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 2,
    order_id: 102,
    order_number: 'LOK-2',
    customer_name: null,
    customer_email: null,
    customer_phone: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    postal_code: null,
    zone_name: 'NOIDA',
    rate_amount: 9000,
    assignment_mode: 'admin_assigned',
    status: 'delivered',
    assigned_partner_id: 'partner-1',
    otp_expires_at: null,
    otp_last_sent_at: null,
    payout_status: 'batched',
    payout_amount: 9000,
    last_known_lat: null,
    last_known_lng: null,
    last_location_at: null,
    failure_reason: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 3,
    order_id: 103,
    order_number: 'LOK-3',
    customer_name: null,
    customer_email: null,
    customer_phone: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    postal_code: null,
    zone_name: 'GURGAON',
    rate_amount: 7000,
    assignment_mode: 'admin_assigned',
    status: 'delivered',
    assigned_partner_id: 'partner-1',
    otp_expires_at: null,
    otp_last_sent_at: null,
    payout_status: 'paid',
    payout_amount: 7000,
    last_known_lat: null,
    last_known_lng: null,
    last_location_at: null,
    failure_reason: null,
    created_at: '',
    updated_at: '',
  },
] satisfies DeliveryJob[];

const summary = calculateDeliveryEarnings(jobs);
assert.deepEqual(summary, {
  deliveredCount: 3,
  totalEarned: 24000,
  unpaidAmount: 8000,
  batchedAmount: 9000,
  paidAmount: 7000,
});

console.log('Delivery helper tests passed.');
