import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Nur — Coming soon',
  description:
    'Nur is coming to iOS and Android. Join the waitlist to be notified the moment it lands.',
};

export default function DownloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
