import { NextResponse } from 'next/server';
import { getResend, RESEND_FROM } from '../../../lib/resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const resend = getResend();

  const confirmation = resend.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: "You're on the Nur waitlist",
    html: `
      <p>Salaam,</p>
      <p>You're on the list — we'll email this address the moment Nur lands on Google Play.</p>
      <p>No spam, unsubscribe anytime by replying to this email.</p>
      <p>— Nur</p>
    `,
  });

  const ownerEmail = process.env.WAITLIST_OWNER_EMAIL;
  const notifyOwner = ownerEmail
    ? resend.emails.send({
        from: RESEND_FROM,
        to: ownerEmail,
        subject: 'New Nur waitlist signup',
        html: `<p>New waitlist signup: <strong>${email}</strong></p>`,
      })
    : Promise.resolve();

  const [confirmationResult, notifyOwnerResult] = await Promise.allSettled([
    confirmation,
    notifyOwner,
  ]);

  if (notifyOwnerResult.status === 'rejected') {
    console.error('Resend owner-notification email failed:', notifyOwnerResult.reason);
  }

  if (confirmationResult.status === 'rejected') {
    console.error('Resend confirmation email failed:', confirmationResult.reason);
    return NextResponse.json(
      { error: 'Could not send confirmation email. Please try again.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
