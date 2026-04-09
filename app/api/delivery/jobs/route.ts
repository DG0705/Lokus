import { NextResponse } from 'next/server';

import { calculateDeliveryEarnings, normaliseServiceZones } from '@/app/lib/delivery';
import { hydrateDeliveryJobs } from '@/app/lib/delivery-server';
import { jsonError } from '@/app/lib/http';
import { requireDeliveryActor } from '@/app/lib/server-auth';
import type { DeliveryJobsResponse, DeliveryPayoutBatch, DeliveryPayoutItem } from '@/app/lib/types';

export async function GET() {
  try {
    const actor = await requireDeliveryActor();
    const serviceZones = normaliseServiceZones(actor.profile.service_zones);

    const [{ data: openJobsData, error: openJobsError }, { data: myJobsData, error: myJobsError }, payoutItemsResponse] =
      await Promise.all([
        actor.supabase
          .from('delivery_jobs')
          .select('*')
          .eq('status', 'ready_to_dispatch')
          .is('assigned_partner_id', null)
          .order('created_at', { ascending: false }),
        actor.supabase
          .from('delivery_jobs')
          .select('*')
          .eq('assigned_partner_id', actor.user.id)
          .order('created_at', { ascending: false }),
        actor.supabase
          .from('delivery_payout_items')
          .select('*')
          .eq('partner_id', actor.user.id)
          .order('created_at', { ascending: false }),
      ]);

    if (openJobsError) {
      throw openJobsError;
    }

    if (myJobsError) {
      throw myJobsError;
    }

    const openJobs = ((openJobsData as DeliveryJobsResponse['availableJobs']) ?? []).filter(
      (job) => !job.zone_name || serviceZones.includes(job.zone_name.toUpperCase())
    );
    const myJobs = (myJobsData as DeliveryJobsResponse['myJobs']) ?? [];

    const [availableJobs, hydratedMyJobs] = await Promise.all([
      hydrateDeliveryJobs(actor.supabase, openJobs),
      hydrateDeliveryJobs(actor.supabase, myJobs, {
        includeEvents: true,
        includeLocationPings: true,
      }),
    ]);

    const payoutItems = (payoutItemsResponse.data as DeliveryPayoutItem[] | null) ?? [];
    const payoutBatchIds = Array.from(new Set(payoutItems.map((item) => item.payout_batch_id)));
    const payoutBatches =
      payoutBatchIds.length > 0
        ? (
            (
              await actor.supabase
                .from('delivery_payout_batches')
                .select('*')
                .in('id', payoutBatchIds)
                .order('created_at', { ascending: false })
            ).data as DeliveryPayoutBatch[] | null
          ) ?? []
        : [];

    const activeJob =
      hydratedMyJobs.find((job) => ['accepted', 'picked_up', 'out_for_delivery'].includes(job.status)) ?? null;

    const response: DeliveryJobsResponse = {
      availableJobs,
      myJobs: hydratedMyJobs,
      activeJob,
      earnings: calculateDeliveryEarnings(hydratedMyJobs),
      payoutBatches,
      profile: actor.profile,
      application: actor.application,
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load delivery jobs.');
  }
}
