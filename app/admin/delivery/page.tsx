'use client';

import { useEffect, useState } from 'react';

import { LiveMapCard } from '@/app/components/delivery/LiveMapCard';
import { DeliveryTimeline } from '@/app/components/delivery/DeliveryTimeline';
import { deliveryStatusLabels, formatDeliveryAddress } from '@/app/lib/delivery';
import { formatPrice } from '@/app/lib/format';
import type {
  AdminDeliveryApplicationsResponse,
  AdminDeliveryJobsResponse,
  AdminDeliveryPayoutsResponse,
  AdminDeliveryZoneRatesResponse,
} from '@/app/lib/types';

type ZoneRateDraft = {
  zoneName: string;
  postalCodes: string;
  rateAmount: string;
};

const initialZoneRateDraft: ZoneRateDraft = {
  zoneName: '',
  postalCodes: '',
  rateAmount: '',
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export default function AdminDeliveryPage() {
  const [applications, setApplications] = useState<AdminDeliveryApplicationsResponse['applications']>([]);
  const [jobs, setJobs] = useState<AdminDeliveryJobsResponse['jobs']>([]);
  const [partners, setPartners] = useState<AdminDeliveryJobsResponse['partners']>([]);
  const [zoneRates, setZoneRates] = useState<AdminDeliveryZoneRatesResponse['zoneRates']>([]);
  const [batches, setBatches] = useState<AdminDeliveryPayoutsResponse['batches']>([]);
  const [pendingJobs, setPendingJobs] = useState<AdminDeliveryPayoutsResponse['pendingJobs']>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [zoneRateDraft, setZoneRateDraft] = useState<ZoneRateDraft>(initialZoneRateDraft);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [applicationsData, jobsData, zoneRatesData, payoutsData] = await Promise.all([
        fetchJson<AdminDeliveryApplicationsResponse>('/api/admin/delivery/applications'),
        fetchJson<AdminDeliveryJobsResponse>('/api/admin/delivery/jobs'),
        fetchJson<AdminDeliveryZoneRatesResponse>('/api/admin/delivery/zone-rates'),
        fetchJson<AdminDeliveryPayoutsResponse>('/api/admin/delivery/payout-batches'),
      ]);

      setApplications(applicationsData.applications);
      setJobs(jobsData.jobs);
      setPartners(jobsData.partners);
      setZoneRates(zoneRatesData.zoneRates);
      setBatches(payoutsData.batches);
      setPendingJobs(payoutsData.pendingJobs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load delivery operations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  const approveApplication = async (applicationId: number) => {
    setBusyId(applicationId);
    setMessage('');
    try {
      await fetchJson(`/api/admin/delivery/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: reviewNotes[applicationId] || undefined,
        }),
      });
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to approve application.');
    } finally {
      setBusyId(null);
    }
  };

  const rejectApplication = async (applicationId: number) => {
    setBusyId(applicationId);
    setMessage('');
    try {
      await fetchJson(`/api/admin/delivery/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: reviewNotes[applicationId] || undefined,
          rejectionReason: rejectionReasons[applicationId] || undefined,
        }),
      });
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to reject application.');
    } finally {
      setBusyId(null);
    }
  };

  const assignJob = async (jobId: number) => {
    setBusyId(jobId);
    setMessage('');
    try {
      await fetchJson(`/api/admin/delivery/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: assignments[jobId],
        }),
      });
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to assign delivery job.');
    } finally {
      setBusyId(null);
    }
  };

  const saveZoneRate = async () => {
    setBusyId('zone-rate');
    setMessage('');
    try {
      await fetchJson('/api/admin/delivery/zone-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zoneRateDraft.zoneName,
          postalCodes: zoneRateDraft.postalCodes,
          rateAmount: Number(zoneRateDraft.rateAmount),
        }),
      });
      setZoneRateDraft(initialZoneRateDraft);
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save zone rate.');
    } finally {
      setBusyId(null);
    }
  };

  const createBatch = async () => {
    setBusyId('create-batch');
    setMessage('');
    try {
      await fetchJson('/api/admin/delivery/payout-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create payout batch.');
    } finally {
      setBusyId(null);
    }
  };

  const markBatchPaid = async (batchId: number) => {
    setBusyId(batchId);
    setMessage('');
    try {
      await fetchJson('/api/admin/delivery/payout-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_paid',
          batchId,
        }),
      });
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to mark batch as paid.');
    } finally {
      setBusyId(null);
    }
  };

  const activeTrackedJobs = jobs.filter((job) => ['accepted', 'picked_up', 'out_for_delivery'].includes(job.status));

  if (loading) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500">Loading delivery operations...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Operations</p>
          <h1 className="mt-2 font-display text-6xl">Delivery</h1>
        </div>
        <button
          type="button"
          onClick={() => void refreshAll()}
          className="rounded-full border border-stone-200 bg-white px-5 py-3 text-xs uppercase tracking-[0.18em] text-stone-700"
        >
          Refresh board
        </button>
      </div>

      {message ? (
        <div className="mb-6 rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 text-sm text-[var(--color-ember)] shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-4">
        {[
          ['Applications', String(applications.length)],
          ['Open jobs', String(jobs.filter((job) => job.status === 'ready_to_dispatch').length)],
          ['Tracked jobs', String(activeTrackedJobs.length)],
          ['Unpaid payouts', formatPrice(pendingJobs.reduce((sum, job) => sum + job.payout_amount, 0) / 100)],
        ].map(([title, value]) => (
          <div key={title} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{title}</p>
            <p className="mt-5 font-display text-5xl">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Rider onboarding</p>
          <h2 className="mt-2 font-display text-5xl">Applications</h2>
        </div>
        <div className="space-y-4">
          {!applications.length ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300 px-6 py-10 text-center text-sm text-stone-500">
              No rider applications yet.
            </div>
          ) : null}
          {applications.map((application) => (
            <div key={application.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{application.status}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{application.full_name}</h3>
                  <p className="mt-2 text-sm text-stone-500">{application.profile?.email || 'No email'}</p>
                  <p className="mt-3 text-sm">Phone: {application.phone}</p>
                  <p className="mt-1 text-sm">Vehicle: {application.vehicle_type}</p>
                  <p className="mt-1 text-sm">Zones: {application.service_zones.join(', ') || 'Not set'}</p>
                  <p className="mt-1 text-sm">Coverage: {application.city}, {application.state} {application.postal_code}</p>
                </div>
                <div className="w-full max-w-md space-y-3">
                  <textarea
                    rows={3}
                    value={reviewNotes[application.id] ?? application.admin_notes ?? ''}
                    onChange={(event) =>
                      setReviewNotes((current) => ({
                        ...current,
                        [application.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                    placeholder="Internal review note"
                  />
                  <input
                    type="text"
                    value={rejectionReasons[application.id] ?? application.rejection_reason ?? ''}
                    onChange={(event) =>
                      setRejectionReasons((current) => ({
                        ...current,
                        [application.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                    placeholder="Rejection reason if needed"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={busyId === application.id}
                      onClick={() => void approveApplication(application.id)}
                      className="flex-1 rounded-full bg-stone-950 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === application.id}
                      onClick={() => void rejectApplication(application.id)}
                      className="flex-1 rounded-full border border-stone-200 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Dispatch</p>
            <h2 className="mt-2 font-display text-5xl">Jobs board</h2>
          </div>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{deliveryStatusLabels[job.status]}</p>
                    <h3 className="mt-3 text-2xl font-semibold">{job.order_number}</h3>
                    <p className="mt-3 text-sm text-stone-500">{formatDeliveryAddress(job)}</p>
                    <p className="mt-3 text-sm">Zone: {job.zone_name || 'Unmapped'}</p>
                    <p className="mt-1 text-sm">Payout: {formatPrice(job.payout_amount / 100)}</p>
                    <p className="mt-1 text-sm">Rider: {job.assigned_partner?.full_name || 'Unassigned'}</p>
                  </div>
                  <div className="w-full max-w-sm space-y-3">
                    <select
                      value={assignments[job.id] ?? job.assigned_partner_id ?? ''}
                      onChange={(event) =>
                        setAssignments((current) => ({
                          ...current,
                          [job.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Select partner</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.full_name || partner.email || partner.id}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busyId === job.id || !assignments[job.id]}
                      onClick={() => void assignJob(job.id)}
                      className="w-full rounded-full bg-stone-950 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
                    >
                      Assign rider
                    </button>
                  </div>
                </div>
                <div className="mt-5">
                  <DeliveryTimeline job={job} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Live map</p>
              <h2 className="mt-2 font-display text-5xl">Tracked jobs</h2>
            </div>
            {!activeTrackedJobs.length ? (
              <div className="rounded-[2rem] border border-dashed border-stone-300 px-6 py-10 text-center text-sm text-stone-500">
                No active tracked jobs right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeTrackedJobs.slice(0, 3).map((job) => (
                  <LiveMapCard key={job.id} job={job} title={`${job.order_number} live signal`} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Zone payout rules</p>
            <h2 className="mt-3 text-2xl font-semibold">Rates</h2>
            <div className="mt-5 space-y-3">
              {zoneRates.map((zoneRate) => (
                <div key={zoneRate.id} className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{zoneRate.zone_name}</span>
                    <span>{formatPrice(zoneRate.rate_amount / 100)}</span>
                  </div>
                  <p className="mt-2 text-stone-500">{zoneRate.postal_codes.join(', ')}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              <input
                type="text"
                value={zoneRateDraft.zoneName}
                onChange={(event) => setZoneRateDraft((current) => ({ ...current, zoneName: event.target.value }))}
                className="rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                placeholder="Zone name"
              />
              <textarea
                rows={3}
                value={zoneRateDraft.postalCodes}
                onChange={(event) => setZoneRateDraft((current) => ({ ...current, postalCodes: event.target.value }))}
                className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                placeholder="Postal codes separated by commas"
              />
              <input
                type="number"
                min="0"
                value={zoneRateDraft.rateAmount}
                onChange={(event) => setZoneRateDraft((current) => ({ ...current, rateAmount: event.target.value }))}
                className="rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                placeholder="Payout amount in paise"
              />
              <button
                type="button"
                disabled={busyId === 'zone-rate'}
                onClick={() => void saveZoneRate()}
                className="rounded-full bg-stone-950 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
              >
                Save zone rate
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Weekly settlement</p>
            <h2 className="mt-2 font-display text-5xl">Payouts</h2>
          </div>
          <button
            type="button"
            disabled={busyId === 'create-batch' || !pendingJobs.length}
            onClick={() => void createBatch()}
            className="rounded-full bg-stone-950 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            Create payout batch
          </button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Ready for settlement</p>
            <div className="mt-5 space-y-3">
              {!pendingJobs.length ? (
                <p className="text-sm text-stone-500">No delivered jobs are waiting for weekly settlement.</p>
              ) : null}
              {pendingJobs.map((job) => (
                <div key={job.id} className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span>{job.order_number}</span>
                    <span>{formatPrice(job.payout_amount / 100)}</span>
                  </div>
                  <p className="mt-2 text-stone-500">{job.assigned_partner?.full_name || 'Unassigned rider'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Batches</p>
            <div className="mt-5 space-y-3">
              {!batches.length ? <p className="text-sm text-stone-500">No payout batches created yet.</p> : null}
              {batches.map((batch) => (
                <div key={batch.id} className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{batch.batch_label}</p>
                      <p className="mt-2 text-stone-500">
                        {batch.period_start || 'Open'} to {batch.period_end || 'Current'}
                      </p>
                      <p className="mt-2 text-stone-500">{batch.payout_count} jobs • {batch.partner_count} partners</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(batch.total_amount / 100)}</p>
                      <p className="mt-2 text-stone-500">{batch.status}</p>
                    </div>
                  </div>
                  {batch.status !== 'paid' ? (
                    <button
                      type="button"
                      disabled={busyId === batch.id}
                      onClick={() => void markBatchPaid(batch.id)}
                      className="mt-4 rounded-full bg-stone-950 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
                    >
                      Mark paid
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
