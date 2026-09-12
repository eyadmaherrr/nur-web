import { Resend } from 'resend';

let client: Resend | null = null;

/** Lazily-created Resend client — avoids throwing at import time in envs without the key set. */
export function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    client = new Resend(apiKey);
  }
  return client;
}

export const RESEND_FROM = process.env.RESEND_FROM || 'Nur <hello@downloadnur.com>';
