'use client';

import Link from 'next/link';
import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import { LiveMapCard } from '@/app/components/delivery/LiveMapCard';
import { DeliveryTimeline } from '@/app/components/delivery/DeliveryTimeline';
import { useAuth } from '@/app/context/AuthContext';
import { deliveryStatusLabels, formatDeliveryAddress, getDirectionsHref } from '@/app/lib/delivery';
import { formatPrice } from '@/app/lib/format';
import type { DeliveryApplicationStatusResponse, DeliveryJobsResponse, DeliveryJobStatus } from '@/app/lib/types';

type ApplicationFormState = {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  postalCode: string;
  vehicleType: string;
  serviceZones: string;
  document: File | null;
};

const initialFormState: ApplicationFormState = {
  fullName: '',
  phone: '',
  city: '',
  state: '',
  postalCode: '',
  vehicleType: '',
  serviceZones: '',
  document: null,
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export function DeliveryApp() {
  const { user, loading } = useAuth();
  const [statusData, setStatusData] = useState<DeliveryApplicationStatusResponse | null>(null);
  const [jobsData, setJobsData] = useState<DeliveryJobsResponse | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formState, setFormState] = useState<ApplicationFormState>(initialFormState);
  const [formMessage, setFormMessage] = useState('');
  const [busyJobId, setBusyJobId] = useState<number | null>(null);
  const [notesByJobId, setNotesByJobId] = useState<Record<number, string>>({});
  const [otpByJobId, setOtpByJobId] = useState<Record<number, string>>({});
  const [locationMessage, setLocationMessage] = useState('');
  const lastSentLocationAt = useRef(0);
  const activeJob = jobsData?.activeJob ?? null;

  const loadStatus = async () => {
    const data = await fetchJson<DeliveryApplicationStatusResponse>('/api/delivery/application-status');
    setStatusData(data);
    return data;
  };

  const loadJobs = async () => {
    const data = await fetchJson<DeliveryJobsResponse>('/api/delivery/jobs');
    setJobsData(data);
    return data;
  };

  const refreshAll = async () => {
    if (!user) {
      setStatusData(null);
      setJobsData(null);
      setScreenLoading(false);
      return;
    }

    setRefreshing(true);
    try {
      const deliveryStatus = await loadStatus();
      if (deliveryStatus.canAccessDashboard) {
        await loadJobs();
      } else {
        setJobsData(null);
      }
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to load delivery data.');
    } finally {
      setScreenLoading(false);
      setRefreshing(false);
    }
  };

  const refreshAllEvent = useEffectEvent(async () => {
    await refreshAll();
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    void refreshAllEvent();
  }, [loading, user?.id]);

  const sendLocation = useEffectEvent(async (position: GeolocationPosition) => {
    const now = Date.now();
    if (now - lastSentLocationAt.current < 15_000 || !activeJob?.id) {
      return;
    }

    lastSentLocationAt.current = now;
    try {
      await fetchJson(`/api/delivery/jobs/${activeJob.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      });
      setLocationMessage('Live location is updating normally.');
    } catch (error) {
      setLocationMessage(error instanceof Error ? error.message : 'Could not update live location.');
    }
  });

  useEffect(() => {
    if (!statusData) {
      return;
    }

    setFormState((current) => ({
      fullName: statusData.application?.full_name || statusData.profile?.full_name || current.fullName,
      phone: statusData.application?.phone || statusData.profile?.phone || current.phone,
      city: statusData.application?.city || current.city,
      state: statusData.application?.state || current.state,
      postalCode: statusData.application?.postal_code || current.postalCode,
      vehicleType: statusData.application?.vehicle_type || statusData.profile?.vehicle_type || current.vehicleType,
      serviceZones: statusData.application?.service_zones?.join(', ') || statusData.profile?.service_zones?.join(', ') || current.serviceZones,
      document: current.document,
    }));
  }, [statusData]);

  useEffect(() => {
    if (!activeJob || !navigator.geolocation) {
      return;
    }

    if (!['accepted', 'picked_up', 'out_for_delivery'].includes(activeJob.status)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void sendLocation(position);
      },
      (error) => {
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location access is blocked. Turn it on to share live tracking.'
            : 'Live location is not available right now.'
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activeJob]);

  const applicationTitle = useMemo(() => {
    if (statusData?.application?.status === 'rejected') return 'Update your rider application';
    if (statusData?.application?.status === 'pending') return 'Application under review';
    return 'Apply to deliver for LOKUS';
  }, [statusData?.application?.status]);

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage('');

    try {
      const body = new FormData();
      body.set('fullName', formState.fullName);
      body.set('phone', formState.phone);
      body.set('city', formState.city);
      body.set('state', formState.state);
      body.set('postalCode', formState.postalCode);
      body.set('vehicleType', formState.vehicleType);
      body.set('serviceZones', formState.serviceZones);
      if (formState.document) body.set('document', formState.document);

      await fetchJson('/api/delivery/applications', { method: 'POST', body });
      setFormMessage('Application saved. The LOKUS ops team will review it shortly.');
      await refreshAll();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to save the rider application.');
    }
  };

  const refreshJobsAfterMutation = () => {
    startTransition(() => {
      void loadJobs();
    });
  };

  const claimJob = async (jobId: number) => {
    setBusyJobId(jobId);
    setFormMessage('');
    try {
      await fetchJson(`/api/delivery/jobs/${jobId}/claim`, { method: 'POST' });
      refreshJobsAfterMutation();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to claim job.');
    } finally {
      setBusyJobId(null);
    }
  };

  const updateJobStatus = async (jobId: number, status: DeliveryJobStatus) => {
    setBusyJobId(jobId);
    setFormMessage('');
    try {
      await fetchJson(`/api/delivery/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: notesByJobId[jobId] || undefined }),
      });
      refreshJobsAfterMutation();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to update job status.');
    } finally {
      setBusyJobId(null);
    }
  };

  const verifyOtp = async (jobId: number) => {
    setBusyJobId(jobId);
    setFormMessage('');
    try {
      await fetchJson(`/api/delivery/jobs/${jobId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpByJobId[jobId] }),
      });
      setOtpByJobId((current) => ({ ...current, [jobId]: '' }));
      refreshJobsAfterMutation();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to verify delivery OTP.');
    } finally {
      setBusyJobId(null);
    }
  };

  if (loading || screenLoading) {
    return (
      <main className="section-wrap py-16">
        <div className="premium-card px-6 py-12 text-center text-sm text-[var(--color-muted-foreground)]">
          Loading the delivery workspace...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="section-wrap py-12">
        <div className="overflow-hidden rounded-[2.4rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.9),rgba(185,106,60,0.18))] px-6 py-12 text-white shadow-[var(--shadow)] md:px-10">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Delivery workspace</p>
          <h1 className="mt-5 font-display text-6xl leading-[0.92] md:text-7xl">Sign in to start delivering.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74">
            Riders use this space to apply, claim jobs, update live location, verify OTP handoff, and track weekly earnings.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/login" className="rounded-full bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full border border-white/16 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!statusData?.canAccessDashboard) {
    return (
      <main className="section-wrap py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(185,106,60,0.18))] px-6 py-10 text-white shadow-[var(--shadow)] md:px-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Become a delivery partner</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] md:text-7xl">{applicationTitle}</h1>
            <p className="mt-5 text-sm leading-7 text-white/74">
              Apply once, upload your delivery document, and our operations team will review your zones before opening the rider dashboard.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['Flexible dispatch', 'Claim open jobs or receive direct admin assignments.'],
                ['Zone payouts', 'Earnings are calculated automatically from the pincode zone rate.'],
                ['Secure handoff', 'Every successful delivery is completed with a customer OTP.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-white/68">{description}</p>
                </div>
              ))}
            </div>
            {statusData?.application?.status === 'pending' ? (
              <div className="mt-8 rounded-[1.75rem] border border-[var(--color-sand)]/30 bg-[var(--color-sand)]/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-sand)]">Pending review</p>
                <p className="mt-3 text-sm text-white/76">
                  Your application is live. We&apos;ll unlock the dashboard as soon as ops approves your profile and zones.
                </p>
              </div>
            ) : null}
            {statusData?.application?.status === 'rejected' ? (
              <div className="mt-8 rounded-[1.75rem] border border-red-400/20 bg-red-500/8 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-red-200">Needs revision</p>
                <p className="mt-3 text-sm text-white/76">
                  {statusData.application.rejection_reason || 'The ops team requested an updated application.'}
                </p>
              </div>
            ) : null}
          </section>

          <section className="premium-card p-6 md:p-8">
            <form onSubmit={submitApplication} className="space-y-5">
              {[
                ['fullName', 'Full name', 'text'],
                ['phone', 'Phone number', 'tel'],
                ['city', 'City', 'text'],
                ['state', 'State', 'text'],
                ['postalCode', 'Pincode', 'text'],
                ['vehicleType', 'Vehicle type', 'text'],
              ].map(([field, label, type]) => (
                <label key={field} className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                    {label}
                  </span>
                  <input
                    type={type}
                    required
                    value={formState[field as keyof Omit<ApplicationFormState, 'document' | 'serviceZones'>] as string}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
                  />
                </label>
              ))}
              <label className="block text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  Service zones
                </span>
                <textarea
                  required
                  rows={3}
                  value={formState.serviceZones}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      serviceZones: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
                  placeholder="Example: SOUTH_DELHI, NOIDA, GURGAON"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  Delivery document
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      document: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm"
                />
                <span className="mt-2 block text-xs text-[var(--color-muted-foreground)]">
                  Upload your ID, delivery licence, or any approval document the ops team needs.
                </span>
              </label>
              {formMessage ? <p className="text-sm text-[var(--color-ember)]">{formMessage}</p> : null}
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white"
              >
                Save application
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="section-wrap py-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(185,106,60,0.18))] px-6 py-8 text-white shadow-[var(--shadow)] md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Delivery partner</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.92] md:text-6xl">
              {jobsData?.profile.full_name || user.email?.split('@')[0] || 'Rider dashboard'}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Claim nearby orders, keep live location flowing, and close each handoff with customer OTP confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="rounded-full border border-white/14 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white"
          >
            {refreshing ? 'Refreshing...' : 'Refresh jobs'}
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['Delivered jobs', String(jobsData?.earnings.deliveredCount ?? 0)],
            ['Total earned', formatPrice((jobsData?.earnings.totalEarned ?? 0) / 100)],
            ['Awaiting payout', formatPrice((jobsData?.earnings.unpaidAmount ?? 0) / 100)],
            ['Batched', formatPrice((jobsData?.earnings.batchedAmount ?? 0) / 100)],
          ].map(([title, value]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">{title}</p>
              <p className="mt-4 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {formMessage ? (
        <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-white/88 px-5 py-4 text-sm text-[var(--color-ember)] shadow-[var(--shadow)]">
          {formMessage}
        </div>
      ) : null}
      {locationMessage ? (
        <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/88 px-5 py-4 text-sm text-[var(--color-muted-foreground)] shadow-[var(--shadow)]">
          {locationMessage}
        </div>
      ) : null}

      {activeJob ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="premium-card p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Active delivery</p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{activeJob.order_number}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{deliveryStatusLabels[activeJob.status]}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{formatDeliveryAddress(activeJob)}</p>
              </div>
              <div className="space-y-3 text-sm">
                <a href={`tel:${activeJob.customer_phone || ''}`} className="block rounded-full border border-[var(--color-border)] px-4 py-3 text-center">
                  Call customer
                </a>
                <a href={getDirectionsHref(activeJob)} target="_blank" rel="noreferrer" className="block rounded-full bg-[var(--color-foreground)] px-4 py-3 text-center text-white">
                  Open directions
                </a>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {activeJob.status === 'accepted' ? (
                <button
                  type="button"
                  disabled={busyJobId === activeJob.id}
                  onClick={() => void updateJobStatus(activeJob.id, 'picked_up')}
                  className="rounded-full bg-[var(--color-foreground)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
                >
                  Mark picked up
                </button>
              ) : null}
              {activeJob.status === 'picked_up' ? (
                <button
                  type="button"
                  disabled={busyJobId === activeJob.id}
                  onClick={() => void updateJobStatus(activeJob.id, 'out_for_delivery')}
                  className="rounded-full bg-[var(--color-foreground)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
                >
                  Mark out for delivery
                </button>
              ) : null}
              {activeJob.status === 'out_for_delivery' ? (
                <div className="md:col-span-2">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpByJobId[activeJob.id] ?? ''}
                      onChange={(event) =>
                        setOtpByJobId((current) => ({
                          ...current,
                          [activeJob.id]: event.target.value,
                        }))
                      }
                      className="rounded-full border border-[var(--color-border)] bg-white/88 px-5 py-4 text-sm outline-none transition focus:border-[var(--color-ember)]"
                      placeholder="Enter customer OTP"
                    />
                    <button
                      type="button"
                      disabled={busyJobId === activeJob.id}
                      onClick={() => void verifyOtp(activeJob.id)}
                      className="rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
                    >
                      Verify & deliver
                    </button>
                  </div>
                </div>
              ) : null}
              <textarea
                rows={3}
                value={notesByJobId[activeJob.id] ?? ''}
                onChange={(event) =>
                  setNotesByJobId((current) => ({
                    ...current,
                    [activeJob.id]: event.target.value,
                  }))
                }
                className="md:col-span-2 rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-ember)]"
                placeholder="Add a note if the attempt fails or the order is returned."
              />
              {['accepted', 'picked_up', 'out_for_delivery'].includes(activeJob.status) ? (
                <button
                  type="button"
                  disabled={busyJobId === activeJob.id}
                  onClick={() => void updateJobStatus(activeJob.id, 'failed_delivery')}
                  className="rounded-full border border-[var(--color-border)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)] disabled:opacity-60"
                >
                  Mark failed attempt
                </button>
              ) : null}
            </div>
            <div className="mt-6">
              <DeliveryTimeline job={activeJob} />
            </div>
          </div>

          <LiveMapCard job={activeJob} title="Live rider signal" />
        </section>
      ) : null}

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Claimable work</p>
            <h2 className="mt-3 font-display text-5xl">Available jobs</h2>
          </div>
          {!jobsData?.availableJobs.length ? (
            <div className="premium-card px-6 py-10 text-sm text-[var(--color-muted-foreground)]">
              No claimable jobs are open in your zones right now.
            </div>
          ) : (
            <div className="space-y-4">
              {jobsData.availableJobs.map((job) => (
                <div key={job.id} className="premium-card p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Zone {job.zone_name || 'Unmapped'}</p>
                      <h3 className="mt-3 text-2xl font-semibold">{job.order_number}</h3>
                      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{formatDeliveryAddress(job)}</p>
                      <p className="mt-3 text-sm">Payout {formatPrice(job.payout_amount / 100)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busyJobId === job.id}
                      onClick={() => void claimJob(job.id)}
                      className="rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
                    >
                      Claim job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Profile</p>
            <h2 className="mt-3 font-display text-5xl">Rider details</h2>
          </div>
          <div className="premium-card p-6">
            <p className="text-sm text-[var(--color-muted-foreground)]">{jobsData?.profile.email || user.email}</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/72 px-4 py-4">
                <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-foreground)]">Phone</span>
                <span className="mt-2 block">{jobsData?.profile.phone || 'Not set'}</span>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/72 px-4 py-4">
                <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-foreground)]">Vehicle</span>
                <span className="mt-2 block">{jobsData?.profile.vehicle_type || 'Not set'}</span>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/72 px-4 py-4">
                <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-foreground)]">Zones</span>
                <span className="mt-2 block">{jobsData?.profile.service_zones?.join(', ') || 'No zones assigned'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Weekly payouts</p>
              <h2 className="mt-3 font-display text-5xl">Earnings</h2>
            </div>
            {!jobsData?.payoutBatches.length ? (
              <div className="premium-card px-6 py-10 text-sm text-[var(--color-muted-foreground)]">
                No payout batches yet. Delivered jobs move into weekly settlement once admin closes a batch.
              </div>
            ) : (
              <div className="space-y-4">
                {jobsData.payoutBatches.map((batch) => (
                  <div key={batch.id} className="premium-card p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">{batch.status}</p>
                    <h3 className="mt-3 text-xl font-semibold">{batch.batch_label}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                      {batch.period_start || 'Open'} to {batch.period_end || 'Current'}
                    </p>
                    <p className="mt-3 text-sm">{formatPrice(batch.total_amount / 100)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Assigned work</p>
          <h2 className="mt-3 font-display text-5xl">My jobs</h2>
        </div>
        {!jobsData?.myJobs.length ? (
          <div className="premium-card px-6 py-10 text-sm text-[var(--color-muted-foreground)]">
            Once you claim or receive a dispatch, it will appear here with the full delivery timeline.
          </div>
        ) : (
          <div className="space-y-5">
            {jobsData.myJobs.map((job) => (
              <div key={job.id} className="premium-card p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                      {job.assignment_mode?.replaceAll('_', ' ') || 'assigned'}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">{job.order_number}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{deliveryStatusLabels[job.status]}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{formatDeliveryAddress(job)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {job.status === 'assigned' ? (
                      <button
                        type="button"
                        disabled={busyJobId === job.id}
                        onClick={() => void updateJobStatus(job.id, 'accepted')}
                        className="rounded-full bg-[var(--color-foreground)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
                      >
                        Accept
                      </button>
                    ) : null}
                    {job.customer_phone ? (
                      <a href={`tel:${job.customer_phone}`} className="rounded-full border border-[var(--color-border)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]">
                        Call
                      </a>
                    ) : null}
                    <a href={getDirectionsHref(job)} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--color-border)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]">
                      Navigate
                    </a>
                  </div>
                </div>
                <div className="mt-5">
                  <DeliveryTimeline job={job} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
