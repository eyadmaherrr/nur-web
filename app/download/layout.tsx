import type { Metadata } from 'next';
import { OG_IMAGE } from '../../lib/site';

const title = 'Download Nur — Prayer Times, Quran & Qibla App';
const description =
  'Nur, a Muslim prayer times, Quran and Qibla app, is coming to iOS and Android. Join the waitlist to be notified the moment it launches.';

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
