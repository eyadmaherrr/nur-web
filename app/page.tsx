'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Heart,
  Menu,
  Moon,
  Play,
  X,
} from 'lucide-react';

import { revealDelay } from '../lib/reveal';
import { SITE_URL, SITE_NAME } from '../lib/site';

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: SITE_NAME,
  description:
    'A calm prayer companion bringing prayer times, Quran, Athkar, Tasbeeh and Qibla into one experience.',
  url: SITE_URL,
  image: `${SITE_URL}/icon.png`,
  operatingSystem: 'iOS, Android',
  applicationCategory: 'LifestyleApplication',
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
};

// Renders live clocks/countdowns and reads localStorage/geolocation, none of
// which can match between server and client — skip SSR for it entirely
// rather than fight per-value hydration mismatches.
const NurExperience = dynamic(() => import('../components/NurExperience'), {
  ssr: false,
  loading: () => <div className="nurExperience" />,
});

const features = [
  {
    icon: Moon,
    title: 'Prayer, beautifully centered',
    text: 'Live prayer times, next-prayer countdowns and a calm daily rhythm.',
  },
  {
    icon: BookOpen,
    title: 'Read the Quran',
    text: 'A focused reader with Arabic scripture, translations, audio and progress.',
  },
  {
    icon: Heart,
    title: 'Remember Allah',
    text: 'Guided Athkar, daily remembrance and a simple Tasbeeh experience.',
  },
  {
    icon: Compass,
    title: 'Find the Qibla',
    text: 'A live compass experience designed to help you align with the Kaʿbah.',
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* ========================================
          NAVIGATION
          ======================================== */}

      <nav className="nav">
        <div className="navInner shell">
          <Link href="/" className="wordmark" aria-label="Nur home">
            <img src="/nur.png" alt="Nur" />
          </Link>

          <div className="links">
            <a href="#features">Features</a>
            <a href="#experience">Experience</a>
            <Link href="/faq">FAQ</Link>
          </div>

          <Link className="navCta" href="/download">
            Get Nur
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            className="menuButton"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobileMenu">
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#experience" onClick={closeMenu}>
              Experience
            </a>
            <Link href="/faq" onClick={closeMenu}>
              FAQ
            </Link>
          </div>
        )}
      </nav>

      {/* ========================================
          HERO
          ======================================== */}

      <section className="hero shell">
        <div className="heroGlow" />

        <div className="heroCopy">
          <div className="eyebrow">
            <span className="dot" />
            A calmer way to practice
          </div>

          <h1>
            Make space for{' '}
            <span className="nurHeroLogo">
              <img src="/nur.png" alt="Nur" />
            </span>
          </h1>

          <p className="lead">
            Prayer times, Quran, Athkar and Qibla — brought together in one
            quiet, beautifully designed companion.
          </p>

          <div className="actions">
            <Link className="primary" href="/download">
              Explore Nur
              <ArrowRight size={18} />
            </Link>

            <a className="secondary" href="#experience">
              <Play size={16} fill="currentColor" />
              See the experience
            </a>
          </div>

          <div className="micro">
            <span>✦</span>
            Designed for reflection, not distraction
          </div>
        </div>

        {/* ========================================
            INTERACTIVE NUR EXPERIENCE
            ======================================== */}

        <div className="phoneWrap" id="experience">
          <div className="phone">
            <NurExperience />
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES
          ======================================== */}

      <section className="section shell" id="features">
        <div className="sectionHead" data-reveal>
          <div>
            <div className="eyebrow">EVERYTHING YOU NEED</div>

            <h2>
              A little more <em>presence.</em>
            </h2>
          </div>

          <p>
            Every surface is designed to feel calm, intentional and easy to
            return to.
          </p>
        </div>

        <div className="featureGrid">
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
          DESIGN / PHILOSOPHY
          ======================================== */}

      <section className="section darkSection shell">
        <div className="split">
          <div data-reveal>
            <div className="eyebrow">MADE TO DISAPPEAR INTO YOUR DAY</div>

            <h2>
              Less noise.
              <br />
              <em>More remembrance.</em>
            </h2>

            <p>
              Nur uses soft glass surfaces, deep emerald tones and warm gold
              details to keep the interface out of the way — so what matters
              stays in focus.
            </p>

            <a className="textLink" href="#experience">
              Explore the experience
              <ArrowRight size={16} />
            </a>
          </div>

          <div
            className="stats glass"
            data-reveal
            style={revealDelay(120)}
          >
            <div>
              <strong>5</strong>
              <span>daily prayers</span>
            </div>

            <div>
              <strong>6,236</strong>
              <span>Quran verses</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>moments of dhikr</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          EXPERIENCE FEATURES
          ======================================== */}

      <section className="section experienceIntro shell">
        <div className="experienceIntroContent" data-reveal>
          <div className="eyebrow">TRY IT YOURSELF</div>

          <h2>
            More than a website.
            <br />
            <em>A glimpse of Nur.</em>
          </h2>

          <p>
            Explore the interactive experience above. Check prayer times, open
            the Quran, count your Athkar, use Tasbeeh or find the Qibla.
          </p>

          <a className="primary" href="#experience">
            Try the experience
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ========================================
          DOWNLOAD CTA
          ======================================== */}

      <section className="download shell" id="download" data-reveal>
        <div className="downloadGlow" />

        <div className="eyebrow">YOUR DAILY COMPANION</div>

        <h2>
          Carry a little{' '}
          <span className="nurInlineLogo">
            <img src="/nur.png" alt="Nur" />
          </span>{' '}
          with you.
        </h2>

        <p>
          Prayer, reflection and remembrance — whenever you need a quieter
          moment.
        </p>

        <Link className="primary" href="/download">
          Download
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}

      <footer className="shell footer">
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