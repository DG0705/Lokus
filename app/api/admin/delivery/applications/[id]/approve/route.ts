import { NextResponse } from 'next/server';

import { normaliseServiceZones } from '@/app/lib/delivery';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireAdminActor, HttpError } from '@/app/lib/server-auth';

export async function POST(request: Request, context: RouteContext<'/api/admin/delivery/applications/[id]/approve'>) {
  try {
    const actor = await requireAdminActor();
    const { id } = await context.params;
    const applicationId = parseNumericRouteParam(id, 'application id');
    const payload = (await request.json().catch(() => ({}))) as {
      adminNotes?: string;
      serviceZones?: string[] | string;
    };

    const { data: application, error } = await actor.supabase
      .from('delivery_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!application) {
      throw new HttpError(404, 'Delivery application not found.');
    }

    const approvedZones = normaliseServiceZones(payload.serviceZones ?? application.service_zones);
    const now = new Date().toISOString();

    const { error: appError } = await actor.supabase
      .from('delivery_applications')
      .update({
        status: 'approved',
        admin_notes: payload.adminNotes?.trim() || null,
        rejection_reason: null,
        reviewed_by: actor.user.id,
        reviewed_at: now,
        service_zones: approvedZones,
      })
      .eq('id', applicationId);

    if (appError) {
      throw appError;
    }

    const { error: profileError } = await actor.supabase
      .from('profiles')
      .update({
        role: 'delivery_partner',
        approval_status: 'approved',
        full_name: application.full_name,
        phone: application.phone,
        vehicle_type: application.vehicle_type,
        service_zones: approvedZones,
      })
      .eq('id', application.user_id);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error, 'Failed to approve delivery application.');
  }
}
