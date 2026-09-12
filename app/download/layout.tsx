import type { Metadata } from 'next';
import { OG_IMAGE } from '../../lib/site';

const title = 'Download Nur — Coming soon';
const description =
  'Nur is coming to iOS and Android. Join the waitlist to be notified the moment it lands.';

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
