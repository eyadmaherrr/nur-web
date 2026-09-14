import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revealDelay } from '../../lib/reveal';

const UPDATED = 'September 2026';

const SECTIONS = [
  {
    title: 'What stays on your device',
    body: (
      <>
        Your settings, favourites, Quran bookmarks and reading progress,
        athkar completion history, and Tasbeeh counts are all stored locally
        on your device. We don&apos;t have a server that collects or stores
        this information, and we can&apos;t see it.
      </>
    ),
  },
  {
    title: 'Location',
    body: (
      <>
        If you enable it, Nur uses your device&apos;s location to calculate
        accurate prayer times and to point you toward the Qibla. Your
        coordinates are sent to{' '}
        <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer">
          Al Adhan&apos;s
        </a>{' '}
        public prayer-times API to get those timings back — they aren&apos;t
        stored by us, tied to your identity, or used for anything else.
        Location access is entirely optional; without it, prayer times and
        Qibla simply won&apos;t work.
      </>
    ),
  },
  {
    title: 'Camera',
    body: (
      <>
        The Qibla compass can use your camera for a live augmented-reality
        view. That feed is only ever shown on your screen — it&apos;s never
        recorded, stored, or sent anywhere.
      </>
    ),
  },
  {
    title: 'Notifications',
    body: (
      <>
        Prayer-time and athkar reminders are scheduled entirely on your
        device. There&apos;s no push-notification server involved, and no
        notification data is sent to us.
      </>
    ),
  },
  {
    title: 'Content & audio',
    body: (
      <>
        Quran text, translations, and recitation audio are fetched from{' '}
        <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer">
          AlQuran Cloud
        </a>{' '}
        and the{' '}
        <a href="https://islamic.network" target="_blank" rel="noopener noreferrer">
          Islamic Network
        </a>{' '}
        audio CDN. Athkar recitation audio comes from a small number of
        public Islamic-audio sources. These requests carry no personal or
        account information — just the content being requested.
      </>
    ),
  },
  {
    title: "What we don't do",
    body: (
      <>
        No accounts, no analytics or tracking SDKs, no advertising, and we
        never sell or share your data with anyone.
      </>
    ),
  },
  {
    title: 'Changes to this policy',
    body: (
      <>
        If this policy changes, we&apos;ll update the date at the top of this
        page.
      </>
    ),
  },
  {
    title: 'Contact',
    body: (
      <>
        Questions about this policy? Reach out at{' '}
        <a href="mailto:hello@downloadnur.com">hello@downloadnur.com</a>.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="faqPage">
      <div className="faqPageGlow faqGlowOne" aria-hidden="true" />
      <div className="faqPageGlow faqGlowTwo" aria-hidden="true" />

      {/* ========================================
          NAVIGATION
          ======================================== */}

      <nav className="nav faqNav">
        <div className="navInner shell">
          <Link href="/" className="wordmark" aria-label="Nur home">
            <img src="/nur.png" alt="Nur" />
          </Link>

          <Link href="/" className="backHome">
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </nav>

      {/* ========================================
          HERO
          ======================================== */}

      <section className="faqHero">
        <div className="eyebrow">
          <span className="dot" />
          PRIVACY POLICY
        </div>

        <h1>
          Your data stays <em>yours.</em>
        </h1>

        <p>Last updated {UPDATED}.</p>
      </section>

      {/* ========================================
          POLICY
          ======================================== */}

      <section className="faqList legalBody">
        <div className="glass legalCard" data-reveal>
          <p>
            Nur (&ldquo;the app&rdquo;, &ldquo;we&rdquo;) is built to work
            without an account, without ads, and without selling or sharing
            your data. This page explains, plainly, what the app stores and
            what a handful of third-party services it relies on can see.
          </p>
        </div>

        {SECTIONS.map((section, index) => (
          <div
            className="glass legalCard"
            key={section.title}
            data-reveal
            style={revealDelay((index + 1) * 55)}
          >
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}

      <footer className="shell footer faqFooter">
        <Link href="/" className="wordmark">
          <img src="/nur.png" alt="Nur" />
        </Link>

        <span>Made for moments of remembrance.</span>

        <div className="footerMeta">
          <a
            href="https://instagram.com/eyadmaherrr"
            target="_blank"
            rel="noopener noreferrer"
            className="footerCredit"
          >
            Made by @eyadmaherrr
          </a>
          <span>© 2026 Nur</span>
        </div>
      </footer>
    </main>
  );
}
