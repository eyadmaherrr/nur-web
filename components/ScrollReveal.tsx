'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Marks [data-reveal] elements as visible once they scroll into view.
 * `.reveal-ready` only gets added on mount, so SSR/no-JS paints stay fully
 * visible — the fade-up treatment is a progressive enhancement, never a
 * cause of hidden content.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.isRevealed)'),
    );
    if (targets.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('isRevealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('isRevealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
