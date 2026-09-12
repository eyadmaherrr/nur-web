import { NextResponse } from 'next/server';
import { getResend, RESEND_FROM } from '../../../lib/resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Resend caps total recipients (to + cc + bcc) per call at 50 — stay well under it.
const BATCH_SIZE = 45;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Sends the "Nur is on Google Play" announcement to every address in the
 * request body, BCC'd in batches. There is no persistent subscriber list
 * (the Resend key on this project is sending-only, so Audiences/Contacts
 * aren't available) — the caller supplies the recipient list, e.g. exported
 * from the "New Nur waitlist signup" notification emails.
 */
export async function POST(request: Request) {
  const secret = process.env.LAUNCH_ANNOUNCE_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let recipients: unknown;
  try {
    ({ recipients } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: '"recipients" must be a non-empty array' }, { status: 400 });
  }

  const emails = [...new Set(recipients)].filter(
    (r): r is string => typeof r === 'string' && EMAIL_RE.test(r),
  );
  if (emails.length === 0) {
    return NextResponse.json({ error: 'No valid email addresses in "recipients"' }, { status: 400 });
  }

  const playUrl = process.env.GOOGLE_PLAY_URL || 'https://play.google.com/store/apps';
  const resend = getResend();

  const batches = chunk(emails, BATCH_SIZE);
  const results = await Promise.allSettled(
    batches.map((bcc) =>
      resend.emails.send({
        from: RESEND_FROM,
        to: RESEND_FROM,
        bcc,
        subject: 'Nur is now on Google Play',
        html: `
          <p>Salaam,</p>
          <p>Nur is live on Google Play — thank you for waiting.</p>
          <p><a href="${playUrl}">Get Nur on Google Play</a></p>
          <p>— Nur</p>
        `,
      }),
    ),
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.error('Some announcement batches failed:', failed);
  }

  return NextResponse.json({
    ok: failed.length === 0,
    recipients: emails.length,
    batches: batches.length,
    failedBatches: failed.length,
  });
}
