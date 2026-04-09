import { NextResponse } from 'next/server';

import { canTransitionDeliveryJobStatus } from '@/app/lib/delivery';
import { hydrateDeliveryJobs, issueDeliveryOtp, recordDeliveryEvent, updateOrderStatus } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireDeliveryActor, HttpError } from '@/app/lib/server-auth';
import type { DeliveryEventType, DeliveryJobStatus, OrderStatus } from '@/app/lib/types';

const statusEvents: Partial<Record<DeliveryJobStatus, DeliveryEventType>> = {
  accepted: 'job_accepted',
  picked_up: 'picked_up',
  out_for_delivery: 'out_for_delivery',
  failed_delivery: 'delivery_failed',
  returned: 'job_returned',
  cancelled: 'job_cancelled',
};

const orderStatusByDeliveryStatus: Partial<Record<DeliveryJobStatus, OrderStatus>> = {
  assigned: 'assigned',
  accepted: 'accepted',
  picked_up: 'picked_up',
  out_for_delivery: 'out_for_delivery',
  failed_delivery: 'failed_delivery',
  returned: 'returned',
  cancelled: 'cancelled',
};

export async function POST(request: Request, context: RouteContext<'/api/delivery/jobs/[id]/status'>) {
  try {
    const actor = await requireDeliveryActor();
    const { id } = await context.params;
    const jobId = parseNumericRouteParam(id, 'job id');
    const payload = (await request.json()) as {
      status?: DeliveryJobStatus;
      note?: string;
    };

    if (!payload.status) {
      throw new HttpError(400, 'Delivery status is required.');
    }

    if (payload.status === 'delivered') {
      throw new HttpError(400, 'Use OTP verification to complete delivery.');
    }

    const { data: job, error } = await actor.supabase.from('delivery_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error) {
      throw error;
    }

    if (!job) {
      throw new HttpError(404, 'Delivery job not found.');
    }

    if (job.assigned_partner_id !== actor.user.id) {
      throw new HttpError(403, 'You can only update jobs assigned to you.');
    }

    if (!canTransitionDeliveryJobStatus(job.status, payload.status)) {
      throw new HttpError(409, `Cannot move a ${job.status.replaceAll('_', ' ')} job to ${payload.status.replaceAll('_', ' ')}.`);
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: payload.status,
      updated_at: now,
    };

    if (payload.status === 'accepted') {
      updatePayload.accepted_at = now;
    }

    if (payload.status === 'picked_up') {
      updatePayload.picked_up_at = now;
    }

    if (payload.status === 'out_for_delivery') {
      updatePayload.out_for_delivery_at = now;
    }

    if (payload.status === 'failed_delivery') {
      updatePayload.failed_at = now;
      updatePayload.failure_reason = payload.note?.trim() || 'Delivery attempt failed.';
    }

    if (payload.status === 'returned') {
      updatePayload.cancelled_at = now;
      updatePayload.failure_reason = payload.note?.trim() || 'Returned to store.';
    }

    if (payload.status === 'cancelled') {
      updatePayload.cancelled_at = now;
      updatePayload.failure_reason = payload.note?.trim() || 'Delivery cancelled.';
    }

    const { data: updatedJob, error: updateError } = await actor.supabase
      .from('delivery_jobs')
      .update(updatePayload)
      .eq('id', jobId)
      .eq('assigned_partner_id', actor.user.id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    if (orderStatusByDeliveryStatus[payload.status]) {
      await updateOrderStatus(actor.supabase, updatedJob.order_id, orderStatusByDeliveryStatus[payload.status] as OrderStatus);
    }

    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: statusEvents[payload.status] ?? 'job_accepted',
      notes: payload.note?.trim() || null,
    });

    let otpSent = false;
    if (payload.status === 'out_for_delivery') {
      await issueDeliveryOtp(actor.supabase, updatedJob);
      otpSent = true;
    }

    const [hydratedJob] = await hydrateDeliveryJobs(actor.supabase, [updatedJob], {
      includeEvents: true,
      includeLocationPings: true,
    });

    return NextResponse.json({ success: true, job: hydratedJob, otpSent });
  } catch (error) {
    return jsonError(error, 'Failed to update delivery job status.');
  }
}
