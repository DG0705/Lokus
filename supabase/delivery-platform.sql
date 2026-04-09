create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer',
  approval_status text not null default 'approved',
  is_admin boolean not null default false,
  phone text,
  vehicle_type text,
  service_zones text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text not null default 'customer',
  add column if not exists approval_status text not null default 'approved',
  add column if not exists phone text,
  add column if not exists vehicle_type text,
  add column if not exists service_zones text[] not null default '{}',
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.touch_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, approval_status, is_admin, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'customer',
    'approved',
    false,
    new.phone
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

alter table if exists public.orders
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text;

create table if not exists public.delivery_applications (
  id bigserial primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  vehicle_type text not null,
  service_zones text[] not null default '{}',
  document_path text,
  status text not null default 'pending',
  admin_notes text,
  rejection_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_delivery_applications_updated_at on public.delivery_applications;
create trigger set_delivery_applications_updated_at
before update on public.delivery_applications
for each row execute procedure public.touch_updated_at();

create index if not exists delivery_applications_status_idx on public.delivery_applications (status, created_at desc);

create table if not exists public.delivery_zone_rates (
  id bigserial primary key,
  zone_name text not null unique,
  postal_codes text[] not null default '{}',
  rate_amount integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_delivery_zone_rates_updated_at on public.delivery_zone_rates;
create trigger set_delivery_zone_rates_updated_at
before update on public.delivery_zone_rates
for each row execute procedure public.touch_updated_at();

create table if not exists public.delivery_payout_batches (
  id bigserial primary key,
  batch_label text not null,
  status text not null default 'draft',
  period_start date,
  period_end date,
  total_amount integer not null default 0,
  partner_count integer not null default 0,
  payout_count integer not null default 0,
  notes text,
  settled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_delivery_payout_batches_updated_at on public.delivery_payout_batches;
create trigger set_delivery_payout_batches_updated_at
before update on public.delivery_payout_batches
for each row execute procedure public.touch_updated_at();

create table if not exists public.delivery_jobs (
  id bigserial primary key,
  order_id bigint not null unique references public.orders(id) on delete cascade,
  order_number text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  zone_name text,
  rate_amount integer not null default 0,
  assignment_mode text not null default 'unassigned',
  status text not null default 'ready_to_dispatch',
  assigned_partner_id uuid references auth.users(id) on delete set null,
  assigned_at timestamptz,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  out_for_delivery_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  otp_hash text,
  otp_seed text,
  otp_last_sent_at timestamptz,
  otp_expires_at timestamptz,
  payout_status text not null default 'unpaid',
  payout_amount integer not null default 0,
  payout_batch_id bigint references public.delivery_payout_batches(id) on delete set null,
  last_known_lat double precision,
  last_known_lng double precision,
  last_location_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_delivery_jobs_updated_at on public.delivery_jobs;
create trigger set_delivery_jobs_updated_at
before update on public.delivery_jobs
for each row execute procedure public.touch_updated_at();

create index if not exists delivery_jobs_status_idx on public.delivery_jobs (status, created_at desc);
create index if not exists delivery_jobs_partner_idx on public.delivery_jobs (assigned_partner_id, status, created_at desc);
create index if not exists delivery_jobs_zone_idx on public.delivery_jobs (zone_name);

create table if not exists public.delivery_job_events (
  id bigserial primary key,
  job_id bigint not null references public.delivery_jobs(id) on delete cascade,
  order_id bigint not null references public.orders(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists delivery_job_events_job_idx on public.delivery_job_events (job_id, created_at desc);

create table if not exists public.delivery_location_pings (
  id bigserial primary key,
  job_id bigint not null references public.delivery_jobs(id) on delete cascade,
  rider_id uuid not null references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists delivery_location_pings_job_idx on public.delivery_location_pings (job_id, created_at desc);

create table if not exists public.delivery_payout_items (
  id bigserial primary key,
  payout_batch_id bigint not null references public.delivery_payout_batches(id) on delete cascade,
  job_id bigint not null unique references public.delivery_jobs(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  status text not null default 'batched',
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists delivery_payout_items_batch_idx on public.delivery_payout_items (payout_batch_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('delivery-documents', 'delivery-documents', false)
on conflict (id) do nothing;
