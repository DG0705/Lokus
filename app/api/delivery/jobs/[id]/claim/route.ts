import { NextResponse } from 'next/server';

import { hydrateDeliveryJobs, recordDeliveryEvent, updateOrderStatus } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireDeliveryActor, HttpError } from '@/app/lib/server-auth';

export async function POST(_request: Request, context: RouteContext<'/api/delivery/jobs/[id]/claim'>) {
  try {
    const actor = await requireDeliveryActor();
    const { id } = await context.params;
    const jobId = parseNumericRouteParam(id, 'job id');

    const { data: job, error } = await actor.supabase.from('delivery_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error) {
      throw error;
    }

    if (!job) {
      throw new HttpError(404, 'Delivery job not found.');
    }

    const serviceZones = (actor.profile.service_zones ?? []).map((zone) => zone.toUpperCase());
    if (job.zone_name && !serviceZones.includes(job.zone_name.toUpperCase())) {
      throw new HttpError(403, 'This job is outside your active delivery zones.');
    }

    const { data: updatedJob, error: updateError } = await actor.supabase
      .from('delivery_jobs')
      .update({
        assigned_partner_id: actor.user.id,
        assignment_mode: 'rider_claimed',
        status: 'accepted',
        assigned_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        failure_reason: null,
      })
      .eq('id', jobId)
      .eq('status', 'ready_to_dispatch')
      .is('assigned_partner_id', null)
      .select('*')
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedJob) {
      throw new HttpError(409, 'This delivery job is no longer available to claim.');
    }

    await updateOrderStatus(actor.supabase, updatedJob.order_id, 'accepted');
    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: 'job_claimed',
      metadata: {
        assignment_mode: 'rider_claimed',
      },
    });
    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: updatedJob.order_id,
      actorUserId: actor.user.id,
      eventType: 'job_accepted',
    });

    const [hydratedJob] = await hydrateDeliveryJobs(actor.supabase, [updatedJob], {
      includeEvents: true,
      includeLocationPings: true,
    });

    return NextResponse.json({ success: true, job: hydratedJob });
  } catch (error) {
    return jsonError(error, 'Failed to claim delivery job.');
  }
}
