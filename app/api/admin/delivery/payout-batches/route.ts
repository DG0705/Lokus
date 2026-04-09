import { NextResponse } from 'next/server';

import { hydrateDeliveryJobs, recordDeliveryEvent } from '@/app/lib/delivery-server';
import { jsonError } from '@/app/lib/http';
import { requireAdminActor, HttpError } from '@/app/lib/server-auth';
import type { AdminDeliveryPayoutsResponse, DeliveryJob, DeliveryPayoutBatch, DeliveryPayoutItem } from '@/app/lib/types';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    const [{ data: batchesData, error: batchesError }, { data: pendingData, error: pendingError }] = await Promise.all([
      actor.supabase.from('delivery_payout_batches').select('*').order('created_at', { ascending: false }),
      actor.supabase
        .from('delivery_jobs')
        .select('*')
        .eq('status', 'delivered')
        .eq('payout_status', 'unpaid')
        .order('delivered_at', { ascending: true }),
    ]);

    if (batchesError) {
      throw batchesError;
    }

    if (pendingError) {
      throw pendingError;
    }

    const pendingJobs = await hydrateDeliveryJobs(actor.supabase, (pendingData as DeliveryJob[] | null) ?? []);
    const response: AdminDeliveryPayoutsResponse = {
      batches: (batchesData as DeliveryPayoutBatch[] | null) ?? [],
      pendingJobs,
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error, 'Failed to load payout batches.');
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminActor();
    const payload = (await request.json()) as {
      action?: 'create' | 'mark_paid';
      batchId?: number;
      batchLabel?: string;
      periodStart?: string;
      periodEnd?: string;
      notes?: string;
    };

    if (payload.action === 'mark_paid') {
      if (!payload.batchId) {
        throw new HttpError(400, 'Choose a payout batch to settle.');
      }

      const { data: items, error: itemsError } = await actor.supabase
        .from('delivery_payout_items')
        .select('*')
        .eq('payout_batch_id', payload.batchId);

      if (itemsError) {
        throw itemsError;
      }

      const payoutItems = (items as DeliveryPayoutItem[] | null) ?? [];
      const now = new Date().toISOString();

      const { error: batchError } = await actor.supabase
        .from('delivery_payout_batches')
        .update({
          status: 'paid',
          settled_at: now,
          notes: payload.notes?.trim() || null,
        })
        .eq('id', payload.batchId);

      if (batchError) {
        throw batchError;
      }

      if (payoutItems.length) {
        const jobIds = payoutItems.map((item) => item.job_id);
        const { error: itemsUpdateError } = await actor.supabase
          .from('delivery_payout_items')
          .update({
            status: 'paid',
            paid_at: now,
          })
          .eq('payout_batch_id', payload.batchId);

        if (itemsUpdateError) {
          throw itemsUpdateError;
        }

        const { data: jobs, error: jobsError } = await actor.supabase.from('delivery_jobs').select('*').in('id', jobIds);
        if (jobsError) {
          throw jobsError;
        }

        const { error: jobUpdateError } = await actor.supabase
          .from('delivery_jobs')
          .update({
            payout_status: 'paid',
          })
          .in('id', jobIds);

        if (jobUpdateError) {
          throw jobUpdateError;
        }

        for (const job of (jobs as DeliveryJob[] | null) ?? []) {
          await recordDeliveryEvent(actor.supabase, {
            jobId: job.id,
            orderId: job.order_id,
            actorUserId: actor.user.id,
            eventType: 'payout_paid',
            metadata: {
              payout_batch_id: payload.batchId,
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    let query = actor.supabase
      .from('delivery_jobs')
      .select('*')
      .eq('status', 'delivered')
      .eq('payout_status', 'unpaid')
      .order('delivered_at', { ascending: true });

    if (payload.periodStart) {
      query = query.gte('delivered_at', new Date(payload.periodStart).toISOString());
    }

    if (payload.periodEnd) {
      query = query.lte('delivered_at', new Date(payload.periodEnd).toISOString());
    }

    const { data: jobsData, error: jobsError } = await query;
    if (jobsError) {
      throw jobsError;
    }

    const jobs = (jobsData as DeliveryJob[] | null) ?? [];
    if (!jobs.length) {
      throw new HttpError(400, 'There are no unpaid delivered jobs for this payout batch.');
    }

    const totalAmount = jobs.reduce((sum, job) => sum + job.payout_amount, 0);
    const partnerCount = new Set(jobs.map((job) => job.assigned_partner_id).filter(Boolean)).size;
    const batchInsert = {
      batch_label: payload.batchLabel?.trim() || `Weekly payouts ${new Date().toLocaleDateString('en-IN')}`,
      status: 'queued',
      period_start: payload.periodStart ?? null,
      period_end: payload.periodEnd ?? null,
      total_amount: totalAmount,
      partner_count: partnerCount,
      payout_count: jobs.length,
      notes: payload.notes?.trim() || null,
      created_by: actor.user.id,
    };

    const { data: batch, error: batchError } = await actor.supabase
      .from('delivery_payout_batches')
      .insert(batchInsert)
      .select('*')
      .single();

    if (batchError) {
      throw batchError;
    }

    const payoutItems = jobs
      .filter((job) => job.assigned_partner_id)
      .map((job) => ({
        payout_batch_id: batch.id,
        job_id: job.id,
        partner_id: job.assigned_partner_id as string,
        amount: job.payout_amount,
        status: 'batched',
      }));

    if (payoutItems.length) {
      const { error: itemsInsertError } = await actor.supabase.from('delivery_payout_items').insert(payoutItems);
      if (itemsInsertError) {
        throw itemsInsertError;
      }
    }

    const { error: jobUpdateError } = await actor.supabase
      .from('delivery_jobs')
      .update({
        payout_status: 'batched',
        payout_batch_id: batch.id,
      })
      .in(
        'id',
        jobs.map((job) => job.id)
      );

    if (jobUpdateError) {
      throw jobUpdateError;
    }

    for (const job of jobs) {
      await recordDeliveryEvent(actor.supabase, {
        jobId: job.id,
        orderId: job.order_id,
        actorUserId: actor.user.id,
        eventType: 'payout_batched',
        metadata: {
          payout_batch_id: batch.id,
          payout_amount: job.payout_amount,
        },
      });
    }

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    return jsonError(error, 'Failed to update payout batches.');
  }
}
