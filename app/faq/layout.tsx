import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nur — Frequently asked questions',
  description:
    'Everything you need to know about Nur, its features and the experience we are building.',
};

export default function FaqLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
