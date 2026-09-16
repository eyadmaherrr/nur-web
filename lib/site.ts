import type { Metadata } from 'next';

export const SITE_URL = 'https://downloadnur.com';
export const SITE_NAME = 'Nur';
export const SITE_DESCRIPTION =
  'Nur is a Muslim prayer app for iOS and Android — accurate prayer times, a Quran reader with audio, guided Athkar (dhikr), a Tasbeeh counter, and a live Qibla compass, all in one calm, distraction-free design. Try the interactive demo online.';

export const SITE_KEYWORDS = [
  'Nur app',
  'prayer times app',
  'Muslim prayer times',
  'Salah times app',
  'Quran app',
  'Quran reader',
  'Athkar app',
  'dhikr app',
  'Qibla compass',
  'Qibla direction finder',
  'Tasbeeh counter',
  'Muslim prayer app',
  'Islamic app',
];

/**
 * Next.js does not deep-merge `openGraph`/`twitter` between a layout and its
 * child — a page-level override replaces the whole object, so every page
 * that sets its own title/description must spread this back in or lose the
 * shared OG image and card type.
 */
export const OG_IMAGE: NonNullable<Metadata['openGraph']>['images'] = [
  { url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME },
];
