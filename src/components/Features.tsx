'use client';

import { useTranslations } from 'next-intl';
import RevealOnScroll from './RevealOnScroll';
import SectionHeader from './SectionHeader';

const icons = [
  // Monitor
  <svg key="0" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  // Shopping bag
  <svg key="1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  // Shield
  <svg key="2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  // Activity
  <svg key="3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  // Chat
  <svg key="4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  // Credit card
  <svg key="5" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
];

const featureKeys = ['subdomain', 'products', 'security', 'seo', 'reviews', 'payments'] as const;

export default function Features() {
  const t = useTranslations('features');

  return (
    <section id="features" className="section-py">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title1={t('title1')}
          title2={t('title2')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((key, i) => (
            <RevealOnScroll key={key} delay={i * 80}>
              <div className="group bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-[20px] p-9 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(5,46,43,0.10)] hover:border-[var(--color-accent-light)] h-full">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-accent)] flex items-center justify-center text-[var(--color-accent-dark)] mb-6 transition-all duration-400 group-hover:bg-[var(--color-accent-dark)] group-hover:text-white">
                  {icons[i]}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-light)]">
                  {t(`items.${key}.desc`)}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
