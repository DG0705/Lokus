import { NextResponse } from 'next/server';

import { jsonError } from '@/app/lib/http';
import { getAuthenticatedActor, isApprovedDeliveryProfile } from '@/app/lib/server-auth';
import type { DeliveryApplicationStatusResponse } from '@/app/lib/types';

export async function GET() {
  try {
    const actor = await getAuthenticatedActor();

    const response: DeliveryApplicationStatusResponse = {
      application: actor.application,
      profile: actor.profile,
      canAccessDashboard: isApprovedDeliveryProfile(actor.profile),
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to fetch delivery application status.');
  }
}
