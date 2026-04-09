import { NextResponse } from 'next/server';

import { normaliseServiceZones } from '@/app/lib/delivery';
import { jsonError } from '@/app/lib/http';
import { getAuthenticatedActor, HttpError } from '@/app/lib/server-auth';
import type { DeliveryApplication, UserProfile } from '@/app/lib/types';

const allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(request: Request) {
  try {
    const { supabase, user, profile, application } = await getAuthenticatedActor();
    const formData = await request.formData();

    const fullName = String(formData.get('fullName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const city = String(formData.get('city') ?? '').trim();
    const state = String(formData.get('state') ?? '').trim();
    const postalCode = String(formData.get('postalCode') ?? '').trim();
    const vehicleType = String(formData.get('vehicleType') ?? '').trim();
    const serviceZones = normaliseServiceZones(String(formData.get('serviceZones') ?? ''));
    const document = formData.get('document');

    if (!fullName || !phone || !city || !state || !postalCode || !vehicleType || !serviceZones.length) {
      throw new HttpError(400, 'Complete the rider application fields before submitting.');
    }

    let documentPath = application?.document_path ?? null;
    if (document instanceof File && document.size > 0) {
      if (!allowedDocumentTypes.includes(document.type)) {
        throw new HttpError(400, 'Upload a PDF, JPG, PNG, or WEBP document.');
      }

      const objectPath = `${user.id}/${Date.now()}-${sanitizeFilename(document.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('delivery-documents')
        .upload(objectPath, document, {
          cacheControl: '3600',
          upsert: true,
          contentType: document.type,
        });

      if (uploadError) {
        throw new HttpError(500, uploadError.message);
      }

      documentPath = objectPath;
    }

    if (!documentPath) {
      throw new HttpError(400, 'Upload at least one rider document before submitting.');
    }

    const applicationPayload = {
      user_id: user.id,
      full_name: fullName,
      phone,
      city,
      state,
      postal_code: postalCode,
      vehicle_type: vehicleType,
      service_zones: serviceZones,
      document_path: documentPath,
      status: 'pending',
      admin_notes: null,
      rejection_reason: null,
      reviewed_at: null,
      reviewed_by: null,
    };

    const { data, error } = await supabase
      .from('delivery_applications')
      .upsert(applicationPayload, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      throw new HttpError(500, error.message);
    }

    const profileUpdate = {
      full_name: fullName,
      phone,
      vehicle_type: vehicleType,
      service_zones: serviceZones,
      approval_status: 'pending',
      role: profile.role === 'delivery_partner' ? 'delivery_partner' : 'customer',
      email: user.email ?? profile.email,
    } satisfies Partial<UserProfile>;

    const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
    if (profileError) {
      throw new HttpError(500, profileError.message);
    }

    return NextResponse.json({
      success: true,
      application: data as DeliveryApplication,
    });
  } catch (error) {
    return jsonError(error, 'Failed to save the delivery application.');
  }
}
