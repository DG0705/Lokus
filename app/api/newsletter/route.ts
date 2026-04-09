import { NextRequest, NextResponse } from 'next/server';

import { sendOfficialMail } from '@/app/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await sendOfficialMail({
      to: process.env.MAIL_TO_SUPPORT || 'support@lokus.store',
      subject: 'New LOKUS newsletter signup',
      replyTo: email,
      text: `Newsletter signup received from ${email}.`,
      html: `<p>Newsletter signup received from <strong>${email}</strong>.</p>`,
    });

    await sendOfficialMail({
      to: email,
      subject: 'You are on the LOKUS list',
      text: 'Thanks for joining the LOKUS list. You will hear from us about new drops, notes, and launch alerts.',
      html: `
        <p>Thanks for joining the <strong>LOKUS</strong> list.</p>
        <p>You will hear from us about new drops, notes, and launch alerts.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter mail error:', error);
    return NextResponse.json(
      { error: 'Official LOKUS mail is not configured yet. Add SMTP settings to enable newsletter emails.' },
      { status: 500 }
    );
  }
}
