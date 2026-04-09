import { NextRequest, NextResponse } from 'next/server';

import { escapeHtml, sendOfficialMail } from '@/app/lib/mailer';

type ContactRequest = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ContactRequest;

    await sendOfficialMail({
      to: process.env.MAIL_TO_SUPPORT || 'support@lokus.store',
      subject: `LOKUS Contact: ${payload.subject}`,
      replyTo: payload.email,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\n\n${payload.message}`,
      html: `
        <h2>New message for LOKUS</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
        <p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>
      `,
    });

    await sendOfficialMail({
      to: payload.email,
      subject: 'We received your message | LOKUS',
      text: `Hi ${payload.name},\n\nWe received your message and the LOKUS team will reply soon.\n\nSubject: ${payload.subject}\n\n- LOKUS`,
      html: `
        <p>Hi ${escapeHtml(payload.name)},</p>
        <p>We received your message and the LOKUS team will reply soon.</p>
        <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
        <p>- LOKUS</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact mail error:', error);
    return NextResponse.json(
      { error: 'Official LOKUS mail is not configured yet. Add SMTP settings to enable this form.' },
      { status: 500 }
    );
  }
}
