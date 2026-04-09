import { NextResponse } from 'next/server';

import { getCustomerVisibleOtp, hydrateDeliveryJobs } from '@/app/lib/delivery-server';
import { jsonError, parseNumericRouteParam } from '@/app/lib/http';
import { getAuthenticatedActor, HttpError, isAdminProfile } from '@/app/lib/server-auth';
import type { OrderRecord, OrderTrackingResponse } from '@/app/lib/types';

export async function GET(_request: Request, context: RouteContext<'/api/orders/[id]/tracking'>) {
  try {
    const actor = await getAuthenticatedActor();
    const { id } = await context.params;
    const orderId = parseNumericRouteParam(id, 'order id');

    const { data: order, error: orderError } = await actor.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    if (!order) {
      throw new HttpError(404, 'Order not found.');
    }

    if (!isAdminProfile(actor.profile) && order.user_id !== actor.user.id) {
      throw new HttpError(403, 'You can only track your own order.');
    }

    const { data: deliveryJob, error: jobError } = await actor.supabase
      .from('delivery_jobs')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (jobError) {
      throw jobError;
    }

    const hydratedJobs = deliveryJob
      ? await hydrateDeliveryJobs(actor.supabase, [deliveryJob], {
          includeEvents: true,
          includeLocationPings: true,
        })
      : [];

    const response: OrderTrackingResponse = {
      order: order as OrderRecord,
      deliveryJob: hydratedJobs[0] ?? null,
      customerOtp: deliveryJob ? getCustomerVisibleOtp(deliveryJob) : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load order tracking.');
  }
}
