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

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.error('RESEND_AUDIENCE_ID is not set');
    return NextResponse.json({ error: 'Waitlist is not configured' }, { status: 500 });
  }

  const resend = getResend();

  // Upsert into the audience (Resend treats a repeat email as an update, not
  // an error) so this is the durable record — then send a confirmation.
  const contact = await resend.contacts.create({
    email,
    audienceId,
    unsubscribed: false,
  });

  if (contact.error) {
    console.error('Resend contact create failed:', contact.error);
    return NextResponse.json(
      { error: 'Could not join the waitlist. Please try again.' },
      { status: 502 },
    );
  }

  const confirmation = await resend.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: "You're on the Nur waitlist",
    html: `
      <p>Salaam,</p>
      <p>You're on the list — we'll email this address the moment Nur launches.</p>
      <p>No spam, unsubscribe anytime.</p>
      <p>— Nur</p>
    `,
  });

  if (confirmation.error) {
    // The contact is already saved, which is the part that matters — a
    // failed confirmation email shouldn't fail the whole signup.
    console.error('Resend confirmation email failed:', confirmation.error);
  }

  return NextResponse.json({ ok: true });
}
