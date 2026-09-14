'use client';

import { useState } from 'react';
import Link from 'next/link';
import { revealDelay } from '../../lib/reveal';
import {
  ArrowLeft,
  Apple,
  Bell,
  BookOpen,
  Check,
  Compass,
  Heart,
  Moon,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const platforms = [
  {
    id: 'ios',
    label: 'iOS',
    sub: 'iPhone · iPad',
    icon: Apple,
    note: 'iOS 15 or later',
  },
  {
    id: 'android',
    label: 'Android',
    sub: 'Phone · Tablet',
    icon: Smartphone,
    note: 'Android 9 or later',
  },
];

const features = [
  {
    icon: Moon,
    title: 'Prayer times that respect your day',
    text: 'Accurate timings by location, gentle next-prayer countdowns, no noise.',
  },
  {
    icon: BookOpen,
    title: 'A quiet Quran reader',
    text: 'Arabic scripture, translations, audio and reading progress — all offline.',
  },
  {
    icon: Heart,
    title: 'Athkar, always with you',
    text: 'Morning and evening remembrances, favourites, and a simple Tasbeeh.',
  },
  {
    icon: Compass,
    title: 'Qibla that just works',
    text: 'A live compass that tells you when you are aligned with the Kaʿbah.',
  },
];

export default function DownloadPage() {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          COMING SOON
        </div>

        <h1>
          Carry Nur <em>with you.</em>
        </h1>

        <p>
          The Nur app is being crafted with the same calm you see here.
          Join the waitlist to be notified the moment it lands.
        </p>

        {/* Platform picker */}
        <div className="platformPicker" role="tablist" aria-label="Platform">
          {platforms.map(({ id, label, sub, icon: Icon, note }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={platform === id}
              className={platform === id ? 'selected' : ''}
              onClick={() => setPlatform(id as 'ios' | 'android')}
            >
              <div className="platformIcon">
                <Icon size={22} />
              </div>

              <strong>{label}</strong>
              <small>{sub}</small>

              <span className="platformNote">{note}</span>
            </button>
          ))}
        </div>

        {/* Waitlist */}
        {!subscribed ? (
          <>
            <form className="waitlistForm" onSubmit={handleSubscribe}>
              <Bell size={18} aria-hidden="true" />

              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />

              <button type="submit" className="primary" aria-disabled={submitting}>
                {submitting ? 'Sending…' : 'Notify me'}
                <Sparkles size={16} />
              </button>
            </form>

            {error && (
              <p className="waitlistError" role="alert">
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="waitlistConfirmed" role="status">
            <Check size={18} />
            You&apos;re on the list — we&apos;ll email you when {platform === 'ios' ? 'iOS' : 'Android'} is ready.
          </div>
        )}

        <p className="micro" style={{ marginTop: 18 }}>
          <span>✦</span>
          No spam. Unsubscribe anytime.
        </p>
      </section>

      {/* ========================================
          WHAT YOU'LL GET
          ======================================== */}

      <section className="faqList">
        <div
          className="eyebrow"
          style={{ marginBottom: 22, display: 'block' }}
          data-reveal
        >
          WHAT YOU&apos;LL GET
        </div>

        <div className="downloadFeatures">
          {features.map(({ icon: Icon, title, text }, index) => (
            <article
              className="glass"
              key={title}
              data-reveal
              style={revealDelay(index * 60)}
            >
              <div className="icon">
                <Icon size={21} />
              </div>

              <div>
                <div className="num">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
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
          <Link href="/privacy">Privacy</Link>
          <span>© 2026 Nur</span>
        </div>
      </footer>
    </main>
  );
}