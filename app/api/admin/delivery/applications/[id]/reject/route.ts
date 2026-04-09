import { NextResponse } from 'next/server';

import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { requireAdminActor, HttpError } from '@/app/lib/server-auth';

export async function POST(request: Request, context: RouteContext<'/api/admin/delivery/applications/[id]/reject'>) {
  try {
    const actor = await requireAdminActor();
    const { id } = await context.params;
    const applicationId = parseNumericRouteParam(id, 'application id');
    const payload = (await request.json()) as {
      rejectionReason?: string;
      adminNotes?: string;
    };

    const reason = payload.rejectionReason?.trim();
    if (!reason) {
      throw new HttpError(400, 'Add a rejection reason so the rider knows what to fix.');
    }

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

    const now = new Date().toISOString();
    const { error: appError } = await actor.supabase
      .from('delivery_applications')
      .update({
        status: 'rejected',
        admin_notes: payload.adminNotes?.trim() || null,
        rejection_reason: reason,
        reviewed_by: actor.user.id,
        reviewed_at: now,
      })
      .eq('id', applicationId);

    if (appError) {
      throw appError;
    }

    const { error: profileError } = await actor.supabase
      .from('profiles')
      .update({
        role: 'customer',
        approval_status: 'rejected',
      })
      .eq('id', application.user_id);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error, 'Failed to reject delivery application.');
  }
}
