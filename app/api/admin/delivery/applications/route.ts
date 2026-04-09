import { NextResponse } from 'next/server';

import { jsonError } from '@/app/lib/http';
import { requireAdminActor } from '@/app/lib/server-auth';
import type { AdminDeliveryApplicationsResponse, DeliveryApplication, UserProfile } from '@/app/lib/types';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    const { data: applications, error } = await actor.supabase
      .from('delivery_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const typedApplications = (applications as DeliveryApplication[] | null) ?? [];
    const applicantIds = typedApplications.map((application) => application.user_id);
    const profiles =
      applicantIds.length > 0
        ? (
            (
              await actor.supabase
                .from('profiles')
                .select('*')
                .in('id', applicantIds)
            ).data as UserProfile[] | null
          ) ?? []
        : [];

    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const response: AdminDeliveryApplicationsResponse = {
      applications: typedApplications.map((application) => ({
        ...application,
        profile: profilesById.get(application.user_id) ?? null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load delivery applications.');
  }
}
