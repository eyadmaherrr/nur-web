'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, Search } from 'lucide-react';

import faq from '../../data/faq.json';
import { revealDelay } from '../../lib/reveal';

type FaqItem = { question: string; answer: string };

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaq = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faq as FaqItem[];

    return (faq as FaqItem[]).filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query),
    );
  }, [search]);

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
          QUESTIONS &amp; ANSWERS
        </div>

        <h1>
          Simple by <em>design.</em>
        </h1>

        <p>
          Everything you need to know about Nur, its features and the
          experience we&apos;re building.
        </p>

        <div className="faqSearch">
          <Search size={19} aria-hidden="true" />

          <input
            type="text"
            placeholder="Search questions..."
            aria-label="Search frequently asked questions"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(null);
            }}
          />
        </div>
      </section>

      {/* ========================================
          FAQ LIST
          ======================================== */}

      <section className="faqList">
        {filteredFaq.length === 0 ? (
          <div className="noResults">
            <h3>No questions found.</h3>
            <p>Try searching for something else.</p>
          </div>
        ) : (
          filteredFaq.map((item, index) => {
            const isOpen = open === index;

            return (
              <article
                className={`faqCard ${isOpen ? 'faqCardOpen' : ''}`}
                key={item.question}
                data-reveal
                style={revealDelay(Math.min(index, 5) * 55)}
              >
                <button
                  type="button"
                  className="faqQuestion"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{item.question}</span>

                  <span className="faqIcon" aria-hidden="true">
                    <ChevronDown
                      size={19}
                      className={isOpen ? 'faqChevronOpen' : ''}
                    />
                  </span>
                </button>

                <div
                  className={`faqAnswer ${isOpen ? 'faqAnswerOpen' : ''}`}
                  id={`faq-answer-${index}`}
                  role="region"
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}

      <footer className="shell footer faqFooter">
        <div className="wordmark">
          <img src="/nur.png" alt="Nur" />
        </div>

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