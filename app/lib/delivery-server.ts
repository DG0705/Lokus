import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createDeliveryOtpSession, deriveDeliveryOtp, resolveZoneRate } from '@/app/lib/delivery';
import { escapeHtml, isMailConfigured, sendOfficialMail } from '@/app/lib/mailer';
import type {
  DeliveryEventType,
  DeliveryJob,
  DeliveryJobEvent,
  DeliveryLocationPing,
  DeliveryZoneRate,
  OrderRecord,
  OrderStatus,
  UserProfile,
} from '@/app/lib/types';

type DeliveryJobLike = {
  id: number;
  order_id: number;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  zone_name: string | null;
  rate_amount: number | null;
  assignment_mode: string | null;
  status: DeliveryJob['status'];
  assigned_partner_id: string | null;
  otp_hash?: string | null;
  otp_seed?: string | null;
  otp_last_sent_at?: string | null;
  otp_expires_at?: string | null;
  payout_status?: DeliveryJob['payout_status'];
  payout_amount?: number | null;
  last_known_lat?: number | null;
  last_known_lng?: number | null;
  last_location_at?: string | null;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  out_for_delivery_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  cancelled_at?: string | null;
};

export function getDeliveryOtpSecret() {
  return process.env.RAZORPAY_KEY_SECRET || 'lokus-delivery-dev-secret';
}

export async function recordDeliveryEvent(
  supabase: SupabaseClient,
  {
    jobId,
    orderId,
    actorUserId,
    eventType,
    notes,
    metadata,
  }: {
    jobId: number;
    orderId: number;
    actorUserId: string | null;
    eventType: DeliveryEventType;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  await supabase.from('delivery_job_events').insert({
    job_id: jobId,
    order_id: orderId,
    actor_user_id: actorUserId,
    event_type: eventType,
    notes: notes ?? null,
    metadata: metadata ?? {},
  });
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: number,
  status: OrderStatus,
  extras?: Record<string, unknown>
) {
  const { error } = await supabase.from('orders').update({ status, ...(extras ?? {}) }).eq('id', orderId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function resolveZoneRateForPostalCode(supabase: SupabaseClient, postalCode: string | null | undefined) {
  const { data, error } = await supabase.from('delivery_zone_rates').select('*').eq('is_active', true);
  if (error) {
    throw new Error(error.message);
  }

  return resolveZoneRate(postalCode, (data as DeliveryZoneRate[] | null) ?? []);
}

export async function createDeliveryJobForOrder(supabase: SupabaseClient, order: OrderRecord) {
  const zoneRate = await resolveZoneRateForPostalCode(supabase, order.postal_code);
  const deliveryInsert = {
    order_id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name ?? null,
    customer_email: order.customer_email ?? null,
    customer_phone: order.customer_phone ?? null,
    address_line1: order.address_line1 ?? null,
    address_line2: order.address_line2 ?? null,
    city: order.city ?? null,
    state: order.state ?? null,
    postal_code: order.postal_code ?? null,
    zone_name: zoneRate?.zone_name ?? null,
    rate_amount: zoneRate?.rate_amount ?? 0,
    status: 'ready_to_dispatch',
    payout_status: 'unpaid',
    payout_amount: zoneRate?.rate_amount ?? 0,
    assignment_mode: 'unassigned',
  };

  const { data, error } = await supabase.from('delivery_jobs').insert(deliveryInsert).select().single();
  if (error) {
    throw new Error(error.message);
  }

  const job = data as DeliveryJob;
  await recordDeliveryEvent(supabase, {
    jobId: job.id,
    orderId: order.id,
    actorUserId: null,
    eventType: 'job_created',
    metadata: {
      zone_name: zoneRate?.zone_name ?? null,
      payout_amount: zoneRate?.rate_amount ?? 0,
    },
  });

  return job;
}

export async function issueDeliveryOtp(
  supabase: SupabaseClient,
  job: Pick<DeliveryJobLike, 'id' | 'order_id' | 'customer_email' | 'customer_name' | 'order_number'>
) {
  const otpSession = createDeliveryOtpSession(job.id, getDeliveryOtpSecret());
  const { error } = await supabase
    .from('delivery_jobs')
    .update({
      otp_hash: otpSession.otpHash,
      otp_seed: otpSession.otpSeed,
      otp_last_sent_at: new Date().toISOString(),
      otp_expires_at: otpSession.otpExpiresAt,
    })
    .eq('id', job.id);

  if (error) {
    throw new Error(error.message);
  }

  if (job.customer_email && isMailConfigured()) {
    try {
      await sendOfficialMail({
        to: job.customer_email,
        subject: `Delivery OTP for ${job.order_number}`,
        text: `Hi ${job.customer_name || 'Customer'}, your delivery OTP for ${job.order_number} is ${otpSession.otp}. It expires in 15 minutes.`,
        html: `
          <p>Hi ${escapeHtml(job.customer_name || 'Customer')},</p>
          <p>Your LOKUS delivery OTP for <strong>${escapeHtml(job.order_number)}</strong> is:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:0.25em">${otpSession.otp}</p>
          <p>This code expires in 15 minutes.</p>
        `,
      });
    } catch (error) {
      console.error('Delivery OTP email warning:', error);
    }
  }

  await recordDeliveryEvent(supabase, {
    jobId: job.id,
    orderId: job.order_id,
    actorUserId: null,
    eventType: 'otp_sent',
  });

  return otpSession;
}

export function getCustomerVisibleOtp(job: Pick<DeliveryJobLike, 'id' | 'otp_seed' | 'otp_expires_at' | 'status'>) {
  if (!job.otp_seed || !job.otp_expires_at || job.status !== 'out_for_delivery') {
    return null;
  }

  if (new Date(job.otp_expires_at).getTime() < Date.now()) {
    return null;
  }

  return deriveDeliveryOtp(job.id, job.otp_seed, getDeliveryOtpSecret());
}

export async function hydrateDeliveryJobs(
  supabase: SupabaseClient,
  jobs: DeliveryJobLike[],
  options?: { includeEvents?: boolean; includeLocationPings?: boolean }
) {
  if (!jobs.length) {
    return [] as DeliveryJob[];
  }

  const orderIds = jobs.map((job) => job.order_id);
  const partnerIds = Array.from(new Set(jobs.map((job) => job.assigned_partner_id).filter(Boolean) as string[]));
  const jobIds = jobs.map((job) => job.id);

  const [{ data: orderItemsData }, { data: partnersData }, eventsResponse, pingsResponse] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds),
    partnerIds.length ? supabase.from('profiles').select('*').in('id', partnerIds) : Promise.resolve({ data: [] }),
    options?.includeEvents
      ? supabase.from('delivery_job_events').select('*').in('job_id', jobIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    options?.includeLocationPings
      ? supabase.from('delivery_location_pings').select('*').in('job_id', jobIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const orderItemsByOrderId = new Map<number, DeliveryJob['order_items']>();
  ((orderItemsData as DeliveryJob['order_items']) ?? []).forEach((item) => {
    const orderId = item.order_id;
    const existing = orderId != null ? orderItemsByOrderId.get(orderId) ?? [] : [];
    if (orderId != null) {
      orderItemsByOrderId.set(orderId, [...existing, item]);
    }
  });

  const partnersById = new Map<string, UserProfile>();
  ((partnersData as UserProfile[] | null) ?? []).forEach((partner) => {
    partnersById.set(partner.id, partner);
  });

  const eventsByJobId = new Map<number, DeliveryJobEvent[]>();
  ((eventsResponse.data as DeliveryJobEvent[] | null) ?? []).forEach((event) => {
    const existing = eventsByJobId.get(event.job_id) ?? [];
    eventsByJobId.set(event.job_id, [...existing, event]);
  });

  const pingsByJobId = new Map<number, DeliveryLocationPing[]>();
  ((pingsResponse.data as DeliveryLocationPing[] | null) ?? []).forEach((ping) => {
    const existing = pingsByJobId.get(ping.job_id) ?? [];
    pingsByJobId.set(ping.job_id, [...existing, ping]);
  });

  return jobs.map((job) => ({
    ...job,
    rate_amount: job.rate_amount ?? 0,
    payout_status: job.payout_status ?? 'unpaid',
    payout_amount: job.payout_amount ?? 0,
    assigned_partner: job.assigned_partner_id ? partnersById.get(job.assigned_partner_id) ?? null : null,
    order_items: orderItemsByOrderId.get(job.order_id) ?? [],
    events: options?.includeEvents ? eventsByJobId.get(job.id) ?? [] : undefined,
    location_pings: options?.includeLocationPings ? pingsByJobId.get(job.id) ?? [] : undefined,
  })) as DeliveryJob[];
}
