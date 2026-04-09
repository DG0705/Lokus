import { NextResponse } from 'next/server';

import { verifyDeliveryOtp } from '@/app/lib/delivery';
import { hydrateDeliveryJobs, recordDeliveryEvent, updateOrderStatus } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireDeliveryActor, HttpError } from '@/app/lib/server-auth';

export async function POST(request: Request, context: RouteContext<'/api/delivery/jobs/[id]/verify-otp'>) {
  try {
    const actor = await requireDeliveryActor();
    const { id } = await context.params;
    const jobId = parseNumericRouteParam(id, 'job id');
    const payload = (await request.json()) as { otp?: string };

    if (!payload.otp?.trim()) {
      throw new HttpError(400, 'Enter the customer OTP to complete delivery.');
    }

    const { data: job, error } = await actor.supabase.from('delivery_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error) {
      throw error;
    }

    if (!job) {
      throw new HttpError(404, 'Delivery job not found.');
    }

    if (job.assigned_partner_id !== actor.user.id) {
      throw new HttpError(403, 'You can only verify OTPs for jobs assigned to you.');
    }

    if (job.status !== 'out_for_delivery') {
      throw new HttpError(409, 'OTP verification is available only after the job is out for delivery.');
    }

    if (
      !verifyDeliveryOtp({
        otp: payload.otp,
        otpHash: job.otp_hash,
        otpExpiresAt: job.otp_expires_at,
      })
    ) {
      throw new HttpError(400, 'The OTP is invalid or has expired.');
    }

    const now = new Date().toISOString();
    const { data: updatedJob, error: updateError } = await actor.supabase
      .from('delivery_jobs')
      .update({
        status: 'delivered',
        delivered_at: now,
        otp_hash: null,
        otp_seed: null,
        otp_last_sent_at: null,
        otp_expires_at: null,
        payout_status: 'unpaid',
      })
      .eq('id', jobId)
      .eq('assigned_partner_id', actor.user.id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    await updateOrderStatus(actor.supabase, updatedJob.order_id, 'delivered');
    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: 'otp_verified',
    });
    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: 'delivery_completed',
    });

    const [hydratedJob] = await hydrateDeliveryJobs(actor.supabase, [updatedJob], {
      includeEvents: true,
      includeLocationPings: true,
    });

    return NextResponse.json({ success: true, job: hydratedJob });
  } catch (error) {
    return jsonError(error, 'Failed to verify delivery OTP.');
  }
}
