'use client';

import { useEffect, useState } from 'react';

export default function DemoHeader({ t }: { t: (key: string) => string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-[0_2px_12px_rgba(15,42,38,0.08)]' : 'border-b border-[var(--color-border-light)]'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-[70px] flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-white text-sm font-bold">
            L
          </span>
          <span
            className="text-2xl font-semibold tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            LUMA
          </span>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-9">
          {(['shop', 'collections', 'lookbook', 'about', 'contact'] as const).map((key) => (
            <a
              key={key}
              href="#"
              className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent-dark)] transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:start-0 after:w-0 after:h-[1.5px] after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
            >
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 text-[var(--color-text)]">
          <button className="hover:text-[var(--color-accent-dark)] transition-colors p-1" aria-label="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button className="hover:text-[var(--color-accent-dark)] transition-colors p-1 hidden sm:block" aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          <button className="relative hover:text-[var(--color-accent-dark)] transition-colors p-1" aria-label="Cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-[var(--color-accent)] rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
