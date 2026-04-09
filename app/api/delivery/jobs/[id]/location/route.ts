import { NextResponse } from 'next/server';

import { isTrackableStatus } from '@/app/lib/delivery';
import { recordDeliveryEvent } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireDeliveryActor, HttpError } from '@/app/lib/server-auth';

export async function POST(request: Request, context: RouteContext<'/api/delivery/jobs/[id]/location'>) {
  try {
    const actor = await requireDeliveryActor();
    const { id } = await context.params;
    const jobId = parseNumericRouteParam(id, 'job id');
    const payload = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      accuracy?: number | null;
    };

    if (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      throw new HttpError(400, 'Valid latitude and longitude are required.');
    }

    const { data: job, error } = await actor.supabase.from('delivery_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error) {
      throw error;
    }

    if (!job) {
      throw new HttpError(404, 'Delivery job not found.');
    }

    if (job.assigned_partner_id !== actor.user.id) {
      throw new HttpError(403, 'You can only update the live location for your own job.');
    }

    if (!isTrackableStatus(job.status)) {
      throw new HttpError(409, 'Location tracking is only available for active delivery jobs.');
    }

    const now = new Date().toISOString();
    const { error: pingError } = await actor.supabase.from('delivery_location_pings').insert({
      job_id: jobId,
      rider_id: actor.user.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy_meters: payload.accuracy ?? null,
      created_at: now,
    });

    if (pingError) {
      throw pingError;
    }

    const { error: updateError } = await actor.supabase
      .from('delivery_jobs')
      .update({
        last_known_lat: payload.latitude,
        last_known_lng: payload.longitude,
        last_location_at: now,
      })
      .eq('id', jobId);

    if (updateError) {
      throw updateError;
    }

    await recordDeliveryEvent(actor.supabase, {
      jobId,
      orderId: job.order_id,
      actorUserId: actor.user.id,
      eventType: 'location_ping',
      metadata: {
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error, 'Failed to save live location.');
  }
}
