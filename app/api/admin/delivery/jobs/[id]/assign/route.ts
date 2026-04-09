import { NextResponse } from 'next/server';

import { hydrateDeliveryJobs, recordDeliveryEvent, updateOrderStatus } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireAdminActor, HttpError } from '@/app/lib/server-auth';

export async function POST(request: Request, context: RouteContext<'/api/admin/delivery/jobs/[id]/assign'>) {
  try {
    const actor = await requireAdminActor();
    const { id } = await context.params;
    const jobId = parseNumericRouteParam(id, 'job id');
    const payload = (await request.json()) as {
      partnerId?: string;
    };

    if (!payload.partnerId) {
      throw new HttpError(400, 'Choose a delivery partner before assigning a job.');
    }

    const [{ data: job, error: jobError }, { data: partner, error: partnerError }] = await Promise.all([
      actor.supabase.from('delivery_jobs').select('*').eq('id', jobId).maybeSingle(),
      actor.supabase
        .from('profiles')
        .select('*')
        .eq('id', payload.partnerId)
        .eq('role', 'delivery_partner')
        .eq('approval_status', 'approved')
        .maybeSingle(),
    ]);

    if (jobError) {
      throw jobError;
    }

    if (partnerError) {
      throw partnerError;
    }

    if (!job) {
      throw new HttpError(404, 'Delivery job not found.');
    }

    if (!partner) {
      throw new HttpError(404, 'Approved delivery partner not found.');
    }

    if (!['ready_to_dispatch', 'failed_delivery'].includes(job.status)) {
      throw new HttpError(409, 'Only ready or failed jobs can be assigned manually.');
    }

    const now = new Date().toISOString();
    const { data: updatedJob, error: updateError } = await actor.supabase
      .from('delivery_jobs')
      .update({
        assigned_partner_id: payload.partnerId,
        assignment_mode: 'admin_assigned',
        status: 'assigned',
        assigned_at: now,
        failure_reason: null,
      })
      .eq('id', jobId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    await updateOrderStatus(actor.supabase, updatedJob.order_id, 'assigned');
    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: 'job_assigned',
      metadata: {
        assigned_partner_id: payload.partnerId,
      },
    });

    const [hydratedJob] = await hydrateDeliveryJobs(actor.supabase, [updatedJob], {
      includeEvents: true,
      includeLocationPings: true,
    });

    return NextResponse.json({ success: true, job: hydratedJob });
  } catch (error) {
    return jsonError(error, 'Failed to assign delivery job.');
  }
}
