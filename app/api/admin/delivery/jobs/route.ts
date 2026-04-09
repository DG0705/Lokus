import { NextResponse } from 'next/server';

import { hydrateDeliveryJobs } from '@/app/lib/delivery-server';
import { jsonError } from '@/app/lib/http';
import { requireAdminActor } from '@/app/lib/server-auth';
import type { AdminDeliveryJobsResponse, UserProfile } from '@/app/lib/types';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    const [{ data: jobsData, error: jobsError }, { data: partnersData, error: partnersError }] = await Promise.all([
      actor.supabase.from('delivery_jobs').select('*').order('created_at', { ascending: false }),
      actor.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'delivery_partner')
        .eq('approval_status', 'approved')
        .order('full_name', { ascending: true }),
    ]);

    if (jobsError) {
      throw jobsError;
    }

    if (partnersError) {
      throw partnersError;
    }

    const jobs = await hydrateDeliveryJobs(actor.supabase, (jobsData as AdminDeliveryJobsResponse['jobs']) ?? [], {
      includeEvents: true,
      includeLocationPings: true,
    });

    const response: AdminDeliveryJobsResponse = {
      jobs,
      partners: (partnersData as UserProfile[] | null) ?? [],
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load delivery jobs.');
  }
}
