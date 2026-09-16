import type { Metadata } from 'next';
import faq from '../../data/faq.json';
import { OG_IMAGE } from '../../lib/site';

const title = 'Nur FAQ — Prayer Times, Quran, Athkar & Qibla App';
const description =
  "Answers about Nur's Islamic prayer times, Quran audio and reciters, Athkar reminders, the Qibla compass, notifications, and platform availability.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/faq' },
  openGraph: { title, description, url: '/faq', images: OG_IMAGE, type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: OG_IMAGE },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (faq as { question: string; answer: string }[]).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function FaqLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
