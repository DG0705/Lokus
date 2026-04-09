import 'server-only';

import type { User } from '@supabase/supabase-js';

import type { ApprovalStatus, DeliveryApplication, ProfileRole, UserProfile } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/server';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AuthenticatedActor = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: UserProfile;
  application: DeliveryApplication | null;
};

export function isAdminProfile(profile: Pick<UserProfile, 'is_admin' | 'role'>) {
  return profile.is_admin || profile.role === 'admin';
}

export function isApprovedDeliveryProfile(profile: Pick<UserProfile, 'role' | 'approval_status'>) {
  return profile.role === 'delivery_partner' && profile.approval_status === 'approved';
}

export async function ensureProfile({
  user,
  role = 'customer',
  approvalStatus = 'approved',
}: {
  user: User;
  role?: ProfileRole;
  approvalStatus?: ApprovalStatus;
}) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (existing) {
    return { supabase, profile: existing as UserProfile };
  }

  const profileInsert = {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata.full_name ?? null,
    role,
    approval_status: approvalStatus,
    is_admin: false,
    phone: user.phone ?? null,
  };

  const { data, error } = await supabase.from('profiles').upsert(profileInsert).select().single();
  if (error) {
    throw new HttpError(500, error.message);
  }

  return { supabase, profile: data as UserProfile };
}

export async function getAuthenticatedActor(): Promise<AuthenticatedActor> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new HttpError(401, 'Authentication required.');
  }

  const { profile } = await ensureProfile({ user });
  const { data: application } = await supabase
    .from('delivery_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    profile,
    application: (application as DeliveryApplication | null) ?? null,
  };
}

export async function requireAdminActor() {
  const actor = await getAuthenticatedActor();
  if (!isAdminProfile(actor.profile)) {
    throw new HttpError(403, 'Admin access required.');
  }

  return actor;
}

export async function requireDeliveryActor() {
  const actor = await getAuthenticatedActor();
  if (!isApprovedDeliveryProfile(actor.profile)) {
    throw new HttpError(403, 'Approved delivery partner access required.');
  }

  return actor;
}
