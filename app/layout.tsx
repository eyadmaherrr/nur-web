import type { Metadata } from 'next';
import './globals.css';
import ScrollReveal from '../components/ScrollReveal';

export const metadata: Metadata = {
  title: 'Nur — A calmer way to practice',
  description:
    'Prayer times, Quran, Athkar and Qibla — brought together in one quiet companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}