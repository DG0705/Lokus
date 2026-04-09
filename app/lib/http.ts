import { NextResponse } from 'next/server';

import { HttpError } from '@/app/lib/server-auth';

export function jsonError(error: unknown, fallbackMessage = 'Request failed.') {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}

export function parseNumericRouteParam(value: string, label = 'id') {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, `Invalid ${label}.`);
  }

  return parsed;
}
