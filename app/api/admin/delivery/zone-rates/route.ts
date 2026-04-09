import { NextResponse } from 'next/server';

import { jsonError } from '@/app/lib/http';
import { requireAdminActor, HttpError } from '@/app/lib/server-auth';
import type { AdminDeliveryZoneRatesResponse } from '@/app/lib/types';

function normalisePostalCodes(value: string[] | string | undefined) {
  const rawValues = Array.isArray(value) ? value : (value ?? '').split(/[,\n]/g);
  return Array.from(
    new Set(
      rawValues
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => entry.replace(/\s+/g, ''))
    )
  );
}

export async function GET() {
  try {
    const actor = await requireAdminActor();
    const { data, error } = await actor.supabase
      .from('delivery_zone_rates')
      .select('*')
      .order('is_active', { ascending: false })
      .order('zone_name', { ascending: true });

    if (error) {
      throw error;
    }

    const response: AdminDeliveryZoneRatesResponse = {
      zoneRates: (data as AdminDeliveryZoneRatesResponse['zoneRates']) ?? [],
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load delivery zone rates.');
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminActor();
    const payload = (await request.json()) as {
      id?: number;
      zoneName?: string;
      postalCodes?: string[] | string;
      rateAmount?: number;
      isActive?: boolean;
    };

    const zoneName = payload.zoneName?.trim();
    const postalCodes = normalisePostalCodes(payload.postalCodes);
    const rateAmount = Number(payload.rateAmount);

    if (!zoneName || !postalCodes.length || !Number.isFinite(rateAmount)) {
      throw new HttpError(400, 'Add a zone name, at least one postal code, and a payout amount.');
    }

    const zonePayload = {
      zone_name: zoneName.toUpperCase(),
      postal_codes: postalCodes,
      rate_amount: Math.max(0, Math.round(rateAmount)),
      is_active: payload.isActive ?? true,
    };

    const query = actor.supabase.from('delivery_zone_rates');
    const result = payload.id
      ? await query.update(zonePayload).eq('id', payload.id).select().single()
      : await query.insert(zonePayload).select().single();

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, zoneRate: result.data });
  } catch (error) {
    return jsonError(error, 'Failed to save delivery zone rate.');
  }
}
