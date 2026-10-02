import type { Metadata } from 'next';
import { OG_IMAGE } from '../../lib/site';

const title = 'Download Nur — Prayer Times, Quran & Qibla App';
const description =
  'Download Nur, a Muslim prayer times, Quran and Qibla app, on Google Play for Android. iOS is coming soon — join the waitlist to be notified.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/download' },
  openGraph: { title, description, url: '/download', images: OG_IMAGE, type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: OG_IMAGE },
};

export default function DownloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
