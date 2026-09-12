import type { Metadata } from 'next';
import './globals.css';
import ScrollReveal from '../components/ScrollReveal';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Nur — A calmer way to practice',
  description: SITE_DESCRIPTION,
  keywords: [
    'Nur',
    'prayer times app',
    'Quran app',
    'Athkar app',
    'Qibla compass',
    'Tasbeeh counter',
    'Muslim prayer app',
    'Islamic app',
  ],
  authors: [{ name: 'eyadmaherrr', url: 'https://instagram.com/eyadmaherrr' }],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Nur — A calmer way to practice',
    description: SITE_DESCRIPTION,
    images: OG_IMAGE,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nur — A calmer way to practice',
    description: SITE_DESCRIPTION,
    images: OG_IMAGE,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description: SITE_DESCRIPTION,
  sameAs: ['https://instagram.com/eyadmaherrr'],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}