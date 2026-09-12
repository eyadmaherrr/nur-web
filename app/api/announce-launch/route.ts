import { NextResponse } from 'next/server';
import { getResend, RESEND_FROM } from '../../../lib/resend';

type Platform = 'ios' | 'android' | 'both';

/**
 * Sends the "Nur is out now" announcement to the whole waitlist audience via
 * a Resend Broadcast. This is triggered manually (see the `platform` body
 * param) — there's no App Store / Google Play webhook to fire this
 * automatically, so whoever ships the release calls this once, with proof
 * they mean it (the bearer secret).
 */
export async function POST(request: Request) {
  const secret = process.env.LAUNCH_ANNOUNCE_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return NextResponse.json({ error: 'RESEND_AUDIENCE_ID is not set' }, { status: 500 });
  }

  let platform: Platform = 'both';
  try {
    const body = await request.json();
    if (body?.platform === 'ios' || body?.platform === 'android') platform = body.platform;
  } catch {
    // No body / not JSON — default to announcing both platforms.
  }

  const googlePlayUrl = process.env.GOOGLE_PLAY_URL;
  const appleAppStoreUrl = process.env.APPLE_APP_STORE_URL;

  const links: string[] = [];
  if (platform !== 'android' && appleAppStoreUrl) {
    links.push(`<p><a href="${appleAppStoreUrl}">Get Nur on the App Store</a></p>`);
  }
  if (platform !== 'ios' && googlePlayUrl) {
    links.push(`<p><a href="${googlePlayUrl}">Get Nur on Google Play</a></p>`);
  }

  if (links.length === 0) {
    return NextResponse.json(
      { error: 'No store URL is configured for the requested platform(s)' },
      { status: 400 },
    );
  }

  const resend = getResend();

  const broadcast = await resend.broadcasts.create({
    audienceId,
    from: RESEND_FROM,
    subject: 'Nur is here',
    name: `Launch announcement (${platform})`,
    html: `
      <p>Salaam,</p>
      <p>Nur is out now — thank you for waiting.</p>
      ${links.join('\n')}
      <p>— Nur</p>
    `,
    send: true,
  });

  if (broadcast.error) {
    console.error('Resend broadcast failed:', broadcast.error);
    return NextResponse.json({ error: broadcast.error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, broadcastId: broadcast.data?.id });
}
