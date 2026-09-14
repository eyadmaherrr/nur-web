import type { Metadata } from 'next';
import { OG_IMAGE } from '../../lib/site';

const title = 'Nur — Privacy Policy';
const description =
  'How Nur handles your data: what stays on your device, what a few third-party services see, and why.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: '/privacy', images: OG_IMAGE, type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: OG_IMAGE },
};

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
