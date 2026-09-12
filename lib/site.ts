import type { Metadata } from 'next';

export const SITE_URL = 'https://downloadnur.com';
export const SITE_NAME = 'Nur';
export const SITE_DESCRIPTION =
  'Nur is a calm, focused prayer companion for iOS and Android — prayer times, Quran, Athkar, Tasbeeh and Qibla brought together in one quiet experience. Try the interactive demo on the web.';

/**
 * Next.js does not deep-merge `openGraph`/`twitter` between a layout and its
 * child — a page-level override replaces the whole object, so every page
 * that sets its own title/description must spread this back in or lose the
 * shared OG image and card type.
 */
export const OG_IMAGE: NonNullable<Metadata['openGraph']>['images'] = [
  { url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME },
];
